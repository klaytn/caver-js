import AbstractTransaction, { CreateTransactionOptions } from '../abstractTransaction'

export default class ChainDataAnchoring extends AbstractTransaction {
    constructor(createTxObj: string | CreateTransactionOptions)

    static create(createTxObj: string | CreateTransactionOptions): ChainDataAnchoring
    static decode(rlpEncoded: string): ChainDataAnchoring
    getRLPEncoding(): string
    getCommonRLPEncodingForSignature(): string

    get input(): string
    set input(input)
}