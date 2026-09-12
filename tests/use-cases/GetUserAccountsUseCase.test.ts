import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetUserAccountsUseCase } from "../../src/use-cases/GetUserAccountsUseCase";
import { AccountRepository } from "../../src/domain/repositories/Repositories";
import { Account } from "../../src/domain/entities/Account";
import { Decimal } from "decimal.js";

describe("GetUserAccountsUseCase", () => {
  let mockAccountRepository: AccountRepository;
  let useCase: GetUserAccountsUseCase;

  beforeEach(() => {
    mockAccountRepository = {
      findByUserId: vi.fn(),
    } as unknown as AccountRepository;

    useCase = new GetUserAccountsUseCase(mockAccountRepository);
  });

  it("debería devolver todas las cuentas del usuario", async () => {
    const accounts = [
      Account.create({
        id: "acc-1",
        accountNumber: "ACC-001",
        balance: new Decimal(100),
        userId: "user-1",
        status: "ACTIVE",
        createdAt: new Date(),
      }),
      Account.create({
        id: "acc-2",
        accountNumber: "ACC-002",
        balance: new Decimal(250),
        userId: "user-1",
        status: "FROZEN",
        createdAt: new Date(),
      }),
    ];

    vi.mocked(mockAccountRepository.findByUserId).mockResolvedValue(accounts);

    const result = await useCase.execute({ userId: "user-1" });

    expect(mockAccountRepository.findByUserId).toHaveBeenCalledWith("user-1");
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(
      expect.objectContaining({
        id: "acc-1",
        accountNumber: "ACC-001",
        userId: "user-1",
        status: "ACTIVE",
      })
    );
    expect(result[1].status).toBe("FROZEN");
  });

  it("debería devolver un arreglo vacío cuando el usuario no tiene cuentas", async () => {
    vi.mocked(mockAccountRepository.findByUserId).mockResolvedValue([]);

    const result = await useCase.execute({ userId: "user-without-accounts" });

    expect(result).toEqual([]);
  });
});
