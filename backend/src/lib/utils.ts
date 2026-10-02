export function calculateSellingPrice(mrp: number, discountPercent: number): number {
  if (mrp <= 0) return 0;
  if (discountPercent <= 0) return Math.round(mrp);
  if (discountPercent >= 100) return 0;
  const selling = mrp - (mrp * discountPercent) / 100;
  return Math.round(selling);
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}
