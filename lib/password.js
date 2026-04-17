import crypto from 'crypto';

export function verifyPassword(password, storedValue) {
  const [algorithm, salt, storedHash] = storedValue.split('$');

  if (algorithm !== 'scrypt' || !salt || !storedHash) {
    return false;
  }

  const hash = crypto.scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (hash.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(hash, storedBuffer);
}