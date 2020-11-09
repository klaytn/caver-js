
import AbstractTransaction from '../abstractTransaction'

type createTxObj = {
    value: string
    from: string
    to: string
    gas: string
    signatures?: Array<any>
    nonce?: string
    gasPrice?: string
    chainId?: string
}

/**
 * Represents a value transfer transaction.
 * Please refer to https://docs.klaytn.com/klaytn/design/transactions/basic#txtypevaluetransfer to see more detail.
 * @class
 */
export interface ValueTransfer_I extends AbstractTransaction {
    /**
     * decodes the RLP-encoded string and returns a ValueTransfer transaction instance.
     *
     * @param {string} rlpEncoded The RLP-encoded value transfer transaction.
     * @return {ValueTransfer}
     */
    decode(rlpEncoded: string): ValueTransfer

    /**
     * Creates a value transfer transaction.
     * @constructor
     * @param {object} createTxObj - The parameters to create a ValueTransfer transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                                      The object can define `from`, `to`, `value`, `nonce`, `gas`, `gasPrice`, `signatures` and `chainId`.
     */
    new(createTxObj: createTxObj): ValueTransfer
}


/**
 * Represents a value transfer transaction.
 * Please refer to https://docs.klaytn.com/klaytn/design/transactions/basic#txtypevaluetransfer to see more detail.
 * @class
 */
export default class ValueTransfer extends AbstractTransaction {
    /**
     * decodes the RLP-encoded string and returns a ValueTransfer transaction instance.
     *
     * @param {string} rlpEncoded The RLP-encoded value transfer transaction.
     * @return {ValueTransfer}
     */
    static decode(rlpEncoded: string): ValueTransfer

    /**
     * Creates a value transfer transaction.
     * @constructor
     * @param {object} createTxObj - The parameters to create a ValueTransfer transaction. This can be an object defining transaction information, or it can be an RLP-encoded string.
     *                                      If it is an RLP-encoded string, decode it to create a transaction instance.
     *                                      The object can define `from`, `to`, `value`, `nonce`, `gas`, `gasPrice`, `signatures` and `chainId`.
     */
    constructor(createTxObj: createTxObj)

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
     * Returns the RLP-encoded string to make the signature of this transaction.
     * @return {string}
     */
    getCommonRLPEncodingForSignature(): string
}

