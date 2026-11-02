import { beforeEach, describe, expect, it, vi } from "vitest";
import { Decimal } from "decimal.js";
import { Account } from "../../../src/domain/entities/Account";
import { Deposit, Transfer, Withdrawal } from "../../../src/domain/entities/Transaction";
import { PrismaAccountRepository } from "../../../src/infrastructure/repositories/PrismaAccountRepository";

describe("PrismaAccountRepository", () => {
  let prisma: any;
  let repo: PrismaAccountRepository;

  beforeEach(() => {
    prisma = {
      account: {
        upsert: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    repo = new PrismaAccountRepository(prisma);
  });

  it("debería guardar o actualizar una cuenta", async () => {
    const account = Account.create({
      id: "acc-1",
      accountNumber: "ACC-001",
      balance: new Decimal(100),
      userId: "user-1",
      status: "ACTIVE",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    prisma.account.upsert.mockResolvedValue({
      id: account.id,
      accountNumber: account.accountNumber,
      balance: account.balance,
      userId: account.userId,
      status: account.status,
      createdAt: account.createdAt,
    });

    const result = await repo.save(account);

    expect(result).toBeInstanceOf(Account);
    expect(prisma.account.upsert).toHaveBeenCalled();
  });

  it("debería encontrar una cuenta por id", async () => {
    prisma.account.findUnique.mockResolvedValue({
      id: "acc-1",
      accountNumber: "ACC-001",
      balance: 100,
      userId: "user-1",
      status: "ACTIVE",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    const result = await repo.findById("acc-1");

    expect(result).toBeInstanceOf(Account);
    expect(result?.accountNumber).toBe("ACC-001");
  });

  it("debería devolver null cuando la cuenta por id no existe", async () => {
    prisma.account.findUnique.mockResolvedValue(null);

    const result = await repo.findById("missing-account");

    expect(result).toBeNull();
  });

  it("debería encontrar una cuenta por número", async () => {
    prisma.account.findUnique.mockResolvedValue({
      id: "acc-2",
      accountNumber: "ACC-002",
      balance: 200,
      userId: "user-1",
      status: "ACTIVE",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    const result = await repo.findByAccountNumber("ACC-002");

    expect(result).toBeInstanceOf(Account);
    expect(result?.accountNumber).toBe("ACC-002");
  });

  it("debería devolver null cuando la cuenta por número no existe", async () => {
    prisma.account.findUnique.mockResolvedValue(null);

    const result = await repo.findByAccountNumber("missing-number");

    expect(result).toBeNull();
  });

  it("debería encontrar cuentas por usuario", async () => {
    prisma.account.findMany.mockResolvedValue([
      {
        id: "acc-1",
        accountNumber: "ACC-001",
        balance: 100,
        userId: "user-1",
        status: "ACTIVE",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      },
    ]);

    const result = await repo.findByUserId("user-1");

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Account);
  });

  it("debería ejecutar una transacción de transferencia", async () => {
    const transaction = Transfer.create({
      id: "tx-1",
      amount: new Decimal(20),
      status: "PENDING",
      description: "Transferencia",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      sourceAccountId: "acc-1",
      destinationAccountId: "acc-2",
    });

    prisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        account: {
          update: vi.fn(),
        },
        transaction: {
          create: vi.fn().mockResolvedValue({
            id: transaction.id,
            amount: { toNumber: () => 20 },
            status: "COMPLETED",
            description: transaction.description,
            createdAt: transaction.createdAt,
            type: "TRANSFER",
            sourceAccountId: "acc-1",
            destinationAccountId: "acc-2",
          }),
        },
      };

      return cb(tx);
    });

    const result = await repo.executeTransaction(transaction);

    expect(result).toBeInstanceOf(Transfer);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("debería ejecutar una transacción de depósito", async () => {
    const transaction = Deposit.create({
      id: "tx-2",
      amount: new Decimal(50),
      status: "PENDING",
      description: "Depósito",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      destinationAccountId: "acc-2",
    });

    prisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        account: {
          update: vi.fn(),
        },
        transaction: {
          create: vi.fn().mockResolvedValue({
            id: transaction.id,
            amount: { toNumber: () => 50 },
            status: "COMPLETED",
            description: transaction.description,
            createdAt: transaction.createdAt,
            type: "DEPOSIT",
            sourceAccountId: null,
            destinationAccountId: "acc-2",
          }),
        },
      };

      return cb(tx);
    });

    const result = await repo.executeTransaction(transaction);

    expect(result).toBeInstanceOf(Deposit);
  });

  it("debería ejecutar una transacción de retiro", async () => {
    const transaction = Withdrawal.create({
      id: "tx-3",
      amount: new Decimal(30),
      status: "PENDING",
      description: "Retiro",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      sourceAccountId: "acc-1",
    });

    prisma.$transaction.mockImplementation(async (cb: any) => {
      const tx = {
        account: {
          update: vi.fn(),
        },
        transaction: {
          create: vi.fn().mockResolvedValue({
            id: transaction.id,
            amount: { toNumber: () => 30 },
            status: "COMPLETED",
            description: transaction.description,
            createdAt: transaction.createdAt,
            type: "WITHDRAWAL",
            sourceAccountId: "acc-1",
            destinationAccountId: null,
          }),
        },
      };

      return cb(tx);
    });

    const result = await repo.executeTransaction(transaction);

    expect(result).toBeInstanceOf(Withdrawal);
  });

  it("debería congelar una cuenta", async () => {
    await repo.freeze(Account.create({
      id: "acc-1",
      accountNumber: "ACC-001",
      balance: new Decimal(100),
      userId: "user-1",
      status: "ACTIVE",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    }));

    expect(prisma.account.update).toHaveBeenCalledWith({
      where: { id: "acc-1" },
      data: { status: "FROZEN" },
    });
  });

  it("debería descongelar una cuenta", async () => {
    await repo.unfreeze(Account.create({
      id: "acc-1",
      accountNumber: "ACC-001",
      balance: new Decimal(100),
      userId: "user-1",
      status: "FROZEN",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    }));

    expect(prisma.account.update).toHaveBeenCalledWith({
      where: { id: "acc-1" },
      data: { status: "ACTIVE" },
    });
  });
});
