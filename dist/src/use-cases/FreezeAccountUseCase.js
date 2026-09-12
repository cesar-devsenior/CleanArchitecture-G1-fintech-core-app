"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreezeAccountUseCase = void 0;
const FinancialError_1 = require("../domain/exceptions/FinancialError");
class FreezeAccountUseCase {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(accountId) {
        const account = await this.accountRepository.findById(accountId);
        if (!account) {
            throw new FinancialError_1.AccountNotFoundError(accountId);
        }
        if (account.status === "FROZEN") {
            throw new FinancialError_1.AccountFrozenError(accountId);
        }
        account.freeze();
        await this.accountRepository.freeze(account);
    }
}
exports.FreezeAccountUseCase = FreezeAccountUseCase;
