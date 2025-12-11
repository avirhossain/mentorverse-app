
'use client';
import { useParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useUser } from '@/firebase';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default function MeetingPage() {
  const params = useParams();
  const { roomName: cleanRoomId } = params; // e.g. mentor-meet-xxxx
  const containerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const { user } = useUser();

  useEffect(() => {
    // Ensure the component is mounted and the Jitsi API is available
    if (!containerRef.current || typeof window.JitsiMeetExternalAPI === 'undefined' || !cleanRoomId) {
      return;
    }
    
    // Prevent re-initialization
    if (jitsiApiRef.current) {
        return;
    }

    const fullRoomName =
      `vpaas-magic-cookie-514c5de29b504a348a2e6ce4646314c2/${cleanRoomId as string}`;

    const domain = '8x8.vc'; // required for JaaS
    const options = {
      roomName: fullRoomName,
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
      },
      jwt: "eyJraWQiOiJ2cGFhcy1tYWdpYy1jb29raWUtNTE0YzVkZTI5YjUwNGEzNDhhMmU2Y2U0NjQ2MzE0YzIvZmY1OGI0LVNBTVBMRV9BUFAiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJqaXRzaSIsImlzcyI6ImNoYXQiLCJpYXQiOjE3NjU0Mjc4MzMsImV4cCI6MTc2NTQzNTAzMywibmJmIjoxNzY1NDI3ODI4LCJzdWIiOiJ2cGFhcy1tYWdpYy1jb29raWUtNTE0YzVkZTI5YjUwNGEzNDhhMmU2Y2U0NjQ2MzE0YzIiLCJjb250ZXh0Ijp7ImZlYXR1cmVzIjp7ImxpdmVzdHJlYW1pbmciOmZhbHNlLCJmaWxlLXVwbG9hZCI6ZmFsc2UsIm91dGJvdW5kLWNhbGwiOmZhbHNlLCJzaXAtb3V0Ym91bmQtY2FsbCI6ZmFsc2UsInRyYW5zY3JpcHRpb24iOmZhbHNlLCJsaXN0LXZpc2l0b3JzIjpmYWxzZSwicmVjb3JkaW5nIjpmYWxzZSwiZmxpcCI6ZmFsc2V9LCJ1c2VyIjp7ImhpZGRlbi1mcm9tLXJlY29yZGVyIjpmYWxzZSwibW9kZXJhdG9yIjp0cnVlLCJuYW1lIjoiVGVzdCBVc2VyIiwiaWQiOiJnb29nbGUtb2F1dGgyfDEwOTYyNzQ1ODQwNzEyMzk0ODAxMiIsImF2YXRhciI6IiIsImVtYWlsIjoidGVzdC51c2VyQGNvbXBhbnkuY29tIn19LCJyb29tIjoiKiJ9.Sr9NrxVSSlYaNLP7vHMfQtNuHiBWRDM_zAx76jEKHpZ7NBeLQnXCCpx-qr_a3HiztBr0A27vyaE09mNqNDwZQft3zO8iT5lPSg2uDtS5f21_FliKWCRBdIxIOjnaUOEWkfGAO2gzIoUy7swktMRM4gnay9Sjh-6DRWszi318fRFv25K5zM-2w08bAYKd4rETp3mmUsst-2VILpsFgC-NH8r_xyesTllH-Kp13UgDgHHeKYBc2nef7XLCHGCSvoZmFdZaQTCpN3vxjCJwU51u_rIHM8JRh-bgYKCSP2zvZeP9O66JrAyXpRhV4SnQgSj9Me3U75rtz9VR_KEm4zfaHQ"
    };

    try {
       jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
    } catch(error) {
        console.error("Failed to initialize Jitsi Meet API:", error);
    }


    return () => {
        if(jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
            jitsiApiRef.current = null;
        }
    };
  }, [cleanRoomId, user]);

  return <div ref={containerRef} style={{ height: '100vh', width: '100%' }} />;
}
