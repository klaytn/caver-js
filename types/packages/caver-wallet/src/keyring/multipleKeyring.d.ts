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

import { SignedMessage } from '..'
import { Account, WeightedMultiSigOptions, WeightedMultiSigOptionsObject } from '../../../caver-account/src'
import { EncryptedKeystoreV4Json, EncryptionOptions } from '../../../caver-core/src'
import { PrivateKey } from './privateKey'
import { SignatureData } from './signatureData'

export class MultipleKeyring {
    constructor(address: string, keys: string[] | PrivateKey[])

    getPublicKey(compressed?: boolean): string[]
    copy(): MultipleKeyring
    sign(txSigHash: string, chainId: string | number, role: number, index?: number): SignatureData | SignatureData[]
    ecsign(hash: string, role: number, index?: number): SignatureData | SignatureData[]
    signMessage(message: string, role: number, index?: number): SignedMessage
    getKeyByRole(role: number): PrivateKey[]
    toAccount(options?: WeightedMultiSigOptions | WeightedMultiSigOptionsObject): Account
    encrypt(password: string, options?: EncryptionOptions): EncryptedKeystoreV4Json
    isDecoupled(): boolean

    address: string
    keys: PrivateKey[]
    private _address: string
    private _keys: PrivateKey[]
}
