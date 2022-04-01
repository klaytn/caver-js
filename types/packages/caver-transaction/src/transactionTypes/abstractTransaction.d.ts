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

import { AccessList } from 'ethers/lib/utils'
import { Account } from '../../../caver-account/src'
import { KlaytnCall } from '../../../caver-rpc/src/klay'
import { SignatureData, Keyring } from '../../../caver-wallet/src/'

export interface CreateTransactionObject {
    account?: Account
    from?: string
    to?: string
    value?: string | number
    input?: string
    nonce?: string | number
    gas?: string | number
    gasPrice?: string | number
    chainId?: string | number
    feePayer?: string
    signatures?: string[] | string[][] | SignatureData | SignatureData[]
    feePayerSignatures?: string[] | string[][] | SignatureData | SignatureData[]
    feeRatio?: string | number
    humanReadable?: boolean
    codeFormat?: string | number
    accessList?: AccessList
    maxPriorityFeePerGas?: string | number
    maxFeePerGas?: string | number
}

export class AbstractTransaction {
    constructor(typeString: string, createTxObj: CreateTransactionObject, klaytnCall?: KlaytnCall)

    static _klaytnCall: KlaytnCall

    getRLPEncoding(): string
    getCommonRLPEncodingForSignature(): string
    sign(key: string | Keyring, hasher?: (transaction: AbstractTransaction) => string): Promise<AbstractTransaction>
    sign(key: string | Keyring, index: number, hasher?: (transaction: AbstractTransaction) => string): Promise<AbstractTransaction>
    appendSignatures(signatures: string[] | string[][] | SignatureData | SignatureData[]): void
    combineSignedRawTransactions(rlpEncodedTxs: string[]): string
    getRawTransaction(): string
    getTransactionHash(): string
    getSenderTxHash(): string
    getRLPEncodingForSignature(): string
    recoverPublicKeys(): string[]
    fillTransaction(): Promise<void>
    validateOptionalValues(): void

    readonly type: string
    from: string
    nonce: string
    gas: string
    chainId: string
    signatures: SignatureData | SignatureData[]
    klaytnCall: KlaytnCall
    private _from: string
    private _nonce: string
    private _gas: string
    private _chainId: string
    private _signatures: SignatureData | SignatureData[]
    private _klaytnCall: KlaytnCall
}
