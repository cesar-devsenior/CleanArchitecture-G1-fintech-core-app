import { describe, it, expect, vi, beforeEach } from "vitest";
import { TransactionController } from "../../src/presentation/controllers/TransactionController";
import { TransferMoneyUseCase } from "../../src/use-cases/TransferMoneyUseCase";
import { DepositUseCase } from "../../src/use-cases/DepositUseCase";
import { WithdrawalUseCase } from "../../src/use-cases/WithdrawalUseCase";
import { GetTransactionHistoryUseCase } from "../../src/use-cases/GetTransactionHistoryUseCase";

describe("TransactionController", () => {
  let transferMoneyUseCase: Partial<TransferMoneyUseCase>;
  let depositUseCase: Partial<DepositUseCase>;
  let withdrawalUseCase: Partial<WithdrawalUseCase>;
  let getTransactionHistoryUseCase: Partial<GetTransactionHistoryUseCase>;
  let controller: TransactionController;

  beforeEach(() => {
    transferMoneyUseCase = { execute: vi.fn() };
    depositUseCase = { execute: vi.fn() };
    withdrawalUseCase = { execute: vi.fn() };
    getTransactionHistoryUseCase = { execute: vi.fn() };

    controller = new TransactionController(
      transferMoneyUseCase as TransferMoneyUseCase,
      depositUseCase as DepositUseCase,
      withdrawalUseCase as WithdrawalUseCase,
      getTransactionHistoryUseCase as GetTransactionHistoryUseCase
    );
  });

  it("debería transferir dinero y responder 201", async () => {
    const req = {
      body: {
        sourceAccountId: "acc-1",
        destinationAccountId: "acc-2",
        amount: 100,
      },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();
    const result = { transactionId: "tx-1" };

    vi.mocked(transferMoneyUseCase.execute as any).mockResolvedValue(result);

    await controller.transfer(req, res, next);

    expect(transferMoneyUseCase.execute).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Transferencia ejecutada de forma satisfactoria",
      data: result,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("debería depositar dinero y responder 201", async () => {
    const req = {
      body: {
        accountId: "acc-1",
        amount: 100,
      },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();
    const result = { accountId: "acc-1", newBalance: 150 };

    vi.mocked(depositUseCase.execute as any).mockResolvedValue(result);

    await controller.deposit(req, res, next);

    expect(depositUseCase.execute).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Depósito ejecutado de forma satisfactoria",
      data: result,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("debería retirar dinero y responder 201", async () => {
    const req = {
      body: {
        accountId: "acc-1",
        amount: 100,
      },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();
    const result = { accountId: "acc-1", newBalance: 50 };

    vi.mocked(withdrawalUseCase.execute as any).mockResolvedValue(result);

    await controller.withdrawal(req, res, next);

    expect(withdrawalUseCase.execute).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Retiro ejecutado de forma satisfactoria",
      data: result,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("debería devolver el historial de una cuenta", async () => {
    const req = {
      params: { accountId: "acc-1" },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();
    const history = { accountId: "acc-1", transactions: [] };

    vi.mocked(getTransactionHistoryUseCase.execute as any).mockResolvedValue(history);

    await controller.getHistory(req, res, next);

    expect(getTransactionHistoryUseCase.execute).toHaveBeenCalledWith({ accountId: "acc-1" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: history,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
