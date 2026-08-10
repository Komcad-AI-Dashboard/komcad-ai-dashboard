// NFR-04: enkripsi at-rest untuk field sensitif (NIK). AES-256-GCM (IV acak per baris, autentikasi
// bawaan) untuk nilai yang perlu didekripsi lagi buat ditampilkan; HMAC-SHA256 (deterministik) untuk
// nilai yang cuma perlu dicek kesamaannya (cek NIK duplikat) tanpa pernah didekripsi.

import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "crypto";

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error("ENCRYPTION_KEY belum diset di environment.");
  const key = Buffer.from(raw, "hex");
  if (key.length !== 32) {
    throw new Error("ENCRYPTION_KEY harus 32 byte (64 karakter hex).");
  }
  return key;
}

/** Enkripsi nilai sensitif untuk disimpan di DB. Format tersimpan: base64(iv):base64(authTag):base64(ciphertext). */
export function encryptSensitive(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${ciphertext.toString("base64")}`;
}

/** Dekripsi nilai yang ditulis oleh encryptSensitive(). */
export function decryptSensitive(stored: string): string {
  const [ivB64, tagB64, dataB64] = stored.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Format nilai terenkripsi tidak valid.");
  }
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const plain = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]);
  return plain.toString("utf8");
}

/** Hash deterministik (HMAC-SHA256, keyed dengan ENCRYPTION_KEY) — dipakai untuk kolom @unique/lookup
 * (mis. `Anggota.nikHash`) tanpa pernah menyimpan atau membandingkan nilai plaintext di DB. */
export function hashSensitive(plain: string): string {
  return createHmac("sha256", getKey()).update(plain).digest("hex");
}
