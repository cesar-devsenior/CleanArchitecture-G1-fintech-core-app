"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositUseCase = void 0;
const FinancialError_1 = require("../domain/exceptions/FinancialError");
const decimal_js_1 = require("decimal.js");
class DepositUseCase {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(input) {
        const { accountId, amount } = input;
        if (amount <= 0) {
            throw new FinancialError_1.InvalidAmountError("El monto a depositar debe ser un valor positivo.");
        }
        const depositAmount = new decimal_js_1.Decimal(amount);
        const account = await this.accountRepository.findById(accountId);
        if (!account) {
            throw new FinancialError_1.AccountNotFoundError(accountId);
        }
        if (account.status === "FROZEN") {
            throw new FinancialError_1.AccountFrozenError(accountId);
        }
        account.deposit(depositAmount);
        const updatedAccount = await this.accountRepository.save(account);
        return {
            accountId: updatedAccount.id,
            newBalance: updatedAccount.balance.toNumber(),
            depositedAt: new Date(),
        };
    }
}
exports.DepositUseCase = DepositUseCase;
