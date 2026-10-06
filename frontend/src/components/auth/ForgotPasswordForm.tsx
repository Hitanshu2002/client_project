'use client';

import React, { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { AlertCircle, CheckCircle2, KeyRound, Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  adminOnly?: boolean;
}

export function ForgotPasswordForm({ onBack, onSuccess, adminOnly = false }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(adminOnly ? 'houseoframyaa@gmail.com' : '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sendCode = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to send reset code');
      setCodeSent(true);
      setMessage('If this email has an account, a reset code has been sent.');
    } catch (err: any) {
      setError(err.message || 'Unable to send reset code');
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, code, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to reset password');
      setMessage('Password changed successfully. You can sign in now.');
      setCodeSent(false);
      setCode('');
      setPassword('');
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Unable to reset password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-ramyaa-pink">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </button>
      <div>
        <h2 className="font-serif text-2xl font-bold text-ramyaa-charcoal">Forgot password?</h2>
        <p className="mt-1 text-xs text-gray-500">We will send a one-time code to your email.</p>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-600"><AlertCircle className="h-4 w-4" />{error}</div>}
      {message && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-4 w-4" />{message}</div>}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-gray-700">Account Email</label>
          <input type="email" required disabled={adminOnly || codeSent} value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ramyaa-pink disabled:bg-gray-50" />
        </div>

        {!codeSent ? (
          <button type="button" onClick={sendCode} disabled={busy || !email} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue py-3.5 text-xs font-bold text-white disabled:opacity-50">
            <Mail className="h-4 w-4" /> {busy ? 'Sending code...' : 'Send Reset Code'}
          </button>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-bold text-gray-700"><KeyRound className="h-3.5 w-3.5 text-ramyaa-pink" /> Email Code</label>
              <input type="text" inputMode="numeric" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} placeholder="6-digit code" className="w-full rounded-xl border-2 border-ramyaa-pink p-3 text-center font-mono text-base tracking-[0.35em] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700">New Password</label>
              <input type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ramyaa-pink" />
            </div>
            <button type="submit" disabled={busy || code.length !== 6} className="w-full rounded-2xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue py-3.5 text-xs font-bold text-white disabled:opacity-50">
              {busy ? 'Changing password...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
