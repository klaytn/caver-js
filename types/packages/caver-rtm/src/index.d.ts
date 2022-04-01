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

import { AccountKey } from '../../caver-account/src'
import {
    Block,
    BlockNumber,
    TransactionReceipt,
    BlockWithConsensusInfo,
    TransactionForRPC,
    PromiEvent,
    TransactionForSendRPC,
    RLPEncodedTransaction,
    DecodedAnchoringTransaction,
    Log,
    LogsOptions,
    LogObject,
    CallObject,
} from '../../caver-core/src'
import { Transaction } from '../../caver-transaction/src'
import { Syncing, AccountKeyForRPC, AccountForRPC } from '../../caver-rpc/src/klay'
import { PeerCountByType } from '../../caver-rpc/src/net'

export interface TracingOptions {
    disableStorage?: boolean
    disableMemory?: boolean
    disableStack?: boolean
    timeout: string
    tracer: string
}

export default class RpcCallToMethod {
    klay_clientVersion(callback?: (error: Error, result: string) => void): Promise<string>
    klay_protocolVersion(callback?: (error: Error, result: string) => void): Promise<string>
    klay_mining(callback?: (error: Error, result: boolean) => void): Promise<boolean>
    klay_syncing(callback?: (error: Error, result: Syncing | boolean) => void): Promise<Syncing | boolean>
    klay_gasPrice(callback?: (error: Error, result: string) => void): Promise<string>
    klay_accounts(callback?: (error: Error, result: string[]) => void): Promise<string[]>
    klay_blockNumber(callback?: (error: Error, result: string) => void): Promise<number>
    klay_getBalance(address: string, blockNumber?: BlockNumber, callback?: (error: Error, result: string) => void): Promise<string>
    klay_getStorageAt(
        address: string,
        position: number,
        blockNumber?: BlockNumber,
        callback?: (error: Error, result: string) => void
    ): Promise<string>
    klay_getCode(address: string, blockNumber?: BlockNumber, callback?: (error: Error, result: string) => void): Promise<string>
    klay_getTransactionByHash(
        transactionHash: string,
        callback?: (error: Error, result: TransactionForRPC | null) => void
    ): Promise<TransactionForRPC | null>
    klay_getTransactionReceipt(
        transactionHash: string,
        callback?: (error: Error, result: TransactionReceipt | null) => void
    ): Promise<TransactionReceipt | null>
    klay_getTransactionCount(blockNumber: BlockNumber, callback?: (error: Error, result: string) => void): Promise<string>
    klay_sendRawTransaction(
        signedTransaction: string | Transaction,
        callback?: (error: Error, result: TransactionReceipt) => void
    ): PromiEvent<TransactionReceipt>
    klay_signTransaction(
        transaction: TransactionForSendRPC | Transaction,
        callback?: (error: Error, result: RLPEncodedTransaction) => void
    ): Promise<RLPEncodedTransaction>
    klay_sendTransaction(
        transaction: TransactionForSendRPC | Transaction,
        callback?: (error: Error, result: TransactionReceipt) => void
    ): PromiEvent<TransactionReceipt>
    klay_call(callObject: CallObject, blockNumber?: BlockNumber, callback?: (error: Error, result: string) => void): Promise<string>
    klay_estimateGas(callObject: CallObject, blockNumber?: BlockNumber, callback?: (error: Error, result: string) => void): Promise<number>
    klay_getLogs(options: LogsOptions, callback?: (error: Error, result: Log[]) => void): Promise<Log[]>
    klay_sign(
        address: string,
        message: string,
        blockNumber?: BlockNumber,
        callback?: (error: Error, result: string) => void
    ): Promise<string>
    klay_getBlock(
        blockNumber: BlockNumber,
        returnTransactionObjects?: boolean,
        callback?: (error: Error, result: Block) => void
    ): Promise<Block>
    klay_getBlockByNumber(
        blockNumber: number,
        returnTransactionObjects?: boolean,
        callback?: (error: Error, result: Block) => void
    ): Promise<Block>
    klay_getBlockByHash(
        blockHash: string,
        returnTransactionObjects?: boolean,
        callback?: (error: Error, result: Block) => void
    ): Promise<Block>
    klay_getTransactionFromBlock(
        blockNumber: BlockNumber,
        index: number,
        callback?: (error: Error, result: TransactionForRPC) => void
    ): Promise<TransactionForRPC>
    klay_getTransactionByBlockNumberAndIndex(
        blockNumber: number,
        index: number,
        callback?: (error: Error, result: TransactionForRPC) => void
    ): Promise<TransactionForRPC>
    klay_getTransactionByBlockHashAndIndex(
        blockHash: string,
        index: number,
        callback?: (error: Error, result: TransactionForRPC) => void
    ): Promise<TransactionForRPC>
    klay_getBlockWithConsensusInfo(
        blockNumber: BlockNumber,
        callback?: (error: Error, result: BlockWithConsensusInfo) => void
    ): Promise<BlockWithConsensusInfo>
    klay_getBlockWithConsensusInfoByNumber(
        blockNumber: number,
        callback?: (error: Error, result: BlockWithConsensusInfo) => void
    ): Promise<BlockWithConsensusInfo>
    klay_getBlockWithConsensusInfoByHash(
        blockHash: string,
        callback?: (error: Error, result: BlockWithConsensusInfo) => void
    ): Promise<BlockWithConsensusInfo>

    klay_accountCreated(address: string, blockNumber?: BlockNumber, callback?: (error: Error, result: boolean) => void): Promise<boolean>
    klay_getAccountKey(
        address: string,
        blockNumber?: BlockNumber,
        callback?: (error: Error, result: AccountKeyForRPC) => void
    ): Promise<AccountKeyForRPC>

    klay_isContractAccount(address: string, blockNumber?: BlockNumber, callback?: (error: Error, result: boolean) => void): Promise<boolean>
    klay_getCommittee(blockNumber?: BlockNumber, callback?: (error: Error, result: string[]) => void): Promise<string[]>
    klay_getCommitteeSize(blockNumber?: BlockNumber, callback?: (error: Error, result: number) => void): Promise<number>
    klay_getCouncil(blockNumber?: BlockNumber, callback?: (error: Error, result: string[]) => void): Promise<string[]>
    klay_getCouncilSize(blockNumber?: BlockNumber, callback?: (error: Error, result: number) => void): Promise<number>

    klay_sha3(data: string, callback?: (error: Error, result: string) => void): Promise<string>
    klay_getAccount(
        address: string,
        blockNumber?: BlockNumber,
        callback?: (error: Error, result: AccountForRPC) => void
    ): Promise<AccountForRPC>

    klay_getTransaction(
        transactionHash: string,
        callback?: (error: Error, result: TransactionForRPC | null) => void
    ): Promise<TransactionForRPC | null>
    klay_getTransactionByHash(
        transactionHash: string,
        callback?: (error: Error, result: TransactionForRPC | null) => void
    ): Promise<TransactionForRPC | null>
    klay_getTransactionBySenderTxHash(
        senderTxHash: string,
        callback?: (error: Error, result: TransactionForRPC | null) => void
    ): Promise<TransactionForRPC | null>
    klay_getTransactionReceipt(
        transactionHash: string,
        callback?: (error: Error, result: TransactionReceipt | null) => void
    ): Promise<TransactionReceipt | null>
    klay_getTransactionReceiptBySenderTxHash(
        senderTxHash: string,
        callback?: (error: Error, result: TransactionReceipt | null) => void
    ): Promise<TransactionReceipt | null>

    klay_gasPriceAt(blockNumber?: number, callback?: (error: Error, result: string) => void): Promise<string>
    klay_isSenderTxHashIndexingEnabled(callback?: (error: Error, result: boolean) => void): Promise<boolean>
    klay_isParallelDBWrite(callback?: (error: Error, result: boolean) => void): Promise<boolean>
    klay_rewardbase(callback?: (error: Error, result: string) => void): Promise<string>

    klay_getFilterChanges(filterId: string, callback?: (error: Error, result: LogObject[]) => void): Promise<LogObject[]>
    klay_getFilterLogs(filterId: string, callback?: (error: Error, result: LogObject[]) => void): Promise<LogObject[]>
    klay_newBlockFilter(callback?: (error: Error, result: string) => void): Promise<string>
    klay_newFilter(options: LogsOptions, callback?: (error: Error, result: string) => void): Promise<string>
    klay_newPendingTransactionFilter(callback?: (error: Error, result: string) => void): Promise<string>
    klay_uninstallFilter(filterId: string, callback?: (error: Error, result: boolean) => void): Promise<boolean>
    klay_getBlockReceipts(blockHash: string, callback?: (error: Error, result: TransactionReceipt[]) => void): Promise<TransactionReceipt[]>
    klay_estimateComputationCost(
        callObject: CallObject,
        blockNumber?: BlockNumber,
        callback?: (error: Error, result: string) => void
    ): Promise<string>
    klay_chainID(callback?: (error: Error, result: string) => void): Promise<string>

    net_networkID(callback?: (error: Error, result: string) => void): Promise<string>
    net_listening(callback?: (error: Error, result: boolean) => void): Promise<boolean>
    net_peerCount(callback?: (error: Error, result: string) => void): Promise<string>
    net_peerCountByType(callback?: (error: Error, result: PeerCountByType) => void): Promise<PeerCountByType>

    personal_listAccounts(callback?: (error: Error, result: string) => void): Promise<string>
    personal_newAccount(passphrase?: string, callback?: (error: Error, result: string) => void): Promise<string>
    personal_unlockAccount(
        address: string,
        passphrase: string,
        duration: number,
        callback?: (error: Error, result: boolean) => void
    ): Promise<boolean>
    personal_lockAccount(address: string, callback?: (error: Error, result: boolean) => void): Promise<boolean>
    personal_importRawKey(keydata: string, passphrase: string, callback?: (error: Error, result: string) => void): Promise<string>
    personal_sendTransaction(
        tx: TransactionForSendRPC,
        passphrase: string,
        callback?: (error: Error, result: string) => void
    ): Promise<string>
    personal_signTransaction(
        txObj: TransactionForRPC,
        passphrase: string,
        callback?: (error: Error, result: RLPEncodedTransaction) => void
    ): Promise<RLPEncodedTransaction>
    personal_sign(message: string, account: string, password?: string, callback?: (error: Error, result: string) => void): Promise<string>
    personal_ecRecover(message: string, signature: string, callback?: (error: Error, result: string) => void): Promise<string>
    personal_replaceRawKey(
        keydata: string,
        oldPassphrase: string,
        newPassphrase: string,
        callback?: (error: Error, result: string) => void
    ): Promise<string>
    personal_sendValueTransfer(
        tx: TransactionForSendRPC,
        passphrase: string,
        callback?: (error: Error, result: string) => void
    ): Promise<string>
    personal_sendAccountUpdate(
        tx: TransactionForSendRPC,
        passphrase: string,
        callback?: (error: Error, result: string) => void
    ): Promise<string>

    debug_traceTransaction(txHash: string, options?: TracingOptions): Promise<string>
}
