import { beforeEach, describe, expect, it, vi } from "vitest";
import { Decimal } from "decimal.js";
import { Deposit } from "../../../src/domain/entities/Transaction";
import { PrismaTransactionRepository } from "../../../src/infrastructure/repositories/PrismaTransactionRepository";

describe("PrismaTransactionRepository", () => {
  let prisma: any;
  let repo: PrismaTransactionRepository;

  beforeEach(() => {
    prisma = {
      transaction: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
      },
    };

    repo = new PrismaTransactionRepository(prisma);
  });

  it("debería obtener una transacción por id", async () => {
    const transaction = Deposit.create({
      id: "tx-1",
      amount: new Decimal(25),
      status: "COMPLETED",
      description: "Depósito",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      destinationAccountId: "acc-2",
    });

    prisma.transaction.findUnique.mockResolvedValue({
      id: transaction.id,
      amount: { toNumber: () => 25 },
      status: transaction.status,
      description: transaction.description,
      createdAt: transaction.createdAt,
      type: "DEPOSIT",
      sourceAccountId: null,
      destinationAccountId: "acc-2",
    });

    const result = await repo.findById("tx-1");

    expect(result).toBeInstanceOf(Deposit);
    expect(result?.id).toBe("tx-1");
  });

  it("debería devolver el historial de una cuenta", async () => {
    prisma.transaction.findMany.mockResolvedValue([
      {
        id: "tx-1",
        amount: { toNumber: () => 25 },
        status: "COMPLETED",
        description: "Depósito",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        type: "DEPOSIT",
        sourceAccountId: null,
        destinationAccountId: "acc-2",
      },
    ]);

    const result = await repo.findByAccountId("acc-2");

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Deposit);
  });

  it("debería devolver un historial vacío si la consulta no encuentra transacciones", async () => {
    prisma.transaction.findMany.mockResolvedValue(null);

    const result = await repo.findByAccountId("missing-account");

    expect(result).toEqual([]);
  });

  it("debería devolver null cuando la transacción por id no existe", async () => {
    prisma.transaction.findUnique.mockResolvedValue(null);

    const result = await repo.findById("missing-transaction");

    expect(result).toBeNull();
  });

  it("debería guardar una transacción", async () => {
    const transaction = Deposit.create({
      id: "tx-2",
      amount: new Decimal(15),
      status: "COMPLETED",
      description: "Depósito",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      destinationAccountId: "acc-2",
    });

    prisma.transaction.create.mockResolvedValue({
      id: transaction.id,
      amount: { toNumber: () => 15 },
      status: transaction.status,
      description: transaction.description,
      createdAt: transaction.createdAt,
      type: "DEPOSIT",
      sourceAccountId: null,
      destinationAccountId: "acc-2",
    });

    const result = await repo.save(transaction);

    expect(result).toBeInstanceOf(Deposit);
    expect(prisma.transaction.create).toHaveBeenCalled();
  });
});
