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
import { IWallet } from '../../caver-wallet/src'
import { Contract, SendOptions, SendOptionsWithFormatter } from '../../caver-contract/src'
import { TransactionReceipt } from '../../caver-core/src'
import { AbiItem } from '../../caver-utils/src'
import { Data } from './kip7'

export interface KIP37DeployParams {
    uri: string
}

export interface KIP37DetectedObject {
    IKIP37: boolean
    IKIP37Metadata: boolean
    IKIP37Mintable: boolean
    IKIP37Burnable: boolean
    IKIP37Pausable: boolean
}

export class KIP37 extends Contract {
    static wallet: IWallet
    static byteCode: string
    static abi: AbiItem[]

    static create(abi?: AbiItem[]): KIP37
    static create(tokenAddress: string, abi?: AbiItem[]): KIP37
    static deploy(tokenInfo: KIP37DeployParams, sendOptions: SendOptionsWithFormatter, wallet?: IWallet): Promise<any>
    static deploy(tokenInfo: KIP37DeployParams, sendOptions: string | SendOptions, wallet?: IWallet): Promise<KIP37>
    static detectInterface(contractAddress: string): Promise<KIP37DetectedObject>

    constructor(abi?: AbiItem[])
    constructor(tokenAddress: string, abi?: AbiItem[])

    clone(tokenAddress?: string): KIP37
    detectInterface(): Promise<KIP37DetectedObject>
    supportsInterface(interfaceId: string): Promise<boolean>

    uri(id: string | number | BigNumber): Promise<string>
    totalSupply(id: string | number | BigNumber): Promise<BigNumber>
    balanceOf(account: string, id: string | number | BigNumber): Promise<BigNumber>
    balanceOfBatch(accounts: string[], ids: Array<string | number | BigNumber>): Promise<BigNumber[]>
    isApprovedForAll(owner: string, operator: string): Promise<boolean>
    paused(id?: string | number | BigNumber): Promise<boolean>
    isPauser(account: string): Promise<boolean>
    isMinter(account: string): Promise<boolean>

    create(
        id: string | number | BigNumber,
        initialSupply: string | number | BigNumber,
        sendParam?: SendOptions
    ): Promise<TransactionReceipt>
    create(
        id: string | number | BigNumber,
        initialSupply: string | number | BigNumber,
        uri: string,
        sendParam?: SendOptions
    ): Promise<TransactionReceipt>
    setApprovalForAll(operator: string, approved: boolean, sendParam?: SendOptions): Promise<TransactionReceipt>
    safeTransferFrom(
        from: string,
        to: string,
        id: string | number | BigNumber,
        amount: string | number | BigNumber,
        sendParam?: SendOptions
    ): Promise<TransactionReceipt>
    safeTransferFrom(
        from: string,
        to: string,
        id: string | number | BigNumber,
        amount: string | number | BigNumber,
        data: Data,
        sendParam?: SendOptions
    ): Promise<TransactionReceipt>
    safeBatchTransferFrom(
        from: string,
        to: string,
        ids: Array<string | number | BigNumber>,
        amounts: Array<string | number | BigNumber>,
        sendParam?: SendOptions
    ): Promise<TransactionReceipt>
    safeBatchTransferFrom(
        from: string,
        to: string,
        ids: Array<string | number | BigNumber>,
        amounts: Array<string | number | BigNumber>,
        data: Data,
        sendParam?: SendOptions
    ): Promise<TransactionReceipt>
    mint(
        toList: string | string[],
        id: string | number | BigNumber,
        values: string | number | BigNumber | Array<string | number | BigNumber>,
        sendParam?: SendOptions
    ): Promise<TransactionReceipt>
    mintBatch(
        to: string,
        ids: Array<string | number | BigNumber>,
        values: Array<string | number | BigNumber>,
        sendParam?: SendOptions
    ): Promise<TransactionReceipt>
    addMinter(account: string, sendParam?: SendOptions): Promise<TransactionReceipt>
    renounceMinter(sendParam?: SendOptions): Promise<TransactionReceipt>
    burn(
        account: string,
        id: string | number | BigNumber,
        value: string | number | BigNumber,
        sendParam?: SendOptions
    ): Promise<TransactionReceipt>
    burnBatch(
        account: string,
        ids: Array<string | number | BigNumber>,
        values: Array<string | number | BigNumber>,
        sendParam?: SendOptions
    ): Promise<TransactionReceipt>
    pause(sendParam?: SendOptions): Promise<TransactionReceipt>
    pause(id: string | number | BigNumber, sendParam?: SendOptions): Promise<TransactionReceipt>
    unpause(sendParam?: SendOptions): Promise<TransactionReceipt>
    unpause(id: string | number | BigNumber, sendParam?: SendOptions): Promise<TransactionReceipt>
    addPauser(account: string, sendParam?: SendOptions): Promise<TransactionReceipt>
    renouncePauser(sendParam?: SendOptions): Promise<TransactionReceipt>
}
