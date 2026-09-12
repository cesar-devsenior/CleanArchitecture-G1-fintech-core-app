"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../generated/prisma/client");
// Adapters de Infraestructura
const BcryptPasswordHasher_1 = require("../infrastructure/services/BcryptPasswordHasher");
const JwtTokenService_1 = require("../infrastructure/services/JwtTokenService");
const PrismaUserRepository_1 = require("../infrastructure/repositories/PrismaUserRepository");
const PrismaAccountRepository_1 = require("../infrastructure/repositories/PrismaAccountRepository");
const PrismaTransactionRepository_1 = require("../infrastructure/repositories/PrismaTransactionRepository");
// Casos de Uso
const RegisterUserUseCase_1 = require("../use-cases/RegisterUserUseCase");
const LoginUseCase_1 = require("../use-cases/LoginUseCase");
const CreateAccountUseCase_1 = require("../use-cases/CreateAccountUseCase");
const GetUserAccountsUseCase_1 = require("../use-cases/GetUserAccountsUseCase");
const GetBalanceUseCase_1 = require("../use-cases/GetBalanceUseCase");
const FreezeAccountUseCase_1 = require("../use-cases/FreezeAccountUseCase");
const UnfreezeAccountUseCase_1 = require("../use-cases/UnfreezeAccountUseCase");
const TransferMoneyUseCase_1 = require("../use-cases/TransferMoneyUseCase");
const DepositUseCase_1 = require("../use-cases/DepositUseCase");
const WithdrawalUseCase_1 = require("../use-cases/WithdrawalUseCase");
const GetTransactionHistoryUseCase_1 = require("../use-cases/GetTransactionHistoryUseCase");
// Controllers & Middlewares
const AuthController_1 = require("./controllers/AuthController");
const AccountController_1 = require("./controllers/AccountController");
const TransactionController_1 = require("./controllers/TransactionController");
const AuthMiddleware_1 = require("./middlewares/AuthMiddleware");
const validateRequest_1 = require("./middlewares/validateRequest");
const ErrorHandler_1 = require("./middlewares/ErrorHandler");
// DTO Schemas
const AuthDTOs_1 = require("./dtos/AuthDTOs");
const TransactionDTOs_1 = require("./dtos/TransactionDTOs");
function createApp() {
    const app = (0, express_1.default)();
    // Middlewares globales de Express
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // 1. Instanciación de Infraestructura y Clientes de Persistencia
    const prisma = new client_1.PrismaClient({
        adapter: new adapter_pg_1.PrismaPg({
            connectionString: process.env.DATABASE_URL,
        }),
    });
    const passwordHasher = new BcryptPasswordHasher_1.BcryptPasswordHasher(10);
    const tokenService = new JwtTokenService_1.JwtTokenService();
    const userRepository = new PrismaUserRepository_1.PrismaUserRepository(prisma);
    const accountRepository = new PrismaAccountRepository_1.PrismaAccountRepository(prisma);
    const transactionRepository = new PrismaTransactionRepository_1.PrismaTransactionRepository(prisma);
    // 2. Instanciación de Casos de Uso (Capa de Aplicación)
    const registerUserUseCase = new RegisterUserUseCase_1.RegisterUserUseCase(userRepository, passwordHasher);
    const loginUseCase = new LoginUseCase_1.LoginUseCase(userRepository, tokenService, passwordHasher);
    const createAccountUseCase = new CreateAccountUseCase_1.CreateAccountUseCase(accountRepository);
    const getUserAccountsUseCase = new GetUserAccountsUseCase_1.GetUserAccountsUseCase(accountRepository);
    const getBalanceUseCase = new GetBalanceUseCase_1.GetBalanceUseCase(accountRepository);
    const freezeAccountUseCase = new FreezeAccountUseCase_1.FreezeAccountUseCase(accountRepository);
    const unfreezeAccountUseCase = new UnfreezeAccountUseCase_1.UnfreezeAccountUseCase(accountRepository);
    const transferMoneyUseCase = new TransferMoneyUseCase_1.TransferMoneyUseCase(accountRepository);
    const depositUseCase = new DepositUseCase_1.DepositUseCase(accountRepository);
    const withdrawalUseCase = new WithdrawalUseCase_1.WithdrawalUseCase(accountRepository);
    const getTransactionHistoryUseCase = new GetTransactionHistoryUseCase_1.GetTransactionHistoryUseCase(transactionRepository);
    // 3. Instanciación de Controladores y Guardias HTTP (Capa de Presentación)
    const authController = new AuthController_1.AuthController(registerUserUseCase, loginUseCase);
    const accountController = new AccountController_1.AccountController(getUserAccountsUseCase, createAccountUseCase, getBalanceUseCase, freezeAccountUseCase, unfreezeAccountUseCase);
    const transactionController = new TransactionController_1.TransactionController(transferMoneyUseCase, depositUseCase, withdrawalUseCase, getTransactionHistoryUseCase);
    const authMiddleware = new AuthMiddleware_1.AuthMiddleware(tokenService);
    // 4. Definición y Enrutamiento de la API REST
    // --- Rutas Públicas (Autenticación) ---
    app.post('/api/auth/register', (0, validateRequest_1.validateRequest)(AuthDTOs_1.RegisterUserSchema), authController.register);
    app.post('/api/auth/login', (0, validateRequest_1.validateRequest)(AuthDTOs_1.LoginSchema), authController.login);
    // --- Rutas Protegidas (Cuentas) ---
    app.get('/api/accounts', authMiddleware.handle, accountController.getUserAccounts);
    app.post('/api/accounts', authMiddleware.handle, accountController.createAccount);
    app.get('/api/accounts/:accountId/balance', authMiddleware.handle, accountController.getBalance);
    app.patch('/api/accounts/:accountId/freeze', authMiddleware.handle, accountController.freezeAccount);
    app.patch('/api/accounts/:accountId/unfreeze', authMiddleware.handle, accountController.unfreezeAccount);
    // --- Rutas Protegidas (Transacciones) ---
    app.post('/api/transactions/transfer', authMiddleware.handle, (0, validateRequest_1.validateRequest)(TransactionDTOs_1.TransferMoneySchema), transactionController.transfer);
    app.post('/api/transactions/deposit', authMiddleware.handle, (0, validateRequest_1.validateRequest)(TransactionDTOs_1.DepositMoneySchema), transactionController.deposit);
    app.post('/api/transactions/withdrawal', authMiddleware.handle, (0, validateRequest_1.validateRequest)(TransactionDTOs_1.WithdrawalMoneySchema), transactionController.withdrawal);
    app.get('/api/transactions/history/:accountId', authMiddleware.handle, transactionController.getHistory);
    // 5. Middleware Global de Manejo de Errores (Obligatoriamente al final)
    app.use(ErrorHandler_1.errorHandler);
    return app;
}
