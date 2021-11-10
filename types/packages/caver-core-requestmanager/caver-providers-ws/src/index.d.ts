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

import { w3cwebsocket } from 'websocket'
import { JsonRpcPayload, JsonRpcResponse, WebsocketProviderOptions, ReconnectOptions } from '../../../caver-core-helpers/src/index'

export interface RequestItem {
    payload: JsonRpcPayload
    callback: (error: any, result: any) => void
}

export class WebsocketProvider {
    constructor(url: string, options?: WebsocketProviderOptions)

    url: string
    headers: object
    protocol: string
    reconnectOptions: ReconnectOptions
    connection: w3cwebsocket
    requestQueue: Map<number, RequestItem>
    responseQueue: Map<number, RequestItem>
    reconnectAttempts: number
    reconnecting: boolean
    connected: boolean

    clientConfig: object
    requestOptions: object

    DATA: string
    CLOSE: string
    ERROR: string
    CONNECT: string
    RECONNECT: string

    connect(): void
    send(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
    on(type: string, callback: () => void): void
    once(type: string, callback: () => void): void
    removeListener(type: string, callback: () => void): void
    removeAllListeners(type: string): void
    reset(): void
    disconnect(code: number, reason: string): void
    supportsSubscriptions(): boolean
    reconnect(): void
}
