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

import { ABI } from '../../caver-abi/src'
import { Contract } from '../../caver-contract/src'
import { KIP7, KIP17 } from '../../caver-kct/src'
import { DeprecatedNetRPC } from '../../caver-net/src'
import { Utils } from '../../caver-utils/src'
import { Accounts } from '../caver-klay-accounts/src'
import RpcCallToMethod from '../../caver-rtm/src'
import { KeyForUpdateObject } from '../caver-klay-accounts/src/account/accountKeyForUpdate'
import { Personal } from '../caver-klay-personal/src'
import { BlockNumber } from '../../caver-core/src'

export * from '../caver-klay-accounts/src'
export * from '../caver-klay-personal/src'

export function getNetworkType(callback?: (error: Error, returnValue: string) => void): Promise<string>
export interface DecodedFromRawTransactionObject extends KeyForUpdateObject {
    type: string
    nonce: string
    gasPrice: string
    gas: string
    to?: string
    value?: string
    from: string
    data?: string
    humanReadable?: boolean
    feeRatio?: string
    codeFormat?: string
    v: string
    r: string
    s: string
    signatures: string[] | string[][]
    feePayer?: string
    payerV?: string
    payerR?: string
    payerS?: string
    feePayerSignatures?: string[][]
}

export class DeprecatedKlayRPC {
    decodeTransaction(rawTransaction: string, type?: string): DecodedFromRawTransactionObject

    net: DeprecatedNetRPC
    accounts: Accounts
    personal: Personal
    Contract: typeof Contract
    /** @deprecated */
    KIP7: typeof KIP7
    KIP17: typeof KIP17
    Iban: Utils['Iban']
    abi: ABI

    defaultAccount: string | null
    defaultBlock: BlockNumber

    accountCreated: RpcCallToMethod['klay_accountCreated']
    getAccounts: RpcCallToMethod['klay_accounts']
    getAccount: RpcCallToMethod['klay_getAccount']
    getAccountKey: RpcCallToMethod['klay_getAccountKey']
    getBalance: RpcCallToMethod['klay_getBalance']
    getCode: RpcCallToMethod['klay_getCode']
    getTransactionCount: RpcCallToMethod['klay_getTransactionCount']
    isContractAccount: RpcCallToMethod['klay_isContractAccount']
    sign: RpcCallToMethod['klay_sign']

    getBlockNumber: RpcCallToMethod['klay_blockNumber']
    getBlock: RpcCallToMethod['klay_getBlock']
    getBlockByNumber: RpcCallToMethod['klay_getBlockByNumber']
    getBlockByHash: RpcCallToMethod['klay_getBlockByHash']
    getBlockReceipts: RpcCallToMethod['klay_getBlockReceipts']
    getBlockWithConsensusInfo: RpcCallToMethod['klay_getBlockWithConsensusInfo']
    getBlockWithConsensusInfoByNumber: RpcCallToMethod['klay_getBlockWithConsensusInfoByNumber']
    getBlockWithConsensusInfoByHash: RpcCallToMethod['klay_getBlockWithConsensusInfoByHash']
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

    getTransactionFromBlock: RpcCallToMethod['klay_getTransactionFromBlock']
    getTransactionByBlockNumberAndIndex: RpcCallToMethod['klay_getTransactionByBlockNumberAndIndex']
    getTransactionByBlockHashAndIndex: RpcCallToMethod['klay_getTransactionByBlockHashAndIndex']
    getTransaction: RpcCallToMethod['klay_getTransaction']
    getTransactionByHash: RpcCallToMethod['klay_getTransactionByHash']
    getTransactionBySenderTxHash: RpcCallToMethod['klay_getTransactionBySenderTxHash']
    getTransactionReceipt: RpcCallToMethod['klay_getTransactionReceipt']
    getTransactionReceiptBySenderTxHash: RpcCallToMethod['klay_getTransactionReceiptBySenderTxHash']

    sendRawTransaction: RpcCallToMethod['klay_sendRawTransaction']
    sendSignedTransaction: RpcCallToMethod['klay_sendRawTransaction']
    sendTransaction: RpcCallToMethod['klay_sendTransaction']
    signTransaction: RpcCallToMethod['klay_signTransaction']

    getChainId: RpcCallToMethod['klay_chainID']
    getNodeInfo: RpcCallToMethod['klay_clientVersion']
    getClientVersion: RpcCallToMethod['klay_clientVersion']
    getGasPrice: RpcCallToMethod['klay_gasPrice']
    getGasPriceAt: RpcCallToMethod['klay_gasPriceAt']
    isParallelDBWrite: RpcCallToMethod['klay_isParallelDBWrite']
    isSenderTxHashIndexingEnabled: RpcCallToMethod['klay_isSenderTxHashIndexingEnabled']
    getProtocolVersion: RpcCallToMethod['klay_protocolVersion']
    getRewardbase: RpcCallToMethod['klay_rewardbase']

    getFilterChanges: RpcCallToMethod['klay_getFilterChanges']
    getFilterLogs: RpcCallToMethod['klay_getFilterLogs']
    getLogs: RpcCallToMethod['klay_getLogs']
    newBlockFilter: RpcCallToMethod['klay_newBlockFilter']
    newFilter: RpcCallToMethod['klay_newFilter']
    newPendingTransactionFilter: RpcCallToMethod['klay_newPendingTransactionFilter']
    uninstallFilter: RpcCallToMethod['klay_uninstallFilter']
    sha3: RpcCallToMethod['klay_sha3']
}
