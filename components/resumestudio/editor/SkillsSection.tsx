import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ResumeEditorData, TechnicalSkills } from '../types';
import { Edit, Check, Code2 } from 'lucide-react';
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

export function SkillsSection({ data, onChange, isEditing: propsIsEditing, onEdit, onDone, onCancel, hasChanges }: Props) {
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

  const getSkillsHtml = () => {
    return Object.entries(data.technicalSkills || {})
      .filter(([_, skills]) => skills && skills.length > 0)
      .map(([cat, skills]) => {
        const catName = cat.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
        return `<p><strong>${catName}:</strong> ${skills.join(', ')}</p>`;
      })
      .join('');
  };

  const handleSkillsChange = (html: string) => {
    // Basic HTML to text conversion for parsing, preserving newlines
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.replace(/<\/p>/gi, '\n').replace(/<br\s*\/?>/gi, '\n');
    const text = tempDiv.innerText || tempDiv.textContent || '';
    
    const lines = text.split('\n').filter(line => line.trim());
    const newSkills: TechnicalSkills = {};
    
    lines.forEach(line => {
      if (line.includes(':')) {
        const [catStr, ...skillsStrs] = line.split(':');
        const skillsStr = skillsStrs.join(':');
        const cat = catStr.trim().toLowerCase().replace(/\s+(.)/g, (_, c) => c.toUpperCase());
        newSkills[cat] = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
      }
    });
    
    onChange({ technicalSkills: newSkills });
  };

  if (isEditing) {
    return (
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Edit Technical Skills</h2>
        </div>
        
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-foreground/80">Skills (Format: "Category: Skill 1, Skill 2")</Label>
            <p className="text-xs text-muted-foreground/70 mb-2">One category per line. You can use Bold for categories.</p>
            <RichTextEditor
              value={getSkillsHtml()}
              onChange={handleSkillsChange}
              placeholder="Frontend: React, Next.js, Tailwind&#10;Backend: Node.js, Express"
              minHeight="160px"
            />
          </div>
          
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

  const nonEmptySkills = Object.entries(data.technicalSkills || {}).filter(([_, v]) => v && v.length > 0);
  const hasSkills = nonEmptySkills.length > 0;

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
        <div className="bg-muted p-2 rounded-lg text-muted-foreground"><Code2 className="w-4 h-4" /></div>
        <h3 className="text-lg font-bold text-foreground">Technical Skills</h3>
      </div>
      
      {!hasSkills && <p className="text-muted-foreground/50 text-sm italic">No skills added yet.</p>}
      
      {hasSkills && (
        <div className="space-y-3">
          {nonEmptySkills.map(([cat, skills], idx) => (
            <div key={idx} className="text-sm">
              <span className="font-bold text-foreground/90 capitalize mr-2">
                {cat.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="text-muted-foreground">{(skills || []).join(', ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
