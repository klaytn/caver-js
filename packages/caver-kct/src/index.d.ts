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