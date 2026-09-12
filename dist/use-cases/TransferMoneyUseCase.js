"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferMoneyUseCase = void 0;
const DomainError_1 = require("../domain/exceptions/DomainError");
const FinancialError_1 = require("../domain/exceptions/FinancialError");
const decimal_js_1 = require("decimal.js");
const Transaction_1 = require("../domain/entities/Transaction");
class TransferMoneyUseCase {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(input) {
        const { sourceAccountId, destinationAccountId, amount } = input;
        // 1. Validaciones básicas de entrada
        if (amount <= 0) {
            throw new FinancialError_1.InvalidAmountError("El monto de la transferencia debe ser estrictamente mayor a cero.");
        }
        if (sourceAccountId === destinationAccountId) {
            throw new DomainError_1.InvalidPropValueError("La cuenta de origen y destino no pueden ser idénticas.");
        }
        const transferAmount = new decimal_js_1.Decimal(amount);
        // 2. Obtener la cuenta de origen para verificar estado e invariantes
        const sourceAccount = await this.accountRepository.findById(sourceAccountId);
        if (!sourceAccount) {
            throw new FinancialError_1.AccountNotFoundError(sourceAccountId);
        }
        // 3. Validar estado de la cuenta origen
        if (sourceAccount.status === "FROZEN") {
            throw new FinancialError_1.AccountFrozenError(sourceAccountId);
        }
        // 4. Validar invariante de saldo suficiente
        if (sourceAccount.balance.lessThan(transferAmount)) {
            throw new FinancialError_1.InsufficientBalanceError("La cuenta de origen no tiene saldo suficiente para realizar la transferencia.");
        }
        // 5. Validar existencia de la cuenta destino
        const destinationAccount = await this.accountRepository.findById(destinationAccountId);
        if (!destinationAccount) {
            throw new FinancialError_1.AccountNotFoundError(destinationAccountId);
        }
        // 6. Realizar los eventos con los métodos de la entidad de dominio (si es necesario)
        sourceAccount.withdraw(transferAmount);
        destinationAccount.deposit(transferAmount);
        // 7. Instanciar la Entidad de Dominio Transaction
        const transactionEntity = Transaction_1.Transfer.create({
            amount: transferAmount,
            status: "PENDING",
            sourceAccountId,
            destinationAccountId,
            createdAt: new Date(),
            description: `Transferencia de ${transferAmount.toNumber()} desde la cuenta ${sourceAccountId} a la cuenta ${destinationAccountId}.`
        });
        // 8. Delegar la ejecución al repositorio pasando la entidad de dominio
        const savedTransaction = await this.accountRepository.executeTransaction(transactionEntity);
        return {
            transactionId: savedTransaction.id,
            sourceAccountId,
            destinationAccountId,
            amount: savedTransaction.amount.toNumber(),
            executedAt: savedTransaction.createdAt
        };
    }
}
exports.TransferMoneyUseCase = TransferMoneyUseCase;
