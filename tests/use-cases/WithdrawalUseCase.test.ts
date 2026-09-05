import { describe, it, expect, beforeEach, vi } from "vitest";
import { WithdrawalUseCase } from "../../src/use-cases/WithdrawalUseCase";
import { AccountRepository } from "../../src/domain/repositories/Repositories";
import { Account } from "../../src/domain/entities/Account";
import {
  InvalidAmountError,
  AccountNotFoundError,
  AccountFrozenError,
  InsufficientBalanceError,
} from "../../src/domain/exceptions/FinancialError";
import { Decimal } from "decimal.js";

describe("WithdrawalUseCase", () => {
  let mockAccountRepository: AccountRepository;
  let useCase: WithdrawalUseCase;

  beforeEach(() => {
    mockAccountRepository = {
      findById: vi.fn(),
      save: vi.fn(),
    } as unknown as AccountRepository;

    useCase = new WithdrawalUseCase(mockAccountRepository);
  });

  it("debería retirar fondos exitosamente de una cuenta activa con saldo suficiente", async () => {
    const account = Account.create({
      id: "acc-1",
      accountNumber: "ACC-100",
      balance: new Decimal(200),
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

  it("debería lanzar InsufficientBalanceError si el saldo es insuficiente", async () => {
    const account = Account.create({
      id: "acc-1",
      accountNumber: "ACC-100",
      balance: new Decimal(50),
      userId: "user-1",
      status: "ACTIVE",
      createdAt: new Date()
    });

    vi.mocked(mockAccountRepository.findById).mockResolvedValue(account);

    await expect(
      useCase.execute({ accountId: "acc-1", amount: 100 })
    ).rejects.toThrow(InsufficientBalanceError);
  });

  it("debería lanzar AccountFrozenError si la cuenta está congelada", async () => {
    const frozenAccount = Account.create({
      id: "acc-frozen",
      accountNumber: "ACC-FROZEN",
      balance: new Decimal(500),
      userId: "user-frozen",
      status: "FROZEN",
      createdAt: new Date()
    });

    vi.mocked(mockAccountRepository.findById).mockResolvedValue(frozenAccount);

    await expect(
      useCase.execute({ accountId: "acc-frozen", amount: 100 })
    ).rejects.toThrow(AccountFrozenError);
  });

  it("debería lanzar InvalidAmountError si el monto es negativo o cero", async () => {
    await expect(
      useCase.execute({ accountId: "acc-1", amount: -10 })
    ).rejects.toThrow(InvalidAmountError);
  });

  it("debería lanzar AccountNotFoundError si la cuenta no existe", async () => {
    vi.mocked(mockAccountRepository.findById).mockResolvedValue(null);

    await expect(
      useCase.execute({ accountId: "non-existent-acc", amount: 100 })
    ).rejects.toThrow(AccountNotFoundError);
  });
});
