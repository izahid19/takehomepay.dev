export interface ResumeLinks {
  github: string;
  linkedin: string;
  leetcode: string;
  portfolio: string;
  twitter?: string;
  custom?: string;
  [key: string]: string | undefined;
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
