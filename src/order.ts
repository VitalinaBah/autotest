export type Tier = 'basic' | 'silver' | 'gold';

export interface OrderItem {
  sku: string;
  price: number;
  qty: number;
}

export const TIER_DISCOUNT: Record<Tier, number> = {
  basic: 0,
  silver: 0.05,
  gold: 0.1,
};

export const BIG_ORDER_FROM = 2000;
export const BIG_ORDER_BONUS = 0.05;
export const MAX_DISCOUNT = 0.25;
export const FREE_SHIPPING_FROM = 1000;
export const SHIPPING_FEE = 60;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calcSubtotal(items: OrderItem[]): number {
  if (items.length === 0) throw new Error('EMPTY_ORDER');
  return items.reduce((sum, item) => {
    if (item.price < 0) throw new Error('NEGATIVE_PRICE');
    if (!Number.isInteger(item.qty) || item.qty <= 0) {
      throw new Error('INVALID_QTY');
    }
    return sum + item.price * item.qty;
  }, 0);
}

export function calcDiscountRate(
  tier: Tier,
  subtotal: number,
  promoRate = 0,
): number {
  if (promoRate < 0) throw new Error('INVALID_PROMO');
  let rate = TIER_DISCOUNT[tier];
  if (subtotal >= BIG_ORDER_FROM) rate += BIG_ORDER_BONUS;
  return Math.min(rate + promoRate, MAX_DISCOUNT);
}

export function calcShipping(amount: number): number {
  return amount >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
}

export function calcOrderTotal(
  items: OrderItem[],
  tier: Tier,
  promoRate = 0,
): number {
  const subtotal = calcSubtotal(items);
  const rate = calcDiscountRate(tier, subtotal, promoRate);
  const afterDiscount = round2(subtotal * (1 - rate));
  return round2(afterDiscount + calcShipping(afterDiscount));
}

/**
 * Варіант 4. Знижка за кількістю одиниць товару.
 *   1–9 одиниць   → 0 %
 *   10–49 одиниць → 3 %
 *   від 50        → 7 %
 * Кількість має бути цілим додатним числом, інакше INVALID_BULK_QTY.
 */
export const BULK_TIER_1_FROM = 10;
export const BULK_TIER_2_FROM = 50;
export const BULK_TIER_1_RATE = 0.03;
export const BULK_TIER_2_RATE = 0.07;

export function calcBulkDiscount(qty: number): number {
  if (!Number.isInteger(qty) || qty <= 0) {
    throw new Error('INVALID_BULK_QTY');
  }
  if (qty >= BULK_TIER_2_FROM) return BULK_TIER_2_RATE;
  if (qty >= BULK_TIER_1_FROM) return BULK_TIER_1_RATE;
  return 0;
}
