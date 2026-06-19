import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from '../../context/CheckoutContext';
import { createAddress, deleteAddress, getAddresses, updateAddress } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getUserId } from '../../utils/userId';
import toast from 'react-hot-toast';

const emptyForm = { fullName: '', mobile: '', street: '', city: '', state: '', pincode: '', tag: 'Home' };

export default function Address() {
  const { checkoutItems, selectedAddress, setSelectedAddress } = useCheckout();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = getUserId(user);

  useEffect(() => {
    if (!checkoutItems.length) {
      navigate('/');
      return;
    }
    loadAddresses();
  }, [checkoutItems, navigate]);

  const loadAddresses = async () => {
    try {
      const { data } = await getAddresses(userId);
      setAddresses(data);
      if (data.length > 0 && !selectedAddress) {
        setSelectedAddress(data[0]);
      }
    } catch {
      toast.error('Failed to load addresses');
    }
  };

  const validate = () => {
    if (!form.fullName.trim()) return 'Full name is required';
    if (!/^[6-9]\d{9}$/.test(form.mobile)) return 'Valid 10-digit mobile required';
    if (!form.street.trim()) return 'Street is required';
    if (!form.city.trim()) return 'City is required';
    if (!form.state.trim()) return 'State is required';
    if (!/^\d{6}$/.test(form.pincode)) return 'Valid 6-digit pincode required';
    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);
    try {
      if (editingId) {
        await updateAddress(editingId, { ...form, userId });
        toast.success('Address updated successfully');
      } else {
        await createAddress({ ...form, userId });
        toast.success('New address added');
      }
      setForm(emptyForm);
      setEditingId(null);
      loadAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleEdit = (addr) => {
    setEditingId(addr._id);
    setForm({
      fullName: addr.fullName,
      mobile: addr.mobile,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      tag: addr.tag || 'Home',
    });
    // Scroll form into view
    document.getElementById('address-editor-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await deleteAddress(id);
      toast.success('Address deleted');
      if (selectedAddress?._id === id) setSelectedAddress(null);
      loadAddresses();
    } catch {
      toast.error('Failed to delete address');
    }
  };

  const handleGPSDetect = () => {
    setDetecting(true);
    toast('Detecting GPS location...', { icon: '📍' });
    setTimeout(() => {
      setForm({
        ...form,
        street: '14, Tech Park Boulevard, Sector 5',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103',
      });
      setDetecting(false);
      toast.success('Mock coordinates auto-resolved!');
    }, 1500);
  };

  const handleContinue = () => {
    if (!selectedAddress) return toast.error('Please select a delivery address');
    navigate('/checkout/payment');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      {/* Checkout Progress Tracker */}
      <div className="flex justify-between items-center max-w-lg mx-auto py-2">
        {[
          { label: 'Address', active: true, done: false },
          { label: 'Payment', active: false, done: false },
          { label: 'Review', active: false, done: false },
        ].map((step, idx) => (
          <div key={step.label} className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step.active
                  ? 'bg-primary-600 text-white shadow-md ring-2 ring-primary-300'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
            >
              {idx + 1}
            </span>
            <span className={`text-sm font-semibold ${step.active ? 'text-primary-600' : 'text-gray-400'}`}>
              {step.label}
            </span>
            {idx < 2 && <span className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700 block"></span>}
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left pane: Address Lists & Continue buttons */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold tracking-tight">Delivery Address</h1>
            <span className="text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full font-semibold">
              Step 1 of 3
            </span>
          </div>

          {addresses.length === 0 ? (
            <div className="card p-8 text-center space-y-3 bg-gray-50/50 dark:bg-gray-900/30">
              <span className="text-4xl">🏠</span>
              <h3 className="font-bold">No Saved Addresses Found</h3>
              <p className="text-xs text-gray-500">Please fill the form on the right to register your delivery details.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Select Delivery Location</h2>
              <div className="grid gap-3">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`card p-5 cursor-pointer border-2 transition-all relative group flex flex-col justify-between ${
                      selectedAddress?._id === addr._id
                        ? 'border-primary-600 shadow-md bg-primary-50/10 dark:bg-primary-900/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAddress(addr)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-gray-900 dark:text-white">{addr.fullName}</p>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                          {addr.tag || 'Home'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{addr.mobile}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>

                    <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <button
                        type="button"
                        className="text-xs text-primary-600 hover:underline font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(addr);
                        }}
                      >
                        ✏ Edit Address
                      </button>
                      <button
                        type="button"
                        className="text-xs text-red-500 hover:underline font-semibold ml-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(addr._id);
                        }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {addresses.length > 0 && (
            <button
              onClick={handleContinue}
              className="btn-primary w-full py-3.5 shadow-lg shadow-primary-500/20 text-center font-bold tracking-wide transition-all hover:scale-[1.01]"
            >
              Deliver to Selected Address &rarr;
            </button>
          )}
        </div>

        {/* Right pane: Address Edit Form & Simulator Map */}
        <div className="w-full md:w-96 space-y-6">
          <form id="address-editor-form" onSubmit={handleSave} className="card p-6 space-y-4">
            <div>
              <h2 className="font-extrabold text-lg text-gray-900 dark:text-white">
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h2>
              <p className="text-xs text-gray-400">Provide shipping coordinates for dispatch.</p>
            </div>

            {/* Quick Detect GPS location button */}
            <button
              type="button"
              disabled={detecting}
              onClick={handleGPSDetect}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-primary-400 text-primary-600 bg-primary-50/30 hover:bg-primary-50 dark:bg-primary-950/10 dark:hover:bg-primary-950/20 p-2.5 rounded-lg text-xs font-bold transition-colors"
            >
              📍 {detecting ? 'Locating...' : 'Auto-Detect Address (Simulated)'}
            </button>

            {/* Form Fields */}
            <div className="space-y-3">
              {[
                { name: 'fullName', label: 'Full Name', placeholder: 'e.g. John Doe' },
                { name: 'mobile', label: 'Mobile Number', placeholder: '10-digit number' },
                { name: 'street', label: 'Street Details', placeholder: 'Flat, House no, Colony' },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{f.label}</label>
                  <input
                    className="input-field py-2"
                    placeholder={f.placeholder}
                    value={form[f.name]}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    required
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'city', label: 'City' },
                  { name: 'state', label: 'State' },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{f.label}</label>
                    <input
                      className="input-field py-2"
                      value={form[f.name]}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                      required
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Pincode</label>
                <input
                  className="input-field py-2"
                  placeholder="6-digit PIN"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  required
                />
              </div>

              {/* Tag selector */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Address Type</label>
                <div className="flex gap-2">
                  {['Home', 'Work', 'Other'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setForm({ ...form, tag })}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                        form.tag === tag
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white dark:bg-gray-800 text-gray-600 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-755 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="btn-primary flex-1 py-2 font-bold text-xs"
              >
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>

          {/* Interactive Mini-map mockup */}
          <div className="card p-4 space-y-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">📍 Mock Geo-Location Map</h4>
            <div className="h-28 bg-emerald-100 dark:bg-emerald-950/20 rounded-lg border overflow-hidden relative group cursor-pointer flex items-center justify-center">
              {/* Map grid mock */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 gap-px opacity-30 pointer-events-none">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div key={i} className="border-t border-l border-emerald-900/10 dark:border-emerald-500/10"></div>
                ))}
              </div>
              <div className="absolute text-center bg-white/90 dark:bg-gray-800/90 py-1.5 px-3 rounded shadow-sm text-[10px] font-semibold text-slate-600 dark:text-slate-300 select-none group-hover:scale-105 transition-all">
                Click map to select pin
              </div>
              {/* Floating pin indicator */}
              <span className="absolute text-3xl animate-bounce pointer-events-none" style={{ top: '35%', left: '48%' }}>
                📍
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
