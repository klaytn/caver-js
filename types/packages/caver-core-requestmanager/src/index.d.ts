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

import * as net from 'net'
import { WebsocketProvider } from '../caver-providers-ws/src'
import { HttpProvider } from '../caver-providers-http/src'
import { IpcProvider } from '../caver-providers-ipc/src'
import { JsonRpcResponse } from '../../caver-core-helpers/src'

export * from '../caver-providers-ws/src'
export * from '../caver-providers-http/src'
export * from '../caver-providers-ipc/src'

export type provider = WebsocketProvider | HttpProvider | IpcProvider

export class RequestManager {
    static providers: { WebsocketProvider: typeof WebsocketProvider; HttpProvider: typeof HttpProvider; IpcProvider: typeof IpcProvider }

    constructor(provider: provider, net?: net.Server)

    provider: provider
    subscriptions: object

    setProvider(p: provider, net?: net.Server): void
    send(data: object, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
    sendBatch(data: object[], callback: (error: Error | null, result?: JsonRpcResponse) => void): void
    addSubscription(id: string, name: string, type: string, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
    removeSubscription(id: string, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
    clearSubscriptions(keepIsSyncing?: boolean): void
}

export class Batch {
    constructor(requestManager: RequestManager)

    requestManager: RequestManager
    requests: object[]

    add(request: object): void
    execute(): void
}
