import BigNumber from 'bignumber.js'
import { AccountKey } from '../../caver-account/src'
import { Amount } from '../../caver-kct/src/kip7'
import { ReceiptObject, TransactionObject } from '../../caver-rtm/src'
import Utils from '../../caver-utils/src'

export type AccountKeyFormat =
    | AccountKeyObject
    | AccountKey

export interface AccountKeyObject {
    keyType: number
    nonce?: number
    key?: AccountKeyValueObject | AccountKeyValueObject[]
}

export interface AccountKeyValueObject {
    weight?: number
    keyType?: number
    length?: number
    x?: string
    y?: string
    threshold?: number
    key?: AccountKeyValueObject
    keys?: AccountKeyValueObject[]
}

export default interface IFormatters {
    inputDefaultBlockNumberFormatter(blockNumber: string): string
    inputBlockNumberFormatter(blockNumber: string): string
    inputCallFormatter(options: object): object
    inputTransactionFormatter(options: object): object
    inputPersonalTransactionFormatter(options: object): object
    inputAddressFormatter(address: string): string
    inputPostFormatter(post: object): object
    inputLogFormatter(options: object): object
    inputSignFormatter(data: string): string
    inputRawKeyFormatter(rawKey: string): string
    inputAccountKeyFormatter(accountKey: AccountKey): AccountKeyObject
    outputBigNumberFormatter(number: Amount): BigNumber
    outputTransactionFormatter(tx: TransactionObject): TransactionObject
    outputTransactionReceiptFormatter(receipt: ReceiptObject): ReceiptObject
    outputBlockFormatter(block: object): object
    outputLogFormatter(log: object): object
    outputPostFormatter(post: object): object
    outputSyncingFormatter(result: object): object
    outputVotingPowerFormatter(options: string): string
    toBoolean(v: any): boolean
    toChecksumAddress: typeof Utils['toChecksumAddress']
    hexToNumber: typeof Utils['hexToNumber']
    numberToHex: typeof Utils['numberToHex']
}