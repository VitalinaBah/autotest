/**
 * Варіант 4. Сервіс реєстрації користувача.
 * Перевіряє унікальність адреси через сховище, звертається до HTTP-сервісу
 * перевірки адреси на тимчасовість і надсилає лист підтвердження.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  status: 'pending';
  createdAt: string;
}

export interface RegistrationInput {
  email: string;
  name: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | undefined>;
  save(user: User): Promise<void>;
}

export interface DisposableEmailChecker {
  isDisposable(email: string): Promise<boolean>;
}

export interface ConfirmationMailer {
  sendConfirmation(email: string, userId: string): Promise<void>;
}

export interface IdGenerator {
  next(): string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class RegistrationService {
  constructor(
    private users: UserRepository,
    private checker: DisposableEmailChecker,
    private mailer: ConfirmationMailer,
    private ids: IdGenerator,
  ) {}

  async register(input: RegistrationInput): Promise<User> {
    const email = input.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) throw new Error('INVALID_EMAIL');

    const existing = await this.users.findByEmail(email);
    if (existing) throw new Error('EMAIL_TAKEN');

    if (await this.checker.isDisposable(email)) {
      throw new Error('DISPOSABLE_EMAIL');
    }

    const user: User = {
      id: this.ids.next(),
      email,
      name: input.name,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await this.users.save(user);
    await this.mailer.sendConfirmation(email, user.id);
    return user;
  }
}
