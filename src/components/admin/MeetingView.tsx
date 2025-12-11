'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Skeleton } from '../ui/skeleton';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface MeetingViewProps {
  roomName: string;
  displayName: string;
  jwt: string;
}

export const MeetingView: React.FC<MeetingViewProps> = ({ roomName, displayName, jwt }) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [jitsiApi, setJitsiApi] = useState<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://8x8.vc/vpaas-magic-cookie-514c5de29b504a348a2e6ce4646314c2/external_api.js';
    script.async = true;
    script.onload = () => {
      if (window.JitsiMeetExternalAPI) {
        setLoading(false);
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!loading && jitsiContainerRef.current && !jitsiApi) {
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
            displayName: displayName
          }
        });
        setJitsiApi(api);

      } catch (error) {
        console.error('Failed to initialize Jitsi Meet API:', error);
      }
    }

    return () => {
      jitsiApi?.dispose();
    };
  }, [loading, roomName, jwt, displayName, jitsiApi]);

  if (loading) {
    return <Skeleton className="h-full w-full" />;
  }

  return (
    <div
      id="jaas-container"
      ref={jitsiContainerRef}
      style={{ height: '100%', width: '100%' }}
    />
  );
};

    