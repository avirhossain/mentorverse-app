// A simple, dependency-free library for generating a JWT for JaaS.
import { sha256 } from 'js-sha256';

// Re-creation of the btoa function, which is not available in Node.js server environments.
const btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');

// URL-safe Base64 encoding
const base64url = (str: string) => {
    return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};

const sign = (input: string, key: string) => {
    const hmac = sha256.hmac.create(key);
    hmac.update(input);
    return hmac.digest('binary');
}

/**
 * Creates a JSON Web Token (JWT) for use with Jitsi as a Service (JaaS).
 * @param {object} payload - The payload for the JWT.
 * @param {string} secret - The secret key for signing the JWT.
 * @param {object} options - Additional options.
 * @param {string} options.kid - The key ID, which includes the vpaas-magic-cookie and your app ID.
 * @param {number} [options.expiresIn=7200] - The expiration time in seconds. Defaults to 2 hours.
 * @returns {string} The generated JWT.
 */
export const createJitsiJwt = (payload: object, secret: string, options: { kid: string, expiresIn?: number }): string => {
    const { kid, expiresIn = 7200 } = options;

    const header = {
        alg: 'HS256',
        typ: 'JWT',
        kid: kid
    };

    const now = Math.floor(Date.now() / 1000);

    const fullPayload = {
        ...payload,
        nbf: now - 5, // Not before, 5 seconds tolerance
        iat: now,
        exp: now + expiresIn,
    };

    const headerAndPayload = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(fullPayload))}`;

    const signature = sign(headerAndPayload, secret);
    const signed = `${headerAndPayload}.${base64url(signature)}`;

    return signed;
};

    