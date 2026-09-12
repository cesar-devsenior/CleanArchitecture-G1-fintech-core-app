"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnfreezeAccountUseCase = void 0;
const DomainError_1 = require("../domain/exceptions/DomainError");
const FinancialError_1 = require("../domain/exceptions/FinancialError");
class UnfreezeAccountUseCase {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(accountId) {
        const account = await this.accountRepository.findById(accountId);
        if (!account) {
            throw new FinancialError_1.AccountNotFoundError(accountId);
        }
        if (account.status === "ACTIVE") {
            throw new DomainError_1.InvalidPropValueError(`La cuenta con ID '${accountId}' ya está activa y no requiere ser descongelada.`);
        }
        account.unfreeze();
        await this.accountRepository.unfreeze(account);
    }
}
exports.UnfreezeAccountUseCase = UnfreezeAccountUseCase;
