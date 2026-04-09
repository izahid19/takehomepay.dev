import api from '@/lib/axios';

// ── Premium Analysis Types ─────────────────────

export interface SectionAnalysis {
  rating: 'excellent' | 'good' | 'needs_work' | 'poor' | 'missing';
  score: number;
  feedback: string;
  suggestions: string[];
  examples: string[];
}

export interface SectionFeedback {
  summary: SectionAnalysis;
  experience: SectionAnalysis;
  skills: SectionAnalysis;
  education: SectionAnalysis;
  projects: SectionAnalysis;
  formatting: SectionAnalysis;
}

export interface BulletAnalysis {
  section: 'experience' | 'projects';
  itemIndex: number;
  bulletIndex: number;
  originalText: string;
  rating: 'strong' | 'moderate' | 'weak';
  issue?: string;
  suggestion?: string;
  rewrittenText?: string;
}

export interface KeywordInsight {
  keyword: string;
  status: 'matched' | 'missing' | 'partial';
  importance: 'critical' | 'important' | 'nice_to_have';
  context?: string;
  suggestion?: string;
}

export interface ATSCheck {
  check: string;
  passed: boolean;
  severity: 'critical' | 'warning' | 'info';
  detail: string;
}

export interface ImprovementItem {
  priority: 'high' | 'medium' | 'low';
  category: string;
  text: string;
  effort: 'quick_fix' | 'moderate' | 'significant';
}

export interface ScoreBreakdown {
  skillsMatch: number;
  experienceRelevance: number;
  keywordOptimization: number;
  impactLanguage: number;
  atsCompatibility: number;
  roleAlignment: number;
}

export interface ResumeAnalysis {
  score: number;
  scoreBreakdown: ScoreBreakdown;

  matchedSkills: string[];
  missingKeywords: KeywordInsight[];

  strengths: string[];
  weaknesses: string[];
  improvements: ImprovementItem[];

  sectionFeedback: SectionFeedback;
  bulletAnalysis: BulletAnalysis[];
  atsChecks: ATSCheck[];

  executiveSummary: string;
}

// ── Flat Resume Content Types ──────────────────

export interface ResumeLinks {
  github: string;
  linkedin: string;
  leetcode: string;
  portfolio: string;
}

export interface ResumeExperience {
  role: string;
  company: string;
  duration: { start: string; end: string };
  location: string;
  employmentType: string;
  technologies: string[];
  responsibilitiesAndAchievements: string[];
}

export interface ResumeProject {
  title: string;
  description: string[];
  technologyStack: string[];
  links: { github: string; live: string; demo: string };
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  duration: { start: string; end: string };
}

export interface ResumeTechnicalSkills {
  frontend?: string[];
  backend?: string[];
  databases?: string[];
  programmingLanguages?: string[];
  architecture?: string[];
  devOpsAndTools?: string[];
  middlewareAndServices?: string[];
  aiTools?: string[];
  [key: string]: string[] | undefined;
}

/** Flat resume content — pure data, no metadata (id/userId/timestamps) */
export interface ResumeContent {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  links: ResumeLinks;
  professionalSummary: string;
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation;
  technicalSkills: ResumeTechnicalSkills;
}

// ── Email Draft Types ─────────────────────────────

export interface EmailDraft {
  subject: string;
  greeting: string;
  body: string[];
  closing: string;
  signature: string;
}

export interface CoverLetter {
  title: string;
  heading: string;
  body: string[];
  closing: string;
  signature: string;
}

export interface ResumeRecord {
  _id: string;
  user: string;
  profileType: string;
  jobDescription: string;
  prevResumeContent: ResumeContent | null;
  newResumeContent: ResumeContent | null;
  analysis: ResumeAnalysis | null;
  emailDraft: EmailDraft | null;
  coverLetter: CoverLetter | null;
  status: 'SAVED' | 'GENERATING' | 'SUCCESS' | 'FAILED';
  analysisStatus: 'IDLE' | 'GENERATING' | 'SUCCESS' | 'FAILED';
  resumeStatus: 'IDLE' | 'GENERATING' | 'SUCCESS' | 'FAILED';
  emailDraftStatus: 'IDLE' | 'GENERATING' | 'SUCCESS' | 'FAILED';
  coverLetterStatus: 'IDLE' | 'GENERATING' | 'SUCCESS' | 'FAILED';
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * POST /resume/save
 * Saves a project (profileType + jobDescription) without generating yet.
 */
export async function saveProjectApi(payload: {
  profileType: string;
  jobDescription: string;
}): Promise<ResumeRecord> {
  const response = await api.post<{ status: string; data: ResumeRecord }>('/resume/save', payload);
  return response.data.data;
}

/**
 * POST /resume/:id/generate
 * Triggers AI analysis + resume generation for a saved project.
 */
export async function generateForProjectApi(
  id: string,
  resumeText: string
): Promise<ResumeRecord> {
  const response = await api.post<{ status: string; data: ResumeRecord }>(
    `/resume/${id}/generate`,
    { resumeText },
    { timeout: 180_000 }
  );
  return response.data.data;
}

/**
 * POST /resume/:id/analyze
 * Triggers AI analysis ONLY for a saved project.
 * model: 'deepseek' | 'claude-haiku' | 'claude-sonnet' (default: 'deepseek')
 */
export async function analyzeForProjectApi(
  id: string,
  resumeText: string,
  model: 'pitchdown-pro' | 'pitchdown-fast' | 'pitchdown-premium-lite' = 'pitchdown-pro'
): Promise<ResumeRecord> {
  const response = await api.post<{ status: string; data: ResumeRecord }>(
    `/resume/${id}/analyze`,
    { resumeText, model },
    { timeout: 180_000 }
  );
  return response.data.data;
}

/**
 * POST /resume/:id/generate-resume
 * Triggers AI resume generation ONLY for a saved project.
 * model: 'deepseek-reasoner' | 'deepseek-chat' | 'claude-haiku' | 'claude-sonnet'
 */
export async function generateResumeForProjectApi(
  id: string,
  resumeText: string,
  model: 'pitchdown-pro' | 'pitchdown-fast' | 'pitchdown-premium-lite' | 'pitchdown-premium' = 'pitchdown-pro'
): Promise<ResumeRecord> {
  const response = await api.post<{ status: string; data: ResumeRecord }>(
    `/resume/${id}/generate-resume`,
    { resumeText, model },
    { timeout: 180_000 }
  );
  return response.data.data;
}

/**
 * PATCH /resume/:id
 * Update project name/JD.
 */
export async function updateProjectApi(
  id: string,
  payload: { profileType?: string; jobDescription?: string }
): Promise<ResumeRecord> {
  const response = await api.patch<{ status: string; data: ResumeRecord }>(`/resume/${id}`, payload);
  return response.data.data;
}

/**
 * POST /resume/analyze
 */
export async function analyzeResumeApi(payload: {
  resumeText: string;
  jobDescription: string;
}): Promise<ResumeAnalysis> {
  const response = await api.post<{ status: string; data: ResumeAnalysis }>(
    '/resume/analyze',
    payload
  );
  return response.data.data;
}

/**
 * GET /resume
 */
export async function getResumesApi(): Promise<ResumeRecord[]> {
  const response = await api.get<{ status: string; data: ResumeRecord[] }>('/resume');
  return response.data.data;
}

/**
 * GET /resume/:id
 */
export async function getResumeByIdApi(id: string): Promise<ResumeRecord> {
  const response = await api.get<{ status: string; data: ResumeRecord }>(`/resume/${id}`);
  return response.data.data;
}

/**
 * Trigger PDF download for a stored resume by fetching as blob.
 */
export async function downloadResumeApi(id: string, filename?: string): Promise<void> {
  const response = await api.get(`/resume/${id}/download`, { responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `resume_${id}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * GET /resume/:id/download — returns the PDF blob without auto-downloading.
 */
export async function downloadResumeBlobApi(id: string): Promise<Blob> {
  const response = await api.get(`/resume/${id}/download`, { responseType: 'blob' });
  return new Blob([response.data], { type: 'application/pdf' });
}

/**
 * DELETE /resume/:id
 */
export async function deleteResumeApi(id: string): Promise<void> {
  await api.delete(`/resume/${id}`);
}

/**
 * POST /resume/:id/generate-email
 * Generates a professional email draft using JD + resume content.
 */
export async function generateEmailDraftApi(
  id: string,
  resumeText?: string
): Promise<ResumeRecord> {
  const response = await api.post<{ status: string; data: ResumeRecord }>(
    `/resume/${id}/generate-email`,
    { resumeText },
    { timeout: 120_000 }
  );
  return response.data.data;
}

/**
 * POST /resume/:id/generate-coverletter
 * Generates a professional cover letter using JD + resume content.
 */
export async function generateCoverLetterApi(
  id: string,
  resumeText?: string
): Promise<ResumeRecord> {
  const response = await api.post<{ status: string; data: ResumeRecord }>(
    `/resume/${id}/generate-coverletter`,
    { resumeText },
    { timeout: 120_000 }
  );
  return response.data.data;
}
