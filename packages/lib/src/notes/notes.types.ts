import type { CompressionAlgorithm, EncryptionAlgorithm, KeyDerivationAlgorithm } from '../crypto/crypto.types';
import type { SerializationFormat } from '../crypto/serialization/serialization.types';

export type NoteAsset = {
    metadata: {
        type: string;
        [key: string]: unknown ;
    };
    content: Uint8Array;
};

export type Note = {
    content: string;
    assets: NoteAsset[];
};

export type EncryptedNote = {
    version: number;
    payload: string;
    encryptionAlgorithm: EncryptionAlgorithm;
    serializationFormat: SerializationFormat;
    keyDerivationAlgorithm: KeyDerivationAlgorithm;
    compressionAlgorithm: CompressionAlgorithm;
    ttlInSeconds: number;
    deleteAfterReading: boolean;
};

export type ShareConfig = {
    totalShares: number;
    threshold: number;
};

export type ShareData = {
    index: number;
    data: string;
};

export type ShareHashFragmentData = {
    threshold: number;
    totalShares: number;
    shareIndex: number;
    shareData: string;
    isPasswordProtected: boolean;
    isDeletedAfterReading: boolean;
};

export type SharedNoteResult = {
    noteId: string;
    shareUrls: string[];
    threshold: number;
    totalShares: number;
};
