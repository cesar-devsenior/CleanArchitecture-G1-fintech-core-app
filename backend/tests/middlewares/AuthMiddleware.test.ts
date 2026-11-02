import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthMiddleware } from "../../src/presentation/middlewares/AuthMiddleware";
import { TokenService } from "../../src/domain/services/TokenService";

describe("AuthMiddleware", () => {
  let mockTokenService: TokenService;
  let middleware: AuthMiddleware;

  beforeEach(() => {
    mockTokenService = {
      generateToken: vi.fn(),
      verifyToken: vi.fn(),
    } as unknown as TokenService;

    middleware = new AuthMiddleware(mockTokenService);
  });

  it("debería devolver 401 si no hay Authorization header", () => {
    const req = { headers: {} } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    middleware.handle(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      code: "UNAUTHORIZED",
      message: "Acceso denegado. Se requiere un Bearer Token válido en la cabecera Authorization.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("debería devolver 401 si el token es inválido", () => {
    const req = {
      headers: {
        authorization: "Bearer invalid-token",
      },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    vi.mocked(mockTokenService.verifyToken as any).mockImplementation(() => {
      throw new Error("invalid token");
    });

    middleware.handle(req, res, next);

    expect(mockTokenService.verifyToken).toHaveBeenCalledWith("invalid-token");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      code: "INVALID_TOKEN",
      message: "El token de autenticación provisto es inválido o ha expirado.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("debería inyectar el usuario y continuar si el token es válido", () => {
    const req = {
      headers: {
        authorization: "Bearer valid-token",
      },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    vi.mocked(mockTokenService.verifyToken as any).mockReturnValue({
      userId: "user-1",
      email: "ana@email.com",
    });

    middleware.handle(req, res, next);

    expect(mockTokenService.verifyToken).toHaveBeenCalledWith("valid-token");
    expect(req.user).toEqual({
      userId: "user-1",
      email: "ana@email.com",
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
