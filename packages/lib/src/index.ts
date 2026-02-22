import { encryptionAlgorithms } from '@geomena/crypto';
import { isApiClientErrorWithCode, isApiClientErrorWithStatusCode } from './api/api.models';
import { combineEncryptionKeyShares, decryptNote, encryptNote, splitEncryptionKey } from './crypto/crypto.usecases';
import { serializationFormats } from './crypto/serialization/serialization.registry';
import { filesToNoteAssets, fileToNoteAsset, noteAssetsToFiles, noteAssetToFile } from './files/files.models';
import { createNoteUrl, createNoteUrlHashFragment, createShareNoteUrls, createShareUrlHashFragment, isShareHashFragment, parseNoteUrl, parseNoteUrlHashFragment, parseShareUrlHashFragment } from './notes/notes.models';
import { fetchNote, storeNote } from './notes/notes.services';
import { createNote, createSharedNote } from './notes/notes.usecases';

export {
    combineEncryptionKeyShares,
    createNote,
    createNoteUrl,
    createNoteUrlHashFragment,
    createSharedNote,
    createShareNoteUrls,
    createShareUrlHashFragment,
    decryptNote,
    encryptionAlgorithms,
    encryptNote,
    fetchNote,
    filesToNoteAssets,
    fileToNoteAsset,
    isApiClientErrorWithCode,
    isApiClientErrorWithStatusCode,
    isShareHashFragment,
    noteAssetsToFiles,
    noteAssetToFile,
    parseNoteUrl,
    parseNoteUrlHashFragment,
    parseShareUrlHashFragment,
    serializationFormats,
    splitEncryptionKey,
    storeNote,
};

export type { ShareConfig, ShareData, SharedNoteResult, ShareHashFragmentData } from './notes/notes.types';
