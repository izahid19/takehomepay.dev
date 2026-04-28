import api from '@/lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AnalyserModel = 'pitchdown-pro' | 'pitchdown-fast' | 'pitchdown-premium-lite';

export interface ResumeAnalyserRecord {
  _id: string;
  user: string;
  title: string;
  jobDescription: string;
  resumeFileName: string;
  aiModel: AnalyserModel;
  creditCost: number;
  analysis: any | null;
  status: 'PENDING' | 'GENERATING' | 'SUCCESS' | 'FAILED';
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedAnalysesResponse {
  data: ResumeAnalyserRecord[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * POST /analyser/create
 * Sends multipart/form-data with resume PDF + title + jobDescription + model.
 */
export async function createAnalysisApi(payload: {
  title: string;
  jobDescription: string;
  model: AnalyserModel;
  resumeFile: File;
}): Promise<ResumeAnalyserRecord> {
  const form = new FormData();
  form.append('title', payload.title);
  form.append('jobDescription', payload.jobDescription);
  form.append('model', payload.model);
  form.append('resume', payload.resumeFile);

  const response = await api.post<{ status: string; data: ResumeAnalyserRecord }>(
    '/analyser/create',
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 240_000, // 4 min — analysis can be slow
    }
  );
  return response.data.data;
}

/**
 * GET /analyser
 */
export async function getAnalysesApi(
  page = 1,
  limit = 9
): Promise<PaginatedAnalysesResponse> {
  const response = await api.get<{ status: string } & PaginatedAnalysesResponse>(
    `/analyser?page=${page}&limit=${limit}`
  );
  const { data, total, totalPages, limit: lim } = response.data;
  return { data, total, totalPages, page, limit: lim };
}

/**
 * GET /analyser/:id
 */
export async function getAnalysisByIdApi(id: string): Promise<ResumeAnalyserRecord> {
  const response = await api.get<{ status: string; data: ResumeAnalyserRecord }>(`/analyser/${id}`);
  return response.data.data;
}

/**
 * DELETE /analyser/:id
 */
export async function deleteAnalysisApi(id: string): Promise<void> {
  await api.delete(`/analyser/${id}`);
}
