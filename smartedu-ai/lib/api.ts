/**
 * API client utilities for making requests to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    message?: string;
}

export interface QuizGenerateRequest {
    course_id: string;
    topic: string;
    num_questions: number;
    difficulty: 'easy' | 'medium' | 'hard';
    question_type: 'mcq' | 'short' | 'mixed';
    document_id?: string;
}

export interface QuizResponse {
    id: string;
    title: string;
    description?: string;
    difficulty: string;
    status: string;
    is_ai_generated: boolean;
    questions: QuestionResponse[];
    created_at: string;
    time_limit_minutes?: number;
    course?: {
        id: string;
        title: string;
        code: string;
    };
}

export interface QuestionResponse {
    id: string;
    question_text: string;
    question_type: string;
    difficulty: string;
    options?: string[];
    correct_answer?: string;
    explanation?: string;
    order: number;
}

export interface Course {
    id: string;
    title: string;
    code?: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    documents?: CourseDocument[];
}

export interface CourseDocument {
    id: string;
    filename: string;
    file_type: string;
    file_size: number;
    is_processed: boolean;
    uploaded_at: string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;
        
        // Get auth token from cookie
        const getCookie = (name: string): string | null => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
            return null;
        };

        const token = getCookie('access_token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    error: data.detail || `HTTP error! status: ${response.status}`,
                };
            }

            return { data };
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : 'Network error occurred',
            };
        }
    }

    // Quiz endpoints
    async generateQuiz(request: QuizGenerateRequest): Promise<ApiResponse<QuizResponse>> {
        return this.request<QuizResponse>('/quizzes/generate', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    async getQuizzes(courseId?: string): Promise<ApiResponse<QuizResponse[]>> {
        const params = courseId ? `?course_id=${courseId}` : '';
        return this.request<QuizResponse[]>(`/quizzes${params}`);
    }

    async getQuiz(quizId: string): Promise<ApiResponse<QuizResponse>> {
        return this.request<QuizResponse>(`/quizzes/${quizId}`);
    }

    async updateQuizStatus(quizId: string, status: 'draft' | 'published' | 'archived'): Promise<ApiResponse<QuizResponse>> {
        const params = `?status=${status}`;
        return this.request<QuizResponse>(`/quizzes/${quizId}${params}`, {
            method: 'PATCH'
        });
    }

    // Course endpoints
    async getCourses(): Promise<ApiResponse<Course[]>> {
        const response = await this.request<{ courses: Course[] }>('/courses');
        if (response.data) {
            return { data: response.data.courses };
        }
        return { error: response.error };
    }

    // Analytics endpoints
    async getStudentAnalytics(): Promise<ApiResponse<any>> {
        return this.request<any>('/analytics/student');
    }

    async getTeacherAnalytics(): Promise<ApiResponse<any>> {
        return this.request<any>('/analytics/teacher');
    }

    async getClassAnalytics(courseId: string): Promise<ApiResponse<any>> {
        return this.request<any>(`/analytics/class/${courseId}`);
    }

    // Health check
    async healthCheck(): Promise<ApiResponse<{ status: string }>> {
        return this.request<{ status: string }>('/health');
    }
}

export const apiClient = new ApiClient();
export default apiClient;
