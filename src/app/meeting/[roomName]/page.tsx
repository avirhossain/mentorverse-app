
import { use } from 'react';
import { JitsiMeeting } from '@/components/common/JitsiMeeting';

// This page is a Server Component. Its only job is to resolve the `params` promise.
export default function MeetingPage({
  params,
}: {
  params: Promise<{ roomName: string }>;
}) {
  // Use React.use() to unwrap the Promise and get the resolved params.
  const resolvedParams = use(params);
  const { roomName } = resolvedParams;

  // The room name is derived from the session ID to keep the URL clean
  // Pass the resolved roomName as a simple string prop to the Client Component.
  return <JitsiMeeting roomName={decodeURIComponent(roomName)} />;
}
