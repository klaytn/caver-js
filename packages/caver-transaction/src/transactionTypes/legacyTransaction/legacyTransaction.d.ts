import AbstractTransaction, { CreateTransactionOptions } from '../abstractTransaction'

export default class LegacyTransaction extends AbstractTransaction {
    constructor(createTxObj: CreateTransactionOptions)

    static create(createTxObj: CreateTransactionOptions): LegacyTransaction
    static decode(rlpEncoded: string): LegacyTransaction
    appendSignatures(sig: string[] | string[][]): void
    getRLPEncoding(): string
    getRLPEncodingForSignature(): string
    getCommonRLPEncodingForSignature(): string
    recoverPublicKeys(): string[]

    get to(): string
    set to(address: string)
    get value(): string
    set value(val)
    get input(): string
    set input(input)
    get data(): string
    set data(data)
}