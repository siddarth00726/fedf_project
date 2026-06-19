import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getEmails, deleteEmail, clearEmails } from '../services/api';
import { getUserId } from '../utils/userId';

export default function Inbox() {
  const { user } = useAuth();
  const userId = getUserId(user);
  const [emailsList, setEmailsList] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadEmails = async () => {
    try {
      const { data } = await getEmails(userId);
      setEmailsList(data);
      if (data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
      }
    } catch {
      toast.error('Failed to load email sandbox');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
    const interval = setInterval(loadEmails, 6000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteEmail(id);
      toast.success('Email deleted from sandbox');
      if (selectedEmail?._id === id) {
        setSelectedEmail(null);
      }
      loadEmails();
    } catch {
      toast.error('Failed to delete email');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear the email sandbox?')) return;
    try {
      await clearEmails();
      toast.success('Sandbox cleared');
      setSelectedEmail(null);
      setEmailsList([]);
    } catch {
      toast.error('Failed to clear emails');
    }
  };

  const filteredEmails = emailsList.filter((email) => {
    if (filter === 'all') return true;
    if (filter === 'receipts') return email.category === 'receipt';
    if (filter === 'shipping') return email.category === 'shipping_update';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">📬 Email Mock Sandbox</h1>
          <p className="text-sm text-gray-500 mt-1">
            Observe the transaction receipt and shipping alert emails sent to <strong>{user?.email || 'demo@smartcart.com'}</strong>.
          </p>
        </div>
        {emailsList.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 rounded-lg text-sm font-semibold transition-colors shrink-0"
          >
            🗑 Clear Inbox Sandbox
          </button>
        )}
      </div>

      {loading && emailsList.length === 0 ? (
        <div className="text-center py-16 card">
          <p className="animate-pulse text-gray-500">Loading mailbox sandbox...</p>
        </div>
      ) : emailsList.length === 0 ? (
        <div className="text-center py-16 card space-y-3">
          <div className="text-5xl">📨</div>
          <h3 className="font-bold text-lg">Inbox Sandbox is Empty</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Place an order or update an order's shipping status from the Admin Dashboard to simulate sending professional customer emails.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 card overflow-hidden border border-gray-200 dark:border-gray-700 min-h-[600px]">
          {/* Email List Sidebar */}
          <div className="md:col-span-1 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50/50 dark:bg-gray-900/30">
            {/* Category tabs */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex gap-2 text-xs font-semibold">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('receipts')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  filter === 'receipts'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Receipts
              </button>
              <button
                onClick={() => setFilter('shipping')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  filter === 'shipping'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Shipments
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEmails.map((email) => (
                <div
                  key={email._id}
                  onClick={() => setSelectedEmail(email)}
                  className={`p-4 cursor-pointer text-left transition-all ${
                    selectedEmail?._id === email._id
                      ? 'bg-white dark:bg-gray-800 border-l-4 border-primary-600'
                      : 'hover:bg-white/50 dark:hover:bg-gray-800/40'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {email.category === 'receipt' ? '🧾 Billing Confirmation' : '🚚 Carrier Alert'}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(email.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs text-gray-700 dark:text-gray-300 mt-1 line-clamp-1">
                    {email.subject}
                  </h4>
                  <div className="flex justify-between items-center mt-2 text-[10px] text-gray-400">
                    <span>To: {email.to}</span>
                    <button
                      onClick={(e) => handleDelete(e, email._id)}
                      className="hover:text-red-500 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {filteredEmails.length === 0 && (
                <p className="p-8 text-xs text-center text-gray-400">No emails fit this filter.</p>
              )}
            </div>
          </div>

          {/* Email View Pane */}
          <div className="md:col-span-2 flex flex-col bg-white dark:bg-gray-900 overflow-y-auto p-4 md:p-6 min-h-[500px]">
            {selectedEmail ? (
              <div className="space-y-4 flex flex-col h-full">
                <div className="border-b border-gray-100 dark:border-gray-700 pb-4 space-y-2 text-left">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedEmail.subject}
                    </h2>
                    <span className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full font-medium capitalize">
                      {selectedEmail.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 flex flex-col gap-1">
                    <p>
                      <strong>From:</strong> SmartCart Automated Dispatcher &lt;no-reply@smartcart.com&gt;
                    </p>
                    <p>
                      <strong>To:</strong> {selectedEmail.to}
                    </p>
                    <p>
                      <strong>Sent:</strong> {new Date(selectedEmail.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                {/* HTML Body Display */}
                <div className="flex-1 border rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950 p-1 md:p-4 min-h-[400px]">
                  <div
                    className="email-body-container bg-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-gray-400 py-16">
                <span className="text-5xl mb-2">📨</span>
                <p className="text-sm">Select an email to view full transaction HTML markup</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
