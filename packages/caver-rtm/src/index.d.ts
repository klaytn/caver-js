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

import { ContractOptions, EventData } from '../../caver-contract/src'
import { AccountKeyObject } from '../../caver-core-helpers/src/formatters'
import AbstractTransaction from '../../caver-transaction/src/transactionTypes/abstractTransaction'
import ValueTransfer from '../../caver-transaction/src/transactionTypes/valueTransfer/valueTransfer'
import { SignatureObject } from '../../caver-utils/src/utils'

export interface KlaytnAccount {
    accType: number
    account: {
        balance: string
        humanReadable: boolean
        key: AccountKeyObject
    }
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
    transactions: TransactionObject[]
    transactionsRoot: string
    voteData: string
}

export interface BlockWithConsensusInfo extends Block {
    committee: string[]
    originProposer: string
    proposer: string
    round: number
}

export interface TransactionObject {
    blockHash?: string
    blockNumber?: string
    codeFormat?: string
    feePayer?: string
    feePayerSignatures?: SignatureObject[]
    feeRatio?: string
    from?: string
    gas?: string | number
    gasPrice?: string | number
    hash?: string
    humanReadable?: boolean
    key?: string
    input?: string
    nonce?: string
    senderTxHash?: string
    signatures?: SignatureObject[] | string[] | string[][]
    to?: string | null
    transactionIndex?: string | null
    type?: string
    typeInt?: number
    value?: string
    chainId?: string | number
    data?: string
}

export interface ReceiptObject extends TransactionObject {
    transactionIndex?: string
    contractAddress: string
    gasUsed: string
    logs?: LogObject[]
    logsBloom: string
    status: string
    txError?: string
    transactionHash: string
    events?: {
        Approval?: EventData | EventData[]
        Transfer?: EventData | EventData[]
        MinterAdded?: EventData | EventData[]
        MinterRemoved?: EventData | EventData[]
        PauserAdded?: EventData | EventData[]
        PauserRemoved?: EventData | EventData[]
        Paused?: EventData | EventData[]
        Unpaused?: EventData | EventData[]
        ApprovalForAll?: EventData | EventData[]
        TransferSingle?: EventData | EventData[]
        URI?: {
            address: string
        }
        TransferBatch?: EventData | EventData[]
    }
    options?: ContractOptions
}

export interface SignResult {
    raw: string
    tx: TransactionObject
}

export interface PeerCountByType {
    en: number
    pn: number
    total: number
}

export interface FilterOptions {
    fromBlock?: string
    toBlock?: string
    address?: string | string[]
    topics?: string[]
    blockHash?: string
}

export interface TracingOptions {
    disableStorage?: boolean
    disableMemory?: boolean
    disableStack?: boolean
    timeout: string
    tracer: string
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

export interface CallObject {
    from: string
    to: string
    gas: string
    gasPrice: string
    value: string
    data: string
}

export default class RpcCallToMethod {
    klay_clientVersion(): Promise<string>
    klay_protocolVersion(): Promise<string>
    klay_mining(): Promise<boolean>
    klay_syncing(): Promise<boolean>
    klay_gasPrice(): Promise<string>
    klay_accounts(): Promise<string[]>
    klay_blockNumber(): Promise<string>
    klay_getBalance(address: string): Promise<string>
    klay_getBalance(address: string, blockNumber: number): Promise<string>
    klay_getBalance(address: string, blockTag: string): Promise<string>
    klay_getStorageAt(address: string, position: number, blockNumber: number): Promise<string>
    klay_getStorageAt(address: string, position: number, blockTag: string): Promise<string>
    klay_getCode(address: string): Promise<string>
    klay_getCode(address: string, blockNumber: number): Promise<string>
    klay_getCode(address: string, blockTag: string): Promise<string>
    klay_getTransactionByHash(hash: string): Promise<TransactionObject>
    klay_getTransactionReceipt(hash: string): Promise<ReceiptObject>
    klay_getTransactionCount(address: string): Promise<string>
    klay_getTransactionCount(address: string, blockNumber: number): Promise<string>
    klay_getTransactionCount(address: string, blockTag: string): Promise<string>
    klay_sendRawTransaction(rawTransaction: string | ValueTransfer): Promise<ReceiptObject>
    klay_signTransaction(tx: AbstractTransaction): Promise<SignResult>
    klay_sendTransaction(tx: AbstractTransaction): Promise<string>
    klay_call(callObject: object): Promise<string>
    klay_call(callObject: object, blockNumber: number): Promise<string>
    klay_call(callObject: object, blockTag: string): Promise<string>
    klay_estimateGas(callObject: CallObject): Promise<string>
    klay_getLogs(filterOption: FilterOptions): Promise<LogObject[]>
    klay_sign(address: string, message: string): Promise<string>
    klay_getBlockByNumber(blockNumber: number): Promise<Block>
    klay_getBlockByNumber(blockNumber: number, fullTxs: boolean): Promise<Block>
    klay_getBlockByNumber(blockTag: string): Promise<Block>
    klay_getBlockByNumber(blockTag: string, fullTxs: boolean): Promise<Block>
    klay_getBlockTransactionCountByNumber(blockNumber: number): Promise<string>
    klay_getBlockTransactionCountByNumber(blockTag: string): Promise<string>
    klay_getTransactionByBlockNumberAndIndex(blockNumber: number, index: number): Promise<TransactionObject>
    klay_getTransactionByBlockNumberAndIndex(blockTag: string, index: number): Promise<TransactionObject>
    net_networkID(): Promise<number>
    net_networkID(callback: Function): Promise<number>
    net_listening(): Promise<boolean>
    net_peerCount(): Promise<string>
    klay_chainID(): Promise<string>
    personal_listAccounts(): Promise<string>
    personal_newAccount(passphrase?: string): Promise<string>
    personal_unlockAccount(address: string, passphrase: string, duration: number): Promise<boolean>
    personal_lockAccount(address: string): Promise<boolean>
    personal_importRawKey(keydata: string, passphrase: string): Promise<string>
    personal_sendTransaction(tx: string, passphrase: string): Promise<string>
    personal_signTransaction(txObj: TransactionObject, passphrase: string): Promise<any>
    personal_sign(message: string, account: string, password?: string): Promise<string>
    personal_ecRecover(message: string, signature: string): Promise<string>
    klay_getBlockWithConsensusInfoByNumber(blockNumber: number): Promise<BlockWithConsensusInfo>
    klay_getBlockWithConsensusInfoByNumber(blockTag: string): Promise<BlockWithConsensusInfo>
    debug_traceTransaction(txHash: string, options?: TracingOptions): Promise<string>
    klay_accountCreated(address: string): Promise<boolean>
    klay_accountCreated(address: string, blockNumber: number): Promise<boolean>
    klay_accountCreated(address: string, blockTag: string): Promise<boolean>
    klay_getAccountKey(address: string): Promise<AccountKeyObject>
    klay_getAccountKey(address: string, blockNumber: number): Promise<AccountKeyObject>
    klay_getAccountKey(address: string, blockTag: string): Promise<AccountKeyObject>
    klay_isContractAccount(address: string): Promise<boolean>
    klay_isContractAccount(address: string, blockNumber: number): Promise<boolean>
    klay_isContractAccount(address: string, blockTag: string): Promise<boolean>
    klay_getCommittee(): Promise<string[]>
    klay_getCommittee(blockNumber: number): Promise<string[]>
    klay_getCommittee(blockTag: string): Promise<string[]>
    klay_getCommitteeSize(): Promise<number>
    klay_getCommitteeSize(blockNumber: number): Promise<number>
    klay_getCommitteeSize(blockTag: string): Promise<number>
    klay_getCouncil(): Promise<string[]>
    klay_getCouncil(blockNumber: number): Promise<string[]>
    klay_getCouncil(blockTag: string): Promise<string[]>
    klay_getCouncilSize(): Promise<number>
    klay_getCouncilSize(blockNumber: number): Promise<number>
    klay_getCouncilSize(blockTag: string): Promise<number>
    klay_getCypressCredit(blockNumber: number): Promise<any>
    klay_getCypressCredit(blockTag: string): Promise<any>
    klay_sha3(data: string): Promise<string>
    klay_getAccount(address: string): Promise<KlaytnAccount>
    klay_getAccount(address: string, blockNumber: number): Promise<KlaytnAccount>
    klay_getAccount(address: string, blockTag: string): Promise<KlaytnAccount>
    klay_getTransactionBySenderTxHash(senderTxHash: string): Promise<TransactionObject>
    klay_getTransactionReceiptBySenderTxHash(senderTxHash: string): Promise<ReceiptObject>
    klay_gasPriceAt(): Promise<string>
    klay_gasPriceAt(blockNumber: number): Promise<string>
    klay_gasPriceAt(blockTag: string): Promise<string>
    klay_isSenderTxHashIndexingEnabled(): Promise<boolean>
    klay_isParallelDBWrite(): Promise<boolean>
    klay_rewardbase(): Promise<string>
    klay_writeThroughCaching(): Promise<boolean>
    klay_getFilterChanges(filterId: string): Promise<LogObject[]>
    klay_getFilterLogs(filterId: string): Promise<LogObject[]>
    klay_newBlockFilter(): Promise<string>
    klay_newFilter(filterOptions?: FilterOptions): Promise<string>
    klay_newPendingTransactionFilter(): Promise<string>
    klay_uninstallFilter(filterId: string): Promise<boolean>
    klay_getBlockReceipts(blockHash: string): Promise<ReceiptObject>
    net_peerCountByType(): Promise<PeerCountByType>
    klay_estimateComputationCost(callObject: CallObject): Promise<string>
    klay_estimateComputationCost(callObject: CallObject, blockNumber: number): Promise<string>
    klay_estimateComputationCost(callObject: CallObject, blockTag: string): Promise<string>
    personal_replaceRawKey(keydata: string, oldPassphrase: string, newPassphrase: string): Promise<string>
    personal_sendValueTransfer(tx: string, passphrase: string): Promise<string>
    personal_sendAccountUpdate(tx: string, passphrase: string): Promise<string>
}
