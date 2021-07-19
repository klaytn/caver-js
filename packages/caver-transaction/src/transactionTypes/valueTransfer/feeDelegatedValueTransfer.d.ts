import AbstractFeeDelegatedTransaction from '../abstractFeeDelegatedTransaction'
import { CreateTransactionOptions } from '../abstractTransaction'

export default class FeeDelegatedValueTransfer extends AbstractFeeDelegatedTransaction {
    constructor(createTxObj: string | CreateTransactionOptions)

    static create(createTxObj: string | CreateTransactionOptions): FeeDelegatedValueTransfer
    static decode(rlpEncoded: string): FeeDelegatedValueTransfer
    getRLPEncoding(): string
    getCommonRLPEncodingForSignature(): string

    get to(): string
    set to(address)
    get value(): string
    set value(val)
}