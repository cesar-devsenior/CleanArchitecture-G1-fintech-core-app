import { describe, it, expect } from "vitest";
import { Decimal } from "decimal.js";
import {
  Deposit,
  Transaction,
  Transfer,
  Withdrawal,
} from "../../../src/domain/entities/Transaction";
import { TransactionMapper } from "../../../src/infrastructure/mappers/TransactionMapper";

describe("TransactionMapper", () => {
  it("debería convertir una transacción Prisma DEPOSIT a entidad de dominio", () => {
    const prismaTx = {
      id: "tx-1",
      amount: { toNumber: () => 100 },
      status: "COMPLETED",
      description: "Depósito inicial",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      type: "DEPOSIT",
      destinationAccountId: "acc-2",
      sourceAccountId: null,
    } as any;

    const result = TransactionMapper.toDomain(prismaTx);

    expect(result).toBeInstanceOf(Deposit);
    expect(result.id).toBe("tx-1");
    expect(result.amount.toNumber()).toBe(100);
    expect(result.destinationAccount).toBe("acc-2");
  });

  it("debería convertir una transacción Prisma WITHDRAWAL a entidad de dominio", () => {
    const prismaTx = {
      id: "tx-2",
      amount: { toNumber: () => 40 },
      status: "COMPLETED",
      description: "Retiro",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      type: "WITHDRAWAL",
      sourceAccountId: "acc-1",
      destinationAccountId: null,
    } as any;

    const result = TransactionMapper.toDomain(prismaTx);

    expect(result).toBeInstanceOf(Withdrawal);
    expect(result.sourceAccount).toBe("acc-1");
  });

  it("debería convertir una transacción Prisma TRANSFER a entidad de dominio", () => {
    const prismaTx = {
      id: "tx-3",
      amount: { toNumber: () => 75 },
      status: "COMPLETED",
      description: "Transferencia",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      type: "TRANSFER",
      sourceAccountId: "acc-1",
      destinationAccountId: "acc-2",
    } as any;

    const result = TransactionMapper.toDomain(prismaTx);

    expect(result).toBeInstanceOf(Transfer);
    expect(result.sourceAccount).toBe("acc-1");
    expect(result.destinationAccount).toBe("acc-2");
  });

  it("debería convertir una entidad de dominio Deposit a persistencia", () => {
    const transaction = Deposit.create({
      id: "tx-1",
      amount: new Decimal(100),
      status: "COMPLETED",
      description: "Depósito",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      destinationAccountId: "acc-2",
    });

    const result = TransactionMapper.toPersistence(transaction);

    expect(result).toMatchObject({
      id: "tx-1",
      amount: new Decimal(100),
      type: "DEPOSIT",
      sourceAccountId: null,
      destinationAccountId: "acc-2",
      status: "COMPLETED",
    });
  });

  it("debería convertir una entidad de dominio Withdrawal a persistencia", () => {
    const transaction = Withdrawal.create({
      id: "tx-2",
      amount: new Decimal(40),
      status: "COMPLETED",
      description: "Retiro",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      sourceAccountId: "acc-1",
    });

    const result = TransactionMapper.toPersistence(transaction);

    expect(result).toMatchObject({
      id: "tx-2",
      type: "WITHDRAWAL",
      sourceAccountId: "acc-1",
      destinationAccountId: null,
    });
  });

  it("debería convertir una entidad de dominio Transfer a persistencia", () => {
    const transaction = Transfer.create({
      id: "tx-3",
      amount: new Decimal(75),
      status: "PENDING",
      description: "Transferencia",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      sourceAccountId: "acc-1",
      destinationAccountId: "acc-2",
    });

    const result = TransactionMapper.toPersistence(transaction);

    expect(result).toMatchObject({
      id: "tx-3",
      type: "TRANSFER",
      sourceAccountId: "acc-1",
      destinationAccountId: "acc-2",
      status: "PENDING",
    });
  });

  it("debería lanzar error si un depósito Prisma no tiene destinationAccountId", () => {
    const prismaTx = {
      id: "tx-4",
      amount: { toNumber: () => 10 },
      status: "COMPLETED",
      description: "Depósito corrupto",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      type: "DEPOSIT",
      sourceAccountId: null,
      destinationAccountId: null,
    } as any;

    expect(() => TransactionMapper.toDomain(prismaTx)).toThrow("Inconsistencia en DB: Deposit requiere destinationAccountId");
  });

  it("debería lanzar error si un retiro Prisma no tiene sourceAccountId", () => {
    const prismaTx = {
      id: "tx-5",
      amount: { toNumber: () => 10 },
      status: "COMPLETED",
      description: "Retiro corrupto",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      type: "WITHDRAWAL",
      sourceAccountId: null,
      destinationAccountId: null,
    } as any;

    expect(() => TransactionMapper.toDomain(prismaTx)).toThrow("Inconsistencia en DB: Withdrawal requiere sourceAccountId");
  });

  it("debería lanzar error si una transferencia Prisma no tiene cuenta de origen", () => {
    const prismaTx = {
      id: "tx-6",
      amount: { toNumber: () => 10 },
      status: "COMPLETED",
      description: "Transferencia corrupta",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      type: "TRANSFER",
      sourceAccountId: null,
      destinationAccountId: "acc-2",
    } as any;

    expect(() => TransactionMapper.toDomain(prismaTx)).toThrow("Inconsistencia en DB: Transfer requiere ambas cuentas (origen y destino)");
  });

  it("debería lanzar error si una transferencia Prisma no tiene cuenta de destino", () => {
    const prismaTx = {
      id: "tx-7",
      amount: { toNumber: () => 10 },
      status: "COMPLETED",
      description: "Transferencia corrupta",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      type: "TRANSFER",
      sourceAccountId: "acc-1",
      destinationAccountId: null,
    } as any;

    expect(() => TransactionMapper.toDomain(prismaTx)).toThrow("Inconsistencia en DB: Transfer requiere ambas cuentas (origen y destino)");
  });

  it("debería lanzar error cuando se intenta persistir una instancia inválida", () => {
    const transaction = {} as any;

    expect(() => TransactionMapper.toPersistence(transaction)).toThrow("Instancia de transacción inválida proporcionada al Mapper");
  });

  it("debería lanzar error cuando la transacción Prisma tiene un tipo desconocido", () => {
    const prismaTx = {
      id: "tx-8",
      amount: { toNumber: () => 10 },
      status: "COMPLETED",
      description: "Corrupto",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      type: "UNKNOWN",
      sourceAccountId: null,
      destinationAccountId: null,
    } as any;

    expect(() => TransactionMapper.toDomain(prismaTx)).toThrow("Tipo de transacción desconocido o corrupto en DB: UNKNOWN");
  });
});
