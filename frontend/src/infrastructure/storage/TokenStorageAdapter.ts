import { TokenStoragePort } from '../../domain/ports/storage/TokenStoragePort';
import { TokenStorage } from './TokenStorage';

export class TokenStorageAdapter implements TokenStoragePort {
  getToken(): string | null {
    return TokenStorage.getToken();
  }

  setToken(token: string): void {
    TokenStorage.setToken(token);
  }

  removeToken(): void {
    TokenStorage.removeToken();
  }
}
