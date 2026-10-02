'use client';

import React, { useEffect, useState } from 'react';
import { Users, Search, ShoppingBag, Star, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { apiFetch } from '@/lib/api';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  orderCount: number;
  reviewCount: number;
  totalSpent: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiFetch('/admin/users');
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery))
  );

  const totalCustomers = users.filter((u) => u.role === 'CUSTOMER').length;
  const totalAdmins = users.filter((u) => u.role === 'ADMIN').length;
  const totalRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-violet-500',
      'bg-cyan-500',
      'bg-emerald-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ramyaa-charcoal">Users &amp; Customers</h1>
          <p className="text-xs text-gray-500 mt-1">View all registered users and their activity</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-indigo-600" />
            <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">Total Users</span>
          </div>
          <p className="text-2xl font-extrabold text-indigo-800">{users.length}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="h-4 w-4 text-pink-600" />
            <span className="text-[10px] font-bold uppercase text-pink-600 tracking-wider">Customers</span>
          </div>
          <p className="text-2xl font-extrabold text-pink-800">{totalCustomers}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-amber-600" />
            <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">Admins</span>
          </div>
          <p className="text-2xl font-extrabold text-amber-800">{totalAdmins}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-emerald-600" />
            <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Total Revenue</span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-800">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-xs focus:ring-2 focus:ring-ramyaa-pink focus:outline-none shadow-sm"
        />
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-gray-400">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-20 text-center text-xs text-gray-400">
          {searchQuery ? 'No users match your search.' : 'No users registered yet.'}
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Role</th>
                <th className="p-4">Registered</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Reviews</th>
                <th className="p-4">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-9 w-9 rounded-full ${getAvatarColor(u.name)} flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0`}
                      >
                        {getInitials(u.name)}
                      </div>
                      <span className="font-serif font-bold text-ramyaa-charcoal">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-ramyaa-pink/10 text-ramyaa-pink'
                          : 'bg-ramyaa-blue/10 text-ramyaa-blue'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span>{formatDate(u.createdAt)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-ramyaa-charcoal">{u.orderCount}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-ramyaa-charcoal">{u.reviewCount}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-extrabold text-ramyaa-pink">
                      {u.totalSpent > 0 ? formatPrice(u.totalSpent) : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
