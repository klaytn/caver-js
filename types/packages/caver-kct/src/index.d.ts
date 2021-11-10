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

import { IWallet } from '../../caver-wallet/src'
import { AbiItem } from '../../caver-utils/src'
import { KIP13 } from './kip13'
import { KIP17 as BaseKIP17, KIP17DeployParams } from './kip17'
import { KIP37 as BaseKIP37 } from './kip37'
import { KIP7 as BaseKIP7, KIP7DeployParams } from './kip7'
import { Contract, SendOptions, SendOptionsWithFormatter } from '../../caver-contract/src'

export * from './kip13'

export class KIP7 extends BaseKIP7 {
    static create(abi?: AbiItem[]): KIP7
    static create(tokenAddress: string, abi?: AbiItem[]): KIP7

    static deploy(tokenInfo: KIP7DeployParams, sendOptions: SendOptionsWithFormatter): Promise<any>
    static deploy(tokenInfo: KIP7DeployParams, sendOptions: string | SendOptions): Promise<KIP7>
    static deploy(tokenInfo: KIP7DeployParams, sendOptions: SendOptionsWithFormatter, wallet: IWallet): Promise<any>
    static deploy(tokenInfo: KIP7DeployParams, sendOptions: string | SendOptions, wallet: IWallet): Promise<KIP7>
}

export class KIP17 extends BaseKIP17 {
    static create(abi?: AbiItem[]): KIP17
    static create(tokenAddress: string, abi?: AbiItem[]): KIP17

    static deploy(tokenInfo: KIP17DeployParams, sendOptions?: SendOptionsWithFormatter): Promise<any>
    static deploy(tokenInfo: KIP17DeployParams, sendOptions?: string | SendOptions): Promise<KIP17>
    static deploy(tokenInfo: KIP17DeployParams, sendOptions: SendOptionsWithFormatter, wallet: IWallet): Promise<any>
    static deploy(tokenInfo: KIP17DeployParams, sendOptions: string | SendOptions, wallet: IWallet): Promise<KIP17>
}

export class KIP37 extends BaseKIP37 {
    static wallet: IWallet
}

export class KCT {
    constructor(...args: any[])

    kip7: typeof KIP7
    kip17: typeof KIP17
    kip37: typeof KIP37
    kip13: typeof KIP13
}
