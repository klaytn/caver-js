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

import Method from '../../caver-core-method/src'

export interface Tally {
    ApprovalPercentage: number
    Key: string
    Value: string | number
}

export interface Vote {
    BlockNum?: number
    Casted?: boolean
    Key?: string
    Value?: string | number
    key?: string
    validator?: string
    value?: string | number
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

export interface GovernanceInformation {
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

export default class GovernanceRPC {
    constructor(...args: any[])

    vote: {
        method: Method
        request: Function
        (key: string, value: string | number): Promise<string>
    }
    showTally: {
        method: Method
        request: Function
        (): Promise<TallyObject>
    }
    getTotalVotingPower: {
        method: Method
        request: Function
        (): Promise<number>
    }
    getMyVotingPower: {
        method: Method
        request: Function
        (): Promise<number>
    }
    getMyVotes: {
        method: Method
        request: Function
        (): Promise<VoteObject[]>
    }
    getChainConfig: {
        method: Method
        request: Function
        (): Promise<ChainConfigObject>
    }
    getNodeAddress: {
        method: Method
        request: Function
        (): Promise<string>
    }
    getItemsAt: {
        method: Method
        request: Function
        (index: number): Promise<DomainFieldObject>
    }
    getPendingChanges: {
        method: Method
        request: Function
        (): Promise<DomainFieldObject>
    }
    getVotes: {
        method: Method
        request: Function
        (): Promise<VoteObject[]>
    }
    getIdxCache: {
        method: Method
        request: Function
        (): Promise<number[]>
    }
    getIdxCacheFromDb: {
        method: Method
        request: Function
        (): Promise<number[]>
    }
    getItemCacheFromDb: {
        method: Method
        request: Function
        (index: number): Promise<DomainFieldObject>
    }
    getStakingInfo: {
        method: Method
        request: Function
        (blockTag?: string): Promise<StakingInformationObject>
    }
}
