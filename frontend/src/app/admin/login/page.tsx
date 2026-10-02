'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Lock, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const res = await login(email, password);
    if (res.success) {
      router.push('/admin');
    } else {
      setErrorMsg(res.error || 'Admin authentication failed');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-ramyaa-charcoal flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="relative mx-auto h-14 w-52">
            <Image
              src="/images/logo/Color Logo.png"
              alt="House of Ramyaa Admin"
              fill
              className="object-contain"
            />
          </div>
          <div className="inline-flex items-center space-x-1 text-xs font-bold text-ramyaa-pink bg-ramyaa-pink-50 px-3 py-1 rounded-full border border-ramyaa-pink-200">
            <Lock className="h-3.5 w-3.5" />
            <span>Admin Control Portal</span>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-3 border border-rose-200 text-xs font-bold text-rose-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Admin Email</label>
            <input
              type="email"
              required
              placeholder="admin@houseoframyaa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Admin Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Verifying Admin Credentials...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-gray-400">
          Default Credentials: <span className="font-mono text-ramyaa-blue font-bold">admin@houseoframyaa.com</span> / <span className="font-mono text-ramyaa-blue font-bold">Admin@123456</span>
        </div>
      </div>
    </div>
  );
}
