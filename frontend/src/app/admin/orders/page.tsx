'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import {
  PackageCheck,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Tag,
  Search,
  Calendar,
  Filter,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<string>('ALL');

  // Courier & Tracking Inputs per Order
  const [courierInputs, setCourierInputs] = useState<{ [key: string]: string }>({});
  const [trackingInputs, setTrackingInputs] = useState<{ [key: string]: string }>({});

  const fetchOrders = async () => {
    try {
      const res = await apiFetch('/orders');
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);

        // Pre-fill existing tracking details
        const cInputs: { [key: string]: string } = {};
        const tInputs: { [key: string]: string } = {};
        data.orders.forEach((o: Order) => {
          if (o.courierName) cInputs[o.id] = o.courierName;
          if (o.trackingNumber) tInputs[o.id] = o.trackingNumber;
        });
        setCourierInputs(cInputs);
        setTrackingInputs(tInputs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (
    orderId: string,
    paymentStatus?: string,
    orderStatus?: string
  ) => {
    try {
      const courierName = courierInputs[orderId] || undefined;
      const trackingNumber = trackingInputs[orderId] || undefined;

      const res = await apiFetch(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ paymentStatus, orderStatus, courierName, trackingNumber }),
      });

      if (res.ok) {
        await fetchOrders();
        router.refresh();
      } else {
        alert('Failed to update order status');
      }
    } catch (err) {
      alert('Error updating order');
    }
  };

  // Filter Logic: Payment Status + Search Query + Time Range
  const filteredOrders = orders.filter((ord) => {
    // 1. Payment status filter
    if (paymentFilter === 'PENDING' && ord.paymentStatus !== 'PENDING_VERIFICATION') return false;
    if (paymentFilter === 'CONFIRMED' && ord.paymentStatus !== 'CONFIRMED') return false;

    // 2. Search query filter (Order ID, Number, Customer Name, Email, Phone, Address)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchesNumber = ord.orderNumber.toLowerCase().includes(q);
      const matchesId = ord.id.toLowerCase().includes(q);
      const matchesName = ord.customerName.toLowerCase().includes(q);
      const matchesEmail = ord.customerEmail.toLowerCase().includes(q);
      const matchesPhone = ord.customerPhone.toLowerCase().includes(q);
      const matchesCity = ord.city.toLowerCase().includes(q);
      const matchesPincode = ord.pincode.toLowerCase().includes(q);

      if (
        !matchesNumber &&
        !matchesId &&
        !matchesName &&
        !matchesEmail &&
        !matchesPhone &&
        !matchesCity &&
        !matchesPincode
      ) {
        return false;
      }
    }

    // 3. Time Range Filter
    if (timeFilter !== 'ALL') {
      const orderDate = new Date(ord.createdAt).getTime();
      const now = Date.now();

      if (timeFilter === 'TODAY') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        if (orderDate < startOfDay.getTime()) return false;
      } else if (timeFilter === 'LAST_7_DAYS') {
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        if (orderDate < sevenDaysAgo) return false;
      } else if (timeFilter === 'LAST_30_DAYS') {
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
        if (orderDate < thirtyDaysAgo) return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ramyaa-charcoal">Order &amp; Payment Verification</h1>
          <p className="text-xs text-gray-500 mt-1">
            Verify manual UPI payments, assign courier partners, and track customer fulfillments
          </p>
        </div>

        {/* Payment Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPaymentFilter('ALL')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              paymentFilter === 'ALL' ? 'bg-ramyaa-charcoal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setPaymentFilter('PENDING')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              paymentFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Pending Verification ({orders.filter((o) => o.paymentStatus === 'PENDING_VERIFICATION').length})
          </button>
          <button
            onClick={() => setPaymentFilter('CONFIRMED')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              paymentFilter === 'CONFIRMED' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Confirmed Payments ({orders.filter((o) => o.paymentStatus === 'CONFIRMED').length})
          </button>
        </div>
      </div>

      {/* ── SEARCH BAR & TIME FILTER CONTROL STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        {/* Search Bar Input */}
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID/Number, Customer Name, Email, Phone..."
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Time Range Dropdown */}
        <div className="sm:col-span-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-ramyaa-blue flex-shrink-0" />
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-3 text-xs font-bold text-ramyaa-charcoal focus:ring-2 focus:ring-ramyaa-blue focus:outline-none cursor-pointer"
          >
            <option value="ALL">🗓️ All Time Records</option>
            <option value="TODAY">⚡ Today's Orders</option>
            <option value="LAST_7_DAYS">📅 Last 7 Days</option>
            <option value="LAST_30_DAYS">📊 Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-gray-400">Loading orders database...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center space-y-2 rounded-3xl bg-white border border-gray-100">
          <Filter className="h-8 w-8 text-gray-300 mx-auto" />
          <p className="font-serif text-base font-bold text-gray-700">No matching orders found</p>
          <p className="text-xs text-gray-400">
            {searchQuery ? `No records match "${searchQuery}".` : 'No orders in this selected filter range.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="rounded-3xl bg-white p-6 border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-gray-100">
                <div>
                  <span className="font-mono text-base font-bold text-ramyaa-blue">{ord.orderNumber}</span>
                  <span className="text-xs text-gray-400 ml-3">
                    Placed: {new Date(ord.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs font-bold">
                  <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider ${
                    ord.paymentStatus === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    Payment: {ord.paymentStatus}
                  </span>

                  <span className="rounded-full bg-ramyaa-pink-50 text-ramyaa-pink px-3 py-1 text-[10px] uppercase tracking-wider">
                    Order: {ord.orderStatus}
                  </span>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-ramyaa-cream p-4 rounded-2xl border border-ramyaa-sand text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Customer Info</span>
                  <p className="font-bold text-ramyaa-charcoal mt-0.5">{ord.customerName}</p>
                  <p className="text-gray-600">{ord.customerEmail}</p>
                  <p className="text-gray-600">📞 {ord.customerPhone}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">Shipping Address</span>
                  <p className="text-gray-700 mt-0.5">{ord.address}, {ord.city}, {ord.state} - {ord.pincode}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">UPI Ref / Transaction Note</span>
                  <p className="font-mono font-bold text-ramyaa-blue mt-0.5">{ord.paymentRef || 'Manual QR Verification'}</p>
                  <p className="text-ramyaa-pink font-extrabold text-sm mt-1">{formatPrice(ord.totalAmount)}</p>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2 border-y py-3 border-gray-100 text-xs">
                {ord.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-800">{item.productName}</span>
                      <span className="text-gray-500 text-[11px] ml-2">
                        Size: {item.size} | Color: {item.color} | Qty: {item.quantity}
                      </span>
                    </div>
                    <span className="font-bold text-ramyaa-pink">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Courier Service & Tracking Details Display if assigned */}
              {(ord.courierName || ord.trackingNumber) && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Truck className="h-4 w-4 text-indigo-600" />
                    <span>Courier Service:</span>
                    <span className="text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                      {ord.courierName || 'Standard Express'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <Tag className="h-4 w-4 text-indigo-600" />
                    <span>Tracking ID / AWB:</span>
                    <span className="font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                      {ord.trackingNumber || 'N/A'}
                    </span>
                  </div>
                </div>
              )}

              {/* Admin Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                {/* Payment Verification Actions */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-gray-700">Payment:</span>
                  {ord.paymentStatus !== 'CONFIRMED' ? (
                    <button
                      onClick={() => handleUpdateOrderStatus(ord.id, 'CONFIRMED')}
                      className="inline-flex items-center space-x-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verify Payment</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-bold flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-1" /> Payment Verified
                    </span>
                  )}
                </div>

                {/* Order Workflow Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {ord.orderStatus === 'CONFIRMED' || ord.orderStatus === 'PENDING' ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        placeholder="Courier Name (e.g. BlueDart, Delhivery)"
                        value={courierInputs[ord.id] || ''}
                        onChange={(e) =>
                          setCourierInputs({ ...courierInputs, [ord.id]: e.target.value })
                        }
                        className="rounded-xl border border-gray-200 p-2 text-xs focus:ring-2 focus:ring-ramyaa-blue w-full sm:w-44"
                      />
                      <input
                        type="text"
                        placeholder="Tracking ID / AWB No."
                        value={trackingInputs[ord.id] || ''}
                        onChange={(e) =>
                          setTrackingInputs({ ...trackingInputs, [ord.id]: e.target.value })
                        }
                        className="rounded-xl border border-gray-200 p-2 text-xs focus:ring-2 focus:ring-ramyaa-blue w-full sm:w-44"
                      />
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, undefined, 'SHIPPED')}
                        className="inline-flex items-center justify-center space-x-1 rounded-xl bg-ramyaa-blue px-4 py-2 text-xs font-bold text-white hover:bg-ramyaa-blue-600 transition-colors whitespace-nowrap"
                      >
                        <Truck className="h-4 w-4" />
                        <span>Ship Order</span>
                      </button>
                    </div>
                  ) : ord.orderStatus === 'SHIPPED' ? (
                    <button
                      onClick={() => handleUpdateOrderStatus(ord.id, undefined, 'DELIVERED')}
                      className="inline-flex items-center justify-center space-x-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                    >
                      <PackageCheck className="h-4 w-4" />
                      <span>Mark Delivered</span>
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500 font-semibold">{ord.orderStatus}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
