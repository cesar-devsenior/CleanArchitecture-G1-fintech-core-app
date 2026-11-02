export interface TransferMoneyResquest {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
}

export interface TransferMoneyResponse {
  transactionId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  executedAt: Date;
}