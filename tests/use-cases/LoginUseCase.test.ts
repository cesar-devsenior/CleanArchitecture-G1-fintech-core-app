import { describe, it, expect, beforeEach, vi } from "vitest";
import { LoginUseCase } from "../../src/use-cases/LoginUseCase";
import { UserRepository } from "../../src/domain/repositories/Repositories";
import { PasswordHasher } from "../../src/domain/services/PasswordHasher";
import { TokenService } from "../../src/domain/services/TokenService";
import { User } from "../../src/domain/entities/User";

describe("LoginUseCase", () => {
  let mockUserRepository: UserRepository;
  let mockTokenService: TokenService;
  let mockPasswordHasher: PasswordHasher;
  let useCase: LoginUseCase;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
    } as unknown as UserRepository;

    mockTokenService = {
      generateToken: vi.fn(),
      verifyToken: vi.fn(),
    } as unknown as TokenService;

    mockPasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    } as unknown as PasswordHasher;

    useCase = new LoginUseCase(mockUserRepository, mockTokenService, mockPasswordHasher);
  });

  it("debería devolver token y datos del usuario si las credenciales son válidas", async () => {
    const user = User.create({
      id: "user-1",
      fullName: "Ana Pérez",
      email: "ana@email.com",
      passwordHash: "hashed-password",
      createdAt: new Date(),
    });

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(user);
    vi.mocked(mockPasswordHasher.compare).mockResolvedValue(true);
    vi.mocked(mockTokenService.generateToken).mockReturnValue("jwt-token");

    const result = await useCase.execute({
      email: "ana@email.com",
      password: "secret123",
    });

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("ana@email.com");
    expect(mockPasswordHasher.compare).toHaveBeenCalledWith("secret123", "hashed-password");
    expect(mockTokenService.generateToken).toHaveBeenCalledWith({
      userId: "user-1",
      email: "ana@email.com",
    });

    expect(result).toEqual({
      token: "jwt-token",
      user: {
        id: "user-1",
        name: "Ana Pérez",
        email: "ana@email.com",
      },
    });
  });

  it("debería lanzar un error si el usuario no existe", async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: "missing@email.com",
        password: "secret123",
      })
    ).rejects.toThrow("Invalid email or password.");

    expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
    expect(mockTokenService.generateToken).not.toHaveBeenCalled();
  });

  it("debería lanzar un error si la contraseña no coincide", async () => {
    const user = User.create({
      id: "user-1",
      fullName: "Ana Pérez",
      email: "ana@email.com",
      passwordHash: "hashed-password",
      createdAt: new Date(),
    });

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(user);
    vi.mocked(mockPasswordHasher.compare).mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: "ana@email.com",
        password: "wrong-password",
      })
    ).rejects.toThrow("Invalid email or password.");

    expect(mockTokenService.generateToken).not.toHaveBeenCalled();
  });
});
