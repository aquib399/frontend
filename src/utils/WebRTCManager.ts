import { MediaConstraints, MediaState } from '@/types';
import { WEBRTC_CONFIG, MEDIA_CONSTRAINTS, ERROR_MESSAGES } from '@/constants';
import { createLogger, getErrorMessage } from './logger';

const logger = createLogger('WebRTCManager');

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private originalStream: MediaStream | null = null;
  private queuedIceCandidates: { candidate: RTCIceCandidateInit; fromUserId: string }[] = [];
  private remoteDescriptionSet = false;
  private tracksAdded = false;

  // Event handlers
  public onLocalStream?: (stream: MediaStream) => void;
  public onRemoteStream?: (stream: MediaStream) => void;
  public onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  public onIceCandidate?: (candidate: RTCIceCandidate) => void;
  public onRemoteCameraStateChange?: (isOn: boolean) => void;

  constructor() {
    this.initialize();
  }

  private initialize() {
    this.reset();
    
    this.peerConnection = new RTCPeerConnection({
      iceServers: [...WEBRTC_CONFIG.ICE_SERVERS],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.peerConnection) return;

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.onIceCandidate?.(event.candidate);
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      logger.log('ontrack event:', {
        kind: event.track.kind,
        id: event.track.id,
        streams: event.streams.map(s => s.id),
      });
      
      if (event.streams.length > 0) {
        const [stream] = event.streams;
        this.onRemoteStream?.(stream);
        
        // Listen for remote video track state changes
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          this.onRemoteCameraStateChange?.(videoTrack.enabled);
          videoTrack.onmute = () => this.onRemoteCameraStateChange?.(false);
          videoTrack.onunmute = () => this.onRemoteCameraStateChange?.(true);
          videoTrack.onended = () => this.onRemoteCameraStateChange?.(false);
        }
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      logger.log('Connection state:', state);
      if (state) {
        this.onConnectionStateChange?.(state);
      }
    };
  }

  private reset() {
    this.queuedIceCandidates = [];
    this.remoteDescriptionSet = false;
    this.tracksAdded = false;
  }

  public async getUserMedia(constraints: MediaConstraints = {
    video: MEDIA_CONSTRAINTS.DEFAULT_VIDEO,
    audio: MEDIA_CONSTRAINTS.DEFAULT_AUDIO,
  }): Promise<MediaStream> {
    try {
      logger.log('Requesting user media with constraints:', constraints);
      
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(ERROR_MESSAGES.MEDIA_DEVICES_NOT_SUPPORTED);
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      logger.log('Got media stream with tracks:', stream.getTracks().length);
      
      return stream;
    } catch (error) {
      logger.error('Error accessing media devices:', error);
      throw new Error(getErrorMessage(error));
    }
  }

  public async getDisplayMedia(): Promise<MediaStream> {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen sharing not supported');
      }
      
      return await navigator.mediaDevices.getDisplayMedia(MEDIA_CONSTRAINTS.SCREEN_SHARE);
    } catch (error) {
      logger.error('Error accessing screen share:', error);
      throw new Error(ERROR_MESSAGES.SCREEN_SHARE_FAILED);
    }
  }

  public async startCall(stream: MediaStream): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    if (this.tracksAdded) {
      logger.log('Tracks already added, skipping');
      return;
    }

    this.localStream = stream;
    this.originalStream = stream;

    // Add tracks to peer connection
    stream.getTracks().forEach((track) => {
      this.peerConnection!.addTrack(track, stream);
      logger.log(`Added ${track.kind} track to peer connection`);
    });
    
    this.tracksAdded = true;
    this.onLocalStream?.(stream);
  }

  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  public async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(offer);
    this.remoteDescriptionSet = true;
    
    // Process queued ICE candidates
    await this.processQueuedIceCandidates();
    
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    
    return answer;
  }

  public async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(answer);
    this.remoteDescriptionSet = true;
    
    // Process queued ICE candidates
    await this.processQueuedIceCandidates();
  }

  public async addIceCandidate(candidate: RTCIceCandidateInit, fromUserId: string): Promise<void> {
    if (!this.peerConnection) return;
    
    if (!this.remoteDescriptionSet) {
      logger.log('Remote description not set yet, queueing ICE candidate');
      this.queuedIceCandidates.push({ candidate, fromUserId });
      return;
    }
    
    try {
      await this.peerConnection.addIceCandidate(candidate);
      logger.log('ICE candidate added successfully');
    } catch (error) {
      logger.error('Error adding ICE candidate:', error);
    }
  }

  private async processQueuedIceCandidates(): Promise<void> {
    if (this.queuedIceCandidates.length === 0) return;
    
    logger.log(`Processing ${this.queuedIceCandidates.length} queued ICE candidates`);
    
    for (const { candidate } of this.queuedIceCandidates) {
      try {
        await this.peerConnection!.addIceCandidate(candidate);
      } catch (error) {
        logger.error('Error adding queued ICE candidate:', error);
      }
    }
    
    this.queuedIceCandidates = [];
  }

  public async replaceTrack(newTrack: MediaStreamTrack, kind: 'video' | 'audio'): Promise<void> {
    if (!this.peerConnection) return;

    const sender = this.peerConnection.getSenders().find(s => 
      s.track && s.track.kind === kind
    );
    
    if (sender) {
      await sender.replaceTrack(newTrack);
    }
  }

  public toggleTrack(kind: 'video' | 'audio'): boolean {
    if (!this.localStream) return false;

    const tracks = kind === 'video' 
      ? this.localStream.getVideoTracks() 
      : this.localStream.getAudioTracks();
    
    tracks.forEach(track => {
      track.enabled = !track.enabled;
      logger.log(`${kind} track enabled:`, track.enabled);
    });

    return tracks[0]?.enabled ?? false;
  }

  public getMediaState(): MediaState {
    if (!this.localStream) {
      return { audio: false, video: false, screenSharing: false };
    }

    const audioTrack = this.localStream.getAudioTracks()[0];
    const videoTrack = this.localStream.getVideoTracks()[0];

    return {
      audio: audioTrack?.enabled ?? false,
      video: videoTrack?.enabled ?? false,
      screenSharing: videoTrack?.label.includes('screen') ?? false,
    };
  }

  public destroy(): void {
    logger.log('Destroying WebRTC manager');
    
    // Stop local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
        logger.log(`Stopped ${track.kind} track`);
      });
    }
    
    // Stop original stream if different
    if (this.originalStream && this.originalStream !== this.localStream) {
      this.originalStream.getTracks().forEach(track => {
        track.stop();
      });
    }
    
    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    // Reset state
    this.localStream = null;
    this.originalStream = null;
    this.reset();
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public getOriginalStream(): MediaStream | null {
    return this.originalStream;
  }

  public isInitialized(): boolean {
    return this.peerConnection !== null;
  }

  public async addVideoTrack(deviceId?: string): Promise<boolean> {
    if (!this.localStream || !this.peerConnection) {
      logger.error('Cannot add video track: missing stream or peer connection');
      return false;
    }

    try {
      // Request video stream
      const videoConstraints = deviceId 
        ? { deviceId: { exact: deviceId } }
        : { width: { ideal: 1280 }, height: { ideal: 720 } };

      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });

      const videoTrack = tempStream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error('No video track in new stream');
      }

      // Add the video track to our local stream
      this.localStream.addTrack(videoTrack);

      // Add the track to the peer connection
      if (this.peerConnection.connectionState !== 'closed') {
        this.peerConnection.addTrack(videoTrack, this.localStream);
        logger.log('Added video track to peer connection');
      }

      // Update the original stream too
      if (this.originalStream && this.originalStream !== this.localStream) {
        this.originalStream.addTrack(videoTrack);
      }

      logger.log('Successfully added video track');
      return true;
    } catch (error) {
      logger.error('Error adding video track:', error);
      return false;
    }
  }

  public async addAudioTrack(deviceId?: string): Promise<boolean> {
    if (!this.localStream || !this.peerConnection) {
      logger.error('Cannot add audio track: missing stream or peer connection');
      return false;
    }

    try {
      // Request audio stream
      const audioConstraints = deviceId 
        ? { deviceId: { exact: deviceId } }
        : { echoCancellation: true, noiseSuppression: true };

      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: audioConstraints
      });

      const audioTrack = tempStream.getAudioTracks()[0];
      if (!audioTrack) {
        throw new Error('No audio track in new stream');
      }

      // Add the audio track to our local stream
      this.localStream.addTrack(audioTrack);

      // Add the track to the peer connection
      if (this.peerConnection.connectionState !== 'closed') {
        this.peerConnection.addTrack(audioTrack, this.localStream);
        logger.log('Added audio track to peer connection');
      }

      // Update the original stream too
      if (this.originalStream && this.originalStream !== this.localStream) {
        this.originalStream.addTrack(audioTrack);
      }

      logger.log('Successfully added audio track');
      return true;
    } catch (error) {
      logger.error('Error adding audio track:', error);
      return false;
    }
  }

  public hasVideoTracks(): boolean {
    return (this.localStream?.getVideoTracks().length ?? 0) > 0;
  }

  public hasAudioTracks(): boolean {
    return (this.localStream?.getAudioTracks().length ?? 0) > 0;
  }

  public refreshLocalStream(): void {
    if (this.localStream && this.onLocalStream) {
      this.onLocalStream(this.localStream);
    }
  }
}
