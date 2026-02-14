'use client';

import { useState } from 'react';
import VirtualClassroom from '@/components/collaboration/VirtualClassroom';
import { Video, Users, Calendar, MessageSquare, ShieldCheck } from 'lucide-react';

export default function StudentLivePage() {
    const [inClass, setInClass] = useState(false);

    return (
        <div className="live-class-page">
            <div className="page-header">
                <div className="flex justify-between items-center">
                    <div>
                        <h1>Live Collaboration Hub</h1>
                        <p>Join interactive sessions with teachers and AI mentors</p>
                    </div>
                    {!inClass && (
                        <button className="btn btn-primary" onClick={() => setInClass(true)}>
                            <Video size={18} style={{ marginRight: '8px' }} />
                            Join Public Study Room
                        </button>
                    )}
                </div>
            </div>

            {!inClass ? (
                <div className="grid grid-3 gap-lg">
                    <div className="card text-center" style={{ padding: '40px 20px' }}>
                        <div className="icon-circle bg-primary-muted mx-auto mb-md">
                            <Users size={32} className="text-primary" />
                        </div>
                        <h3>General Study Hall</h3>
                        <p className="text-muted mb-lg">A public space for students to collaborate and study together.</p>
                        <button className="btn btn-secondary w-100" onClick={() => setInClass(true)}>Join Now</button>
                    </div>

                    <div className="card text-center" style={{ padding: '40px 20px' }}>
                        <div className="icon-circle bg-success-muted mx-auto mb-md">
                            <Calendar size={32} className="text-success" />
                        </div>
                        <h3>Scheduled Classes</h3>
                        <p className="text-muted mb-lg">View and join your upcoming scheduled virtual classrooms.</p>
                        <button className="btn btn-ghost w-100">View Schedule</button>
                    </div>

                    <div className="card text-center" style={{ padding: '40px 20px' }}>
                        <div className="icon-circle bg-warning-muted mx-auto mb-md">
                            <ShieldCheck size={32} className="text-warning" />
                        </div>
                        <h3>Private Mentoring</h3>
                        <p className="text-muted mb-lg">1-on-1 sessions with AI-assisted human tutors.</p>
                        <button className="btn btn-ghost w-100">Request Session</button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-md">
                    <div className="flex justify-between items-center bg-glass p-md rounded-lg">
                        <div className="flex items-center gap-md">
                            <div className="glow-dot" />
                            <span style={{ fontWeight: 600 }}>Live Session: General Study Hall</span>
                        </div>
                        <button className="btn btn-danger btn-sm" onClick={() => setInClass(false)}>Leave Class</button>
                    </div>

                    <VirtualClassroom
                        roomName="GeneralStudyHall"
                        userName="Student Demo"
                        onLeave={() => setInClass(false)}
                    />

                    <div className="grid grid-2 gap-md mt-md">
                        <div className="card p-md">
                            <h4 className="flex items-center gap-sm mb-sm"><MessageSquare size={16} /> Shared Notes</h4>
                            <textarea className="input-premium" rows={4} placeholder="Take notes here... they persist for this session." />
                        </div>
                        <div className="card p-md">
                            <h4 className="flex items-center gap-sm mb-sm"><Users size={16} /> Active Peers</h4>
                            <div className="flex -space-x-2">
                                <div className="avatar avatar-sm ring-glass">A</div>
                                <div className="avatar avatar-sm ring-glass">B</div>
                                <div className="avatar avatar-sm ring-glass">C</div>
                                <div className="avatar avatar-sm bg-primary ring-glass text-xs">+12</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
