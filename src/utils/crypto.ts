import crypto from 'node:crypto';

export function aesCtrEncrypt(key: string, nonce: string, plaintext: Buffer) {
  const cipher = crypto.createCipheriv('aes-128-ctr', Buffer.from(key, 'hex'), Buffer.from(nonce, 'hex'));
  let encrypted = cipher.update(plaintext);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted;
}

export function aesCtrDecrypt(key: string, nonce: string, ciphertext: Buffer) {
  const decipher = crypto.createDecipheriv('aes-128-ctr', Buffer.from(key, 'hex'), Buffer.from(nonce, 'hex'));
  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
}
