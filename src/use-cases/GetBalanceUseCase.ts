import { AccountNotFoundError } from "../domain/exceptions/FinancialError";
import { AccountRepository } from "../domain/repositories/Repositories";
import { GetBalanceInputDTO, AccountOutputDTO } from "./dto/AccountDTOs";

export class GetBalanceUseCase {

  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(input: GetBalanceInputDTO): Promise<AccountOutputDTO> {
    const account = await this.accountRepository.findById(input.accountId);

    if(!account) {
      throw new AccountNotFoundError(input.accountId);
    }

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