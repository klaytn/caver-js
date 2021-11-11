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

export interface KIP7DeployParams {
    name: string
    symbol: string
    decimals?: number
    initialSupply?: BigNumber | string
}

export interface KIP7DetectedObject {
    IKIP7: boolean
    IKIP7Metadata: boolean
    IKIP7Mintable: boolean
    IKIP7Burnable: boolean
    IKIP7Pausable: boolean
}

export type Data = string | number | number[] | Buffer

export class KIP7 extends Contract {
    static byteCode: string
    static abi: AbiItem[]

    static deploy(tokenInfo: KIP7DeployParams, sendOptions: string | SendOptions): Promise<KIP7>
    static deploy(tokenInfo: KIP7DeployParams, sendOptions: SendOptionsWithFormatter): Promise<any>
    static detectInterface(contractAddress: string): Promise<KIP7DetectedObject>

    constructor(abi?: AbiItem[])
    constructor(tokenAddress: string, abi?: AbiItem[])

    clone(tokenAddress?: string): KIP7
    detectInterface(): Promise<KIP7DetectedObject>
    supportsInterface(interfaceId: string): Promise<boolean>

    name(): Promise<string>
    symbol(): Promise<string>
    decimals(): Promise<number>
    totalSupply(): Promise<BigNumber>
    balanceOf(account: string): Promise<BigNumber>
    allowance(owner: string, spender: string): Promise<BigNumber>
    isMinter(account: string): Promise<boolean>
    isPauser(account: string): Promise<boolean>
    paused(): Promise<boolean>

    approve(spender: string, amount: string | number | BigNumber, sendParam?: SendOptions): Promise<TransactionReceipt>
    transfer(recipient: string, amount: string | number | BigNumber, sendParam?: SendOptions): Promise<TransactionReceipt>
    transferFrom(
        sender: string,
        recipient: string,
        amount: string | number | BigNumber,
        sendParam?: SendOptions
    ): Promise<TransactionReceipt>
    safeTransfer(recipient: string, amount: string | number | BigNumber, sendParam?: SendOptions): Promise<TransactionReceipt>
    safeTransfer(recipient: string, amount: string | number | BigNumber, data: Data, sendParam?: SendOptions): Promise<TransactionReceipt>
    safeTransferFrom(
        sender: string,
        recipient: string,
        amount: string | number | BigNumber,
        sendParam?: SendOptions
    ): Promise<TransactionReceipt>
    safeTransferFrom(
        sender: string,
        recipient: string,
        amount: string | number | BigNumber,
        data: Data,
        sendParam?: SendOptions
    ): Promise<TransactionReceipt>
    mint(account: string, amount: string | number | BigNumber, sendParam?: SendOptions): Promise<TransactionReceipt>
    addMinter(account: string, sendParam?: SendOptions): Promise<TransactionReceipt>
    renounceMinter(sendParam?: SendOptions): Promise<TransactionReceipt>
    burn(amount: string | number | BigNumber, sendParam?: SendOptions): Promise<TransactionReceipt>
    burnFrom(account: string, amount: string | number | BigNumber, sendParam?: SendOptions): Promise<TransactionReceipt>
    pause(sendParam?: SendOptions): Promise<TransactionReceipt>
    unpause(sendParam?: SendOptions): Promise<TransactionReceipt>
    addPauser(account: string, sendParam?: SendOptions): Promise<TransactionReceipt>
    renouncePauser(sendParam?: SendOptions): Promise<TransactionReceipt>
}
