import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// AES-256-GCM para campos de texto libre (notas). Formato: base64(iv | tag | ciphertext).
function key(): Buffer {
  const raw = process.env.NOTES_ENCRYPTION_KEY;
  if (!raw) throw new Error("Falta NOTES_ENCRYPTION_KEY");
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) throw new Error("NOTES_ENCRYPTION_KEY debe ser de 32 bytes en base64");
  return buf;
}

export function encryptText(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ct]).toString("base64");
}

export function decryptText(enc: string | null): string {
  if (!enc) return "";
  try {
    const buf = Buffer.from(enc, "base64");
    const decipher = createDecipheriv("aes-256-gcm", key(), buf.subarray(0, 12));
    decipher.setAuthTag(buf.subarray(12, 28));
    return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}
