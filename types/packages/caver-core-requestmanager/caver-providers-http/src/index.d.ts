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

import { XMLHttpRequest } from 'xhr2-cookies'
import * as http from 'http'
import * as https from 'https'
import { JsonRpcResponse } from '../../../caver-core-helpers/src'

export interface HttpHeader {
    name: string
    value: string
}

export interface HttpProviderAgent {
    baseUrl?: string
    http?: http.Agent
    https?: https.Agent
}

export interface HttpProviderOptions {
    withCredentials?: boolean
    timeout?: number
    headers?: HttpHeader[]
    agent?: HttpProviderAgent
    keepAlive?: boolean
}

export class HttpProvider {
    constructor(host: string, options?: HttpProviderOptions)

    host: string
    connected: boolean
    withCredentials: boolean
    timeout: number
    headers?: HttpHeader[]
    agent?: HttpProviderAgent

    _prepareRequest(): XMLHttpRequest
    send(payload: object, callback?: (error: Error | null, result: JsonRpcResponse | undefined) => void): void
    supportsSubscriptions(): boolean
    disconnect(): boolean
}
