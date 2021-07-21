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

import { AccountKeyFormat, AccountKeyObject } from '../../caver-core-helpers/src/formatters'
import RpcCallToMethod, { Block, BlockWithConsensusInfo, SignResult, TransactionObject } from '../../caver-rtm/src'
import AbstractFeeDelegatedTransaction from '../../caver-transaction/src/transactionTypes/abstractFeeDelegatedTransaction'
import { PromiEvent } from '../../caver-utils/src'
import Validator from '../../caver-validator/src'

export interface DecodeAanchoringTransaction {
    BlockHash: string
    BlockNumber: number
    ParentHash: string
    TxHash: string
    StateRootHash: string
    ReceiptHash: string
    BlockCount: number
    TxCount: number
}

export interface KlaytnCall {
    getAccountKey: KlayRPC['getAccountKey']
    getChainId: KlayRPC['getChainId']
    getGasPrice: KlayRPC['getGasPrice']
    getTransactionByHash: KlayRPC['getTransactionByHash']
    getTransactionCount: KlayRPC['getTransactionCount']
}

export class KlayValidator extends Validator {
    static _klaytnCall: KlaytnCall
}

export default class KlayRPC {
    constructor(...args: any[])

    accountCreated: RpcCallToMethod['klay_accountCreated']
    getAccounts: RpcCallToMethod['klay_accounts']
    encodeAccountKey(accountKey: AccountKeyFormat): Promise<string>
    decodeAccountKey(encodedAccountKey: string): Promise<AccountKeyObject>
    getAccount: RpcCallToMethod['klay_getAccount']
    getAccountKey: RpcCallToMethod['klay_getAccountKey']
    getBalance: RpcCallToMethod['klay_getBalance']
    getCode: RpcCallToMethod['klay_getCode']
    getTransactionCount: RpcCallToMethod['klay_getTransactionCount']
    isContractAccount: RpcCallToMethod['klay_isContractAccount']
    sign: RpcCallToMethod['klay_sign']
    getBlockNumber: RpcCallToMethod['klay_blockNumber']
    getBlock: RpcCallToMethod['klay_getBlockByNumber']
    getBlockByNumber: RpcCallToMethod['klay_getBlockByNumber']
    getBlockByHash(blockHash: string): Promise<Block>
    getBlockByHash(blockHash: string, fullTxs: boolean): Promise<Block>
    getBlockReceipts: RpcCallToMethod['klay_getBlockReceipts']
    getBlockTransactionCount: RpcCallToMethod['klay_getBlockTransactionCountByNumber']
    getBlockTransactionCountByNumber: RpcCallToMethod['klay_getBlockTransactionCountByNumber']
    getBlockTransactionCountByHash(blockHash: string): Promise<string>
    getBlockWithConsensusInfoByHash(blockHash: string): Promise<BlockWithConsensusInfo>
    getBlockWithConsensusInfo: RpcCallToMethod['klay_getBlockWithConsensusInfoByNumber']
    getBlockWithConsensusInfoByNumber: RpcCallToMethod['klay_getBlockWithConsensusInfoByNumber']
    getCommittee: RpcCallToMethod['klay_getCommittee']
    getCommitteeSize: RpcCallToMethod['klay_getCommitteeSize']
    getCouncil: RpcCallToMethod['klay_getCouncil']
    getCouncilSize: RpcCallToMethod['klay_getCouncilSize']
    getStorageAt: RpcCallToMethod['klay_getStorageAt']
    isMining: RpcCallToMethod['klay_mining']
    isSyncing: RpcCallToMethod['klay_syncing']
    call: RpcCallToMethod['klay_call']
    estimateGas: RpcCallToMethod['klay_estimateGas']
    estimateComputationCost: RpcCallToMethod['klay_estimateComputationCost']
    getTransactionByBlockHashAndIndex(hash: string, index: number): Promise<TransactionObject>
    getTransactionFromBlock: RpcCallToMethod['klay_getTransactionByBlockNumberAndIndex']
    getTransactionByBlockNumberAndIndex: RpcCallToMethod['klay_getTransactionByBlockNumberAndIndex']
    getTransaction: RpcCallToMethod['klay_getTransactionByHash']
    getTransactionByHash: RpcCallToMethod['klay_getTransactionByHash']
    getTransactionBySenderTxHash: RpcCallToMethod['klay_getTransactionBySenderTxHash']
    getTransactionReceipt: RpcCallToMethod['klay_getTransactionReceipt']
    getTransactionReceiptBySenderTxHash: RpcCallToMethod['klay_getTransactionReceiptBySenderTxHash']
    submitTransaction: RpcCallToMethod['klay_sendRawTransaction']
    sendRawTransaction: RpcCallToMethod['klay_sendRawTransaction']
    sendTransaction: RpcCallToMethod['klay_sendTransaction']
    sendTransactionAsFeePayer(tx: AbstractFeeDelegatedTransaction): Promise<PromiEvent>
    signTransaction: RpcCallToMethod['klay_signTransaction']
    signTransactionAsFeePayer(tx: AbstractFeeDelegatedTransaction): Promise<SignResult>
    getDecodedAnchoringTransactionByHash(hash: string): Promise<DecodeAanchoringTransaction>
    getChainId: RpcCallToMethod['klay_chainID']
    getClientVersion: RpcCallToMethod['klay_clientVersion']
    getGasPrice: RpcCallToMethod['klay_gasPrice']
    getGasPriceAt: RpcCallToMethod['klay_gasPriceAt']
    isParallelDBWrite: RpcCallToMethod['klay_isParallelDBWrite']
    isSenderTxHashIndexingEnabled: RpcCallToMethod['klay_isSenderTxHashIndexingEnabled']
    getProtocolVersion: RpcCallToMethod['klay_protocolVersion']
    isWriteThroughCaching: RpcCallToMethod['klay_writeThroughCaching']
    getRewardbase: RpcCallToMethod['klay_rewardbase']
    getFilterChanges: RpcCallToMethod['klay_getFilterChanges']
    getFilterLogs: RpcCallToMethod['klay_getFilterLogs']
    getLogs: RpcCallToMethod['klay_getLogs']
    newBlockFilter: RpcCallToMethod['klay_newBlockFilter']
    newFilter: RpcCallToMethod['klay_newFilter']
    newPendingTransactionFilter: RpcCallToMethod['klay_newPendingTransactionFilter']
    uninstallFilter: RpcCallToMethod['klay_uninstallFilter']
    sha3: RpcCallToMethod['klay_sha3']
    getCypressCredit: RpcCallToMethod['klay_getCypressCredit']
}
