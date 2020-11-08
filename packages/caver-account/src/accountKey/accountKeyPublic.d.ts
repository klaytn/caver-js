/**
 * Representing an AccountKeyPublic.
 * @class
 */
export interface AccountKeyPublic_I {
    /**
     * Decodes an RLP-encoded AccountKeyPublic string.
     * @param {string} rlpEncodedKey - An RLP-encoded AccountKeyPublic string.
     * @return {AccountKeyPublic}
     */
    decode: (rlpEncodedKey: string) => AccountKeyPublic

    /**
     * Creates AccountKeyPublic instance from x, y point
     * @param {string} x - The x point.
     * @param {string} y - The y point.
     * @return {AccountKeyPublic}
     */
    fromXYPoint: (x: string, y: string) => AccountKeyPublic

    /**
     * Creates AccountKeyPublic instance from public key string
     * @param {string} pubKey - The public key string. This can be in format of compressed or uncompressed.
     * @return {AccountKeyPublic}
     */
    fromPublicKey: (pubKey: string) => AccountKeyPublic

    /**
     * Creates an instance of AccountKeyPublic.
     * @param {string} publicKey - a public key
     */
    new(publicKey: string): AccountKeyPublic

}


/**
 * Representing an AccountKeyPublic.
 * @class
 */
export default class AccountKeyPublic {
    /**
     * Decodes an RLP-encoded AccountKeyPublic string.
     * @param {string} rlpEncodedKey - An RLP-encoded AccountKeyPublic string.
     * @return {AccountKeyPublic}
     */
    static decode: (rlpEncodedKey: string) => AccountKeyPublic

    /**
     * Creates AccountKeyPublic instance from x, y point
     * @param {string} x - The x point.
     * @param {string} y - The y point.
     * @return {AccountKeyPublic}
     */
    static fromXYPoint: (x: string, y: string) => AccountKeyPublic

    /**
     * Creates AccountKeyPublic instance from public key string
     * @param {string} pubKey - The public key string. This can be in format of compressed or uncompressed.
     * @return {AccountKeyPublic}
     */
    static fromPublicKey: (pubKey: string) => AccountKeyPublic

    /**
     * Creates an instance of AccountKeyPublic.
     * @param {string} publicKey - a public key
     */
    constructor(publicKey: string)

    /**
     * @type {string}
     */
    get publicKey(): string

    set publicKey(p: string)

    /**
     * Returns an RLP-encoded AccountKeyPublic string.
     * @return {string}
     */
    getRLPEncoding: () => string

    /**
     * Returns the x and y coordinates of publicKey.
     * @return {Array.<string>}
     */
    getXYPoint: () => string[]
}
