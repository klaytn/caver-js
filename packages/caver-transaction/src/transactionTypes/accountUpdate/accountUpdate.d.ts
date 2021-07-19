import Account from '../../../../caver-account/src'
import AbstractTransaction, { CreateTransactionOptions } from '../abstractTransaction'

export default class AccountUpdate extends AbstractTransaction {
    constructor(createTxObj: string | CreateTransactionOptions)

    static create(createTxObj: string | CreateTransactionOptions): AccountUpdate
    static decode(rlpEncoded: string): AccountUpdate
    getRLPEncoding(): string
    getCommonRLPEncodingForSignature(): string

    get account(): Account
    set account(acct)
}