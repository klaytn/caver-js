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

import { Transaction } from '../../caver-transaction/src'
import { Keyring } from './keyring/keyringFactory'
import MultipleKeyring from './keyring/multipleKeyring'
import RoleBasedKeyring from './keyring/roleBasedKeyring'
import SignatureData from './keyring/signatureData'
import SingleKeyring from './keyring/singleKeyring'

export interface MessageSigned {
    message: string
    messageHash: string
    signatures: SignatureData[]
}

export default class KeyringContainer {
    constructor(keyrings?: Keyring[])

    generate(numberOfKeyrings: number, entropy?: string): string[]
    newKeyring(address: string, key: string): SingleKeyring
    newKeyring(address: string, key: string[]): MultipleKeyring
    newKeyring(address: string, key: string[][]): RoleBasedKeyring
    updateKeyring(keyring: Keyring): Keyring
    getKeyring(address: string): Keyring
    isExisted(address: string): Keyring
    add(keyring: Keyring): Keyring
    remove(address: string): boolean
    signMessage(address: string, data: string, role?: number, index?: number): SignMessageObject
    sign(address: string, transaction: Transaction, hasher?: Function): Promise<Transaction>
    sign(address: string, transaction: Transaction, index: number, hasher?: Function): Promise<Transaction>
    signAsFeePayer(address: string, transaction: Transaction, hasher?: Function): Promise<Transaction>
    signAsFeePayer(address: string, transaction: Transaction, index?: number): Promise<Transaction>
    signAsFeePayer(address: string, transaction: Transaction, index: number, hasher: Function): Promise<Transaction>

    get length(): number
}
