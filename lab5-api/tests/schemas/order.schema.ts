export const orderSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', minLength: 1 },
    tier: { type: 'string', enum: ['basic', 'silver', 'gold'] },
    subtotal: { type: 'number', minimum: 0 },
    discountRate: { type: 'number', minimum: 0, maximum: 0.25 },
    total: { type: 'number', minimum: 0 },
    createdAt: { type: 'string', format: 'date-time' },
    promoCode: { type: 'string', enum: ['SAVE5', 'SAVE10', 'MEGA20'] },
    items: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          sku: { type: 'string' },
          price: { type: 'number' },
          qty: { type: 'integer' },
        },
        required: ['sku', 'price', 'qty'],
        additionalProperties: false,
      },
    },
  },
  required: [
    'id',
    'tier',
    'subtotal',
    'discountRate',
    'total',
    'createdAt',
    'items',
  ],
  additionalProperties: false,
} as const;
