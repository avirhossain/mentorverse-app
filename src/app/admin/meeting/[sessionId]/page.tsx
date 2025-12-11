
import { use } from 'react';
import { JitsiMeeting } from '@/components/common/JitsiMeeting';

// This page is a Server Component. Its only job is to resolve the `params` promise.
export default function MeetingPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  // Use React.use() to unwrap the Promise and get the resolved params.
  const resolvedParams = use(params);
  const { sessionId } = resolvedParams;

  // The room name is derived from the session ID to keep the URL clean
  const roomName = `mentees-meet-${sessionId}`;

  // Pass the resolved roomName as a simple string prop to the Client Component.
  return <JitsiMeeting roomName={roomName} />;
}
