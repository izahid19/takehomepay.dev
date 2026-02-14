'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useFormik } from 'formik';
import { resetPasswordSchema } from '@/lib/validations/reset-password';
import { showToast } from '@/lib/toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('resetEmail');
    if (!savedEmail) {
      router.push('/forgot-password');
    } else {
      setEmail(savedEmail);
    }
  }, [router]);

  const formik = useFormik({
    initialValues: {
      otp: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await api.post('/auth/reset-password', { 
          email, 
          otp: values.otp, 
          password: values.password 
        });
        setSuccess(true);
        sessionStorage.removeItem('resetEmail');
        showToast.success('Password reset successfully!');
        
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (err: any) {
        showToast.apiError(err, 'Failed to reset password. The code may be invalid or expired.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background pointer-events-none" />
      
      <Card className="w-full max-w-md border-border bg-card/50 backdrop-blur-xl relative">
        <CardHeader className="space-y-1">
          {!success && (
            <div className="flex items-center mb-2">
              <Link href="/forgot-password" className="text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1 inline" />
                <span className="text-sm">Change email</span>
              </Link>
            </div>
          )}
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            {success 
              ? "Your password has been successfully updated." 
              : `Enter the 6-digit code sent to ${email} and your new password.`}
          </CardDescription>
        </CardHeader>
        {!success ? (
          <form onSubmit={formik.handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="flex items-center gap-1">
                  Verification Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={formik.values.otp}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`bg-background/50 text-center tracking-[0.5em] text-xl font-bold ${formik.touched.otp && formik.errors.otp ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {formik.touched.otp && formik.errors.otp && (
                  <p className="text-xs text-destructive mt-1">{formik.errors.otp}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" title="Password" className="flex items-center gap-1">
                  New Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
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
                  Confirm New Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
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
            <CardFooter>
              <Button className="w-full h-11 text-base font-medium" type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <p className="text-lg font-semibold mb-2">Password Reset Successful!</p>
            <p className="text-sm text-muted-foreground">Redirecting you to login...</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

