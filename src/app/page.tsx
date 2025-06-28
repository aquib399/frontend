import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Mic,
  Zap,
  Play,
  Star,
  Menu,
  Users,
  Video,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
              <Video className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-2xl font-bold text-transparent">
              MeetCast
            </span>
          </div>

          <nav className="hidden items-center space-x-8 md:flex">
            <Link
              href="#features"
              className="font-medium text-gray-300 transition-all duration-300 hover:text-cyan-400"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="font-medium text-gray-300 transition-all duration-300 hover:text-cyan-400"
            >
              Pricing
            </Link>
            <Link
              href="#about"
              className="font-medium text-gray-300 transition-all duration-300 hover:text-cyan-400"
            >
              About
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-gray-600 bg-transparent text-gray-300 transition-all duration-300 hover:border-cyan-400 hover:bg-gray-800"
            >
              <Link href={"/login"} passHref>
                Log In
              </Link>
            </Button>

            <Button
              size="lg"
              className="rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 px-8 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500"
            >
              <Link href={"/dashboard"} passHref>
                Dashboard
              </Link>
            </Button>
          </nav>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-gray-300 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-40">
        {/* Background Effects */}
        <div className="absolute inset-0 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl"></div>
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl"></div>

        <div className="relative z-10 container mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <Badge className="mb-8 rounded-full border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-6 py-2 text-sm font-medium text-cyan-300 backdrop-blur-sm hover:from-cyan-500/30 hover:to-blue-500/30">
              <Zap className="mr-2 h-4 w-4" />
              Next-Gen Virtual Meetings
            </Badge>

            <h1 className="mb-8 text-5xl leading-tight font-bold text-white lg:text-7xl">
              Virtual Meetings with
              <span className="mt-2 block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Podcast Quality
              </span>
            </h1>

            <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-300 lg:text-2xl">
              Experience crystal-clear virtual meetings with live interaction
              capabilities and broadcast-quality audio. Perfect for teams,
              podcasters, and content creators.
            </p>

            <div className="mb-16 flex flex-col items-center justify-center gap-6 sm:flex-row">
              <Button
                size="lg"
                className="transform rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 px-12 py-4 text-lg font-semibold shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500"
              >
                Start Free Trial
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-gray-600 bg-transparent px-12 py-4 text-lg text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400 hover:bg-gray-800/50"
              >
                <Play className="mr-3 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400">
              <div className="flex items-center rounded-full bg-gray-800/30 px-4 py-2 backdrop-blur-sm">
                <CheckCircle className="mr-3 h-5 w-5 text-cyan-400" />
                No downloads required
              </div>
              <div className="flex items-center rounded-full bg-gray-800/30 px-4 py-2 backdrop-blur-sm">
                <CheckCircle className="mr-3 h-5 w-5 text-cyan-400" />
                HD video & audio
              </div>
              <div className="flex items-center rounded-full bg-gray-800/30 px-4 py-2 backdrop-blur-sm">
                <CheckCircle className="mr-3 h-5 w-5 text-cyan-400" />
                Live interaction
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="bg-gradient-to-b from-gray-900/50 to-black/50 py-24 backdrop-blur-sm"
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mb-20 text-center">
            <h2 className="mb-6 text-4xl font-bold text-white lg:text-5xl">
              Everything you need for
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                professional meetings
              </span>
            </h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-300">
              Powerful features designed to elevate your virtual meeting
              experience with cutting-edge technology
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group rounded-3xl border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-cyan-500/10">
              <CardContent className="p-10">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/25 transition-all duration-300 group-hover:shadow-cyan-500/40">
                  <Mic className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-white">
                  Podcast Quality Audio
                </h3>
                <p className="text-lg leading-relaxed text-gray-300">
                  Crystal-clear, broadcast-quality audio that makes every word
                  count. Perfect for recording and live streaming with
                  professional-grade clarity.
                </p>
              </CardContent>
            </Card>

            <Card className="group rounded-3xl border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-purple-500/10">
              <CardContent className="p-10">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 transition-all duration-300 group-hover:shadow-purple-500/40">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-white">
                  Live Interaction
                </h3>
                <p className="text-lg leading-relaxed text-gray-300">
                  Real-time chat, reactions, and audience participation tools
                  that keep everyone engaged throughout the session with
                  seamless connectivity.
                </p>
              </CardContent>
            </Card>

            <Card className="group rounded-3xl border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-green-500/10">
              <CardContent className="p-10">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/25 transition-all duration-300 group-hover:shadow-green-500/40">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-white">
                  4K Video Streaming
                </h3>
                <p className="text-lg leading-relaxed text-gray-300">
                  Ultra-high definition video streaming with adaptive quality
                  that adjusts to your connection automatically for the best
                  experience.
                </p>
              </CardContent>
            </Card>

            <Card className="group rounded-3xl border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-orange-500/10">
              <CardContent className="p-10">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/25 transition-all duration-300 group-hover:shadow-orange-500/40">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-white">
                  Enterprise Security
                </h3>
                <p className="text-lg leading-relaxed text-gray-300">
                  End-to-end encryption and enterprise-grade security features
                  to keep your meetings private and secure with military-grade
                  protection.
                </p>
              </CardContent>
            </Card>

            <Card className="group rounded-3xl border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-yellow-500/10">
              <CardContent className="p-10">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/25 transition-all duration-300 group-hover:shadow-yellow-500/40">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-white">
                  Instant Setup
                </h3>
                <p className="text-lg leading-relaxed text-gray-300">
                  No downloads or installations required. Start your meeting
                  instantly with just a web browser and lightning-fast
                  connection.
                </p>
              </CardContent>
            </Card>

            <Card className="group rounded-3xl border-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-indigo-500/10">
              <CardContent className="p-10">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 transition-all duration-300 group-hover:shadow-indigo-500/40">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-white">
                  Premium Experience
                </h3>
                <p className="text-lg leading-relaxed text-gray-300">
                  Professional-grade features with an intuitive interface that
                  makes hosting meetings effortless and enjoyable for everyone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24 backdrop-blur-sm">
        <div className="relative z-10 container mx-auto px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center text-white">
            <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
              Ready to transform your
              <span className="block bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                virtual meetings?
              </span>
            </h2>
            <p className="mb-12 text-xl leading-relaxed text-gray-300">
              Join thousands of professionals who trust MeetCast for their most
              important conversations and content creation.
            </p>

            <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center justify-center gap-6 sm:flex-row">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 rounded-full border-gray-600 bg-gray-800/50 px-6 py-4 text-lg text-white backdrop-blur-sm transition-all duration-300 placeholder:text-gray-400 focus:border-cyan-400"
              />
              <Button
                size="lg"
                className="transform rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-4 text-lg font-semibold shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-105 hover:from-cyan-400 hover:to-blue-500"
              >
                Get Started Free
              </Button>
            </div>

            <p className="inline-block rounded-full bg-gray-800/30 px-6 py-3 text-gray-400 backdrop-blur-sm">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 bg-black/80 py-16 text-white backdrop-blur-sm">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-2xl font-bold text-transparent">
                  MeetCast
                </span>
              </div>
              <p className="text-lg leading-relaxed text-gray-400">
                Professional virtual meetings with podcast-quality audio and
                live interaction capabilities for the modern world.
              </p>
            </div>

            <div>
              <h4 className="mb-6 text-xl font-bold text-white">Product</h4>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <Link
                    href="#"
                    className="text-lg transition-colors duration-300 hover:text-cyan-400"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-lg transition-colors duration-300 hover:text-cyan-400"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-lg transition-colors duration-300 hover:text-cyan-400"
                  >
                    API
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-lg transition-colors duration-300 hover:text-cyan-400"
                  >
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-xl font-bold text-white">Company</h4>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <Link
                    href="#"
                    className="text-lg transition-colors duration-300 hover:text-cyan-400"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-lg transition-colors duration-300 hover:text-cyan-400"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-lg transition-colors duration-300 hover:text-cyan-400"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-lg transition-colors duration-300 hover:text-cyan-400"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-xl font-bold text-white">Support</h4>
              <ul className="space-y-4 text-gray-400">
                <li>
                  <Link
                    href="#"
                    className="text-lg transition-colors duration-300 hover:text-cyan-400"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-lg transition-colors duration-300 hover:text-cyan-400"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-lg transition-colors duration-300 hover:text-cyan-400"
                  >
                    Status
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-lg transition-colors duration-300 hover:text-cyan-400"
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-800 pt-8 text-center">
            <p className="text-lg text-gray-400">
              &copy; {new Date().getFullYear()} MeetCast. All rights reserved.
              Built with passion for the future of communication.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
