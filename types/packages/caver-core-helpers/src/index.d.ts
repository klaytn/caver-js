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

import { Constants } from './constants'
import { Errors } from './errors'
import { Formatters } from './formatters'
import { PayloadTransformer } from './payloadTransformer'
import { ValidateFunction } from './validateFunction'

export * from './constants'
export * from './errors'
export * from './formatters'
export * from './payloadTransformer'
export * from './validateFunction'

export interface JsonRpcPayload {
    jsonrpc: string
    method: string
    params: any[]
    id?: string | number
}

export interface JsonRpcResponse {
    jsonrpc: string
    id: number
    result?: any
    error?: string
}

export interface WebsocketProviderOptions {
    host?: string
    timeout?: number
    reconnectDelay?: number
    headers?: any
    protocol?: string
    clientConfig?: object
    requestOptions?: any
    origin?: string
    reconnect?: ReconnectOptions
}

export interface ReconnectOptions {
    auto: boolean
    delay: number
    maxAttempts: boolean
    onTimeout: boolean
}

export interface CoreHelpers {
    errors: Errors
    formatters: Formatters
    payloadTransformer: PayloadTransformer
    constants: Constants
    validateFunction: ValidateFunction
}
