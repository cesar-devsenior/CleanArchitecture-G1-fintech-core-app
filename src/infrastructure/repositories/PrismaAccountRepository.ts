import { PrismaClient } from '../../generated/prisma/client';
import { AccountRepository } from '../../domain/repositories/Repositories';
import { Account } from '../../domain/entities/Account';
import { AccountMapper } from '../mappers/AccountMapper';
import { Transaction, Transfer } from '../../domain/entities/Transaction';
import { TransactionMapper } from '../mappers/TransactionMapper';

export class PrismaAccountRepository implements AccountRepository {
  constructor(private readonly prisma: PrismaClient) { }

  async save(account: Account): Promise<Account> {
    const data = AccountMapper.toPersistence(account);

    const prismaAccount = await this.prisma.account.upsert({
      where: { id: account.id },
      update: {
        balance: data.balance,
        status: data.status
      },
      create: data,
    });

    return AccountMapper.toDomain(prismaAccount);
  }

  async findById(id: string): Promise<Account | null> {
    const prismaAccount = await this.prisma.account.findUnique({
      where: { id }
    });

    if (!prismaAccount) return null;

    return AccountMapper.toDomain(prismaAccount);
  }

  async findByAccountNumber(accountNumber: string): Promise<Account | null> {
    const prismaAccount = await this.prisma.account.findUnique({
      where: { accountNumber }
    });

    if (!prismaAccount) return null;

    return AccountMapper.toDomain(prismaAccount);
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const prismaAccounts = await this.prisma.account.findMany({
      where: { userId }
    });

    return prismaAccounts.map(AccountMapper.toDomain);
  }

  async executeTransaction(transaction: Transaction): Promise<Transaction> {
    let result: Transaction;

    if (transaction instanceof Transfer) {
      result = await this.prisma.$transaction(async (tx) => {
        // 1. Retirar de cuenta origen
        await tx.account.update({
          where: { id: transaction.sourceAccount },
          data: { balance: { decrement: transaction.amount }}
        });

        // 2. Depositar a cuenta destino
        await tx.account.update({
          where: { id: transaction.destinationAccount },
          data: { balance: { increment: transaction.amount }}
        });

        // 3. Guardar en la tabla de transacciones
        const prismaTransaction = TransactionMapper.toPersistence(transaction);

        const saved = await tx.transaction.create({
          data: prismaTransaction
        });

        return TransactionMapper.toDomain(saved);
      });
    } else {
      throw new Error("Transacción no válida");
    }

    return result;
  }

}
