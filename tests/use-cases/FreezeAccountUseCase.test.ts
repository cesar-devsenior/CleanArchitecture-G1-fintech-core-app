import { beforeEach, describe, expect, it, vi } from "vitest";
import { FreezeAccountUseCase } from "../../src/use-cases/FreezeAccountUseCase";
import { AccountRepository } from "../../src/domain/repositories/Repositories";
import { Account } from "../../src/domain/entities/Account";
import { Decimal } from "decimal.js";

describe("FreezeAccountUseCase", () => {
  let mockAccountRepository: AccountRepository;
  let useCase: FreezeAccountUseCase;

  beforeEach(() => {
    mockAccountRepository = {
      findById: vi.fn(),
      save: vi.fn(),
      freeze: vi.fn(),
    } as unknown as AccountRepository;

    useCase = new FreezeAccountUseCase(mockAccountRepository);
  });

  it("debería congelar la cuenta exitosamente si todos los requisitos se cumplen", async () => {
    const account = Account.create({
          id: "acc-1",
          accountNumber: "ACC-100",
          balance: new Decimal(100),
          userId: "user-1",
          status: "ACTIVE",
          createdAt: new Date()
        });

    vi.mocked(mockAccountRepository.findById).mockResolvedValue(account);

    await useCase.execute("acc-1");

    expect(mockAccountRepository.findById).toHaveBeenCalledWith("acc-1");
    expect(mockAccountRepository.freeze).toHaveBeenCalledWith(account);
  });

  it("debería lanzar AccountNotFoundError si la cuenta no existe", async () => {
    vi.mocked(mockAccountRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute("acc-1")).rejects.toThrow("La cuenta con ID 'acc-1' no fue encontrada o no existe.");
  });

  it("debería lanzar InvalidPropValueError si la cuenta ya está congelada", async () => {
    const account = Account.create({
          id: "acc-1",
          accountNumber: "ACC-100",
          balance: new Decimal(100),
          userId: "user-1",
          status: "FROZEN",
          createdAt: new Date()
        });

    vi.mocked(mockAccountRepository.findById).mockResolvedValue(account);

    await expect(useCase.execute("acc-1")).rejects.toThrow("Alerta de seguridad: La cuenta [acc-1] se encuentra congelada.");
  });
});