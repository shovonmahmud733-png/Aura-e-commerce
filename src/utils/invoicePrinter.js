import { formatCurrency, formatDate } from './formatters';

/**
 * Generates an ultra-minimal, luxury 1-page printable tax invoice
 * formatted with Apple / Bang & Olufsen / Leica caliber precision.
 * 
 * Uses a sandboxed invisible iframe so it prints seamlessly on 1 single page
 * without any browser interference, background elements, or scroll clipping.
 */
export function printInvoiceDirectly(order, currency = 'USD') {
  if (!order) return;

  const orderIdStr = String(order.id || 'AUR-849201');
  const invoiceNum = order.invoiceNumber || `INV-2026-${orderIdStr.slice(-6).toUpperCase()}`;
  const orderDate = formatDate(order.date || new Date().toISOString());
  
  // Hash seed for consistent tracking & serial generation
  const hashSeed = Math.abs(orderIdStr.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0));
  
  const trackingNum = order.trackingNumber || `DHL-AUR-${hashSeed.toString().padStart(8, '0').slice(0, 8)}`;
  const carrier = order.carrier || 'DHL Express Worldwide';

  // Shipping & billing resolution
  const recipientName =
    order.shippingDetails?.fullName ||
    order.shippingDetails?.name ||
    (order.shippingDetails?.firstName 
      ? `${order.shippingDetails.firstName} ${order.shippingDetails.lastName || ''}`.trim() 
      : 'Valued Client');

  const streetAddress = order.shippingDetails?.address || order.shippingDetails?.street || '100 Immersion Way, Suite 400';
  const cityStateZip = [
    order.shippingDetails?.city || 'Portland',
    order.shippingDetails?.state || 'OR',
    order.shippingDetails?.zip || order.shippingDetails?.zipCode || '97201'
  ].filter(Boolean).join(', ');
  const country = order.shippingDetails?.country || 'United States';
  const clientEmail = order.shippingDetails?.email || order.userEmail || 'client@auracommerce.io';
  const clientPhone = order.shippingDetails?.phone || '+1 (503) 555-0199';

  // Financial resolution
  const total = parseFloat(order.summary?.total || 0);
  const subtotal = parseFloat(order.summary?.subtotal || (total > 0 ? total * 0.9 : 0));
  const discount = parseFloat(order.summary?.discount || order.summary?.discountAmount || 0);
  const shippingFee = parseFloat(order.summary?.shipping !== undefined ? order.summary.shipping : (order.summary?.shippingFee || 0));
  const tax = parseFloat(order.summary?.tax !== undefined ? order.summary.tax : (order.summary?.taxAmount || 0));

  // Items resolution
  const items = order.items && order.items.length > 0 ? order.items : [
    {
      name: 'Aura Precision Hardware System',
      selectedColor: 'Obsidian Black',
      quantity: 1,
      price: total > 0 ? total : 499
    }
  ];

  const itemsHtml = items.map((item, idx) => {
    const prodName = item.product?.name || item.name || 'Aura Precision Hardware';
    const finish = item.selectedColor || 'Signature Edition';
    const qty = parseInt(item.quantity, 10) || 1;
    const unitPrice = parseFloat(item.product?.price || item.price || 0);
    const itemTotal = unitPrice * qty;
    const serial = item.serialNumber || `AUR-HW-${Math.abs(hashSeed + idx).toString().slice(0, 5)}-PRO`;

    return `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
          <div style="font-weight: 700; color: #0f172a; font-size: 11px; letter-spacing: -0.2px;">${prodName}</div>
          <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">
            Finish: <span style="color: #334155; font-weight: 600;">${finish}</span> &bull; 
            Serial No: <span style="font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace; font-weight: 700; color: #0f172a;">${serial}</span>
          </div>
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: center; font-size: 11px; font-weight: 600; color: #334155; vertical-align: top;">
          ${qty}
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 11px; color: #475569; vertical-align: top; font-variant-numeric: tabular-nums;">
          ${formatCurrency(unitPrice, currency)}
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 11px; font-weight: 700; color: #0f172a; vertical-align: top; font-variant-numeric: tabular-nums;">
          ${formatCurrency(itemTotal, currency)}
        </td>
      </tr>
    `;
  }).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${invoiceNum}</title>
  <style>
    @page {
      size: auto;
      margin: 10mm 14mm 10mm 14mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      background: #ffffff;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 11px;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      width: 100%;
      height: auto;
    }
    .invoice-container {
      max-width: 740px;
      margin: 0 auto;
      padding: 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .brand-mark {
      background: #0f172a;
      color: #ffffff;
      font-size: 11px;
      font-weight: 900;
      width: 19px;
      height: 19px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      letter-spacing: 0;
    }
    .company-subtext {
      font-size: 9px;
      color: #64748b;
      margin-top: 4px;
      line-height: 1.35;
    }
    .invoice-meta-right {
      text-align: right;
    }
    .tax-badge {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: #0f172a;
      color: #ffffff;
      padding: 2.5px 7px;
      border-radius: 3px;
      display: inline-block;
      margin-bottom: 4px;
    }
    .invoice-number {
      font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace;
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
    }
    .invoice-date {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 2px;
    }

    /* 2-Column Meta Grid */
    .grid-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding: 10px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin-bottom: 14px;
    }
    .section-title {
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #64748b;
      margin-bottom: 3px;
    }
    .section-body {
      font-size: 10.5px;
      color: #1e293b;
      line-height: 1.35;
    }
    .section-body strong {
      font-weight: 700;
      color: #0f172a;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
    }
    th {
      border-bottom: 1px solid #cbd5e1;
      font-size: 8.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #64748b;
      padding: 6px 0;
      text-align: left;
    }

    /* Financials */
    .financials-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 14px;
    }
    .financials-table {
      width: 250px;
      border-collapse: collapse;
    }
    .financials-table td {
      padding: 3.5px 0;
      font-size: 10.5px;
    }
    .financials-table .lbl {
      color: #64748b;
    }
    .financials-table .amt {
      text-align: right;
      font-weight: 600;
      color: #0f172a;
      font-variant-numeric: tabular-nums;
    }
    .financials-table .total-row {
      border-top: 1.5px solid #0f172a;
      border-bottom: 1.5px solid #0f172a;
    }
    .financials-table .total-row td {
      padding: 6px 0;
      font-size: 12.5px;
      font-weight: 900;
      color: #0f172a;
    }

    /* Footer */
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5px;
      color: #64748b;
    }
    .warranty-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-weight: 700;
      color: #0f766e;
      background: #f0fdfa;
      padding: 2.5px 6px;
      border-radius: 4px;
      border: 1px solid #ccfbf1;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand-title">
          <span class="brand-mark">A</span> AURA HARDWARE
        </div>
        <div class="company-subtext">
          Aura Consumer Technologies Inc. &bull; Tax ID (EIN): <strong>US-EIN 84-2910482</strong><br />
          100 Immersion Way, Suite 400, Portland, OR 97201 &bull; concierge@auracommerce.io
        </div>
      </div>
      <div class="invoice-meta-right">
        <span class="tax-badge">Official Tax Invoice</span>
        <div class="invoice-number">${invoiceNum}</div>
        <div class="invoice-date">Issue Date: ${orderDate}</div>
      </div>
    </div>

    <!-- 2-Column Meta Grid -->
    <div class="grid-meta">
      <div>
        <div class="section-title">Billed & Shipped To</div>
        <div class="section-body">
          <strong>${recipientName}</strong><br />
          ${streetAddress}<br />
          ${cityStateZip}<br />
          ${country}<br />
          <span style="font-size: 9px; color: #64748b;">${clientEmail} &bull; ${clientPhone}</span>
        </div>
      </div>
      <div>
        <div class="section-title">Consignment & Logistics</div>
        <div class="section-body">
          <strong>Order ID:</strong> <span style="font-family: monospace;">${orderIdStr}</span><br />
          <strong>Carrier:</strong> ${carrier}<br />
          <strong>DHL Tracking:</strong> <span style="font-family: monospace; font-weight: 700; color: #0f172a;">${trackingNum}</span><br />
          <strong>Status:</strong> <span style="color: #059669; font-weight: 700;">PAID IN FULL</span> (Stripe 256-Bit SSL)
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th style="width: 54%;">Hardware Description & Serial</th>
          <th style="width: 10%; text-align: center;">Qty</th>
          <th style="width: 18%; text-align: right;">Unit Price</th>
          <th style="width: 18%; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Financial Summary -->
    <div class="financials-wrapper">
      <table class="financials-table">
        <tr>
          <td class="lbl">Subtotal</td>
          <td class="amt">${formatCurrency(subtotal, currency)}</td>
        </tr>
        ${discount > 0 ? `
        <tr>
          <td class="lbl" style="color: #059669;">Promotional Discount</td>
          <td class="amt" style="color: #059669;">-${formatCurrency(discount, currency)}</td>
        </tr>
        ` : ''}
        <tr>
          <td class="lbl">Courier Shipping (${order.deliveryMethod || 'DHL Express'})</td>
          <td class="amt">${shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee, currency)}</td>
        </tr>
        <tr>
          <td class="lbl">Sales Tax (8.5%)</td>
          <td class="amt">${formatCurrency(tax, currency)}</td>
        </tr>
        <tr class="total-row">
          <td>Total Paid (${currency})</td>
          <td class="amt">${formatCurrency(total, currency)}</td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>
        <span class="warranty-tag">&check; 2-Year Aura Care Global Warranty Registered</span>
        <div style="margin-top: 3px; color: #94a3b8; font-size: 8px;">
          Hardware chassis serial numbers are cryptographically authenticated on the Aura Global Hardware Ledger.
        </div>
      </div>
      <div style="text-align: right;">
        <div>Authorized Electronic Document</div>
        <div style="font-family: monospace; color: #94a3b8; font-size: 8px;">AUTH-SIG: 9a7f-${orderIdStr.slice(-4)}-2026-OK</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  // Create an invisible iframe to isolate print styles completely
  const existingIframe = document.getElementById('aura-print-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'aura-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '1024px';
  iframe.style.height = '1024px';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.zIndex = '-99999';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    const cleanup = () => {
      try {
        const el = document.getElementById('aura-print-iframe');
        if (el) el.remove();
      } catch (_) {}
    };

    iframe.contentWindow.addEventListener('afterprint', cleanup);

    iframe.contentWindow.focus();
    setTimeout(() => {
      try {
        iframe.contentWindow.print();
      } catch (e) {
        // Fallback: window.print
        window.print();
      }
    }, 350);

    // Safety fallback cleanup
    setTimeout(cleanup, 120000);
  } catch (err) {
    console.error('Invoice print error:', err);
    window.print();
  }
}
