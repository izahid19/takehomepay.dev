import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ResumeEditorData } from '../types';
import { Edit, Check, FolderGit2, Plus, Trash2, Github, ExternalLink } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface Props {
  data: ResumeEditorData;
  onChange: (data: Partial<ResumeEditorData>) => void;
}

export function ProjectsSection({ data, onChange }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Edit Projects</h2>
        </div>
        
        <div className="space-y-6">
          {(data.projects || []).map((proj, index) => (
            <div key={index} className="p-5 border border-border rounded-xl relative bg-muted/50/50 group">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10" 
                onClick={() => {
                  const newProj = [...data.projects];
                  newProj.splice(index, 1);
                  onChange({ projects: newProj });
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              
              <div className="space-y-4 mb-4 pr-8">
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold text-foreground/80">Project Title</Label>
                  <Input 
                    className="bg-card border-transparent shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary h-10"
                    value={proj.title || ''} 
                    onChange={e => {
                      const newProj = [...data.projects]; newProj[index].title = e.target.value; onChange({ projects: newProj });
                    }} 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-bold text-foreground/80">GitHub Link</Label>
                    <Input 
                      className="bg-card border-transparent shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary h-10"
                      value={proj.links?.github || ''} 
                      onChange={e => {
                        const newProj = [...data.projects]; newProj[index].links = {...newProj[index].links, github: e.target.value}; onChange({ projects: newProj });
                      }} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-bold text-foreground/80">Live Link</Label>
                    <Input 
                      className="bg-card border-transparent shadow-sm focus-visible:ring-primary/20 focus-visible:border-primary h-10"
                      value={proj.links?.live || ''} 
                      onChange={e => {
                        const newProj = [...data.projects]; newProj[index].links = {...newProj[index].links, live: e.target.value}; onChange({ projects: newProj });
                      }} 
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-sm font-bold text-foreground/80">Description & Tech Stack</Label>
                  <p className="text-xs text-muted-foreground/70 mb-1">List your achievements and include "Tech Stack: ..." at the end.</p>
                  <RichTextEditor
                    value={`<ul>${(proj.description || []).map(b => `<li>${b}</li>`).join('')}</ul>${proj.technologyStack?.length ? `<p><strong>Tech Stack:</strong> ${proj.technologyStack.join(', ')}</p>` : ''}`}
                    onChange={html => {
                      const tempDiv = document.createElement('div');
                      tempDiv.innerHTML = html;
                      
                      // Extract description bullet points
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
                      
                      const newProj = [...data.projects];
                      newProj[index].description = items;
                      newProj[index].technologyStack = techStack;
                      onChange({ projects: newProj });
                    }}
                    placeholder="e.g. Developed and maintained 3 production web applications...&#10;&#10;Tech Stack: React, Node.js"
                    minHeight="180px"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full border-dashed border-2 h-12 text-muted-foreground hover:text-foreground hover:bg-muted/50" 
            onClick={() => onChange({ projects: [...(data.projects || []), {title: '', description: [], technologyStack: [], links: {github: '', live: '', demo: ''}}] })}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Button>
          
          <div className="pt-4 flex justify-center">
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

  const hasProjects = data.projects && data.projects.length > 0;

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
        <div className="bg-muted p-2 rounded-lg text-muted-foreground"><FolderGit2 className="w-4 h-4" /></div>
        <h3 className="text-lg font-bold text-foreground">Projects</h3>
      </div>
      
      {!hasProjects && <p className="text-muted-foreground/50 text-sm italic">No projects added yet.</p>}
      
      {hasProjects && (
        <div className="space-y-6">
          {data.projects.map((proj, idx) => (
            <div key={idx} className="relative pl-4 border-l-2 border-border/50">
              <div className="absolute w-2.5 h-2.5 bg-border rounded-full -left-[6px] top-1.5" />
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
                <h4 className="font-bold text-foreground">{proj.title || 'Project Title'}</h4>
                <div className="flex items-center gap-3 mt-1 sm:mt-0">
                  {proj.links?.github && (
                    <a href={proj.links.github} target="_blank" rel="noreferrer" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {proj.links?.live && (
                    <a href={proj.links.live} target="_blank" rel="noreferrer" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              {proj.technologyStack && proj.technologyStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {proj.technologyStack.filter(Boolean).map((tech, i) => (
                    <span key={i} className="text-[10px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {proj.description && proj.description.length > 0 && (
                <ul className="list-disc list-outside ml-4 text-sm text-muted-foreground space-y-1">
                  {proj.description.filter(Boolean).map((bullet, i) => (
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
