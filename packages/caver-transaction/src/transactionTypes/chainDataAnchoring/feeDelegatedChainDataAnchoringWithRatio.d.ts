import AbstractFeeDelegatedWithRatioTransaction from '../abstractFeeDelegatedWithRatioTransaction'
import { CreateTransactionOptions } from '../abstractTransaction'

export default class FeeDelegatedChainDataAnchoringWithRatio extends AbstractFeeDelegatedWithRatioTransaction {
    constructor(createTxObj: string | CreateTransactionOptions)

    static create(createTxObj: string | CreateTransactionOptions): FeeDelegatedChainDataAnchoringWithRatio
    static decode(rlpEncoded: string): FeeDelegatedChainDataAnchoringWithRatio
    getRLPEncoding(): string
    getCommonRLPEncodingForSignature(): string

    get input(): string
    set input(input)
}