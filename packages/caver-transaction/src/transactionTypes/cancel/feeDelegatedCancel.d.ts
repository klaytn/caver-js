import AbstractFeeDelegatedTransaction from '../abstractFeeDelegatedTransaction'
import { CreateTransactionOptions } from '../abstractTransaction'

export default class FeeDelegatedCancel extends AbstractFeeDelegatedTransaction {
    constructor(createTxObj: string | CreateTransactionOptions)

    static create(createTxObj: string | CreateTransactionOptions): FeeDelegatedCancel
    static decode(rlpEncoded: string): FeeDelegatedCancel
    getRLPEncoding(): string
    getCommonRLPEncodingForSignature(): string
}