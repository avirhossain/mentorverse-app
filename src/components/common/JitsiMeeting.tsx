
'use client';
import { useEffect, useRef } from 'react';
import { useUser } from '@/firebase';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiMeetingProps {
  roomName: string;
}

export function JitsiMeeting({ roomName }: JitsiMeetingProps) {
  const { user, isUserLoading } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  useEffect(() => {
    if (isUserLoading || jitsiApiRef.current || !containerRef.current) {
      return;
    }

    if (typeof window.JitsiMeetExternalAPI === 'undefined') {
        console.error("Jitsi API script not loaded");
        return;
    }

    const domain = 'meet.jit.si';
    const options = {
      roomName,
      parentNode: containerRef.current,
      width: '100%',
      height: '100%',
      interfaceConfigOverwrite: {
        TILE_VIEW_MAX_COLUMNS: 2,
        SHOW_CHROME_EXTENSION_BANNER: false,
      },
      configOverwrite: {
        prejoinPageEnabled: false,
      },
      userInfo: {
        displayName: user?.displayName || 'Guest',
        email: user?.email,
      },
    };

    try {
        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
    } catch (error) {
        console.error("Failed to initialize Jitsi Meet API:", error);
    }
    
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [roomName, isUserLoading, user]);

  return <div ref={containerRef} style={{ height: '100vh', width: '100%' }} />;
}
