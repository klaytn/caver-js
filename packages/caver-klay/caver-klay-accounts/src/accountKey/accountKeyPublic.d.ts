type PublicKey =
    | string
    | AccountKeyPublic


export default class AccountKeyPublic {
    constructor(key: PublicKey)

    type: string

    toPublicKey(toPublicKeyFunc: Function): PublicKey
    update(keys: PublicKey): void

    get defaultKey(): string
    get keys(): string
    get transactionKey(): string
    get updateKey(): string
    get feePayerKey(): string
}