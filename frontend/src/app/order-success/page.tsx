'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { CheckCircle2, Clock, PackageCheck, Truck, MapPin, ArrowRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams ? searchParams.get('orderId') : null;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      apiFetch(`/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.order) setOrder(data.order);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ramyaa-pink border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-gray-800">Order Not Found</h2>
        <Link href="/" className="inline-block rounded-full bg-ramyaa-pink px-6 py-2.5 text-xs font-bold text-white">
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-ramyaa-cream p-8 border border-ramyaa-sand text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-ramyaa-charcoal">
          Thank You! Your Order Has Been Received
        </h1>
        <p className="text-xs text-gray-600">
          Order Reference Number:{' '}
          <span className="font-mono font-bold text-ramyaa-blue">{order.orderNumber}</span>
        </p>
      </div>

      {/* Payment Status Alert */}
      {order.paymentStatus === 'PENDING_VERIFICATION' ? (
        <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
          <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Payment Status: Payment Pending Verification</span>
            <p className="text-amber-800">
              Our brand team will verify your UPI payment reference ({order.paymentRef || 'Manual QR'}). Once verified, your order status will automatically transition to <span className="font-bold text-emerald-700">Confirmed</span>.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 flex items-start space-x-3 text-xs text-emerald-900">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block text-emerald-800">Payment Status: Confirmed &amp; Verified</span>
            <p className="text-emerald-700">
              Your payment has been successfully verified! Ref: <span className="font-mono font-bold text-emerald-900">{order.paymentRef || 'Verified'}</span>
            </p>
          </div>
        </div>
      )}

      {/* Order Status Progress Tracker */}
      <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="font-serif text-lg font-bold text-ramyaa-charcoal border-b pb-3">
          Order Status Tracker
        </h2>

        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
          <div className="flex flex-col items-center text-ramyaa-pink">
            <div className="h-8 w-8 rounded-full bg-ramyaa-pink text-white flex items-center justify-center mb-1">
              ✓
            </div>
            <span>Received</span>
          </div>

          <div className={`flex flex-col items-center ${order.paymentStatus === 'CONFIRMED' ? 'text-ramyaa-blue' : 'text-gray-400'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-1 ${order.paymentStatus === 'CONFIRMED' ? 'bg-ramyaa-blue text-white' : 'bg-gray-100'}`}>
              2
            </div>
            <span>Verified & Confirmed</span>
          </div>

          <div className={`flex flex-col items-center ${order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED' ? 'text-ramyaa-blue' : 'text-gray-400'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-1 ${order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED' ? 'bg-ramyaa-blue text-white' : 'bg-gray-100'}`}>
              3
            </div>
            <span>Handloom Shipped</span>
          </div>

          <div className={`flex flex-col items-center ${order.orderStatus === 'DELIVERED' ? 'text-emerald-600' : 'text-gray-400'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center mb-1 ${order.orderStatus === 'DELIVERED' ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>
              4
            </div>
            <span>Delivered</span>
          </div>
        </div>

        {/* Courier & Tracking Information Box */}
        {(order.courierName || order.trackingNumber) && (
          <div className="mt-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1">
            <span className="font-bold uppercase text-[10px] tracking-wider text-indigo-600 block">Shipment Tracking Details</span>
            {order.courierName && (
              <div>
                <span className="font-semibold text-gray-600">Courier Service: </span>
                <span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                  {order.courierName}
                </span>
              </div>
            )}
            {order.trackingNumber && (
              <div className="pt-1">
                <span className="font-semibold text-gray-600">Tracking / AWB ID: </span>
                <span className="font-mono font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                  {order.trackingNumber}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Items Breakdown */}
      <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="font-serif text-lg font-bold text-ramyaa-charcoal border-b pb-3">
          Item Details
        </h2>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-ramyaa-charcoal block">{item.productName}</span>
                <span className="text-gray-500">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</span>
              </div>
              <span className="font-bold text-ramyaa-pink">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-3 space-y-1.5 text-xs text-gray-600 font-medium">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shippingCharge === 0 ? 'FREE' : formatPrice(order.shippingCharge)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-ramyaa-charcoal border-t pt-2">
            <span>Total Payable</span>
            <span className="text-ramyaa-pink text-base">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm space-y-2 text-xs">
        <div className="flex items-center space-x-2 font-serif font-bold text-sm text-ramyaa-charcoal">
          <MapPin className="h-4 w-4 text-ramyaa-pink" />
          <span>Delivery Address</span>
        </div>
        <p className="font-semibold text-gray-800">{order.customerName}</p>
        <p className="text-gray-600">{order.address}, {order.city}, {order.state} - {order.pincode}</p>
        <p className="text-gray-600">Phone: {order.customerPhone}</p>
      </div>

      <div className="text-center pt-4">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 rounded-full bg-ramyaa-pink px-8 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-ramyaa-pink-600 transition-all"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gray-400">Loading order...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
