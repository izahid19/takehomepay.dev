'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Download, Loader2, Trash2, Plus,
  User, Briefcase, Code2, FolderKanban, GraduationCap, RotateCcw,
} from 'lucide-react';

// ── Types ────────────────────────────────────

export interface ResumeLinks {
  github: string;
  linkedin: string;
  leetcode: string;
  portfolio: string;
}
export interface Duration { start: string; end: string; }
export interface Experience {
  role: string; company: string; duration: Duration; location: string;
  employmentType: string; technologies: string[]; responsibilitiesAndAchievements: string[];
}
export interface Project {
  title: string; description: string[]; technologyStack: string[];
  links: { github: string; live: string; demo: string; [key: string]: string | undefined };
}
export interface Education { degree: string; institution: string; duration: Duration; }
export interface TechnicalSkills { [key: string]: string[]; }

export interface ResumeEditorData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  professionalSummary: string;
  links: ResumeLinks;
  education: Education;
  technicalSkills: TechnicalSkills;
  experience: Experience[];
  projects: Project[];
}

// ── Tab config ───────────────────────────────

const TABS = [
  { key: 'personal', label: 'Personal', icon: User },
  { key: 'experience', label: 'Experience', icon: Briefcase },
  { key: 'skills', label: 'Skills', icon: Code2 },
  { key: 'projects', label: 'Projects', icon: FolderKanban },
  { key: 'education', label: 'Education', icon: GraduationCap },
] as const;

type TabKey = typeof TABS[number]['key'];

// ── Props ────────────────────────────────────

export interface ResumeEditorProps {
  /** Initial data to populate the editor */
  data: ResumeEditorData;
  /** Title shown in the top bar */
  title?: string;
  /** Back button behaviour */
  onBack: () => void;
  backLabel?: string;
  /** Called when saving with the current editor data. Return the saved data to update state. */
  onSave?: (data: ResumeEditorData) => Promise<ResumeEditorData | void>;
  /** Called when downloading */
  onDownload?: () => Promise<void>;
  /** Called when deleting */
  onDelete?: () => Promise<void>;
  /** If true, save/download buttons are shown */
  showSave?: boolean;
  showDownload?: boolean;
  /** Optional save button label */
  saveLabel?: string;
}

// ══════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════

export default function ResumeEditor({
  data: initialData,
  title = 'Resume Studio',
  onBack,
  backLabel = 'Back',
  onSave,
  onDownload,
  onDelete,
  showSave = true,
  showDownload = true,
  saveLabel = 'Save',
}: ResumeEditorProps) {
  const [data, setData] = useState<ResumeEditorData>(initialData);
  const [originalData, setOriginalData] = useState<ResumeEditorData>(initialData);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Sync when parent changes initial data
  useEffect(() => {
    setData(initialData);
    setOriginalData(initialData);
  }, [initialData]);

  const update = useCallback(<K extends keyof ResumeEditorData>(key: K, value: ResumeEditorData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const hasChanges = JSON.stringify(data) !== JSON.stringify(originalData);

  // ── Save handler ────────────────────────────
  const handleSave = async () => {
    if (!onSave || !hasChanges) return;
    setSaving(true);
    try {
      const result = await onSave(data);
      if (result) {
        setData(result);
        setOriginalData(result);
      } else {
        setOriginalData(data);
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Download handler ────────────────────────
  const handleDownload = async () => {
    if (!onDownload) return;
    setDownloading(true);
    try {
      await onDownload();
    } finally {
      setDownloading(false);
    }
  };

  // ── Delete handler ──────────────────────────
  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  // ── Live preview HTML ───────────────────────
  const previewHtml = generatePreviewHtml(data);

  useEffect(() => {
    if (previewRef.current && previewHtml) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();

        // Optional: adjust height to fit content
        const updateHeight = () => {
          if (previewRef.current && previewRef.current.contentDocument) {
            const body = previewRef.current.contentDocument.body;
            if (body) {
              const height = body.scrollHeight;
              // If we use scale(0.9) on the container, we need to adjust the iframe height
              previewRef.current.style.height = `${height + 50}px`;
            }
          }
        };

        // Give it a moment to render
        setTimeout(updateHeight, 100);
      }
    }
  }, [previewHtml]);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -mx-4 sm:-mx-6 lg:-mx-8 -mb-8">
      {/* ── Top Bar ───────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/20 bg-background/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}
            className="gap-2 text-muted-foreground hover:text-foreground h-8 px-3 rounded-full bg-muted/40 hover:bg-muted">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">{backLabel}</span>
          </Button>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-auto h-9 text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/10 rounded-full transition-colors gap-2 px-4 font-bold"
              title="Reset AI Generation"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}

          {showDownload && onDownload && (
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={downloading}
              className="gap-2 h-9 border-border/50 shadow-sm rounded-full px-4 hover:bg-muted/50 transition-colors">
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">Export PDF</span>
            </Button>
          )}
          {showSave && onSave && (
            <Button size="sm" onClick={handleSave} disabled={saving || !hasChanges}
              className={`gap-2 h-9 rounded-full px-5 transition-all focus:ring-2 focus:ring-primary/50 relative overflow-hidden ${
                hasChanges
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 active:scale-95'
                  : 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-80 border border-border/50'
              }`}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saveLabel}
            </Button>
          )}
        </div>
      </div>

      {/* ── Main Split ────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Editor ──────────────────── */}
        <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col border-r border-border/30 bg-background overflow-hidden shrink-0">

          {/* Tab Nav */}
          <div className="flex items-center gap-1 p-2.5 border-b border-border/20 bg-muted/5 shrink-0 overflow-x-auto hide-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-[13px] font-medium transition-colors relative whitespace-nowrap rounded-md ${
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  {isActive && (
                    <motion.div layoutId="editorActiveTabPill"
                      className="absolute inset-0 bg-background shadow-sm border border-border/40 rounded-md"
                      style={{ zIndex: -1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'opacity-60'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}>
                {activeTab === 'personal' && <PersonalTab data={data} update={update} />}
                {activeTab === 'experience' && <ExperienceTab data={data} update={update} />}
                {activeTab === 'skills' && <SkillsTab data={data} update={update} />}
                {activeTab === 'projects' && <ProjectsTab data={data} update={update} />}
                {activeTab === 'education' && <EducationTab data={data} update={update} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right: Preview ──────────────────── */}
        <div className="hidden lg:flex flex-1 flex-col bg-neutral-900 border-l border-border/20 overflow-hidden relative isolate">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800/40 via-neutral-950 to-neutral-950 pointer-events-none -z-10" />

          <div className="flex-1 overflow-auto flex justify-center py-10 px-8 bg-neutral-900/50">
            <div className="w-full max-w-[720px] transition-all duration-300 origin-top" style={{ transform: 'scale(0.85)' }}>
              <iframe
                ref={previewRef}
                title="Resume Preview"
                className="w-full border-0 rounded-sm"
                style={{ height: '1123px', minHeight: '1123px', background: '#18181b' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirmation Modal ────────────────── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-left">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-background border border-border p-6 rounded-3xl shadow-2xl space-y-6"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">Clear AI Generation?</h3>
                  <p className="text-sm text-zinc-500">
                    This will remove the current AI-tailored resume draft. Your project and job description will be preserved so you can select a different model or try again.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-11 transition-all"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Keep Draft
                </Button>
                <Button
                  variant="default"
                  className="flex-1 rounded-xl h-11 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 gap-2 font-bold transition-all"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  Clear Draft
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════
// FIELD COMPONENT
// ══════════════════════════════════════════════

function Field({ label, value, onChange, placeholder, multiline, className }:
  { label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; className?: string }) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">{label}</Label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex min-h-[120px] w-full rounded-xl border border-border/40 bg-muted/30 px-3.5 py-3 text-[14px] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all resize-y shadow-sm"
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-11 rounded-xl bg-muted/30 border-border/40 text-[14px] px-3.5 placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all shadow-sm"
        />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════
// PERSONAL TAB
// ══════════════════════════════════════════════

function PersonalTab({ data, update }: { data: ResumeEditorData; update: <K extends keyof ResumeEditorData>(k: K, v: ResumeEditorData[K]) => void }) {
  return (
    <div className="space-y-7 pb-4">
      <div className="space-y-5">
        <Field label="Full Name" value={data.fullName} onChange={(v) => update('fullName', v)} placeholder="John Doe" />
        <Field label="Email" value={data.email} onChange={(v) => update('email', v)} placeholder="john@example.com" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Phone" value={data.phone} onChange={(v) => update('phone', v)} placeholder="+1234567890" />
        <Field label="Location" value={data.location} onChange={(v) => update('location', v)} placeholder="New York, NY" />
      </div>

      <div className="pt-5 border-t border-border/20">
        <h3 className="text-[13px] font-bold text-foreground/80 mb-4 uppercase tracking-wider">Social Links</h3>
        <div className="space-y-4">
          <Field label="LinkedIn URL" value={data.links?.linkedin ?? ''} onChange={(v) => update('links', { ...data.links, linkedin: v })} placeholder="https://linkedin.com/in/..." />
          <Field label="GitHub URL" value={data.links?.github ?? ''} onChange={(v) => update('links', { ...data.links, github: v })} placeholder="https://github.com/..." />
          <Field label="Portfolio URL" value={data.links?.portfolio ?? ''} onChange={(v) => update('links', { ...data.links, portfolio: v })} placeholder="https://..." />
          <Field label="LeetCode URL" value={data.links?.leetcode ?? ''} onChange={(v) => update('links', { ...data.links, leetcode: v })} placeholder="https://leetcode.com/u/..." />
        </div>
      </div>

      <div className="pt-5 border-t border-border/20">
        <Field label="Professional Summary" value={data.professionalSummary} onChange={(v) => update('professionalSummary', v)} multiline placeholder="Describe your expertise..." />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// EXPERIENCE TAB
// ══════════════════════════════════════════════

function ExperienceTab({ data, update }: { data: ResumeEditorData; update: <K extends keyof ResumeEditorData>(k: K, v: ResumeEditorData[K]) => void }) {
  const exps = data.experience ?? [];

  const updateExp = (idx: number, patch: Partial<Experience>) => {
    const next = exps.map((e, i) => i === idx ? { ...e, ...patch } : e);
    update('experience', next);
  };

  const addExp = () => {
    update('experience', [...exps, {
      role: '', company: '', duration: { start: '', end: '' }, location: '',
      employmentType: '', technologies: [], responsibilitiesAndAchievements: [],
    }]);
  };

  const removeExp = (idx: number) => {
    update('experience', exps.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      {exps.map((exp, idx) => (
        <div key={idx} className="p-4 rounded-xl bg-card/40 border border-border/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{exp.role || 'New Role'}</h3>
            <span className="text-xs text-muted-foreground">{exp.company}</span>
          </div>
          <div className="space-y-4">
            <Field label="Role" value={exp.role} onChange={(v) => updateExp(idx, { role: v })} placeholder="Frontend Developer" />
            <Field label="Company" value={exp.company} onChange={(v) => updateExp(idx, { company: v })} placeholder="Acme Corp" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start" value={exp.duration?.start ?? ''} onChange={(v) => updateExp(idx, { duration: { ...exp.duration, start: v } })} placeholder="09/2023" />
            <Field label="End" value={exp.duration?.end ?? ''} onChange={(v) => updateExp(idx, { duration: { ...exp.duration, end: v } })} placeholder="06/2025" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Location" value={exp.location} onChange={(v) => updateExp(idx, { location: v })} placeholder="Remote" />
            <Field label="Type" value={exp.employmentType} onChange={(v) => updateExp(idx, { employmentType: v })} placeholder="Full-time" />
          </div>
          <Field
            label="Technologies Used (comma separated)"
            value={exp.technologies?.join(', ') ?? ''}
            onChange={(v) => updateExp(idx, { technologies: v.split(',').map(s => s.trim()).filter(Boolean) })}
            placeholder="React, Node.js, AWS"
          />

          <div className="pt-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Responsibilities</Label>
            <div className="space-y-2 mt-2">
              {(exp.responsibilitiesAndAchievements ?? []).map((bullet, bi) => (
                <div key={bi} className="flex gap-2 items-start group">
                  <textarea
                    value={bullet}
                    onChange={(e) => {
                      const next = [...(exp.responsibilitiesAndAchievements ?? [])];
                      next[bi] = e.target.value;
                      updateExp(idx, { responsibilitiesAndAchievements: next });
                    }}
                    className="flex-1 min-h-[60px] rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-y"
                  />
                  <Button variant="ghost" size="icon"
                    onClick={() => {
                      const next = (exp.responsibilitiesAndAchievements ?? []).filter((_, i) => i !== bi);
                      updateExp(idx, { responsibilitiesAndAchievements: next });
                    }}
                    className="shrink-0 w-8 h-8 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => {
              const next = [...(exp.responsibilitiesAndAchievements ?? []), ''];
              updateExp(idx, { responsibilitiesAndAchievements: next });
            }} className="mt-2 text-primary text-xs gap-1 hover:bg-primary/5">
              <Plus className="w-3 h-3" /> Add Point
            </Button>
          </div>

          <div className="pt-2 border-t border-border/20 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => removeExp(idx)}
              className="text-red-500 hover:bg-red-500/10 gap-1 text-xs">
              <Trash2 className="w-3 h-3" /> Delete Role
            </Button>
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addExp} className="w-full border-dashed border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 gap-1.5">
        <Plus className="w-4 h-4" /> Add Experience
      </Button>
    </div>
  );
}

// ══════════════════════════════════════════════
// SKILLS TAB
// ══════════════════════════════════════════════

function SkillsTab({ data, update }: { data: ResumeEditorData; update: <K extends keyof ResumeEditorData>(k: K, v: ResumeEditorData[K]) => void }) {
  const skills = data.technicalSkills ?? {};
  const categories = Object.entries(skills).filter(([, v]) => Array.isArray(v));

  const updateCat = (cat: string, value: string[]) => {
    update('technicalSkills', { ...skills, [cat]: value });
  };

  const removeCat = (cat: string) => {
    const next = { ...skills };
    delete next[cat];
    update('technicalSkills', next);
  };

  const addCategory = () => {
    const name = prompt('Enter category name (e.g., "cloud"):');
    if (name && name.trim() && !(name.trim() in skills)) {
      update('technicalSkills', { ...skills, [name.trim()]: [] });
    }
  };

  return (
    <div className="space-y-5">
      <Button variant="outline" onClick={addCategory}
        className="w-full border-dashed border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 gap-1.5">
        <Plus className="w-4 h-4" /> Add Skill Category
      </Button>

      {categories.map(([cat, vals]) => (
        <div key={cat} className="p-4 rounded-xl bg-card/40 border border-border/30 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold uppercase tracking-wider text-foreground">{cat}</Label>
            <Button variant="ghost" size="icon" onClick={() => removeCat(cat)}
              className="w-7 h-7 text-red-500/60 hover:text-red-500 hover:bg-red-500/10">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Field label="Skills (comma separated)" value={(vals as string[]).join(', ')}
            onChange={(v) => updateCat(cat, v.split(',').map(s => s.trim()).filter(Boolean))}
            placeholder="React, Node.js, TypeScript" />
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════
// PROJECTS TAB
// ══════════════════════════════════════════════

function ProjectsTab({ data, update }: { data: ResumeEditorData; update: <K extends keyof ResumeEditorData>(k: K, v: ResumeEditorData[K]) => void }) {
  const projs = data.projects ?? [];

  const updateProj = (idx: number, patch: Partial<Project>) => {
    const next = projs.map((p, i) => i === idx ? { ...p, ...patch } : p);
    update('projects', next);
  };

  const addProject = () => {
    update('projects', [...projs, {
      title: '', description: [], technologyStack: [],
      links: { github: '', live: '', demo: '' },
    }]);
  };

  const removeProject = (idx: number) => {
    update('projects', projs.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-5">
      {projs.map((proj, idx) => (
        <details key={idx} open={idx === 0} className="group rounded-xl bg-card/40 border border-border/30 overflow-hidden">
          <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-card/60 transition-colors">
            <span className="font-semibold text-sm">{proj.title || 'New Project'}</span>
            <svg className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 pb-4 space-y-4 border-t border-border/20 pt-4">
            <Field label="Project Title" value={proj.title} onChange={(v) => updateProj(idx, { title: v })} placeholder="My Awesome App" />
            <div className="space-y-4">
              <Field label="GitHub Link" value={proj.links?.github ?? ''} onChange={(v) => updateProj(idx, { links: { ...proj.links, github: v } })} placeholder="https://..." />
              <Field label="Live Demo" value={proj.links?.live ?? ''} onChange={(v) => updateProj(idx, { links: { ...proj.links, live: v } })} placeholder="https://..." />
            </div>
            <Field label="Tech Stack (comma separated)" value={proj.technologyStack?.join(', ') ?? ''}
              onChange={(v) => updateProj(idx, { technologyStack: v.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="React, Vite, Tailwind" />
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</Label>
              <div className="space-y-2 mt-2">
                {(proj.description ?? []).map((bullet, bi) => (
                  <div key={bi} className="flex gap-2 items-start group/bullet">
                    <textarea
                      value={bullet}
                      onChange={(e) => {
                        const next = [...(proj.description ?? [])];
                        next[bi] = e.target.value;
                        updateProj(idx, { description: next });
                      }}
                      className="flex-1 min-h-[60px] rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-y"
                    />
                    <Button variant="ghost" size="icon"
                      onClick={() => {
                        const next = (proj.description ?? []).filter((_, i) => i !== bi);
                        updateProj(idx, { description: next });
                      }}
                      className="shrink-0 w-8 h-8 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover/bullet:opacity-100 transition-opacity mt-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => {
                const next = [...(proj.description ?? []), ''];
                updateProj(idx, { description: next });
              }} className="mt-2 text-primary text-xs gap-1 hover:bg-primary/5">
                <Plus className="w-3 h-3" /> Add Description Point
              </Button>
            </div>
            <div className="pt-2 border-t border-border/20 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => removeProject(idx)}
                className="text-red-500 hover:bg-red-500/10 gap-1 text-xs">
                <Trash2 className="w-3 h-3" /> Delete Project
              </Button>
            </div>
          </div>
        </details>
      ))}

      <Button variant="outline" onClick={addProject}
        className="w-full border-dashed border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 gap-1.5">
        <Plus className="w-4 h-4" /> Add Project
      </Button>
    </div>
  );
}

// ══════════════════════════════════════════════
// EDUCATION TAB
// ══════════════════════════════════════════════

function EducationTab({ data, update }: { data: ResumeEditorData; update: <K extends keyof ResumeEditorData>(k: K, v: ResumeEditorData[K]) => void }) {
  const edu = data.education ?? { degree: '', institution: '', duration: { start: '', end: '' } };

  const updateEdu = (patch: Partial<Education>) => {
    update('education', { ...edu, ...patch });
  };

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-card/40 border border-border/30 space-y-4">
        <Field label="Degree" value={edu.degree} onChange={(v) => updateEdu({ degree: v })} placeholder="Bachelor of Engineering (B.E.)" />
        <Field label="Institution" value={edu.institution} onChange={(v) => updateEdu({ institution: v })} placeholder="MIT" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Year" value={edu.duration?.start ?? ''} onChange={(v) => updateEdu({ duration: { ...edu.duration, start: v } })} placeholder="2017" />
          <Field label="End Year" value={edu.duration?.end ?? ''} onChange={(v) => updateEdu({ duration: { ...edu.duration, end: v } })} placeholder="2021" />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// PREVIEW HTML GENERATOR
// ══════════════════════════════════════════════

export function generatePreviewHtml(data: ResumeEditorData): string {
  const {
    fullName, email, phone, location,
    links = {} as any,
    professionalSummary, experience, projects, education, technicalSkills,
  } = data;

  const contactParts: string[] = [];
  if (phone) contactParts.push(`<span>${phone}</span>`);
  if (location) contactParts.push(`<span>${location}</span>`);
  if (email) contactParts.push(`<a href="mailto:${email}" target="_blank" rel="noopener noreferrer">${email}</a>`);
  if (links?.github) contactParts.push(`<a href="${links.github}" target="_blank" rel="noopener noreferrer">Github</a>`);
  if (links?.linkedin) contactParts.push(`<a href="${links.linkedin}" target="_blank" rel="noopener noreferrer">Linkedin</a>`);
  if (links?.leetcode) contactParts.push(`<a href="${links.leetcode}" target="_blank" rel="noopener noreferrer">LeetCode</a>`);
  if (links?.portfolio) contactParts.push(`<a href="${links.portfolio}" target="_blank" rel="noopener noreferrer">Portfolio</a>`);
  const contactHTML = contactParts.join('\n      <span class="sep">&#9830;</span>\n      ');

  const skillGroups: { label: string; key: string }[] = [
    { label: 'AI Tools', key: 'aiTools' },
    { label: 'Backend', key: 'backend' },
    { label: 'Frontend', key: 'frontend' },
    { label: 'Databases', key: 'databases' },
    { label: 'Architecture', key: 'architecture' },
    { label: 'Dev Ops And Tools', key: 'devOpsAndTools' },
    { label: 'Programming Languages', key: 'programmingLanguages' },
    { label: 'Middleware And Services', key: 'middlewareAndServices' },
  ];

  const skillsHTML = skillGroups
    .filter((g) => technicalSkills?.[g.key]?.length)
    .map((g) => `<div class="skill-row"><b>${g.label}:</b> ${(technicalSkills[g.key] ?? []).join(', ')}</div>`)
    .join('\n    ');

  const experienceHTML = (experience ?? [])
    .map((exp) => `
  <div class="exp-block">
    <div class="exp-header">
      <span class="exp-title">${exp.role}</span>
      <span class="exp-date">${exp.duration?.start ?? ''} – ${exp.duration?.end ?? 'Present'}</span>
    </div>
    <div class="exp-sub">
      <span class="exp-company">${exp.company}${exp.location ? `, ${exp.location}` : ''}</span>
      <span class="exp-type">${exp.employmentType ?? ''}</span>
    </div>
    <ul>
      ${(exp.responsibilitiesAndAchievements ?? []).map((b) => `<li>${b}</li>`).join('\n      ')}
    </ul>
    ${exp.technologies?.length ? `<p class="tech"><b>Tech Stack:</b> ${exp.technologies.join(', ')}</p>` : ''}
  </div>`)
    .join('');

  const projectsHTML = (projects ?? [])
    .map((proj) => {
      const linksHtml = [
        proj.links?.github ? `<a href="${proj.links.github}" target="_blank" rel="noopener noreferrer" style="font-size:10pt;font-weight:normal;margin-left:8px;color:#2460a7;">[GitHub]</a>` : '',
        proj.links?.live ? `<a href="${proj.links.live}" target="_blank" rel="noopener noreferrer" style="font-size:10pt;font-weight:normal;margin-left:4px;color:#2460a7;">[Live]</a>` : '',
      ].filter(Boolean).join('');
      return `
  <div class="proj-block">
    <div class="proj-title">${proj.title}${linksHtml}</div>
    <ul>
      ${(proj.description ?? []).map((b) => `<li>${b}</li>`).join('\n      ')}
    </ul>
    ${proj.technologyStack?.length ? `<p class="tech"><b>Tech Stack:</b> ${proj.technologyStack.join(', ')}</p>` : ''}
  </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${fullName ?? 'Resume'}</title>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { 
    font-family: 'EB Garamond', Georgia, 'Times New Roman', serif; 
    font-size: 10.5pt; 
    color: #000; 
    background: transparent; 
    line-height: 1.3; 
    padding: 20px 0;
  }
  .page { 
    width: 210mm; 
    min-height: 297mm; 
    margin: 0 auto; 
    padding: 12mm 16mm; 
    background: #fff; 
    position: relative; 
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
  }
  .section-title, .exp-block, .proj-block, .edu-block, .skills-block, .skill-row { page-break-inside: avoid; break-inside: avoid; }
  
  /* Page break markers for preview */
  @media screen {
    .page::before {
      content: "PAGE 1";
      position: absolute;
      top: 0;
      right: -40px;
      font-size: 10px;
      color: #666;
    }
    .page::after {
      content: "";
      position: absolute;
      top: 297mm;
      left: 0;
      right: 0;
      border-top: 1px dashed #ddd;
      pointer-events: none;
    }
  }
  .header { text-align: center; margin-bottom: 4px; }
  .header h1 { font-family: 'EB Garamond', Georgia, serif; font-size: 26pt; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; line-height: 1.1; margin-bottom: 3px; }
  .contact-bar { font-size: 9.5pt; color: #000; display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 0 6px; }
  .contact-bar .sep { color: #000; }
  .contact-bar a { color: #2460a7; text-decoration: none; }
  .section-title { font-size: 11pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 10px; margin-bottom: 2px; padding-bottom: 1px; border-bottom: 1.2px solid #000; }
  .summary { font-size: 10pt; text-align: justify; margin-top: 4px; line-height: 1.35; }
  .exp-block { margin-top: 5px; }
  .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
  .exp-title { font-weight: 700; font-size: 10.5pt; }
  .exp-date { font-style: italic; font-size: 10pt; color: #000; white-space: nowrap; }
  .exp-sub { display: flex; justify-content: space-between; align-items: baseline; margin-top: 0; margin-bottom: 3px; }
  .exp-company { font-style: italic; font-size: 10pt; }
  .exp-type { font-size: 10pt; font-style: italic; }
  ul { padding-left: 18px; margin: 0; }
  ul li { font-size: 10pt; margin-bottom: 2px; line-height: 1.35; text-align: justify; }
  .tech { font-size: 10pt; margin-top: 3px; font-style: italic; }
  .tech b { font-style: normal; font-weight: 700; }
  .skills-block { margin-top: 4px; }
  .skill-row { font-size: 10pt; margin-bottom: 1px; line-height: 1.35; text-align: justify; }
  .skill-row b { font-weight: 700; }
  .edu-block { margin-top: 5px; }
  .edu-header { display: flex; justify-content: space-between; align-items: baseline; }
  .edu-degree { font-weight: 700; font-size: 10.5pt; }
  .edu-year { font-style: italic; font-size: 10pt; }
  .edu-school { font-style: italic; font-size: 10pt; margin-top: 0; }
  .proj-block { margin-top: 5px; }
  .proj-title { font-weight: 700; font-size: 10.5pt; margin-bottom: 2px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .page { width: 100%; padding: 10mm 15mm; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>${fullName ?? ''}</h1>
    ${contactParts.length > 0 ? `<div class="contact-bar">${contactHTML}</div>` : ''}
  </div>
  ${professionalSummary ? `<div class="section-title">Professional Summary</div><p class="summary">${professionalSummary}</p>` : ''}
  ${experienceHTML ? `<div class="section-title">Experience</div>${experienceHTML}` : ''}
  ${skillsHTML ? `<div class="section-title">Technical Skills</div><div class="skills-block">${skillsHTML}</div>` : ''}
  ${education?.degree ? `<div class="section-title">Education</div><div class="edu-block"><div class="edu-header"><span class="edu-degree">${education.degree}</span><span class="edu-year">${education.duration?.start ?? ''} – ${education.duration?.end ?? ''}</span></div><div class="edu-school">${education.institution ?? ''}</div></div>` : ''}
  ${projectsHTML ? `<div class="section-title">Projects</div>${projectsHTML}` : ''}
</div>
</body>
</html>`;
}
