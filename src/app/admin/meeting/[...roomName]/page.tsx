import { use } from 'react';
import { MeetingView } from '@/components/admin/MeetingView';

// This is the old file, which will be renamed and moved
// by the following change blocks.

export default function MeetingPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  return <MeetingView sessionId={sessionId} />;
}

    