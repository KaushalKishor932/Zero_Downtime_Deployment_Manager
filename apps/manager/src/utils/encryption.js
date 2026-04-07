const crypto = require('crypto');
require('dotenv').config();

const algorithm = 'aes-256-cbc';
// Ensure the key is exactly 32 bytes long. If ENCRYPTION_KEY is missing, we use a fallback for demo purposes.
// IN PRODUCTION: Always set ENCRYPTION_KEY in your manager/.env!
const secretKey = process.env.ENCRYPTION_KEY 
    ? crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32) 
    : crypto.scryptSync('zero-down-fallback-safe-key-replace-me', 'salt', 32);

const iv = crypto.randomBytes(16);

exports.encrypt = (text) => {
    if (!text) return text; // Return empty string if nothing to encrypt
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

exports.decrypt = (hash) => {
    if (!hash || !hash.includes(':')) return hash; // If it's empty or not encrypted (plain text fallback)
    const [ivHex, encryptedText] = hash.split(':');
    const ivBuffer = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, secretKey, ivBuffer);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};