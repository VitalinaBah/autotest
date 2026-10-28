import type { DisposableEmailChecker } from './registration-service';

export class HttpDisposableEmailChecker implements DisposableEmailChecker {
  constructor(private baseUrl: string) {}

  async isDisposable(email: string): Promise<boolean> {
    const url = `${this.baseUrl}/check?email=${encodeURIComponent(email)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('EMAIL_CHECK_UNAVAILABLE');
    const data = await response.json();
    if (typeof data.disposable !== 'boolean') {
      throw new Error('INVALID_CHECK_FORMAT');
    }
    return data.disposable;
  }
}
