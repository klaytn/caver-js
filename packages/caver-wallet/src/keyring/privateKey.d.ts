
export interface PrivateKey_I {
    /**
     * creates a privateKey.
     * @param {string} key - The private key string.
     */
    new(key: string): PrivateKey
}



/**
 * Representing a PrivateKey class that includes private key string.
 * @class
 */
export default class PrivateKey {
    /**
     * creates a privateKey.
     * @param {string} key - The private key string.
     */
    constructor(key: string)

    /**
     * @type {string}
     */
    get privateKey(): string

    set privateKey(p: string)

    /**
     * signs with transactionHash with key and returns signature.
     *
     * @param {string} transactionHash The hash of transaction.
     * @param {string|number} chainId The chainId or the network.
     * @return {SignatureData}
     */
    sign(transactionHash: string, chainId: string | number): SignatureData

    /**
     * signs with hashed data and returns `signature`
     *
     * @param {string} messageHash The hash of data to sign.
     * @return {SignatureData}
     */
    signMessage(messageHash: string): SignatureData

    /**
     * returns public key string
     *
     * @return {string}
     */
    getPublicKey(compressed = false): string

    /**
     * returns derived address from private key string
     *
     * @return {string}
     */
    getDerivedAddress(): string
}

