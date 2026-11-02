export interface AuthSessionPort {
  setToken(token: string): void;
  clearSession(): void;
}
