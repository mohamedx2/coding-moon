'use client';

import { useEffect, useRef } from 'react';

interface VirtualClassroomProps {
    roomName: string;
    userName: string;
    onLeave?: () => void;
}

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

export default function VirtualClassroom({ roomName, userName, onLeave }: VirtualClassroomProps) {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadJitsiScript = () => {
            return new Promise((resolve) => {
                if (window.JitsiMeetExternalAPI) {
                    resolve(true);
                    return;
                }
                const script = document.createElement('script');
                script.src = 'https://meet.jit.si/external_api.js';
                script.async = true;
                script.onload = () => resolve(true);
                document.body.appendChild(script);
            });
        };

        const initMeeting = async () => {
            await loadJitsiScript();

            const domain = 'meet.jit.si';
            const options = {
                roomName: `SmartEduAI-${roomName}`,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: userName
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                        'security'
                    ],
                },
                configOverwrite: {
                    disableDeepLinking: true,
                }
            };

            const api = new window.JitsiMeetExternalAPI(domain, options);

            api.addEventListener('videoConferenceLeft', () => {
                if (onLeave) onLeave();
            });

            return () => api.dispose();
        };

        initMeeting();
    }, [roomName, userName, onLeave]);

    return (
        <div className="virtual-classroom-container card-glass" style={{ height: '700px', width: '100%', overflow: 'hidden', padding: 0 }}>
            <div ref={jitsiContainerRef} style={{ height: '100%', width: '100%' }} />
        </div>
    );
}
