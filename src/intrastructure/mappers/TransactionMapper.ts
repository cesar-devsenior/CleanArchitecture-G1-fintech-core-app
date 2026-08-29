import { Transaction, Deposit, Withdrawal, Transfer } from "../../domain/entities/Transaction";
import { Transaction as PrismaTransaction, Prisma, TransactionType } from "../../generated/prisma/client";

export class TransactionMapper {

  public static toDomain(prismaTransaction: PrismaTransaction): Transaction {
    const props = {
      id: prismaTransaction.id,
      ammount: prismaTransaction.amount,
      description: prismaTransaction.description ?? '',
      createdAt: prismaTransaction.createdAt,
      status: prismaTransaction.status
    };

    switch (prismaTransaction.type) {
      case TransactionType.DEPOSIT:
        if (!prismaTransaction.destinationAccountId) {
          throw new Error("Inconsistencia en la BD: Deposito necesita destinationAccountId");
        }
        return Deposit.create({ ...props, destinationAccountId: prismaTransaction.destinationAccountId! });

      case TransactionType.WITHDRAWAL:
        if (!prismaTransaction.sourceAccountId) {
          throw new Error("Inconsistencia en la BD: Retiro necesita sourceAccountId");
        }
        return Withdrawal.create({ ...props, sourceAccountId: prismaTransaction.sourceAccountId! });

      case TransactionType.TRANSFER:
        if (!prismaTransaction.sourceAccountId || !prismaTransaction.destinationAccountId) {
          throw new Error("Inconsistencia en la BD: Tasferencia necesita sourceAccountId y destinationAccountId");
        }
        return Transfer.create({
          ...props,
          sourceAccountId: prismaTransaction.sourceAccountId!,
          destinationAccountId: prismaTransaction.destinationAccountId!
        });

      default:
        throw new Error(`Tipo de transaccion desconocido o corrupto en DB: ${prismaTransaction.type}`);
    }
  }

  public static toPersistence(transaction: Transaction): Prisma.TransactionUncheckedCreateInput {
    let type: TransactionType;
    let sourceAccountId: string | null = null;
    let destinationAccountId: string | null = null;

    if (transaction instanceof Deposit) {
      type = TransactionType.DEPOSIT;
      destinationAccountId = transaction.destinationAccount;
    } else if (transaction instanceof Withdrawal) {
      type = TransactionType.WITHDRAWAL;
      sourceAccountId = transaction.sourceAccount;
    } else if (transaction instanceof Transfer) {
      type = TransactionType.TRANSFER;
      sourceAccountId = transaction.sourceAccount;
      destinationAccountId = transaction.destinationAccount;
    } else {
      throw new Error("Instancia de transaccion inválida");
    }


    return {
      id: transaction.id,
      amount: transaction.ammount,
      description: transaction.description,
      type,
      status: transaction.status,
      createdAt: transaction.createdAt,
      sourceAccountId,
      destinationAccountId
    };

  }

}
