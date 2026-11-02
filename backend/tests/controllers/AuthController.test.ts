import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthController } from "../../src/presentation/controllers/AuthController";
import { RegisterUserUseCase } from "../../src/use-cases/RegisterUserUseCase";
import { LoginUseCase } from "../../src/use-cases/LoginUseCase";

describe("AuthController", () => {
  let registerUserUseCase: Partial<RegisterUserUseCase>;
  let loginUseCase: Partial<LoginUseCase>;
  let controller: AuthController;

  beforeEach(() => {
    registerUserUseCase = {
      execute: vi.fn(),
    };

    loginUseCase = {
      execute: vi.fn(),
    };

    controller = new AuthController(
      registerUserUseCase as RegisterUserUseCase,
      loginUseCase as LoginUseCase
    );
  });

  it("debería registrar un usuario y responder 201", async () => {
    const req = {
      body: {
        name: "Ana Pérez",
        email: "ana@email.com",
        password: "secret123",
      },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;

    const next = vi.fn();
    const result = {
      id: "user-1",
      name: "Ana Pérez",
      email: "ana@email.com",
      createdAt: new Date(),
    };

    vi.mocked(registerUserUseCase.execute as any).mockResolvedValue(result);

    await controller.register(req, res, next);

    expect(registerUserUseCase.execute).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: result,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("debería hacer login y responder 200", async () => {
    const req = {
      body: {
        email: "ana@email.com",
        password: "secret123",
      },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;

    const next = vi.fn();
    const result = {
      token: "jwt-token",
      user: {
        id: "user-1",
        name: "Ana Pérez",
        email: "ana@email.com",
      },
    };

    vi.mocked(loginUseCase.execute as any).mockResolvedValue(result);

    await controller.login(req, res, next);

    expect(loginUseCase.execute).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: result,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("debería pasar el error al siguiente middleware en register", async () => {
    const req = {
      body: {
        name: "Ana Pérez",
        email: "ana@email.com",
        password: "secret123",
      },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;

    const next = vi.fn();
    const error = new Error("boom");

    vi.mocked(registerUserUseCase.execute as any).mockRejectedValue(error);

    await controller.register(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("debería pasar el error al siguiente middleware en login", async () => {
    const req = {
      body: {
        email: "ana@email.com",
        password: "secret123",
      },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;

    const next = vi.fn();
    const error = new Error("boom");

    vi.mocked(loginUseCase.execute as any).mockRejectedValue(error);

    await controller.login(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
