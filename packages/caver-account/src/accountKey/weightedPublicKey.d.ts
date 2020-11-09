/**
 * Representing a WeightedPublicKey.
 * @class
 */
export interface WeightedPublicKey_I {
    /**
     * Create an instance of WeightedPublicKey.
     * @param {number} weight - The weight of the key.
     * @param {string} publicKey - The public key string.
     */
    new(weight: number, publicKey: string): WeightedPublicKey

}


/**
 * Representing a WeightedPublicKey.
 * @class
 */
export default class WeightedPublicKey {
    /**
     * Create an instance of WeightedPublicKey.
     * @param {number} weight - The weight of the key.
     * @param {string} publicKey - The public key string.
     */
    constructor(weight: number, publicKey: string)
    /**
     * @type {number}
     */
    get weight(): number

    set weight(w: number)

    /**
     * @type {string}
     */
    get publicKey(): string

    set publicKey(p: string)

    /**
     * Returns an encoded weighted public key string.
     * @return {string}
     */
    encodeToBytes: () => string
}
