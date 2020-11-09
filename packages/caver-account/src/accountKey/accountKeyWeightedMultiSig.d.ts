/**
 * Representing an AccountKeyWeightedMultiSig.
 * @class
 */
export interface AccountKeyWeightedMultiSig_I {
    /**
     * Decodes an RLP-encoded AccountKeyWeightedMultiSig string.
     * @param {string} rlpEncodedKey - An RLP-encoded AccountKeyWeightedMultiSig string.
     * @return {AccountKeyWeightedMultiSig}
     */
    decode: (rlpEncodedKey: string) => AccountKeyWeightedMultiSig
    /**
     * Creates an instance of AccountKeyWeighedMultiSig.
     * @param {Array.<string>} publicKeyArray - An array of public key strings.
     * @param {WeightedMultiSigOptions|object} options - An options which defines threshold and weight.
     * @return {AccountKeyWeightedMultiSig}
     */
    fromPublicKeysAndOptions: (
        publicKeyArray: Array<string>,
        options?: WeightedMultiSigOptions | object
    ) => AccountKeyWeightedMultiSig

    /**
     * Create an instance of AccountKeyWeightedMultiSig.
     * @param {number} threshold - The threshold of accountKey.
     * @param {Array.<WeightedPublicKey>} weightedPublicKeys - An array of instances of WeightedPublicKeys
     */
    new(threshold: number, weightedPublicKeys: Array<WeightedPublicKey>): AccountKeyWeightedMultiSig


}

/**
 * Representing an AccountKeyWeightedMultiSig.
 * @class
 */
export default class AccountKeyWeightedMultiSig {
    /**
     * Decodes an RLP-encoded AccountKeyWeightedMultiSig string.
     * @param {string} rlpEncodedKey - An RLP-encoded AccountKeyWeightedMultiSig string.
     * @return {AccountKeyWeightedMultiSig}
     */
    static decode: (rlpEncodedKey: string) => AccountKeyWeightedMultiSig
    /**
     * Creates an instance of AccountKeyWeighedMultiSig.
     * @param {Array.<string>} publicKeyArray - An array of public key strings.
     * @param {WeightedMultiSigOptions|object} options - An options which defines threshold and weight.
     * @return {AccountKeyWeightedMultiSig}
     */
    static fromPublicKeysAndOptions: (
        publicKeyArray: Array<string>,
        options: WeightedMultiSigOptions | object
    ) => AccountKeyWeightedMultiSig

    /**
     * Create an instance of AccountKeyWeightedMultiSig.
     * @param {number} threshold - The threshold of accountKey.
     * @param {Array.<WeightedPublicKey>} weightedPublicKeys - An array of instances of WeightedPublicKeys
     */
    constructor(threshold: number, weightedPublicKeys: Array<WeightedPublicKey>)

    /**
     * @type {Number}
     */
    get threshold(): number

    set threshold(t: number)
    /**
     * @type {Array.<WeightedPublicKey>}
     */
    get weightedPublicKeys(): Array<WeightedPublicKey>

    set weightedPublicKeys(wps: Array<WeightedPublicKey>)

    /**
     * Returns an RLP-encoded AccountKeyWeightedMultiSig string.
     * @return {string}
     */
    getRLPEncoding: () => string
}
