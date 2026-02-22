import { times } from 'lodash-es';
import { describe, expect, test } from 'vitest';
import { combineShares, splitSecret } from './shamir';

function createRandomBuffer({ length }: { length: number }): Uint8Array {
    const buffer = new Uint8Array(length);
    crypto.getRandomValues(buffer);
    return buffer;
}

describe('shamir secret sharing', () => {
    describe('splitSecret', () => {
        test('splits a 32-byte secret into the requested number of shares', () => {
            const secret = new Uint8Array(times(32, i => i));

            const { shares } = splitSecret({ secret, totalShares: 5, threshold: 3, createRandomBuffer });

            expect(shares).toHaveLength(5);
            shares.forEach((share, i) => {
                expect(share.index).toBe(i + 1);
                expect(share.data).toHaveLength(32);
            });
        });

        test('each share has unique data', () => {
            const secret = new Uint8Array(times(32, i => i));

            const { shares } = splitSecret({ secret, totalShares: 5, threshold: 3, createRandomBuffer });

            for (let i = 0; i < shares.length; i++) {
                for (let j = i + 1; j < shares.length; j++) {
                    expect(shares[i].data).not.toEqual(shares[j].data);
                }
            }
        });

        test('throws when secret is empty', () => {
            expect(() => splitSecret({ secret: new Uint8Array(0), totalShares: 3, threshold: 2, createRandomBuffer }))
                .toThrow('Secret must not be empty');
        });

        test('throws when threshold is less than 2', () => {
            expect(() => splitSecret({ secret: new Uint8Array([1]), totalShares: 3, threshold: 1, createRandomBuffer }))
                .toThrow('Threshold must be at least 2');
        });

        test('throws when totalShares is less than threshold', () => {
            expect(() => splitSecret({ secret: new Uint8Array([1]), totalShares: 2, threshold: 3, createRandomBuffer }))
                .toThrow('Total shares must be at least equal to threshold');
        });

        test('throws when totalShares exceeds 255', () => {
            expect(() => splitSecret({ secret: new Uint8Array([1]), totalShares: 256, threshold: 2, createRandomBuffer }))
                .toThrow('Total shares must not exceed 255');
        });
    });

    describe('combineShares', () => {
        test('throws when fewer than 2 shares are provided', () => {
            expect(() => combineShares({ shares: [{ index: 1, data: new Uint8Array([1]) }] }))
                .toThrow('At least 2 shares are required');
        });

        test('throws when shares have different data lengths', () => {
            expect(() => combineShares({
                shares: [
                    { index: 1, data: new Uint8Array([1, 2]) },
                    { index: 2, data: new Uint8Array([1]) },
                ],
            })).toThrow('All shares must have the same data length');
        });

        test('throws when share indices are duplicated', () => {
            expect(() => combineShares({
                shares: [
                    { index: 1, data: new Uint8Array([1]) },
                    { index: 1, data: new Uint8Array([2]) },
                ],
            })).toThrow('Share indices must be unique');
        });
    });

    describe('round-trip: split then combine', () => {
        test('recovers a single-byte secret with threshold=2, totalShares=2', () => {
            const secret = new Uint8Array([42]);

            const { shares } = splitSecret({ secret, totalShares: 2, threshold: 2, createRandomBuffer });
            const { secret: recovered } = combineShares({ shares });

            expect(recovered).toEqual(secret);
        });

        test('recovers a 32-byte secret (typical encryption key size)', () => {
            const secret = new Uint8Array(times(32, i => i * 7 + 3));

            const { shares } = splitSecret({ secret, totalShares: 5, threshold: 3, createRandomBuffer });
            const { secret: recovered } = combineShares({ shares });

            expect(recovered).toEqual(secret);
        });

        test('recovers with exactly the threshold number of shares (3 of 5)', () => {
            const secret = new Uint8Array(times(32, i => i));

            const { shares } = splitSecret({ secret, totalShares: 5, threshold: 3, createRandomBuffer });

            // Use shares 1, 3, 5 (any 3 of 5)
            const subset = [shares[0], shares[2], shares[4]];
            const { secret: recovered } = combineShares({ shares: subset });

            expect(recovered).toEqual(secret);
        });

        test('recovers with more than threshold shares', () => {
            const secret = new Uint8Array(times(32, i => i));

            const { shares } = splitSecret({ secret, totalShares: 5, threshold: 3, createRandomBuffer });

            // Use 4 of 5 shares
            const subset = [shares[0], shares[1], shares[3], shares[4]];
            const { secret: recovered } = combineShares({ shares: subset });

            expect(recovered).toEqual(secret);
        });

        test('any combination of K shares works', () => {
            const secret = new Uint8Array(times(16, i => i + 100));

            const { shares } = splitSecret({ secret, totalShares: 4, threshold: 3, createRandomBuffer });

            // All possible 3-of-4 combinations
            const combinations = [
                [shares[0], shares[1], shares[2]],
                [shares[0], shares[1], shares[3]],
                [shares[0], shares[2], shares[3]],
                [shares[1], shares[2], shares[3]],
            ];

            for (const combo of combinations) {
                const { secret: recovered } = combineShares({ shares: combo });
                expect(recovered).toEqual(secret);
            }
        });

        test('recovers when threshold equals totalShares (all shares required)', () => {
            const secret = new Uint8Array(times(32, i => i));

            const { shares } = splitSecret({ secret, totalShares: 3, threshold: 3, createRandomBuffer });
            const { secret: recovered } = combineShares({ shares });

            expect(recovered).toEqual(secret);
        });

        test('fewer than threshold shares produce incorrect result', () => {
            const secret = new Uint8Array(times(32, i => i));

            const { shares } = splitSecret({ secret, totalShares: 5, threshold: 3, createRandomBuffer });

            // Only 2 shares when threshold is 3
            const insufficient = [shares[0], shares[1]];
            const { secret: wrongResult } = combineShares({ shares: insufficient });

            expect(wrongResult).not.toEqual(secret);
        });

        test('recovers a random 32-byte secret (simulating a real encryption key)', () => {
            const secret = createRandomBuffer({ length: 32 });

            const { shares } = splitSecret({ secret, totalShares: 5, threshold: 3, createRandomBuffer });

            const subset = [shares[1], shares[3], shares[4]];
            const { secret: recovered } = combineShares({ shares: subset });

            expect(recovered).toEqual(secret);
        });
    });
});
