'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  PackageCheck,
  Tag,
  LogOut,
  Sliders,
  MessageSquare,
  ExternalLink,
  Users,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: ShoppingBag },
  { label: 'Stock Matrix', href: '/admin/stock', icon: Sliders },
  { label: 'Categories', href: '/admin/categories', icon: Layers },
  { label: 'Orders & Payments', href: '/admin/orders', icon: PackageCheck },
  { label: 'Users & Customers', href: '/admin/users', icon: Users },
  { label: 'Reviews & Comments', href: '/admin/reviews', icon: MessageSquare },
  { label: 'Promotions / Sales', href: '/admin/promotions', icon: Tag },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="relative h-12 w-48">
          <Image
            src="/images/logo/White Logo.png"
            alt="House of Ramyaa Admin"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="text-[10px] uppercase font-bold tracking-widest text-ramyaa-pink bg-ramyaa-pink/10 px-2.5 py-1 rounded-md w-max border border-ramyaa-pink/20">
          Admin Control Center
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="pt-6 border-t border-gray-800 space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between text-xs text-gray-400 hover:text-ramyaa-gold transition-colors"
        >
          <span>View Live Storefront</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center space-x-2 text-xs text-rose-400 hover:text-rose-300 transition-colors pt-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out Admin</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-ramyaa-charcoal text-white flex-col p-6 min-h-screen border-r border-gray-800 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Bar & Overlay */}
      <div className="lg:hidden bg-ramyaa-charcoal text-white p-4 flex items-center justify-between border-b border-gray-800 sticky top-0 z-50">
        <div className="relative h-10 w-40">
          <Image src="/images/logo/White Logo.png" alt="Admin" fill className="object-contain" />
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <aside className="relative w-72 bg-ramyaa-charcoal text-white p-6 h-full z-10 overflow-y-auto">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
