import { describe, it, expect, beforeEach, vi } from "vitest";
import { TransferMoneyUseCase } from "../../src/use-cases/TransferMoneyUseCase";
import { AccountRepository } from "../../src/domain/repositories/Repositories";
import { Account } from "../../src/domain/entities/Account";
import {
  InsufficientBalanceError,
  AccountFrozenError,
  InvalidAmountError,
  AccountNotFoundError,
} from "../../src/domain/exceptions/FinancialError";
import { InvalidPropValueError } from "../../src/domain/exceptions/DomainError";
import { Decimal } from "decimal.js";
import { Transfer } from "../../src/domain/entities/Transaction";

describe("TransferMoneyUseCase", () => {
  let mockAccountRepository: AccountRepository;
  let useCase: TransferMoneyUseCase;

  beforeEach(() => {
    mockAccountRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      executeTransaction: vi.fn(),
    } as unknown as AccountRepository;

    useCase = new TransferMoneyUseCase(mockAccountRepository);
  });

  it("debería transferir fondos exitosamente si todos los requisitos se cumplen", async () => {
    const sourceAcc = Account.create({
      id: "acc-1",
      accountNumber: "ACC-100",
      balance: new Decimal(500),
      userId: "user-1",
      status: "ACTIVE",
      createdAt: new Date()
    });
    const destAcc = Account.create({
      id: "acc-2",
      accountNumber: "ACC-200",
      balance: new Decimal(100),
      userId: "user-2",
      status: "ACTIVE",
      createdAt: new Date()
    });
    const transResponse = Transfer.create({
      id: "tx-999",
      amount: new Decimal(200),
      sourceAccountId: "acc-1",
      destinationAccountId: "acc-2",
      createdAt: new Date(),
      status: "COMPLETED",
      description: "Transferencia de 200 desde la cuenta acc-1 a la cuenta acc-2."
    });

    vi.mocked(mockAccountRepository.findById).mockImplementation(async (id) => {
      if (id === "acc-1") return sourceAcc;
      if (id === "acc-2") return destAcc;
      return null;
    });

    vi.mocked(mockAccountRepository.executeTransaction).mockResolvedValue(transResponse);

    const result = await useCase.execute({
      sourceAccountId: "acc-1",
      destinationAccountId: "acc-2",
      amount: 200,
    });

    expect(result.transactionId).toBe("tx-999");
    expect(mockAccountRepository.executeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: new Decimal(200),
        sourceAccount: "acc-1",
        destinationAccount: "acc-2",
        status: "PENDING",
      })
    );
  });

  it("debería lanzar InvalidAmountError si el monto es menor o igual a cero", async () => {
    await expect(
      useCase.execute({ sourceAccountId: "acc-1", destinationAccountId: "acc-2", amount: 0 })
    ).rejects.toThrow(InvalidAmountError);

    expect(mockAccountRepository.findById).not.toHaveBeenCalled();
  });

  it("debería lanzar InvalidPropValueError si la cuenta origen y destino son iguales", async () => {
    await expect(
      useCase.execute({ sourceAccountId: "acc-1", destinationAccountId: "acc-1", amount: 100 })
    ).rejects.toThrow(InvalidPropValueError);

    expect(mockAccountRepository.findById).not.toHaveBeenCalled();
    expect(mockAccountRepository.executeTransaction).not.toHaveBeenCalled();
  });

  it("debería lanzar AccountNotFoundError si la cuenta de origen no existe", async () => {
    vi.mocked(mockAccountRepository.findById).mockResolvedValue(null);

    await expect(
      useCase.execute({ sourceAccountId: "missing-source", destinationAccountId: "acc-2", amount: 100 })
    ).rejects.toThrow(AccountNotFoundError);

    expect(mockAccountRepository.executeTransaction).not.toHaveBeenCalled();
  });

  it("debería lanzar AccountNotFoundError si la cuenta de destino no existe", async () => {
    const sourceAcc = Account.create({
      id: "acc-1",
      accountNumber: "ACC-100",
      balance: new Decimal(500),
      userId: "user-1",
      status: "ACTIVE",
      createdAt: new Date()
    });

    vi.mocked(mockAccountRepository.findById).mockImplementation(async (id) => {
      if (id === "acc-1") return sourceAcc;
      return null;
    });

    await expect(
      useCase.execute({ sourceAccountId: "acc-1", destinationAccountId: "missing-destination", amount: 100 })
    ).rejects.toThrow(AccountNotFoundError);

    expect(mockAccountRepository.executeTransaction).not.toHaveBeenCalled();
  });

  it("debería lanzar InsufficientBalanceError si la cuenta de origen no tiene saldo suficiente", async () => {
    const sourceAcc = Account.create({
      id: "acc-1",
      accountNumber: "ACC-100",
      balance: new Decimal(50),
      userId: "user-1",
      status: "ACTIVE",
      createdAt: new Date()
    });
    const destAcc = Account.create({
      id: "acc-2",
      accountNumber: "ACC-200",
      balance: new Decimal(100),
      userId: "user-2",
      status: "ACTIVE",
      createdAt: new Date()
    });

    vi.mocked(mockAccountRepository.findById).mockImplementation(async (id) => {
      if (id === "acc-1") return sourceAcc;
      if (id === "acc-2") return destAcc;
      return null;
    });

    await expect(
      useCase.execute({ sourceAccountId: "acc-1", destinationAccountId: "acc-2", amount: 100 })
    ).rejects.toThrow(InsufficientBalanceError);

    expect(mockAccountRepository.executeTransaction).not.toHaveBeenCalled();
  });

  it("debería lanzar AccountFrozenError si la cuenta origen está en estado FROZEN", async () => {
    const sourceAcc = Account.create({
      id: "acc-1",
      accountNumber: "ACC-100",
      balance: new Decimal(1000),
      userId: "user-1",
      status: "FROZEN",
      createdAt: new Date()
    });
    const destAcc = Account.create({
      id: "acc-2",
      accountNumber: "ACC-200",
      balance: new Decimal(100),
      userId: "user-2",
      status: "ACTIVE",
      createdAt: new Date()
    });

    vi.mocked(mockAccountRepository.findById).mockImplementation(async (id) => {
      if (id === "acc-1") return sourceAcc;
      if (id === "acc-2") return destAcc;
      return null;
    });

    await expect(
      useCase.execute({ sourceAccountId: "acc-1", destinationAccountId: "acc-2", amount: 100 })
    ).rejects.toThrow(AccountFrozenError);
  });
});
