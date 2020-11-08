

export interface SignatureData_I {
    emtpySig: SignatureData

    /**
     * creates a SignatureData.
     * @param {Array.<string>|SignatureData} key - The ECDSA signatureData
     */
    new(signature: Array.<string> | SignatureData): SignatureData
}

/**
 * Representing a SignatureData class that includes ECDSA signature data string.
 * @class
 */
export default class SignatureData {
    static emtpySig: SignatureData

    /**
     * creates a SignatureData.
     * @param {Array.<string>|SignatureData} key - The ECDSA signatureData
     */
    constructor(signature: Array.<string> | SignatureData)

    /**
     * @type {string}
     */
    get v(): string

    set v(v: string)

    /**
     * @type {string}
     */
    get V(): string

    set V(v: string)

    /**
     * @type {string}
     */
    get r(): string

    set r(r: string) {
        this._r = utils.makeEven(r)
    }

    /**
     * @type {string}
     */
    get R(): string

    set R(r: string)

    /**
     * @type {string}
     */
    get s(): string

    set s(s: string)

    /**
     * @type {string}
     */
    get S(): string

    set S(s: string)

    /**
     * Return `true` if signature is same with emptySig.
     *
     * @return {boolean}
     */
    isEmpty(): boolean

    /**
     * Convert to array and return
     *
     * @return {Array.<string>}
     */
    encode(): Array.<string>

    /**
     * Convert to string
     *
     * @return {string}
     */
    toString(): string
}


