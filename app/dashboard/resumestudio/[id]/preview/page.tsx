'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Download, Loader2, AlertCircle, FileText,
  Mail, Phone, MapPin, Globe, ExternalLink,
} from 'lucide-react';
import { getResumeByIdApi, downloadResumeApi, ResumeRecord, ResumeContent } from '@/lib/resumeStudio.api';
import { cn } from '@/lib/utils';

// ─── Resume Renderer ───────────────────────────
function ResumeRenderer({ content }: { content: ResumeContent }) {
  const {
    fullName, email, phone, location, links = {} as any,
    professionalSummary, experience = [], projects = [], education, technicalSkills = {},
  } = content;

  const skillGroups = [
    { label: 'Languages', arr: technicalSkills.programmingLanguages },
    { label: 'Frontend',  arr: technicalSkills.frontend },
    { label: 'Backend',   arr: technicalSkills.backend },
    { label: 'Databases', arr: technicalSkills.databases },
    { label: 'Architecture', arr: technicalSkills.architecture },
    { label: 'DevOps & Tools', arr: technicalSkills.devOpsAndTools },
    { label: 'Services',  arr: technicalSkills.middlewareAndServices },
    { label: 'AI Tools',  arr: technicalSkills.aiTools },
  ].filter((g) => g.arr?.length);

  return (
    <div className="bg-white text-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-10 pt-8 pb-6 border-b-2 border-[#1a1a1a] text-center">
        <h2 className="text-2xl font-bold tracking-tight text-[#1a1a1a] mb-2">{fullName || '—'}</h2>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-[#555]">
          {phone    && <span className="flex items-center gap-1"><Phone   className="w-3 h-3" />{phone}</span>}
          {email    && <a href={`mailto:${email}`} className="flex items-center gap-1 hover:text-[#0077b5]"><Mail className="w-3 h-3" />{email}</a>}
          {location && <span className="flex items-center gap-1"><MapPin  className="w-3 h-3" />{location}</span>}
          {links.linkedin && <a href={links.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[#0077b5] hover:underline"><Globe className="w-3 h-3" />LinkedIn</a>}
          {links.github   && <a href={links.github}   target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline"><ExternalLink className="w-3 h-3" />GitHub</a>}
          {links.leetcode && <a href={links.leetcode} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline"><ExternalLink className="w-3 h-3" />LeetCode</a>}
        </div>
      </div>

      <div className="px-10 py-6 space-y-5">
        {/* Summary */}
        {professionalSummary && (
          <div>
            <SectionHeading>Professional Summary</SectionHeading>
            <p className="text-xs text-[#333] leading-relaxed">{professionalSummary}</p>
          </div>
        )}

        {/* Skills */}
        {skillGroups.length > 0 && (
          <div>
            <SectionHeading>Technical Skills</SectionHeading>
            <table className="w-full text-xs text-[#444]">
              <tbody>
                {skillGroups.map((g) => (
                  <tr key={g.label}>
                    <td className="font-bold text-[#333] pr-3 py-0.5 whitespace-nowrap align-top w-32">{g.label}:</td>
                    <td className="py-0.5">{g.arr!.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <SectionHeading>Work Experience</SectionHeading>
            <div className="space-y-4">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#1a1a1a]">{exp.role}</span>
                      <span className="text-xs text-[#333]"> — {exp.company}</span>
                      {exp.location && <span className="text-xs text-[#666]"> · {exp.location}</span>}
                    </div>
                    <span className="text-[10px] text-[#666] italic whitespace-nowrap">
                      {exp.duration?.start} – {exp.duration?.end || 'Present'}
                    </span>
                  </div>
                  {exp.employmentType && <p className="text-[10px] text-[#888] mb-1">{exp.employmentType}</p>}
                  {exp.technologies?.length > 0 && (
                    <p className="text-[10px] text-[#555] italic mb-1">{exp.technologies.join(' · ')}</p>
                  )}
                  <ul className="list-disc pl-4 space-y-0.5">
                    {exp.responsibilitiesAndAchievements?.map((b, j) => (
                      <li key={j} className="text-[11px] text-[#333] leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <SectionHeading>Projects</SectionHeading>
            <div className="space-y-4">
              {projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-xs font-bold text-[#1a1a1a]">{proj.title}</span>
                    <div className="flex gap-2 text-[10px]">
                      {proj.links?.github && <a href={proj.links.github} target="_blank" rel="noreferrer" className="text-[#0077b5] hover:underline">GitHub</a>}
                      {proj.links?.live   && <a href={proj.links.live}   target="_blank" rel="noreferrer" className="text-[#0077b5] hover:underline">Live</a>}
                    </div>
                  </div>
                  {proj.technologyStack?.length > 0 && (
                    <p className="text-[10px] text-[#555] italic mb-1">{proj.technologyStack.join(' · ')}</p>
                  )}
                  <ul className="list-disc pl-4 space-y-0.5">
                    {proj.description?.map((b, j) => (
                      <li key={j} className="text-[11px] text-[#333] leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education?.degree && (
          <div>
            <SectionHeading>Education</SectionHeading>
            <div className="flex justify-between items-baseline gap-2">
              <div>
                <p className="text-xs font-bold text-[#1a1a1a]">{education.degree}</p>
                <p className="text-xs text-[#444]">{education.institution}</p>
              </div>
              <span className="text-[10px] text-[#666] italic whitespace-nowrap">
                {education.duration?.start} – {education.duration?.end}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a] border-b border-[#1a1a1a] pb-1 mb-2">
      {children}
    </p>
  );
}

// ─── Main Page ─────────────────────────────────
export default function ResumePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<ResumeRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getResumeByIdApi(id)
      .then(setRecord)
      .catch(() => setError('Failed to load resume.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleDownload = async () => {
    if (!record) return;
    setIsDownloading(true);
    try {
      await downloadResumeApi(id, `${record.profileType?.replace(/\s+/g, '_') || 'Resume'}.pdf`);
    } catch {
      setError('Failed to download PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !record?.newResumeContent) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4 p-8">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-white font-bold text-lg">Resume not available</p>
        <p className="text-zinc-500 text-sm text-center max-w-sm">
          {error || 'This project has not been generated yet.'}
        </p>
        <Link href={`/dashboard/resumestudio/${id}`} className="text-sm text-emerald-400 hover:underline">
          ← Back to Project
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] p-4 md:p-8">
      <div className="max-w-5xl mx-auto px-6 space-y-6">

        {/* Nav bar */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/dashboard/resumestudio/${id}`}
            className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg px-3 py-1.5"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Project
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/resumestudio/${id}/analysis`}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg px-3 py-2 transition-all"
            >
              View Analysis
            </Link>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white transition-all disabled:opacity-60"
            >
              {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <h1 className="text-xl font-black text-white">{record.profileType}</h1>
          </div>
          <p className="text-xs text-zinc-600 ml-[44px]">AI-tailored resume generated with DeepSeek R1</p>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Rendered resume */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ResumeRenderer content={record.newResumeContent} />
        </motion.div>

        {/* Bottom download */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:brightness-105 transition-all disabled:opacity-60"
        >
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isDownloading ? 'Downloading...' : 'Download as PDF'}
        </button>
      </div>
    </div>
  );
}
