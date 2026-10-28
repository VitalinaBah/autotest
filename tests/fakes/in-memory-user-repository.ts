import type { User, UserRepository } from '../../src/registration-service';

export class InMemoryUserRepository implements UserRepository {
  private items = new Map<string, User>();

  async findByEmail(email: string): Promise<User | undefined> {
    return this.items.get(email);
  }

  async save(user: User): Promise<void> {
    this.items.set(user.email, user);
  }

  get size(): number {
    return this.items.size;
  }
}
