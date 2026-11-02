import { useState, useCallback, useEffect } from 'react';
import { Account } from '../../domain/entities/Account';
import { TransactionHistory } from '../../domain/entities/Transaction';
import { ApiError } from '../../domain/errors/ApiError';
import {
  getUserAccountsUseCase,
  createAccountUseCase,
  getBalanceUseCase,
  freezeAccountUseCase,
  unfreezeAccountUseCase,
  getTransactionHistoryUseCase,
} from '../../infrastructure/di';
import { useAuth } from './useAuth';

export type AccountStatusState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface UseAccountResult {
  accounts: Account[];
  selectedAccount: Account | null;
  history: TransactionHistory | null;
  status: AccountStatusState;
  error: ApiError | null;
  actionLoading: boolean;
  actionError: ApiError | null;
  fetchAccounts: () => Promise<void>;
  createAccount: () => Promise<Account | null>;
  freezeAccount: (accountId: string) => Promise<boolean>;
  unfreezeAccount: (accountId: string) => Promise<boolean>;
  selectAccount: (accountId: string) => Promise<void>;
  closeAccountDetail: () => void;
  retry: () => void;
}

export const useAccount = (): UseAccountResult => {
  const { isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [history, setHistory] = useState<TransactionHistory | null>(null);

  const [status, setStatus] = useState<AccountStatusState>('idle');
  const [error, setError] = useState<ApiError | null>(null);

  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<ApiError | null>(null);



  const fetchAccounts = useCallback(async (): Promise<void> => {
    setStatus('loading');
    setError(null);
    try {
      const result = await getUserAccountsUseCase.execute();
      setAccounts(result);
      setStatus(result.length === 0 ? 'empty' : 'success');
    } catch (err: unknown) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(err instanceof Error ? err.message : 'Error al consultar cuentas', 500, 'FETCH_ERROR');
      setError(apiError);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();
    }
  }, [isAuthenticated, fetchAccounts]);

  const createAccount = useCallback(async (): Promise<Account | null> => {
    setActionLoading(true);
    setActionError(null);
    try {
      const newAccount = await createAccountUseCase.execute();
      setActionLoading(false);
      await fetchAccounts();
      return newAccount;
    } catch (err: unknown) {
      setActionLoading(false);
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(err instanceof Error ? err.message : 'Error al crear la cuenta', 400, 'CREATE_ERROR');
      setActionError(apiError);
      return null;
    }
  }, [fetchAccounts]);

  const freezeAccount = useCallback(
    async (accountId: string): Promise<boolean> => {
      setActionLoading(true);
      setActionError(null);
      try {
        await freezeAccountUseCase.execute(accountId);
        setActionLoading(false);
        await fetchAccounts();
        if (selectedAccount?.id === accountId) {
          const updated = await getBalanceUseCase.execute(accountId);
          setSelectedAccount(updated);
        }
        return true;
      } catch (err: unknown) {
        setActionLoading(false);
        const apiError =
          err instanceof ApiError
            ? err
            : new ApiError(err instanceof Error ? err.message : 'Error al congelar la cuenta', 400, 'FREEZE_ERROR');
        setActionError(apiError);
        return false;
      }
    },
    [fetchAccounts, selectedAccount]
  );

  const unfreezeAccount = useCallback(
    async (accountId: string): Promise<boolean> => {
      setActionLoading(true);
      setActionError(null);
      try {
        await unfreezeAccountUseCase.execute(accountId);
        setActionLoading(false);
        await fetchAccounts();
        if (selectedAccount?.id === accountId) {
          const updated = await getBalanceUseCase.execute(accountId);
          setSelectedAccount(updated);
        }
        return true;
      } catch (err: unknown) {
        setActionLoading(false);
        const apiError =
          err instanceof ApiError
            ? err
            : new ApiError(err instanceof Error ? err.message : 'Error al descongelar la cuenta', 400, 'UNFREEZE_ERROR');
        setActionError(apiError);
        return false;
      }
    },
    [fetchAccounts, selectedAccount]
  );

  const selectAccount = useCallback(
    async (accountId: string): Promise<void> => {
      setActionLoading(true);
      setActionError(null);
      try {
        const [accDetail, txHistory] = await Promise.all([
          getBalanceUseCase.execute(accountId),
          getTransactionHistoryUseCase.execute(accountId),
        ]);
        setSelectedAccount(accDetail);
        setHistory(txHistory);
      } catch (err: unknown) {
        const apiError =
          err instanceof ApiError
            ? err
            : new ApiError(err instanceof Error ? err.message : 'Error al consultar detalle de cuenta', 500, 'DETAIL_ERROR');
        setActionError(apiError);
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  const closeAccountDetail = useCallback(() => {
    setSelectedAccount(null);
    setHistory(null);
  }, []);

  const retry = useCallback(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    selectedAccount,
    history,
    status,
    error,
    actionLoading,
    actionError,
    fetchAccounts,
    createAccount,
    freezeAccount,
    unfreezeAccount,
    selectAccount,
    closeAccountDetail,
    retry,
  };
};
