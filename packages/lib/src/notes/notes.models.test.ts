import { describe, expect, test } from 'vitest';
import { createNoteUrl, createNoteUrlHashFragment, createShareNoteUrls, createShareUrlHashFragment, isShareHashFragment, parseNoteUrl, parseNoteUrlHashFragment, parseShareUrlHashFragment } from './notes.models';

describe('note models', () => {
    describe('createNoteUrl', () => {
        test('a sharable note url contains the note id as path and the encryption key as hash', () => {
            expect(
                createNoteUrl({ noteId: '123', encryptionKey: 'abc', clientBaseUrl: 'https://example.com' }),
            ).to.eql({
                noteUrl: 'https://example.com/123#abc',
            });
        });

        test('a note protected with a password is indicated in the hash fragment', () => {
            expect(
                createNoteUrl({ noteId: '123', encryptionKey: 'abc', clientBaseUrl: 'https://example.com', isPasswordProtected: true }),
            ).to.eql({
                noteUrl: 'https://example.com/123#pw:abc',
            });
        });

        test('trailing slash in the base url is handled', () => {
            expect(
                createNoteUrl({ noteId: '123', encryptionKey: 'abc', clientBaseUrl: 'https://example.com/' }),
            ).to.eql({
                noteUrl: 'https://example.com/123#abc',
            });
        });

        test('a note url can be prefixed with a path', () => {
            expect(
                createNoteUrl({ noteId: '123', encryptionKey: 'abc', clientBaseUrl: 'https://example.com/', pathPrefix: 'notes' }),
            ).to.eql({
                noteUrl: 'https://example.com/notes/123#abc',
            });

            expect(
                createNoteUrl({ noteId: '123', encryptionKey: 'abc', clientBaseUrl: 'https://example.com/', pathPrefix: 'notes/view' }),
            ).to.eql({
                noteUrl: 'https://example.com/notes/view/123#abc',
            });

            expect(
                createNoteUrl({ noteId: '123', encryptionKey: 'abc', clientBaseUrl: 'https://example.com/discarded', pathPrefix: 'notes/view' }),
            ).to.eql({
                noteUrl: 'https://example.com/notes/view/123#abc',
            });
        });
    });

    describe('parseNoteUrl', () => {
        test('retrieves the note id and encryption key from a sharable note url', () => {
            expect(
                parseNoteUrl({ noteUrl: 'https://example.com/123#abc' }),
            ).to.eql({
                noteId: '123',
                encryptionKey: 'abc',
                isPasswordProtected: false,
                isDeletedAfterReading: false,
            });
        });

        test('a note protected with a password is indicated in the hash fragment', () => {
            expect(
                parseNoteUrl({ noteUrl: 'https://example.com/123#pw:abc' }),
            ).to.eql({
                noteId: '123',
                encryptionKey: 'abc',
                isPasswordProtected: true,
                isDeletedAfterReading: false,
            });
        });

        test('a note that is deleted after reading is indicated in the hash fragment', () => {
            expect(
                parseNoteUrl({ noteUrl: 'https://example.com/123#dar:abc' }),
            ).to.eql({
                noteId: '123',
                encryptionKey: 'abc',
                isPasswordProtected: false,
                isDeletedAfterReading: true,
            });
        });

        test('a note that is both password protected and deleted after reading is indicated in the hash fragment', () => {
            expect(
                parseNoteUrl({ noteUrl: 'https://example.com/123#pw:dar:abc' }),
            ).to.eql({
                noteId: '123',
                encryptionKey: 'abc',
                isPasswordProtected: true,
                isDeletedAfterReading: true,
            });
        });

        test('trailing slash in the base url is handled', () => {
            expect(
                parseNoteUrl({ noteUrl: 'https://example.com/123/#abc' }),
            ).to.eql({
                noteId: '123',
                encryptionKey: 'abc',
                isPasswordProtected: false,
                isDeletedAfterReading: false,
            });
        });

        test('in case of nested paths, the last path segment is considered the note id', () => {
            expect(
                parseNoteUrl({ noteUrl: 'https://example.com/123/456#abc' }),
            ).to.eql({
                noteId: '456',
                encryptionKey: 'abc',
                isPasswordProtected: false,
                isDeletedAfterReading: false,
            });
        });

        test('throws an error if their is no note id or encryption key', () => {
            expect(() => {
                parseNoteUrl({ noteUrl: 'https://example.com/#abc' });
            }).to.throw('Invalid note url');

            expect(() => {
                parseNoteUrl({ noteUrl: 'https://example.com/123#' });
            }).to.throw('Hash fragment is missing');

            expect(() => {
                parseNoteUrl({ noteUrl: 'https://example.com/123' });
            }).to.throw('Hash fragment is missing');

            expect(() => {
                parseNoteUrl({ noteUrl: 'https://example.com/' });
            }).to.throw('Invalid note url');
        });
    });

    describe('creation + parsing', () => {
        test('a note url can be parsed back to its original parts', () => {
            const { noteUrl } = createNoteUrl({ noteId: '123', encryptionKey: 'abc', clientBaseUrl: 'https://example.com', isPasswordProtected: true });
            const { noteId, encryptionKey, isPasswordProtected } = parseNoteUrl({ noteUrl });

            expect(noteId).to.equal('123');
            expect(encryptionKey).to.equal('abc');
            expect(isPasswordProtected).to.equal(true);
        });
    });

    describe('createNoteUrlHashFragment', () => {
        test('creates a hash fragment from an encryption key', () => {
            expect(
                createNoteUrlHashFragment({ encryptionKey: 'abc' }),
            ).to.equal('abc');
        });

        test('indicates that the note is password protected', () => {
            expect(
                createNoteUrlHashFragment({ encryptionKey: 'abc', isPasswordProtected: true }),
            ).to.equal('pw:abc');
        });

        test('when a note is deleted after reading, it is indicated in the hash fragment with a "dar" segment', () => {
            expect(
                createNoteUrlHashFragment({ encryptionKey: 'abc', isDeletedAfterReading: true }),
            ).to.equal('dar:abc');

            expect(
                createNoteUrlHashFragment({
                    encryptionKey: 'abc',
                    isPasswordProtected: true,
                    isDeletedAfterReading: true,
                }),
            ).to.equal('pw:dar:abc');
        });
    });

    describe('parseNoteUrlHashFragment', () => {
        test('parses an encryption key from a hash fragment', () => {
            expect(
                parseNoteUrlHashFragment({ hashFragment: 'abc' }),
            ).to.eql({
                encryptionKey: 'abc',
                isPasswordProtected: false,
                isDeletedAfterReading: false,

            });
        });

        test('the fragment can indicate that the note is password protected', () => {
            expect(
                parseNoteUrlHashFragment({ hashFragment: 'pw:abc' }),
            ).to.eql({
                encryptionKey: 'abc',
                isPasswordProtected: true,
                isDeletedAfterReading: false,
            });

            expect(
                parseNoteUrlHashFragment({ hashFragment: 'pw:dar:abc' }),
            ).to.eql({
                encryptionKey: 'abc',
                isPasswordProtected: true,
                isDeletedAfterReading: true,
            });

            expect(
                parseNoteUrlHashFragment({ hashFragment: 'dar:abc' }),
            ).to.eql({
                encryptionKey: 'abc',
                isPasswordProtected: false,
                isDeletedAfterReading: true,
            });
        });

        test('the fragment can start with a #', () => {
            expect(
                parseNoteUrlHashFragment({ hashFragment: '#abc' }),
            ).to.eql({
                encryptionKey: 'abc',
                isPasswordProtected: false,
                isDeletedAfterReading: false,
            });

            expect(
                parseNoteUrlHashFragment({ hashFragment: '#pw:abc' }),
            ).to.eql({
                encryptionKey: 'abc',
                isPasswordProtected: true,
                isDeletedAfterReading: false,
            });

            expect(
                parseNoteUrlHashFragment({ hashFragment: '#pw:dar:abc' }),
            ).to.eql({
                encryptionKey: 'abc',
                isPasswordProtected: true,
                isDeletedAfterReading: true,
            });
        });

        test('throws an error if the hash fragment has more than two segments', () => {
            expect(() => {
                parseNoteUrlHashFragment({ hashFragment: 'pw:abc:123' });
            }).to.throw('Invalid hash fragment');
        });

        test('throws an error if the hash fragment is empty', () => {
            expect(() => {
                parseNoteUrlHashFragment({ hashFragment: '' });
            }).to.throw('Hash fragment is missing');
        });
    });

    describe('isShareHashFragment', () => {
        test('returns true for a valid share hash fragment', () => {
            expect(isShareHashFragment({ hashFragment: 'sss:2:3:1:abc123' })).to.equal(true);
        });

        test('returns true when the hash fragment starts with #', () => {
            expect(isShareHashFragment({ hashFragment: '#sss:2:3:1:abc123' })).to.equal(true);
        });

        test('returns false for a regular hash fragment', () => {
            expect(isShareHashFragment({ hashFragment: 'abc123' })).to.equal(false);
            expect(isShareHashFragment({ hashFragment: 'pw:abc123' })).to.equal(false);
            expect(isShareHashFragment({ hashFragment: '#pw:abc123' })).to.equal(false);
        });

        test('returns false for an empty hash fragment', () => {
            expect(isShareHashFragment({ hashFragment: '' })).to.equal(false);
        });
    });

    describe('createShareUrlHashFragment', () => {
        test('creates a share hash fragment with the sss prefix and required fields', () => {
            expect(
                createShareUrlHashFragment({ threshold: 2, totalShares: 3, shareIndex: 1, shareData: 'abc123' }),
            ).to.equal('sss:2:3:1:abc123');
        });

        test('includes password protected flag', () => {
            expect(
                createShareUrlHashFragment({ threshold: 2, totalShares: 3, shareIndex: 1, shareData: 'abc123', isPasswordProtected: true }),
            ).to.equal('sss:2:3:1:abc123:pw');
        });

        test('includes deleted after reading flag', () => {
            expect(
                createShareUrlHashFragment({ threshold: 2, totalShares: 3, shareIndex: 1, shareData: 'abc123', isDeletedAfterReading: true }),
            ).to.equal('sss:2:3:1:abc123:dar');
        });

        test('includes both password and deleted after reading flags', () => {
            expect(
                createShareUrlHashFragment({ threshold: 3, totalShares: 5, shareIndex: 2, shareData: 'xyz', isPasswordProtected: true, isDeletedAfterReading: true }),
            ).to.equal('sss:3:5:2:xyz:pw:dar');
        });
    });

    describe('parseShareUrlHashFragment', () => {
        test('parses a valid share hash fragment', () => {
            expect(
                parseShareUrlHashFragment({ hashFragment: 'sss:2:3:1:abc123' }),
            ).to.eql({
                threshold: 2,
                totalShares: 3,
                shareIndex: 1,
                shareData: 'abc123',
                isPasswordProtected: false,
                isDeletedAfterReading: false,
            });
        });

        test('parses a share hash fragment starting with #', () => {
            expect(
                parseShareUrlHashFragment({ hashFragment: '#sss:2:3:1:abc123' }),
            ).to.eql({
                threshold: 2,
                totalShares: 3,
                shareIndex: 1,
                shareData: 'abc123',
                isPasswordProtected: false,
                isDeletedAfterReading: false,
            });
        });

        test('parses password protected and deleted after reading flags', () => {
            expect(
                parseShareUrlHashFragment({ hashFragment: 'sss:3:5:2:xyz:pw:dar' }),
            ).to.eql({
                threshold: 3,
                totalShares: 5,
                shareIndex: 2,
                shareData: 'xyz',
                isPasswordProtected: true,
                isDeletedAfterReading: true,
            });
        });

        test('parses only password protected flag', () => {
            expect(
                parseShareUrlHashFragment({ hashFragment: 'sss:2:3:1:abc:pw' }),
            ).to.eql({
                threshold: 2,
                totalShares: 3,
                shareIndex: 1,
                shareData: 'abc',
                isPasswordProtected: true,
                isDeletedAfterReading: false,
            });
        });

        test('parses only deleted after reading flag', () => {
            expect(
                parseShareUrlHashFragment({ hashFragment: 'sss:2:3:1:abc:dar' }),
            ).to.eql({
                threshold: 2,
                totalShares: 3,
                shareIndex: 1,
                shareData: 'abc',
                isPasswordProtected: false,
                isDeletedAfterReading: true,
            });
        });

        test('throws an error for a non-share hash fragment', () => {
            expect(() => {
                parseShareUrlHashFragment({ hashFragment: 'pw:abc123' });
            }).to.throw('Not a share hash fragment');
        });

        test('throws an error for a share hash fragment with too few parts', () => {
            expect(() => {
                parseShareUrlHashFragment({ hashFragment: 'sss:2:3' });
            }).to.throw('Invalid share hash fragment');
        });

        test('throws an error for a share hash fragment with non-numeric values', () => {
            expect(() => {
                parseShareUrlHashFragment({ hashFragment: 'sss:abc:3:1:data' });
            }).to.throw('Invalid share hash fragment');
        });

        test('throws an error for a share hash fragment with empty share data', () => {
            expect(() => {
                parseShareUrlHashFragment({ hashFragment: 'sss:2:3:1:' });
            }).to.throw('Invalid share hash fragment');
        });
    });

    describe('share hash fragment creation + parsing round-trip', () => {
        test('a share hash fragment can be parsed back to its original parts', () => {
            const hashFragment = createShareUrlHashFragment({
                threshold: 3,
                totalShares: 5,
                shareIndex: 2,
                shareData: 'secretData123',
                isPasswordProtected: true,
                isDeletedAfterReading: true,
            });

            const parsed = parseShareUrlHashFragment({ hashFragment });

            expect(parsed).to.eql({
                threshold: 3,
                totalShares: 5,
                shareIndex: 2,
                shareData: 'secretData123',
                isPasswordProtected: true,
                isDeletedAfterReading: true,
            });
        });

        test('round-trip works without optional flags', () => {
            const hashFragment = createShareUrlHashFragment({
                threshold: 2,
                totalShares: 3,
                shareIndex: 1,
                shareData: 'data',
            });

            const parsed = parseShareUrlHashFragment({ hashFragment });

            expect(parsed.threshold).to.equal(2);
            expect(parsed.totalShares).to.equal(3);
            expect(parsed.shareIndex).to.equal(1);
            expect(parsed.shareData).to.equal('data');
            expect(parsed.isPasswordProtected).to.equal(false);
            expect(parsed.isDeletedAfterReading).to.equal(false);
        });
    });

    describe('createShareNoteUrls', () => {
        test('creates one URL per share with the correct hash fragment', () => {
            const { shareUrls } = createShareNoteUrls({
                noteId: 'note123',
                shares: [
                    { index: 1, data: 'shareA' },
                    { index: 2, data: 'shareB' },
                    { index: 3, data: 'shareC' },
                ],
                threshold: 2,
                totalShares: 3,
                clientBaseUrl: 'https://example.com',
            });

            expect(shareUrls).to.have.length(3);
            expect(shareUrls[0]).to.equal('https://example.com/note123#sss:2:3:1:shareA');
            expect(shareUrls[1]).to.equal('https://example.com/note123#sss:2:3:2:shareB');
            expect(shareUrls[2]).to.equal('https://example.com/note123#sss:2:3:3:shareC');
        });

        test('includes password and delete-after-reading flags in each URL', () => {
            const { shareUrls } = createShareNoteUrls({
                noteId: 'note456',
                shares: [
                    { index: 1, data: 'shareX' },
                    { index: 2, data: 'shareY' },
                ],
                threshold: 2,
                totalShares: 2,
                clientBaseUrl: 'https://example.com',
                isPasswordProtected: true,
                isDeletedAfterReading: true,
            });

            expect(shareUrls).to.have.length(2);
            expect(shareUrls[0]).to.equal('https://example.com/note456#sss:2:2:1:shareX:pw:dar');
            expect(shareUrls[1]).to.equal('https://example.com/note456#sss:2:2:2:shareY:pw:dar');
        });

        test('supports a path prefix', () => {
            const { shareUrls } = createShareNoteUrls({
                noteId: 'note789',
                shares: [{ index: 1, data: 'shareZ' }],
                threshold: 1,
                totalShares: 1,
                clientBaseUrl: 'https://example.com/',
                pathPrefix: 'notes',
            });

            expect(shareUrls[0]).to.equal('https://example.com/notes/note789#sss:1:1:1:shareZ');
        });

        test('each generated share URL can be parsed back correctly', () => {
            const shares = [
                { index: 1, data: 'aaa' },
                { index: 2, data: 'bbb' },
                { index: 3, data: 'ccc' },
            ];

            const { shareUrls } = createShareNoteUrls({
                noteId: 'roundtrip',
                shares,
                threshold: 2,
                totalShares: 3,
                clientBaseUrl: 'https://example.com',
                isPasswordProtected: true,
            });

            shareUrls.forEach((url, i) => {
                const urlObj = new URL(url);
                const parsed = parseShareUrlHashFragment({ hashFragment: urlObj.hash });

                expect(parsed.threshold).to.equal(2);
                expect(parsed.totalShares).to.equal(3);
                expect(parsed.shareIndex).to.equal(shares[i].index);
                expect(parsed.shareData).to.equal(shares[i].data);
                expect(parsed.isPasswordProtected).to.equal(true);
                expect(parsed.isDeletedAfterReading).to.equal(false);
            });
        });
    });
});
