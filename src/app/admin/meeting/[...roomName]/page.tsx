'use server';
import { use } from 'react';
import { MeetingView } from '@/components/admin/MeetingView';

export default function MeetingPage({
  params,
}: {
  params: Promise<{ roomName: string[] }>;
}) {
  const resolvedParams = use(params);
  const roomName = decodeURIComponent(resolvedParams.roomName.join('/'));

  return <MeetingView roomName={roomName} />;
}
