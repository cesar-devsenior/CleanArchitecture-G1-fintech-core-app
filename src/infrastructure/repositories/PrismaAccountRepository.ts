import { PrismaClient } from '../../generated/prisma/client';
import { AccountRepository } from '../../domain/repositories/Repositories';
import { Account } from '../../domain/entities/Account';
import { AccountMapper } from '../mappers/AccountMapper';
import { Decimal } from 'decimal.js';
import { Deposit, Transaction, Transfer, Withdrawal } from '../../domain/entities/Transaction';
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

    return await this.prisma.$transaction(async (tx) => {
      // 1. Si existe cuenta de origen, debitar saldo (TRANSFER o WITHDRAWAL)
      if ((transaction instanceof Transfer || transaction instanceof Withdrawal)
          && transaction.sourceAccount) {
        await tx.account.update({
          where: { id: transaction.sourceAccount },
          data: { balance: { decrement: transaction.amount.toNumber() } },
        });
      }

      // 2. Si existe cuenta de destino, acreditar saldo (TRANSFER o DEPOSIT)
      if ((transaction instanceof Transfer || transaction instanceof Deposit)
          && transaction.destinationAccount) {
        await tx.account.update({
          where: { id: transaction.destinationAccount },
          data: { balance: { increment: transaction.amount.toNumber() } },
        });
      }

      // 3. Persistir el registro de la transacción
      const transactionRecord = await tx.transaction.create({
        data: TransactionMapper.toPersistence(transaction),
      });

      return TransactionMapper.toDomain(transactionRecord);
    });
  }

  async freeze(account: Account): Promise<void> {
    await this.prisma.account.update({
      where: { id: account.id },
      data: { status: 'FROZEN' },
    });
  }

  async unfreeze(account: Account): Promise<void> {
    await this.prisma.account.update({
      where: { id: account.id },
      data: { status: 'ACTIVE' },
    });
  }
}
