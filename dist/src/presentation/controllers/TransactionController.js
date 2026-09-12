"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
class TransactionController {
    transferMoneyUseCase;
    getTransactionHistoryUseCase;
    constructor(transferMoneyUseCase, getTransactionHistoryUseCase) {
        this.transferMoneyUseCase = transferMoneyUseCase;
        this.getTransactionHistoryUseCase = getTransactionHistoryUseCase;
    }
    transfer = async (req, res, next) => {
        try {
            const result = await this.transferMoneyUseCase.execute(req.body);
            res.status(201).json({
                status: 'success',
                message: 'Transferencia ejecutada de forma satisfactoria',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getHistory = async (req, res, next) => {
        try {
            const { accountId } = req.params;
            const history = await this.getTransactionHistoryUseCase.execute(accountId);
            res.status(200).json({
                status: 'success',
                data: history,
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.TransactionController = TransactionController;
