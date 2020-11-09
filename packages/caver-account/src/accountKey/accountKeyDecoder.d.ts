/**
 * Representing an AccountKeyDecoder which can decode RLP-encoded accountKey string.
 * @class
 */
export interface AccountKeyDecoder_I {
    /**
     * decodes an RLP-encoded account key string.
     *
     * @param {string} rlpEncodedKey An RLP-encoded account key string.
     * @return {Account}
     */
    decode: (
        rlpEncodedKey: string
    ) => AccountKeyLegacy | AccountKeyPublic | AccountKeyFail | AccountKeyWeightedMultiSig | AccountKeyRoleBased
    new(): AccountKeyDecoder
}


/**
 * Representing an AccountKeyDecoder which can decode RLP-encoded accountKey string.
 * @class
 */
export default class AccountKeyDecoder {
    /**
     * decodes an RLP-encoded account key string.
     *
     * @param {string} rlpEncodedKey An RLP-encoded account key string.
     * @return {Account}
     */
    static decode: (
        rlpEncodedKey: string
    ) => AccountKeyLegacy | AccountKeyPublic | AccountKeyFail | AccountKeyWeightedMultiSig | AccountKeyRoleBased
}
