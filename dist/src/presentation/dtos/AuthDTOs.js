"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.RegisterUserSchema = void 0;
const zod_1 = require("zod");
/**
 * Esquema de validación para el registro de un nuevo usuario en la API.
 */
exports.RegisterUserSchema = zod_1.z.object({
    name: zod_1.z
        .string({ error: 'El nombre completo es requerido' })
        .min(3, 'El nombre completo debe tener al menos 3 caracteres')
        .max(100, 'El nombre completo no puede exceder 100 caracteres'),
    email: zod_1.z
        .string({ error: 'El correo electrónico es requerido' })
        .email('Formato de correo electrónico inválido'),
    password: zod_1.z
        .string({ error: 'La contraseña es requerida' })
        .min(8, 'La contraseña debe tener mínimo 8 caracteres')
        .regex(/[A-Z]/, 'La contraseña debe incluir al menos una letra mayúscula')
        .regex(/[0-9]/, 'La contraseña debe incluir al menos un número'),
});
/**
 * Esquema de validación para el inicio de sesión.
 */
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z
        .string({ error: 'El correo electrónico es requerido' })
        .email('Formato de correo electrónico inválido'),
    password: zod_1.z
        .string({ error: 'La contraseña es requerida' })
        .min(1, 'La contraseña no puede estar vacía'),
});
