'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Download, Loader2, RotateCcw, FileText, Eye, Edit, ChevronDown, ChevronUp, Plus, Trash2, GripVertical
} from 'lucide-react';
import { Input } from '@/components/ui/input';

import { ResumeEditorData } from './types';
import { PersonalDetails } from './editor/PersonalDetails';
import { SummarySection } from './editor/SummarySection';
import { SkillsSection } from './editor/SkillsSection';
import { ExperienceSection } from './editor/ExperienceSection';
import { EducationSection } from './editor/EducationSection';
import { ProjectsSection } from './editor/ProjectsSection';

// ── Props ────────────────────────────────────

export interface ResumeEditorProps {
  data: ResumeEditorData;
  title?: string;
  onBack: () => void;
  backLabel?: string;
  onSave?: (data: ResumeEditorData) => Promise<ResumeEditorData | void>;
  onDownload?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  showSave?: boolean;
  showDownload?: boolean;
  saveLabel?: string;
}

// ══════════════════════════════════════════════
// MAIN COMPONENT (Form Editor)
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
  const [showPreview, setShowPreview] = useState(false);
  
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Sync when parent changes initial data
  useEffect(() => {
    setData(initialData);
    setOriginalData(initialData);
  }, [initialData]);

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
    if (showPreview && previewRef.current && previewHtml) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();

        const updateHeight = () => {
          if (previewRef.current?.contentDocument?.body) {
            const height = previewRef.current.contentDocument.body.scrollHeight;
            previewRef.current.style.height = `${height + 50}px`;
          }
        };
        setTimeout(updateHeight, 100);
      }
    }
  }, [previewHtml, showPreview]);

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2 h-9 border-border/50 shadow-sm rounded-full px-4 hover:bg-muted/50 transition-colors"
          >
            {showPreview ? (
              <>
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Content</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Preview Resume</span>
              </>
            )}
          </Button>

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-auto h-9 text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/10 rounded-full transition-colors gap-2 px-4 font-bold"
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

      {/* ── Main Area ────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Form Editor ─────────── */}
        {!showPreview && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="max-w-5xl mx-auto w-full">
              <PersonalDetails data={data} onChange={(d) => setData({ ...data, ...d })} />
              <SummarySection data={data} onChange={(d) => setData({ ...data, ...d })} />
              <SkillsSection data={data} onChange={(d) => setData({ ...data, ...d })} />
              <ExperienceSection data={data} onChange={(d) => setData({ ...data, ...d })} />
              <EducationSection data={data} onChange={(d) => setData({ ...data, ...d })} />
              <ProjectsSection data={data} onChange={(d) => setData({ ...data, ...d })} />
            </div>
          </div>
        )}

        {/* ── Right: Preview ──────────────────── */}
        {showPreview && (
          <div className="flex flex-1 flex-col bg-neutral-900 overflow-hidden relative isolate">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800/40 via-neutral-950 to-neutral-950 pointer-events-none -z-10" />

            <div className="flex-1 overflow-auto flex justify-center py-10 px-8 bg-neutral-900/50">
              <div className="w-full max-w-[850px] transition-all duration-300 origin-top" style={{ transform: 'scale(0.85)' }}>
                <iframe
                  ref={previewRef}
                  title="Resume Preview"
                  className="w-full border-0 rounded-sm"
                  style={{ height: '1123px', minHeight: '1123px', background: '#18181b' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Confirmation Modal ────────────────── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !deleting && setShowDeleteConfirm(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-background border border-border p-6 rounded-3xl shadow-2xl space-y-6"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">Clear AI Generation?</h3>
                  <p className="text-sm text-zinc-500">This will remove the current draft. Your original data is preserved.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>Keep Draft</Button>
                <Button variant="default" className="flex-1 rounded-xl h-11 bg-amber-500 hover:bg-amber-600 text-white font-bold" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Clear Draft'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── HTML Preview Generator ────────────────────
export function generatePreviewHtml(data: ResumeEditorData): string {
  const { fullName, email, phone, location, links = {} as any, professionalSummary, experience, projects, education, technicalSkills } = data;

  const contactParts: string[] = [];
  if (phone) contactParts.push(`<span>${phone}</span>`);
  if (location) contactParts.push(`<span>${location}</span>`);
  if (email) contactParts.push(`<a href="mailto:${email}" target="_blank">${email}</a>`);
  if (links?.github) contactParts.push(`<a href="${links.github}" target="_blank">Github</a>`);
  if (links?.linkedin) contactParts.push(`<a href="${links.linkedin}" target="_blank">Linkedin</a>`);
  if (links?.portfolio) contactParts.push(`<a href="${links.portfolio}" target="_blank">Portfolio</a>`);
  if (links?.leetcode) contactParts.push(`<a href="${links.leetcode}" target="_blank">LeetCode</a>`);
  if (links?.twitter) contactParts.push(`<a href="${links.twitter}" target="_blank">Twitter</a>`);
  if (links?.custom) contactParts.push(`<a href="${links.custom}" target="_blank">Website</a>`);
  const contactHTML = contactParts.join('\n      <span class="sep">&#9830;</span>\n      ');

  const skillGroups = [
    { label: 'AI Tools', key: 'aiTools' }, { label: 'Backend', key: 'backend' }, { label: 'Frontend', key: 'frontend' },
    { label: 'Databases', key: 'databases' }, { label: 'Dev Ops', key: 'devOpsAndTools' }, { label: 'Languages', key: 'programmingLanguages' }
  ];
  const skillsHTML = skillGroups.filter(g => technicalSkills?.[g.key]?.length).map(g => `<div class="skill-row"><b>${g.label}:</b> ${(technicalSkills[g.key] ?? []).join(', ')}</div>`).join('\n    ');

  const experienceHTML = (experience ?? []).map(exp => `
  <div class="exp-block">
    <div class="exp-header"><span class="exp-title">${exp.role}</span><span class="exp-date">${exp.duration?.start ?? ''} – ${exp.duration?.end ?? 'Present'}</span></div>
    <div class="exp-sub"><span class="exp-company">${exp.company}${exp.location ? `, ${exp.location}` : ''}</span></div>
    <ul>${(exp.responsibilitiesAndAchievements ?? []).map(b => `<li>${b}</li>`).join('')}</ul>
  </div>`).join('');

  const projectsHTML = (projects ?? []).map(proj => `
  <div class="proj-block">
    <div class="proj-title">${proj.title}</div>
    <ul>${(proj.description ?? []).map(b => `<li>${b}</li>`).join('')}</ul>
    ${proj.technologyStack?.length ? `<p class="tech"><b>Tech Stack:</b> ${proj.technologyStack.join(', ')}</p>` : ''}
  </div>`).join('');

  return `<!DOCTYPE html><html><head>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @page {
    size: A4;
    margin: 0.25in 0.4in;
  }

  body {
    font-family: 'EB Garamond', Georgia, 'Times New Roman', serif;
    font-size: 10pt;
    color: #000;
    background: transparent;
    line-height: 1.32;
    padding: 20px 0;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 0.25in 0.4in;
    background: #fff;
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
  }

  /* ── HEADER ── */
  .header {
    text-align: center;
    margin-bottom: 4px;
  }

  .header h1 {
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 23pt;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    line-height: 1.1;
    margin-bottom: 2px;
  }

  .contact-bar {
    font-size: 9pt;
    color: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 0 5px;
  }

  .contact-bar .separator {
    color: #000;
  }

  .contact-bar a {
    color: #2460a7;
    text-decoration: none;
  }

  /* ── SECTION HEADING ── */
  .section-title {
    font-size: 10.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 10px;
    margin-bottom: 1px;
    padding-bottom: 1px;
    border-bottom: 1px solid #000;
  }

  /* ── PROFESSIONAL SUMMARY ── */
  .summary {
    font-size: 9.8pt;
    text-align: justify;
    margin-top: 3px;
    line-height: 1.33;
  }
  .summary p {
    margin-bottom: 3px;
  }
  .summary p:last-child {
    margin-bottom: 0;
  }
  .summary ul {
    margin-top: 2px;
    margin-bottom: 3px;
  }

  /* ── EXPERIENCE ── */
  .exp-block {
    margin-top: 5px;
  }

  .exp-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .exp-title {
    font-weight: 700;
    font-size: 10pt;
  }

  .exp-date {
    font-style: italic;
    font-size: 9.5pt;
    color: #000;
    white-space: nowrap;
  }

  .exp-sub {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 0px;
    margin-bottom: 2px;
  }

  .exp-company {
    font-style: italic;
    font-size: 9.5pt;
  }

  .exp-type {
    font-size: 9.5pt;
    font-style: italic;
  }

  /* ── BULLET LISTS ── */
  ul {
    padding-left: 15px;
    margin: 0;
  }

  ul li {
    font-size: 9.8pt;
    margin-bottom: 2px;
    line-height: 1.35;
    text-align: justify;
  }

  /* ── TECH STACK ── */
  .tech {
    font-size: 9.5pt;
    margin-top: 2px;
    font-style: italic;
  }

  .tech b {
    font-style: normal;
    font-weight: 700;
  }

  /* ── SKILLS ── */
  .skills-block {
    margin-top: 3px;
  }

  .skill-row {
    font-size: 9.8pt;
    margin-bottom: 1px;
    line-height: 1.32;
    text-align: justify;
  }

  .skill-row b {
    font-weight: 700;
  }

  /* ── EDUCATION / CERTIFICATIONS ── */
  .edu-block {
    margin-top: 4px;
  }

  .edu-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .edu-degree {
    font-weight: 700;
    font-size: 10.5pt;
  }

  .edu-year {
    font-style: italic;
    font-size: 10pt;
  }

  .edu-school {
    font-style: italic;
    font-size: 10pt;
    margin-top: 0;
  }

  /* ── PROJECTS ── */
  .proj-block {
    margin-top: 5px;
  }

  .proj-title {
    font-weight: 700;
    font-size: 10.5pt;
    margin-bottom: 2px;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0; }
    .page { width: 100%; padding: 0; min-height: auto; }
  }

  /* === PAGE BREAK CONTROL === */
  .avoid-break,
  .exp-block,
  .proj-block,
  .edu-block,
  .skill-row {
    break-inside: avoid;
    page-break-inside: avoid;
  }
</style></head><body><div class="page">
  <div class="header avoid-break"><h1>${fullName || ''}</h1><div class="contact-bar">${contactHTML}</div></div>
  ${professionalSummary ? `<div class="section-title avoid-break">PROFESSIONAL SUMMARY</div><div class="summary avoid-break">${professionalSummary}</div>` : ''}
  ${skillsHTML ? `<div class="section-title avoid-break">SKILLS</div><div class="skills-block avoid-break">${skillsHTML}</div>` : ''}
  ${experienceHTML ? `<div class="section-title avoid-break">WORK EXPERIENCE</div>${experienceHTML}` : ''}
  ${education?.degree ? `<div class="section-title avoid-break">EDUCATION</div><div class="edu-block"><div class="edu-header"><span class="edu-degree">${education.degree}</span><span class="edu-year">${education.duration?.start ?? ''} - ${education.duration?.end ?? ''}</span></div><div class="edu-school">${education.institution}</div></div>` : ''}
  ${projectsHTML ? `<div class="section-title avoid-break">PROJECTS</div>${projectsHTML}` : ''}
</div></body></html>`;
}
