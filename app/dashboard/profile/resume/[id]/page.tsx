'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { showToast } from '@/lib/toast';
import { Loader2 } from 'lucide-react';
import ResumeEditor, { ResumeEditorData } from '@/components/resumestudio/ResumeEditor';

// ── Full resume document type (includes metadata) ──
interface ResumeDocument extends ResumeEditorData {
  id: string;
  userId: string;
  profileType: string;
  createdAt: string;
  updatedAt: string;
}

export default function ResumeEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doc, setDoc] = useState<ResumeDocument | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch resume ────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/resumes/${id}`);
        setDoc(res.data.data);
      } catch {
        showToast.error('Failed to load resume');
        router.push('/dashboard/profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading resume editor...</p>
        </div>
      </div>
    );
  }

  if (!doc) return null;

  return (
    <ResumeEditor
      data={doc}
      title="Resume Studio"
      onBack={() => router.push('/dashboard/profile')}
      backLabel="Back"
      saveLabel="Save Profile"
      onSave={async (data) => {
        try {
          const res = await api.patch(`/resumes/${doc.id}`, {
            profileType: doc.profileType,
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
          setDoc(saved);
          showToast.success('Resume saved!');
          return saved;
        } catch {
          showToast.error('Failed to save');
          throw new Error('Save failed');
        }
      }}
      onDownload={async () => {
        try {
          const res = await api.get(`/resumes/${doc.id}/download`, { responseType: 'blob' });
          const blob = new Blob([res.data], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const personName = (doc.fullName || 'Candidate').replace(/[^a-zA-Z0-9_\-]/g, '_');
          a.download = `${personName}_detailed_resume.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          showToast.success('Resume downloaded!');
        } catch {
          showToast.error('Download failed');
        }
      }}
    />
  );
}
