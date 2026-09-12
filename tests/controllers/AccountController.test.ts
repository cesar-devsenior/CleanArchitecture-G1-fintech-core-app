import { describe, it, expect, vi, beforeEach } from "vitest";
import { AccountController } from "../../src/presentation/controllers/AccountController";
import { GetUserAccountsUseCase } from "../../src/use-cases/GetUserAccountsUseCase";
import { CreateAccountUseCase } from "../../src/use-cases/CreateAccountUseCase";
import { GetBalanceUseCase } from "../../src/use-cases/GetBalanceUseCase";
import { FreezeAccountUseCase } from "../../src/use-cases/FreezeAccountUseCase";
import { UnfreezeAccountUseCase } from "../../src/use-cases/UnfreezeAccountUseCase";

describe("AccountController", () => {
  let getUserAccountsUseCase: Partial<GetUserAccountsUseCase>;
  let createAccountUseCase: Partial<CreateAccountUseCase>;
  let getBalanceUseCase: Partial<GetBalanceUseCase>;
  let freezeAccountUseCase: Partial<FreezeAccountUseCase>;
  let unfreezeAccountUseCase: Partial<UnfreezeAccountUseCase>;
  let controller: AccountController;

  beforeEach(() => {
    getUserAccountsUseCase = { execute: vi.fn() };
    createAccountUseCase = { execute: vi.fn() };
    getBalanceUseCase = { execute: vi.fn() };
    freezeAccountUseCase = { execute: vi.fn() };
    unfreezeAccountUseCase = { execute: vi.fn() };

    controller = new AccountController(
      getUserAccountsUseCase as GetUserAccountsUseCase,
      createAccountUseCase as CreateAccountUseCase,
      getBalanceUseCase as GetBalanceUseCase,
      freezeAccountUseCase as FreezeAccountUseCase,
      unfreezeAccountUseCase as UnfreezeAccountUseCase
    );
  });

  it("debería devolver las cuentas del usuario autenticado", async () => {
    const req = {
      user: { userId: "user-1", email: "ana@email.com" },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();
    const accounts = [{ id: "acc-1" }];

    vi.mocked(getUserAccountsUseCase.execute as any).mockResolvedValue(accounts);

    await controller.getUserAccounts(req, res, next);

    expect(getUserAccountsUseCase.execute).toHaveBeenCalledWith({ userId: "user-1" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: accounts,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("debería crear una cuenta y responder 201", async () => {
    const req = {
      user: { userId: "user-1", email: "ana@email.com" },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();
    const createdAccount = { id: "acc-1", accountNumber: "ACC-001" };

    vi.mocked(createAccountUseCase.execute as any).mockResolvedValue(createdAccount);

    await controller.createAccount(req, res, next);

    expect(createAccountUseCase.execute).toHaveBeenCalledWith({ userId: "user-1" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: createdAccount,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("debería obtener el saldo de una cuenta", async () => {
    const req = {
      params: { accountId: "acc-1" },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();
    const balance = { id: "acc-1", balance: 500 };

    vi.mocked(getBalanceUseCase.execute as any).mockResolvedValue(balance);

    await controller.getBalance(req, res, next);

    expect(getBalanceUseCase.execute).toHaveBeenCalledWith({ accountId: "acc-1" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: balance,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("debería congelar una cuenta", async () => {
    const req = {
      params: { accountId: "acc-1" },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    await controller.freezeAccount(req, res, next);

    expect(freezeAccountUseCase.execute).toHaveBeenCalledWith("acc-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Cuenta congelada correctamente",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("debería descongelar una cuenta", async () => {
    const req = {
      params: { accountId: "acc-1" },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    await controller.unfreezeAccount(req, res, next);

    expect(unfreezeAccountUseCase.execute).toHaveBeenCalledWith("acc-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Cuenta descongelada correctamente",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("debería normalizar accountId cuando llega como arreglo en getBalance", async () => {
    const req = {
      params: { accountId: ["acc-1"] },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();
    const balance = { id: "acc-1", balance: 500 };

    vi.mocked(getBalanceUseCase.execute as any).mockResolvedValue(balance);

    await controller.getBalance(req, res, next);

    expect(getBalanceUseCase.execute).toHaveBeenCalledWith({ accountId: "acc-1" });
  });

  it("debería normalizar accountId cuando llega como arreglo en freezeAccount", async () => {
    const req = {
      params: { accountId: ["acc-1"] },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    await controller.freezeAccount(req, res, next);

    expect(freezeAccountUseCase.execute).toHaveBeenCalledWith("acc-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Cuenta congelada correctamente",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("debería normalizar accountId cuando llega como arreglo en unfreezeAccount", async () => {
    const req = {
      params: { accountId: ["acc-1"] },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    await controller.unfreezeAccount(req, res, next);

    expect(unfreezeAccountUseCase.execute).toHaveBeenCalledWith("acc-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Cuenta descongelada correctamente",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("debería pasar el error al siguiente middleware en getUserAccounts", async () => {
    const req = {
      user: { userId: "user-1", email: "ana@email.com" },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();
    const error = new Error("boom");

    vi.mocked(getUserAccountsUseCase.execute as any).mockRejectedValue(error);

    await controller.getUserAccounts(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("debería pasar el error al siguiente middleware en createAccount", async () => {
    const req = {
      user: { userId: "user-1", email: "ana@email.com" },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();
    const error = new Error("boom");

    vi.mocked(createAccountUseCase.execute as any).mockRejectedValue(error);

    await controller.createAccount(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("debería pasar el error al siguiente middleware en getBalance", async () => {
    const req = {
      params: { accountId: "acc-1" },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();
    const error = new Error("boom");

    vi.mocked(getBalanceUseCase.execute as any).mockRejectedValue(error);

    await controller.getBalance(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("debería pasar el error al siguiente middleware en freezeAccount", async () => {
    const req = {
      params: { accountId: "acc-1" },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();
    const error = new Error("boom");

    vi.mocked(freezeAccountUseCase.execute as any).mockRejectedValue(error);

    await controller.freezeAccount(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("debería pasar el error al siguiente middleware en unfreezeAccount", async () => {
    const req = {
      params: { accountId: "acc-1" },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();
    const error = new Error("boom");

    vi.mocked(unfreezeAccountUseCase.execute as any).mockRejectedValue(error);

    await controller.unfreezeAccount(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
