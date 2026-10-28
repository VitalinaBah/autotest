import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const RATE_URL = 'https://api.example.com/rate';
export const EMAIL_CHECK_URL = 'https://email-check.example.com/check';

export const handlers = [
  http.get(RATE_URL, () => HttpResponse.json({ rate: 41.25 })),
  http.get(EMAIL_CHECK_URL, () => HttpResponse.json({ disposable: false })),
];

export const server = setupServer(...handlers);
