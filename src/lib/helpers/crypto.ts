function pemToArrayBuffer(pem: string) {
    const b64 = pem
        .replace(/-----BEGIN PUBLIC KEY-----/, '')
        .replace(/-----END PUBLIC KEY-----/, '')
        .replace(/\s+/g, '');
    const binary = atob(b64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        buffer[i] = binary.codePointAt(i)!;
    }
    return buffer.buffer;
}

async function importRsaPublicKey(pem: string) {
    const binaryDer = pemToArrayBuffer(pem);
    return await crypto.subtle.importKey(
        'spki',
        binaryDer,
        {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256',
        },
        true,
        ['verify'],
    );
}

async function verify(publicKey: CryptoKey, data: string, signature: BufferSource) {
    const enc = new TextEncoder();
    const dataBuffer = enc.encode(data);
    return await crypto.subtle.verify(
        {
            name: 'RSASSA-PKCS1-v1_5',
        },
        publicKey,
        signature,
        dataBuffer,
    );
}

export async function verifySignature(data: string, signature: string, publicKey: string) {
    const sig = atob(signature);
    const signatureBuffer = new Uint8Array(sig.length);
    for (let i = 0; i < sig.length; i++) {
        signatureBuffer[i] = sig.codePointAt(i)!;
    }

    const pubKeyPem = atob(publicKey);
    const pubKey = await importRsaPublicKey(pubKeyPem);

    const isValid = await verify(pubKey, data, signatureBuffer);

    return isValid;
}
