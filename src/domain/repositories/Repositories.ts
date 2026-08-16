import { Account } from "../entities/Account";
import { Transaction } from "../entities/Transaction";
import { User } from "../entities/User";

export interface UserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export interface AccountRepository {
  findById(id: string): Promise<Account | null>;
  findByAccountNumber(accountNumber: string): Promise<Account | null>;
  findByUserId(userId: string): Promise<Account[]>;
  save(account: Account): Promise<Account>;
}

export interface TransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByAccountId(accountId: string): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<Transaction>;
}
