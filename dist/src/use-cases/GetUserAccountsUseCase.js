"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserAccountsUseCase = void 0;
class GetUserAccountsUseCase {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(input) {
    }
}
exports.GetUserAccountsUseCase = GetUserAccountsUseCase;
