import { PrismaClient } from '../../generated/prisma/client';
import { AccountRepository } from '../../domain/repositories/Repositories';
import { Account } from '../../domain/entities/Account';
import { AccountMapper } from '../mappers/AccountMapper';

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

}
