import { createNote, createSharedNote, filesToNoteAssets } from '@geomena/lib';
import { storeNote } from './notes.services';

export { encryptAndCreateNote, encryptAndCreateSharedNote };

async function encryptAndCreateNote(args: {
    content: string;
    password?: string;
    ttlInSeconds?: number;
    deleteAfterReading: boolean;
    fileAssets: File[];
    isPublic?: boolean;
    pathPrefix?: string;
}) {
    return createNote({
        ...args,
        storeNote,
        clientBaseUrl: window.location.origin,
        assets: [
            ...await filesToNoteAssets({ files: args.fileAssets }),
        ],
    });
}

async function encryptAndCreateSharedNote(args: {
    content: string;
    totalShares: number;
    threshold: number;
    password?: string;
    ttlInSeconds?: number;
    deleteAfterReading: boolean;
    fileAssets: File[];
    isPublic?: boolean;
    pathPrefix?: string;
}) {
    return createSharedNote({
        ...args,
        storeNote,
        clientBaseUrl: window.location.origin,
        assets: [
            ...await filesToNoteAssets({ files: args.fileAssets }),
        ],
    });
}
