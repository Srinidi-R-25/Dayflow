'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Lock, Mail, Shield, UserCheck, AlertCircle } from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function LoginPage() {
  const [email, setEmail] = useState('alex.morgan@dayflow.com');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('EMPLOYEE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, selectedRole);
      if (success) {
        if (selectedRole === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError('Invalid email or password. Try demo credentials.');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoRole: UserRole) => {
    if (demoRole === 'ADMIN') {
      setEmail('sarah.connor@dayflow.com');
      setSelectedRole('ADMIN');
    } else {
      setEmail('alex.morgan@dayflow.com');
      setSelectedRole('EMPLOYEE');
    }
    setPassword('password123');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-2xl shadow-lg shadow-indigo-600/30">
            D
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back to Dayflow</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to manage your HR workflow</p>
        </div>

        <Card className="border-slate-200/80 shadow-xl dark:border-slate-800">
          <CardHeader className="pb-4">
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Select your portal and enter your credentials</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Role Selection Segmented Control */}
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => handleQuickDemo('EMPLOYEE')}
                className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition-all ${
                  selectedRole === 'EMPLOYEE'
                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <UserCheck className="h-4 w-4" />
                Employee Sign In
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold transition-all ${
                  selectedRole === 'ADMIN'
                    ? 'bg-indigo-600 text-white shadow-xs dark:bg-indigo-500'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Shield className="h-4 w-4" />
                HR Admin Sign In
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button type="submit" className="w-full" isLoading={loading}>
                Sign In as {selectedRole === 'ADMIN' ? 'Admin' : 'Employee'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 text-center text-xs text-slate-500">
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                Register Employee
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
