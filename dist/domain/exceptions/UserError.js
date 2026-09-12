"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidCredentialsError = exports.UserAlreadyExistsError = void 0;
const DomainError_1 = require("./DomainError");
class UserAlreadyExistsError extends DomainError_1.DomainError {
    constructor(accountId) {
        super(`Operacion denegada: Saldo insuficiente en la cuenta con ID: ${accountId}`);
    }
}
exports.UserAlreadyExistsError = UserAlreadyExistsError;
class InvalidCredentialsError extends DomainError_1.DomainError {
    constructor(accountId) {
        super(`Operacion denegada: Saldo insuficiente en la cuenta con ID: ${accountId}`);
    }
}
exports.InvalidCredentialsError = InvalidCredentialsError;
