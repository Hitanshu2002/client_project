'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/api';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingCharge,
    totalAmount,
  } = useCart();

  if (!isCartOpen) return null;

  const freeShippingGoal = 2999;
  const remainingForFreeShipping = Math.max(0, freeShippingGoal - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingGoal) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-ramyaa-cream">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-ramyaa-pink" />
              <h2 className="font-serif text-lg font-bold text-ramyaa-charcoal">Your Shopping Bag</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-full text-gray-500 hover:bg-white hover:text-ramyaa-pink transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-4 py-3 bg-ramyaa-pink-50 border-b text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-gray-700">
                Add <span className="font-bold text-ramyaa-pink">{formatPrice(remainingForFreeShipping)}</span> more for <span className="font-bold text-ramyaa-blue">FREE Shipping</span>!
              </p>
            ) : (
              <p className="font-bold text-ramyaa-blue flex items-center">
                🎉 Congratulations! You unlocked FREE Express Shipping!
              </p>
            )}
            <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-20 w-20 rounded-full bg-ramyaa-pink-50 flex items-center justify-center text-ramyaa-pink mb-4">
                  <ShoppingBag className="h-10 w-10" />
                </div>
                <h3 className="font-serif text-lg font-bold text-gray-800">Your bag is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Explore our luxury Bandhani, Leheriya & Gota Patti collections to add heritage drapes to your cart.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 rounded-full bg-ramyaa-pink px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-ramyaa-pink-600 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const primaryImage =
                  item.product.images && item.product.images.length > 0
                      ? getImageUrl(item.product.images[0].url)
                    : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop';

                return (
                  <div
                    key={item.variantId}
                    className="flex space-x-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image src={primaryImage} alt={item.product.name} fill className="object-cover" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-serif text-sm font-semibold text-ramyaa-charcoal line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Size: <span className="font-semibold text-ramyaa-blue">{item.size}</span> | Color:{' '}
                          <span className="font-semibold text-ramyaa-pink">{item.color}</span>
                        </p>
                        <p className="text-xs font-bold text-ramyaa-charcoal mt-1">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-l-lg"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-semibold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-r-lg"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.variantId)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Remove Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-4 border-t bg-ramyaa-cream space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {shippingCharge === 0 ? (
                      <span className="text-ramyaa-blue font-bold">FREE</span>
                    ) : (
                      formatPrice(shippingCharge)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-ramyaa-charcoal border-t pt-2">
                  <span>Total Payable</span>
                  <span className="text-ramyaa-pink text-base">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-ramyaa-pink to-ramyaa-blue py-3.5 text-sm font-bold text-white shadow-lg hover:opacity-95 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
