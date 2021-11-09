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
import ABI from './packages/caver-abi/src'
import Account from './packages/caver-account/src'
import BaseContract from './packages/caver-contract/src'
import CoreHelpers from './packages/caver-core-helpers/src'
import Formatters from './packages/caver-core-helpers/src/formatters'
import Method from './packages/caver-core-method/src'
import HttpProvider from './packages/caver-core-requestmanager/caver-providers-http/src'
import IpcProvider from './packages/caver-core-requestmanager/caver-providers-ipc/src'
import WebsocketProvider from './packages/caver-core-requestmanager/caver-providers-ws/src'
import IPFS from './packages/caver-ipfs/src'
import KCT from './packages/caver-kct/src'
import Klay from './packages/caver-klay/src'
import Middleware from './packages/caver-middleware/src'
import RPC from './packages/caver-rpc/src'
import Validator from './packages/caver-validator/src'
import Transaction from './packages/caver-transaction/src'
import Utils from './packages/caver-utils/src'
import KeyringContainer, { IWallet } from './packages/caver-wallet/src'
import KeyringFactory from './packages/caver-wallet/src/keyring/keyringFactory'

export class Contract extends BaseContract {
    static create(...args: ConstructorParameters<typeof BaseContract>): Contract
}

export type RequestProvider = string | WebsocketProvider | HttpProvider | IpcProvider

export interface Providers {
    WebsocketProvider: typeof WebsocketProvider
    HttpProvider: typeof HttpProvider
    IpcProvider: typeof IpcProvider
}

export default class Caver {
    static providers: Providers
    static utils: Utils
    static abi: ABI

    constructor(provider?: RequestProvider, net?: net.Socket)

    version: string
    utils: Utils
    abi: ABI
    formatters: Formatters
    helpers: CoreHelpers
    Method: typeof Method
    account: typeof Account
    wallet: IWallet
    transaction: Transaction
    kct: KCT
    klay: Klay
    rpc: RPC
    validator: Validator
    middleware: Middleware
    ipfs: IPFS
    contract: typeof Contract
}
