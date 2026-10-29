import express from 'express';
import { randomUUID } from 'node:crypto';

type Tier = 'basic' | 'silver' | 'gold';
interface Item { sku: string; price: number; qty: number }
interface Order {
  id: string; ownerId: string; tier: Tier; items: Item[];
  subtotal: number; discountRate: number; total: number; createdAt: string;
  promoCode?: string;
}

const USERS = [
  { id: 'u1', email: 'alice@example.com', password: 'Secret123', tier: 'gold' as Tier },
  { id: 'u2', email: 'bob@example.com', password: 'Secret123', tier: 'basic' as Tier },
];

const DISCOUNT: Record<Tier, number> = { basic: 0, silver: 0.05, gold: 0.1 };
const round2 = (n: number) => Math.round(n * 100) / 100;

// Варіант 4: довідник промокодів у пам'яті (код → додаткова знижка)
export const PROMO_CODES: Record<string, number> = {
  SAVE5: 0.05,
  SAVE10: 0.1,
  MEGA20: 0.2,
};
export const MAX_DISCOUNT = 0.25;

function toPublic({ ownerId, ...rest }: Order) {
  return rest;
}

export function createApp() {
  const app = express();
  app.use(express.json());
  const tokens = new Map<string, string>();
  const orders = new Map<string, Order>();

  app.post('/auth/login', (req, res) => {
    const user = USERS.find(
      (u) => u.email === req.body?.email && u.password === req.body?.password,
    );
    if (!user) return res.status(401).json({ code: 'INVALID_CREDENTIALS' });
    const token = randomUUID();
    tokens.set(token, user.id);
    res.json({ accessToken: token });
  });

  app.use('/orders', (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const userId = token ? tokens.get(token) : undefined;
    if (!userId) return res.status(401).json({ code: 'UNAUTHORIZED' });
    res.locals.user = USERS.find((u) => u.id === userId);
    next();
  });

  app.post('/orders', (req, res) => {
    const items: Item[] = req.body?.items;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ code: 'EMPTY_ORDER' });
    }
    for (const i of items) {
      if (typeof i.price !== 'number' || i.price < 0)
        return res.status(400).json({ code: 'INVALID_PRICE' });
      if (!Number.isInteger(i.qty) || i.qty <= 0)
        return res.status(400).json({ code: 'INVALID_QTY' });
    }
    const promoCode: unknown = req.body?.promoCode;
    if (promoCode !== undefined) {
      if (typeof promoCode !== 'string' || promoCode.trim() === '')
        return res.status(400).json({ code: 'INVALID_PROMO_CODE' });
      if (!Object.hasOwn(PROMO_CODES, promoCode))
        return res.status(422).json({ code: 'UNKNOWN_PROMO_CODE' });
    }
    const user = res.locals.user;
    const subtotal = round2(items.reduce((s, i) => s + i.price * i.qty, 0));
    let rate = DISCOUNT[user.tier as Tier];
    if (subtotal >= 2000) rate += 0.05;
    if (promoCode !== undefined) rate += PROMO_CODES[promoCode];
    const discountRate = round2(Math.min(rate, MAX_DISCOUNT));
    const afterDiscount = round2(subtotal * (1 - discountRate));
    const total = round2(afterDiscount + (afterDiscount >= 1000 ? 0 : 60));
    const order: Order = {
      id: randomUUID(), ownerId: user.id, tier: user.tier, items,
      subtotal, discountRate, total, createdAt: new Date().toISOString(),
      ...(promoCode !== undefined && { promoCode }),
    };
    orders.set(order.id, order);
    res.status(201).location(`/orders/${order.id}`).json(toPublic(order));
  });

  app.get('/orders', (_req, res) => {
    const mine = [...orders.values()].filter((o) => o.ownerId === res.locals.user.id);
    res.json(mine.map(toPublic));
  });

  app.get('/orders/:id', (req, res) => {
    const order = orders.get(req.params.id);
    if (!order || order.ownerId !== res.locals.user.id) {
      return res.status(404).json({ code: 'NOT_FOUND' });
    }
    res.json(toPublic(order));
  });

  app.delete('/orders/:id', (req, res) => {
    const order = orders.get(req.params.id);
    if (!order || order.ownerId !== res.locals.user.id) {
      return res.status(404).json({ code: 'NOT_FOUND' });
    }
    orders.delete(order.id);
    res.status(204).end();
  });

  return app;
}
