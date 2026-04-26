'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Zap, Crown, User as UserIcon, UploadCloud, FileText, Trash2, Pencil, Plus, Sparkles } from 'lucide-react';

import { ProfileCompletionBar } from '@/components/ProfileCompletionBar';
import { MissingFieldsList, ProfileData } from '@/components/MissingFieldsList';
import { showToast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
const SOCIAL_PLATFORMS = ['Portfolio', 'LinkedIn', 'Twitter', 'GitHub', 'Other', 'Custom'];
const MULTIPLE_ALLOWED = ['Other', 'Custom'];

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [initialValues, setInitialValues] = useState<{ formData: any; skillsInput: string } | null>(null);
  
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    personalInfo: { firstName: '', lastName: '', phone: '', socials: [] as Array<{ platform: string; url: string; customName?: string }> },
    companyInfo: { companyName: '', website: '' },
    professionalInfo: { 
      jobTitle: '', 
      bio: '', 
      experience: '', 
      skills: [] as string[],
      projects: [] as Array<{ title: string; description: string }>,
      careerOpsProfile: ''
    },

  });



  const [skillsInput, setSkillsInput] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data.data) {
          const profile = response.data.data;
          setProfileData(profile);
          const cleanProjects = (profile.professionalInfo?.projects || []).map((p: any) => ({
            title: p.title || '',
            description: p.description || ''
          }));
          const cleanSocials = (profile.personalInfo?.socials || []).map((s: any) => ({
            platform: s.platform || 'LinkedIn',
            url: s.url || '',
            customName: s.customName || ''
          }));

          const initialData = {
            personalInfo: {
              firstName: profile.personalInfo?.firstName || '',
              lastName: profile.personalInfo?.lastName || '',
              phone: profile.personalInfo?.phone || '',
              socials: cleanSocials
            },
            companyInfo: {
              companyName: profile.companyInfo?.companyName || '',
              website: profile.companyInfo?.website || ''
            },
            professionalInfo: {
              jobTitle: profile.professionalInfo?.jobTitle || '',
              bio: profile.professionalInfo?.bio || '',
              experience: profile.professionalInfo?.experience || '',
              skills: profile.professionalInfo?.skills || [],
              projects: cleanProjects,
              careerOpsProfile: profile.professionalInfo?.careerOpsProfile || ''
            },

          };


          const initialSkills = profile.professionalInfo?.skills?.join(', ') || '';
          
          setFormData(initialData);
          setSkillsInput(initialSkills);
          setInitialValues({ formData: JSON.parse(JSON.stringify(initialData)), skillsInput: initialSkills });
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadedData = new FormData();
    uploadedData.append('resume', file);

    setIsUploadingResume(true);
    try {
      const res = await api.post('/profile/resume', uploadedData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120_000, // AI parsing can take up to 2min
      });
      const resumeDoc = res.data.data;
      showToast.success('Resume uploaded & parsed!');
      // Navigate to the resume editor with the new resume ID
      if (resumeDoc?._id || resumeDoc?.id) {
        router.push(`/dashboard/profile/resume/${resumeDoc._id || resumeDoc.id}`);
      } else {
        // Fallback: refresh profile data
        const profileRes = await api.get('/profile');
        setProfileData(profileRes.data.data);
      }
    } catch (err: any) {
      showToast.apiError(err, 'Failed to upload resume');
    } finally {
      setIsUploadingResume(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResumeDelete = async () => {
    setIsUploadingResume(true);
    try {
      const res = await api.delete('/profile/resume');
      setProfileData(res.data.data);
      showToast.success('Resume deleted successfully!');
    } catch (err: any) {
      showToast.apiError(err, 'Failed to delete resume');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleCreateEmptyResume = async () => {
    setIsUploadingResume(true);
    try {
      const res = await api.post('/resumes', { 
        profileType: 'My Master Resume',
        fullName: `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`.trim(),
        email: user?.email || '',
        phone: formData.personalInfo.phone || '',
        rawText: '# My Resume\n\n## Contact\n- Name: ' + (`${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`.trim() || 'Your Name')
      });
      const newResume = res.data.data;
      
      // Update profile with the new resume info (minimal)
      await api.put('/profile', { 
        resume: { 
          fileName: 'manual_entry.md',
          rawText: newResume.rawText,
          uploadedAt: new Date()
        } 
      });

      showToast.success('Created fresh resume template');
      router.push(`/dashboard/profile/resume/${newResume.id || newResume._id}`);
    } catch (err: any) {
      showToast.apiError(err, 'Failed to create resume');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);

    try {
      const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(s => s !== '');
      const payload = {
        ...formData,
        professionalInfo: { ...formData.professionalInfo, skills: skillsArray }
      };
      const response = await api.put('/profile', payload);
      const updatedProfile = response.data.data;
      setProfileData(updatedProfile);
      
      const cleanProjects = (updatedProfile.professionalInfo?.projects || []).map((p: any) => ({
        title: p.title || '',
        description: p.description || ''
      }));
      const cleanSocials = (updatedProfile.personalInfo?.socials || []).map((s: any) => ({
        platform: s.platform || 'LinkedIn',
        url: s.url || '',
        customName: s.customName || ''
      }));

      const newInitialData = {
        personalInfo: {
          firstName: updatedProfile.personalInfo?.firstName || '',
          lastName: updatedProfile.personalInfo?.lastName || '',
          phone: updatedProfile.personalInfo?.phone || '',
          socials: cleanSocials
        },
        companyInfo: {
          companyName: updatedProfile.companyInfo?.companyName || '',
          website: updatedProfile.companyInfo?.website || ''
        },
        professionalInfo: {
          jobTitle: updatedProfile.professionalInfo?.jobTitle || '',
          bio: updatedProfile.professionalInfo?.bio || '',
          experience: updatedProfile.professionalInfo?.experience || '',
          skills: updatedProfile.professionalInfo?.skills || [],
          projects: cleanProjects,
          careerOpsProfile: updatedProfile.professionalInfo?.careerOpsProfile || ''
        },

        resume: {
          rawText: updatedProfile.resume?.rawText || ''
        }
      };
      const newInitialSkills = updatedProfile.professionalInfo?.skills?.join(', ') || '';
      
      setInitialValues({ formData: JSON.parse(JSON.stringify(newInitialData)), skillsInput: newInitialSkills });
      showToast.success('Profile updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      showToast.apiError(err, 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const profileCompletion = profileData?.professionalInfo?.profileCompletion || 0;

  const hasChanges = initialValues ? (
    JSON.stringify(formData) !== JSON.stringify(initialValues.formData) ||
    skillsInput !== initialValues.skillsInput
  ) : false;

  if (fetching) {
    return <div className="space-y-4 max-w-4xl mx-auto p-8">
      <div className="h-8 bg-muted w-48 rounded animate-pulse"></div>
      <div className="grid gap-6 md:grid-cols-2">
         <div className="h-32 bg-muted rounded animate-pulse"></div>
         <div className="h-32 bg-muted rounded animate-pulse"></div>
      </div>
      <div className="h-96 bg-muted w-full rounded animate-pulse"></div>
    </div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage your account, plan, and professional details.
          </p>
        </div>
        
        <div className="w-full md:w-80">
          <ProfileCompletionBar completion={profileCompletion} size="md" />
        </div>
      </div>

      {/* Account Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-primary/20 via-background to-background border-primary/20 overflow-hidden relative group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Active Plan</CardTitle>
            {user?.plan === 'pro' ? <Crown className="h-4 w-4 text-primary" /> : <Zap className="h-4 w-4 text-primary" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black uppercase tracking-tighter">{user?.plan} Membership</div>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.plan === 'pro' ? 'Unlimited proposals & premium features' : 'Basic access with limited credits'}
            </p>
            {user?.plan === 'free' && (
              <Button size="sm" variant="outline" className="mt-4 border-primary/30 text-primary hover:bg-primary/10" asChild>
                <a href="/pricing">Upgrade to Pro</a>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Available Credits */}
        <Card className="bg-card/40 backdrop-blur-sm border-border overflow-hidden relative group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Available Credits</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">{user?.credits}</div>
            <p className="text-xs text-muted-foreground mt-1">Credits reset on your next billing cycle</p>
            <Button size="sm" variant="ghost" className="mt-4 text-primary hover:bg-primary/5" asChild>
               <a href="/pricing">Get more credits →</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion Checklist - Full Width */}
      <MissingFieldsList profile={profileData} variant="default" />

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          {/* Contact Information */}
          <Card className="bg-card/40 backdrop-blur-md border-border shadow-xl">
            <CardHeader className="border-b border-border/50 pb-6">
              <CardTitle className="text-xl flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                Contact Information
              </CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-base">First Name</Label>
                  <Input 
                    value={formData.personalInfo.firstName} 
                    onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, firstName: e.target.value}})}
                    placeholder="John"
                    className="h-12 bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Last Name</Label>
                  <Input 
                    value={formData.personalInfo.lastName} 
                    onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, lastName: e.target.value}})}
                    placeholder="Doe"
                    className="h-12 bg-background/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-base">Phone Number</Label>
                <Input 
                  value={formData.personalInfo.phone} 
                  onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, phone: e.target.value}})}
                  placeholder="+1 (555) 000-0000"
                  className="h-12 bg-background/50"
                />
              </div>
              
              {/* Professional Assets Section (Resume & Strategic Profile) */}
              <div className="space-y-4 pt-6 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg font-bold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Professional Assets
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">Manage your resume source and strategic profile data.</p>
                  </div>
                  {profileData?.resume?.rawText && (
                    <Button 
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={async () => {
                        try {
                          const resumeRes = await api.get('/resumes');
                          const resumes = resumeRes.data.data;
                          const masterResume = resumes.find((r: any) => r.profileType === 'My Master Resume') || resumes[0];
                          if (masterResume) {
                            router.push(`/dashboard/profile/resume/${masterResume.id || masterResume._id}`);
                          } else {
                            showToast.error('No master resume found.');
                          }
                        } catch {
                          showToast.error('Failed to load resume');
                        }
                      }}
                      className="h-9 px-4 text-xs font-bold gap-2 bg-primary hover:bg-primary/90"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit Resume MD
                    </Button>
                  )}
                </div>

                {!profileData?.resume?.rawText ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Option 1: Upload */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer p-8 border-2 border-dashed border-border/50 rounded-2xl flex items-center justify-center flex-col gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all bg-card/40 group"
                    >
                      <div className="p-4 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-foreground">Upload Resume</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX up to 5MB</p>
                      </div>
                    </div>

                    {/* Option 2: Manual */}
                    <div
                      onClick={handleCreateEmptyResume}
                      className="cursor-pointer p-8 border-2 border-dashed border-border/50 rounded-2xl flex items-center justify-center flex-col gap-3 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all bg-card/40 group"
                    >
                      <div className="p-4 bg-emerald-500/10 rounded-full group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-emerald-500" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-foreground">Add Markdown Manually</p>
                        <p className="text-xs text-muted-foreground mt-1">Start from a clean template</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 border border-primary/20 bg-primary/5 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="truncate pr-4">
                        <p className="text-sm font-semibold text-foreground truncate">Master Professional Assets</p>
                        <p className="text-xs text-primary font-medium">cv.md & profile.md are synced ✓</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleResumeDelete}
                        className="text-red-500 hover:bg-red-500/10 h-9 px-3 text-xs font-bold"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>




              {/* Social Links Section */}
              <div className="space-y-4 pt-6 border-t border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <Label className="text-base">Social Links</Label>
                    <p className="text-xs text-muted-foreground mt-1">Add your portfolio, LinkedIn, Twitter, GitHub, etc.</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const usedPlatforms = formData.personalInfo.socials.map(s => s.platform);
                      const availableOption = SOCIAL_PLATFORMS.find(p => MULTIPLE_ALLOWED.includes(p) || !usedPlatforms.includes(p)) || 'Other';
                      const newSocials = [...formData.personalInfo.socials, { platform: availableOption, url: '', customName: '' }];
                      setFormData({...formData, personalInfo: {...formData.personalInfo, socials: newSocials}});
                    }}
                    className="border-primary/30 text-primary hover:bg-primary/10 self-start sm:self-auto"
                  >
                    + Add Link
                  </Button>
                </div>

                {formData.personalInfo.socials.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-border/50 rounded-xl text-center">
                    <p className="text-sm text-muted-foreground">No social links added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.personalInfo.socials.map((social, index) => {
                      const usedPlatforms = formData.personalInfo.socials
                        .map(s => s.platform)
                        .filter(p => !MULTIPLE_ALLOWED.includes(p));

                      const availableOptions = SOCIAL_PLATFORMS.filter(
                        p => MULTIPLE_ALLOWED.includes(p) || !usedPlatforms.includes(p) || p === social.platform
                      );

                      return (
                      <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-background/30 p-4 rounded-xl border border-border/50 relative group">
                        <div className="space-y-2 w-full md:w-1/3">
                          <Label className="text-sm">Platform</Label>
                          <Select
                            value={social.platform}
                            disabled={social.url.trim().length > 0}
                            onValueChange={(value) => {
                              const newSocials = formData.personalInfo.socials.map((s, i) => 
                                i === index ? { ...s, platform: value, customName: value !== 'Custom' ? '' : s.customName } : s
                              );
                              setFormData({...formData, personalInfo: {...formData.personalInfo, socials: newSocials}});
                            }}
                          >
                            <SelectTrigger className="h-12 bg-background/50 border-input disabled:opacity-50">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableOptions.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {social.platform === 'Custom' && (
                          <div className="space-y-2 w-full md:w-1/3">
                            <Label className="text-sm">Custom Name</Label>
                            <Input
                              value={social.customName}
                              onChange={(e) => {
                                const newSocials = formData.personalInfo.socials.map((s, i) => 
                                  i === index ? { ...s, customName: e.target.value } : s
                                );
                                setFormData({...formData, personalInfo: {...formData.personalInfo, socials: newSocials}});
                              }}
                              placeholder="Platform name"
                              className="h-12 bg-background/50"
                            />
                          </div>
                        )}
                        <div className="space-y-2 w-full md:flex-grow">
                          <Label className="text-sm">URL</Label>
                          <Input
                            value={social.url}
                            onChange={(e) => {
                              const newSocials = formData.personalInfo.socials.map((s, i) => 
                                i === index ? { ...s, url: e.target.value } : s
                              );
                              setFormData({...formData, personalInfo: {...formData.personalInfo, socials: newSocials}});
                            }}
                            placeholder="https://"
                            className="h-12 bg-background/50"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            const newSocials = formData.personalInfo.socials.filter((_, i) => i !== index);
                            setFormData({...formData, personalInfo: {...formData.personalInfo, socials: newSocials}});
                          }}
                          className="absolute top-2 right-2 md:relative md:top-auto md:right-auto md:h-12 md:w-12 h-8 w-8 text-red-500 md:opacity-0 group-hover:opacity-100 md:bg-transparent bg-red-500/10 md:hover:bg-red-500/10 hover:bg-red-500/20 rounded-lg flex-shrink-0 transition-opacity flex items-center justify-center p-0"
                          title="Remove"
                        >
                          ✕
                        </Button>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Company Details */}
          <Card className="bg-card/40 backdrop-blur-md border-border shadow-xl">
            <CardHeader className="border-b border-border/50 pb-6">
              <CardTitle className="text-xl">Company Details</CardTitle>
              <CardDescription>Optional business information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-base">Company Name</Label>
                  <Input 
                    value={formData.companyInfo.companyName} 
                    onChange={e => setFormData({...formData, companyInfo: {...formData.companyInfo, companyName: e.target.value}})}
                    placeholder="Freelance Labs"
                    className="h-12 bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Website</Label>
                  <Input 
                    value={formData.companyInfo.website} 
                    onChange={e => setFormData({...formData, companyInfo: {...formData.companyInfo, website: e.target.value}})}
                    placeholder="https://..."
                    className="h-12 bg-background/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card className="bg-card/40 backdrop-blur-md border-border shadow-xl">
            <CardHeader className="border-b border-border/50 pb-6">
              <CardTitle className="text-xl flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                Professional Details
              </CardTitle>
              <CardDescription>Critical info for AI proposal generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label className="text-base">Job Title / Primary Role</Label>
                <Input 
                  value={formData.professionalInfo.jobTitle} 
                  onChange={e => setFormData({...formData, professionalInfo: {...formData.professionalInfo, jobTitle: e.target.value}})}
                  placeholder="e.g. Fullstack Developer"
                  className="h-12 bg-background/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-base">Bio / Professional Summary</Label>
                <textarea 
                  className="flex min-h-[150px] w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all"
                  value={formData.professionalInfo.bio} 
                  onChange={e => setFormData({...formData, professionalInfo: {...formData.professionalInfo, bio: e.target.value}})}
                  placeholder="Describe your expertise, values, and what clients love about working with you..."
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-base">Experience Level</Label>
                  <Input 
                    value={formData.professionalInfo.experience} 
                    onChange={e => setFormData({...formData, professionalInfo: {...formData.professionalInfo, experience: e.target.value}})}
                    placeholder="e.g. 5+ Years in Digital Design"
                    className="h-12 bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Skills (Comma separated)</Label>
                  <Input 
                    value={skillsInput} 
                    onChange={e => setSkillsInput(e.target.value)}
                    placeholder="React, AWS, Branding, Figma"
                    className="h-12 bg-background/50"
                  />
                </div>
              </div>

              {/* Projects Section */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Portfolio Projects</Label>
                    <p className="text-xs text-muted-foreground mt-1">Add at least 1 project to improve your profile completion</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newProjects = [...formData.professionalInfo.projects, { title: '', description: '' }];
                      setFormData({...formData, professionalInfo: {...formData.professionalInfo, projects: newProjects}});
                    }}
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    + Add Project
                  </Button>
                </div>

                {formData.professionalInfo.projects.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-border/50 rounded-xl text-center">
                    <p className="text-sm text-muted-foreground">No projects added yet. Click "Add Project" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.professionalInfo.projects.map((project, index) => (
                      <div key={index} className="p-4 bg-background/50 border border-border/50 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">Project {index + 1}</Label>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newProjects = formData.professionalInfo.projects.filter((_, i) => i !== index);
                              setFormData({...formData, professionalInfo: {...formData.professionalInfo, projects: newProjects}});
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 h-9 font-bold transition-all shadow-sm shadow-red-900/20 m-0"
                          >
                            Remove
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Project Title</Label>
                          <Input
                            value={project.title}
                            onChange={e => {
                              const newProjects = formData.professionalInfo.projects.map((p, i) => 
                                i === index ? { ...p, title: e.target.value } : p
                              );
                              setFormData({...formData, professionalInfo: {...formData.professionalInfo, projects: newProjects}});
                            }}
                            placeholder="e.g. E-commerce Platform Redesign"
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Project Description</Label>
                          <textarea
                            value={project.description}
                            onChange={e => {
                              const newProjects = formData.professionalInfo.projects.map((p, i) => 
                                i === index ? { ...p, description: e.target.value } : p
                              );
                              setFormData({...formData, professionalInfo: {...formData.professionalInfo, projects: newProjects}});
                            }}
                            placeholder="Describe the project, your role, technologies used, and the impact..."
                            className="flex min-h-[100px] w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              size="xl" 
              disabled={loading || !hasChanges} 
              className="px-12 font-bold shadow-lg shadow-primary/20 relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Save Changes
              {!loading && hasChanges && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-500 to-primary bg-[length:400%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
