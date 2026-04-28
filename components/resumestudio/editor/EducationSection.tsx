import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ResumeEditorData } from '../types';
import { Edit, Check, GraduationCap } from 'lucide-react';

interface Props {
  data: ResumeEditorData;
  onChange: (data: Partial<ResumeEditorData>) => void;
  isEditing?: boolean;
  onEdit?: () => void;
  onDone?: () => void;
  onCancel?: () => void;
  hasChanges?: boolean;
}

export function EducationSection({ data, onChange, isEditing: propsIsEditing, onEdit, onDone, onCancel, hasChanges }: Props) {
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
          <h2 className="text-xl font-bold text-foreground">Edit Education</h2>
        </div>
        
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-foreground/80">Degree</Label>
            <Input 
              className="bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary h-11"
              value={data.education?.degree || ''} 
              onChange={e => onChange({ education: { ...data.education, degree: e.target.value } as any })} 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-foreground/80">Institution</Label>
            <Input 
              className="bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary h-11"
              value={data.education?.institution || ''} 
              onChange={e => onChange({ education: { ...data.education, institution: e.target.value } as any })} 
            />
          </div>

          <div className="flex gap-4">
            <div className="space-y-1.5 flex-1">
              <Label className="text-sm font-bold text-foreground/80">Start Date</Label>
              <Input 
                className="bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary h-11"
                value={data.education?.duration?.start || ''} 
                onChange={e => onChange({ education: { ...data.education, duration: { ...data.education?.duration, start: e.target.value } } as any })} 
              />
            </div>
            <div className="space-y-1.5 flex-1">
              <Label className="text-sm font-bold text-foreground/80">End Date</Label>
              <Input 
                className="bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary h-11"
                value={data.education?.duration?.end || ''} 
                onChange={e => onChange({ education: { ...data.education, duration: { ...data.education?.duration, end: e.target.value } } as any })} 
              />
            </div>
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

  const hasEducation = data.education && (data.education.degree || data.education.institution);

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
        <div className="bg-muted p-2 rounded-lg text-muted-foreground"><GraduationCap className="w-4 h-4" /></div>
        <h3 className="text-lg font-bold text-foreground">Education</h3>
      </div>
      
      {!hasEducation && <p className="text-muted-foreground/50 text-sm italic">No education added yet.</p>}
      
      {hasEducation && (
        <div className="relative pl-4 border-l-2 border-border/50">
          <div className="absolute w-2.5 h-2.5 bg-border rounded-full -left-[6px] top-1.5" />
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
            <h4 className="font-bold text-foreground">{data.education.degree || 'Degree'}</h4>
            <span className="text-xs font-medium text-muted-foreground/70 bg-muted px-2 py-0.5 rounded-full mt-1 sm:mt-0">
              {data.education.duration?.start || ''} - {data.education.duration?.end || 'Present'}
            </span>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {data.education.institution}
          </div>
        </div>
      )}
    </div>
  );
}
