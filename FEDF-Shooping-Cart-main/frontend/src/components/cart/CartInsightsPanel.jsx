import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { computeCartHealthScore } from '../../utils/cartHealth';

export default function CartInsightsPanel() {
  const {
    cartTotal,
    budgetLimit,
    setBudgetLimit,
    groupCode,
    enableGroupPurchase,
    priceLockEnabled,
    setPriceLockEnabled,
    cart,
    cartHealth,
  } = useCart();

  const budgetUsed = budgetLimit > 0 ? Math.min(100, (cartTotal / budgetLimit) * 100) : 0;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="card p-5 border-l-4 border-emerald-500">
        <h3 className="font-bold flex items-center gap-2">💰 Smart Budget Cart</h3>
        <p className="text-xs text-gray-500 mt-1 mb-3">Set a spending cap and track usage</p>
        <div className="flex gap-2">
          <input
            type="number"
            className="input-field flex-1"
            placeholder="Budget (₹)"
            value={budgetLimit || ''}
            onChange={(e) => setBudgetLimit(Number(e.target.value) || 0)}
          />
        </div>
        {budgetLimit > 0 && (
          <>
            <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  budgetUsed >= 100 ? 'bg-red-500' : budgetUsed >= 85 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${budgetUsed}%` }}
              />
            </div>
            <p className="text-sm mt-2">
              {formatCurrency(cartTotal)} / {formatCurrency(budgetLimit)}
              {cartTotal > budgetLimit && (
                <span className="text-red-600 font-medium"> — over budget!</span>
              )}
            </p>
          </>
        )}
      </div>

      <div className="card p-5 border-l-4 border-violet-500">
        <h3 className="font-bold flex items-center gap-2">👥 Group Purchase Cart</h3>
        <p className="text-xs text-gray-500 mt-1 mb-3">Create a code friends can use at checkout</p>
        {groupCode ? (
          <div className="bg-violet-50 dark:bg-violet-900/30 p-3 rounded-lg">
            <p className="text-xs text-gray-500">Share this code</p>
            <p className="font-mono font-bold text-lg text-violet-700 dark:text-violet-300">{groupCode}</p>
            <p className="text-xs mt-1">3 members joined (demo)</p>
          </div>
        ) : (
          <button type="button" className="btn-primary w-full" onClick={enableGroupPurchase}>
            Start Group Cart
          </button>
        )}
      </div>

      <div className="card p-5 border-l-4 border-blue-500">
        <h3 className="font-bold flex items-center gap-2">🔒 Price Lock Feature</h3>
        <p className="text-xs text-gray-500 mt-1 mb-3">Lock prices for 24h when items enter cart</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={priceLockEnabled}
            onChange={(e) => setPriceLockEnabled(e.target.checked)}
            className="w-5 h-5"
          />
          <span className="text-sm font-medium">
            {priceLockEnabled ? 'Price lock ON' : 'Price lock OFF'}
          </span>
        </label>
        {priceLockEnabled && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            {cart.filter((i) => i.priceLockedUntil > Date.now()).length} item(s) locked
          </p>
        )}
      </div>

      <div className="card p-5 border-l-4 border-amber-500">
        <h3 className="font-bold flex items-center gap-2">📊 Cart Health Score</h3>
        <div className="flex items-center gap-4 mt-3">
          <div
            className={`text-4xl font-bold ${
              cartHealth.score >= 70 ? 'text-emerald-600' : cartHealth.score >= 45 ? 'text-amber-600' : 'text-red-600'
            }`}
          >
            {cartHealth.score}
          </div>
          <div>
            <p className="font-semibold">{cartHealth.label}</p>
            <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
              {cartHealth.tips.slice(0, 3).map((t) => (
                <li key={t}>• {t}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
