import { EXP_TABLE, GF256_MAX_ELEMENT, LOG_TABLE, MAX_SHARES, MIN_THRESHOLD } from './shamir.constants';

export { combineShares, splitSecret };

function gfMultiply(a: number, b: number): number {
    if (a === 0 || b === 0) {
        return 0;
    }
    return EXP_TABLE[(LOG_TABLE[a] + LOG_TABLE[b]) % GF256_MAX_ELEMENT];
}

function gfInverse(a: number): number {
    if (a === 0) {
        throw new Error('Cannot invert zero in GF(256)');
    }
    return EXP_TABLE[GF256_MAX_ELEMENT - LOG_TABLE[a]];
}

function evaluatePolynomial(coefficients: Uint8Array, x: number): number {
    let result = 0;
    for (let i = coefficients.length - 1; i >= 0; i--) {
        result = gfMultiply(result, x) ^ coefficients[i];
    }
    return result;
}

/**
 * Splits a secret into N shares where any K (threshold) shares can reconstruct it.
 * Uses Shamir's Secret Sharing over GF(256).
 *
 * @param args - The arguments for splitting the secret
 * @param args.secret - The secret bytes to split
 * @param args.totalShares - Number of shares to generate (N), must be >= threshold and <= 255
 * @param args.threshold - Minimum shares needed to reconstruct (K), must be >= 2
 * @param args.createRandomBuffer - Platform-specific random byte generator (injected for DI)
 */
function splitSecret({ secret, totalShares, threshold, createRandomBuffer }: {
    secret: Uint8Array;
    totalShares: number;
    threshold: number;
    createRandomBuffer: (args: { length: number }) => Uint8Array;
}): { shares: Array<{ index: number; data: Uint8Array }> } {
    if (secret.length === 0) {
        throw new Error('Secret must not be empty');
    }
    if (threshold < MIN_THRESHOLD) {
        throw new Error('Threshold must be at least 2');
    }
    if (totalShares < threshold) {
        throw new Error('Total shares must be at least equal to threshold');
    }
    if (totalShares > MAX_SHARES) {
        throw new Error('Total shares must not exceed 255');
    }

    const shares: Array<{ index: number; data: Uint8Array }> = [];
    for (let i = 0; i < totalShares; i++) {
        shares.push({ index: i + 1, data: new Uint8Array(secret.length) });
    }

    for (let byteIndex = 0; byteIndex < secret.length; byteIndex++) {
        const coefficients = new Uint8Array(threshold);
        coefficients[0] = secret[byteIndex];

        const randomCoefficients = createRandomBuffer({ length: threshold - 1 });
        for (let j = 1; j < threshold; j++) {
            coefficients[j] = randomCoefficients[j - 1];
        }

        for (let i = 0; i < totalShares; i++) {
            shares[i].data[byteIndex] = evaluatePolynomial(coefficients, i + 1);
        }
    }

    return { shares };
}

/**
 * Reconstructs a secret from K or more shares using Lagrange interpolation over GF(256).
 *
 * @param args - The arguments for combining shares
 * @param args.shares - Array of shares, each with a unique index and data of equal length
 */
function combineShares({ shares }: {
    shares: Array<{ index: number; data: Uint8Array }>;
}): { secret: Uint8Array } {
    if (shares.length < MIN_THRESHOLD) {
        throw new Error('At least 2 shares are required');
    }

    const secretLength = shares[0].data.length;
    if (shares.some(s => s.data.length !== secretLength)) {
        throw new Error('All shares must have the same data length');
    }

    const indices = shares.map(s => s.index);
    const uniqueIndices = new Set(indices);
    if (uniqueIndices.size !== indices.length) {
        throw new Error('Share indices must be unique');
    }

    const secret = new Uint8Array(secretLength);

    for (let byteIndex = 0; byteIndex < secretLength; byteIndex++) {
        let value = 0;

        for (let i = 0; i < shares.length; i++) {
            const xi = shares[i].index;
            let lagrangeBasis = 1;

            for (let j = 0; j < shares.length; j++) {
                if (i === j) {
                    continue;
                }
                const xj = shares[j].index;
                lagrangeBasis = gfMultiply(lagrangeBasis, gfMultiply(xj, gfInverse(xj ^ xi)));
            }

            value ^= gfMultiply(shares[i].data[byteIndex], lagrangeBasis);
        }

        secret[byteIndex] = value;
    }

    return { secret };
}
