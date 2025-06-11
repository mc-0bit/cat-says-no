import crypto from 'node:crypto';
import fs from 'fs-extra';
import 'dotenv/config';

async function addKeysToEnv(privateKey: string, publicKey: string) {
    if (!fs.existsSync('.env')) {
        await fs.writeFile('.env', `PRIVATE_KEY=${privateKey}\nPUBLIC_KEY=${publicKey}`);
    } else if (!process.env.PRIVATE_KEY || !process.env.PUBLIC_KEY) {
        await fs.appendFile('.env', `\nPRIVATE_KEY=${privateKey}\nPUBLIC_KEY=${publicKey}`);
    } else if (process.env.PRIVATE_KEY !== privateKey || process.env.PUBLIC_KEY !== publicKey) {
        const env = await fs.readFile('.env', 'utf8');
        const newEnv = env.replace('PRIVATE_KEY=.*', `PRIVATE_KEY=${privateKey}`).replace('PUBLIC_KEY=.*', `PUBLIC_KEY=${publicKey}`);
        await fs.writeFile('.env', newEnv);
    }
}

fs.ensureDirSync('.tmp');

const keypair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
});
const privateKey = keypair.privateKey.export({ type: 'pkcs8', format: 'pem' });
const publicKey = keypair.publicKey.export({ type: 'spki', format: 'pem' });

fs.writeFileSync(`.tmp/privateKey.pem`, Buffer.from(privateKey).toString('base64'), 'utf8');
fs.writeFileSync(`.tmp/publicKey.pem`, Buffer.from(publicKey).toString('base64'), 'utf8');

await addKeysToEnv(Buffer.from(privateKey).toString('base64'), Buffer.from(publicKey).toString('base64'));
