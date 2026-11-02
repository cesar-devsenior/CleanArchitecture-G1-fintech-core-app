import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetTransactionHistoryUseCase } from "../../src/use-cases/GetTransactionHistoryUseCase";
import { TransactionRepository } from "../../src/domain/repositories/Repositories";
import { Deposit, Transfer, Withdrawal } from "../../src/domain/entities/Transaction";
import { Decimal } from "decimal.js";

describe("GetTransactionHistoryUseCase", () => {
  let mockTransactionRepository: TransactionRepository;
  let useCase: GetTransactionHistoryUseCase;

  beforeEach(() => {
    mockTransactionRepository = {
      findByAccountId: vi.fn(),
    } as unknown as TransactionRepository;

    useCase = new GetTransactionHistoryUseCase(mockTransactionRepository);
  });

  it("debería devolver el historial de transacciones con tipo y datos asociados", async () => {
    const depositTx = Deposit.create({
      id: "tx-1",
      amount: new Decimal(100),
      destinationAccountId: "acc-1",
      status: "COMPLETED",
      description: "Depósito inicial",
      createdAt: new Date(),
    });

    const transferTx = Transfer.create({
      id: "tx-2",
      amount: new Decimal(50),
      sourceAccountId: "acc-1",
      destinationAccountId: "acc-2",
      status: "COMPLETED",
      description: "Transferencia",
      createdAt: new Date(),
    });

    const withdrawalTx = Withdrawal.create({
      id: "tx-3",
      amount: new Decimal(25),
      sourceAccountId: "acc-1",
      status: "FAILED",
      description: "Retiro fallido",
      createdAt: new Date(),
    });

    vi.mocked(mockTransactionRepository.findByAccountId).mockResolvedValue([
      depositTx,
      transferTx,
      withdrawalTx,
    ]);

    const result = await useCase.execute({ accountId: "acc-1" });

    expect(mockTransactionRepository.findByAccountId).toHaveBeenCalledWith("acc-1");
    expect(result.accountId).toBe("acc-1");
    expect(result.transactions).toHaveLength(3);
    expect(result.transactions[0]).toEqual(
      expect.objectContaining({
        id: "tx-1",
        type: "DEPOSIT",
        amount: 100,
        destinationAccountId: "acc-1",
      })
    );
    expect(result.transactions[1]).toEqual(
      expect.objectContaining({
        id: "tx-2",
        type: "TRANSFER",
        sourceAccountId: "acc-1",
        destinationAccountId: "acc-2",
      })
    );
    expect(result.transactions[2]).toEqual(
      expect.objectContaining({
        id: "tx-3",
        type: "WITHDRAWAL",
        sourceAccountId: "acc-1",
      })
    );
  });

  it("debería devolver un historial vacío si la cuenta no tiene transacciones", async () => {
    vi.mocked(mockTransactionRepository.findByAccountId).mockResolvedValue([]);

    const result = await useCase.execute({ accountId: "acc-empty" });

    expect(result).toEqual({
      accountId: "acc-empty",
      transactions: [],
    });
  });
});
