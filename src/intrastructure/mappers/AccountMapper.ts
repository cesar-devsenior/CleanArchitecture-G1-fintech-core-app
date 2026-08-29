import { Account } from "../../domain/entities/Account";
import { Account as PrismaAccount, Prisma } from "../../generated/prisma/client";

export class AccountMapper {
  public static toDomain(prismaAccount: PrismaAccount): Account {
    return Account.create({
      id: prismaAccount.id,
      accountNumber: prismaAccount.accountNumber,
      balance: prismaAccount.balance,
      userId: prismaAccount.userId,
      status: prismaAccount.status,
      createdAt: prismaAccount.createdAt
    });
  }

  public static toPersistence(domainAccount: Account) : Prisma.AccountUncheckedCreateInput {
    return {
      id: domainAccount.id,
      accountNumber: domainAccount.accountNumber,
      balance: domainAccount.balance,
      userId: domainAccount.userId,
      status: domainAccount.status,
      createdAt: domainAccount.createdAt
    };
  }
}