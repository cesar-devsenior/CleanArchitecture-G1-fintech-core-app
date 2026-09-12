"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalUseCase = void 0;
const FinancialError_1 = require("../domain/exceptions/FinancialError");
const decimal_js_1 = require("decimal.js");
class WithdrawalUseCase {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(input) {
        const { accountId, amount } = input;
        if (amount <= 0) {
            throw new FinancialError_1.InvalidAmountError("El monto a retirar debe ser un valor positivo.");
        }
        const withdrawalAmount = new decimal_js_1.Decimal(amount);
        const account = await this.accountRepository.findById(accountId);
        if (!account) {
            throw new FinancialError_1.AccountNotFoundError(accountId);
        }
        if (account.status === "FROZEN") {
            throw new FinancialError_1.AccountFrozenError(accountId);
        }
        if (account.balance.lessThan(withdrawalAmount)) {
            throw new FinancialError_1.InsufficientBalanceError(account.id);
        }
        account.withdraw(withdrawalAmount);
        const updatedAccount = await this.accountRepository.save(account);
        return {
            accountId: updatedAccount.id,
            newBalance: updatedAccount.balance.toNumber(),
            withdrawnAt: new Date(),
        };
    }
}
exports.WithdrawalUseCase = WithdrawalUseCase;
