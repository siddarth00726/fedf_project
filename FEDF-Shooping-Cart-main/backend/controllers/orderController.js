import {
  addOrder,
  addLoyaltyPoints,
  findCoupon,
  findUserById,
  getAllOrders,
  getOrderById,
  getOrderByNumber,
  getProductById,
  newId,
  saveProduct,
  updateOrder,
  addEmailStore,
  addNotificationStore,
} from '../data/store.js';
import { generateOrderNumber, calculateOrderTotals } from '../utils/orderUtils.js';
import { getOrderConfirmationHtml, getOrderStatusUpdateHtml } from '../utils/emailTemplates.js';

export const createOrder = async (req, res) => {
  try {
    const { userId, items, address, paymentMethod, couponCode } = req.body;
    if (!userId || !items?.length || !address || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required order fields' });
    }

    const validatedItems = [];
    for (const item of items) {
      const product = getProductById(item.productId || item.product);
      if (!product) return res.status(400).json({ message: `Product not found: ${item.productId}` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      const onSale =
        product.salePrice && product.saleEndsAt && new Date(product.saleEndsAt) > new Date();
      const price = onSale ? product.salePrice : product.price;
      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price,
        quantity: item.quantity,
        category: product.category,
      });
    }

    let discountPercent = 0;
    if (couponCode) {
      const coupon = findCoupon(couponCode);
      if (!coupon) return res.status(400).json({ message: 'Invalid coupon' });
      discountPercent = coupon.discountPercent;
    }

    const totals = calculateOrderTotals(validatedItems, discountPercent);
    const now = new Date().toISOString();

    const order = {
      _id: newId(),
      orderNumber: generateOrderNumber(),
      userId,
      items: validatedItems,
      address,
      paymentMethod,
      couponCode: couponCode?.toUpperCase() || null,
      ...totals,
      status: 'Placed',
      statusHistory: [{ status: 'Placed', date: now }],
      createdAt: now,
      updatedAt: now,
    };

    addOrder(order);

    for (const item of validatedItems) {
      const product = getProductById(item.product);
      product.stock -= item.quantity;
      saveProduct(product);
      // Low inventory notification if stock drops below 5
      if (product.stock < 5) {
        addNotificationStore({
          userId: 'all',
          type: 'alert',
          title: `Low Stock: ${product.name}`,
          message: `Product "${product.name}" is low on stock (${product.stock} left). Please restock.`,
          referenceId: product._id,
        });
      }
    }

    const registeredUser = findUserById(userId);
    let userName = 'Shopper';
    let userEmail = 'demo@smartcart.com';
    if (registeredUser) {
      const points = Math.floor(order.finalTotal / 100);
      addLoyaltyPoints(userId, points);
      order.loyaltyEarned = points;
      userName = registeredUser.name;
      userEmail = registeredUser.email;
    }

    // Trigger user notification
    addNotificationStore({
      userId,
      type: 'order',
      title: 'Order Placed Successfully!',
      message: `Your order #${order.orderNumber} of ₹${Number(order.finalTotal).toLocaleString('en-IN')} has been received.`,
      referenceId: order._id,
    });

    // Trigger mock email delivery
    addEmailStore({
      userId,
      to: userEmail,
      subject: `Order Confirmation #${order.orderNumber} - SmartCart`,
      html: getOrderConfirmationHtml(order, userName),
      category: 'receipt',
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    res.json(getAllOrders(req.query.userId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderByIdHandler = async (req, res) => {
  try {
    const order = getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderByNumberHandler = async (req, res) => {
  try {
    const order = getOrderByNumber(req.params.orderNumber);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Placed', 'Processing', 'Shipped', 'Out For Delivery', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const statusHistory = [
      ...order.statusHistory,
      { status, date: new Date().toISOString() },
    ];
    const updated = updateOrder(req.params.id, { status, statusHistory });

    const registeredUser = findUserById(order.userId);
    const userName = registeredUser ? registeredUser.name : 'Shopper';
    const userEmail = registeredUser ? registeredUser.email : 'demo@smartcart.com';

    addNotificationStore({
      userId: order.userId,
      type: 'order',
      title: `Order Status: ${status}`,
      message: `Your order #${order.orderNumber} status is now "${status}".`,
      referenceId: order._id,
    });

    addEmailStore({
      userId: order.userId,
      to: userEmail,
      subject: `Order #${order.orderNumber} Status Update - ${status}`,
      html: getOrderStatusUpdateHtml(updated, status),
      category: 'shipping_update',
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
