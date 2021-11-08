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

import MultipleKeyring from './multipleKeyring'
import PrivateKey from './privateKey'
import RoleBasedKeyring from './roleBasedKeyring'
import SignatureData from './signatureData'
import SingleKeyring from './singleKeyring'
import { KEY_ROLE } from './keyringHelper'
import { Keystore } from '../../../caver-core/src'

export type Keyring = SingleKeyring | MultipleKeyring | RoleBasedKeyring

export default class KeyringFactory {
    static privateKey: PrivateKey
    static singleKeyring: SingleKeyring
    static multipleKeyring: MultipleKeyring
    static roleBasedKeyring: RoleBasedKeyring
    static role: typeof KEY_ROLE
    static signatureData: SignatureData

    static generate(entropy?: string): SingleKeyring
    static generateSingleKey(entropy?: string): string
    static generateMultipleKeys(num: number, entropy?: string): string[]
    static generateRoleBasedKeys(numArr: number[], entropy?: string): string[][]
    static create(address: string, key: string): SingleKeyring
    static create(address: string, key: string[]): MultipleKeyring
    static create(address: string, key: string[][]): RoleBasedKeyring
    static createFromPrivateKey(privateKey: string): SingleKeyring
    static createFromKlaytnWalletKey(klaytnWalletKey: string): SingleKeyring
    static createWithSingleKey(address: string, key: string): SingleKeyring
    static createWithMultipleKey(address: string, keyArray: string[]): MultipleKeyring
    static createWithRoleBasedKey(address: string, roledBasedKeyArray: string[][]): RoleBasedKeyring
    static decrypt(keystore: Keystore, password: string): Keyring
}
