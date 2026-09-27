import { AccountRepository } from "../domain/repositories/Repositories";
import { InvalidAmountError, AccountNotFoundError, AccountFrozenError } from "../domain/exceptions/FinancialError";
import { DepositInputDTO, DepositOutputDTO } from "./dto/DepositDTOs";
import { Decimal } from "decimal.js";
import { Deposit } from "../domain/entities/Transaction";

export class DepositUseCase {
  constructor(private readonly accountRepository: AccountRepository) { }

  async execute(input: DepositInputDTO): Promise<DepositOutputDTO> {
    const { accountId, amount } = input;

    if (amount <= 0) {
      throw new InvalidAmountError("El monto a depositar debe ser un valor positivo.");
    }

    const depositAmount = new Decimal(amount);

    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new AccountNotFoundError(accountId);
    }

    if (account.status === "FROZEN") {
      throw new AccountFrozenError(accountId);
    }

    account.deposit(depositAmount);

    // Ejecutar la transacción de depósito y guardar los cambios en la cuenta
    const depositTransaction = Deposit.create({
      amount: depositAmount,
      status: "PENDING",
      destinationAccountId: accountId,
      createdAt: new Date(),
      description: `Deposito de ${depositAmount.toNumber()} a la cuenta ${accountId}.`
    });

    const savedTransaction = await this.accountRepository.executeTransaction(depositTransaction);

    return {
      accountId: savedTransaction.id!,
      newBalance: account.balance.toNumber(),
      depositedAt: new Date(),
    };
  }
}
