'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save, Zap, Crown, User as UserIcon } from 'lucide-react';
import { ProfileCompletionBar } from '@/components/ProfileCompletionBar';
import { MissingFieldsList, ProfileData } from '@/components/MissingFieldsList';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const [formData, setFormData] = useState({
    personalInfo: { firstName: '', lastName: '', phone: '' },
    companyInfo: { companyName: '', website: '' },
    professionalInfo: { 
      jobTitle: '', 
      bio: '', 
      experience: '', 
      skills: [] as string[],
      projects: [] as Array<{ title: string; description: string }>
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
          setFormData({
            personalInfo: profile.personalInfo || { firstName: '', lastName: '', phone: '' },
            companyInfo: profile.companyInfo || { companyName: '', website: '' },
            professionalInfo: {
              jobTitle: profile.professionalInfo?.jobTitle || '',
              bio: profile.professionalInfo?.bio || '',
              experience: profile.professionalInfo?.experience || '',
              skills: profile.professionalInfo?.skills || [],
              projects: profile.professionalInfo?.projects || []
            },
          });
          setSkillsInput(profile.professionalInfo?.skills?.join(', ') || '');
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(s => s !== '');
      const payload = {
        ...formData,
        professionalInfo: { ...formData.professionalInfo, skills: skillsArray }
      };
      const response = await api.put('/profile', payload);
      setProfileData(response.data.data);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const profileCompletion = profileData?.professionalInfo?.profileCompletion || 0;

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
        {success && (
          <div className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-xl font-medium animate-in fade-in slide-in-from-top-2">
            Profile updated successfully!
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive-foreground rounded-xl font-medium">
            {error}
          </div>
        )}

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
                              const newProjects = [...formData.professionalInfo.projects];
                              newProjects[index].title = e.target.value;
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
                              const newProjects = [...formData.professionalInfo.projects];
                              newProjects[index].description = e.target.value;
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
            <Button type="submit" size="xl" disabled={loading} className="px-12 font-bold shadow-lg shadow-primary/20 relative group overflow-hidden">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Save Changes
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-500 to-primary bg-[length:400%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
