export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  productCount?: number;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  order: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  colorHex?: string | null;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  mrp: number;
  discountPercent: number;
  sellingPrice: number;
  categoryId: string;
  category?: Category;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isFestive: boolean;
  inStock: boolean;
  fabric?: string | null;
  careInstructions?: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews?: Review[];
  avgRating?: number;
  reviewCount?: number;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  customAuthorName?: string | null;
  user?: {
    name: string;
  };
  product?: {
    name: string;
    slug: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  product: Product;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING_VERIFICATION' | 'CONFIRMED' | 'FAILED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  product?: {
    images: ProductImage[];
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  shippingCharge: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentRef?: string | null;
  orderStatus: OrderStatus;
  courierName?: string | null;
  trackingNumber?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface Promotion {
  id: string;
  title: string;
  description?: string | null;
  offerText: string;
  bannerImage?: string | null;
  code?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
}
