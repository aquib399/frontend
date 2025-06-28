import MeetingPageComponent from "@/components/meeting-page";

export default async function MeetingPage({
  params: PendingParams,
}: {
  params: Promise<{ meeting_id: string }>;
}) {
  const { slug } = (await PendingParams) as unknown as { slug: string };
  return <MeetingPageComponent slug={slug} />;
}
