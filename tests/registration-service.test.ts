import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RegistrationService } from '../src/registration-service';
import type {
  DisposableEmailChecker,
  ConfirmationMailer,
  IdGenerator,
} from '../src/registration-service';
import { InMemoryUserRepository } from './fakes/in-memory-user-repository';

describe('RegistrationService', () => {
  let users: InMemoryUserRepository; // fake
  let checker: DisposableEmailChecker; // stub
  let mailer: ConfirmationMailer; // spy
  let ids: IdGenerator; // stub
  let service: RegistrationService;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    checker = { isDisposable: vi.fn().mockResolvedValue(false) };
    mailer = { sendConfirmation: vi.fn().mockResolvedValue(undefined) };
    ids = { next: () => 'U-1' };
    service = new RegistrationService(users, checker, mailer, ids);
  });

  describe('успішна реєстрація', () => {
    it('зберігає нового користувача у сховищі', async () => {
      await service.register({ email: 'anna@gmail.com', name: 'Анна' });
      const saved = await users.findByEmail('anna@gmail.com');
      expect(saved).toMatchObject({
        id: 'U-1',
        email: 'anna@gmail.com',
        name: 'Анна',
        status: 'pending',
      });
      expect(users.size).toBe(1);
    });

    it('нормалізує адресу: обрізає пробіли й переводить у нижній регістр', async () => {
      const user = await service.register({
        email: '  Anna@Gmail.COM ',
        name: 'Анна',
      });
      expect(user.email).toBe('anna@gmail.com');
    });

    it('надсилає один лист підтвердження на адресу користувача', async () => {
      await service.register({ email: 'anna@gmail.com', name: 'Анна' });
      expect(mailer.sendConfirmation).toHaveBeenCalledTimes(1);
      expect(mailer.sendConfirmation).toHaveBeenCalledWith(
        'anna@gmail.com',
        'U-1',
      );
    });

    it('перевіряє на тимчасовість уже нормалізовану адресу', async () => {
      await service.register({ email: 'Anna@Gmail.com', name: 'Анна' });
      expect(checker.isDisposable).toHaveBeenCalledWith('anna@gmail.com');
    });
  });

  describe('відхилення реєстрації', () => {
    it.each([
      '',
      'anna',
      'anna@',
      '@gmail.com',
      'anna@gmail',
      'an na@gmail.com',
    ])(
      'відхиляє некоректну адресу "%s" без звертання до залежностей',
      async (email) => {
        await expect(service.register({ email, name: 'Анна' })).rejects.toThrow(
          'INVALID_EMAIL',
        );
        expect(checker.isDisposable).not.toHaveBeenCalled();
        expect(users.size).toBe(0);
      },
    );

    it('відхиляє адресу, яку вже зареєстровано', async () => {
      await service.register({ email: 'anna@gmail.com', name: 'Анна' });
      await expect(
        service.register({ email: 'ANNA@gmail.com', name: 'Інша Анна' }),
      ).rejects.toThrow('EMAIL_TAKEN');
      expect(users.size).toBe(1);
      expect(mailer.sendConfirmation).toHaveBeenCalledTimes(1);
    });

    it('відхиляє тимчасову адресу і нічого не зберігає', async () => {
      checker.isDisposable = vi.fn().mockResolvedValue(true);
      await expect(
        service.register({ email: 'x@mailinator.com', name: 'X' }),
      ).rejects.toThrow('DISPOSABLE_EMAIL');
      expect(users.size).toBe(0);
      expect(mailer.sendConfirmation).not.toHaveBeenCalled();
    });
  });

  describe('відмови залежностей', () => {
    it('не реєструє користувача, якщо сервіс перевірки адреси недоступний', async () => {
      checker.isDisposable = vi
        .fn()
        .mockRejectedValue(new Error('EMAIL_CHECK_UNAVAILABLE'));
      await expect(
        service.register({ email: 'anna@gmail.com', name: 'Анна' }),
      ).rejects.toThrow('EMAIL_CHECK_UNAVAILABLE');
      expect(users.size).toBe(0);
      expect(mailer.sendConfirmation).not.toHaveBeenCalled();
    });

    it('не надсилає листа, якщо збереження у сховище не вдалося', async () => {
      vi.spyOn(users, 'save').mockRejectedValue(new Error('DB_UNAVAILABLE'));
      await expect(
        service.register({ email: 'anna@gmail.com', name: 'Анна' }),
      ).rejects.toThrow('DB_UNAVAILABLE');
      expect(mailer.sendConfirmation).not.toHaveBeenCalled();
    });

    it('передає помилку надсилання листа, залишаючи користувача в статусі pending', async () => {
      mailer.sendConfirmation = vi
        .fn()
        .mockRejectedValue(new Error('MAIL_UNAVAILABLE'));
      await expect(
        service.register({ email: 'anna@gmail.com', name: 'Анна' }),
      ).rejects.toThrow('MAIL_UNAVAILABLE');
      const saved = await users.findByEmail('anna@gmail.com');
      expect(saved?.status).toBe('pending');
    });
  });

  describe('фіксація часу', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-10-28T09:30:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('записує момент реєстрації', async () => {
      const user = await service.register({
        email: 'anna@gmail.com',
        name: 'Анна',
      });
      expect(user.createdAt).toBe('2026-10-28T09:30:00.000Z');
    });
  });
});
