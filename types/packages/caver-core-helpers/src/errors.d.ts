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

export interface txErrorTable {
    '0x2': string
    '0x3': string
    '0x4': string
    '0x5': string
    '0x6': string
    '0x7': string
    '0x8': string
    '0x9': string
    '0xa': string
    '0xb': string
    '0xc': string
    '0xd': string
    '0xe': string
    '0xf': string
    '0x10': string
    '0x11': string
    '0x12': string
    '0x13': string
    '0x14': string
    '0x15': string
    '0x16': string
    '0x17': string
    '0x18': string
    '0x19': string
    '0x1a': string
    '0x1b': string
    '0x1c': string
    '0x1d': string
    '0x1e': string
}

export interface Errors {
    txErrorTable: txErrorTable

    needNameCallPropertyToCreateMethod: Error
    blockHashNull: Error
    contractCouldntBeStored: Error
    receiptDidntContainContractAddress: Error

    InvalidConnection(host: string): Error
    RequestFailed(err: string): Error
    ConnectionTimeout(ms: string): Error
    ConnectionNotOpenError(event: any): Error
    MaxAttemptsReachedOnReconnectingError(): Error
    PendingRequestsOnReconnectingError(): Error
    InvalidProvider(): Error
    InvalidNumberOfParams(got: any, expected: any, method: any): Error
    ErrorResponse(result: object): Error
    InvalidResponse(result: object | null): Error
    transactionReverted(receiptJSON: string): Error
    transactionRanOutOfGas(receiptJSON: string): Error
    invalidGasLimit(): Error
    invalidData(): Error
    notAllowedZeroGas(): Error
}
