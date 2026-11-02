import { Transaction } from '../../domain/entities/Transaction';
import { TransactionRepository } from '../../domain/repositories/Repositories';
import { PrismaClient } from '../../generated/prisma/client';
import { TransactionMapper } from '../mappers/TransactionMapper';

export class PrismaTransactionRepository implements TransactionRepository {

  constructor(private readonly prisma: PrismaClient) { }

  async findById(id: string): Promise<Transaction | null> {
    const prismaTx = await this.prisma.transaction.findUnique({
      where: { id }
    });

    if (!prismaTx) return null;

    return TransactionMapper.toDomain(prismaTx);
  }

  async findByAccountId(accountId: string): Promise<Transaction[]> {
    const prismaTxs = await this.prisma.transaction.findMany({
      where: {
        OR: [
          { sourceAccountId: accountId },
          { destinationAccountId: accountId }
        ]
      }
    });

    if (!prismaTxs) return [];

    return prismaTxs.map(tx => TransactionMapper.toDomain(tx));
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const data = TransactionMapper.toPersistence(transaction);

    const saved = await this.prisma.transaction.create({ data });

    return TransactionMapper.toDomain(saved);
  }

}
