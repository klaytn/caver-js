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

import { TransactionReceipt } from '../../caver-core/src'
import { RequestManager } from '../../caver-core-requestmanager/src'

export interface MethodOptions {
    name: string
    call: string
    accounts?: any // Klay.accounts
    defaultAccount?: string | null // Account
    defaultBlock?: string | number
    extraFormatters?: {
        receiptFormatter?: (receipt: TransactionReceipt) => any
        contractDeployFormatter?: (receipt: TransactionReceipt) => any
    }
    hexCall?: string
    inputFormatter?: Array<() => void | null>
    outputFormatter?: () => void
    outputFormatterDisable?: boolean
    params?: number
    requestManager?: RequestManager
    transformPayload?: () => void
}

export class Method {
    constructor(options: MethodOptions)

    name: string
    call: string
    hexCall: string
    params: number
    inputFormatter: Array<() => void | null>
    outputFormatter: () => void
    transformPayload: () => void
    extraFormatters: {
        receiptFormatter?: (receipt: TransactionReceipt) => any
        contractDeployFormatter?: (receipt: TransactionReceipt) => any
    }
    requestManager: RequestManager
    accounts: any
    defaultBlock: string | number
    defaultAccount: string | null
    outputFormatterDisable: boolean

    setRequestManager(requestManager: RequestManager, accounts: any): void
    createFunction(requestManager: RequestManager, accounts: any): Function
    attachToObject(obj: object): void
    getCall(args: any): string
    extractCallback(args: any): Function | null
    validateArgs(args: any): void
    formatInput(args: any): any[]
    formatOutput(result: any): any
    toPayload(args: any[]): any
    buildCall(): (...args: any[]) => any
    request(...args: any[]): any
}
