'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { showToast } from '@/lib/toast';
import { Loader2, ArrowLeft, Save, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


export default function ProfileResumeMarkdownPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [rawText, setRawText] = useState('');
  const [initialText, setInitialText] = useState('');
  const [careerOpsProfile, setCareerOpsProfile] = useState('');
  const [initialCareerOpsProfile, setInitialCareerOpsProfile] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);


  const fetchData = async () => {
    try {
      const resumeRes = await api.get(`/resumes/${id}`);
      const resume = resumeRes.data.data;
      
      const text = resume.rawText || '';
      setRawText(text);
      setInitialText(text);
      const profileMd = resume.careerOpsProfile || '';
      setCareerOpsProfile(profileMd);
      setInitialCareerOpsProfile(profileMd);
    } catch {
      showToast.error('Failed to load data');
      router.push('/dashboard/profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save both resume source and strategic profile to the Resume document
      await api.patch(`/resumes/${id}`, { 
        rawText,
        careerOpsProfile 
      });
      setInitialText(rawText);
      setInitialCareerOpsProfile(careerOpsProfile);
      showToast.success('Changes saved successfully');
    } catch {
      showToast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateProfile = async () => {
    setGenerating(true);
    try {
      const res = await api.post(`/resumes/${id}/generate-strategic`);
      const updatedResume = res.data.data;
      setCareerOpsProfile(updatedResume.careerOpsProfile || '');
      showToast.success('Strategic profile generated successfully!');
    } catch {
      showToast.error('Failed to generate profile');
    } finally {
      setGenerating(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasChanges = rawText !== initialText || careerOpsProfile !== initialCareerOpsProfile;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -mx-4 sm:-mx-6 lg:-mx-8 -mb-8 bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/20 bg-background shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/profile')}
            className="gap-2 text-muted-foreground hover:text-foreground h-8 px-3 rounded-full bg-muted/40">
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Button>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <h1 className="text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Resume Studio
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateProfile}
            disabled={generating || rawText === initialText}
            className={cn(
              "gap-2 h-9 rounded-full px-4 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 font-bold transition-all",
              (generating || rawText === initialText) && "opacity-50 grayscale cursor-not-allowed"
            )}
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? 'Generating Profile...' : 'Generate Profile'}
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={saving || !hasChanges}
            className={cn(
              "gap-2 h-9 rounded-full px-6 bg-primary font-bold shadow-lg shadow-primary/20 transition-all",
              !hasChanges && "opacity-50 grayscale cursor-not-allowed"
            )}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>


      {/* Split Pane Editor/Viewer */}
      <div className="flex-1 overflow-hidden p-6 bg-zinc-950/20 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Resume Editor */}
        <div className="h-full border border-border/50 rounded-2xl bg-background shadow-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-3 border-b border-border/10 bg-muted/5 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Resume Source (cv.md)</span>
            <span className="text-[10px] italic text-muted-foreground/40 font-mono text-emerald-500/60">Source Layer</span>
          </div>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full p-8 font-mono text-[14px] leading-relaxed bg-transparent focus:outline-none resize-none hide-scrollbar selection:bg-primary/30 text-foreground/90"
            placeholder="# CV -- Your Name..."
          />
        </div>

        {/* Right: Strategic Profile Editor */}
        <div className="h-full border border-border/50 rounded-2xl bg-background/40 backdrop-blur-sm shadow-2xl overflow-hidden flex flex-col relative group">
          <div className="px-6 py-3 border-b border-border/10 bg-muted/5 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60 flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Strategic Profile (profile.md)
            </span>
            <span className="text-[10px] italic text-muted-foreground/40 font-mono text-primary/60">Manual or AI Edit</span>
          </div>
          
          <textarea
            value={careerOpsProfile}
            onChange={(e) => setCareerOpsProfile(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full p-8 font-mono text-[13px] leading-relaxed bg-transparent focus:outline-none resize-none hide-scrollbar selection:bg-primary/30 text-zinc-400"
            placeholder="# Strategic Profile..."
          />

          {!careerOpsProfile && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-4 opacity-30 pointer-events-none">
              <Sparkles className="w-12 h-12" />
              <p className="max-w-[200px] text-xs">Save your changes first, then click "Generate Profile" to see your strategic narrative here.</p>
            </div>
          )}
          
          {careerOpsProfile && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(careerOpsProfile);
                showToast.success('YAML copied!');
              }}
              className="absolute bottom-6 right-6 bg-zinc-900/80 backdrop-blur-md border border-border/50 text-primary hover:bg-primary/10 h-8 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Copy YAML
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
