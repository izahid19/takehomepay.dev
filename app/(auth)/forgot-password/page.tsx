'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useFormik } from 'formik';
import { forgotPasswordSchema } from '@/lib/validations/forgot-password';
import { showToast } from '@/lib/toast';

export default function ForgotPasswordPage() {

  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await api.post('/auth/forgot-password', values);
        setSuccess(true);
        // Store email in sessionStorage to use on the reset page
        sessionStorage.setItem('resetEmail', values.email);
        
        // Delay redirect to show success message
        setTimeout(() => {
          router.push('/reset-password');
        }, 2000);
      } catch (err: any) {
        showToast.apiError(err, 'Something went wrong. Please try again.');
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
          <div className="flex items-center mb-2">
            <Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1 inline" />
              <span className="text-sm">Back to login</span>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            {success 
              ? "We've sent a verification code to your email." 
              : "Enter your email address and we'll send you a 6-digit code to reset your password."}
          </CardDescription>
        </CardHeader>
        {!success ? (
          <form onSubmit={formik.handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`bg-background/50 ${formik.touched.email && formik.errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-xs text-destructive mt-1">{formik.errors.email}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full h-11 text-base font-medium" type="submit" disabled={formik.isSubmitting}>
                {formik.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Code
              </Button>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            </div>
            <p className="text-sm font-medium">Redirecting to code verification...</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

