import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ResumeEditorData } from '../types';
import { Edit, Check, Briefcase, Plus, Trash2 } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface Props {
  data: ResumeEditorData;
  onChange: (data: Partial<ResumeEditorData>) => void;
  isEditing?: boolean;
  onEdit?: () => void;
  onDone?: () => void;
  onCancel?: () => void;
  hasChanges?: boolean;
}

export function ExperienceSection({ data, onChange, isEditing: propsIsEditing, onEdit, onDone, onCancel, hasChanges }: Props) {
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const isEditing = propsIsEditing !== undefined ? propsIsEditing : localIsEditing;
  const setIsEditing = (val: boolean) => {
    if (val) {
      onEdit?.();
      setLocalIsEditing(true);
    } else {
      onDone?.();
      setLocalIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Edit Experience</h2>
        </div>
        
        <div className="space-y-6">
          {(data.experience || []).map((exp, index) => (
            <div key={index} className="p-5 border border-border rounded-xl relative bg-muted/50/50 group">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10" 
                onClick={() => {
                  const newExp = [...data.experience];
                  newExp.splice(index, 1);
                  onChange({ experience: newExp });
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold text-foreground/80">Role</Label>
                  <Input 
                    className="bg-card border-transparent shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary h-10"
                    value={exp.role || ''} 
                    onChange={e => {
                      const newExp = [...data.experience]; newExp[index].role = e.target.value; onChange({ experience: newExp });
                    }} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold text-foreground/80">Company</Label>
                  <Input 
                    className="bg-card border-transparent shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary h-10"
                    value={exp.company || ''} 
                    onChange={e => {
                      const newExp = [...data.experience]; newExp[index].company = e.target.value; onChange({ experience: newExp });
                    }} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold text-foreground/80">Location</Label>
                  <Input 
                    className="bg-card border-transparent shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary h-10"
                    value={exp.location || ''} 
                    onChange={e => {
                      const newExp = [...data.experience]; newExp[index].location = e.target.value; onChange({ experience: newExp });
                    }} 
                  />
                </div>
                <div className="flex gap-2">
                  <div className="space-y-1.5 flex-1">
                    <Label className="text-sm font-bold text-foreground/80">Start Date</Label>
                    <Input 
                      className="bg-card border-transparent shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary h-10"
                      value={exp.duration?.start || ''} 
                      onChange={e => {
                        const newExp = [...data.experience]; newExp[index].duration = {...newExp[index].duration, start: e.target.value}; onChange({ experience: newExp });
                      }} 
                    />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <Label className="text-sm font-bold text-foreground/80">End Date</Label>
                    <Input 
                      className="bg-card border-transparent shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary h-10"
                      value={exp.duration?.end || ''} 
                      onChange={e => {
                        const newExp = [...data.experience]; newExp[index].duration = {...newExp[index].duration, end: e.target.value}; onChange({ experience: newExp });
                      }} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-foreground/80">Responsibilities & Tech Stack</Label>
                <p className="text-xs text-muted-foreground/70 mb-1">List your responsibilities and include "Tech Stack: ..." at the end.</p>
                <RichTextEditor
                  value={`<ul>${(exp.responsibilitiesAndAchievements || []).map(b => `<li>${b}</li>`).join('')}</ul>${exp.technologies?.length ? `<p><strong>Tech Stack:</strong> ${exp.technologies.join(', ')}</p>` : ''}`}
                  onChange={html => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    
                    // Extract bullet points
                    const items = Array.from(tempDiv.querySelectorAll('li')).map(li => (li as HTMLElement).innerText || li.textContent || '').filter(Boolean);
                    
                    // Extract tech stack
                    let techStack: string[] = [];
                    const techStackEl = Array.from(tempDiv.querySelectorAll('p, div')).find(el => ((el as HTMLElement).innerText || el.textContent || '').includes('Tech Stack:'));
                    if (techStackEl) {
                      const techText = ((techStackEl as HTMLElement).innerText || techStackEl.textContent || '').split('Tech Stack:')[1];
                      if (techText) {
                        techStack = techText.split(',').map(s => s.trim()).filter(Boolean);
                      }
                    }
                    
                    const newExp = [...data.experience];
                    newExp[index].responsibilitiesAndAchievements = items;
                    newExp[index].technologies = techStack;
                    onChange({ experience: newExp });
                  }}
                  placeholder="e.g. Developed and maintained 3 production web applications...&#10;&#10;Tech Stack: React, Node.js"
                  minHeight="180px"
                />
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full border-dashed border-2 h-12 text-muted-foreground hover:text-foreground hover:bg-muted/50" 
            onClick={() => onChange({ experience: [...(data.experience || []), {role: '', company: '', location: '', employmentType: 'Full-time', duration: {start: '', end: ''}, responsibilitiesAndAchievements: [], technologies: []}] })}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Experience
          </Button>
          
          <div className="pt-4 flex justify-center gap-3">
            <Button 
              variant="outline"
              className="w-full sm:w-auto min-w-[120px] h-12 rounded-xl text-base shadow-sm transition-all"
              onClick={() => onCancel ? onCancel() : onDone?.()}
            >
              Close
            </Button>
            <Button 
              disabled={hasChanges === false}
              className="w-full sm:w-auto min-w-[120px] h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-sm transition-all"
              onClick={() => setIsEditing(false)}
            >
              <Check className="w-5 h-5 mr-2" /> Done
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasExperience = data.experience && data.experience.length > 0;

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-6 relative group transition-all hover:shadow-md">
      <Button 
        size="icon" 
        className="absolute top-4 right-4 h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        onClick={() => setIsEditing(true)}
      >
        <Edit className="w-4 h-4" />
      </Button>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-muted p-2 rounded-lg text-muted-foreground"><Briefcase className="w-4 h-4" /></div>
        <h3 className="text-lg font-bold text-foreground">Experience</h3>
      </div>
      
      {!hasExperience && <p className="text-muted-foreground/50 text-sm italic">No experience added yet.</p>}
      
      {hasExperience && (
        <div className="space-y-6">
          {data.experience.map((exp, idx) => (
            <div key={idx} className="relative pl-4 border-l-2 border-border/50">
              <div className="absolute w-2.5 h-2.5 bg-border rounded-full -left-[6px] top-1.5" />
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
                <h4 className="font-bold text-foreground">{exp.role || 'Role'}</h4>
                <span className="text-xs font-medium text-muted-foreground/70 bg-muted px-2 py-0.5 rounded-full mt-1 sm:mt-0">
                  {exp.duration?.start || ''} - {exp.duration?.end || 'Present'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground font-medium mb-2">
                {exp.company} {exp.location ? `• ${exp.location}` : ''}
              </div>
              {exp.responsibilitiesAndAchievements && exp.responsibilitiesAndAchievements.length > 0 && (
                <ul className="list-disc list-outside ml-4 text-sm text-muted-foreground space-y-1">
                  {exp.responsibilitiesAndAchievements.filter(Boolean).map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
