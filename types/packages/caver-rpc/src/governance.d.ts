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

import BN = require('bn.js')
import BigNumber from 'bignumber.js'
import { BlockNumber } from '../../caver-core/src'

export interface Tally {
    ApprovalPercentage: number
    Key: string
    Value: string | number
}

export interface MyVote {
    Key: string
    Value: string | number | boolean
    Casted: boolean
    BlockNum: number
}

export interface Vote {
    key: string
    validator: string
    value: string | number | boolean
}

export interface ChainConfig {
    chainId: number
    deriveShaImpl: number
    governance: {
        governanceMode: string
        governingNode: string
        reward: {
            deferredTxFee: boolean
            minimumStake: number
            mintingAmount: number
            proposerUpdateInterval: number
            ratio: string
            stakingUpdateInterval: number
            useGiniCoeff: boolean
        }
    }
    istanbul: {
        epoch: number
        policy: number
        sub: number
    }
    unitPrice: number
}

export interface GovernanceItems {
    'governance.governancemode': string
    'governance.governingnode': string
    'governance.unitprice': number
    'istanbul.committeesize': number
    'istanbul.epoch': number
    'istanbul.policy': number
    'reward.deferredtxfee': boolean
    'reward.minimumstake': string
    'reward.mintingamount': string
    'reward.proposerupdateinterval': number
    'reward.ratio': string
    'reward.stakingupdateinterval': number
    'reward.useginicoeff': boolean
}

export interface VoteItems {
    'governance.governancemode'?: string
    'governance.governingnode'?: string
    'governance.unitprice'?: number
    'governance.addvalidator'?: string
    'governance.removevalidator'?: string
    'istanbul.epoch'?: number
    'istanbul.committeesize'?: number
    'istanbul.policy'?: number
    'reward.mintingamount'?: string
    'reward.ratio'?: string
    'reward.useginicoeff'?: boolean
    'reward.deferredtxfee'?: boolean
    'reward.minimumstake'?: string
    'reward.proposerupdateinterval'?: number
    'reward.stakingupdateinterval'?: number
}

export interface StakingInformation {
    BlockNum: number
    CouncilNodeAddrs: string[]
    CouncilRewardAddrs: string[]
    CouncilStakingAddrs: string[]
    CouncilStakingAmounts: number[]
    Gini: number
    KIRAddr: string
    PoCAddr: string
    UseGini: boolean
}

export class Governance {
    constructor(...args: any[])

    vote(key: string, value: string | number | boolean, callback?: (error: Error, result: string) => void): Promise<string>
    showTally(callback?: (error: Error, result: Tally[]) => void): Promise<Tally[]>
    getTotalVotingPower(callback?: (error: Error, result: number) => void): Promise<number>
    getMyVotingPower(callback?: (error: Error, result: number) => void): Promise<number>
    getMyVotes(callback?: (error: Error, result: MyVote[]) => void): Promise<MyVote[]>
    getChainConfig(callback?: (error: Error, result: ChainConfig) => void): Promise<ChainConfig>
    getNodeAddress(callback?: (error: Error, result: string) => void): Promise<string>
    getItemsAt(blockNumber: BlockNumber, callback?: (error: Error, result: GovernanceItems) => void): Promise<GovernanceItems>
    getPendingChanges(callback?: (error: Error, result: VoteItems) => void): Promise<VoteItems>
    getVotes(callback?: (error: Error, result: Vote[]) => void): Promise<Vote[]>
    getIdxCache(callback?: (error: Error, result: number[]) => void): Promise<number[]>
    getIdxCacheFromDb(callback?: (error: Error, result: number[]) => void): Promise<number[]>
    getItemCacheFromDb(
        blockNumber: number | BN | BigNumber | string,
        callback?: (error: Error, result: GovernanceItems) => void
    ): Promise<GovernanceItems>
    getStakingInfo(callback?: (error: Error, result: StakingInformation) => void): Promise<StakingInformation>
    getStakingInfo(blockNumber: BlockNumber, callback?: (error: Error, result: StakingInformation) => void): Promise<StakingInformation>
}
