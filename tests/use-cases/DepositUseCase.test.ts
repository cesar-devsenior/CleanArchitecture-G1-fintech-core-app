import { describe, it, expect, beforeEach, vi } from "vitest";
import { DepositUseCase } from "../../src/use-cases/DepositUseCase";
import { AccountRepository } from "../../src/domain/repositories/Repositories";
import { Account } from "../../src/domain/entities/Account";
import {
  InvalidAmountError,
  AccountNotFoundError,
  AccountFrozenError,
} from "../../src/domain/exceptions/FinancialError";
import { Decimal } from "decimal.js";

describe("DepositUseCase", () => {
  let mockAccountRepository: AccountRepository;
  let useCase: DepositUseCase;

  beforeEach(() => {
    mockAccountRepository = {
      findById: vi.fn(),
      save: vi.fn(),
    } as unknown as AccountRepository;

    useCase = new DepositUseCase(mockAccountRepository);
  });

  it("debería depositar fondos exitosamente en una cuenta activa", async () => {
    const account = Account.create({
      id: "acc-1",
      accountNumber: "ACC-100",
      balance: new Decimal(100),
      userId: "user-1",
      status: "ACTIVE",
      createdAt: new Date()
    });

    vi.mocked(mockAccountRepository.findById).mockResolvedValue(account);
    vi.mocked(mockAccountRepository.save).mockResolvedValue(account);

    const result = await useCase.execute({
      accountId: "acc-1",
      amount: 50,
    });

    expect(mockAccountRepository.findById).toHaveBeenCalledWith("acc-1");
    expect(account.balance.toNumber()).toBe(150);
    expect(mockAccountRepository.save).toHaveBeenCalledWith(account);
    expect(result.newBalance).toBe(150);
  });

  it("debería lanzar InvalidAmountError si el monto es negativo o cero", async () => {
    await expect(
      useCase.execute({ accountId: "acc-1", amount: -10 })
    ).rejects.toThrow(InvalidAmountError);

    await expect(
      useCase.execute({ accountId: "acc-1", amount: 0 })
    ).rejects.toThrow(InvalidAmountError);
  });

  it("debería lanzar AccountNotFoundError si la cuenta no existe", async () => {
    vi.mocked(mockAccountRepository.findById).mockResolvedValue(null);

    await expect(
      useCase.execute({ accountId: "non-existent-acc", amount: 100 })
    ).rejects.toThrow(AccountNotFoundError);
  });

  it("debería lanzar AccountFrozenError si la cuenta está congelada", async () => {
    const frozenAccount = Account.create({
        id: "acc-frozen",
        accountNumber: "ACC-FROZEN",
        balance: new Decimal(200),
        userId: "user-frozen",
        status: "FROZEN",
        createdAt: new Date()
      });

    vi.mocked(mockAccountRepository.findById).mockResolvedValue(frozenAccount);

    await expect(
      useCase.execute({ accountId: "acc-frozen", amount: 100 })
    ).rejects.toThrow(AccountFrozenError);
  });
});
