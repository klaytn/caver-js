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

import { AbstractTransaction, CreateTransactionObject } from '../abstractTransaction'
import { SignatureData } from '../../../../caver-wallet/src/'
import { KlaytnCall } from '../../../../caver-rpc/src/klay'

export class LegacyTransaction extends AbstractTransaction {
    static create(createTxObj: CreateTransactionObject, klaytnCall?: KlaytnCall): LegacyTransaction
    static decode(rlpEncoded: string, klaytnCall?: KlaytnCall): LegacyTransaction

    constructor(createTxObj: CreateTransactionObject, klaytnCall?: KlaytnCall)

    appendSignatures(sig: string[] | string[][] | SignatureData | SignatureData[]): void
    getRLPEncoding(): string
    getRLPEncodingForSignature(): string
    getCommonRLPEncodingForSignature(): string
    recoverPublicKeys(): string[]
    fillTransaction(): Promise<void>
    validateOptionalValues(): void

    to: string
    value: string
    input: string
    data: string
    gasPrice: string
    private _to: string
    private _value: string
    private _input: string
    private _data: string
    private _gasPrice: string
}
