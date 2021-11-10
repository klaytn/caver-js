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
import { JsonRpcPayload, JsonRpcResponse } from '../../../caver-core-helpers/src/index'

export class IpcProvider {
    constructor(path: string, net: net.Server)

    responseCallbacks: object
    notificationCallbacks: Function[]
    path: string
    connected: boolean
    connection: any

    addDefaultEvents(): void
    supportsSubscriptions(): boolean
    send(payload: JsonRpcPayload, callback: (error: Error | null, result?: JsonRpcResponse) => void): void
    on(type: string, callback?: () => void): void
    once(type: string, callback?: () => void): void
    removeListener(type: string, callback?: () => void): void
    removeAllListeners(type: string): void
    reset(): void
    reconnect(): void
}
