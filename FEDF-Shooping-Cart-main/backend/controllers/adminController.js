import { getAllOrders } from '../data/store.js';

export const getDashboardStats = async (req, res) => {
  try {
    const orders = getAllOrders();
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
    const pendingOrders = orders.filter((o) => o.status !== 'Delivered').length;
    const revenue = orders.reduce((sum, o) => sum + o.finalTotal, 0);
    res.json({ totalOrders, deliveredOrders, pendingOrders, revenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const orders = getAllOrders();
    const revenueByDay = {};
    const ordersByDay = {};
    const productSales = {};
    const categoryCount = {};

    orders.forEach((order) => {
      const day = order.createdAt.split('T')[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + order.finalTotal;
      ordersByDay[day] = (ordersByDay[day] || 0) + 1;
      order.items.forEach((item) => {
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
        if (item.category) {
          categoryCount[item.category] = (categoryCount[item.category] || 0) + item.quantity;
        }
      });
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sales]) => ({ name, sales }));

    res.json({
      revenueChart: Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue })),
      ordersPerDay: Object.entries(ordersByDay).map(([date, count]) => ({ date, count })),
      topSellingProducts: topProducts,
      categoryDistribution: Object.entries(categoryCount).map(([category, count]) => ({
        category,
        count,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrdersAdmin = async (req, res) => {
  try {
    res.json(getAllOrders());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
