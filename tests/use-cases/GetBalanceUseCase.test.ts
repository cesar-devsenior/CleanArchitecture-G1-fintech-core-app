import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetBalanceUseCase } from "../../src/use-cases/GetBalanceUseCase";
import { AccountRepository } from "../../src/domain/repositories/Repositories";
import { Account } from "../../src/domain/entities/Account";
import { AccountNotFoundError } from "../../src/domain/exceptions/FinancialError";
import { Decimal } from "decimal.js";

describe("GetBalanceUseCase", () => {
  let mockAccountRepository: AccountRepository;
  let useCase: GetBalanceUseCase;

  beforeEach(() => {
    mockAccountRepository = {
      findById: vi.fn(),
    } as unknown as AccountRepository;

    useCase = new GetBalanceUseCase(mockAccountRepository);
  });

  it("debería retornar el balance de una cuenta existente", async () => {
    const account = Account.create({
        id: "acc-123",
        accountNumber: "ACC-001",
        balance: new Decimal(500),
        userId: "user-123",
        status: "ACTIVE",
        createdAt: new Date()
    });

    vi.mocked(mockAccountRepository.findById).mockResolvedValue(account);

    const result = await useCase.execute({ accountId: "acc-123" });

    expect(mockAccountRepository.findById).toHaveBeenCalledWith("acc-123");
    expect(result.id).toBe("acc-123");
    expect(result.balance.toNumber()).toBe(500);
  });

  it("debería lanzar AccountNotFoundError si la cuenta no existe", async () => {
    vi.mocked(mockAccountRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute({ accountId: "non-existent-acc" })).rejects.toThrow(AccountNotFoundError);
  });
});
