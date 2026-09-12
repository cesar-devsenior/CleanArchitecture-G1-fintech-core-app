"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTransactionHistoryUseCase = void 0;
const Transaction_1 = require("../domain/entities/Transaction");
class GetTransactionHistoryUseCase {
    transactionRepository;
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
    }
    async execute(input) {
        const transactions = await this.transactionRepository.findByAccountId(input.accountId);
        return {
            accountId: input.accountId,
            transactions: transactions.map((transaction) => {
                const type = transaction instanceof Transaction_1.Deposit
                    ? 'DEPOSIT'
                    : transaction instanceof Transaction_1.Withdrawal
                        ? 'WITHDRAWAL'
                        : transaction instanceof Transaction_1.Transfer
                            ? 'TRANSFER'
                            : 'TRANSFER';
                return {
                    id: transaction.id,
                    type,
                    amount: transaction.amount.toNumber(),
                    status: transaction.status,
                    description: transaction.description,
                    createdAt: transaction.createdAt,
                    sourceAccountId: transaction instanceof Transaction_1.Withdrawal || transaction instanceof Transaction_1.Transfer
                        ? transaction.sourceAccount
                        : undefined,
                    destinationAccountId: transaction instanceof Transaction_1.Deposit || transaction instanceof Transaction_1.Transfer
                        ? transaction.destinationAccount
                        : undefined,
                };
            }),
        };
    }
}
exports.GetTransactionHistoryUseCase = GetTransactionHistoryUseCase;
