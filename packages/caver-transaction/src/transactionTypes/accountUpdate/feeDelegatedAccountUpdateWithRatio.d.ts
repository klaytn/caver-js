import Account from '../../../../caver-account/src'
import AbstractFeeDelegatedWithRatioTransaction from '../abstractFeeDelegatedWithRatioTransaction'
import { CreateTransactionOptions } from '../abstractTransaction'

export default class FeeDelegatedAccountUpdateWithRatio extends AbstractFeeDelegatedWithRatioTransaction {
    constructor(createTxObj: string | CreateTransactionOptions)

    static create(createTxObj: string | CreateTransactionOptions): FeeDelegatedAccountUpdateWithRatio
    static decode(rlpEncoded: string): FeeDelegatedAccountUpdateWithRatio
    getRLPEncoding(): string
    getCommonRLPEncodingForSignature(): string

    get account(): Account
    set account(acct)
}