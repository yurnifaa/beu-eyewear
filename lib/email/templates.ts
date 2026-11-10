import 'server-only';

import { formatPrice } from '@/lib/format';

export const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function layout(heading: string, intro: string, buttonLabel: string, url: string, outro: string) {
  const href = escapeHtml(url);
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f5f5f4;font-family:Arial,Helvetica,sans-serif;color:#111">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:32px">
    <h1 style="margin:0 0 16px;font-size:20px">${heading}</h1>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6">${intro}</p>
    <p style="margin:0 0 24px"><a href="${href}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:bold">${buttonLabel}</a></p>
    <p style="margin:0 0 8px;font-size:12px;color:#666;line-height:1.6">${outro}</p>
    <p style="margin:0;font-size:12px;color:#666;word-break:break-all">Or paste this link into your browser: ${href}</p>
  </div>
</body></html>`;
}

export function verifyEmailTemplate(name: string, url: string) {
  return {
    subject: 'Confirm your email for BeU Eyewear',
    html: layout(
      `Hi ${escapeHtml(name)}, confirm your email`,
      'Tap the button below to confirm this email address for your BeU Eyewear account.',
      'Confirm email',
      url,
      'This link expires in 24 hours. If you didn’t request it, you can ignore this email.',
    ),
  };
}

export interface OrderEmailData {
  customerName: string;
  // Already formatted, e.g. "#ORD-000123".
  orderNumber: string;
  paidAt: Date;
  // "Card", "GCash"...
  paymentMethod: string;
  // The gateway's payment id. Orders marked paid by hand have none.
  paymentRef?: string | null;
  items: { name: string; color?: string | null; quantity: number; unitPrice: number }[];
  subtotal: number;
  shippingFee: number;
  shippingLabel: string;
  total: number;
  shipName: string;
  shipAddress: string;
  shipCity: string;
  shipProvince: string;
  shipZip: string;
  shipPhone: string;
  // e.g. "Oct 7–9"
  deliveryEstimate?: string;
  orderUrl: string;
  supportEmail?: string;
}

// Brand colours from DESIGN.md.
const INK = '#0a1a2f';
const NAVY = '#12294a';
const MIST = '#eaf5ff';
const BORDER = '#c9dcf0';
const MUTED = '#4a6079';

const formatPaidAt = (date: Date) =>
  date.toLocaleString('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

// The receipt sent once an order is paid. Pure: it takes plain data, so it can be tested without a
// database or any environment.
export function orderConfirmationTemplate(data: OrderEmailData) {
  const firstName = data.customerName.trim().split(/\s+/)[0] || 'there';
  const paidAt = formatPaidAt(data.paidAt);
  const shipping = data.shippingFee === 0 ? 'Free' : formatPrice(data.shippingFee);
  const cityLine = `${data.shipCity}, ${data.shipProvince} ${data.shipZip}`;
  const reference = data.paymentRef ? escapeHtml(data.paymentRef) : 'Confirmed by BeU Eyewear';
  const href = escapeHtml(data.orderUrl);

  const itemRows = data.items
    .map((item) => {
      const color = item.color ? `<div style="font-size:12px;color:${MUTED};padding-top:2px">Color: ${escapeHtml(item.color)}</div>` : '';
      return `<tr>
        <td style="padding:12px 0;border-bottom:1px solid ${BORDER};font-size:14px;line-height:1.4">${escapeHtml(item.name)}${color}</td>
        <td style="padding:12px 8px;border-bottom:1px solid ${BORDER};font-size:14px;text-align:center;white-space:nowrap">&times; ${item.quantity}</td>
        <td style="padding:12px 0;border-bottom:1px solid ${BORDER};font-size:14px;text-align:right;white-space:nowrap">${formatPrice(item.unitPrice * item.quantity)}</td>
      </tr>`;
    })
    .join('');

  const detail = (label: string, value: string) =>
    `<tr><td style="padding:4px 0;font-size:13px;color:${MUTED}">${label}</td><td style="padding:4px 0;font-size:13px;text-align:right">${value}</td></tr>`;
  const totalRow = (label: string, value: string, bold = false) =>
    `<tr><td style="padding:4px 0;font-size:${bold ? 16 : 14}px;${bold ? 'font-weight:bold;' : ''}">${label}</td><td style="padding:4px 0;font-size:${bold ? 16 : 14}px;text-align:right;${bold ? 'font-weight:bold;' : ''}">${value}</td></tr>`;

  const support = data.supportEmail
    ? `Questions? Reply to this email or contact <a href="mailto:${escapeHtml(data.supportEmail)}" style="color:${NAVY}">${escapeHtml(data.supportEmail)}</a>.`
    : 'Questions? Reply to this email and we’ll help.';

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#f3f9ff;font-family:Arial,Helvetica,sans-serif;color:${INK}">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid ${BORDER};border-radius:16px;padding:32px">
    <p style="margin:0 0 24px;font-size:18px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:${NAVY}">BeU Eyewear</p>
    <h1 style="margin:0 0 8px;font-size:22px;line-height:1.3">Hi ${escapeHtml(firstName)}, we got your payment.</h1>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${MUTED}">Thank you for your order. Here is your receipt for ${escapeHtml(data.orderNumber)}.</p>

    <div style="background:${MIST};border-radius:12px;padding:16px 20px;margin:0 0 24px">
      <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED}">Amount paid</div>
      <div style="font-size:28px;font-weight:bold;padding-top:4px">${formatPrice(data.total)}</div>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:collapse">
      ${detail('Order number', escapeHtml(data.orderNumber))}
      ${detail('Date paid', escapeHtml(paidAt))}
      ${detail('Payment method', escapeHtml(data.paymentMethod))}
      ${detail('Payment reference', reference)}
    </table>

    <h2 style="margin:0 0 4px;font-size:15px">Items</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-collapse:collapse">${itemRows}</table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:collapse">
      ${totalRow('Subtotal', formatPrice(data.subtotal))}
      ${totalRow(`Shipping (${escapeHtml(data.shippingLabel)})`, shipping)}
      ${totalRow('Total paid', formatPrice(data.total), true)}
    </table>

    <h2 style="margin:0 0 8px;font-size:15px">Shipping to</h2>
    <p style="margin:0 0 ${data.deliveryEstimate ? '12' : '24'}px;font-size:14px;line-height:1.6">
      ${escapeHtml(data.shipName)}<br>${escapeHtml(data.shipAddress)}<br>${escapeHtml(cityLine)}<br>${escapeHtml(data.shipPhone)}
    </p>
    ${data.deliveryEstimate ? `<p style="margin:0 0 24px;font-size:14px;line-height:1.6"><strong>Estimated delivery:</strong> ${escapeHtml(data.deliveryEstimate)}</p>` : ''}

    <p style="margin:0 0 24px"><a href="${href}" style="display:inline-block;background:${NAVY};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:bold">View your order</a></p>
    <p style="margin:0;font-size:12px;color:${MUTED};line-height:1.6">${support}</p>
  </div>
</body></html>`;

  const textLines = [
    `Hi ${firstName}, we got your payment.`,
    '',
    `Order ${data.orderNumber}`,
    `Amount paid: ${formatPrice(data.total)}`,
    `Date paid: ${paidAt}`,
    `Payment method: ${data.paymentMethod}`,
    `Payment reference: ${data.paymentRef ?? 'Confirmed by BeU Eyewear'}`,
    '',
    'Items:',
    ...data.items.map(
      (item) => `- ${item.name}${item.color ? ` (${item.color})` : ''} x ${item.quantity}: ${formatPrice(item.unitPrice * item.quantity)}`,
    ),
    '',
    `Subtotal: ${formatPrice(data.subtotal)}`,
    `Shipping (${data.shippingLabel}): ${shipping}`,
    `Total paid: ${formatPrice(data.total)}`,
    '',
    'Shipping to:',
    data.shipName,
    data.shipAddress,
    cityLine,
    data.shipPhone,
    ...(data.deliveryEstimate ? ['', `Estimated delivery: ${data.deliveryEstimate}`] : []),
    '',
    `View your order: ${data.orderUrl}`,
    ...(data.supportEmail ? ['', `Questions? ${data.supportEmail}`] : []),
  ];

  return {
    subject: `Payment received for order ${data.orderNumber} — BeU Eyewear`,
    html,
    text: textLines.join('\n'),
  };
}

export function resetPasswordTemplate(name: string, url: string) {
  return {
    subject: 'Reset your BeU Eyewear password',
    html: layout(
      `Hi ${escapeHtml(name)}, reset your password`,
      'We received a request to reset your password. Tap the button below to choose a new one.',
      'Reset password',
      url,
      'This link expires in 1 hour and works once. If you didn’t ask for this, you can ignore this email — your password won’t change.',
    ),
  };
}
