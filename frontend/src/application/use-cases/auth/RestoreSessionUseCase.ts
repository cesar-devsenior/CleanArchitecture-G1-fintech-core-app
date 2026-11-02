import { TokenStoragePort } from '../../../domain/ports/storage/TokenStoragePort';

export interface SessionPayload {
  userId: string;
  email: string;
}

export class RestoreSessionUseCase {
  constructor(private readonly tokenStorage: TokenStoragePort) {}

  execute(): { token: string; user: SessionPayload } | null {
    const token = this.tokenStorage.getToken();
    if (!token) return null;

    try {
      const payload = this.decodeJwt<SessionPayload>(token);
      if (payload?.userId && payload?.email) {
        return { token, user: { userId: payload.userId, email: payload.email } };
      }
      return null;
    } catch {
      this.tokenStorage.removeToken();
      return null;
    }
  }

  private decodeJwt<T>(token: string): T | null {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const pad = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const binary = atob(pad);
      let jsonPayload = binary;
      try {
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        jsonPayload = new TextDecoder().decode(bytes);
      } catch {
        // ignore
      }
      return JSON.parse(jsonPayload) as T;
    } catch {
      return null;
    }
  }
}
