import { TransactionRepository } from "../domain/repositories/Repositories";
import { GetTransactionHistoryInputDTO, GetTransactionHistoryOutputDTO } from "./dto/TransactionHistoryDTOs";
import { Transaction, Deposit, Withdrawal, Transfer } from "../domain/entities/Transaction";

export class GetTransactionHistoryUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) { }

  async execute(input: GetTransactionHistoryInputDTO): Promise<GetTransactionHistoryOutputDTO> {
    const transactions = await this.transactionRepository.findByAccountId(input.accountId);

    return {
      accountId: input.accountId,
      transactions: transactions.map((transaction) => {
        const type = transaction instanceof Deposit
          ? 'DEPOSIT'
          : transaction instanceof Withdrawal
            ? 'WITHDRAWAL'
            : 'TRANSFER';

        return {
          id: transaction.id,
          type,
          amount: transaction.amount.toNumber(),
          status: transaction.status,
          description: transaction.description,
          createdAt: transaction.createdAt,
          sourceAccountId: transaction instanceof Withdrawal || transaction instanceof Transfer
            ? transaction.sourceAccount
            : undefined,
          destinationAccountId: transaction instanceof Deposit || transaction instanceof Transfer
            ? transaction.destinationAccount
            : undefined,
        };
      }),
    };
  }
}