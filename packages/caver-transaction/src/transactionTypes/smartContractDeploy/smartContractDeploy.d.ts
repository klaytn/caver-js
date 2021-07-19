import AbstractTransaction, { CreateTransactionOptions } from '../abstractTransaction'

export default class SmartContractDeploy extends AbstractTransaction {
    constructor(createTxObj: string | CreateTransactionOptions)

    static create(createTxObj: string | CreateTransactionOptions): SmartContractDeploy
    static decode(rlpEncoded: string): SmartContractDeploy
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
    get humanReadable(): boolean
    set humanReadable(hr)
    get codeFormat(): string
    set codeFormat(cf)
}