import { use } from 'react';
import { MeetingView } from '@/components/admin/MeetingView';

// This page is a Server Component. Its only job is to resolve the `params` promise.
export default function MeetingPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  // Use React.use() to unwrap the Promise and get the resolved params.
  const resolvedParams = use(params);
  const { sessionId } = resolvedParams;

  // Pass the resolved sessionId as a simple string prop to the Client Component.
  return <MeetingView sessionId={sessionId} />;
}
