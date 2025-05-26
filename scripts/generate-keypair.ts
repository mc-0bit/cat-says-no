import crypto from 'node:crypto';
import fs from 'fs-extra';

fs.ensureDirSync('.tmp');

const keypair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
});
const privateKey = keypair.privateKey.export({ type: 'pkcs8', format: 'pem' });
const publicKey = keypair.publicKey.export({ type: 'spki', format: 'pem' });

fs.writeFileSync(`.tmp/privateKey.pem`, Buffer.from(privateKey).toString('base64'), 'utf8');
fs.writeFileSync(`.tmp/publicKey.pem`, Buffer.from(publicKey).toString('base64'), 'utf8');
