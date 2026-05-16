'use client';

import { useState, useEffect } from 'react';
import { Activity, Users, Building2, Bot, CircleDollarSign, ShieldCheck, Zap, Wand2, BookOpen, FileText, PlusCircle, CheckCircle2, Eye, RefreshCw, Send, Archive } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAuthHeader } from '@/lib/auth';
import { apiClient, type Course, type QuizResponse } from '@/lib/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [recentQuizzes, setRecentQuizzes] = useState<QuizResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [quizForm, setQuizForm] = useState({
        course_id: '',
        topic: '',
        num_questions: 5,
        difficulty: 'medium' as 'easy' | 'medium' | 'hard',
        question_type: 'mcq' as 'mcq' | 'short' | 'mixed',
        document_id: ''
    });

    const API_BASE = 'http://localhost:8000/api';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, coursesRes, quizzesRes] = await Promise.all([
                    fetch(`${API_BASE}/admin/stats`, { headers: getAuthHeader() }),
                    apiClient.getCourses(),
                    apiClient.getQuizzes()
                ]);

                // Handle 403 Forbidden specifically
                if (statsRes.status === 403) {
                    toast.error('Access denied. Please login as admin.');
                    // Redirect to login after a short delay
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                    return;
                }

                if (statsRes.ok) setStats(await statsRes.json());
                if (coursesRes.data) setCourses(coursesRes.data);
                if (quizzesRes.data) setRecentQuizzes(quizzesRes.data.slice(0, 5));
            } catch (error) {
                console.error('Failed to fetch admin data', error);
                toast.error('Connection error while fetching platform data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleGenerateQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quizForm.course_id || !quizForm.topic) {
            toast.error('Please select a course and enter a topic');
            return;
        }

        setIsGenerating(true);
        try {
            const response = await apiClient.generateQuiz({
                course_id: quizForm.course_id,
                topic: quizForm.topic,
                num_questions: quizForm.num_questions,
                difficulty: quizForm.difficulty,
                question_type: quizForm.question_type,
                document_id: quizForm.document_id || undefined
            });

            if (response.data) {
                toast.success(`Quiz "${response.data.title}" generated successfully!`);
                setQuizForm({ ...quizForm, topic: '' });
                // Refresh recent quizzes
                const quizzesRes = await apiClient.getQuizzes();
                if (quizzesRes.data) {
                    setRecentQuizzes(quizzesRes.data.slice(0, 5));
                }
            } else {
                toast.error(response.error || 'Failed to generate quiz');
            }
        } catch (error) {
            toast.error('AI Worker connection failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const refreshData = async () => {
        setLoading(true);
        try {
            const [statsRes, coursesRes, quizzesRes] = await Promise.all([
                fetch(`${API_BASE}/admin/stats`, { headers: getAuthHeader() }),
                apiClient.getCourses(),
                apiClient.getQuizzes()
            ]);

            // Handle 403 Forbidden specifically
            if (statsRes.status === 403) {
                toast.error('Access denied. Please login as admin.');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
                return;
            }

            if (statsRes.ok) setStats(await statsRes.json());
            if (coursesRes.data) setCourses(coursesRes.data);
            if (quizzesRes.data) setRecentQuizzes(quizzesRes.data.slice(0, 5));
            toast.success('Dashboard data refreshed');
        } catch (error) {
            toast.error('Failed to refresh data');
        } finally {
            setLoading(false);
        }
    };

    const publishQuiz = async (quizId: string) => {
        try {
            const response = await apiClient.updateQuizStatus(quizId, 'published');
            if (response.data) {
                toast.success('Quiz published successfully!');
                // Refresh recent quizzes
                const quizzesRes = await apiClient.getQuizzes();
                if (quizzesRes.data) {
                    setRecentQuizzes(quizzesRes.data.slice(0, 5));
                }
            } else {
                toast.error(response.error || 'Failed to publish quiz');
            }
        } catch (error) {
            toast.error('Failed to publish quiz');
        }
    };

    const unpublishQuiz = async (quizId: string) => {
        try {
            const response = await apiClient.updateQuizStatus(quizId, 'draft');
            if (response.data) {
                toast.success('Quiz unpublished successfully!');
                // Refresh recent quizzes
                const quizzesRes = await apiClient.getQuizzes();
                if (quizzesRes.data) {
                    setRecentQuizzes(quizzesRes.data.slice(0, 5));
                }
            } else {
                toast.error(response.error || 'Failed to unpublish quiz');
            }
        } catch (error) {
            toast.error('Failed to unpublish quiz');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-md">
                    <div className="spinner spinner-lg text-primary"></div>
                    <p className="text-muted animate-pulse font-medium">Synchronizing artificial intelligence nexus...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Users', value: stats?.total_users?.toLocaleString() || '0', change: 'Global base', icon: <Users size={20} className="text-primary" /> },
        { label: 'Active Tenants', value: stats?.active_tenants || '0', change: 'Organizations', icon: <Building2 size={20} className="text-accent" /> },
        { label: 'AI Operations', value: stats?.ai_requests_today || '0', change: 'Gemini/GPT calls', icon: <Bot size={20} className="text-success" /> },
        { label: 'Monthly Revenue', value: stats?.revenue_estimate || '$0', change: 'Estimated MRR', icon: <CircleDollarSign size={20} className="text-warning" /> },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-lg">
            <div className="page-header">
                <div className="flex items-center gap-md mb-sm">
                    <div className="p-sm bg-primary/10 rounded-lg shadow-glow">
                        <ShieldCheck className="text-primary" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gradient">System Controller</h1>
                        <p className="text-muted">Real-time platform intelligence and nexus control</p>
                    </div>
                </div>
            </div>

            {/* Platform Stats Grid */}
            <div className="grid grid-4 gap-md">
                {statCards.map((s, idx) => (
                    <div key={s.label} className="stat-card group hover:translate-y-[-4px] transition-all duration-300 relative overflow-hidden" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className="flex justify-between items-start mb-md">
                            <div className="p-xs bg-bg-secondary rounded-md group-hover:bg-primary/5 transition-colors">
                                {s.icon}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{s.change}</span>
                        </div>
                        <div className="flex flex-col relative z-10">
                            <span className="stat-value text-2xl mb-xs font-black">{s.value}</span>
                            <span className="stat-label text-xs font-semibold text-muted">{s.label}</span>
                        </div>
                        <div className="absolute top-0 right-0 p-lg opacity-[0.03] grayscale pointer-events-none group-hover:scale-125 transition-transform duration-500">
                            {s.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                {/* AI Quiz Innovation Lab */}
                <div className="lg:col-span-2 card backdrop-blur-xl bg-white/5 border-white/10 p-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                        <Wand2 size={120} />
                    </div>

                    <div className="flex items-center justify-between mb-lg border-b border-white/5 pb-md">
                        <h2 className="text-lg font-bold flex items-center gap-sm">
                            <Bot size={20} className="text-primary" />
                            AI Innovation Hub
                        </h2>
                        <div className="flex items-center gap-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            <span className="text-[10px] font-bold text-primary uppercase">Gemini 2.0 Active</span>
                        </div>
                    </div>

                    <form onSubmit={handleGenerateQuiz} className="space-y-md relative z-10">
                        <div className="grid grid-2 gap-md">
                            <div className="input-group">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Target Course</label>
                                <select
                                    className="input bg-white/5 border-white/10 focus:border-primary/50"
                                    value={quizForm.course_id}
                                    onChange={(e) => setQuizForm({ ...quizForm, course_id: e.target.value, document_id: '' })}
                                >
                                    <option value="" className="bg-bg-primary text-white">Select a course...</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id} className="bg-bg-primary text-white">{c.code} - {c.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Question Type</label>
                                <select
                                    className="input bg-white/5 border-white/10 focus:border-primary/50"
                                    value={quizForm.question_type}
                                    onChange={(e) => setQuizForm({ ...quizForm, question_type: e.target.value as 'mcq' | 'short' | 'mixed' })}
                                >
                                    <option value="mcq" className="bg-bg-primary text-white">📝 Multiple Choice</option>
                                    <option value="short" className="bg-bg-primary text-white">📄 Short Answer</option>
                                    <option value="mixed" className="bg-bg-primary text-white">🔄 Mixed Types</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-2 gap-md">
                            <div className="input-group">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Difficulty Level</label>
                                <select
                                    className="input bg-white/5 border-white/10 focus:border-primary/50"
                                    value={quizForm.difficulty}
                                    onChange={(e) => setQuizForm({ ...quizForm, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                                >
                                    <option value="easy" className="bg-bg-primary text-white">🟢 Easy (Conceptual)</option>
                                    <option value="medium" className="bg-bg-primary text-white">🟡 Medium (Application)</option>
                                    <option value="hard" className="bg-bg-primary text-white">🔴 Hard (Mastery)</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Questions Count</label>
                                <select
                                    className="input bg-white/5 border-white/10 focus:border-primary/50"
                                    value={quizForm.num_questions}
                                    onChange={(e) => setQuizForm({ ...quizForm, num_questions: parseInt(e.target.value) })}
                                >
                                    <option value={3} className="bg-bg-primary text-white">3 Questions</option>
                                    <option value={5} className="bg-bg-primary text-white">5 Questions</option>
                                    <option value={10} className="bg-bg-primary text-white">10 Questions</option>
                                    <option value={15} className="bg-bg-primary text-white">15 Questions</option>
                                    <option value={20} className="bg-bg-primary text-white">20 Questions</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Quiz Topic or AI Prompt</label>
                            <div className="relative">
                                <input
                                    className="input w-full bg-white/5 border-white/10 focus:border-primary/50 pr-10"
                                    placeholder="e.g. Advanced Quantum Mechanics, Python Concurrency, etc."
                                    value={quizForm.topic}
                                    onChange={(e) => setQuizForm({ ...quizForm, topic: e.target.value })}
                                />
                                <Wand2 className="absolute right-3 top-2.5 text-muted opacity-50" size={16} />
                            </div>
                        </div>

                        {quizForm.course_id && (
                            <div className="input-group animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Context Document (Optional RAG)</label>
                                <select
                                    className="input bg-white/5 border-white/10 focus:border-primary/50"
                                    value={quizForm.document_id}
                                    onChange={(e) => setQuizForm({ ...quizForm, document_id: e.target.value })}
                                >
                                    <option value="" className="bg-bg-primary text-white font-medium italic">Full Course RAG Context (Auto)</option>
                                    {courses.find(c => c.id === quizForm.course_id)?.documents?.map((d: any) => (
                                        <option key={d.id} value={d.id} className="bg-bg-primary text-white">📄 {d.filename}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-md">
                            <button
                                type="button"
                                onClick={refreshData}
                                className="btn btn-secondary btn-sm flex items-center gap-sm"
                            >
                                <RefreshCw size={14} />
                                Refresh Data
                            </button>

                            <button
                                type="submit"
                                disabled={isGenerating}
                                className={`btn btn-primary h-12 px-xl font-bold rounded-xl shadow-glow transition-all ${isGenerating ? 'opacity-50 cursor-wait animate-pulse' : 'hover:scale-[1.05]'}`}
                            >
                                {isGenerating ? (
                                    <span className="flex items-center gap-sm">
                                        <Activity className="animate-spin" size={18} />
                                        Generating Intelligence...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-sm">
                                        <PlusCircle size={18} />
                                        Initialize AI Generation
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Recent Quizzes & System Health */}
                <div className="space-y-lg">
                    {/* Recent Quizzes */}
                    <div className="card backdrop-blur-md bg-white/5 border-white/10 p-0 overflow-hidden">
                        <div className="p-lg border-b border-white/10 flex items-center justify-between bg-white/2">
                            <h2 className="text-lg font-bold flex items-center gap-sm">
                                <FileText size={18} className="text-primary" />
                                Recent Quizzes
                            </h2>
                            <span className="text-[10px] font-black uppercase tracking-wider text-primary">{recentQuizzes.length} Generated</span>
                        </div>
                        <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {recentQuizzes.length === 0 ? (
                                <div className="p-lg text-center text-muted">
                                    <BookOpen size={32} className="mx-auto mb-sm opacity-30" />
                                    <p className="text-sm">No quizzes generated yet</p>
                                    <p className="text-xs mt-xs">Use the AI generator to create quizzes</p>
                                </div>
                            ) : (
                                recentQuizzes.map((quiz) => (
                                    <div key={quiz.id} className="p-lg hover:bg-white/5 transition-colors group">
                                        <div className="flex justify-between items-start mb-sm">
                                            <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                                {quiz.title}
                                            </h3>
                                            <span className={`badge badge-xs ${quiz.difficulty === 'easy' ? 'badge-success' : quiz.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'}`}>
                                                {quiz.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted mb-sm line-clamp-2">{quiz.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-xs">
                                                <span className="text-[10px] font-bold text-white/60">{quiz.questions.length} questions</span>
                                                {quiz.is_ai_generated && (
                                                    <span className="badge badge-info badge-xs">AI</span>
                                                )}
                                                <span className={`badge badge-xs ${
                                                    quiz.status === 'published' ? 'badge-success' : 
                                                    quiz.status === 'archived' ? 'badge-danger' : 
                                                    'badge-warning'
                                                }`}>
                                                    {quiz.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-xs">
                                                {quiz.status === 'draft' && (
                                                    <button 
                                                        onClick={() => publishQuiz(quiz.id)}
                                                        className="text-[10px] text-success hover:underline flex items-center gap-xs"
                                                        title="Publish quiz"
                                                    >
                                                        <Send size={12} />
                                                        Publish
                                                    </button>
                                                )}
                                                {quiz.status === 'published' && (
                                                    <button 
                                                        onClick={() => unpublishQuiz(quiz.id)}
                                                        className="text-[10px] text-warning hover:underline flex items-center gap-xs"
                                                        title="Unpublish quiz"
                                                    >
                                                        <Archive size={12} />
                                                        Unpublish
                                                    </button>
                                                )}
                                                <button className="text-[10px] text-primary hover:underline flex items-center gap-xs">
                                                    <Eye size={12} />
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* System Health Nexus */}
                    <div className="card backdrop-blur-md bg-white/5 border-white/10 relative overflow-hidden flex flex-col justify-between p-lg">
                        <div className="absolute top-0 right-0 p-lg opacity-5 pointer-events-none">
                            <Activity size={120} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-lg">
                                <h2 className="text-lg font-bold flex items-center gap-sm">
                                    <Zap size={18} className="text-warning animate-pulse" />
                                    Core Health
                                </h2>
                                <span className="badge badge-success px-sm py-1 font-bold text-[10px] tracking-widest uppercase">Operational</span>
                            </div>
                            <div className="flex flex-col gap-sm relative z-10">
                                {stats?.system_health?.slice(0, 4).map((s: any) => (
                                    <div key={s.service} className="flex justify-between items-center p-sm bg-white/5 rounded-lg border border-transparent hover:border-white/5 transition-colors">
                                        <div className="flex items-center gap-sm">
                                            <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'healthy' ? 'bg-success shadow-[0_0_8px_var(--success)]' : 'bg-warning animate-ping'}`} />
                                            <span className="font-bold text-[11px] uppercase tracking-wider">{s.service}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-white/50">{s.latency}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-lg pt-lg border-t border-white/5">
                            <div className="flex items-center justify-between text-xs text-muted mb-sm px-1">
                                <span>System Load</span>
                                <span className="font-black text-white/80">24%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-[24%] bg-gradient-to-r from-primary to-accent" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                {/* Priority Entities */}
                <div className="card backdrop-blur-md bg-white/5 border-white/10 p-0 overflow-hidden">
                    <div className="p-lg border-b border-white/10 flex items-center justify-between bg-white/2">
                        <h2 className="text-lg font-bold flex items-center gap-sm">
                            <Building2 size={18} className="text-accent" />
                            Priority Entities
                        </h2>
                        <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Nexus Map</button>
                    </div>
                    <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {stats?.top_tenants?.map((t: any) => (
                            <div key={t.name} className="p-lg flex justify-between items-center hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-md">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-bold border border-white/10 group-hover:scale-110 transition-transform shadow-glow">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm tracking-tight">{t.name}</div>
                                        <div className="text-[10px] text-muted font-bold uppercase tracking-wider">{t.user_count} users · {t.plan} plan</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-white/90 tabular-nums">{t.course_count} Courses</div>
                                    <div className="text-[9px] font-black text-success/80 uppercase tracking-widest">Active</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Processing Logs / Recent Signal */}
                <div className="card backdrop-blur-md bg-white/5 border-white/10 p-0 overflow-hidden flex flex-col">
                    <div className="p-lg border-b border-white/10 flex items-center justify-between bg-white/2">
                        <h2 className="text-lg font-bold flex items-center gap-sm">
                            <Activity size={18} className="text-primary" />
                            Signal Intelligence
                        </h2>
                        <div className="flex items-center gap-sm">
                            <span className="badge badge-primary px-sm py-1 font-bold text-[9px] tracking-widest uppercase">Live View</span>
                        </div>
                    </div>
                    <div className="flex-1 p-lg font-mono text-[10px] text-muted space-y-md overflow-y-auto max-h-[400px] bg-black/20 custom-scrollbar">
                        <div className="flex gap-md group">
                            <span className="text-primary font-bold opacity-50 shrink-0">07:31:02</span>
                            <span className="text-white/80"><span className="text-accent font-bold">[GATEWAY]</span> AI Worker initialized successfully (gemini-2.0-flash)</span>
                        </div>
                        <div className="flex gap-md">
                            <span className="text-primary font-bold opacity-50 shrink-0">07:31:05</span>
                            <span className="text-white/80"><span className="text-success font-bold">[SYNC]</span> Metadata harvesting completed for 12 courses</span>
                        </div>
                        <div className="flex gap-md opacity-60">
                            <span className="text-primary font-bold opacity-50 shrink-0">07:29:12</span>
                            <span className="text-white/80"><span className="text-warning font-bold">[DISC]</span> Storage reclamation optimized (+3.3GB free)</span>
                        </div>
                        <div className="flex gap-md opacity-40">
                            <span className="text-primary font-bold opacity-50 shrink-0">07:25:44</span>
                            <span className="text-white/80"><span className="text-primary font-bold">[CORE]</span> System Controller heart-beat stable at 24ms</span>
                        </div>
                        <div className="flex gap-md opacity-20">
                            <span className="text-primary font-bold opacity-50 shrink-0">07:20:10</span>
                            <span className="text-white/80"><span className="text-muted font-bold">[AUTH]</span> Super-admin nexus session authorized</span>
                        </div>
                        <div className="pt-xl flex flex-col items-center justify-center opacity-30 text-center space-y-md">
                            <Zap size={32} className="text-primary/20" />
                            <span>Listening for incoming platform signals...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
