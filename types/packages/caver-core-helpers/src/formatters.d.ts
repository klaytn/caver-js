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
import AccountKeyLegacy from '../../caver-account/src/accountKey/accountKeyLegacy'
import AccountKeyPublic from '../../caver-account/src/accountKey/accountKeyPublic'
import AccountKeyFail from '../../caver-account/src/accountKey/accountKeyFail'
import AccountKeyWeightedMultiSig from '../../caver-account/src/accountKey/accountKeyWeightedMultiSig'
import AccountKeyRoleBased from '../../caver-account/src/accountKey/accountKeyRoleBased'
import { AccountKey } from '../../caver-account/src'
import { AccountKeyForRPC, TransactionForRPC, TransactionReceipt } from '../../caver-rpc/src/klay'
import Utils from '../../caver-utils/src'

export default interface formatters {
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
    inputAccountKeyFormatter(accountKey: AccountKey): AccountKeyForRPC
    outputBigNumberFormatter(number: string | number | BigNumber): BigNumber
    outputTransactionFormatter(tx: TransactionForRPC): TransactionForRPC
    outputTransactionReceiptFormatter(receipt: TransactionReceipt): TransactionReceipt
    outputBlockFormatter(block: object): object
    outputLogFormatter(log: object): object
    outputPostFormatter(post: object): object
    outputSyncingFormatter(result: object): object
    outputVotingPowerFormatter(options: string): string
    toBoolean(v: any): boolean
    toChecksumAddress(address: string): string
    hexToNumber(value: any): number
    numberToHex(value: any): string
}
