"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const DomainError_1 = require("../exceptions/DomainError");
;
class User {
    props;
    constructor(props) {
        this.props = props;
    }
    static create(props) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // cesar@email.com
        if (!emailRegex.test(props.email)) {
            throw new DomainError_1.InvalidPropValueError(`El formato del correo electrónico es inválido: ${props.email}`);
        }
        return new User(props);
    }
    // Getters
    get id() { return this.props.id ?? ''; } //user.id
    get email() { return this.props.email; }
    get passwordHash() { return this.props.passwordHash; }
    get fullName() { return this.props.fullName; }
    get createdAt() { return this.props.createdAt; }
}
exports.User = User;
