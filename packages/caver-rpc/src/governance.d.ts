import Method from '../../caver-core-method/src'

export interface TallyObject {
    ApprovalPercentage: number
    Key: string
    Value: string | number
}

export interface VoteObject {
    BlockNum?: number
    Casted?: boolean
    Key?: string
    Value?: string | number
    key?: string
    validator?: string
    value?: string | number
}

export interface ChainConfigObject {
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

export interface DomainFieldObject {
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

export interface StakingInformationObject {
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