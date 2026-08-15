import { Decimal } from "decimal.js";
import { InvalidPropValueError } from "../exceptions/DomainError";

export interface TransactionProps {
  id: string;
  ammount: Decimal;
  status: TransactionStatus;
  description: string;
  createdAt: Date;
}

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

export abstract class Transaction {
  private readonly props: TransactionProps;

  protected constructor(props: TransactionProps) {
    this.props = props;
  }

  public static validateAmmount(props: TransactionProps, errorMessage: string): void {
    if (props.ammount.lte(0)) {
      throw new InvalidPropValueError(errorMessage);
    }
  }

  // Getters
  get id(): string { return this.props.id; }
  get ammount(): Decimal { return this.props.ammount; }
  get status(): TransactionStatus { return this.props.status; }
  get description(): string { return this.props.description; }
  get createdAt(): Date { return this.props.createdAt; }
}

export interface DepositProps extends TransactionProps {
  destinationAccountId: string;
}

export class Deposit extends Transaction {
  private readonly destinationAccountId: string;

  private constructor(props: DepositProps) {
    super(props);
    this.destinationAccountId = props.destinationAccountId;
  }

  public static create(props: DepositProps): Deposit {
    Transaction.validateAmmount(props, "El monto del depósito debe ser mayor que cero.");
    return new Deposit(props);
  }

  // getter
  get destinationAccount(): string { return this.destinationAccountId; } // deposit1.destinationAccount
}

export interface WithdrawalProps extends TransactionProps {
  sourceAccountId: string;
}

export class Withdrawal extends Transaction {
  private readonly sourceAccountId: string;

  private constructor(props: WithdrawalProps) {
    super(props);
    this.sourceAccountId = props.sourceAccountId;
  }

  public static create(props: WithdrawalProps): Withdrawal {
    Transaction.validateAmmount(props, "El monto del retiro debe ser mayor que cero.");
    return new Withdrawal(props);
  }

  // getter
  get sourceAccount(): string { return this.sourceAccountId; }
}

export interface TransferProps extends TransactionProps {
  sourceAccountId: string;
  destinationAccountId: string;
}

export class Transfer extends Transaction {
  private readonly sourceAccountId: string;
  private readonly destinationAccountId: string;

  private constructor(props: TransferProps) {
    super(props);
    this.sourceAccountId = props.sourceAccountId;
    this.destinationAccountId = props.destinationAccountId;
  }

  public static create(props: TransferProps): Transfer {
    if (props.sourceAccountId === props.destinationAccountId) {
      throw new InvalidPropValueError("La cuenta de origen y destino no pueden ser la misma.");
    }
    
    Transaction.validateAmmount(props, "El monto de la transferencia debe ser mayor que cero.");
    
    return new Transfer(props);
  }
}