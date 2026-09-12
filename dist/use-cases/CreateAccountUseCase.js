"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAccountUseCase = void 0;
const decimal_js_1 = require("decimal.js");
const Account_1 = require("../domain/entities/Account");
const FinancialError_1 = require("../domain/exceptions/FinancialError");
class CreateAccountUseCase {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(input) {
        const initialAmount = input.initialBalance?.toNumber() ?? 0;
        if (initialAmount < 0) {
            throw new FinancialError_1.InvalidAmountError("El monto de la operación debe ser un valor estricto mayor a cero.");
        }
        const accountNumber = `ACC-${Math.floor(100000000 + Math.random() * 900000000)}`;
        const newAccount = Account_1.Account.create({
            id: crypto.randomUUID(),
            accountNumber,
            balance: new decimal_js_1.Decimal(initialAmount),
            userId: input.userId,
            status: "ACTIVE",
            createdAt: new Date()
        });
        const savedAccount = await this.accountRepository.save(newAccount);
        return {
            id: savedAccount.id,
            accountNumber: savedAccount.accountNumber,
            balance: new decimal_js_1.Decimal(savedAccount.balance),
            status: savedAccount.status,
            userId: savedAccount.userId,
            createdAt: savedAccount.createdAt,
        };
    }
}
exports.CreateAccountUseCase = CreateAccountUseCase;
