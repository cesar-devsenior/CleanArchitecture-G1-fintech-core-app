import { describe, it, expect, vi } from "vitest";
import { errorHandler } from "../../src/presentation/middlewares/ErrorHandler";
import { InsufficientBalanceError, AccountNotFoundError } from "../../src/domain/exceptions/FinancialError";
import { InvalidCredentialsError, UserAlreadyExistsError } from "../../src/domain/exceptions/UserError";
import { DomainError } from "../../src/domain/exceptions/DomainError";
import { Prisma } from "../../src/generated/prisma/client";

describe("ErrorHandler", () => {
  it("debería responder 400 para InsufficientBalanceError", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;

    errorHandler(new InsufficientBalanceError("acc-1"), {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      code: "INSUFFICIENT_FUNDS",
      message: "Operacion denegada: Saldo insuficiente en la cuenta con ID: acc-1",
    });
  });

  it("debería responder 409 para UserAlreadyExistsError", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;

    errorHandler(new UserAlreadyExistsError("ana@email.com"), {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      code: "USER_ALREADY_EXISTS",
      message: "El usuario con el correo ana@email.com ya existe.",
    });
  });

  it("debería responder 401 para InvalidCredentialsError", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;

    errorHandler(new InvalidCredentialsError(), {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      code: "INVALID_CREDENTIALS",
      message: "Credenciales inválidas.",
    });
  });

  it("debería responder 404 para AccountNotFoundError", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;

    errorHandler(new AccountNotFoundError("acc-1"), {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      code: "ACCOUNT_NOT_FOUND",
      message: "La cuenta con ID 'acc-1' no fue encontrada o no existe.",
    });
  });

  it("debería responder 400 para DomainError", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;

    errorHandler(new DomainError("Error de dominio"), {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      code: "DOMAIN_VALIDATION_ERROR",
      message: "Error de dominio",
    });
  });

  it("debería responder 409 para Prisma P2002", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;

    const prismaError = new Prisma.PrismaClientKnownRequestError("duplicate", {
      code: "P2002",
      clientVersion: "1.0.0",
    });

    errorHandler(prismaError, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      code: "DUPLICATE_FIELD",
      message: "Existe un conflicto con un dato único ya registrado en el sistema.",
    });
  });

  it("debería responder 404 para Prisma P2025", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;

    const prismaError = new Prisma.PrismaClientKnownRequestError("not found", {
      code: "P2025",
      clientVersion: "1.0.0",
    });

    errorHandler(prismaError, {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      code: "RESOURCE_NOT_FOUND",
      message: "El recurso solicitado no fue encontrado en la base de datos.",
    });
  });

  it("debería responder 500 para errores inesperados", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;

    errorHandler(new Error("unexpected"), {} as any, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "Ocurrió un error interno e inesperado en el servidor. Por favor intente más tarde.",
    });
  });
});
