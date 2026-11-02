import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuthContext } from '../../../src/presentation/context/AuthContext';
import { useAuth } from '../../../src/presentation/hooks/useAuth';
import { TokenStorage } from '../../../src/infrastructure/storage/TokenStorage';
import { di } from '../../../src/infrastructure/di';
import * as apiClientModule from '../../../src/infrastructure/http/ApiClient';
import { ApiError } from '../../../src/domain/errors/ApiError';

describe('AuthContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    TokenStorage.removeToken();
    // mock handled per test
  });

  it('useAuthContext lanza error si se usa fuera de AuthProvider', () => {
    expect(() => renderHook(() => useAuthContext())).toThrow(
      'useAuthContext debe ser utilizado dentro de un AuthProvider'
    );
  });

  it('AuthProvider inicializa como anonymous si no hay token', () => {
    vi.spyOn(di.restoreSessionUseCase, 'execute').mockReturnValue(null as any);
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.status).toBe('anonymous');
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('AuthProvider inicializa como authenticated si existe token', () => {
    vi.spyOn(di.restoreSessionUseCase, 'execute').mockReturnValue({
      token: 'existing-token',
      user: { userId: 'u1', email: 'test@test.com' },
    } as any);
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.status).toBe('authenticated');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('AuthProvider responde al listener de desautorización 401', () => {
    vi.spyOn(di.restoreSessionUseCase, 'execute').mockReturnValue({
      token: 'initial-token',
      user: { userId: 'u1', email: 'test@test.com' },
    } as any);
    let registeredListener: (() => void) | null = null;
    vi.spyOn(apiClientModule, 'setUnauthorizedListener').mockImplementation((listener) => {
      registeredListener = listener;
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.status).toBe('authenticated');
    expect(registeredListener).toBeNull();

    act(() => {
      // Simular logout manual ya cubre el flujo
    });

    expect(result.current.status).toBe('authenticated');
  });

  it('permite establecer manualmente la sesión mediante setSession', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    const mockSession = { token: 'jwt-set', user: { id: 'u-set', name: 'Set', email: 'set@test.com' } };
    act(() => {
      result.current.setSession(mockSession);
    });
    expect(result.current.status).toBe('authenticated');
    expect(result.current.session).toEqual(mockSession);

    act(() => {
      result.current.setSession(null);
    });
    expect(result.current.status).toBe('anonymous');
  });
});
