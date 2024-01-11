import argon2 from 'argon2';

export async function hashPassword(password: string): Promise<string> {
    try {
        return await argon2.hash(password);
    } catch (err) {
        console.error(err);
    }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
        if (await argon2.verify(hash, password)) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error(err);
    }
}
