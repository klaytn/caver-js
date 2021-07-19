import AbstractFeeDelegatedTransaction from '../abstractFeeDelegatedTransaction'
import { CreateTransactionOptions } from '../abstractTransaction'

export default class FeeDelegatedValueTransferMemo extends AbstractFeeDelegatedTransaction {
    constructor(createTxObj: string | CreateTransactionOptions)

    static create(createTxObj: string | CreateTransactionOptions): FeeDelegatedValueTransferMemo
    static decode(rlpEncoded: string): FeeDelegatedValueTransferMemo
    getRLPEncoding(): string
    getCommonRLPEncodingForSignature(): string

    get to(): string
    set to(address)
    get value(): string
    set value(val)
    get input(): string
    set input(input)
    get data(): string
    set data(data)
}