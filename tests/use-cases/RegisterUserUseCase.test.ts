import { describe, it, expect, beforeEach, vi } from "vitest";
import { RegisterUserUseCase } from "../../src/use-cases/RegisterUserUseCase";
import { UserRepository } from "../../src/domain/repositories/Repositories";
import { PasswordHasher } from "../../src/domain/services/PasswordHasher";
import { User } from "../../src/domain/entities/User";

describe("RegisterUserUseCase", () => {
  let mockUserRepository: UserRepository;
  let mockPasswordHasher: PasswordHasher;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
      save: vi.fn(),
    } as unknown as UserRepository;

    mockPasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    } as unknown as PasswordHasher;

    useCase = new RegisterUserUseCase(mockUserRepository, mockPasswordHasher);
  });

  it("debería registrar un usuario exitosamente", async () => {
    const user = User.create({
      id: "user-1",
      fullName: "Ana Pérez",
      email: "ana@email.com",
      passwordHash: "hashed-password",
      createdAt: new Date(),
    });

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(mockPasswordHasher.hash).mockResolvedValue("hashed-password");
    vi.mocked(mockUserRepository.save).mockResolvedValue(user);

    const result = await useCase.execute({
      name: "Ana Pérez",
      email: "ana@email.com",
      password: "secret123",
    });

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("ana@email.com");
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith("secret123");
    expect(mockUserRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Ana Pérez",
        email: "ana@email.com",
        passwordHash: "hashed-password",
      })
    );
    expect(result).toEqual({
      id: "user-1",
      name: "Ana Pérez",
      email: "ana@email.com",
      createdAt: expect.any(Date),
    });
  });

  it("debería lanzar un error si el correo ya existe", async () => {
    const existingUser = User.create({
      id: "user-1",
      fullName: "Ana Pérez",
      email: "ana@email.com",
      passwordHash: "hashed-password",
      createdAt: new Date(),
    });

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(existingUser);

    await expect(
      useCase.execute({
        name: "Ana Pérez",
        email: "ana@email.com",
        password: "secret123",
      })
    ).rejects.toThrow("User with this email already exists.");

    expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });
});
