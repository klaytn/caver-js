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

import { EncryptOptions } from 'ethers/lib/utils'
import { MessageSigned } from '..'
import Account from '../../../caver-account/src'
import { WeightedMultiSigOptionsObject } from '../../../caver-account/src/accountKey/weightedMultiSigOptions'
import { Keystore } from './keyringHelper'
import PrivateKey from './privateKey'

export default class RoleBasedKeyring {
    constructor(address: string, keys: string[][] | PrivateKey[][])

    getPublicKey(compressed?: boolean): string[][]
    copy(): RoleBasedKeyring
    sign(transactionHash: string, chainId: string | number, role: number, index?: number): string[] | string[][]
    signMessage(message: string, role: number, index?: number): MessageSigned
    getKeyByRole(role: number): PrivateKey[]
    toAccount(options?: WeightedMultiSigOptionsObject | WeightedMultiSigOptionsObject[]): Account
    encrypt(password: string, options?: EncryptOptions): Keystore
    isDecoupled(): boolean

    get address(): string
    set address(addressInput)
    get keys(): PrivateKey[][]
    set keys(keyInput)
    get roleTransactionKey(): PrivateKey[]
    get roleAccountUpdateKey(): PrivateKey[]
    get roleFeePayerKey(): PrivateKey[]
}
