import { DomainError } from "./DomainError";

export class InsufficientBalanceError extends DomainError {
  constructor(accountId: string) {
    super(`Operacion denegada: Saldo insuficiente en la cuenta con ID: ${accountId}`);
  }
}