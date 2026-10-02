'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { QrCode, CheckCircle, Copy, AlertCircle, ArrowRight } from 'lucide-react';
import { PaymentInitializationResult } from '@/lib/payment';

interface UPIPaymentQRProps {
  paymentDetails: PaymentInitializationResult;
  onPaymentConfirmed: (utrRef: string) => void;
  isSubmitting?: boolean;
}

export const UPIPaymentQR: React.FC<UPIPaymentQRProps> = ({
  paymentDetails,
  onPaymentConfirmed,
  isSubmitting = false,
}) => {
  const [utr, setUtr] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(paymentDetails.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPaymentConfirmed(utr.trim() || 'UPI-MANUAL-VERIFICATION');
  };

  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 border border-gray-100 shadow-xl max-w-lg mx-auto text-center space-y-6">
      <div className="space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ramyaa-blue-50 text-ramyaa-blue">
          <QrCode className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-ramyaa-charcoal">Complete UPI Payment</h2>
        <p className="text-xs text-gray-500">
          Scan QR Code using Google Pay, PhonePe, Paytm, BHIM, or any UPI app.
        </p>
      </div>

      {/* Payable Amount Box */}
      <div className="rounded-2xl bg-ramyaa-cream p-4 border border-ramyaa-sand flex items-center justify-between">
        <div className="text-left">
          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Order Number</span>
          <span className="font-mono text-xs font-bold text-ramyaa-charcoal">{paymentDetails.orderNumber}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Total Amount Due</span>
          <span className="text-xl font-extrabold text-ramyaa-pink">{formatPrice(paymentDetails.amount)}</span>
        </div>
      </div>

      {/* Dynamic QR Code Image */}
      <div className="relative mx-auto h-64 w-64 rounded-2xl border-4 border-ramyaa-blue/10 bg-white p-2 shadow-inner">
        {paymentDetails.qrCodeDataUrl ? (
          <Image
            src={paymentDetails.qrCodeDataUrl}
            alt="UPI Payment QR Code"
            fill
            className="object-contain p-2"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            Generating QR Code...
          </div>
        )}
      </div>

      {/* Copy UPI ID */}
      <div className="flex items-center justify-center space-x-2 rounded-xl bg-gray-50 p-3 border border-gray-200">
        <span className="text-xs text-gray-500">UPI ID:</span>
        <span className="font-mono text-xs font-bold text-ramyaa-blue">{paymentDetails.upiId}</span>
        <button
          onClick={handleCopyUPI}
          className="ml-2 rounded-md p-1 text-gray-400 hover:text-ramyaa-pink transition-colors"
          title="Copy UPI ID"
        >
          {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      {/* Payment Instructions & UTR Reference Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-left">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700">
            UPI Transaction ID / UTR / Reference No. (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. 4256XXXXXXXX or UPI Ref"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ramyaa-pink"
          />
          <p className="text-[10px] text-gray-400">
            Helps brand team verify payment faster against UPI notifications.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue py-4 text-sm font-bold text-white shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
        >
          <span>I've Completed Payment</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
