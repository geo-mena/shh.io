import type { EncryptionAlgorithm } from '../crypto/crypto.types';
import type { SerializationFormat } from '../crypto/serialization/serialization.types';
import type { NoteAsset, SharedNoteResult } from './notes.types';
import { encryptNote, splitEncryptionKey } from '../crypto/crypto.usecases';
import { createNoteUrl, createShareNoteUrls } from './notes.models';
import { storeNote as storeNoteImpl } from './notes.services';

export { createNote, createSharedNote };

const BASE_URL = 'https://shh.tofi.pro';

async function createNote({
    content,
    password,
    ttlInSeconds,
    deleteAfterReading = false,
    clientBaseUrl = BASE_URL,
    apiBaseUrl = clientBaseUrl,
    storeNote = params => storeNoteImpl({ ...params, apiBaseUrl }),
    assets = [],
    encryptionAlgorithm = 'aes-256-gcm',
    serializationFormat = 'cbor-array',
    isPublic = true,
    pathPrefix,
}: {
    content: string;
    password?: string;
    ttlInSeconds?: number;
    deleteAfterReading?: boolean;
    clientBaseUrl?: string;
    apiBaseUrl?: string;
    assets?: NoteAsset[];
    encryptionAlgorithm?: EncryptionAlgorithm;
    serializationFormat?: SerializationFormat;
    isPublic?: boolean;
    pathPrefix?: string;
    storeNote?: (params: {
        payload: string;
        ttlInSeconds?: number;
        deleteAfterReading: boolean;
        encryptionAlgorithm: EncryptionAlgorithm;
        serializationFormat: SerializationFormat;
        isPublic?: boolean;
    }) => Promise<{ noteId: string }>;
}) {
    const { encryptedPayload, encryptionKey } = await encryptNote({ content, password, assets, encryptionAlgorithm, serializationFormat });
    const isPasswordProtected = Boolean(password);

    const { noteId } = await storeNote({
        payload: encryptedPayload,
        ttlInSeconds,
        deleteAfterReading,
        encryptionAlgorithm,
        serializationFormat,
        isPublic,
    });

    const { noteUrl } = createNoteUrl({
        noteId,
        encryptionKey,
        clientBaseUrl,
        isPasswordProtected,
        isDeletedAfterReading: deleteAfterReading,
        pathPrefix,
    });

    return {
        encryptedPayload,
        encryptionKey,
        noteId,
        noteUrl,
    };
}

async function createSharedNote({
    content,
    password,
    ttlInSeconds,
    deleteAfterReading = false,
    totalShares,
    threshold,
    clientBaseUrl = BASE_URL,
    apiBaseUrl = clientBaseUrl,
    storeNote = params => storeNoteImpl({ ...params, apiBaseUrl }),
    assets = [],
    encryptionAlgorithm = 'aes-256-gcm',
    serializationFormat = 'cbor-array',
    isPublic = true,
    pathPrefix,
}: {
    content: string;
    totalShares: number;
    threshold: number;
    password?: string;
    ttlInSeconds?: number;
    deleteAfterReading?: boolean;
    clientBaseUrl?: string;
    apiBaseUrl?: string;
    assets?: NoteAsset[];
    encryptionAlgorithm?: EncryptionAlgorithm;
    serializationFormat?: SerializationFormat;
    isPublic?: boolean;
    pathPrefix?: string;
    storeNote?: (params: {
        payload: string;
        ttlInSeconds?: number;
        deleteAfterReading: boolean;
        encryptionAlgorithm: EncryptionAlgorithm;
        serializationFormat: SerializationFormat;
        isPublic?: boolean;
    }) => Promise<{ noteId: string }>;
}): Promise<SharedNoteResult> {
    const { encryptedPayload, encryptionKey } = await encryptNote({ content, password, assets, encryptionAlgorithm, serializationFormat });
    const isPasswordProtected = Boolean(password);

    const { shares } = splitEncryptionKey({ encryptionKey, totalShares, threshold });

    const { noteId } = await storeNote({
        payload: encryptedPayload,
        ttlInSeconds,
        deleteAfterReading,
        encryptionAlgorithm,
        serializationFormat,
        isPublic,
    });

    const { shareUrls } = createShareNoteUrls({
        noteId,
        shares,
        threshold,
        totalShares,
        clientBaseUrl,
        isPasswordProtected,
        isDeletedAfterReading: deleteAfterReading,
        pathPrefix,
    });

    return { noteId, shareUrls, threshold, totalShares };
}
