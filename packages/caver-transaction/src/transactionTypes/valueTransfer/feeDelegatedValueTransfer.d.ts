import AbstractFeeDelegatedTransaction from '../abstractFeeDelegatedTransaction'

export interface IFeeDelegatedValueTransfer extends AbstractFeeDelegatedTransaction {
    /**
     * decodes the RLP-encoded string and returns a FeeDelegatedValueTransfer transaction instance.
     *
     * @param {string} rlpEncoded The RLP-encoded fee delegated value transfer transaction.
     * @return {FeeDelegatedValueTransfer}
     */
    decode(rlpEncoded: string): FeeDelegatedValueTransfer

    /**
     * Creates a fee delegated value transfer transaction.
     * @constructor
     * @param {object|string} createTxObj - The parameters to create a FeeDelegatedValueTransfer transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                                      The object can define `from`, `to`, `value`, `nonce`, `gas`, `gasPrice`, `signatures`, `feePayer`, `feePayerSignatures` and `chainId`.
     */
    new (createTxObj: object | string): FeeDelegatedValueTransfer
}

/**
 * Represents a fee delegated value transfer transaction.
 * Please refer to https://docs.klaytn.com/klaytn/design/transactions/fee-delegation#txtypefeedelegatedvaluetransfer to see more detail.
 * @class
 */
export default class FeeDelegatedValueTransfer extends AbstractFeeDelegatedTransaction {
    /**
     * decodes the RLP-encoded string and returns a FeeDelegatedValueTransfer transaction instance.
     *
     * @param {string} rlpEncoded The RLP-encoded fee delegated value transfer transaction.
     * @return {FeeDelegatedValueTransfer}
     */
    static decode(rlpEncoded: string): FeeDelegatedValueTransfer

    /**
     * Creates a fee delegated value transfer transaction.
     * @constructor
     * @param {object|string} createTxObj - The parameters to create a FeeDelegatedValueTransfer transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                                      The object can define `from`, `to`, `value`, `nonce`, `gas`, `gasPrice`, `signatures`, `feePayer`, `feePayerSignatures` and `chainId`.
     */
    constructor(createTxObj: object | string)

    /**
     * @type {string}
     */
    get to(): string

    set to(address: string)

    /**
     * @type {string}
     */
    get value(): string

    set value(val: string)

    /**
     * Returns the RLP-encoded string of this transaction (i.e., rawTransaction).
     * @return {string}
     */
    getRLPEncoding(): string

    /**
     * Returns the RLP-encoded transaction string to make the signature of this transaction.
     * @return {string}
     */
    getCommonRLPEncodingForSignature(): string
}
