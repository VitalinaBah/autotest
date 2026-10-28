import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, EMAIL_CHECK_URL } from './msw/server';
import { HttpDisposableEmailChecker } from '../src/email-checker';
import { RegistrationService } from '../src/registration-service';
import { InMemoryUserRepository } from './fakes/in-memory-user-repository';

const checker = new HttpDisposableEmailChecker(
  'https://email-check.example.com',
);

describe('HttpDisposableEmailChecker', () => {
  it('повертає false для звичайної адреси', async () => {
    await expect(checker.isDisposable('anna@gmail.com')).resolves.toBe(false);
  });

  it('повертає true для тимчасової адреси', async () => {
    server.use(
      http.get(EMAIL_CHECK_URL, () => HttpResponse.json({ disposable: true })),
    );
    await expect(checker.isDisposable('x@mailinator.com')).resolves.toBe(true);
  });

  it.each([500, 503, 429])(
    'відхиляє відповідь зі статусом %i',
    async (status) => {
      server.use(
        http.get(EMAIL_CHECK_URL, () => new HttpResponse(null, { status })),
      );
      await expect(checker.isDisposable('anna@gmail.com')).rejects.toThrow(
        'EMAIL_CHECK_UNAVAILABLE',
      );
    },
  );

  it.each([
    { name: 'рядок "false"', body: { disposable: 'false' } },
    { name: 'число 0', body: { disposable: 0 } },
    { name: 'відсутнє поле', body: { result: 'ok' } },
  ])('відхиляє некоректний формат відповіді: $name', async ({ body }) => {
    server.use(http.get(EMAIL_CHECK_URL, () => HttpResponse.json(body)));
    await expect(checker.isDisposable('anna@gmail.com')).rejects.toThrow(
      'INVALID_CHECK_FORMAT',
    );
  });

  it('кодує адресу в параметрі запиту', async () => {
    let captured: URL | undefined;
    server.use(
      http.get(EMAIL_CHECK_URL, ({ request }) => {
        captured = new URL(request.url);
        return HttpResponse.json({ disposable: false });
      }),
    );
    await checker.isDisposable('anna+news@gmail.com');
    expect(captured?.searchParams.get('email')).toBe('anna+news@gmail.com');
  });

  it('опрацьовує мережеву помилку', async () => {
    server.use(http.get(EMAIL_CHECK_URL, () => HttpResponse.error()));
    await expect(checker.isDisposable('anna@gmail.com')).rejects.toThrow();
  });
});

describe('RegistrationService разом із HTTP-перевіркою через MSW', () => {
  const build = () => {
    const users = new InMemoryUserRepository();
    const mailer = { sendConfirmation: vi.fn().mockResolvedValue(undefined) };
    const service = new RegistrationService(users, checker, mailer, {
      next: () => 'U-1',
    });
    return { users, mailer, service };
  };

  it('реєструє користувача, коли сервіс підтверджує звичайну адресу', async () => {
    const { users, service } = build();
    await service.register({ email: 'anna@gmail.com', name: 'Анна' });
    expect(users.size).toBe(1);
  });

  it('не реєструє користувача, коли сервіс перевірки повертає 503', async () => {
    server.use(
      http.get(EMAIL_CHECK_URL, () => new HttpResponse(null, { status: 503 })),
    );
    const { users, mailer, service } = build();
    await expect(
      service.register({ email: 'anna@gmail.com', name: 'Анна' }),
    ).rejects.toThrow('EMAIL_CHECK_UNAVAILABLE');
    expect(users.size).toBe(0);
    expect(mailer.sendConfirmation).not.toHaveBeenCalled();
  });
});
