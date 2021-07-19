import AbstractFeeDelegatedWithRatioTransaction from '../abstractFeeDelegatedWithRatioTransaction'
import { CreateTransactionOptions } from '../abstractTransaction'

export default class FeeDelegatedCancelWithRatio extends AbstractFeeDelegatedWithRatioTransaction {
    constructor(createTxObj: string | CreateTransactionOptions)

    static create(createTxObj: string | CreateTransactionOptions): FeeDelegatedCancelWithRatio
    static decode(rlpEncoded: string): FeeDelegatedCancelWithRatio
    getRLPEncoding(): string
    getCommonRLPEncodingForSignature(): string
}