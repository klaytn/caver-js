import AbstractFeeDelegatedTransaction from '../abstractFeeDelegatedTransaction'
import { CreateTransactionOptions } from '../abstractTransaction'

export default class FeeDelegatedSmartContractDeploy extends AbstractFeeDelegatedTransaction {
    constructor(createTxObj: string | CreateTransactionOptions)

    static create(createTxObj: string | CreateTransactionOptions): FeeDelegatedSmartContractDeploy
    static decode(rlpEncoded: string): FeeDelegatedSmartContractDeploy
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