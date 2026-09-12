"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountController = void 0;
class AccountController {
    getUserAccountsUseCase;
    createAccountUseCase;
    constructor(getUserAccountsUseCase, createAccountUseCase) {
        this.getUserAccountsUseCase = getUserAccountsUseCase;
        this.createAccountUseCase = createAccountUseCase;
    }
    getUserAccounts = async (req, res, next) => {
        try {
            // Extrae el ID del usuario directamente desde la sesión autenticada en el token
            const userId = req.user.userId;
            const accounts = await this.getUserAccountsUseCase.execute({ userId });
            res.status(200).json({
                status: 'success',
                data: accounts,
            });
        }
        catch (error) {
            next(error);
        }
    };
    createAccount = async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const newAccount = await this.createAccountUseCase.execute({ userId });
            res.status(201).json({
                status: 'success',
                data: newAccount,
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AccountController = AccountController;
