import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "../../../src/domain/entities/User";
import { PrismaUserRepository } from "../../../src/infrastructure/repositories/PrismaUserRepository";

describe("PrismaUserRepository", () => {
  let prisma: any;
  let repo: PrismaUserRepository;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
    };

    repo = new PrismaUserRepository(prisma);
  });

  it("debería devolver un usuario por id", async () => {
    const user = User.create({
      id: "user-1",
      email: "ana@email.com",
      passwordHash: "hash",
      fullName: "Ana",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    prisma.user.findUnique.mockResolvedValue({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      createdAt: user.createdAt,
    });

    const result = await repo.findById("user-1");

    expect(result).toBeInstanceOf(User);
    expect(result?.email).toBe("ana@email.com");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "user-1" } });
  });

  it("debería devolver un usuario por email", async () => {
    const user = User.create({
      id: "user-3",
      email: "maria@email.com",
      passwordHash: "hash",
      fullName: "Maria",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    prisma.user.findUnique.mockResolvedValue({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      createdAt: user.createdAt,
    });

    const result = await repo.findByEmail("maria@email.com");

    expect(result).toBeInstanceOf(User);
    expect(result?.email).toBe("maria@email.com");
  });

  it("debería devolver null cuando el usuario no existe", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await repo.findByEmail("missing@email.com");

    expect(result).toBeNull();
  });

  it("debería devolver null cuando el usuario por id no existe", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await repo.findById("missing-user");

    expect(result).toBeNull();
  });

  it("debería guardar o actualizar un usuario", async () => {
    const user = User.create({
      id: "user-2",
      email: "pedro@email.com",
      passwordHash: "hash",
      fullName: "Pedro",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    prisma.user.upsert.mockResolvedValue({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      fullName: user.fullName,
      createdAt: user.createdAt,
    });

    const result = await repo.save(user);

    expect(result).toBeInstanceOf(User);
    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { id: user.id, email: user.email },
      update: {
        email: user.email,
        passwordHash: user.passwordHash,
        fullName: user.fullName,
      },
      create: {
        fullName: user.fullName,
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
      },
    });
  });
});
