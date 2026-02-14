'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mail, Eye, EyeOff } from 'lucide-react';

import Cookies from 'js-cookie';
import { showToast } from '@/lib/toast';
import { useFormik } from 'formik';
import { signupSchema } from '@/lib/validations/signup';

export default function SignupPage() {

  const router = useRouter();
  const [step, setStep] = useState<'signup' | 'verify'>('signup');
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: signupSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await api.post('/auth/request-otp', {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password
        });
        showToast.success('OTP sent to your email! Please check your inbox.');
        setStep('verify');
      } catch (err: any) {
        showToast.apiError(err, 'Failed to send OTP. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    
    try {
      const response = await api.post('/auth/verify-otp', { 
        email: formik.values.email, 
        otp 
      });
      
      if (response.data.token) {
        Cookies.set('access_token', response.data.token, { expires: 1, path: '/' });
      }
      
      login(response.data.user);
      showToast.success('Account created successfully!');
      router.push('/onboarding');
    } catch (err: any) {
      showToast.apiError(err, 'Invalid OTP. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-background to-background pointer-events-none" />
      
      <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-xl relative">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {step === 'signup' ? 'Create Account' : 'Verify Email'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'signup' 
              ? 'Sign up to start winning more clients with AI proposals'
              : 'Enter the 6-digit code sent to your email'
            }
          </CardDescription>
        </CardHeader>

        {step === 'signup' ? (
          <form onSubmit={formik.handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-1">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`bg-background/50 ${formik.touched.firstName && formik.errors.firstName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-[10px] text-destructive mt-1">{formik.errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center gap-1">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`bg-background/50 ${formik.touched.lastName && formik.errors.lastName ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="text-[10px] text-destructive mt-1">{formik.errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jhon@gmail.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`bg-background/50 ${formik.touched.email && formik.errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-xs text-destructive mt-1">{formik.errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" title="Password" className="flex items-center gap-1">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Must be at least 8 characters"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`bg-background/50 pr-10 ${formik.touched.password && formik.errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-xs text-destructive mt-1">{formik.errors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" title="Confirm Password" className="flex items-center gap-1">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`bg-background/50 pr-10 ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">{formik.errors.confirmPassword}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button className="w-full h-11 text-base font-medium" type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {formik.isSubmitting ? 'Sending OTP...' : 'Get Started'}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center py-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  We sent a verification code to
                </p>
                <p className="font-medium">{formik.values.email}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="flex items-center gap-1">
                  Verification Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  className="bg-background/50 text-center text-2xl tracking-widest font-mono"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button className="w-full h-11 text-base font-medium" type="submit" disabled={verifying || otp.length !== 6}>
                {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {verifying ? 'Verifying...' : 'Verify & Create Account'}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setStep('signup');
                    setOtp('');
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  Try again
                </button>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

