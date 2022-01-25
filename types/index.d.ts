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
import { ABI } from './packages/caver-abi/src'
import { Account } from './packages/caver-account/src'
import { Contract as BaseContract } from './packages/caver-contract/src'
import { CoreHelpers, Formatters } from './packages/caver-core-helpers/src'
import { Method } from './packages/caver-core-method/src'
import { HttpProvider, IpcProvider, WebsocketProvider } from './packages/caver-core-requestmanager/src'
import { IPFS } from './packages/caver-ipfs/src'
import { KCT } from './packages/caver-kct/src'
import { DeprecatedKlayRPC } from './packages/caver-klay/src'
import { Middleware } from './packages/caver-middleware/src'
import { RPC } from './packages/caver-rpc/src'
import { Validator } from './packages/caver-validator/src'
import { TransactionModule as Transaction } from './packages/caver-transaction/src'
import { Utils } from './packages/caver-utils/src'
import { KeyringContainer, IWallet, KeyringFactory } from './packages/caver-wallet/src'

export * from './packages/caver-abi/src'
export * from './packages/caver-account/src'
export * from './packages/caver-contract/src'
export * from './packages/caver-core/src'
export * from './packages/caver-core-helpers/src'
export * from './packages/caver-core-method/src'
export * from './packages/caver-core-requestmanager/src'
export * from './packages/caver-ipfs/src'
export * from './packages/caver-core-subscriptions/src'
export * from './packages/caver-kct/src'
export * from './packages/caver-klay/src'
export * from './packages/caver-net/src'
export * from './packages/caver-rpc/src'
export * from './packages/caver-transaction/src'
export * from './packages/caver-utils/src'
export * from './packages/caver-validator/src'
export * from './packages/caver-wallet/src'

export class Contract extends BaseContract {
    static create(...args: ConstructorParameters<typeof BaseContract>): Contract
}

export type RequestProvider = string | WebsocketProvider | HttpProvider | IpcProvider

export interface Providers {
    WebsocketProvider: typeof WebsocketProvider
    HttpProvider: typeof HttpProvider
    IpcProvider: typeof IpcProvider
}

export class AbstractCaver {
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
    klay: DeprecatedKlayRPC
    rpc: RPC
    validator: Validator
    middleware: Middleware
    ipfs: IPFS
    contract: typeof Contract
}

export default class Caver extends AbstractCaver {
    wallet: KeyringContainer
}
