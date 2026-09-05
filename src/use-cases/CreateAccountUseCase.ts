import Decimal from "decimal.js";
import { Account } from "../domain/entities/Account";
import { InvalidAmountError } from "../domain/exceptions/FinancialError";
import { AccountRepository } from "../domain/repositories/Repositories";
import { AccountStatus } from "../generated/prisma/enums";
import { CreateAccountInputDTO, AccountOutputDTO } from "./dto/AccountDTOs";

export class CreateAccountUseCase {
  constructor(private readonly accountRepository: AccountRepository) { }

  async execute(input: CreateAccountInputDTO): Promise<AccountOutputDTO> {
    const initialBalance = input.initialBalance?.toNumber() ?? 0;

    if(initialBalance < 0) {
      throw new InvalidAmountError("El monto de la operacion debe ser mayor a cero.");
    }

    const accountNumber = `ACC-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const account = Account.create({
      accountNumber,
      balance: new Decimal(initialBalance),
      userId: input.userId,
      status: AccountStatus.ACTIVE,
      createdAt: new Date()
    });

    const saved = await this.accountRepository.save(account);

    return {
      id: saved.id,
      accountNumber: saved.accountNumber,
      balance: saved.balance,
      status: saved.status,
      userId: saved.userId,
      createdAt: saved.createdAt
    };
  }
}