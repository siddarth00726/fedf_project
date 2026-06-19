import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { defaultCoupons, defaultProducts } from './defaultData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = __dirname;

const files = {
  products: path.join(DATA_DIR, 'products.json'),
  orders: path.join(DATA_DIR, 'orders.json'),
  addresses: path.join(DATA_DIR, 'addresses.json'),
  wishlists: path.join(DATA_DIR, 'wishlists.json'),
  users: path.join(DATA_DIR, 'users.json'),
  coupons: path.join(DATA_DIR, 'coupons.json'),
  emails: path.join(DATA_DIR, 'emails.json'),
  notifications: path.join(DATA_DIR, 'notifications.json'),
};

const readJson = (file, fallback) => {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return fallback;
  }
};

const writeJson = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

let products = [];
let orders = [];
let addresses = [];
let wishlists = {};
let users = [];
let coupons = [];
let emails = [];
let notifications = [];

const seedDefaultUsers = () => {
  users = [
    {
      _id: 'user_admin',
      name: 'Store Admin',
      email: 'admin@smartcart.com',
      password: bcrypt.hashSync('Admin@123', 10),
      role: 'admin',
      loyaltyPoints: 0,
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'user_demo',
      name: 'Demo Shopper',
      email: 'demo@smartcart.com',
      password: bcrypt.hashSync('Demo@123', 10),
      role: 'user',
      loyaltyPoints: 120,
      createdAt: new Date().toISOString(),
    },
  ];
  writeJson(files.users, users);
};

export const initStore = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const CATALOG_VERSION = 5;
  products = readJson(files.products, null);
  if (!products?.length || products.length < 25 || products[0]?.catalogVersion !== CATALOG_VERSION) {
    products = defaultProducts.map((p) => ({ ...p, catalogVersion: CATALOG_VERSION }));
    writeJson(files.products, products);
    console.log(`Product catalog refreshed: ${products.length} items (v${CATALOG_VERSION})`);
  }

  orders = readJson(files.orders, []);
  addresses = readJson(files.addresses, []);
  wishlists = readJson(files.wishlists, {});
  users = readJson(files.users, []);
  if (!users.length) seedDefaultUsers();

  coupons = readJson(files.coupons, []);
  if (!coupons.length) {
    coupons = defaultCoupons;
    writeJson(files.coupons, coupons);
  }

  emails = readJson(files.emails, []);
  notifications = readJson(files.notifications, []);

  console.log(
    `Data loaded: ${products.length} products, ${orders.length} orders, ${users.length} users, ${coupons.length} coupons`
  );
};

const saveProducts = () => writeJson(files.products, products);
const saveOrders = () => writeJson(files.orders, orders);
const saveAddresses = () => writeJson(files.addresses, addresses);
const saveWishlists = () => writeJson(files.wishlists, wishlists);
const saveCoupons = () => writeJson(files.coupons, coupons);
const saveEmails = () => writeJson(files.emails, emails);
const saveNotifications = () => writeJson(files.notifications, notifications);

export const newId = () => randomUUID();

// Products
export const getAllProducts = () => products;
export const getProductById = (id) => products.find((p) => p._id === id);
export const saveProduct = (product) => {
  const idx = products.findIndex((p) => p._id === product._id);
  if (idx >= 0) products[idx] = product;
  else products.push(product);
  saveProducts();
};

// Coupons
export const getAllCoupons = () => coupons.filter((c) => c.active);

export const findCoupon = (code) =>
  coupons.find((c) => c.code === code.toUpperCase() && c.active);

// Orders
export const getAllOrders = (userId) => {
  const list = userId ? orders.filter((o) => o.userId === userId) : orders;
  return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getOrderById = (id) => orders.find((o) => o._id === id);
export const getOrderByNumber = (orderNumber) =>
  orders.find((o) => o.orderNumber === orderNumber.toUpperCase());

export const addOrder = (order) => {
  orders.push(order);
  saveOrders();
  return order;
};

export const updateOrder = (id, updates) => {
  const idx = orders.findIndex((o) => o._id === id);
  if (idx < 0) return null;
  orders[idx] = { ...orders[idx], ...updates, updatedAt: new Date().toISOString() };
  saveOrders();
  return orders[idx];
};

// Addresses
export const getAddressesByUser = (userId) =>
  addresses.filter((a) => a.userId === userId);

export const addAddress = (address) => {
  addresses.push(address);
  saveAddresses();
  return address;
};

export const updateAddressById = (id, data) => {
  const idx = addresses.findIndex((a) => a._id === id);
  if (idx < 0) return null;
  addresses[idx] = { ...addresses[idx], ...data, updatedAt: new Date().toISOString() };
  saveAddresses();
  return addresses[idx];
};

export const deleteAddressById = (id) => {
  const before = addresses.length;
  addresses = addresses.filter((a) => a._id !== id);
  if (addresses.length < before) saveAddresses();
  return before > addresses.length;
};

// Wishlists
export const getWishlistByUser = (userId) => {
  if (!wishlists[userId]) wishlists[userId] = [];
  return wishlists[userId]
    .map((id) => getProductById(id))
    .filter(Boolean);
};

export const addToWishlistStore = (userId, productId) => {
  if (!wishlists[userId]) wishlists[userId] = [];
  if (!wishlists[userId].includes(productId)) {
    wishlists[userId].push(productId);
    saveWishlists();
  }
  return getWishlistByUser(userId);
};

export const removeFromWishlistStore = (userId, productId) => {
  if (!wishlists[userId]) return [];
  wishlists[userId] = wishlists[userId].filter((id) => id !== productId);
  saveWishlists();
  return getWishlistByUser(userId);
};

// Users
const saveUsers = () => writeJson(files.users, users);

export const findUserByEmail = (email) =>
  users.find((u) => u.email === email.toLowerCase());

export const findUserById = (id) => users.find((u) => u._id === id);

export const createUser = async (data) => {
  const user = {
    _id: newId(),
    ...data,
    role: data.role || 'user',
    loyaltyPoints: data.loyaltyPoints ?? 0,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers();
  return user;
};

export const updateUser = (id, updates) => {
  const idx = users.findIndex((u) => u._id === id);
  if (idx < 0) return null;
  users[idx] = { ...users[idx], ...updates };
  saveUsers();
  return users[idx];
};

export const addLoyaltyPoints = (userId, points) => {
  const user = findUserById(userId);
  if (!user) return null;
  user.loyaltyPoints = (user.loyaltyPoints || 0) + points;
  saveUsers();
  return user;
};

export const getFlashDealProducts = () =>
  products.filter((p) => p.salePrice && p.saleEndsAt);

export const resetStore = () => {
  const CATALOG_VERSION = 5;
  products = defaultProducts.map((p) => ({ ...p, catalogVersion: CATALOG_VERSION }));
  orders = [];
  addresses = [];
  wishlists = {};
  coupons = defaultCoupons;
  emails = [];
  notifications = [];
  seedDefaultUsers();
  saveProducts();
  saveOrders();
  saveAddresses();
  saveWishlists();
  saveCoupons();
  saveEmails();
  saveNotifications();
};

// Emails store access
export const getEmailsStore = (userId) => {
  return emails.filter((e) => !userId || e.userId === userId || e.userId === 'all').sort((a, b) => new Date(b.date) - new Date(a.date));
};
export const addEmailStore = (emailData) => {
  const email = { _id: newId(), date: new Date().toISOString(), ...emailData };
  emails.push(email);
  saveEmails();
  return email;
};
export const deleteEmailStore = (id) => {
  emails = emails.filter((e) => e._id !== id);
  saveEmails();
  return true;
};
export const clearEmailsStore = () => {
  emails = [];
  saveEmails();
  return true;
};

// Notifications store access
export const getNotificationsStore = (userId) => {
  return notifications.filter((n) => !userId || n.userId === userId || n.userId === 'all').sort((a, b) => new Date(b.date) - new Date(a.date));
};
export const addNotificationStore = (notifData) => {
  const notif = { _id: newId(), date: new Date().toISOString(), read: false, ...notifData };
  notifications.push(notif);
  saveNotifications();
  return notif;
};
export const markNotificationReadStore = (id) => {
  const idx = notifications.findIndex((n) => n._id === id);
  if (idx >= 0) {
    notifications[idx].read = true;
    saveNotifications();
    return notifications[idx];
  }
  return null;
};
export const deleteNotificationStore = (id) => {
  notifications = notifications.filter((n) => n._id !== id);
  saveNotifications();
  return true;
};
export const clearNotificationsStore = (userId) => {
  if (userId) {
    notifications = notifications.filter((n) => n.userId !== userId);
  } else {
    notifications = [];
  }
  saveNotifications();
  return true;
};

// Admin Coupon management
export const addCouponStore = (coupon) => {
  const newCoupon = { _id: newId(), active: true, ...coupon, code: coupon.code.toUpperCase() };
  coupons.push(newCoupon);
  saveCoupons();
  return newCoupon;
};
export const toggleCouponStore = (code, active) => {
  const c = coupons.find((coupon) => coupon.code === code.toUpperCase());
  if (c) {
    c.active = active;
    saveCoupons();
    return c;
  }
  return null;
};

// Admin Product management
export const addProductStore = (productData) => {
  const prod = { _id: newId(), rating: 4.5, trending: false, ...productData };
  products.push(prod);
  saveProducts();
  return prod;
};
export const updateProductStockStore = (id, stock) => {
  const idx = products.findIndex((p) => p._id === id);
  if (idx >= 0) {
    products[idx].stock = Number(stock);
    saveProducts();
    return products[idx];
  }
  return null;
};
