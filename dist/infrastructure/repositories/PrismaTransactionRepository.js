"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTransactionRepository = void 0;
const TransactionMapper_1 = require("../mappers/TransactionMapper");
class PrismaTransactionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const prismaTx = await this.prisma.transaction.findUnique({
            where: { id }
        });
        if (!prismaTx)
            return null;
        return TransactionMapper_1.TransactionMapper.toDomain(prismaTx);
    }
    async findByAccountId(accountId) {
        const prismaTxs = await this.prisma.transaction.findMany({
            where: {
                OR: [
                    { sourceAccountId: accountId },
                    { destinationAccountId: accountId }
                ]
            }
        });
        if (!prismaTxs)
            return [];
        return prismaTxs.map(tx => TransactionMapper_1.TransactionMapper.toDomain(tx));
    }
    async save(transaction) {
        const data = TransactionMapper_1.TransactionMapper.toPersistence(transaction);
        const saved = await this.prisma.transaction.create({ data });
        return TransactionMapper_1.TransactionMapper.toDomain(saved);
    }
}
exports.PrismaTransactionRepository = PrismaTransactionRepository;
