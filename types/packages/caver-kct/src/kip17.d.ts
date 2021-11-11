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
import { Contract, SendOptions, SendOptionsWithFormatter } from '../../caver-contract/src'
import { TransactionReceipt } from '../../caver-core/src'
import { AbiItem } from '../../caver-utils/src'
import { Data } from './kip7'

export interface KIP17DeployParams {
    name: string
    symbol: string
}

export interface KIP17DetectedObject {
    IKIP17: boolean
    IKIP17Metadata: boolean
    IKIP17Enumerable: boolean
    IKIP17Mintable: boolean
    IKIP17MetadataMintable: boolean
    IKIP17Burnable: boolean
    IKIP17Pausable: boolean
}

export class KIP17 extends Contract {
    static byteCode: string
    static abi: AbiItem[]

    static deploy(tokenInfo: KIP17DeployParams, sendOptions?: string | SendOptions): Promise<TransactionReceipt>
    static deploy(tokenInfo: KIP17DeployParams, sendOptions?: SendOptionsWithFormatter): Promise<any>
    static detectInterface(contractAddress: string): Promise<KIP17DetectedObject>

    constructor(abi?: AbiItem[])
    constructor(tokenAddress: string, abi?: AbiItem[])

    clone(tokenAddress?: string): KIP17
    detectInterface(): Promise<KIP17DetectedObject>
    supportsInterface(interfaceId: string): Promise<boolean>

    name(): Promise<string>
    symbol(): Promise<string>
    tokenURI(tokenId: string | number | BigNumber): Promise<string>
    totalSupply(): Promise<BigNumber>
    tokenOfOwnerByIndex(owner: string, index: string | number | BigNumber): Promise<BigNumber>
    tokenByIndex(index: string | number | BigNumber): Promise<BigNumber>
    balanceOf(account: string): Promise<BigNumber>
    ownerOf(tokenId: string | number | BigNumber): Promise<string>
    getApproved(tokenId: string | number | BigNumber): Promise<string>
    isApprovedForAll(owner: string, operator: string): Promise<boolean>
    isMinter(account: string): Promise<boolean>
    paused(): Promise<boolean>
    isPauser(account: string): Promise<boolean>

    approve(to: string, tokenId: string | number | BigNumber, sendParam?: SendOptions): Promise<TransactionReceipt>
    setApprovalForAll(to: string, approved: boolean, sendParam?: SendOptions): Promise<TransactionReceipt>
    transferFrom(from: string, to: string, tokenId: string | number | BigNumber, sendParam?: SendOptions): Promise<TransactionReceipt>
    safeTransferFrom(from: string, to: string, tokenId: string | number | BigNumber, sendParam?: SendOptions): Promise<TransactionReceipt>
    safeTransferFrom(
        from: string,
        to: string,
        tokenId: string | number | BigNumber,
        data: Data,
        sendParam?: SendOptions
    ): Promise<TransactionReceipt>
    addMinter(account: string, sendParam?: SendOptions): Promise<TransactionReceipt>
    renounceMinter(sendParam?: SendOptions): Promise<TransactionReceipt>
    mint(to: string, tokenId: string | number | BigNumber, sendParam?: SendOptions): Promise<TransactionReceipt>
    mintWithTokenURI(
        to: string,
        tokenId: string | number | BigNumber,
        tokenURI: string,
        sendParam?: SendOptions
    ): Promise<TransactionReceipt>
    burn(tokenId: string | number | BigNumber, sendParam?: SendOptions): Promise<TransactionReceipt>
    pause(sendParam?: SendOptions): Promise<TransactionReceipt>
    unpause(sendParam?: SendOptions): Promise<TransactionReceipt>
    addPauser(account: string, sendParam?: SendOptions): Promise<TransactionReceipt>
    renouncePauser(sendParam?: SendOptions): Promise<TransactionReceipt>
}
