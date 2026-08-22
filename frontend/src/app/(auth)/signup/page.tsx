'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Shield, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function SignupPage() {
  const [employeeId, setEmployeeId] = useState('EMP006');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const router = useRouter();

  // Security rule checks
  const isMinLength = password.length >= 8;
  const hasDigit = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!employeeId || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isMinLength || !hasDigit || !hasUpper) {
      setError('Password must satisfy all security requirements.');
      return;
    }

    setLoading(true);
    try {
      const success = await signup(employeeId, email, role);
      if (success) {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-lg shadow-indigo-600/30">
            D
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Dayflow Account</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Join your organization&apos;s HR portal</p>
        </div>

        <Card className="border-slate-200/80 shadow-xl dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Enter your employee details below</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Employee ID"
                placeholder="e.g. EMP006"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />

              <Input
                label="Work Email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('EMPLOYEE')}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition-all ${
                      role === 'EMPLOYEE'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                    }`}
                  >
                    <UserCheck className="h-4 w-4" />
                    Regular Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition-all ${
                      role === 'ADMIN'
                        ? 'border-indigo-600 bg-indigo-600 text-white dark:bg-indigo-500'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Admin / HR Officer
                  </button>
                </div>
              </div>

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                
                {/* Security Requirements Rules */}
                <div className="mt-2 space-y-1 rounded-lg bg-slate-50 p-2.5 text-[11px] dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-600 dark:text-slate-400 mb-1">Password Requirements:</p>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${isMinLength ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
                    <span className={isMinLength ? 'text-slate-900 dark:text-slate-200 font-medium' : 'text-slate-400'}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${hasUpper ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
                    <span className={hasUpper ? 'text-slate-900 dark:text-slate-200 font-medium' : 'text-slate-400'}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${hasDigit ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
                    <span className={hasDigit ? 'text-slate-900 dark:text-slate-200 font-medium' : 'text-slate-400'}>One number (0-9)</span>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={loading}>
                Create Account
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center text-xs text-slate-500">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
