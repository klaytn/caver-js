import Account from '../../../../caver-account/src'
import AbstractFeeDelegatedTransaction from '../abstractFeeDelegatedTransaction'
import { CreateTransactionOptions } from '../abstractTransaction'

export default class FeeDelegatedAccountUpdate extends AbstractFeeDelegatedTransaction {
    constructor(createTxObj: string | CreateTransactionOptions)

    static create(createTxObj: string | CreateTransactionOptions): FeeDelegatedAccountUpdate
    static decode(rlpEncoded: string): FeeDelegatedAccountUpdate
    getRLPEncoding(): string
    getCommonRLPEncodingForSignature(): string

    get account(): Account
    set account(acct)
}