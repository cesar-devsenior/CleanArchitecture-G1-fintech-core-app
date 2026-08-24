import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateAccountUseCase } from "../../src/use-cases/CreateAccountUseCase";
import { AccountRepository } from "../../src/domain/repositories/Repositories";
import { Account } from "../../src/domain/entities/Account";
import { InvalidAmountError } from "../../src/domain/exceptions/FinancialError";
import { Decimal } from "decimal.js";

describe("CreateAccountUseCase", () => {
  let mockAccountRepository: AccountRepository;
  let useCase: CreateAccountUseCase;

  beforeEach(() => {
    mockAccountRepository = {
      save: vi.fn(),
    } as unknown as AccountRepository;

    useCase = new CreateAccountUseCase(mockAccountRepository);
  });

  it("debería crear una cuenta exitosamente con un balance inicial", async () => {
    const input = {
      userId: "user-123",
      initialBalance: 100,
    };

    const expectedAccount = Account.create({
        id: expect.any(String),
        accountNumber: expect.any(String),
        balance: new Decimal(100),
        userId: "user-123",
        status: "ACTIVE",
        createdAt: expect.any(Date)
    });

    vi.mocked(mockAccountRepository.save).mockResolvedValue(expectedAccount);

    const result = await useCase.execute(input);

    expect(mockAccountRepository.save).toHaveBeenCalledOnce();
    expect(result.userId).toBe(input.userId);
    expect(result.balance.toNumber()).toBe(input.initialBalance);
    expect(result.status).toBe("ACTIVE");
  });

  it("debería crear una cuenta exitosamente sin un balance inicial", async () => {
    const input = {
      userId: "user-456",
    };

    const expectedAccount = Account.create({
        id: expect.any(String),
        accountNumber: expect.any(String),
        balance: new Decimal(0),
        userId: "user-456",
        status: "ACTIVE",
        createdAt: expect.any(Date)
    });

    vi.mocked(mockAccountRepository.save).mockResolvedValue(expectedAccount);

    const result = await useCase.execute(input);

    expect(mockAccountRepository.save).toHaveBeenCalledOnce();
    expect(result.userId).toBe(input.userId);
    expect(result.balance.toNumber()).toBe(0);
  });

  it("debería lanzar un InvalidAmountError si el balance inicial es negativo", async () => {
    const input = {
      userId: "user-789",
      initialBalance: -50,
    };

    await expect(useCase.execute(input)).rejects.toThrow(InvalidAmountError);
  });
});
