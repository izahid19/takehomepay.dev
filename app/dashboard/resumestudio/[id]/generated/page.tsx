'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { showToast } from '@/lib/toast';
import {
  getResumeByIdApi,
  generateResumeForProjectApi,
  downloadResumeBlobApi,
  ResumeRecord,
} from '@/lib/resumeStudio.api';
import api from '@/lib/axios';
import ResumeEditor, { ResumeEditorData } from '@/components/resumestudio/ResumeEditor';
import { useAuth } from '@/hooks/useAuth';

// New specialized components
import { ModelSelectionView, ResumeModel } from './components/GenerationModelSelection';
import { GenerationLoadingView } from './components/GenerationLoadingView';
import { GenerationErrorView } from './components/GenerationErrorView';

export default function GeneratedResumePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const userCredits = user?.credits ?? 0;

  const [record, setRecord] = useState<ResumeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreparing, setIsPreparing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [showModelSelection, setShowModelSelection] = useState(false);
  const [pendingRawText, setPendingRawText] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ResumeModel>('pitchdown-pro');

  // Fetch record
  const fetchRecord = useCallback(async () => {
    try {
      const data = await getResumeByIdApi(id);
      setRecord(data);
      return data;
    } catch {
      setError('Failed to load project.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // On mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const data = await fetchRecord();
      if (cancelled) return;

      if (data && !data.newResumeContent) {
        try {
          const profileRes = await api.get('/profile');
          const rawText = profileRes.data?.data?.resume?.rawText;
          if (!rawText) {
            setError('Please upload a resume in your profile first.');
            setIsPreparing(false);
            return;
          }
          if (cancelled) return;

          setPendingRawText(rawText);
          setShowModelSelection(true);
          setIsPreparing(false);
        } catch (err: any) {
          if (!cancelled) {
            setError(err?.response?.data?.message || err?.message || 'Failed to load profile.');
            setIsPreparing(false);
          }
        }
      } else {
        setIsPreparing(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id, fetchRecord]);

  const handleModelSelect = async (model: ResumeModel) => {
    setShowModelSelection(false);
    setSelectedModel(model);
    if (!pendingRawText) return;

    setIsGenerating(true);
    try {
      const updated = await generateResumeForProjectApi(id, pendingRawText, model);
      setRecord(updated);
      refreshUser();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Resume generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 1. Initial Loading
  if (isLoading || isPreparing) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
           <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Initializing Studio</p>
        </div>
      </div>
    );
  }

  // 2. Model Picker
  if (showModelSelection) {
    return (
      <ModelSelectionView
        onSelect={handleModelSelect}
        onBack={() => router.push(`/dashboard/resumestudio/${id}`)}
        userCredits={userCredits}
        userPlan={user?.plan}
      />
    );
  }

  // 3. Generation Loader
  if (isGenerating) {
    return <GenerationLoadingView selectedModel={selectedModel} />;
  }

  // 4. Error State
  if (error || !record?.newResumeContent) {
    return (
      <GenerationErrorView 
        error={error} 
        onBack={() => router.push(`/dashboard/resumestudio/${id}`)} 
      />
    );
  }

  // 5. Success State - Editor
  const rc = record.newResumeContent;
  const editorData: ResumeEditorData = {
    fullName: rc?.fullName ?? '',
    email: rc?.email ?? '',
    phone: rc?.phone ?? '',
    location: rc?.location ?? '',
    professionalSummary: rc?.professionalSummary ?? '',
    links: {
      github: rc?.links?.github ?? '',
      linkedin: rc?.links?.linkedin ?? '',
      leetcode: rc?.links?.leetcode ?? '',
      portfolio: rc?.links?.portfolio ?? '',
    },
    education: rc?.education ?? { degree: '', institution: '', duration: { start: '', end: '' } },
    technicalSkills: (rc?.technicalSkills ?? {}) as ResumeEditorData['technicalSkills'],
    experience: rc?.experience ?? [],
    projects: rc?.projects ?? [],
  };

  return (
    <ResumeEditor
      data={editorData}
      title={`ATS Resume — ${record?.profileType || 'Profile'}`}
      onBack={() => router.push(`/dashboard/resumestudio/${id}`)}
      backLabel="Project"
      saveLabel="Save Resume"
      onSave={async (data) => {
        try {
          const res = await api.patch(`/resume/${id}`, {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            location: data.location,
            professionalSummary: data.professionalSummary,
            links: data.links,
            education: data.education,
            technicalSkills: data.technicalSkills,
            experience: data.experience,
            projects: data.projects,
          });
          const saved = res.data.data;
          setRecord(saved);
          showToast.success('Resume saved!');
          const src = saved.newResumeContent;
          return {
            fullName: src.fullName ?? '',
            email: src.email ?? '',
            phone: src.phone ?? '',
            location: src.location ?? '',
            professionalSummary: src.professionalSummary ?? '',
            links: src.links ?? { github: '', linkedin: '', leetcode: '', portfolio: '' },
            education: src.education ?? { degree: '', institution: '', duration: { start: '', end: '' } },
            technicalSkills: src.technicalSkills ?? {},
            experience: src.experience ?? [],
            projects: src.projects ?? [],
          };
        } catch {
          showToast.error('Failed to save');
          throw new Error('Save failed');
        }
      }}
      onDownload={async () => {
        try {
          const blob = await downloadResumeBlobApi(id);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const fullName = record?.newResumeContent?.fullName || record?.prevResumeContent?.fullName || 'Candidate';
          const personName = fullName.replace(/[^a-zA-Z0-9_\-]/g, '_');
          a.download = `${personName}_detailed_resume.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          showToast.success('Resume downloaded!');
        } catch {
          showToast.error('Download failed');
        }
      }}
      onDelete={async () => {
        try {
          await api.post(`/resume/${id}/reset`);
          showToast.success('Resume draft cleared');
          window.location.reload();
        } catch {
          showToast.error('Failed to reset');
          throw new Error('Reset failed');
        }
      }}
    />
  );
}
