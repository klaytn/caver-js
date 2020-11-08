export const ACCOUNT_KEY_TAG: {
    ACCOUNT_KEY_NIL_TAG: string
    ACCOUNT_KEY_LEGACY_TAG: string
    ACCOUNT_KEY_PUBLIC_TAG: string
    ACCOUNT_KEY_FAIL_TAG: string
    ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG: string
    ACCOUNT_KEY_ROLE_BASED_TAG: string
}

/**
 * Creates and returns the valid instance of WeightedMultiSigOptions for AccountKeyWeightedMultiSig.
 * If the user does not define the values of options(threshold, weights),
 * default options(threshold is 1 and the weight of each key is 1) are returned.
 *
 * @param {number} lengthOfKeys The lenght of keys.
 * @param {WeightedMultiSigOptions|object} [options] An instance of WeightedMultiSigOptions or an object that defines 'threshold' and 'weight'.
 * @return {WeightedMultiSigOptions}
 */
export const fillWeightedMultiSigOptionsForMultiSig: (
    lengthOfKeys: number,
    options?: WeightedMultiSigOptions | object
) => WeightedMultiSigOptions

/**
 * Creates and returns the valid instance of WeightedMultiSigOptions for AccountKeyRoleBased.
 * If the user does not define the values of options(threshold, weights),
 * default options(threshold is 1 and the weight of each key is 1) will be used for each role key.
 *
 * @param {Array.<number>} lengthOfKeys The lenght of keys.
 * @param {Array.<WeightedMultiSigOptions>|Array.<object>} [options] An array of WeightedMultiSigOptions or object that defines 'threshold' and 'weight'.
 * @return {Array.<WeightedMultiSigOptions>}
 */
export const fillWeightedMultiSigOptionsForRoleBased: (
    lengthOfKeys: number[],
    options?: WeightedMultiSigOptions[] | object[]
) => WeightedMultiSigOptions[]
