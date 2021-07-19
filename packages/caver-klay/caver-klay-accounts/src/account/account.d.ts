import AccountKeyMultiSig from '../accountKey/accountKeyMultiSig'
import AccountKeyPublic from '../accountKey/accountKeyPublic'
import AccountKeyRoleBased from '../accountKey/accountKeyRoleBased'

type AccountKey =
    | AccountKeyPublic
    | AccountKeyMultiSig
    | AccountKeyRoleBased

export default class Account {
    constructor(address: string, accountKey: string | string[] | object)

    static fromObject(obj: object): Account
    static isAccountKey(accountKey: any): boolean
    toPublicKey(toPublicKeyFunc: Function): any

    get address(): string
    set address(addressInput)
    get accountKey(): AccountKey
    set accountKey(accountKeyInput)
    get privateKey(): string

    get keys(): string
    get accountKeyType(): string
    get transactionKey(): string
    get updateKey(): string
    get feePayerKey(): string
}