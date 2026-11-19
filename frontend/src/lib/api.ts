const API_BASE = (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') : '') + '/api/v1';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('cs_token');
  }

  public setToken(token: string) {
    localStorage.setItem('cs_token', token);
  }

  public clearToken() {
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorDetail = 'An unexpected error occurred.';
      try {
        const errJson = await res.json();
        errorDetail = errJson.detail || errJson.message || errorDetail;
      } catch {
        errorDetail = await res.text() || res.statusText;
      }
      throw new Error(errorDetail);
    }

    return res.json();
  }

  // Auth & Profile
  public auth = {
    login: (credentials: { email: string; password: string }) =>
      this.request<{ access_token: string; token_type: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (data: { email: string; password: string; full_name: string }) =>
      this.request<{ access_token: string; token_type: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMe: () => this.request<any>('/me'),
    updateProfile: (profileData: any) =>
      this.request<any>('/me', {
        method: 'PATCH',
        body: JSON.stringify(profileData),
      }),
  };

  // Careers
  public careers = {
    list: () => this.request<any[]>('/careers'),
    get: (idOrSlug: string) => this.request<any>(`/careers/${idOrSlug}`),
  };

  // Assessments
  public assessments = {
    getQuestions: () => this.request<any[]>('/assessments/questions'),
    submit: (answers: Record<string, any>) =>
      this.request<any>('/assessments', {
        method: 'POST',
        body: JSON.stringify({ answers }),
      }),
    history: () => this.request<any[]>('/assessments/history'),
  };

  // Roadmaps
  public roadmaps = {
    getActive: () => this.request<any>('/roadmaps'),
    generate: (data: { target_role: string; weekly_hours?: number; preferred_learning_style?: string }) =>
      this.request<any>('/roadmaps/generate', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateTask: (taskId: string, data: { status?: string; notes?: string }) =>
      this.request<any>(`/roadmaps/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  };

  // Skills
  public skills = {
    list: () => this.request<any[]>('/skills'),
    getMy: () => this.request<any[]>('/skills/my'),
    add: (data: { skill_name: string; category?: string; proficiency: string; evidence_type?: string }) =>
      this.request<any>('/skills', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { proficiency: string; evidence_type?: string }) =>
      this.request<any>(`/skills/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      this.request<any>(`/skills/${id}`, {
        method: 'DELETE',
      }),
    gapAnalysis: () => this.request<any>('/skills/gap-analysis'),
  };

  // Resumes
  public resumes = {
    upload: (file: File, targetRole?: string) => {
      const formData = new FormData();
      formData.append('file', file);
      if (targetRole) formData.append('target_role', targetRole);
      return this.request<any>('/resumes', {
        method: 'POST',
        body: formData,
      });
    },
    list: () => this.request<any[]>('/resumes'),
    get: (id: string) => this.request<any>(`/resumes/${id}`),
    delete: (id: string) =>
      this.request<any>(`/resumes/${id}`, {
        method: 'DELETE',
      }),
  };

  // Chat
  public chat = {
    listConversations: () => this.request<any[]>('/chat/conversations'),
    createConversation: (title?: string) =>
      this.request<any>('/chat/conversations', {
        method: 'POST',
        body: JSON.stringify({ title: title || 'Career Guidance Session' }),
      }),
    getConversation: (id: string) => this.request<any>(`/chat/conversations/${id}`),
    sendMessage: (conversationId: string, content: string) =>
      this.request<any>(`/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    deleteConversation: (id: string) =>
      this.request<any>(`/chat/conversations/${id}`, {
        method: 'DELETE',
      }),
  };

  // Interviews
  public interviews = {
    list: () => this.request<any[]>('/interviews'),
    create: (data: { target_role: string; interview_type: string; difficulty: string; question_count: number }) =>
      this.request<any>('/interviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    get: (id: string) => this.request<any>(`/interviews/${id}`),
    submitAnswer: (sessionId: string, questionId: string, answerText: string) =>
      this.request<any>(`/interviews/${sessionId}/questions/${questionId}/answer`, {
        method: 'POST',
        body: JSON.stringify({ answer_text: answerText }),
      }),
    complete: (sessionId: string) =>
      this.request<any>(`/interviews/${sessionId}/complete`, {
        method: 'POST',
      }),
  };

  // Practice
  public practice = {
    getQuestions: (params?: { question_type?: string; topic?: string; difficulty?: string }) => {
      const query = new URLSearchParams();
      if (params?.question_type) query.append('question_type', params.question_type);
      if (params?.topic) query.append('topic', params.topic);
      if (params?.difficulty) query.append('difficulty', params.difficulty);
      return this.request<any[]>(`/practice/questions?${query.toString()}`);
    },
    submitAttempt: (questionId: string, answer: string) =>
      this.request<any>(`/practice/questions/${questionId}/attempt`, {
        method: 'POST',
        body: JSON.stringify({ answer }),
      }),
    getHistory: () => this.request<any>('/practice/history'),
  };

  // Jobs
  public jobs = {
    list: (params?: { search?: string; work_mode?: string; employment_type?: string }) => {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.work_mode) query.append('work_mode', params.work_mode);
      if (params?.employment_type) query.append('employment_type', params.employment_type);
      return this.request<any[]>(`/jobs?${query.toString()}`);
    },
    get: (id: string) => this.request<any>(`/jobs/${id}`),
    toggleSave: (id: string) =>
      this.request<{ saved: boolean; message: string }>(`/jobs/${id}/save`, {
        method: 'POST',
      }),
  };

  // Applications
  public applications = {
    list: () => this.request<any[]>('/applications'),
    create: (data: { job_id: string; status?: string; notes?: string }) =>
      this.request<any>('/applications', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { status: string; notes?: string }) =>
      this.request<any>(`/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  };

  // Dashboard
  public dashboard = {
    getOverview: () => this.request<any>('/dashboard/overview'),
  };

  // Notifications
  public notifications = {
    list: () => this.request<any[]>('/notifications'),
    markRead: (id: string) =>
      this.request<any>(`/notifications/${id}`, {
        method: 'PATCH',
      }),
    markAllRead: () =>
      this.request<any>('/notifications/mark-all-read', {
        method: 'POST',
      }),
  };

  // Admin
  public admin = {
    overview: () => this.request<any>('/admin/overview'),
    listUsers: (search?: string) =>
      this.request<any[]>(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    createJob: (data: any) =>
      this.request<any>('/admin/jobs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateJob: (id: string, data: any) =>
      this.request<any>(`/admin/jobs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    createQuestion: (data: any) =>
      this.request<any>('/admin/questions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };
}

export const api = new ApiClient();
