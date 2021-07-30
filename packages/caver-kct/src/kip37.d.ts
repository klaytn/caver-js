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

import BigNumber from 'bignumber.js'
import { Wallet } from '../../..'
import Contract, { SendOptions, SendOptionsWithFormatter } from '../../caver-contract/src'
import { TransactionReceipt } from '../../caver-rtm/src'
import { AbiItem } from '../../caver-utils/src'
import { Amount, Data } from './kip7'

export interface KIP37DetectedObject {
    IKIP37?: boolean
    IKIP37Metadata?: boolean
    IKIP37Mintable?: boolean
    IKIP37Burnable?: boolean
    IKIP37Pausable?: boolean
}

export default class KIP37 extends Contract {
    constructor(tokenAddress?: string, abi?: AbiItem[])

    static byteCode: string

    static create(tokenAddress?: string, abi?: AbiItem[]): KIP37
    static deploy(tokenInfo: object, sendOptions: string | SendOptionsWithFormatter, wallet?: Wallet): Promise<any>
    static deploy(tokenInfo: object, sendOptions: string | SendOptions, wallet?: Wallet): Promise<TransactionReceipt>
    static detectInterface(contractAddress: string): Promise<KIP37DetectedObject>
    detectInterface(): Promise<KIP37DetectedObject>
    supportsInterface(interfaceId: string): Promise<boolean>
    uri(id: Amount): Promise<string>
    totalSupply(id: Amount): Promise<BigNumber>
    balanceOf(account: string, id: Amount): Promise<BigNumber>
    balanceOfBatch(accounts: string[], ids: Amount[]): Promise<BigNumber[]>
    isApprovedForAll(owner: string, operator: string): Promise<boolean>
    paused(id?: Amount): Promise<boolean>
    isPauser(account: string): Promise<boolean>
    isMinter(account: string): Promise<boolean>
    create(id: Amount, initialSupply: Amount, sendParam?: SendOptionsWithFormatter): Promise<any>
    create(id: Amount, initialSupply: Amount, sendParam?: SendOptions): Promise<TransactionReceipt>
    create(id: Amount, initialSupply: Amount, uri: string, sendParam?: SendOptionsWithFormatter): Promise<any>
    create(id: Amount, initialSupply: Amount, uri: string, sendParam?: SendOptions): Promise<TransactionReceipt>
    setApprovalForAll(operator: string, approved: boolean, sendParam?: SendOptionsWithFormatter): Promise<any>
    setApprovalForAll(operator: string, approved: boolean, sendParam?: SendOptions): Promise<TransactionReceipt>
    safeTransferFrom(from: string, to: string, id: Amount, amount: Amount, sendParam?: SendOptionsWithFormatter): Promise<any>
    safeTransferFrom(from: string, to: string, id: Amount, amount: Amount, sendParam?: SendOptions): Promise<TransactionReceipt>
    safeTransferFrom(from: string, to: string, id: Amount, amount: Amount, data: Data, sendParam?: SendOptionsWithFormatter): Promise<any>
    safeTransferFrom(from: string, to: string, id: Amount, amount: Amount, data: Data, sendParam?: SendOptions): Promise<TransactionReceipt>
    safeBatchTransferFrom(from: string, to: string, ids: Amount[], amounts: Amount[], sendParam?: SendOptionsWithFormatter): Promise<any>
    safeBatchTransferFrom(from: string, to: string, ids: Amount[], amounts: Amount[], sendParam?: SendOptions): Promise<TransactionReceipt>
    safeBatchTransferFrom(
        from: string,
        to: string,
        ids: Amount[],
        amounts: Amount[],
        data: Data,
        sendParam?: SendOptionsWithFormatter
    ): Promise<any>
    safeBatchTransferFrom(
        from: string,
        to: string,
        ids: Amount[],
        amounts: Amount[],
        data: Data,
        sendParam?: SendOptions
    ): Promise<TransactionReceipt>
    mint(toList: string | string[], id: Amount, values: Amount | Amount[], sendParam?: SendOptionsWithFormatter): Promise<any>
    mint(toList: string | string[], id: Amount, values: Amount | Amount[], sendParam?: SendOptions): Promise<TransactionReceipt>
    mintBatch(to: string, ids: Amount[], values: Amount[], sendParam?: SendOptionsWithFormatter): Promise<any>
    mintBatch(to: string, ids: Amount[], values: Amount[], sendParam?: SendOptions): Promise<TransactionReceipt>
    addMinter(account: string, sendParam?: SendOptionsWithFormatter): Promise<any>
    addMinter(account: string, sendParam?: SendOptions): Promise<TransactionReceipt>
    renounceMinter(sendParam?: SendOptionsWithFormatter): Promise<any>
    renounceMinter(sendParam?: SendOptions): Promise<TransactionReceipt>
    burn(account: string, id: Amount, value: Amount, sendParam?: SendOptionsWithFormatter): Promise<any>
    burn(account: string, id: Amount, value: Amount, sendParam?: SendOptions): Promise<TransactionReceipt>
    burnBatch(account: string, ids: Amount[], values: Amount[], sendParam?: SendOptionsWithFormatter): Promise<any>
    burnBatch(account: string, ids: Amount[], values: Amount[], sendParam?: SendOptions): Promise<TransactionReceipt>
    pause(sendParam?: SendOptionsWithFormatter): Promise<any>
    pause(sendParam?: SendOptions): Promise<TransactionReceipt>
    pause(id: Amount, sendParam?: SendOptionsWithFormatter): Promise<any>
    pause(id: Amount, sendParam?: SendOptions): Promise<TransactionReceipt>
    unpause(sendParam?: SendOptionsWithFormatter): Promise<any>
    unpause(sendParam?: SendOptions): Promise<TransactionReceipt>
    unpause(id: Amount, sendParam?: SendOptionsWithFormatter): Promise<any>
    unpause(id: Amount, sendParam?: SendOptions): Promise<TransactionReceipt>
    addPauser(account: string, sendParam?: SendOptionsWithFormatter): Promise<any>
    addPauser(account: string, sendParam?: SendOptions): Promise<TransactionReceipt>
    renouncePauser(sendParam?: SendOptionsWithFormatter): Promise<any>
    renouncePauser(sendParam?: SendOptions): Promise<TransactionReceipt>
}
