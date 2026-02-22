import type { ShareData, ShareHashFragmentData } from './notes.types';
import { buildUrl } from '@corentinth/chisels';
import { isEmpty } from 'lodash-es';

export { createNoteUrl, createNoteUrlHashFragment, createShareNoteUrls, createShareUrlHashFragment, isShareHashFragment, parseNoteUrl, parseNoteUrlHashFragment, parseShareUrlHashFragment };

const PASSWORD_PROTECTED_HASH_FRAGMENT = 'pw';
const DELETED_AFTER_READING_HASH_FRAGMENT = 'dar';
const SSS_HASH_FRAGMENT_PREFIX = 'sss';

function createNoteUrlHashFragment({ encryptionKey, isPasswordProtected, isDeletedAfterReading }: { encryptionKey: string; isPasswordProtected?: boolean; isDeletedAfterReading?: boolean }) {
    const hashFragment = [
        isPasswordProtected && PASSWORD_PROTECTED_HASH_FRAGMENT,
        isDeletedAfterReading && DELETED_AFTER_READING_HASH_FRAGMENT,
        encryptionKey,
    ].filter(Boolean).join(':');

    return hashFragment;
}

function parseNoteUrlHashFragment({ hashFragment }: { hashFragment: string }) {
    const cleanedHashFragment = hashFragment.replace(/^#/, '');

    if (isEmpty(cleanedHashFragment)) {
        throw new Error('Hash fragment is missing');
    }

    const segments = cleanedHashFragment.split(':');
    const encryptionKey = segments.pop();

    const hasInvalidSegments = segments.some(segment => ![PASSWORD_PROTECTED_HASH_FRAGMENT, DELETED_AFTER_READING_HASH_FRAGMENT].includes(segment));

    if (!encryptionKey || hasInvalidSegments) {
        throw new Error('Invalid hash fragment');
    }

    return {
        encryptionKey,
        isPasswordProtected: segments.includes(PASSWORD_PROTECTED_HASH_FRAGMENT),
        isDeletedAfterReading: segments.includes(DELETED_AFTER_READING_HASH_FRAGMENT),
    };
}

function createNoteUrl({
    noteId,
    encryptionKey,
    clientBaseUrl,
    isPasswordProtected,
    isDeletedAfterReading,
    pathPrefix,
}: {
    noteId: string;
    encryptionKey: string;
    clientBaseUrl: string;
    isPasswordProtected?: boolean;
    isDeletedAfterReading?: boolean;
    pathPrefix?: string;
}): { noteUrl: string } {
    const hashFragment = createNoteUrlHashFragment({ encryptionKey, isPasswordProtected, isDeletedAfterReading });

    const noteUrl = buildUrl({
        path: [pathPrefix, noteId],
        hash: hashFragment,
        baseUrl: clientBaseUrl,
    });

    return { noteUrl };
}

function parseNoteUrl({ noteUrl }: { noteUrl: string }) {
    const url = new URL(noteUrl);

    const noteId = url.pathname.split('/').filter(Boolean).pop();

    if (!noteId) {
        throw new Error('Invalid note url');
    }

    const { encryptionKey, isPasswordProtected, isDeletedAfterReading } = parseNoteUrlHashFragment({ hashFragment: url.hash });

    return { noteId, encryptionKey, isPasswordProtected, isDeletedAfterReading };
}

function isShareHashFragment({ hashFragment }: { hashFragment: string }): boolean {
    const cleaned = hashFragment.replace(/^#/, '');
    return cleaned.startsWith(`${SSS_HASH_FRAGMENT_PREFIX}:`);
}

// Format: sss:<threshold>:<totalShares>:<shareIndex>:<shareData>[:pw][:dar]
function createShareUrlHashFragment({ threshold, totalShares, shareIndex, shareData, isPasswordProtected, isDeletedAfterReading }: {
    threshold: number;
    totalShares: number;
    shareIndex: number;
    shareData: string;
    isPasswordProtected?: boolean;
    isDeletedAfterReading?: boolean;
}): string {
    return [
        SSS_HASH_FRAGMENT_PREFIX,
        threshold,
        totalShares,
        shareIndex,
        shareData,
        isPasswordProtected && PASSWORD_PROTECTED_HASH_FRAGMENT,
        isDeletedAfterReading && DELETED_AFTER_READING_HASH_FRAGMENT,
    ].filter(Boolean).join(':');
}

function parseShareUrlHashFragment({ hashFragment }: { hashFragment: string }): ShareHashFragmentData {
    const cleaned = hashFragment.replace(/^#/, '');

    if (!cleaned.startsWith(`${SSS_HASH_FRAGMENT_PREFIX}:`)) {
        throw new Error('Not a share hash fragment');
    }

    const parts = cleaned.split(':');

    // sss:<threshold>:<totalShares>:<shareIndex>:<shareData>[:<flags>...]
    if (parts.length < 5) {
        throw new Error('Invalid share hash fragment');
    }

    const threshold = Number.parseInt(parts[1], 10);
    const totalShares = Number.parseInt(parts[2], 10);
    const shareIndex = Number.parseInt(parts[3], 10);
    const shareData = parts[4];
    const flags = parts.slice(5);

    if (Number.isNaN(threshold) || Number.isNaN(totalShares) || Number.isNaN(shareIndex) || isEmpty(shareData)) {
        throw new Error('Invalid share hash fragment');
    }

    return {
        threshold,
        totalShares,
        shareIndex,
        shareData,
        isPasswordProtected: flags.includes(PASSWORD_PROTECTED_HASH_FRAGMENT),
        isDeletedAfterReading: flags.includes(DELETED_AFTER_READING_HASH_FRAGMENT),
    };
}

function createShareNoteUrls({ noteId, shares, threshold, totalShares, clientBaseUrl, isPasswordProtected, isDeletedAfterReading, pathPrefix }: {
    noteId: string;
    shares: ShareData[];
    threshold: number;
    totalShares: number;
    clientBaseUrl: string;
    isPasswordProtected?: boolean;
    isDeletedAfterReading?: boolean;
    pathPrefix?: string;
}): { shareUrls: string[] } {
    const shareUrls = shares.map(share => {
        const hashFragment = createShareUrlHashFragment({
            threshold,
            totalShares,
            shareIndex: share.index,
            shareData: share.data,
            isPasswordProtected,
            isDeletedAfterReading,
        });

        return buildUrl({
            path: [pathPrefix, noteId],
            hash: hashFragment,
            baseUrl: clientBaseUrl,
        });
    });

    return { shareUrls };
}
