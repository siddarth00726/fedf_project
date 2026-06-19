import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from '../../context/CheckoutContext';
import toast from 'react-hot-toast';

const PAYMENT_OPTIONS = [
  { id: 'Credit Card', name: 'Credit Card', icon: '💳' },
  { id: 'Debit Card', name: 'Debit Card', icon: '⚡' },
  { id: 'UPI', name: 'UPI (GPay / PhonePe)', icon: '📱' },
  { id: 'PayPal', name: 'PayPal Sandbox', icon: '🔵' },
  { id: 'Cash On Delivery', name: 'Cash On Delivery (COD)', icon: '💵' },
];

export default function Payment() {
  const { checkoutItems, paymentMethod, setPaymentMethod, paymentDetails, setPaymentDetails, selectedAddress } = useCheckout();
  const [details, setDetails] = useState(paymentDetails || {});
  const [isFlipped, setIsFlipped] = useState(false);
  const [upiTimer, setUpiTimer] = useState(120);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!checkoutItems.length || !selectedAddress) {
      navigate('/checkout/address');
    }
  }, [checkoutItems, selectedAddress, navigate]);

  // UPI Countdown Timer
  useEffect(() => {
    if (paymentMethod !== 'UPI') return;
    setUpiTimer(120);
    const interval = setInterval(() => {
      setUpiTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentMethod]);

  // Captcha Generator for COD
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  useEffect(() => {
    if (paymentMethod === 'Cash On Delivery') {
      generateCaptcha();
    }
  }, [paymentMethod]);

  const isCard = paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card';
  const isUpi = paymentMethod === 'UPI';
  const isCod = paymentMethod === 'Cash On Delivery';

  const handleContinue = () => {
    if (!paymentMethod) return toast.error('Select a payment method');

    if (isCard) {
      const { cardNumber, cardHolder, expiry, cvv } = details;
      if (!cardNumber || cardNumber.length < 16) return toast.error('Valid 16-digit Card Number required');
      if (!cardHolder || !cardHolder.trim()) return toast.error('Card Holder Name required');
      if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) return toast.error('Expiry required (MM/YY)');
      if (!cvv || cvv.length < 3) return toast.error('Valid CVV required');
    }

    if (isUpi && (!details.upiId || !details.upiId.includes('@'))) {
      return toast.error('Please enter a valid UPI ID (e.g. user@upi)');
    }

    if (isCod) {
      if (captchaInput.toUpperCase() !== captchaCode) {
        toast.error('Incorrect security code');
        generateCaptcha();
        return;
      }
    }

    setPaymentDetails(details);
    navigate('/checkout/summary');
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      {/* CSS injection for flipping card */}
      <style>{`
        .flip-card {
          perspective: 1000px;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .flip-card-flipped {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Checkout Progress Tracker */}
      <div className="flex justify-between items-center max-w-lg mx-auto py-2">
        {[
          { label: 'Address', active: false, done: true },
          { label: 'Payment', active: true, done: false },
          { label: 'Review', active: false, done: false },
        ].map((step, idx) => (
          <div key={step.label} className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step.active
                  ? 'bg-primary-600 text-white shadow-md ring-2 ring-primary-300'
                  : step.done
                  ? 'bg-primary-100 text-primary-600 font-bold'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
            >
              {step.done ? '✓' : idx + 1}
            </span>
            <span className={`text-sm font-semibold ${step.active || step.done ? 'text-primary-600' : 'text-gray-400'}`}>
              {step.label}
            </span>
            {idx < 2 && <span className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700 block"></span>}
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Options List */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold tracking-tight">Payment Method</h1>
            <span className="text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full font-semibold">
              Step 2 of 3
            </span>
          </div>

          <div className="card divide-y divide-gray-200 dark:divide-gray-700">
            {PAYMENT_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-4 cursor-pointer p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                  paymentMethod === opt.id ? 'bg-primary-50/10 dark:bg-primary-900/5' : ''
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  checked={paymentMethod === opt.id}
                  onChange={() => {
                    setPaymentMethod(opt.id);
                    setIsFlipped(false);
                  }}
                />
                <span className="text-2xl select-none">{opt.icon}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{opt.name}</span>
              </label>
            ))}
          </div>

          {paymentMethod && (
            <button
              onClick={handleContinue}
              className="btn-primary w-full py-3.5 shadow-lg shadow-primary-500/20 text-center font-bold tracking-wide transition-all hover:scale-[1.01]"
            >
              Verify & Continue &rarr;
            </button>
          )}
        </div>

        {/* Right Side: Specific Details Form */}
        <div className="w-full md:w-96 space-y-6">
          {isCard && (
            <div className="space-y-6">
              {/* Flipping Card UI */}
              <div className="w-full h-48 flip-card">
                <div className={`flip-card-inner rounded-2xl w-full h-full shadow-xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-indigo-900 text-white p-6 flex flex-col justify-between ${
                  isFlipped ? 'flip-card-flipped' : ''
                }`}>
                  {/* Front View */}
                  <div className="flip-card-front flex flex-col justify-between h-full w-full">
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-bold tracking-wider">SMART BANK</div>
                      <div className="text-2xl font-bold italic">VISA</div>
                    </div>
                    {/* Chip */}
                    <div className="w-10 h-7 bg-amber-200/70 rounded-md"></div>
                    <div>
                      <div className="text-lg font-mono tracking-widest text-center mt-2">
                        {formatCardNumber(details.cardNumber || '') || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex justify-between mt-4">
                        <div className="text-xs uppercase tracking-wider">
                          <p className="text-[8px] text-indigo-200">Holder</p>
                          <p className="truncate max-w-[150px] font-semibold">{details.cardHolder || 'FULL NAME'}</p>
                        </div>
                        <div className="text-xs uppercase tracking-wider text-right">
                          <p className="text-[8px] text-indigo-200">Expires</p>
                          <p className="font-semibold">{details.expiry || 'MM/YY'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Back View */}
                  <div className="flip-card-back flex flex-col justify-between h-full w-full">
                    {/* Magnetic strip */}
                    <div className="h-10 bg-black -mx-6 mt-2"></div>
                    <div>
                      <div className="text-right text-[8px] text-indigo-200 uppercase tracking-widest mr-2">CVV</div>
                      <div className="bg-white text-gray-800 py-1.5 px-3 rounded-lg text-right font-mono font-bold tracking-widest text-sm flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 italic">Signature Strip</span>
                        <span>{details.cvv || '•••'}</span>
                      </div>
                    </div>
                    <div className="text-[8px] text-indigo-200 leading-normal">
                      This simulated credit card belongs strictly to the user sandbox environment. Unauthorized duplication is mock-regulated.
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="card p-6 space-y-4">
                <h3 className="font-extrabold text-sm text-gray-500 uppercase tracking-wider">Enter Card Details</h3>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Cardholder Name</label>
                  <input
                    className="input-field py-2"
                    placeholder="e.g. John Doe"
                    value={details.cardHolder || ''}
                    onChange={(e) => setDetails({ ...details, cardHolder: e.target.value })}
                    onFocus={() => setIsFlipped(false)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Card Number</label>
                  <input
                    className="input-field py-2 font-mono"
                    placeholder="16-digit card number"
                    maxLength={19}
                    value={formatCardNumber(details.cardNumber || '')}
                    onChange={(e) => setDetails({ ...details, cardNumber: e.target.value.replace(/\s+/g, '') })}
                    onFocus={() => setIsFlipped(false)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Expiry Date</label>
                    <input
                      className="input-field py-2 text-center"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={details.expiry || ''}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
                        setDetails({ ...details, expiry: val });
                      }}
                      onFocus={() => setIsFlipped(false)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">CVV Code</label>
                    <input
                      className="input-field py-2 text-center font-mono"
                      placeholder="3 digits"
                      maxLength={3}
                      value={details.cvv || ''}
                      onChange={(e) => setDetails({ ...details, cvv: e.target.value.replace(/[^0-9]/g, '') })}
                      onFocus={() => setIsFlipped(true)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {isUpi && (
            <div className="card p-6 space-y-6 text-center">
              <h3 className="font-extrabold text-sm text-gray-500 uppercase tracking-wider text-left">Scan QR or enter UPI VPA</h3>
              
              {/* QR Code graphic */}
              <div className="w-40 h-40 bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl mx-auto flex flex-col items-center justify-center p-3 relative group">
                {upiTimer > 0 ? (
                  <>
                    {/* Simulated QR blocks using CSS gradients or grids */}
                    <div className="w-full h-full bg-[radial-gradient(#1e293b_20%,transparent_20%)] dark:bg-[radial-gradient(#f8fafc_20%,transparent_20%)] [background-size:8px_8px] opacity-75"></div>
                    <div className="absolute w-8 h-8 bg-black dark:bg-white top-3 left-3 rounded-sm"></div>
                    <div className="absolute w-8 h-8 bg-black dark:bg-white top-3 right-3 rounded-sm"></div>
                    <div className="absolute w-8 h-8 bg-black dark:bg-white bottom-3 left-3 rounded-sm"></div>
                  </>
                ) : (
                  <div className="text-red-500 text-xs font-bold font-mono">QR EXPIRED</div>
                )}
              </div>

              {upiTimer > 0 ? (
                <p className="text-xs text-gray-500">
                  Simulated QR Code expires in <span className="font-mono text-primary-600 font-bold">{Math.floor(upiTimer / 60)}:{(upiTimer % 60).toString().padStart(2, '0')}</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setUpiTimer(120)}
                  className="text-xs text-primary-600 hover:underline font-bold"
                >
                  🔄 Refresh QR Code
                </button>
              )}

              <div className="border-t pt-4">
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider text-left">UPI ID (VPA)</label>
                <input
                  className="input-field py-2 text-center font-semibold"
                  placeholder="e.g. john@upi"
                  value={details.upiId || ''}
                  onChange={(e) => setDetails({ ...details, upiId: e.target.value })}
                />
              </div>
            </div>
          )}

          {isCod && (
            <div className="card p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-gray-500 uppercase tracking-wider">COD Security Captcha</h3>
              <p className="text-xs text-gray-500">Type the characters shown in the graphic box to confirm your order.</p>

              <div className="flex gap-4 items-center">
                {/* Visual Captcha Box */}
                <div className="bg-slate-200 dark:bg-slate-900 border text-slate-800 dark:text-slate-100 font-mono font-extrabold tracking-widest text-lg py-2.5 px-6 rounded-lg select-none line-through decoration-indigo-500/50 skew-y-3 skew-x-3 w-32 text-center">
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="text-xs text-primary-600 hover:underline font-bold"
                >
                  🔄 Refresh
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Security Characters</label>
                <input
                  className="input-field py-2 uppercase text-center font-mono font-bold tracking-widest"
                  placeholder="e.g. AB123"
                  maxLength={5}
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {!paymentMethod && (
            <div className="card p-6 text-center text-gray-400 py-16">
              <span className="text-4xl mb-2 block">🏦</span>
              <p className="text-sm font-semibold">Select a payment option from the left to unlock details verification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
