export const GF256_IRREDUCIBLE_POLYNOMIAL = 0x11D;

export const GF256_FIELD_SIZE = 256;
export const GF256_MAX_ELEMENT = 255;

export const MIN_THRESHOLD = 2;
export const MAX_SHARES = 255;

export const EXP_TABLE = new Uint8Array(GF256_FIELD_SIZE);
export const LOG_TABLE = new Uint8Array(GF256_FIELD_SIZE);

(function buildLookupTables() {
    let x = 1;
    for (let i = 0; i < GF256_MAX_ELEMENT; i++) {
        EXP_TABLE[i] = x;
        LOG_TABLE[x] = i;
        x = (x << 1) ^ (x & 0x80 ? GF256_IRREDUCIBLE_POLYNOMIAL : 0);
    }
    EXP_TABLE[GF256_MAX_ELEMENT] = EXP_TABLE[0];
})();
