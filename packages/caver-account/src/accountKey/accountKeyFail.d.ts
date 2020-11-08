/**
 * Representing an AccountKeyFail.
 * @class
 */
export interface AccountKeyFail_I {
    /**
     * Decodes an RLP-encoded AccountKeyFail string.
     * @param {string} rlpEncodedKey - An RLP-encoded AccountKeyFail string.
     * @return {AccountKeyFail}
     */
    decode: (rlpEncodedKey: string) => AccountKeyFail

    new(): AccountKeyFail
}

/**
 * Representing an AccountKeyFail.
 * @class
 */
export default class AccountKeyFail {
    /**
     * Decodes an RLP-encoded AccountKeyFail string.
     * @param {string} rlpEncodedKey - An RLP-encoded AccountKeyFail string.
     * @return {AccountKeyFail}
     */
    static decode: (rlpEncodedKey: string) => AccountKeyFail

    /**
     * Returns an RLP-encoded AccountKeyFail string.
     * @return {string}
     */
    getRLPEncoding: () => string
}
