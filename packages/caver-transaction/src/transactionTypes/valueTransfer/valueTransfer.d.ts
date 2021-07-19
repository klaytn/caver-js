import AbstractTransaction, { CreateTransactionOptions } from '../abstractTransaction'

export default class ValueTransfer extends AbstractTransaction {
    constructor(createTxObj: string | CreateTransactionOptions)

    static create(createTxObj: string | CreateTransactionOptions): ValueTransfer
    static decode(rlpEncoded: string): ValueTransfer
    getRLPEncoding(): string
    getCommonRLPEncodingForSignature(): string

    get to(): string
    set to(address)
    get value(): string
    set value(val)
}