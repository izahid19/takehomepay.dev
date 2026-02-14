'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileCompletionBar } from '@/components/ProfileCompletionBar';
import { 
  Loader2, 
  User, 
  Building2, 
  Briefcase, 
  FolderKanban, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User, description: 'Tell us about yourself' },
  { id: 2, title: 'Company Info', icon: Building2, description: 'Your business details' },
  { id: 3, title: 'Professional Info', icon: Briefcase, description: 'Your expertise' },
  { id: 4, title: 'Projects & Skills', icon: FolderKanban, description: 'Showcase your work' },
  { id: 5, title: 'Review & Finish', icon: CheckCircle2, description: 'Complete your profile' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Form data
  const [formData, setFormData] = useState({
    personalInfo: { firstName: '', lastName: '', phone: '' },
    companyInfo: { companyName: '', website: '' },
    professionalInfo: { jobTitle: '', bio: '', experience: '', skills: [] as string[] },
    projects: [] as Array<{ title: string; description: string }>,
  });

  const [skillsInput, setSkillsInput] = useState('');

  // Load existing profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Fetch user data to get firstName and lastName
        const userResponse = await api.get('/auth/me');
        const userData = userResponse.data.user;
        
        // Fetch profile data
        const response = await api.get('/profile');
        if (response.data.data) {
          const profile = response.data.data;
          setFormData({
            personalInfo: {
              firstName: profile.personalInfo?.firstName || userData.firstName || '',
              lastName: profile.personalInfo?.lastName || userData.lastName || '',
              phone: profile.personalInfo?.phone || '',
            },
            companyInfo: profile.companyInfo || { companyName: '', website: '' },
            professionalInfo: {
              jobTitle: profile.professionalInfo?.jobTitle || '',
              bio: profile.professionalInfo?.bio || '',
              experience: profile.professionalInfo?.experience || '',
              skills: profile.professionalInfo?.skills || [],
            },
            projects: profile.professionalInfo?.projects || [],
          });
          setSkillsInput(profile.professionalInfo?.skills?.join(', ') || '');
          setProfileCompletion(profile.professionalInfo?.profileCompletion || 0);
        } else {
          // No profile exists, use user data
          setFormData({
            personalInfo: {
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              phone: '',
            },
            companyInfo: { companyName: '', website: '' },
            professionalInfo: { jobTitle: '', bio: '', experience: '', skills: [] },
            projects: [],
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const saveStep = async () => {
    setSaving(true);
    try {
      const updateData: any = {};

      if (currentStep === 1) {
        updateData.personalInfo = formData.personalInfo;
      } else if (currentStep === 2) {
        updateData.companyInfo = formData.companyInfo;
      } else if (currentStep === 3) {
        updateData.professionalInfo = {
          jobTitle: formData.professionalInfo.jobTitle,
          bio: formData.professionalInfo.bio,
          experience: formData.professionalInfo.experience,
        };
      } else if (currentStep === 4) {
        const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
        updateData.professionalInfo = {
          ...formData.professionalInfo,
          skills,
          projects: formData.projects,
        };
      }

      const response = await api.put('/profile', updateData);
      if (response.data.data?.professionalInfo?.profileCompletion !== undefined) {
        setProfileCompletion(response.data.data.professionalInfo.profileCompletion);
      }
      return true;
    } catch (err) {
      console.error('Failed to save profile', err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    // Validate required fields
    if (!validateCurrentStep()) {
      return;
    }

    const saved = await saveStep();
    if (saved && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    const saved = await saveStep();
    if (saved) {
      if (profileCompletion >= 80) {
        router.push('/dashboard/proposals/new');
      } else {
        router.push('/dashboard/profile');
      }
    }
  };

  const countWords = (str: string) => {
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      const { firstName, lastName, phone } = formData.personalInfo;
      return firstName.trim() !== '' && lastName.trim() !== '' && phone.trim().length >= 10;
    }
    
    if (currentStep === 2) {
      const { companyName, website } = formData.companyInfo;
      return companyName.trim() !== '' && website.trim() !== '';
    }

    if (currentStep === 3) {
      const { jobTitle, bio, experience } = formData.professionalInfo;
      return (
        jobTitle.trim().length > 8 && 
        countWords(bio) >= 30 && 
        experience.trim() !== ''
      );
    }

    if (currentStep === 4) {
      const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
      const hasValidProjects = formData.projects.length > 0 && formData.projects.every(p => 
        p.title.trim().length > 8 && countWords(p.description) >= 30
      );
      return skills.length >= 3 && hasValidProjects;
    }
    
    return true;
  };


  const addProject = () => {
    setFormData({
      ...formData,
      projects: [...formData.projects, { title: '', description: '' }],
    });
  };

  const removeProject = (index: number) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index),
    });
  };

  const updateProject = (index: number, field: 'title' | 'description', value: string) => {
    const newProjects = [...formData.projects];
    newProjects[index][field] = value;
    setFormData({ ...formData, projects: newProjects });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to TakeHomePay! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Let's set up your profile to start generating winning proposals
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProfileCompletionBar completion={profileCompletion} showLabel size="lg" />
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? 'bg-primary border-primary text-primary-foreground'
                          : isCompleted
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-muted border-border text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-center mt-2 hidden md:block">
                      <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-all ${
                        isCompleted ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-card/50 backdrop-blur-xl border-border shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      First Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.personalInfo.firstName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, firstName: e.target.value },
                        })
                      }
                      placeholder="John"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      Last Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.personalInfo.lastName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalInfo: { ...formData.personalInfo, lastName: e.target.value },
                        })
                      }
                      placeholder="Doe"
                      className="h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2 relative phone-input-container">
                  <style jsx global>{`
                    .phone-input-container .react-tel-input .form-control {
                      width: 100% !important;
                      height: 3rem !important;
                      background: rgba(var(--background), 0.5) !important;
                      background-color: #0a0a0a !important;
                      border: 1px solid hsl(var(--border)) !important;
                      border-radius: 0.75rem !important;
                      color: hsl(var(--foreground)) !important;
                      font-size: 0.875rem !important;
                      padding-left: 48px !important;
                    }
                    .phone-input-container .react-tel-input .flag-dropdown {
                      background: transparent !important;
                      border: none !important;
                      border-radius: 0.75rem 0 0 0.75rem !important;
                    }
                    .phone-input-container .react-tel-input .selected-flag {
                      background: transparent !important;
                      width: 40px !important;
                      padding: 0 0 0 12px !important;
                    }
                    .phone-input-container .react-tel-input .selected-flag:hover,
                    .phone-input-container .react-tel-input .selected-flag:focus {
                      background: rgba(255, 255, 255, 0.05) !important;
                    }
                    .phone-input-container .react-tel-input .country-list {
                      background-color: #0a0a0a !important;
                      border: 1px solid hsl(var(--border)) !important;
                      color: #fff !important;
                      border-radius: 0.75rem !important;
                      margin-top: 4px !important;
                      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
                    }
                    .phone-input-container .react-tel-input .country-list .country:hover {
                      background-color: rgba(var(--primary), 0.1) !important;
                    }
                    .phone-input-container .react-tel-input .country-list .country.highlight {
                      background-color: rgba(var(--primary), 0.2) !important;
                    }
                  `}</style>
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <PhoneInput
                    country={'us'}
                    value={formData.personalInfo.phone}
                    onChange={(phone) =>
                      setFormData({
                        ...formData,
                        personalInfo: { ...formData.personalInfo, phone },
                      })
                    }
                    inputProps={{
                      id: 'phone',
                      required: true,
                    }}
                    containerClass="w-full"
                    buttonClass="hover:bg-transparent"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Company Info */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyInfo.companyName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyInfo: { ...formData.companyInfo, companyName: e.target.value },
                      })
                    }
                    placeholder="Freelance Labs"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">
                    Website <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="website"
                    value={formData.companyInfo.website}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        companyInfo: { ...formData.companyInfo, website: e.target.value },
                      })
                    }
                    placeholder="https://..."
                    className="h-12"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Professional Info */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">
                    Job Title / Primary Role <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="jobTitle"
                    value={formData.professionalInfo.jobTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        professionalInfo: { ...formData.professionalInfo, jobTitle: e.target.value },
                      })
                    }
                    placeholder="e.g. Fullstack Developer"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <Label htmlFor="bio">
                      Professional Bio <span className="text-destructive">*</span>
                    </Label>
                    <span className={`text-[10px] ${countWords(formData.professionalInfo.bio) >= 30 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                      {countWords(formData.professionalInfo.bio)} / 30 words
                    </span>
                  </div>
                  <textarea
                    id="bio"
                    value={formData.professionalInfo.bio}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        professionalInfo: { ...formData.professionalInfo, bio: e.target.value },
                      })
                    }
                    placeholder="Describe your expertise, values, and what clients love about working with you..."
                    className="flex min-h-[150px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all"
                  />
                  <p className="text-xs text-muted-foreground">Tell your story to attract high-paying clients (Min 30 words)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">
                    Experience Level <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="experience"
                    value={formData.professionalInfo.experience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        professionalInfo: { ...formData.professionalInfo, experience: e.target.value },
                      })
                    }
                    placeholder="e.g. 5+ Years in Digital Design"
                    className="h-12"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Projects & Skills */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="skills">
                    Skills <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="skills"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="React, AWS, Branding, Figma"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">Comma separated, add at least 3 skills</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Portfolio Projects <span className="text-destructive">*</span></Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add at least 1 detailed project
                      </p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={addProject}>
                      + Add Project
                    </Button>
                  </div>

                  {formData.projects.length === 0 ? (
                    <div className="p-6 border-2 border-dashed border-border rounded-xl text-center">
                      <p className="text-sm text-destructive font-medium">
                        At least one project is required to proceed.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.projects.map((project, index) => (
                        <div key={index} className="p-4 bg-muted/50 border border-border rounded-xl space-y-4 shadow-inner">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Project {index + 1}</Label>
                            {formData.projects.length > 1 && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeProject(index)}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 h-9 font-bold transition-all shadow-sm shadow-red-900/20 m-0"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">
                              Project Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              value={project.title}
                              onChange={(e) => updateProject(index, 'title', e.target.value)}
                              placeholder="e.g. E-commerce Platform Redesign"
                            />
                            <p className="text-[10px] text-muted-foreground">Minimum 8 characters</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-end">
                              <Label className="text-sm">
                                Project Description <span className="text-destructive">*</span>
                              </Label>
                              <span className={`text-[10px] ${countWords(project.description) >= 30 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                {countWords(project.description)} / 30 words
                              </span>
                            </div>
                            <textarea
                              value={project.description}
                              onChange={(e) => updateProject(index, 'description', e.target.value)}
                              placeholder="Describe the project, your role, technologies used, and the impact..."
                              className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all font-sans"
                            />
                            <p className="text-[10px] text-muted-foreground">Minimum 30 words required</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* Step 5: Review & Finish */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Almost There!</h3>
                  <p className="text-muted-foreground mb-6">
                    Your profile is <span className="font-bold text-primary">{profileCompletion}%</span> complete
                  </p>

                  {profileCompletion >= 80 ? (
                    <div className="p-6 bg-primary/10 border border-primary/30 rounded-xl">
                      <p className="text-primary font-medium mb-2">🎉 Great job!</p>
                      <p className="text-sm text-muted-foreground">
                        Your profile meets the minimum requirements. You can now generate AI proposals!
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-left">
                          <p className="text-amber-600 dark:text-amber-400 font-medium mb-2">
                            Profile completion below 80%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            You can continue, but proposal generation will be locked until you reach 80% completion.
                            You can complete your profile anytime from the Profile page.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-semibold">Profile Summary:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">
                        {formData.personalInfo.firstName} {formData.personalInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Job Title</p>
                      <p className="font-medium">{formData.professionalInfo.jobTitle || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Skills</p>
                      <p className="font-medium">{skillsInput.split(',').filter(Boolean).length || 0} skills</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Projects</p>
                      <p className="font-medium">{formData.projects.length} projects</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || saving}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={saving || !validateCurrentStep()}
                  className="gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button type="button" onClick={handleFinish} disabled={saving} className="gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Finishing...
                    </>
                  ) : (
                    <>
                      Finish Setup
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
