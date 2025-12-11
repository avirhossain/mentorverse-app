'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { useUser } from '@/firebase';
import { createJitsiJwt } from '@/lib/jitsi-jwt';

// IMPORTANT: These should be in environment variables in a real app
const JITSI_APP_ID = 'vpaas-magic-cookie-514c5de29b504a348a2e6ce4646314c2';
const JITSI_SECRET =
  '9852233b8a1c97a44d18388414890632288339c1598c1b48b6118d090a2a4b53';
const JITSI_KID = JITSI_APP_ID + '/ff58b4-SAMPLE_APP';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface MeetingViewProps {
  sessionId: string;
}

export const MeetingView: React.FC<MeetingViewProps> = ({ sessionId }) => {
  const { user, isUserLoading } = useUser();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const [jwt, setJwt] = useState<string | null>(null);

  const roomName = `vpaas-magic-cookie-514c5de29b504a348a2e6ce4646314c2/mentorverse-instant-${sessionId}`;


  // Generate JWT once user is available
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

  // Initialize Jitsi when the container, JWT, and user are ready
  useEffect(() => {
    if (!jitsiContainerRef.current || jitsiApi || !jwt || !user?.displayName) {
      return;
    }

    const script = document.createElement('script');
    script.src =
      'https://8x8.vc/vpaas-magic-cookie-514c5de29b504a348a2e6ce4646314c2/external_api.js';
    script.async = true;
    script.onload = () => {
      if (window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
        try {
          const api = new window.JitsiMeetExternalAPI('8x8.vc', {
            roomName,
            parentNode: jitsiContainerRef.current,
            jwt: jwt,
            configOverwrite: {
              prejoinPageEnabled: false,
              startWithAudioMuted: true,
              startWithVideoMuted: true,
            },
            interfaceConfigOverwrite: {
              SHOW_CHROME_EXTENSION_BANNER: false,
            },
            userInfo: {
              displayName: user.displayName || 'Admin',
            },
          });
          setJitsiApi(api);
        } catch (error) {
          console.error('Failed to initialize Jitsi Meet API:', error);
        }
      }
    };
    document.body.appendChild(script);

    return () => {
      jitsiApi?.dispose();
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [jitsiApi, jwt, roomName, user]);

  if (isUserLoading || !jwt) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <div
      id="jaas-container"
      ref={jitsiContainerRef}
      style={{ height: 'calc(100vh - 4rem)', width: '100%' }}
      className="bg-background"
    />
  );
};

    