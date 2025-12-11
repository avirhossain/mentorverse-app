'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { MeetingView } from '@/components/admin/MeetingView';
import { createJitsiJwt } from '@/lib/jitsi-jwt';
import { Skeleton } from '@/components/ui/skeleton';

// IMPORTANT: These should be in environment variables in a real app
const JITSI_APP_ID = 'vpaas-magic-cookie-514c5de29b504a348a2e6ce4646314c2';
const JITSI_SECRET = '9852233b8a1c97a44d18388414890632288339c1598c1b48b6118d090a2a4b53';
const JITSI_KID = JITSI_APP_ID + '/ff58b4-SAMPLE_APP';


export default function MeetingPage({ params }: { params: { roomName: string[] } }) {
  const { user } = useUser();
  const [jwt, setJwt] = useState<string | null>(null);

  // The room name can contain slashes, so it's passed as an array of segments.
  const roomName = decodeURIComponent(params.roomName.join('/'));

  useEffect(() => {
    if (user) {
      const payload = {
        context: {
          user: {
            id: user.uid,
            name: user.displayName || 'Admin',
            email: user.email || '',
            moderator: true, // Admins are always moderators
          },
        },
        room: '*', // Allow this JWT to be used for any room
      };
      
      const token = createJitsiJwt(payload, JITSI_SECRET, { kid: JITSI_KID });
      setJwt(token);
    }
  }, [user]);

  if (!jwt) {
    return <Skeleton className="h-screen w-screen" />;
  }

  return (
    <div style={{ height: 'calc(100vh - 4rem)'}}>
      <MeetingView 
        roomName={roomName} 
        displayName={user?.displayName || 'Admin'}
        jwt={jwt}
      />
    </div>
  );
}
