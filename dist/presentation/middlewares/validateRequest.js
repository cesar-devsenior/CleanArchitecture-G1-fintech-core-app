"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => async (req, res, next) => {
    console.log(req.body);
    try {
        // Reemplaza el cuerpo de la petición por el objeto sanitizado y tipado por Zod
        req.body = await schema.parseAsync(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            console.error('Error de validación:', error.issues);
            res.status(400).json({
                status: 'fail',
                code: 'VALIDATION_ERROR',
                message: 'Error de validación en los datos de entrada',
                errors: error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                })),
            });
            return;
        }
        next(error);
    }
};
exports.validateRequest = validateRequest;
