import { describe, it, expect } from "vitest";
import { User } from "../../../src/domain/entities/User";
import { UserMapper } from "../../../src/infrastructure/mappers/UserMapper";

describe("UserMapper", () => {
  it("debería convertir un registro Prisma en una entidad de dominio", () => {
    const prismaUser = {
      id: "user-1",
      email: "ana@email.com",
      passwordHash: "hashed-password",
      fullName: "Ana",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    } as any;

    const result = UserMapper.toDomain(prismaUser);

    expect(result).toBeInstanceOf(User);
    expect(result.id).toBe("user-1");
    expect(result.email).toBe("ana@email.com");
    expect(result.fullName).toBe("Ana");
  });

  it("debería convertir una entidad de dominio en un payload de persistencia", () => {
    const user = User.create({
      id: "user-1",
      email: "ana@email.com",
      passwordHash: "hashed-password",
      fullName: "Ana",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    const result = UserMapper.toPersistence(user);

    expect(result).toEqual({
      id: "user-1",
      email: "ana@email.com",
      passwordHash: "hashed-password",
      fullName: "Ana",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });
  });
});
