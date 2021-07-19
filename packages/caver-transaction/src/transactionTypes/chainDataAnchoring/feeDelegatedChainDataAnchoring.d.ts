import AbstractFeeDelegatedTransaction from '../abstractFeeDelegatedTransaction'
import { CreateTransactionOptions } from '../abstractTransaction'

export default class FeeDelegatedChainDataAnchoring extends AbstractFeeDelegatedTransaction {
    constructor(createTxObj: string | CreateTransactionOptions)

    static create(createTxObj: string | CreateTransactionOptions): FeeDelegatedChainDataAnchoring
    static decode(rlpEncoded: string): FeeDelegatedChainDataAnchoring
    getRLPEncoding(): string
    getCommonRLPEncodingForSignature(): string

    get input(): string
    set input(input)
}