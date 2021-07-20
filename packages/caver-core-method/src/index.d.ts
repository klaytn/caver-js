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

export interface MethodOptions {
    accounts?: string
    call: string
    defaultAccount?: string | null
    defaultBlock?: string
    extraFormatters?: any
    hexCall?: string
    inputFormatter?: [() => void | null]
    name: string
    outputFormatter?: () => void
    outputFormatterDisable?: boolean
    params?: number
    requestManager?: any
    transformPayload?: () => void
}

export default class Method {
    constructor(options: MethodOptions)

    accounts: string
    call: string
    defaultAccount: string | null
    defaultBlock: string
    extraFormatters: any
    hexCall: string
    inputFormatter: [() => void | null]
    name: string
    outputFormatter: () => void
    outputFormatterDisable: boolean
    params: number
    requestManager: any
    transformPayload: () => void

    setRequestManager(requestManager: object, accounts: object): void
    createFunction(requestManager: object, accounts: object): Function
    attachToObject(obj: object): void
    getCall(args: any[]): string
    extractCallback(args: any[]): Function | null
    validateArgs(args: any[]): void
    formatInput(args: any[]): any[]
    formatOutput(result: object): object
    toPayload(args: any[]): object
    buildCall(): object | Promise<any>
    request(args: any[]): object
}
