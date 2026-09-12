"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountMapper = void 0;
const decimal_js_1 = require("decimal.js");
const Account_1 = require("../../domain/entities/Account");
class AccountMapper {
    /**
     * Convierte un registro de infraestructura a una entidad de dominio puro
     */
    static toDomain(prismaAccount) {
        return Account_1.Account.create({
            id: prismaAccount.id,
            accountNumber: prismaAccount.accountNumber,
            balance: new decimal_js_1.Decimal(prismaAccount.balance),
            userId: prismaAccount.userId,
            status: prismaAccount.status,
            createdAt: prismaAccount.createdAt
        });
    }
    /**
     * Convierte una entidad de dominio a la estructura requerida por Prisma
     */
    static toPersistence(account) {
        return {
            id: account.id,
            accountNumber: account.accountNumber,
            balance: account.balance,
            userId: account.userId,
            status: account.status,
            createdAt: account.createdAt,
        };
    }
}
exports.AccountMapper = AccountMapper;
