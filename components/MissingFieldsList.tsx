import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ProfileData {
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  professionalInfo?: {
    jobTitle?: string;
    bio?: string;
    experience?: string;
    skills?: string[];
    projects?: Array<{
      title?: string;
      description?: string;
    }>;
    profileCompletion?: number;
  };
}

interface MissingField {
  label: string;
  isMissing: boolean;
  weight: number;
  description: string;
}

interface MissingFieldsListProps {
  profile: ProfileData | null;
  variant?: 'default' | 'compact';
}

export function MissingFieldsList({ profile, variant = 'default' }: MissingFieldsListProps) {
  const BIO_MIN_LENGTH = 50;
  const SKILLS_MIN_COUNT = 3;
  const PROJECTS_MIN_COUNT = 1;

  const fields: MissingField[] = [
    {
      label: 'First Name',
      isMissing: !profile?.personalInfo?.firstName?.trim(),
      weight: 10,
      description: 'Your first name for personalization'
    },
    {
      label: 'Job Title',
      isMissing: !profile?.professionalInfo?.jobTitle?.trim(),
      weight: 15,
      description: 'Your primary role or profession'
    },
    {
      label: 'Professional Bio',
      isMissing: !profile?.professionalInfo?.bio || 
                 profile.professionalInfo.bio.trim().length < BIO_MIN_LENGTH,
      weight: 20,
      description: `At least ${BIO_MIN_LENGTH} characters describing your expertise`
    },
    {
      label: 'Experience Level',
      isMissing: !profile?.professionalInfo?.experience?.trim(),
      weight: 10,
      description: 'Years of experience or expertise level'
    },
    {
      label: `At least ${SKILLS_MIN_COUNT} Skills`,
      isMissing: !profile?.professionalInfo?.skills || 
                 profile.professionalInfo.skills.length < SKILLS_MIN_COUNT,
      weight: 20,
      description: 'Your key technical or professional skills'
    },
    {
      label: `At least ${PROJECTS_MIN_COUNT} Project`,
      isMissing: !profile?.professionalInfo?.projects || 
                 profile.professionalInfo.projects.length < PROJECTS_MIN_COUNT ||
                 !profile.professionalInfo.projects.some(p => p.title?.trim() && p.description?.trim()),
      weight: 25,
      description: 'A portfolio project with title and description'
    }
  ];

  const missingFields = fields.filter(f => f.isMissing);
  const completedFields = fields.filter(f => !f.isMissing);
  const totalMissingWeight = missingFields.reduce((sum, f) => sum + f.weight, 0);

  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        {missingFields.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">All required fields completed!</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>Missing {totalMissingWeight}% to complete:</span>
            </div>
            <ul className="space-y-1.5 ml-6">
              {missingFields.map((field, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <XCircle className="w-3.5 h-3.5 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">{field.label}</span>
                    <span className="text-xs ml-1">({field.weight}%)</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          {missingFields.length === 0 ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Profile Complete
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Profile Checklist
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {missingFields.length === 0 ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              🎉 Excellent! Your profile is fully optimized for AI proposal generation.
            </p>
          </div>
        ) : (
          <>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                Complete these fields to reach 100% and get the best AI results:
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Missing ({totalMissingWeight}% remaining)
              </p>
              <ul className="space-y-2">
                {missingFields.map((field, idx) => (
                  <li 
                    key={idx} 
                    className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/10 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm text-foreground">{field.label}</span>
                        <span className="text-xs font-bold text-destructive">{field.weight}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{field.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {completedFields.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Completed ✓
                </p>
                <ul className="space-y-1.5">
                  {completedFields.map((field, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{field.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
