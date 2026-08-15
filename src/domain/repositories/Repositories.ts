import { Transaction } from "../entities/Transaction";
import { User } from "../entities/User";

export interface UserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export interface AccountRepository {
  // TODO: Define methods for account repository
}

export interface TransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByAccountId(accountId: string): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<Transaction>;
}
