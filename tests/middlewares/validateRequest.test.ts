import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { validateRequest } from "../../src/presentation/middlewares/validateRequest";

describe("validateRequest", () => {
  it("debería sanitizar el body y llamar a next cuando la validación pasa", async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().min(18),
    });

    const req = {
      body: { name: "Ana", age: 25 },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    await validateRequest(schema)(req, res, next);

    expect(req.body).toEqual({ name: "Ana", age: 25 });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("debería responder 400 con errores de validación cuando los datos son inválidos", async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().min(18),
    });

    const req = {
      body: { name: "Ana", age: 10 },
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    await validateRequest(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: "fail",
      code: "VALIDATION_ERROR",
      message: "Error de validación en los datos de entrada",
      errors: [
        {
          field: "age",
          message: "Too small: expected number to be >=18",
        },
      ],
    });
    expect(next).not.toHaveBeenCalled();
  });
});
