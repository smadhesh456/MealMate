import type { CartItem, BillBreakdown } from '../types';

export const FEE_CONFIG = {
  DELIVERY_FEE_BASE: 25,
  DELIVERY_FREE_THRESHOLD: 300,
  PLATFORM_FEE: 5,
  COUPONS: {
    'MEAL10': { code: 'MEAL10', minOrder: 100, discountPercent: 10, maxDiscount: 40, description: '10% off up to ₹40 on orders above ₹100' },
    'COLLEGE20': { code: 'COLLEGE20', minOrder: 150, discountPercent: 20, maxDiscount: 50, description: '20% off up to ₹50 on campus orders' },
    'FREEDEL': { code: 'FREEDEL', minOrder: 80, discountFixed: 25, description: 'Free delivery (₹25 off)' },
  }
};

/**
 * Centrally authoritative pricing calculation function
 */
export function calculateBill(
  items: CartItem[], 
  couponCode?: string,
  useRewardPoints?: boolean
): BillBreakdown {
  if (!items || items.length === 0) {
    return {
      itemTotal: 0,
      savingsTotal: 0,
      deliveryFee: 0,
      platformFee: 0,
      couponDiscount: 0,
      rewardDiscount: 0,
      rewardPointsUsed: 0,
      finalTotal: 0,
    };
  }

  let itemTotal = 0;
  let savingsTotal = 0;

  for (const item of items) {
    const qty = item.quantity;
    const price = item.foodItem.price;
    itemTotal += price * qty;

    if (item.foodItem.originalPrice && item.foodItem.originalPrice > price) {
      savingsTotal += (item.foodItem.originalPrice - price) * qty;
    }
  }

  // Delivery fee rules
  const deliveryFee = itemTotal >= FEE_CONFIG.DELIVERY_FREE_THRESHOLD ? 0 : FEE_CONFIG.DELIVERY_FEE_BASE;
  const platformFee = FEE_CONFIG.PLATFORM_FEE;

  // Coupon calculation
  let couponDiscount = 0;
  if (couponCode && FEE_CONFIG.COUPONS[couponCode as keyof typeof FEE_CONFIG.COUPONS]) {
    const coupon = FEE_CONFIG.COUPONS[couponCode as keyof typeof FEE_CONFIG.COUPONS];
    if (itemTotal >= coupon.minOrder) {
      if ('discountPercent' in coupon && coupon.discountPercent) {
        const calc = Math.round((itemTotal * coupon.discountPercent) / 100);
        couponDiscount = Math.min(calc, coupon.maxDiscount || calc);
      } else if ('discountFixed' in coupon && coupon.discountFixed) {
        couponDiscount = Math.min(itemTotal, coupon.discountFixed);
      }
    }
  }

  // 100 Reward Points = 20% Offer on Food Order
  let rewardDiscount = 0;
  let rewardPointsUsed = 0;
  if (useRewardPoints && itemTotal > 0) {
    rewardDiscount = Math.round((itemTotal * 20) / 100);
    rewardPointsUsed = 100;
  }

  const finalTotal = Math.max(0, itemTotal + deliveryFee + platformFee - couponDiscount - rewardDiscount);

  return {
    itemTotal,
    savingsTotal,
    deliveryFee,
    platformFee,
    couponDiscount,
    rewardDiscount,
    rewardPointsUsed,
    finalTotal,
  };
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function formatSimplePrice(amount: number): string {
  return `₹${amount}`;
}
