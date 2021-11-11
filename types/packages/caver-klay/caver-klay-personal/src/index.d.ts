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

import { DeprecatedNetRPC } from '../../../caver-net/src'
import RpcCallToMethod from '../../../caver-rtm/src'
import { BlockNumber } from '../../../caver-core/src'

export class Personal {
    constructor(...args: any[])

    net: DeprecatedNetRPC

    getAccounts: RpcCallToMethod['personal_listAccounts']
    newAccount: RpcCallToMethod['personal_newAccount']
    unlockAccount: RpcCallToMethod['personal_unlockAccount']
    lockAccount: RpcCallToMethod['personal_lockAccount']
    importRawKey: RpcCallToMethod['personal_importRawKey']
    sendTransaction: RpcCallToMethod['personal_sendTransaction']
    signTransaction: RpcCallToMethod['personal_signTransaction']
    sign: RpcCallToMethod['personal_sign']
    ecRecover: RpcCallToMethod['personal_ecRecover']
    replaceRawKey: RpcCallToMethod['personal_replaceRawKey']
    sendValueTransfer: RpcCallToMethod['personal_sendValueTransfer']
    sendAccountUpdate: RpcCallToMethod['personal_sendAccountUpdate']

    defaultAccount: string
    defaultBlock: BlockNumber
    private _defaultAccount: string
    private _defaultBlock: BlockNumber
}
