type MultiSigKeys = 
    | string[]
    | AccountKeyMultiSig

export default class AccountKeyMultiSig {
    constructor(keys: MultiSigKeys)

    type: string

    toPublicKey(toPublicKeyFunc: Function): string[]
    update(keys: MultiSigKeys): void

    get defaultKey(): string
    get keys(): string[]
    get transactionKey(): string[]
    get updateKey(): string[]
    get feePayerKey(): string[]
}