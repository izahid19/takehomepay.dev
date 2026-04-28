import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ResumeEditorData, ResumeLinks } from '../types';
import { Mail, Phone, MapPin, Edit, Check } from 'lucide-react';

interface Props {
  data: ResumeEditorData;
  onChange: (data: Partial<ResumeEditorData>) => void;
  isEditing?: boolean;
  onEdit?: () => void;
  onDone?: () => void;
  onCancel?: () => void;
  hasChanges?: boolean;
}

export function PersonalDetails({ data, onChange, isEditing: propsIsEditing, onEdit, onDone, onCancel, hasChanges }: Props) {
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
          <h2 className="text-xl font-bold text-foreground">Edit Personal Details</h2>
        </div>
        
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-foreground/80">Full name</Label>
            <Input 
              className="bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary h-11"
              value={data.fullName || ''} 
              onChange={e => onChange({ fullName: e.target.value })} 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-foreground/80">Email</Label>
            <Input 
              className="bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary h-11"
              value={data.email || ''} 
              onChange={e => onChange({ email: e.target.value })} 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-foreground/80">Phone</Label>
            <Input 
              className="bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary h-11"
              value={data.phone || ''} 
              onChange={e => onChange({ phone: e.target.value })} 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-foreground/80">Location</Label>
            <Input 
              className="bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary h-11"
              value={data.location || ''} 
              onChange={e => onChange({ location: e.target.value })} 
              placeholder="City, Country"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-foreground/80">GitHub</Label>
            <Input 
              className="bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary h-11"
              value={data.links?.github || ''} 
              onChange={e => onChange({ links: { ...data.links, github: e.target.value } as ResumeLinks })} 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-foreground/80">LinkedIn</Label>
            <Input 
              className="bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary h-11"
              value={data.links?.linkedin || ''} 
              onChange={e => onChange({ links: { ...data.links, linkedin: e.target.value } as ResumeLinks })} 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-foreground/80">Portfolio</Label>
            <Input 
              className="bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary h-11"
              value={data.links?.portfolio || ''} 
              onChange={e => onChange({ links: { ...data.links, portfolio: e.target.value } as ResumeLinks })} 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-foreground/80">LeetCode</Label>
            <Input 
              className="bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary h-11"
              value={data.links?.leetcode || ''} 
              onChange={e => onChange({ links: { ...data.links, leetcode: e.target.value } as ResumeLinks })} 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-foreground/80">Twitter / X</Label>
            <Input 
              className="bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary h-11"
              value={data.links?.twitter || ''} 
              onChange={e => onChange({ links: { ...data.links, twitter: e.target.value } as ResumeLinks })} 
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-bold text-foreground/80">Custom Link</Label>
            <Input 
              className="bg-muted/50 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary h-11"
              value={data.links?.custom || ''} 
              onChange={e => onChange({ links: { ...data.links, custom: e.target.value } as ResumeLinks })} 
              placeholder="e.g. yourblog.com"
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

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-6 relative group transition-all hover:shadow-md">
      <Button 
        size="icon" 
        className="absolute top-4 right-4 h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        onClick={() => setIsEditing(true)}
      >
        <Edit className="w-4 h-4" />
      </Button>
      
      <h3 className="text-xl font-bold text-foreground mb-4">{data.fullName || 'Your Name'}</h3>
      
      <div className="space-y-3 text-muted-foreground text-sm">
        {data.email && (
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground/50" />
            <span>{data.email}</span>
          </div>
        )}
        {data.phone && (
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-muted-foreground/50" />
            <span>{data.phone}</span>
          </div>
        )}
        {data.location && (
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground/50" />
            <span>{data.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
