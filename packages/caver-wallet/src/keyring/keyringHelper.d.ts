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

export interface EncryptedKey {
    ciphertext: string
    cipherparams: {
        iv: string
    }
    cipher: string
    kdf: string
    kdfparams: EncryptedKey
    mac: string
}

export interface EncryptedKeyOptions {
    salt: any
    iv: any
    kdf: any
    dklen: any
    c: any
    n: any
    r: any
    p: any
    cipher: any
    uuid: any
}

export interface Keystore {
    version: number
    id: string
    address: string
    crypto?: EncryptedKey[]
    keyring?: EncryptedKey[] | EncryptedKey[][]
}

export const KEY_ROLE: {
    roleTransactionKey: 0
    0: 'roleTransactionKey'
    roleAccountUpdateKey: 1
    1: 'roleAccountUpdateKey'
    roleFeePayerKey: 2
    2: 'roleFeePayerKey'
    roleLast: 3
}

export const MAXIMUM_KEY_NUM = 10

export function isMultipleKeysFormat(keys: string): boolean
export function isRoleBasedKeysFormat(roledBasedKeyArray: string[]): boolean
export function validateForSigning(hash: string, chainId: string): void
export function validateIndexWithKeys(index: number, keyLength: number): void
export function decryptKey(encryptedArray: EncryptedKey[], password: string): string[]
export function encryptKey(privateKey: string, password: string, options: EncryptedKey): EncryptedKey
export function formatEncrypted(version: number, address: string, keyringOrCrypto: any, options: any): Keystore
