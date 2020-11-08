export interface WeightedMultiSigOptions_I {
    /**
     * Creates an instance of WeightedMultiSigOptions.
     * @param {object} options - An object which defines 'threshold' and 'weights'.
     * @return {WeightedMultiSigOptions}
     */
    fromObject: (options: object) => WeightedMultiSigOptions

    /**
     * Creates an instance of WeightedMultiSigOptions.
     * @param {number} threshold - a threshold
     * @param {Array.<number>} weights - an array of weight of key
     */
    new (threshold?: number, weights?: Array<number>): WeightedMultiSigOptions
}

/**
 * Representing an options for AccountKeyWeightedMultiSig.
 * This class will define threshold and weights.
 * @class
 */
export default class WeightedMultiSigOptions {
    /**
     * Creates an instance of WeightedMultiSigOptions.
     * @param {object} options - An object which defines 'threshold' and 'weights'.
     * @return {WeightedMultiSigOptions}
     */
    static fromObject: (options: object) => WeightedMultiSigOptions

    /**
     * Creates an instance of WeightedMultiSigOptions.
     * @param {number} threshold - a threshold
     * @param {Array.<number>} weights - an array of weight of key
     */
    constructor(threshold: number, weights: Array<number>)

    /**
     * @type {number}
     */
    get threshold(): number

    set threshold(th: number)

    /**
     * @type {Array.<number>}
     */
    get weights(): Array<number>

    set weights(weightArr: Array<number>)

    /**
     * Returns 'true' if WeightedMultiSigOptions is empty.
     * @return {Boolean}
     */
    isEmpty: () => boolean
}
