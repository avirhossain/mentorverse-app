'use client';
import { useParams } from 'next/navigation';
import { JitsiMeeting } from '@/components/common/JitsiMeeting';

export default function MeetingPage() {
  const params = useParams();
  const { roomName } = params;

  if (!roomName || typeof roomName !== 'string') {
    return <div>Loading...</div>;
  }

  // The JitsiMeeting component now handles all the logic.
  return <JitsiMeeting roomName={roomName} />;
}
