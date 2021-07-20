/*
    Copyright 2021 The caver-js Authors
    This file is part of the caver-js library.

    The caver-js library is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    The caver-js library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with the caver-js. If not, see <http://www.gnu.org/licenses/>.
*/

import BigNumber from 'bignumber.js'
import { AccountKey } from '../../caver-account/src'
import { Amount } from '../../caver-kct/src/kip7'
import { ReceiptObject, TransactionObject } from '../../caver-rtm/src'
import Utils from '../../caver-utils/src'

export type AccountKeyFormat = AccountKeyObject | AccountKey

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
