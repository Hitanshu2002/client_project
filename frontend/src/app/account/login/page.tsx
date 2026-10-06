'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AlertCircle, CheckCircle2, Mail, KeyRound } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Login & Registration State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // OTP Step State
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Send OTP to Email
  const handleSendOtp = async () => {
    if (!email || !name || !password) {
      setErrorMsg('Please enter Name, Email, and Password first');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setIsSendingOtp(true);

    try {
      const res = await apiFetch('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setOtpSent(true);
        setSuccessMsg(`Verification code sent to ${email}`);
      } else {
        setErrorMsg(data.error || 'Failed to send OTP code');
      }
    } catch (err) {
      setErrorMsg('Network error sending verification code');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Step 2: Verify OTP & Submit Registration
  const handleRegisterWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      // First verify OTP
      const verifyRes = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code: otpCode }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setErrorMsg(verifyData.error || 'Invalid verification code');
        setIsSubmitting(false);
        return;
      }

      // If OTP valid, complete registration
      const res = await register(name, email, password, phone);
      if (res.success) {
        router.push('/');
      } else {
        setErrorMsg(res.error || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg('Error completing registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const res = await login(email, password);
    if (res.success) {
      router.push('/');
    } else {
      setErrorMsg(res.error || 'Login failed');
    }
    setIsSubmitting(false);
  };

  if (isForgotPassword) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
          <ForgotPasswordForm
            onBack={() => setIsForgotPassword(false)}
            onSuccess={() => {
              setIsForgotPassword(false);
              setIsLoginTab(true);
              setSuccessMsg('Password changed successfully. Please sign in.');
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-3xl bg-white p-8 border border-gray-100 shadow-xl space-y-6">
        {/* Brand Logo */}
        <div className="relative mx-auto h-14 w-52">
          <Image
            src="/images/logo/Color Logo.png"
            alt="House of Ramyaa"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-ramyaa-cream p-1 border border-ramyaa-sand text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg('');
              setSuccessMsg('');
              setOtpSent(false);
            }}
            className={`flex-1 py-2.5 rounded-lg transition-all ${
              isLoginTab ? 'bg-white text-ramyaa-pink shadow-sm' : 'text-gray-500 hover:text-ramyaa-charcoal'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg('');
              setSuccessMsg('');
              setOtpSent(false);
            }}
            className={`flex-1 py-2.5 rounded-lg transition-all ${
              !isLoginTab ? 'bg-white text-ramyaa-blue shadow-sm' : 'text-gray-500 hover:text-ramyaa-charcoal'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-3 border border-rose-200 text-xs font-bold text-rose-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center space-x-2 rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Login Form ── */}
        {isLoginTab ? (
          <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ramyaa-pink"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ramyaa-pink"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue py-3.5 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Account'}
            </button>
            <button type="button" onClick={() => setIsForgotPassword(true)} className="w-full text-xs font-semibold text-ramyaa-pink hover:underline">
              Forgot password?
            </button>
          </form>
        ) : (
          /* ── Registration Form with 2-Step OTP ── */
          <form onSubmit={handleRegisterWithOtp} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                disabled={otpSent}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ramyaa-blue disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                disabled={otpSent}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ramyaa-pink disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                required
                disabled={otpSent}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Min 6 characters"
                className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ramyaa-pink disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone (Optional)</label>
              <input
                type="tel"
                disabled={otpSent}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ramyaa-blue disabled:bg-gray-50"
              />
            </div>

            {/* OTP Code Step */}
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp || !email || !name || !password}
                className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-ramyaa-blue py-3.5 text-xs font-bold text-white shadow-lg hover:bg-ramyaa-blue-600 transition-all disabled:opacity-50"
              >
                <Mail className="h-4 w-4" />
                <span>{isSendingOtp ? 'Sending Code...' : 'Send Verification Code to Email'}</span>
              </button>
            ) : (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-ramyaa-pink mb-1 flex items-center gap-1">
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Enter 6-Digit Email Code *</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full text-center font-mono text-base letter-spacing-2 rounded-xl border-2 border-ramyaa-pink p-3 focus:outline-none focus:ring-2 focus:ring-ramyaa-pink"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-1/3 rounded-xl border border-gray-200 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || otpCode.length < 6}
                    className="w-2/3 rounded-xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue py-3 text-xs font-bold text-white shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify Code & Register'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

      </div>
    </div>
  );
}
