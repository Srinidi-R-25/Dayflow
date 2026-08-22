'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Mail, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function VerifyEmailForm() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'alex.morgan@dayflow.com';
  const router = useRouter();
  const { role } = useAuth();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsVerified(true);
    }, 1200);
  };

  const handleProceed = () => {
    if (role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          <Mail className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Verify your email</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          We sent a verification code to <span className="font-semibold text-slate-900 dark:text-slate-200">{email}</span>
        </p>
      </div>

      <Card className="border-slate-200/80 shadow-xl dark:border-slate-800">
        <CardHeader className="pb-4 text-center">
          <CardTitle>{isVerified ? 'Email Verified Successfully!' : 'Enter 6-Digit Code'}</CardTitle>
          <CardDescription>
            {isVerified
              ? 'Your email address has been verified. You can now access your Dayflow portal.'
              : 'Enter the code sent to your inbox to complete registration.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isVerified ? (
            <>
              <div className="flex justify-between gap-2">
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`code-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    className="h-12 w-12 rounded-xl border border-slate-300 bg-white text-center text-lg font-bold text-slate-900 shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white transition-all"
                  />
                ))}
              </div>

              <Button
                onClick={handleVerify}
                className="w-full"
                isLoading={loading}
                disabled={code.some(c => !c)}
              >
                Verify Email
              </Button>

              <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                Didn&apos;t receive the code?{' '}
                {resendTimer > 0 ? (
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    onClick={() => setResendTimer(30)}
                    className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <RefreshCw className="h-3 w-3" /> Resend Code
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle className="h-10 w-10" />
              </div>
              <Button onClick={handleProceed} className="w-full gap-2">
                Continue to Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <Suspense fallback={<div className="text-sm font-medium text-slate-500">Loading...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
