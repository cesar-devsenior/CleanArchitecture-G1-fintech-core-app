import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthSession, AuthStatus } from '../../domain/entities/AuthSession';
import { User } from '../../domain/entities/User';
import { loginUserUseCase, registerUserUseCase } from '../../infrastructure/di';
import { di } from '../../infrastructure/di';
import { LoginParams, RegisterParams } from '../../domain/repositories/AuthRepository';

interface AuthContextType {
  status: AuthStatus;
  session: AuthSession | null;
  login: (credentials: LoginParams) => Promise<AuthSession>;
  register: (params: RegisterParams) => Promise<User>;
  logout: () => void;
  setSession: (session: AuthSession | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const restored = di.restoreSessionUseCase.execute();
    if (restored) {
      setSessionState({ user: { id: restored.user.userId, name: restored.user.email?.split("@")[0] ?? "Usuario", email: restored.user.email }, token: restored.token });
      setStatus('authenticated');
    } else {
      setSessionState(null);
      setStatus('anonymous');
    }

    const onUnauthorized = () => {
      di.logoutUserUseCase.execute();
      setSessionState(null);
      setStatus('anonymous');
    };
    di.sessionEvents.onUnauthorized(onUnauthorized);
    return () => {
      di.sessionEvents.offUnauthorized(onUnauthorized);
    };
  }, []);

  const login = async (credentials: LoginParams): Promise<AuthSession> => {
    setStatus('loading');
    try {
      const newSession = await loginUserUseCase.execute(credentials);
      di.persistSessionUseCase.execute(newSession.token);
      setSessionState(newSession);
      setStatus('authenticated');
      return newSession;
    } catch (error) {
      setStatus('error');
      throw error;
    }
  };

  const register = async (params: RegisterParams): Promise<User> => {
    // El backend responde 201 con { id, name, email, createdAt } sin token JWT
    return await registerUserUseCase.execute(params);
  };

  const logout = (): void => {
    di.logoutUserUseCase.execute();
    setSessionState(null);
    setStatus('anonymous');
  };

  const setSession = (newSession: AuthSession | null): void => {
    setSessionState(newSession);
    if (newSession) {
      di.persistSessionUseCase.execute(newSession.token);
      setStatus('authenticated');
    } else {
      di.clearSessionUseCase.execute();
      setStatus('anonymous');
    }
  };

  return (
    <AuthContext.Provider value={{ status, session, login, register, logout, setSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
