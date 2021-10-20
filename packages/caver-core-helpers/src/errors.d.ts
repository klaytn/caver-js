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

export default interface IErrors {
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
    needNameCallPropertyToCreateMethod: Error
    blockHashNull: Error
    contractCouldntBeStored: Error
    receiptDidntContainContractAddress: Error
    transactionReverted(receiptJSON: string): Error
    transactionRanOutOfGas(receiptJSON: string): Error
    invalidGasPrice(): Error
    invalidGasLimit(): Error
    invalidData(): Error
    notAllowedZeroGas(): Error
    txErrorTable: {[key: string]: string}
}
