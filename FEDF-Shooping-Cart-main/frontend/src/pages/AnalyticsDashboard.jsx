import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { getAdminAnalytics } from '../services/api';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getAdminAnalytics()
      .then(({ data: analytics }) => setData(analytics))
      .catch(() => toast.error('Failed to load analytics'));
  }, []);

  if (!data) {
    return <p className="text-center py-12">Loading analytics...</p>;
  }

  const revenueChart = {
    labels: data.revenueChart.map((d) => d.date),
    datasets: [{ label: 'Revenue (₹)', data: data.revenueChart.map((d) => d.revenue), borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.1)', fill: true }],
  };

  const ordersChart = {
    labels: data.ordersPerDay.map((d) => d.date),
    datasets: [{ label: 'Orders', data: data.ordersPerDay.map((d) => d.count), backgroundColor: '#10b981' }],
  };

  const topProductsChart = {
    labels: data.topSellingProducts.map((p) => p.name),
    datasets: [{ label: 'Units Sold', data: data.topSellingProducts.map((p) => p.sales), backgroundColor: '#8b5cf6' }],
  };

  const categoryChart = {
    labels: data.categoryDistribution.map((c) => c.category),
    datasets: [{ data: data.categoryDistribution.map((c) => c.count), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'] }],
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Revenue Chart</h2>
          <Line data={revenueChart} options={{ responsive: true }} />
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Orders Per Day</h2>
          <Bar data={ordersChart} options={{ responsive: true }} />
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Top Selling Products</h2>
          <Bar data={topProductsChart} options={{ responsive: true, indexAxis: 'y' }} />
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Category Distribution</h2>
          <Doughnut data={categoryChart} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
}
