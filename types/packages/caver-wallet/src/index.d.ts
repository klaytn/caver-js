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

import { Transaction, FeeDelegatedTransaction, AbstractTransaction, AbstractFeeDelegatedTransaction } from '../../caver-transaction/src'
import { KeyringFactory, Keyring } from './keyring/keyringFactory'
import { SingleKeyring } from './keyring/singleKeyring'
import { MultipleKeyring } from './keyring/multipleKeyring'
import { RoleBasedKeyring } from './keyring/roleBasedKeyring'
import { SignatureData } from './keyring/signatureData'

export * from './keyring/keyringFactory'
export * from './keyring/singleKeyring'
export * from './keyring/multipleKeyring'
export * from './keyring/roleBasedKeyring'
export * from './keyring/signatureData'

export interface SignedMessage {
    message: string
    messageHash: string
    signatures: SignatureData[]
}

export class IWallet {
    generate(num: number): string[]
    sign(address: string, transaction: AbstractTransaction): Promise<AbstractTransaction>
    signAsFeePayer(address: string, transaction: AbstractFeeDelegatedTransaction): Promise<AbstractFeeDelegatedTransaction>
    isExisted(address: string): boolean
    remove(address: string): boolean
}

export class KeyringContainer implements IWallet {
    constructor(keyrings?: Keyring[])

    length: number
    keyring: KeyringFactory

    generate(num: number): string[]
    generate(numberOfKeyrings: number, entropy?: string): string[]
    newKeyring(address: string, key: string): SingleKeyring
    newKeyring(address: string, key: string[]): MultipleKeyring
    newKeyring(address: string, key: string[][]): RoleBasedKeyring
    updateKeyring(keyring: Keyring): Keyring
    getKeyring(address: string): Keyring
    isExisted(address: string): boolean
    add(keyring: Keyring): Keyring
    remove(address: string): boolean
    signMessage(address: string, data: string, role: number, index?: number): SignedMessage
    sign(address: string, transaction: AbstractTransaction): Promise<AbstractTransaction>
    sign(
        address: string,
        transaction: AbstractTransaction,
        hasher?: (transaction: AbstractTransaction) => string
    ): Promise<AbstractTransaction>
    sign(
        address: string,
        transaction: AbstractTransaction,
        index: number,
        hasher?: (transaction: AbstractTransaction) => string
    ): Promise<AbstractTransaction>
    signAsFeePayer(address: string, transaction: FeeDelegatedTransaction): Promise<AbstractFeeDelegatedTransaction>
    signAsFeePayer(
        address: string,
        transaction: AbstractFeeDelegatedTransaction,
        hasher?: (transaction: AbstractFeeDelegatedTransaction) => string
    ): Promise<AbstractFeeDelegatedTransaction>
    signAsFeePayer(
        address: string,
        transaction: AbstractFeeDelegatedTransaction,
        index: number,
        hasher?: (transaction: AbstractFeeDelegatedTransaction) => string
    ): Promise<AbstractFeeDelegatedTransaction>
    isExisted(address: string): boolean
    remove(address: string): boolean
}
