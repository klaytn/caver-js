import { WeightedMultiSigOptionsObject } from '../../../../caver-account/src/accountKey/weightedMultiSigOptions'

export interface KeyForUpdateObject {
    legacyKey: boolean
    failKey: boolean
    publicKey: string
    multisig: {
        threshold: number
        keys: {
            weight: number
            publicKey: string
        }[]
    }
    roleTransactionKey: KeyForUpdateObject
    roleAccountUpdateKey: KeyForUpdateObject
    roleFeePayerKey: KeyForUpdateObject
}

export default class AccountForUpdate {
    constructor(address: string, keyForUpdate: string | string[] | object, options: WeightedMultiSigOptionsObject)

    address: string
    keyForUpdate: KeyForUpdateObject

    fillUpdateObject(updateObject: object): void
}