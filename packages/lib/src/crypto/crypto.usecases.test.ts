import { describe, expect, test } from 'vitest';
import { combineEncryptionKeyShares, splitEncryptionKey } from './crypto.usecases';

describe('SSS encryption key operations', () => {
    describe('splitEncryptionKey', () => {
        test('splits an encryption key into the specified number of shares', () => {
            const { shares } = splitEncryptionKey({ encryptionKey: 'dGVzdC1rZXk', totalShares: 3, threshold: 2 });

            expect(shares).to.have.length(3);

            shares.forEach((share, i) => {
                expect(share.index).to.equal(i + 1);
                expect(share.data).to.be.a('string');
                expect(share.data.length).to.be.greaterThan(0);
            });
        });

        test('each share has a unique data value', () => {
            const { shares } = splitEncryptionKey({ encryptionKey: 'dGVzdC1rZXk', totalShares: 5, threshold: 3 });

            const dataValues = shares.map(s => s.data);
            const uniqueValues = new Set(dataValues);

            expect(uniqueValues.size).to.equal(5);
        });
    });

    describe('combineEncryptionKeyShares', () => {
        test('reconstructs the original encryption key from threshold shares', () => {
            const originalKey = 'dGVzdC1rZXk';
            const { shares } = splitEncryptionKey({ encryptionKey: originalKey, totalShares: 3, threshold: 2 });

            const { encryptionKey } = combineEncryptionKeyShares({ shares: [shares[0], shares[1]] });

            expect(encryptionKey).to.equal(originalKey);
        });

        test('reconstructs the original key from any combination of threshold shares', () => {
            const originalKey = 'c29tZS1sb25nZXIta2V5LXZhbHVl';
            const { shares } = splitEncryptionKey({ encryptionKey: originalKey, totalShares: 5, threshold: 3 });

            const combinations = [
                [shares[0], shares[1], shares[2]],
                [shares[0], shares[2], shares[4]],
                [shares[1], shares[3], shares[4]],
                [shares[2], shares[3], shares[4]],
            ];

            combinations.forEach((combo) => {
                const { encryptionKey } = combineEncryptionKeyShares({ shares: combo });
                expect(encryptionKey).to.equal(originalKey);
            });
        });

        test('reconstructs the key when all shares are provided', () => {
            const originalKey = 'YWxsLXNoYXJlcw';
            const { shares } = splitEncryptionKey({ encryptionKey: originalKey, totalShares: 4, threshold: 2 });

            const { encryptionKey } = combineEncryptionKeyShares({ shares });

            expect(encryptionKey).to.equal(originalKey);
        });
    });

    describe('split + combine round-trip', () => {
        test('round-trip with 2-of-3 scheme', () => {
            const originalKey = 'cm91bmQtdHJpcC0yLW9mLTM';
            const { shares } = splitEncryptionKey({ encryptionKey: originalKey, totalShares: 3, threshold: 2 });
            const { encryptionKey } = combineEncryptionKeyShares({ shares: [shares[0], shares[2]] });

            expect(encryptionKey).to.equal(originalKey);
        });

        test('round-trip with 3-of-5 scheme', () => {
            const originalKey = 'cm91bmQtdHJpcC0zLW9mLTU';
            const { shares } = splitEncryptionKey({ encryptionKey: originalKey, totalShares: 5, threshold: 3 });
            const { encryptionKey } = combineEncryptionKeyShares({ shares: [shares[1], shares[3], shares[4]] });

            expect(encryptionKey).to.equal(originalKey);
        });

        test('round-trip with minimum 2-of-2 scheme', () => {
            const originalKey = 'bWluaW1hbC1zY2hlbWU';
            const { shares } = splitEncryptionKey({ encryptionKey: originalKey, totalShares: 2, threshold: 2 });
            const { encryptionKey } = combineEncryptionKeyShares({ shares });

            expect(encryptionKey).to.equal(originalKey);
        });

        test('shares from one split are not interchangeable with shares from another split of the same key', () => {
            const originalKey = 'c2FtZS1rZXk';
            const { shares: firstSplit } = splitEncryptionKey({ encryptionKey: originalKey, totalShares: 3, threshold: 2 });
            const { shares: secondSplit } = splitEncryptionKey({ encryptionKey: originalKey, totalShares: 3, threshold: 2 });

            // Mixing shares from different splits should not produce the original key
            const { encryptionKey } = combineEncryptionKeyShares({ shares: [firstSplit[0], secondSplit[1]] });

            expect(encryptionKey).not.to.equal(originalKey);
        });
    });
});
