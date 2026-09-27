import { AccountRepository } from "../domain/repositories/Repositories";
import { InvalidAmountError, AccountNotFoundError, AccountFrozenError, InsufficientBalanceError } from "../domain/exceptions/FinancialError";
import { WithdrawalInputDTO, WithdrawalOutputDTO } from "./dto/WithdrawalDTOs";
import { Decimal } from "decimal.js";
import { Withdrawal } from "../domain/entities/Transaction";

export class WithdrawalUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(input: WithdrawalInputDTO): Promise<WithdrawalOutputDTO> {
    const { accountId, amount } = input;

    if (amount <= 0) {
      throw new InvalidAmountError("El monto a retirar debe ser un valor positivo.");
    }

    const withdrawalAmount = new Decimal(amount);

    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new AccountNotFoundError(accountId);
    }

    if (account.status === "FROZEN") {
      throw new AccountFrozenError(accountId);
    }

    if (account.balance.lessThan(withdrawalAmount)) {
      throw new InsufficientBalanceError(account.id!);
    }

    account.withdraw(withdrawalAmount);

    // Ejecutar la transacción de retiro y guardar los cambios en la cuenta
    const withdrawalTransaction = Withdrawal.create({
      amount: withdrawalAmount,
      status: "PENDING",
      sourceAccountId: accountId,
      createdAt: new Date(),
      description: `Retiro de ${withdrawalAmount.toNumber()} de la cuenta ${accountId}.`
    });

    const savedTransaction = await this.accountRepository.executeTransaction(withdrawalTransaction);

    return {
      accountId: savedTransaction.id!,
      newBalance: account.balance.toNumber(),
      withdrawnAt: new Date(),
    };
  }
}
