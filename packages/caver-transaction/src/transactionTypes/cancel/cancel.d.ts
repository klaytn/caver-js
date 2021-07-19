import AbstractTransaction, { CreateTransactionOptions } from '../abstractTransaction'

export default class Cancel extends AbstractTransaction {
    constructor(createTxObj: string | CreateTransactionOptions)

    static create(createTxObj: string | CreateTransactionOptions): Cancel
    static decode(rlpEncoded: string): Cancel
    getRLPEncoding(): string
    getCommonRLPEncodingForSignature(): string
}