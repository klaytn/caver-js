import AbstractTransaction, { CreateTransactionOptions } from '../abstractTransaction'

export default class SmartContractExecution extends AbstractTransaction {
    constructor(createTxObj: string | CreateTransactionOptions)

    static create(createTxObj: string | CreateTransactionOptions): SmartContractExecution
    static decode(rlpEncoded: string): SmartContractExecution
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