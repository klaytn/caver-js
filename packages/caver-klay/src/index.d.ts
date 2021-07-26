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

import ABI from '../../caver-abi/src'
import Contract from '../../caver-contract/src'
import KIP17 from '../../caver-kct/src/kip17'
import KIP7 from '../../caver-kct/src/kip7'
import Net from '../../caver-net/src'
import KlayRPC from '../../caver-rpc/src/klay'
import Utils from '../../caver-utils/src'
import Accounts from '../caver-klay-accounts/src'
import { KeyForUpdateObject } from '../caver-klay-accounts/src/account/accountForUpdate'
import Personal from '../caver-klay-personal/src'
import { getNetworkType } from './getNetworkType'

export class KlayContract extends Contract {}

export class KlayNet extends Net {
    getNetworkType: typeof getNetworkType
}

export interface DecodedFromRawTransactionObject extends KeyForUpdateObject {
    type: string
    nonce: string
    gasPrice: string
    gas: string
    to?: string
    value?: string
    from: string
    data?: string
    humanReadable?: boolean
    feeRatio?: string
    codeFormat?: string
    v: string
    r: string
    s: string
    signatures: string[] | string[][]
    feePayer?: string
    payerV?: string
    payerR?: string
    payerS?: string
    feePayerSignatures?: string[][]
}

export default class Klay extends KlayRPC {
    decodeTransaction(rawTransaction: string, type?: string): DecodedFromRawTransactionObject | KeyForUpdateObject
    net: KlayNet
    accounts: Accounts
    personal: Personal
    Contract: KlayContract
    /** @deprecated */
    KIP7: typeof KIP7
    KIP17: typeof KIP17
    Iban: typeof Utils['Iban']
    abi: ABI

    get defaultAccount(): string
    set defaultAccount(val)
    get defaultBlock(): string | number
    set defaultBlock(val)
}
