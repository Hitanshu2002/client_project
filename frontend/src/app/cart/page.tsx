'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, subtotal, shippingCharge, totalAmount } = useCart();

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center space-y-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-ramyaa-pink-50 text-ramyaa-pink">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-ramyaa-charcoal">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Explore our handcrafted Rajasthani Bandhani, Leheriya & Gota Patti collections to fill your bag.
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 rounded-full bg-ramyaa-pink px-8 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-ramyaa-pink-600 transition-colors"
        >
          <span>Start Shopping</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="font-serif text-3xl font-bold text-ramyaa-charcoal">Shopping Cart ({cart.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const primaryImage =
              item.product.images && item.product.images.length > 0
                ? item.product.images[0].url
                : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop';

            return (
              <div
                key={item.variantId}
                className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white shadow-sm gap-4"
              >
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    <Image src={primaryImage} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-ramyaa-charcoal line-clamp-1">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Size: <span className="font-bold text-ramyaa-blue">{item.size}</span> | Color:{' '}
                      <span className="font-bold text-ramyaa-pink">{item.color}</span>
                    </p>
                    <p className="text-sm font-extrabold text-ramyaa-charcoal mt-2">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-l-xl"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-bold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-r-xl"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-base font-extrabold text-ramyaa-pink">
                    {formatPrice(item.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.variantId)}
                    className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4">
          <div className="rounded-3xl bg-ramyaa-cream p-6 border border-ramyaa-sand shadow-sm space-y-6 sticky top-24">
            <h2 className="font-serif text-xl font-bold text-ramyaa-charcoal border-b pb-3 border-ramyaa-sand">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-gray-900">
                  {shippingCharge === 0 ? (
                    <span className="text-ramyaa-blue font-bold">FREE</span>
                  ) : (
                    formatPrice(shippingCharge)
                  )}
                </span>
              </div>

              {subtotal < 2999 && (
                <div className="text-[10px] text-ramyaa-pink bg-ramyaa-pink-50 p-2.5 rounded-xl border border-ramyaa-pink-200 font-semibold">
                  Add {formatPrice(2999 - subtotal)} more for FREE Express Shipping!
                </div>
              )}

              <div className="flex justify-between text-base font-bold text-ramyaa-charcoal border-t pt-3 border-ramyaa-sand">
                <span>Total Amount Due</span>
                <span className="text-ramyaa-pink text-xl">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue py-4 text-sm font-bold text-white shadow-xl hover:opacity-95 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 pt-2 border-t border-ramyaa-sand">
              <div className="flex items-center space-x-1">
                <ShieldCheck className="h-3.5 w-3.5 text-ramyaa-pink" />
                <span>100% Genuine Handloom</span>
              </div>
              <div className="flex items-center space-x-1">
                <Truck className="h-3.5 w-3.5 text-ramyaa-blue" />
                <span>Safe Delivery Across India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
