export function formatPrice(amount: number): string {
  return `₱${amount.toLocaleString('en-PH')}`;
}

// Order.number is a plain autoincrement; this is the padded form people see.
export function formatOrderNumber(number: number): string {
  return `#ORD-${String(number).padStart(6, '0')}`;
}
