import { describe, it, expect } from "vitest";
import { Decimal } from "decimal.js";
import { Account } from "../../../src/domain/entities/Account";
import { AccountMapper } from "../../../src/infrastructure/mappers/AccountMapper";

describe("AccountMapper", () => {
  it("debería convertir un registro Prisma en una entidad de dominio", () => {
    const prismaAccount = {
      id: "acc-1",
      accountNumber: "ACC-001",
      balance: new Decimal(250),
      userId: "user-1",
      status: "ACTIVE",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    } as any;

    const result = AccountMapper.toDomain(prismaAccount);

    expect(result).toBeInstanceOf(Account);
    expect(result.id).toBe("acc-1");
    expect(result.accountNumber).toBe("ACC-001");
    expect(result.balance.toNumber()).toBe(250);
    expect(result.userId).toBe("user-1");
    expect(result.status).toBe("ACTIVE");
  });

  it("debería convertir una entidad de dominio en un payload de persistencia", () => {
    const account = Account.create({
      id: "acc-1",
      accountNumber: "ACC-001",
      balance: new Decimal(250),
      userId: "user-1",
      status: "ACTIVE",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    const result = AccountMapper.toPersistence(account);

    expect(result).toEqual({
      id: "acc-1",
      accountNumber: "ACC-001",
      balance: account.balance,
      userId: "user-1",
      status: "ACTIVE",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });
  });
});
