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

import { Account } from '../../caver-account/src'
import BN = require('bn.js')
import BigNumber from 'bignumber.js'
import { AccessListObject } from '../../caver-transaction/src'

export interface SignatureForRPC {
    V: string
    R: string
    S: string
}

export interface Header {
    parentHash: string
    reward: string
    stateRoot: string
    transactionsRoot: string
    receiptsRoot: string
    logsBloom: string
    blockScore: string
    number: string
    gasUsed: string
    timestamp: string
    timestampFoS: string
    extraData: string
    governanceData: string
    hash: string
    voteData?: string
    baseFeePerGas?: string
}

export interface Block {
    blockscore: string
    extraData: string
    gasUsed: string
    governanceData: string
    hash: string
    logsBloom: string
    number: string
    parentHash: string
    receiptsRoot: string
    reward: string
    size: string
    stateRoot: string
    timestamp: string
    timestampFoS: string
    totalBlockScore: string
    transactions: TransactionForRPC[]
    transactionsRoot: string
    voteData: string
    baseFeePerGas?: string
}

export interface BlockWithConsensusInfo extends Block {
    committee: string[]
    originProposer: string
    proposer: string
    round: number
}

export interface TransactionForSendRPC {
    accessList?: AccessListObject
    type?: string
    from?: string | number
    signatures?: SignatureForRPC[]
    to?: string
    value?: number | string
    gas?: number | string
    gasPrice?: number | string
    maxPriorityFeePerGas?: string | number
    maxFeePerGas?: string | number
    data?: string
    input?: string
    nonce?: number
    chainId?: number
    feePayer?: string
    feePayerSignatures?: SignatureForRPC[]
    feeRatio?: string
    humanReadable?: boolean
    key?: string
    senderRawTransaction?: string
    codeFormat?: string | number
    account?: Account
}

export interface TransactionForRPC {
    accessList?: AccessListObject
    blockHash: string
    blockNumber: string
    codeFormat?: string
    chainId?: string
    feePayer?: string
    feePayerSignatures?: SignatureForRPC[]
    feeRatio?: string
    from: string
    gas: string | number
    gasPrice?: string
    maxPriorityFeePerGas?: string
    maxFeePerGas?: string
    hash: string
    humanReadable?: boolean
    key?: string
    input?: string
    nonce: string
    senderTxHash: string
    signatures: SignatureForRPC[]
    to: string | null
    transactionIndex: string | null
    type: string
    typeInt: number
    value?: string
}

export interface TransactionReceipt {
    accessList?: AccessListObject
    blockHash: string
    blockNumber: string
    codeFormat?: string
    chainId?: string
    feePayer?: string
    feePayerSignatures?: SignatureForRPC[]
    feeRatio?: string
    from: string
    gas: string | number
    gasPrice?: string | number
    maxPriorityFeePerGas?: string
    maxFeePerGas?: string
    humanReadable?: boolean
    key?: string
    input?: string
    nonce: string
    senderTxHash: string
    signatures: SignatureForRPC[]
    to: string | null
    transactionIndex: string | null
    type: string
    typeInt: number
    value?: string
    contractAddress: string
    gasUsed: string
    logs?: LogObject[]
    logsBloom: string
    status: string
    txError?: string
    transactionHash: string
    events?: {
        [eventName: string]: EventData | EventData[]
    }
}

export interface LogObject {
    address?: string
    topics?: string[]
    data?: string
    blockNumber?: string
    transactionHash?: string
    transactionIndex?: string
    blockHash?: string
    logIndex?: string
    removed?: boolean
}

export interface EventOptions {
    filter?: object
    fromBlock?: BlockNumber
    toBlock?: BlockNumber
    topics?: string[]
}

export interface EventData<ReturnValues extends object = Record<string, string>> {
    address?: string
    blockNumber?: number
    transactionHash?: string
    transactionIndex?: number
    blockHash?: string
    logIndex?: number
    id?: string
    returnValues?: ReturnValues
    event?: string
    signature?: string
    raw?: {
        data?: string
        topics?: string[]
    }
}

export interface RLPEncodedTransaction {
    raw: string
    tx: {
        typeInt: number
        type: string
        nonce: string
        gasPrice: string
        gas: string
        to: string
        value: string
        from: string
        signatures: SignatureForRPC[]
        hash: string
    }
}

export interface DecodedAnchoringTransaction {
    BlockCount: number
    BlockHash: string
    BlockNumber: number
    ParentHash: string
    ReceiptHash: string
    StateRootHash: string
    TxCount: number
    TxHash: string
}

export type BlockNumber = string | number | BN | BigNumber | 'latest' | 'pending' | 'earliest' | 'genesis'

export interface Log {
    address: string
    data: string
    topics: string[]
    logIndex: number
    transactionIndex: number
    transactionHash: string
    blockHash: string
    blockNumber: number
}

export interface LogsOptions {
    fromBlock?: BlockNumber
    address?: string | string[]
    topics?: Array<string | string[] | null>
    toBlock?: BlockNumber
}

export interface CallObject {
    to?: string
    input?: string
    data?: string
    from?: string
    gas?: string
    gasPrice?: string
    value?: string
}

export interface PromiEvent<T> extends Promise<T> {
    once(type: 'transactionHash', handler: (transactionHash: string) => void): PromiEvent<T>

    once(type: 'receipt', handler: (receipt: TransactionReceipt) => void): PromiEvent<T>

    once(type: 'error', handler: (error: Error) => void): PromiEvent<T>

    once(type: 'error' | 'receipt' | 'transactionHash', handler: (error: Error | TransactionReceipt | string) => void): PromiEvent<T>

    on(type: 'transactionHash', handler: (receipt: string) => void): PromiEvent<T>

    on(type: 'receipt', handler: (receipt: TransactionReceipt) => void): PromiEvent<T>

    on(type: 'error', handler: (error: Error) => void): PromiEvent<T>

    on(type: 'error' | 'receipt' | 'transactionHash', handler: (error: Error | TransactionReceipt | string) => void): PromiEvent<T>
}

export type Keystore = EncryptedKeystoreV3Json | EncryptedKeystoreV4Json

export interface EncryptedKeystoreV3Json {
    version: number
    id: string
    address: string
    crypto: EncryptedKey
}

export interface EncryptedKeystoreV4Json {
    version: number
    id: string
    address: string
    keyring: EncryptedKey[] | EncryptedKey[][]
}

export interface EncryptedKey {
    ciphertext: string
    cipherparams: { iv: string }
    cipher: string
    kdf: string
    kdfparams: {
        dklen: number
        salt: string
        n: number
        r: number
        p: number
    }
    mac: string
}
export interface EncryptionOptions {
    salt?: any
    iv?: any
    kdf?: any
    dklen?: any
    c?: any
    n?: any
    r?: any
    p?: any
    cipher?: any
    uuid?: any
}

export interface FeeHistoryResult {
    oldestBlock: number
    baseFeePerGas: string[]
    reward: string[][]
    gasUsedRatio: number[]
}
