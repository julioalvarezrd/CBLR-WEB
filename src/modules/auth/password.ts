import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

import { ValidationError } from "@/modules/auth/errors";
import { validatePassword } from "@/modules/auth/validations";

const KEY_LENGTH = 64;

function deriveKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  validatePassword(password);

  const salt = randomBytes(16).toString("base64url");
  const derivedKey = await deriveKey(password, salt);

  return `scrypt$${salt}$${derivedKey.toString("base64url")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [algorithm, salt, encodedHash] = storedHash.split("$");

  if (algorithm !== "scrypt" || !salt || !encodedHash) {
    throw new ValidationError("El formato de contraseña almacenado no es válido.");
  }

  const expected = Buffer.from(encodedHash, "base64url");
  const actual = await deriveKey(password, salt);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
