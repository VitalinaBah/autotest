# Лабораторна робота № 5. Автоматизація тестування REST API

Виконавець: Бахтін Віталіна, група ІПЗ-1. Варіант 4 – `POST /orders` з полем `promoCode`.

## Розширення (варіант 4)

Довідник промокодів у пам'яті (`src/app.ts`, `PROMO_CODES`): `SAVE5` – 5 %, `SAVE10` – 10 %, `MEGA20` – 20 %.
Знижка промокоду додається до знижки рівня клієнта та знижки за суму від 2000 грн; загальна знижка не перевищує 25 %.

| Сценарій | Код | Тіло |
|---|---|---|
| Відомий промокод | 201 | замовлення з `promoCode`, `discountRate`, заголовок `Location` |
| Без промокоду | 201 | замовлення без `promoCode`, `discountRate` за рівнем клієнта |
| Невідомий код (зокрема інший регістр, пробіли) | 422 | `{ "code": "UNKNOWN_PROMO_CODE" }` |
| `promoCode` не рядок або порожній | 400 | `{ "code": "INVALID_PROMO_CODE" }` |
| Некоректні позиції (разом із будь-яким кодом) | 400 | `EMPTY_ORDER` / `INVALID_PRICE` / `INVALID_QTY` |
| Без токена / підроблений токен | 401 | `{ "code": "UNAUTHORIZED" }` |
| Чуже замовлення з промокодом | 404 | `{ "code": "NOT_FOUND" }` |

## Запуск

```bash
npm install
npm test          # Vitest + Supertest
npm start         # сервер на http://localhost:3000 (для Postman/Newman)
npm run newman    # у другому терміналі; звіт junit у results/newman.xml
```

## Структура

```
src/app.ts                         сервіс (фабрика createApp)
src/server.ts                      ручний запуск
tests/orders.test.ts               Частина 1
tests/promo.test.ts                Частина 2 (варіант 4)
tests/schemas/order.schema.ts      контракт замовлення (additionalProperties: false)
tests/schemas/error.schema.ts      контракт помилки
postman/orders.postman_collection.json
```
