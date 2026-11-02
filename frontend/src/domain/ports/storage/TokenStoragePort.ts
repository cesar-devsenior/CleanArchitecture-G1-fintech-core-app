export interface TokenStoragePort {
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
}
