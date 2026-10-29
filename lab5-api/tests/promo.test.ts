import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp, PROMO_CODES } from '../src/app';
import { login } from './helpers';
import { expectSchema } from './schema';
import { orderSchema } from './schemas/order.schema';
import { errorSchema } from './schemas/error.schema';

type App = ReturnType<typeof createApp>;

const promoPayload = (promoCode: unknown, price = 500, qty = 1) => ({
  items: [{ sku: 'SKU-A', price, qty }],
  promoCode,
});

const post = (app: App, token: string, body: object) =>
  request(app).post('/orders').set('Authorization', `Bearer ${token}`).send(body);

describe('POST /orders з promoCode (варіант 4)', () => {
  let app: App;
  let bob: string;

  beforeEach(async () => {
    app = createApp(); // власний застосунок і власні дані для кожного тесту
    bob = await login(app, 'bob@example.com'); // basic, знижка рівня 0 %
  });

  it('застосовує промокод: усі п’ять рівнів перевірки', async () => {
    const res = await post(app, bob, promoPayload('SAVE10'));

    // рівень 1: код стану
    expect(res.status).toBe(201);
    // рівень 2: структура за схемою (additionalProperties: false)
    expectSchema(res.body, orderSchema);
    // рівень 3: значення – 500 − 10 % = 450, + 60 доставка = 510
    expect(res.body).toMatchObject({
      subtotal: 500,
      discountRate: 0.1,
      total: 510,
      promoCode: 'SAVE10',
    });
    // рівень 4: заголовки
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.headers.location).toBe(`/orders/${res.body.id}`);
    // рівень 5: побічний ефект – замовлення збережено разом із промокодом
    const fetched = await request(app)
      .get(res.headers.location)
      .set('Authorization', `Bearer ${bob}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body).toEqual(res.body);
  });

  it('без промокоду поле promoCode відсутнє, знижка 0', async () => {
    const res = await post(app, bob, { items: [{ sku: 'SKU-A', price: 500, qty: 1 }] });
    expect(res.status).toBe(201);
    expectSchema(res.body, orderSchema);
    expect(res.body).not.toHaveProperty('promoCode');
    expect(res.body.discountRate).toBe(0);
    expect(res.body.total).toBe(560);
  });

  it.each([
    { name: 'невідомий код', promoCode: 'NOPE99' },
    { name: 'код у нижньому регістрі', promoCode: 'save10' },
    { name: 'код із пробілом у кінці', promoCode: 'SAVE10 ' },
    { name: 'назва властивості прототипу', promoCode: 'toString' },
  ])('422 UNKNOWN_PROMO_CODE: $name', async ({ promoCode }) => {
    const res = await post(app, bob, promoPayload(promoCode));
    expect(res.status).toBe(422);
    expectSchema(res.body, errorSchema);
    expect(res.body).toEqual({ code: 'UNKNOWN_PROMO_CODE' });
    // побічний ефект: замовлення не створено
    const list = await request(app).get('/orders').set('Authorization', `Bearer ${bob}`);
    expect(list.body).toEqual([]);
  });

  it.each([
    { name: 'число', promoCode: 10 },
    { name: 'null', promoCode: null },
    { name: 'порожній рядок', promoCode: '' },
    { name: 'лише пробіли', promoCode: '   ' },
    { name: 'масив', promoCode: ['SAVE10'] },
    { name: 'булеве значення', promoCode: true },
  ])('400 INVALID_PROMO_CODE: $name', async ({ promoCode }) => {
    const res = await post(app, bob, promoPayload(promoCode));
    expect(res.status).toBe(400);
    expectSchema(res.body, errorSchema);
    expect(res.body).toEqual({ code: 'INVALID_PROMO_CODE' });
    const list = await request(app).get('/orders').set('Authorization', `Bearer ${bob}`);
    expect(list.body).toEqual([]);
  });

  it('спершу валідуються позиції: порожній список із невідомим кодом → 400 EMPTY_ORDER', async () => {
    const res = await post(app, bob, { items: [], promoCode: 'NOPE99' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ code: 'EMPTY_ORDER' });
  });
});

describe('Розрахунок знижки з промокодом і обмеження 25 %', () => {
  // Очікувані суми пораховано вручну:
  // знижка = рівень клієнта + 5 % від 2000 грн + промокод, але не більше 25 %;
  // доставка 60 грн, якщо сума після знижки менша за 1000 грн.
  it.each([
    { user: 'bob', tier: 'basic', promo: 'SAVE5', price: 500, rate: 0.05, total: 535 },
    { user: 'bob', tier: 'basic', promo: 'SAVE10', price: 500, rate: 0.1, total: 510 },
    { user: 'bob', tier: 'basic', promo: 'MEGA20', price: 1000, rate: 0.2, total: 860 },
    { user: 'bob', tier: 'basic', promo: 'SAVE10', price: 1250, rate: 0.1, total: 1125 },
    { user: 'bob', tier: 'basic', promo: 'MEGA20', price: 1999.99, rate: 0.2, total: 1599.99 },
    { user: 'bob', tier: 'basic', promo: 'MEGA20', price: 2000, rate: 0.25, total: 1500 },
    { user: 'alice', tier: 'gold', promo: 'SAVE5', price: 500, rate: 0.15, total: 485 },
    { user: 'alice', tier: 'gold', promo: 'SAVE10', price: 500, rate: 0.2, total: 460 },
    { user: 'alice', tier: 'gold', promo: 'MEGA20', price: 500, rate: 0.25, total: 435 },
    { user: 'alice', tier: 'gold', promo: 'SAVE10', price: 2000, rate: 0.25, total: 1500 },
    { user: 'alice', tier: 'gold', promo: 'MEGA20', price: 2000, rate: 0.25, total: 1500 },
  ])(
    '$user ($tier), $price грн, $promo → знижка $rate, до сплати $total',
    async ({ user, promo, price, rate, total }) => {
      const app = createApp();
      const token = await login(app, `${user}@example.com`);
      const res = await post(app, token, promoPayload(promo, price));
      expect(res.status).toBe(201);
      expectSchema(res.body, orderSchema);
      expect(res.body.discountRate).toBe(rate);
      expect(res.body.total).toBeCloseTo(total, 2);
    },
  );

  it('жодна комбінація користувача, суми й промокоду не дає знижки понад 25 %', async () => {
    const app = createApp();
    for (const email of ['alice@example.com', 'bob@example.com']) {
      const token = await login(app, email);
      for (const promo of Object.keys(PROMO_CODES)) {
        for (const price of [100, 1999.99, 2000, 10000]) {
          const res = await post(app, token, promoPayload(promo, price));
          expect(res.body.discountRate).toBeLessThanOrEqual(0.25);
          expect(res.body.total).toBeGreaterThanOrEqual(round2(price * 0.75));
        }
      }
    }
  });
});

const round2 = (n: number) => Math.round(n * 100) / 100;

describe('Доступ до замовлень із промокодом', () => {
  let app: App;
  beforeEach(() => {
    app = createApp();
  });

  it.each([
    { name: 'без токена', header: undefined },
    { name: 'з підробленим токеном', header: 'Bearer forged-token' },
  ])('POST /orders із промокодом $name → 401, замовлення не створено', async ({ header }) => {
    const req = request(app).post('/orders').send(promoPayload('SAVE10'));
    if (header) req.set('Authorization', header);
    const res = await req;
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ code: 'UNAUTHORIZED' });

    const bob = await login(app, 'bob@example.com');
    const list = await request(app).get('/orders').set('Authorization', `Bearer ${bob}`);
    expect(list.body).toEqual([]);
  });

  it('чуже замовлення з промокодом повертає 404 і не видається у списку', async () => {
    const alice = await login(app, 'alice@example.com');
    const bob = await login(app, 'bob@example.com');
    const created = await post(app, alice, promoPayload('MEGA20'));
    expect(created.status).toBe(201);

    const res = await request(app)
      .get(`/orders/${created.body.id}`)
      .set('Authorization', `Bearer ${bob}`);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ code: 'NOT_FOUND' });

    const list = await request(app).get('/orders').set('Authorization', `Bearer ${bob}`);
    expect(list.body).toEqual([]);
  });
});
