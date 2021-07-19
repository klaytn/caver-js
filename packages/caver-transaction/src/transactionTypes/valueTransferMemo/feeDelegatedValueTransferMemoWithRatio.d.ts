import AbstractFeeDelegatedWithRatioTransaction from '../abstractFeeDelegatedWithRatioTransaction'
import { CreateTransactionOptions } from '../abstractTransaction'

export default class FeeDelegatedValueTransferMemoWithRatio extends AbstractFeeDelegatedWithRatioTransaction {
    constructor(createTxObj: string | CreateTransactionOptions)

    static create(createTxObj: string | CreateTransactionOptions): FeeDelegatedValueTransferMemoWithRatio
    static decode(rlpEncoded): FeeDelegatedValueTransferMemoWithRatio
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