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

export default class WebsocketProvider {
    constructor(url: string, options?: object)

    url: string
    _customTimeout: number
    headers: object
    protocol: string
    reconnectOptions: object
    clientConfig: object
    requestOptions: any
    DATA: 'data'
    CLOSE: 'close'
    ERROR: 'error'
    CONNECT: 'connect'
    RECONNECT: 'reconnect'
    connection: object
    requestQueue: Map<any, any>
    responseQueue: Map<any, any>
    reconnectAttempts: number
    reconnecting: boolean

    connect(): void
    _onMessage(e: object): void
    _onConnect(): void
    _onClose(event: object): void
    _addSocketListeners(): void
    _removeSocketListeners(): void
    send(payload: object, callback?: Function): void
    reset(): void
    disconnect(code: number, reason: string): void
    supportsSubscriptions(): boolean
    reconnect(): void

    get connected(): boolean
}
