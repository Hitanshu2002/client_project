'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { UPIPaymentQR } from '@/components/checkout/UPIPaymentQR';
import { PaymentInitializationResult } from '@/lib/payment';
import { ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, shippingCharge, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<'DETAILS' | 'PAYMENT'>('DETAILS');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Rajasthan');
  const [pincode, setPincode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentInitializationResult | null>(null);

  if (cart.length === 0 && !createdOrder) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-gray-800">Your bag is empty</h2>
        <a href="/" className="inline-block rounded-full bg-ramyaa-pink px-6 py-2.5 text-xs font-bold text-white">
          Return to Shop
        </a>
      </div>
    );
  }

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          address,
          city,
          state,
          pincode,
          items: cart.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCreatedOrder(data.order);
        setPaymentDetails(data.paymentDetails);
        setStep('PAYMENT');
      } else {
        setErrorMsg(data.error || 'Failed to initialize order');
      }
    } catch (err) {
      setErrorMsg('Network error placing order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentConfirmed = async (utrRef: string) => {
    if (!createdOrder) return;
    setIsSubmitting(true);

    try {
      const res = await apiFetch(`/orders/${createdOrder.id}`, {
        method: 'PUT',
        body: JSON.stringify({ paymentRef: utrRef }),
      });

      if (res.ok) {
        clearCart();
        router.push(`/order-success?orderId=${createdOrder.id}`);
      } else {
        setErrorMsg('Failed to record payment reference');
      }
    } catch (err) {
      setErrorMsg('Network error confirming payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h1 className="font-serif text-3xl font-bold text-ramyaa-charcoal">Secure Checkout</h1>
        <span className="text-xs text-emerald-600 font-semibold flex items-center">
          <ShieldCheck className="h-4 w-4 mr-1" /> Encrypted Checkout
        </span>
      </div>

      {errorMsg && (
        <div className="flex items-center space-x-2 rounded-2xl bg-rose-50 p-4 border border-rose-200 text-xs font-bold text-rose-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {step === 'DETAILS' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Customer Address Form */}
          <form onSubmit={handleDetailsSubmit} className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-bold text-ramyaa-charcoal border-b pb-3">
                1. Delivery & Contact Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone * (for order updates)</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Street Address / House No. *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Street name, landmark, house/flat number"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue py-4 text-sm font-bold text-white shadow-xl hover:opacity-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Validating Stock & Details...' : 'Continue to Payment step →'}
            </button>
          </form>

          {/* Sidebar Order Summary */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-ramyaa-cream p-6 border border-ramyaa-sand shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-ramyaa-charcoal border-b pb-3 border-ramyaa-sand">
                Order Items ({cart.length})
              </h2>

              <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                {cart.map((item) => (
                  <div key={item.variantId} className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-ramyaa-charcoal block line-clamp-1">
                        {item.product.name}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {item.size} / {item.color} x {item.quantity}
                      </span>
                    </div>
                    <span className="font-bold text-ramyaa-pink">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t pt-3 border-ramyaa-sand text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCharge === 0 ? 'FREE' : formatPrice(shippingCharge)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-ramyaa-charcoal border-t pt-2 border-ramyaa-sand">
                  <span>Total Payable</span>
                  <span className="text-ramyaa-pink text-lg">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: MANUAL UPI PAYMENT QR STEP */
        <div className="space-y-6">
          <button
            onClick={() => setStep('DETAILS')}
            className="inline-flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-ramyaa-pink"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Edit Delivery Details</span>
          </button>

          {paymentDetails && (
            <UPIPaymentQR
              paymentDetails={paymentDetails}
              onPaymentConfirmed={handlePaymentConfirmed}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      )}
    </div>
  );
}
