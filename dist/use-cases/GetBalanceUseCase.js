"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBalanceUseCase = void 0;
const FinancialError_1 = require("../domain/exceptions/FinancialError");
class GetBalanceUseCase {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(input) {
        const account = await this.accountRepository.findById(input.accountId);
        if (!account) {
            throw new FinancialError_1.AccountNotFoundError(input.accountId);
        }
        return {
            id: account.id,
            accountNumber: account.accountNumber,
            balance: account.balance,
            status: account.status,
            userId: account.userId,
            createdAt: account.createdAt,
        };
    }
}
exports.GetBalanceUseCase = GetBalanceUseCase;
