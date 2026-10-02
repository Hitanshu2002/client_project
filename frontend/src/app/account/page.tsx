'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  User as UserIcon,
  LogOut,
  Edit3,
  X,
  Tag,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function CustomerAccountPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, logout, updateProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Profile Edit Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const fetchUserOrders = async () => {
    try {
      const res = await apiFetch('/orders');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/account/login');
      return;
    }

    if (user) {
      setEditName(user.name);
      setEditPhone(user.phone || '');
      setEditEmail(user.email);
      fetchUserOrders();
    }
  }, [user, isAuthLoading, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setIsSavingProfile(true);

    const res = await updateProfile(editName, editPhone, editEmail);
    if (res.success) {
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        setIsEditProfileOpen(false);
        setProfileMsg({ type: '', text: '' });
      }, 1200);
      router.refresh();
    } else {
      setProfileMsg({ type: 'error', text: res.error || 'Failed to update profile' });
    }
    setIsSavingProfile(false);
  };

  if (isAuthLoading || !user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ramyaa-pink border-t-transparent" />
      </div>
    );
  }

  // Active (in-transit/not-delivered) orders for Dedicated Tracking Block
  const activeOrders = orders.filter(
    (o) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED'
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* ── 1. Profile Header with Edit Modal ── */}
      <div className="rounded-3xl bg-ramyaa-cream p-6 sm:p-8 border border-ramyaa-sand flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-tr from-ramyaa-pink to-ramyaa-blue text-white flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ramyaa-charcoal flex items-center justify-center sm:justify-start gap-2">
              <span>{user.name}</span>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="rounded-full p-1.5 bg-white text-ramyaa-pink hover:bg-ramyaa-pink hover:text-white transition-colors border border-ramyaa-pink/20"
                title="Edit Profile"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </h1>
            <p className="text-xs text-gray-600 font-medium">
              ✉️ {user.email} {user.phone && ` | 📞 ${user.phone}`}
            </p>
            <span className="inline-block rounded-full bg-ramyaa-pink/10 text-ramyaa-pink px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              {user.role === 'ADMIN' ? '👑 Brand Administrator' : '🌸 Verified Patron'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            className="inline-flex items-center space-x-1.5 rounded-2xl border border-ramyaa-pink bg-white px-4 py-2.5 text-xs font-bold text-ramyaa-pink hover:bg-ramyaa-pink-50 transition-colors shadow-sm"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center space-x-1.5 rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:border-rose-300 hover:text-rose-600 transition-colors shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif text-xl font-bold text-ramyaa-charcoal">Update Profile Details</h3>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {profileMsg.text && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  profileMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}
              >
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:ring-2 focus:ring-ramyaa-blue focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="rounded-xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 2. DEDICATED TRACK CURRENT ORDER BLOCK (Active Undelivered Shipments) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-indigo-100">
          <div className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-indigo-600" />
            <h2 className="font-serif text-2xl font-bold text-indigo-950">Track Active Shipments</h2>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            {activeOrders.length} In-Transit
          </span>
        </div>

        {isLoadingOrders ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading active shipments...</div>
        ) : activeOrders.length === 0 ? (
          <div className="p-6 rounded-3xl bg-indigo-50/40 border border-indigo-100 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-indigo-400 mx-auto" />
            <p className="font-serif text-sm font-bold text-indigo-900">No active shipments in transit</p>
            <p className="text-xs text-indigo-600/80">
              All your placed orders have been delivered! Once you place a new order, live tracking will appear here automatically until delivered.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((ord) => (
              <div
                key={ord.id}
                className="rounded-3xl bg-white p-6 border-2 border-indigo-100 shadow-md space-y-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-bold uppercase px-4 py-1 rounded-bl-xl">
                  LIVE TRACKING
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-gray-100 text-xs">
                  <div>
                    <span className="font-mono font-bold text-indigo-600 text-base">{ord.orderNumber}</span>
                    <span className="text-gray-400 ml-2">
                      Placed: {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      ord.paymentStatus === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      Payment: {ord.paymentStatus.replace('_', ' ')}
                    </span>

                    <span className="rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-indigo-200">
                      Status: {ord.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Progress Steps for Active Order */}
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold pt-1">
                  <div className="flex flex-col items-center text-ramyaa-pink">
                    <div className="h-7 w-7 rounded-full bg-ramyaa-pink text-white flex items-center justify-center mb-1">✓</div>
                    <span>Received</span>
                  </div>

                  <div className={`flex flex-col items-center ${ord.paymentStatus === 'CONFIRMED' ? 'text-ramyaa-blue' : 'text-gray-400'}`}>
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center mb-1 ${ord.paymentStatus === 'CONFIRMED' ? 'bg-ramyaa-blue text-white' : 'bg-gray-100'}`}>
                      {ord.paymentStatus === 'CONFIRMED' ? '✓' : '2'}
                    </div>
                    <span>Confirmed</span>
                  </div>

                  <div className={`flex flex-col items-center ${ord.orderStatus === 'SHIPPED' ? 'text-indigo-600 font-extrabold' : 'text-gray-400'}`}>
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center mb-1 ${ord.orderStatus === 'SHIPPED' ? 'bg-indigo-600 text-white animate-pulse' : 'bg-gray-100'}`}>
                      3
                    </div>
                    <span>Shipped</span>
                  </div>

                  <div className="flex flex-col items-center text-gray-400">
                    <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center mb-1">4</div>
                    <span>Delivery</span>
                  </div>
                </div>

                {/* Courier Service & Tracking Details Banner */}
                {(ord.courierName || ord.trackingNumber) ? (
                  <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-gray-600">Courier Partner: </span>
                        <span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                          {ord.courierName || 'Standard Express'}
                        </span>
                      </div>
                    </div>
                    {ord.trackingNumber && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-gray-600">Tracking ID: </span>
                          <span className="font-mono font-bold text-indigo-900 bg-white px-2 py-0.5 rounded border border-indigo-200">
                            {ord.trackingNumber}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <span>Courier name and tracking ID will be assigned as soon as the package leaves our Jaipur loom workshop.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. DEDICATED ALL ORDERS & PAST PURCHASES BLOCK ── */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <PackageCheck className="h-5 w-5 text-ramyaa-pink" />
            <h2 className="font-serif text-2xl font-bold text-ramyaa-charcoal">All Orders &amp; Past Drapes</h2>
          </div>
          <span className="text-xs text-gray-500 font-semibold">{orders.length} Total Orders</span>
        </div>

        {isLoadingOrders ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading order history...</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-3xl bg-gray-50 border border-gray-100">
            <PackageCheck className="h-10 w-10 text-gray-400 mx-auto" />
            <p className="font-serif text-lg font-bold text-gray-700">No orders placed yet</p>
            <p className="text-xs text-gray-500">Explore our Rajasthani clothing collections and place your first order.</p>
            <Link
              href="/"
              className="inline-block rounded-full bg-ramyaa-pink px-6 py-2.5 text-xs font-bold text-white shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-gray-100 text-xs">
                  <div>
                    <span className="font-mono font-bold text-ramyaa-blue text-sm">{ord.orderNumber}</span>
                    <span className="text-gray-400 ml-2">
                      Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      ord.paymentStatus === 'CONFIRMED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      Payment: {ord.paymentStatus.replace('_', ' ')}
                    </span>

                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      ord.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-ramyaa-pink-50 text-ramyaa-pink'
                    }`}>
                      Status: {ord.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {ord.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <div>
                        <Link
                          href={`/product/${item.productId}`}
                          className="font-bold text-ramyaa-charcoal hover:text-ramyaa-pink transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <span className="text-gray-500 block text-[11px]">
                          Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-ramyaa-pink">{formatPrice(item.price * item.quantity)}</span>
                        {ord.orderStatus === 'DELIVERED' || ord.orderStatus === 'CONFIRMED' ? (
                          <Link
                            href={`/product/${item.productId}`}
                            className="block text-[10px] font-bold text-emerald-600 hover:underline mt-0.5"
                          >
                            <ShieldCheck className="h-3 w-3 inline mr-0.5" /> Write Verified Review
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Courier Details */}
                {(ord.courierName || ord.trackingNumber) && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
                    {ord.courierName && (
                      <div>
                        <span className="font-bold text-indigo-600">Courier Partner: </span>
                        <span className="font-semibold bg-white px-2 py-0.5 rounded border border-indigo-200">
                          {ord.courierName}
                        </span>
                      </div>
                    )}
                    {ord.trackingNumber && (
                      <div>
                        <span className="font-bold text-indigo-600">Tracking / AWB Number: </span>
                        <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-indigo-200">
                          {ord.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 text-xs border-t border-gray-100 font-semibold">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-ramyaa-pink text-sm font-extrabold">{formatPrice(ord.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
