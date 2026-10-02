'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, RefreshCw, Award, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ramyaa-charcoal text-white pt-12 pb-8 border-t-4 border-ramyaa-pink">
      {/* Trust Badges Strip */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 border-b border-gray-800">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-ramyaa-blue/20 p-3 text-ramyaa-pink mb-3">
              <Award className="h-6 w-6" />
            </div>
            <h4 className="font-serif font-semibold text-base">Authentic Craft</h4>
            <p className="text-xs text-gray-400 mt-1">100% Genuine Jaipuri Handloom</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-ramyaa-blue/20 p-3 text-ramyaa-blue mb-3">
              <Truck className="h-6 w-6" />
            </div>
            <h4 className="font-serif font-semibold text-base">Express Delivery</h4>
            <p className="text-xs text-gray-400 mt-1">Free Shipping Above ₹2,999</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-ramyaa-blue/20 p-3 text-ramyaa-gold mb-3">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="font-serif font-semibold text-base">Verified Payment</h4>
            <p className="text-xs text-gray-400 mt-1">Secure UPI QR Confirmation</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-ramyaa-blue/20 p-3 text-ramyaa-pink mb-3">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h4 className="font-serif font-semibold text-base">Easy Exchanges</h4>
            <p className="text-xs text-gray-400 mt-1">7 Days Hassle-Free Exchange</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-1">
          <div className="relative h-14 w-52">
            <Image
              src="/images/logo/White Logo.png"
              alt="House of Ramyaa"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            House of Ramyaa weaves royal Rajasthani heritage into modern feminine silhouettes. From intricate Bandhani tie-dyes to glowing Gota Patti work, every drape tells an artisan story.
          </p>
          <div className="pt-2 text-xs text-ramyaa-gold font-medium">
            📍 Handcrafted in Jaipur, Rajasthan, India
          </div>
        </div>

        {/* Collections Links */}
        <div>
          <h3 className="font-serif text-lg font-semibold text-ramyaa-pink mb-4">Shop Collections</h3>
          <ul className="space-y-2 text-xs text-gray-300">
            <li><Link href="/category/bandhani" className="hover:text-ramyaa-pink transition-colors">Bandhani Suit Sets</Link></li>
            <li><Link href="/category/leheriya" className="hover:text-ramyaa-pink transition-colors">Leheriya Sarees</Link></li>
            <li><Link href="/category/gota-patti" className="hover:text-ramyaa-pink transition-colors">Gota Patti Occasionwear</Link></li>
            <li><Link href="/category/block-print" className="hover:text-ramyaa-pink transition-colors">Bagru & Sanganeri Prints</Link></li>
            <li><Link href="/category/kota-doria" className="hover:text-ramyaa-pink transition-colors">Kota Doria Classics</Link></li>
            <li><Link href="/category/dupattas" className="hover:text-ramyaa-pink transition-colors">Heavy Statement Dupattas</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h3 className="font-serif text-lg font-semibold text-ramyaa-blue mb-4">Customer Care</h3>
          <ul className="space-y-2 text-xs text-gray-300">
            <li><Link href="/account" className="hover:text-ramyaa-blue transition-colors">Track Your Order</Link></li>
            <li><Link href="/account" className="hover:text-ramyaa-blue transition-colors">My Purchases & Reviews</Link></li>
            <li><span className="cursor-pointer hover:text-ramyaa-blue transition-colors">Shipping & Delivery Policy</span></li>
            <li><span className="cursor-pointer hover:text-ramyaa-blue transition-colors">Size Guide & Fabric Care</span></li>
            <li><span className="cursor-pointer hover:text-ramyaa-blue transition-colors">Terms of Service</span></li>
            <li><span className="cursor-pointer hover:text-ramyaa-blue transition-colors">Privacy Policy</span></li>
          </ul>
        </div>

        {/* Contact & Admin Portal */}
        <div>
          <h3 className="font-serif text-lg font-semibold text-ramyaa-gold mb-4">Contact & Support</h3>
          <p className="text-xs text-gray-300 leading-relaxed mb-3">
            Have questions about your size or order? Our Rajasthani textile experts are here to assist.
          </p>
          <p className="text-xs text-gray-200 font-medium">✉️ care@houseoframyaa.com</p>
          <p className="text-xs text-gray-200 font-medium mt-1">📞 +91 98290 12345 (Mon - Sat, 10 AM - 7 PM)</p>
          
          <div className="mt-6 pt-4 border-t border-gray-800">
            <Link
              href="/admin/login"
              className="inline-flex items-center text-xs font-semibold text-gray-400 hover:text-ramyaa-pink transition-colors"
            >
              🔒 Admin Access Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-400">
        <p className="flex items-center justify-center">
          © {new Date().getFullYear()} House of Ramyaa. All Rights Reserved. Crafted with{' '}
          <Heart className="h-3 w-3 mx-1 text-ramyaa-pink fill-ramyaa-pink" /> in Rajasthan.
        </p>
      </div>
    </footer>
  );
};
