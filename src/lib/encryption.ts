import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const secretKey = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY as string).digest(); // Hash to 32 bytes
const ivLength = 16; // Initialization vector length

// Encrypt function
export function encrypt(text: string): string {
    const iv = crypto.randomBytes(ivLength); // Generate a random IV
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}


// Decrypt function
// Decrypt function
export function decrypt(encrypted: string | null | undefined): string {
    if (!encrypted) return '';
    try {
        const [ivHex, encryptedText] = encrypted.split(':');
        if (!ivHex || !encryptedText) return '';
        
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Error decrypting:', error);
        return '';
    }
}
