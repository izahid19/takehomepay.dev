import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ResumeEditorData } from '../types';
import { Edit, Check, AlignLeft, Sparkles, BookOpen, Scissors } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface Props {
  data: ResumeEditorData;
  onChange: (data: Partial<ResumeEditorData>) => void;
}

export function SummarySection({ data, onChange }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Edit Professional Summary</h2>
          {/* <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2 rounded-full hidden sm:flex">
            <Sparkles className="w-4 h-4" /> Get Tips
          </Button> */}
        </div>
        
        <div className="space-y-4">
          <RichTextEditor
            value={data.professionalSummary || ''}
            onChange={(value) => onChange({ professionalSummary: value })}
            placeholder="e.g. Software engineer with 2+ years of experience..."
          />
          
          {/* AI Feature Buttons (Mocked visually as requested) */}
          {/* <div className="flex flex-wrap items-center gap-2 pt-2">
            <div className="bg-primary/10 text-primary p-2 rounded-full mr-2">
              <Sparkles className="w-4 h-4" />
            </div>
            <Button variant="secondary" size="sm" className="bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg">
              Improve Writing
            </Button>
            <Button variant="secondary" size="sm" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg">
              <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Grammar Check
            </Button>
            <Button variant="secondary" size="sm" className="bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg">
              <Scissors className="w-3.5 h-3.5 mr-1.5" /> Shorter
            </Button>
          </div> */}
          
          <div className="pt-4 flex justify-center border-t border-border/50 mt-4">
            <Button 
              className="w-full sm:w-auto min-w-[200px] h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-sm transition-all"
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
      
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-muted p-2 rounded-lg text-muted-foreground"><AlignLeft className="w-4 h-4" /></div>
        <h3 className="text-lg font-bold text-foreground">Professional Summary</h3>
      </div>
      
      {data.professionalSummary ? (
        <div 
          className="text-muted-foreground text-sm leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-500 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: data.professionalSummary }}
        />
      ) : (
        <span className="text-muted-foreground/50 italic text-sm">No summary added yet.</span>
      )}
    </div>
  );
}
