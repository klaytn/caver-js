/**
 * Representing an AccountKeyRoleBased.
 * @class
 */
export interface AccountKeyRoleBased_I {
    /**
     * Decodes an RLP-encoded AccountKeyRoleBased string.
     * @param {string} rlpEncodedKey - An RLP-encoded AccountKeyRoleBased string.
     * @return {AccountKeyRoleBased}
     */
    decode: (rlpEncodedKey: string) => AccountKeyRoleBased

    /**
     * Creates an instance of AccountKeyRoleBased.
     * @param {Array.<AccountKeyLegacy|AccountKeyFail|Array.<string>>} roleBasedPubArray - An array of public key strings.
     * @param {Array.<WeightedMultiSigOptions|object>} options - An array of options which defines threshold and weight.
     * @return {AccountKeyRoleBased}
     */
    fromRoleBasedPublicKeysAndOptions: (
        roleBasedPubArray: Array<AccountKeyLegacy | AccountKeyFail | Array<string>>,
        options?: Array<WeightedMultiSigOptions | object>
    ) => AccountKeyRoleBased

    /**
     * Create an instance of AccountKeyRoleBased.
     * @param {Array.<AccountKeyLegacy|AccountKeyPublic|AccountKeyFail|AccountKeyWeightedMultiSig>} accountKeyArray - An array containing arrays of instances of AccountKeyPublic or AccountKeyWeightedMultiSig for each role.
     */
    new(accountKeyArray: Array<AccountKeyLegacy | AccountKeyPublic | AccountKeyFail | AccountKeyWeightedMultiSig>): AccountKeyRoleBased

}


/**
 * Representing an AccountKeyRoleBased.
 * @class
 */
export default class AccountKeyRoleBased {
    /**
     * Decodes an RLP-encoded AccountKeyRoleBased string.
     * @param {string} rlpEncodedKey - An RLP-encoded AccountKeyRoleBased string.
     * @return {AccountKeyRoleBased}
     */
    static decode: (rlpEncodedKey: string) => AccountKeyRoleBased

    /**
     * Creates an instance of AccountKeyRoleBased.
     * @param {Array.<AccountKeyLegacy|AccountKeyFail|Array.<string>>} roleBasedPubArray - An array of public key strings.
     * @param {Array.<WeightedMultiSigOptions|object>} options - An array of options which defines threshold and weight.
     * @return {AccountKeyRoleBased}
     */
    static fromRoleBasedPublicKeysAndOptions: (
        roleBasedPubArray: Array<AccountKeyLegacy | AccountKeyFail | Array<string>>,
        options: Array<WeightedMultiSigOptions | object>
    ) => AccountKeyRoleBased

    /**
     * Create an instance of AccountKeyRoleBased.
     * @param {Array.<AccountKeyLegacy|AccountKeyPublic|AccountKeyFail|AccountKeyWeightedMultiSig>} accountKeyArray - An array containing arrays of instances of AccountKeyPublic or AccountKeyWeightedMultiSig for each role.
     */
    constructor(accountKeyArray: Array<AccountKeyLegacy | AccountKeyPublic | AccountKeyFail | AccountKeyWeightedMultiSig>)

    /**
     * @type {Array.<AccountKeyLegacy|AccountKeyPublic|AccountKeyFail|AccountKeyWeightedMultiSig>}
     */
    get accountKeys(): Array<AccountKeyLegacy | AccountKeyPublic | AccountKeyFail | AccountKeyWeightedMultiSig>

    set accountKeys(keys: Array<AccountKeyLegacy | AccountKeyPublic | AccountKeyFail | AccountKeyWeightedMultiSig>)

    /**
     * Returns an RLP-encoded AccountKeyRoleBased string.
     * @return {string}
     */
    getRLPEncoding: () => string
}
