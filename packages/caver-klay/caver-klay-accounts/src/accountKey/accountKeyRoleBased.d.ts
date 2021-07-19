export interface RoleBasedKeyObject {
    roleTransactionKey?: object
    roleAccountUpdateKey?: object
    roleFeePayerKey?: object
    transactionKey?: string | string[]
    updateKey?: string | string[]
    feePayerKey?: string | string[]
}

export default class AccountKeyRoleBased {
    constructor(keyObj: RoleBasedKeyObject | AccountKeyRoleBased)

    type: string

    toPublicKey(toPublicKeyFunc: Function): RoleBasedKeyObject
    update(keys: RoleBasedKeyObject): void

    get defaultKey(): string
    get keys(): RoleBasedKeyObject
    get transactionKey(): string[]
    get updateKey(): string
    get feePayerKey(): string[]
}