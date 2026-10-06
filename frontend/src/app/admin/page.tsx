'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { ShoppingBag, PackageCheck, Clock, AlertTriangle, IndianRupee, ArrowRight, Users } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-ramyaa-pink border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full space-y-8 overflow-x-hidden">
      {/* Dashboard Title */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-ramyaa-charcoal sm:text-3xl">Admin Dashboard Overview</h1>
        <p className="mt-1 max-w-3xl break-words text-xs text-gray-500">Real-time catalog metrics, registered users, orders &amp; UPI payment verification status</p>
      </div>

      {/* KPI Cards Grid - Includes Registered Users */}
      <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-6">
        {/* Total Products */}
        <div className="rounded-3xl bg-white p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Products</span>
            <h3 className="font-serif text-2xl font-bold text-ramyaa-charcoal mt-1">{stats.totalProducts}</h3>
          </div>
          <div className="rounded-2xl bg-ramyaa-pink-50 p-3 text-ramyaa-pink">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        {/* Registered Users */}
        <div className="rounded-3xl bg-white p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ramyaa-blue">Registered Users</span>
            <h3 className="font-serif text-2xl font-bold text-ramyaa-blue mt-1">{stats.totalUsers || 0}</h3>
          </div>
          <div className="rounded-2xl bg-ramyaa-blue-50 p-3 text-ramyaa-blue">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-3xl bg-white p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Orders</span>
            <h3 className="font-serif text-2xl font-bold text-ramyaa-charcoal mt-1">{stats.totalOrders}</h3>
          </div>
          <div className="rounded-2xl bg-purple-50 p-3 text-purple-600">
            <PackageCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Pending Verification */}
        <div className="rounded-3xl bg-white p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending Verify</span>
            <h3 className="font-serif text-2xl font-bold text-amber-700 mt-1">{stats.pendingPayments}</h3>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-3xl bg-white p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Low Stock Alerts</span>
            <h3 className="font-serif text-2xl font-bold text-rose-600 mt-1">{stats.lowStockCount}</h3>
          </div>
          <div className="rounded-2xl bg-rose-50 p-3 text-rose-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        {/* Confirmed Revenue */}
        <div className="rounded-3xl bg-white p-5 border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Verified Revenue</span>
            <h3 className="font-serif text-lg font-bold text-emerald-700 mt-1">{formatPrice(stats.totalRevenue)}</h3>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
            <IndianRupee className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="min-w-0 space-y-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-ramyaa-charcoal">Recent Orders</h2>
            <p className="text-xs text-gray-500">Manual UPI payment verifications and order status</p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center text-xs font-bold text-ramyaa-pink hover:underline"
          >
            <span>View All Orders</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="min-w-[680px] w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Payment Status</th>
                <th className="p-3">Order Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recentOrders.map((ord: any) => (
                <tr key={ord.id} className="hover:bg-gray-50/50">
                  <td className="p-3 font-mono font-bold text-ramyaa-blue">{ord.orderNumber}</td>
                  <td className="p-3 font-semibold text-ramyaa-charcoal">{ord.customerName}</td>
                  <td className="p-3 font-bold text-ramyaa-pink">{formatPrice(ord.totalAmount)}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      ord.paymentStatus === 'CONFIRMED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="rounded-full bg-ramyaa-pink-50 text-ramyaa-pink px-2.5 py-0.5 text-[10px] font-bold">
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link
                      href="/admin/orders"
                      className="rounded-lg bg-ramyaa-blue-50 px-3 py-1 text-xs font-semibold text-ramyaa-blue hover:bg-ramyaa-blue hover:text-white transition-colors"
                    >
                      Manage Order
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
