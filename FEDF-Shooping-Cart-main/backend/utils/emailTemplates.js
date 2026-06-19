const formatCurrency = (val) => `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export const getOrderConfirmationHtml = (order, userName) => {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: left; font-size: 14px; color: #2d3748;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${item.image}" alt="${item.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #e2e8f0;" />
            <span><strong>${item.name}</strong></span>
          </div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: center; font-size: 14px; color: #4a5568;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: right; font-size: 14px; color: #2d3748; font-weight: 600;">
          ${formatCurrency(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join('');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7fafc; padding: 24px; margin: 0; min-height: 100%;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
        <!-- Header -->
        <tr style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);">
          <td style="padding: 32px; text-align: center;">
            <span style="font-size: 32px; margin: 0; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">🛒 SmartCart</span>
            <p style="color: #bfdbfe; font-size: 14px; margin: 8px 0 0 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Order Confirmed</p>
          </td>
        </tr>
        
        <!-- Welcome Block -->
        <tr>
          <td style="padding: 32px 32px 16px 32px;">
            <h1 style="font-size: 20px; font-weight: 700; color: #1a202c; margin: 0 0 12px 0;">Hello ${userName || 'Valued Customer'},</h1>
            <p style="font-size: 15px; line-height: 1.6; color: #4a5568; margin: 0;">
              Thank you for shopping with SmartCart. We are thrilled to let you know that we have received your order <strong>#${order.orderNumber}</strong>. We are busy packaging your items, and you will receive another update when it ships!
            </p>
          </td>
        </tr>

        <!-- Order Info -->
        <tr>
          <td style="padding: 16px 32px;">
            <table width="100%" style="background-color: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #edf2f7;">
              <tr>
                <td style="font-size: 13px; color: #718096; padding-bottom: 6px;"><strong>Order ID:</strong></td>
                <td style="font-size: 13px; color: #2d3748; padding-bottom: 6px; text-align: right;">${order.orderNumber}</td>
              </tr>
              <tr>
                <td style="font-size: 13px; color: #718096; padding-bottom: 6px;"><strong>Order Date:</strong></td>
                <td style="font-size: 13px; color: #2d3748; padding-bottom: 6px; text-align: right;">${new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="font-size: 13px; color: #718096;"><strong>Payment Method:</strong></td>
                <td style="font-size: 13px; color: #2d3748; text-align: right;">${order.paymentMethod}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Items Table -->
        <tr>
          <td style="padding: 16px 32px;">
            <h2 style="font-size: 16px; font-weight: 700; color: #1a202c; margin: 0 0 12px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Order Details</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f7fafc;">
                  <th style="padding: 8px 12px; font-size: 12px; font-weight: 700; color: #718096; border-bottom: 1px solid #e2e8f0; text-align: left; text-transform: uppercase;">Item</th>
                  <th style="padding: 8px 12px; font-size: 12px; font-weight: 700; color: #718096; border-bottom: 1px solid #e2e8f0; text-align: center; text-transform: uppercase;">Qty</th>
                  <th style="padding: 8px 12px; font-size: 12px; font-weight: 700; color: #718096; border-bottom: 1px solid #e2e8f0; text-align: right; text-transform: uppercase;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </td>
        </tr>

        <!-- Financial Summary -->
        <tr>
          <td style="padding: 16px 32px 32px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width: 60%; text-align: right; font-size: 14px; color: #718096; padding: 6px 12px;">Subtotal:</td>
                <td style="width: 40%; text-align: right; font-size: 14px; color: #2d3748; padding: 6px 0;">${formatCurrency(order.subtotal)}</td>
              </tr>
              ${
                order.couponDiscount > 0
                  ? `
              <tr>
                <td style="text-align: right; font-size: 14px; color: #e53e3e; padding: 6px 12px;">Discount (Coupon ${order.couponCode}):</td>
                <td style="text-align: right; font-size: 14px; color: #e53e3e; padding: 6px 0;">-${formatCurrency(order.couponDiscount)}</td>
              </tr>`
                  : ''
              }
              <tr>
                <td style="text-align: right; font-size: 14px; color: #718096; padding: 6px 12px;">Shipping:</td>
                <td style="text-align: right; font-size: 14px; color: #2d3748; padding: 6px 0;">${
                  order.shippingCharge === 0 ? 'Free' : formatCurrency(order.shippingCharge)
                }</td>
              </tr>
              <tr>
                <td style="text-align: right; font-size: 14px; color: #718096; padding: 6px 12px;">Tax (18% GST):</td>
                <td style="text-align: right; font-size: 14px; color: #2d3748; padding: 6px 0;">${formatCurrency(order.tax)}</td>
              </tr>
              <tr style="border-top: 2px solid #e2e8f0;">
                <td style="text-align: right; font-size: 16px; font-weight: 700; color: #1a202c; padding: 16px 12px 0 12px;">Total Paid:</td>
                <td style="text-align: right; font-size: 18px; font-weight: 800; color: #2563eb; padding: 16px 0 0 0;">${formatCurrency(order.finalTotal)}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Shipping Address -->
        <tr style="background-color: #f8fafc;">
          <td style="padding: 32px; border-top: 1px solid #edf2f7; border-bottom: 1px solid #edf2f7;">
            <h3 style="font-size: 14px; font-weight: 700; color: #1a202c; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Address</h3>
            <p style="font-size: 14px; color: #4a5568; line-height: 1.5; margin: 0;">
              <strong>${order.address.fullName}</strong><br />
              ${order.address.street}<br />
              ${order.address.city}, ${order.address.state} - ${order.address.pincode}<br />
              Phone: ${order.address.mobile}
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr style="background-color: #edf2f7;">
          <td style="padding: 24px; text-align: center; font-size: 12px; color: #718096;">
            <p style="margin: 0 0 8px 0;">This is a mock transaction generated by your SmartCart Checkout app.</p>
            <p style="margin: 0;">© 2026 SmartCart Inc. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </div>
  `;
};

export const getOrderStatusUpdateHtml = (order, status) => {
  let icon = '📦';
  let color = '#2563eb';
  let message = 'Your order status has been updated.';

  if (status === 'Processing') {
    icon = '⚙️';
    color = '#4b5563';
    message = 'We are prepping and sorting your items for dispatch.';
  } else if (status === 'Shipped') {
    icon = '🚚';
    color = '#8b5cf6';
    message = 'Your order has been handed over to the courier and is on its way!';
  } else if (status === 'Out For Delivery') {
    icon = '🛵';
    color = '#f59e0b';
    message = 'Your courier driver has loaded your package and will deliver it today!';
  } else if (status === 'Delivered') {
    icon = '✅';
    color = '#10b981';
    message = 'Your package has been successfully delivered. We hope you love your new gear!';
  }

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7fafc; padding: 24px; margin: 0; min-height: 100%;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
        <!-- Header -->
        <tr style="background-color: ${color};">
          <td style="padding: 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">${icon}</div>
            <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Order Status Update</span>
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0 0; font-weight: 600; text-transform: uppercase;">Order #${order.orderNumber}</p>
          </td>
        </tr>
        
        <!-- Welcome Block -->
        <tr>
          <td style="padding: 32px;">
            <h1 style="font-size: 20px; font-weight: 700; color: #1a202c; margin: 0 0 12px 0;">Status: <span style="color: ${color}">${status}</span></h1>
            <p style="font-size: 15px; line-height: 1.6; color: #4a5568; margin: 0 0 20px 0;">
              ${message}
            </p>
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; border: 1px solid #edf2f7; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #718096;">Need to tracking details?</p>
              <h2 style="margin: 6px 0; font-size: 18px; font-weight: 800; color: #1a202c;">Tracking Number: ${order.orderNumber}</h2>
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #a0aec0;">Carrier: SmartCart Express Logistics</p>
              <a href="#" style="background-color: ${color}; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 600; display: inline-block;">Track Shipment</a>
            </div>
          </td>
        </tr>

        <!-- Summary teaser -->
        <tr style="background-color: #f8fafc;">
          <td style="padding: 32px; border-top: 1px solid #edf2f7;">
            <h3 style="font-size: 14px; font-weight: 700; color: #1a202c; margin: 0 0 8px 0; text-transform: uppercase;">Shipment Summary</h3>
            <p style="font-size: 14px; color: #4a5568; margin: 0 0 16px 0;">
              Total Value: <strong>₹${order.finalTotal.toLocaleString('en-IN')}</strong> (${order.items.length} unique items)
            </p>
            <p style="font-size: 14px; color: #718096; margin: 0;">
              Shipping to:<br />
              <strong>${order.address.fullName}</strong><br />
              ${order.address.city}, ${order.address.state}
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr style="background-color: #edf2f7;">
          <td style="padding: 24px; text-align: center; font-size: 12px; color: #718096;">
            <p style="margin: 0 0 8px 0;">This is an email tracking simulation.</p>
            <p style="margin: 0;">© 2026 SmartCart Inc. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </div>
  `;
};
