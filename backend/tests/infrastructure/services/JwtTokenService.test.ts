import { beforeEach, describe, expect, it } from "vitest";
import { JwtTokenService } from "../../../src/infrastructure/services/JwtTokenService";

describe("JwtTokenService", () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  it("debería generar y verificar un token válido", () => {
    const service = new JwtTokenService();

    const token = service.generateToken({
      userId: "user-1",
      email: "ana@email.com",
    });

    expect(token).toBeTruthy();
    expect(service.verifyToken(token)).toEqual({
      userId: "user-1",
      email: "ana@email.com",
    });
  });

  it("debería lanzar error si el token es inválido", () => {
    const service = new JwtTokenService();

    expect(() => service.verifyToken("token-invalido")).toThrow(
      "Token de autenticación inválido o expirado."
    );
  });

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
      return;
    }

    process.env.JWT_SECRET = originalSecret;
  });
});
