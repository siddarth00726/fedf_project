import { isExpiringSoon } from './cartExpiry';

export const computeCartHealthScore = ({ cart, cartTotal, budgetLimit, priceLockEnabled }) => {
  let score = 100;
  if (!cart.length) return { score: 100, label: 'Excellent', tips: ['Cart is empty — start shopping!'] };

  const tips = [];

  if (budgetLimit > 0 && cartTotal > budgetLimit) {
    score -= 25;
    tips.push('Over smart budget — remove items or raise limit');
  } else if (budgetLimit > 0 && cartTotal > budgetLimit * 0.85) {
    score -= 10;
    tips.push('Approaching budget limit');
  }

  const expiring = cart.filter((i) => isExpiringSoon(i.addedAt));
  if (expiring.length) {
    score -= 15;
    tips.push(`${expiring.length} item(s) expiring soon`);
  }

  if (cart.length > 8) {
    score -= 8;
    tips.push('Large cart — consider checkout');
  }

  const locked = cart.filter((i) => i.priceLockedUntil && i.priceLockedUntil > Date.now());
  if (priceLockEnabled && locked.length) {
    score += 5;
    tips.push(`${locked.length} price-locked item(s) protected`);
  }

  score = Math.max(0, Math.min(100, score));
  const label =
    score >= 85 ? 'Excellent' : score >= 65 ? 'Good' : score >= 45 ? 'Fair' : 'Needs attention';

  return { score, label, tips };
};
