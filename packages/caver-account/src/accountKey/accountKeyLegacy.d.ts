/**
 * Representing an AccountKeyLegacy.
 * @class
 */
export interface AccountKeyLegacy_I {
    /**
     * Decodes an RLP-encoded AccountKeyLegacy string.
     * @param {string} rlpEncodedKey - An RLP-encoded AccountKeyLegacy string.
     * @return {AccountKeyLegacy}
     */
    decode: (rlpEncodedKey: string) => AccountKeyLegacy
    new(): AccountKeyLegacy
}

/**
 * Representing an AccountKeyLegacy.
 * @class
 */
export default class AccountKeyLegacy {
    /**
     * Decodes an RLP-encoded AccountKeyLegacy string.
     * @param {string} rlpEncodedKey - An RLP-encoded AccountKeyLegacy string.
     * @return {AccountKeyLegacy}
     */
    static decode: (rlpEncodedKey: string) => AccountKeyLegacy

    /**
     * Returns an RLP-encoded AccountKeyLegacy string.
     * @return {string}
     */
    getRLPEncoding: () => string
}
