'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Home,
  Sparkles,
  Flame,
  Truck,
  Grid,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const NAV_CATEGORIES = [
  { name: 'Bandhani', slug: 'bandhani' },
  { name: 'Leheriya', slug: 'leheriya' },
  { name: 'Gota Patti', slug: 'gota-patti' },
  { name: 'Block Print', slug: 'block-print' },
  { name: 'Kota Doria', slug: 'kota-doria' },
  { name: 'Suits', slug: 'rajasthani-suits' },
  { name: 'Kurtis', slug: 'kurtis' },
  { name: 'Sarees', slug: 'sarees' },
  { name: 'Dupattas', slug: 'dupattas' },
];

export const Header: React.FC = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showCategoriesInMobile, setShowCategoriesInMobile] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMobileMenuOpen(false);
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-sm transition-all">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-ramyaa-blue via-ramyaa-pink to-ramyaa-blue py-1.5 text-center text-[11px] sm:text-xs font-medium text-white tracking-wide">
        ✨ Free Shipping Across India on Orders Above ₹2,999 | 100% Authentic Jaipuri Handloom ✨
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-lg p-2 text-ramyaa-charcoal hover:bg-ramyaa-pink-50 lg:hidden"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6 text-ramyaa-pink" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Brand Logo - Native Aspect Ratio */}
        <Link href="/" className="relative flex items-center transition-transform hover:scale-105">
          <div className="relative h-11 w-40 sm:h-14 sm:w-52">
            <Image
              src="/images/logo/Color Logo.png"
              alt="House of Ramyaa"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center space-x-6 lg:flex">
          <Link
            href="/"
            className="text-sm font-medium text-ramyaa-charcoal transition-colors hover:text-ramyaa-pink"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="text-sm font-medium text-ramyaa-charcoal transition-colors hover:text-ramyaa-pink"
          >
            Shop All
          </Link>

          <div className="group relative">
            <button className="flex items-center space-x-1 text-sm font-medium text-ramyaa-charcoal hover:text-ramyaa-pink py-2">
              <span>Categories</span>
              <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
            </button>
            {/* Dropdown Menu */}
            <div className="absolute left-0 top-full hidden w-56 rounded-xl bg-white p-3 shadow-xl ring-1 ring-black/5 group-hover:block">
              <div className="grid grid-cols-1 gap-1">
                {NAV_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-ramyaa-pink-50 hover:text-ramyaa-pink"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/category/new-collection"
            className="text-sm font-medium text-ramyaa-pink hover:underline underline-offset-4"
          >
            New Arrivals
          </Link>

          <Link
            href="/category/festive-collection"
            className="text-sm font-medium text-ramyaa-blue hover:underline underline-offset-4"
          >
            Festive Sale
          </Link>
        </nav>

        {/* Action Icons */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="rounded-full p-2 text-gray-700 hover:bg-ramyaa-pink-50 hover:text-ramyaa-pink transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Quick Search Overlay Dropdown */}
            {isSearchOpen && (
              <form
                onSubmit={handleSearchSubmit}
                className="absolute right-0 top-12 z-50 flex w-72 sm:w-80 rounded-xl bg-white p-2 shadow-2xl ring-1 ring-black/10"
              >
                <input
                  type="text"
                  placeholder="Search Bandhani, Suits, Sarees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border-0 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ramyaa-pink"
                  autoFocus
                />
                <button
                  type="submit"
                  className="ml-2 rounded-lg bg-ramyaa-blue px-4 py-2 text-xs font-semibold text-white hover:bg-ramyaa-blue-600"
                >
                  Go
                </button>
              </form>
            )}
          </div>

          {/* Account Icon */}
          <Link
            href={user ? (user.role === 'ADMIN' ? '/admin' : '/account') : '/account/login'}
            className="flex items-center space-x-1.5 rounded-full p-2 text-gray-700 hover:bg-ramyaa-pink-50 hover:text-ramyaa-pink transition-colors"
            title={user ? `${user.name} (${user.role})` : 'Sign In'}
          >
            <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs font-semibold text-ramyaa-blue max-w-[90px] truncate hidden sm:inline">
              {user ? (user.role === 'ADMIN' ? 'Admin' : user.name.split(' ')[0]) : 'Sign In'}
            </span>
          </Link>

          {/* Cart Drawer Trigger with Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center rounded-full p-2 text-gray-700 hover:bg-ramyaa-pink-50 hover:text-ramyaa-pink transition-colors"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ramyaa-pink text-xs font-bold text-white shadow-md animate-scale-up">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER MENU (HOME, SHOP, CATEGORIES, ACCOUNT, TRACK ORDER) ── */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-6 pt-4 space-y-4 lg:hidden shadow-xl animate-fade-in">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="text"
              placeholder="Search Bandhani, Kurtis, Sarees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-l-xl border border-gray-200 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ramyaa-pink"
            />
            <button
              type="submit"
              className="rounded-r-xl bg-ramyaa-pink px-4 py-2.5 text-xs font-bold text-white"
            >
              Search
            </button>
          </form>

          {/* Core Navigation Links */}
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 hover:bg-ramyaa-pink-50 hover:text-ramyaa-pink transition-colors"
            >
              <Home className="h-4 w-4 text-ramyaa-pink" />
              <span>Home</span>
            </Link>

            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 hover:bg-ramyaa-pink-50 hover:text-ramyaa-pink transition-colors"
            >
              <ShoppingBag className="h-4 w-4 text-ramyaa-blue" />
              <span>Explore All Products</span>
            </Link>

            <Link
              href="/category/new-collection"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-ramyaa-pink hover:bg-ramyaa-pink-50 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>New Arrivals</span>
            </Link>

            <Link
              href="/category/festive-collection"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-ramyaa-blue hover:bg-ramyaa-blue-50 transition-colors"
            >
              <Flame className="h-4 w-4" />
              <span>Festive Collection</span>
            </Link>

            <Link
              href={user ? '/account' : '/account/login'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 hover:bg-ramyaa-pink-50 hover:text-ramyaa-pink transition-colors"
            >
              <UserIcon className="h-4 w-4 text-ramyaa-gold" />
              <span>{user ? `My Account (${user.name.split(' ')[0]})` : 'Sign In / Register'}</span>
            </Link>

            <Link
              href={user ? '/account' : '/account/login'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50/70 border border-indigo-100 hover:bg-indigo-100 transition-colors"
            >
              <Truck className="h-4 w-4 text-indigo-600" />
              <span>Track My Orders</span>
            </Link>
          </div>

          {/* Collapsible Product Categories Header */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowCategoriesInMobile(!showCategoriesInMobile)}
              className="w-full flex items-center justify-between py-2 text-xs font-bold text-gray-500 uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                <Grid className="h-3.5 w-3.5" />
                <span>Shop by Craft Category</span>
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showCategoriesInMobile ? 'rotate-180' : ''}`} />
            </button>

            {showCategoriesInMobile && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                {NAV_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-xl bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-ramyaa-pink-50 hover:text-ramyaa-pink transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
