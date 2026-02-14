'use client';

import { useState, useEffect } from 'react';
import { Plus, Upload, Trash2, FileText, Settings, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAuthHeader } from '@/lib/auth';

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: '', code: '', description: '', semester: '' });
    const [showUploadModal, setShowUploadModal] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        const API_BASE = 'http://localhost:8000/api';
        try {
            const res = await fetch(`${API_BASE}/admin/courses`, {
                headers: { ...getAuthHeader() }
            });
            if (res.ok) {
                const data = await res.json();
                setCourses(data);
            }
        } catch (error) {
            console.error('Failed to fetch courses', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        const API_BASE = 'http://localhost:8000/api';
        try {
            const res = await fetch(`${API_BASE}/courses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(newCourse)
            });
            if (res.ok) {
                toast.success('Course created successfully');
                setShowCreateModal(false);
                setNewCourse({ title: '', code: '', description: '', semester: '' });
                fetchCourses();
            } else {
                toast.error('Failed to create course');
            }
        } catch (error) {
            toast.error('Connection error');
        }
    };

    const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setUploading(true);
        try {
            const res = await fetch(`/api/documents/upload/${showUploadModal}`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                toast.success('Material uploaded and processing started');
                setShowUploadModal(null);
                fetchCourses();
            } else {
                toast.error('Upload failed');
            }
        } catch (error) {
            toast.error('Connection error');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading courses...</div>;

    return (
        <div className="admin-courses-page">
            <div className="page-header">
                <div className="flex justify-between items-center">
                    <div>
                        <h1>Course Management</h1>
                        <p>Manage all academic courses and materials</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} style={{ marginRight: '8px' }} />
                        Create New Course
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Course Info</th>
                            <th>Code</th>
                            <th>Teacher</th>
                            <th>Materials</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr key={course.id}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{course.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{course.semester || 'Undated'}</div>
                                </td>
                                <td><code className="code-tag">{course.code || 'N/A'}</code></td>
                                <td>{course.teacher_id.slice(0, 8)}...</td>
                                <td>
                                    <div className="flex items-center gap-sm">
                                        <FileText size={14} />
                                        <span>{course.documents?.length || 0} files</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${course.is_active ? 'badge-success' : 'badge-danger'}`}>
                                        {course.is_active ? 'Active' : 'Archived'}
                                    </span>
                                </td>
                                <td className="actions">
                                    <button
                                        className="btn-icon"
                                        title="Upload Material"
                                        onClick={() => setShowUploadModal(course.id)}
                                    >
                                        <Upload size={16} />
                                    </button>
                                    <button className="btn-icon" title="Course Settings"><Settings size={16} /></button>
                                    <button className="btn-icon text-danger" title="Delete Course"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h2>Create New Course</h2>
                        <form onSubmit={handleCreateCourse} className="flex flex-col gap-md">
                            <div className="form-group">
                                <label>Course Title</label>
                                <input
                                    className="input-premium"
                                    required
                                    value={newCourse.title}
                                    onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                                    placeholder="e.g. Advanced Quantum Mechanics"
                                />
                            </div>
                            <div className="flex gap-md">
                                <div className="form-group flex-1">
                                    <label>Course Code</label>
                                    <input
                                        className="input-premium"
                                        value={newCourse.code}
                                        onChange={e => setNewCourse({ ...newCourse, code: e.target.value })}
                                        placeholder="QM101"
                                    />
                                </div>
                                <div className="form-group flex-1">
                                    <label>Semester</label>
                                    <input
                                        className="input-premium"
                                        value={newCourse.semester}
                                        onChange={e => setNewCourse({ ...newCourse, semester: e.target.value })}
                                        placeholder="Spring 2026"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="input-premium"
                                    rows={3}
                                    value={newCourse.description}
                                    onChange={e => setNewCourse({ ...newCourse, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-md mt-sm">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Course</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showUploadModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h2>Upload Course Material</h2>
                        <p className="text-muted mb-md">Files will be processed by AI for RAG immediately after upload.</p>
                        <form onSubmit={handleFileUpload} className="flex flex-col gap-md">
                            <div className="form-group">
                                <label>Select PDF Document</label>
                                <input
                                    type="file"
                                    name="file"
                                    accept=".pdf"
                                    required
                                    className="input-premium"
                                />
                            </div>
                            <div className="flex justify-end gap-md mt-sm">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowUploadModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={uploading}>
                                    {uploading ? 'Uploading...' : 'Start Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
