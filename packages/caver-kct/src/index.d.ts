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

import { Wallet } from '../../..'
import { AbiItem } from '../../caver-utils/src'
import KIP13 from './kip13'
import BaseKIP17 from './kip17'
import BaseKIP37 from './kip37'
import BaseKIP7 from './kip7'

export class KIP7 extends BaseKIP7 {
    static create(tokenAddress?: string, abi?: AbiItem[]): KIP17
}

export class KIP17 extends BaseKIP17 {
    static create(tokenAddress?: string, abi?: AbiItem[]): KIP17
}

export class KIP37 extends BaseKIP37 {
    wallet: Wallet
}

export default class KCT {
    constructor(...args: any[])

    kip7: typeof KIP7
    kip17: typeof KIP17
    kip37: typeof KIP37
    kip13: typeof KIP13
}
