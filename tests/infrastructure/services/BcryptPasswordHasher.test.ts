import { describe, it, expect } from "vitest";
import { BcryptPasswordHasher } from "../../../src/infrastructure/services/BcryptPasswordHasher";

describe("BcryptPasswordHasher", () => {
  it("debería hashear y comparar contraseñas correctamente", async () => {
    const hasher = new BcryptPasswordHasher(1);

    const hash = await hasher.hash("123456");

    expect(hash).not.toBe("123456");
    expect(await hasher.compare("123456", hash)).toBe(true);
    expect(await hasher.compare("incorrect", hash)).toBe(false);
  });
});
