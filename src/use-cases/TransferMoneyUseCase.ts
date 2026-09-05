import Decimal from "decimal.js";
import { Transfer } from "../domain/entities/Transaction";
import { InvalidPropValueError } from "../domain/exceptions/DomainError";
import { AccountFrozenError, AccountNotFoundError, InsufficientBalanceError, InvalidAmountError } from "../domain/exceptions/FinancialError";
import { AccountRepository } from "../domain/repositories/Repositories";
import { TransferMoneyResponse, TransferMoneyResquest } from "./dto/TransferDTOs";

export class TransferMoneyUseCase {

  constructor(private readonly accountRepository: AccountRepository) { }

  async execute(input: TransferMoneyResquest): Promise<TransferMoneyResponse> {
    if (input.amount < 0) {
      throw new InvalidAmountError("El monto de la operacion debe ser mayor a cero.");
    }

    if (input.sourceAccountId === input.destinationAccountId) {
      throw new InvalidPropValueError("La cuenta origen y destino no pueden ser iguales");
    }

    // Validaciones cuenta origen
    const sourceAccount = await this.accountRepository.findById(input.sourceAccountId);
    if(!sourceAccount){
      throw new AccountNotFoundError(input.sourceAccountId);
    }

    if(sourceAccount.status === "FROZEN") {
      throw new AccountFrozenError(input.sourceAccountId);
    }

    if(sourceAccount.balance.lessThan(input.amount)) {
      throw new InsufficientBalanceError("La cuenta origen no tiene saldo suficiente");
    }

    // Validaciones cuenta destino
    const destinationAccount = await this.accountRepository.findById(input.destinationAccountId);
    if(!destinationAccount) {
      throw new AccountNotFoundError(input.destinationAccountId);
    }

    if(destinationAccount.status === "FROZEN") {
      throw new AccountFrozenError(input.destinationAccountId);
    }

    // Enviar la modificación a la base de datos
    const transaction = Transfer.create({
      amount: new Decimal(input.amount),
      status: "PENDING",
      sourceAccountId: input.sourceAccountId,
      destinationAccountId: input.destinationAccountId,
      createdAt: new Date(),
      description: `Transferencia de ${input.amount} desde la cuenta ${input.sourceAccountId} a la cuenta ${input.destinationAccountId}`
    });

    const saved = await this.accountRepository.executeTransaction(transaction);

    return {
      transactionId: saved.id,
      sourceAccountId: input.sourceAccountId,
      destinationAccountId: input.destinationAccountId,
      amount: saved.amount.toNumber(),
      executedAt: saved.createdAt
    };

  }
}