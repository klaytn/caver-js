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

import * as net from 'net'
import BN = require('bn.js')
import BigNumber from 'bignumber.js'
import Caver, {
    RPC,
    Net,
    Governance,
    HttpProvider,
    RequestManager,
    AccountKeyLegacy,
    AccountKeyPublic,
    AccountKeyFail,
    AccountKeyWeightedMultiSig,
    WeightedPublicKey,
    AccountKeyRoleBased,
    AccountKeyForRPC,
    AccountForRPC,
    Block,
    TransactionReceipt,
    BlockWithConsensusInfo,
    Syncing,
    TransactionForRPC,
    RLPEncodedTransaction,
    DecodedAnchoringTransaction,
    PeerCountByType,
    ValueTransfer,
    FeeDelegatedValueTransfer,
    FeeDelegatedValueTransferWithRatio,
    Log,
    LogObject,
    Tally,
    MyVote,
    ChainConfig,
    GovernanceItems,
    VoteItems,
    Vote,
    StakingInformation,
} from 'caver-js'

const caver = new Caver()

// $ExpectType RPC
caver.rpc

// $ExpectType Klay
caver.rpc.klay

// $ExpectType Net
caver.rpc.net

// $ExpectType Governance
caver.rpc.governance

const provider = new HttpProvider('http://localhost:8551')
const requestManager = new RequestManager(provider)
const netSocket = new net.Socket()

// $ExpectType RPC
let rpc = new RPC()
// $ExpectType RPC
rpc = new RPC(provider)
// $ExpectType RPC
rpc = new RPC(provider, netSocket)

// $ExpectType boolean
rpc.setRequestManager(requestManager)

// $ExpectType void
rpc.setProvider(provider)
// $ExpectType void
rpc.setProvider(provider, netSocket)

// $ExpectType Promise<boolean>
rpc.klay.accountCreated('address')
// $ExpectType Promise<boolean>
rpc.klay.accountCreated('address', 1)
// $ExpectType Promise<boolean>
rpc.klay.accountCreated('address', '0x1')
// $ExpectType Promise<boolean>
rpc.klay.accountCreated('address', 'latest')
// $ExpectType Promise<boolean>
rpc.klay.accountCreated('address', new BigNumber(10))
// $ExpectType Promise<boolean>
rpc.klay.accountCreated('address', new BN(10))
// $ExpectType Promise<boolean>
rpc.klay.accountCreated('address', (err: Error, ret: boolean) => {})
// $ExpectType Promise<boolean>
rpc.klay.accountCreated('address', 1, (err: Error, ret: boolean) => {})
// $ExpectType Promise<boolean>
rpc.klay.accountCreated('address', '0x1', (err: Error, ret: boolean) => {})
// $ExpectType Promise<boolean>
rpc.klay.accountCreated('address', 'latest', (err: Error, ret: boolean) => {})
// $ExpectType Promise<boolean>
rpc.klay.accountCreated('address', new BigNumber(10), (err: Error, ret: boolean) => {})
// $ExpectType Promise<boolean>
rpc.klay.accountCreated('address', new BN(10), (err: Error, ret: boolean) => {})

// $ExpectType Promise<string[]>
rpc.klay.getAccounts()
// $ExpectType Promise<string[]>
rpc.klay.getAccounts((err: Error, ret: string[]) => {})

const pubKeys = [
    '0x91245244462b3eee6436d3dc0ba3f69ef413fe2296c729733eff891a55f70c02f2b0870653417943e795e7c8694c4f8be8af865b7a0224d1dec0bf8a1bf1b5a6',
    '0x77e05dd93cdd6362f8648447f33d5676cbc5f42f4c4946ae1ad62bd4c0c4f3570b1a104b67d1cd169bbf61dd557f15ab5ee8b661326096954caddadf34ae6ac8',
    '0xd3bb14320d87eed081ae44740b5abbc52bac2c7ccf85b6281a0fc69f3ba4c171cc4bd2ba7f0c969cd72bfa49c854d8ac2cf3d0edea7f0ce0fd31cf080374935d',
]
const weigthedPublicKeys = [
    new WeightedPublicKey(1, pubKeys[0]),
    new WeightedPublicKey(1, pubKeys[1]),
    new WeightedPublicKey(1, pubKeys[2]),
]
const accountKeys = {
    legacy: new AccountKeyLegacy(),
    public: new AccountKeyPublic(pubKeys[0]),
    fail: new AccountKeyFail(),
    weightedMultisig: new AccountKeyWeightedMultiSig(3, weigthedPublicKeys),
    roleBased: new AccountKeyRoleBased([
        new AccountKeyPublic(pubKeys[0]),
        new AccountKeyWeightedMultiSig(3, weigthedPublicKeys),
        new AccountKeyLegacy(),
    ]),
}
const accountKeysForRPC = {
    legacy: { keyType: 1, key: {} },
    public: {
        keyType: 2,
        key: {
            x: '0xdbac81e8486d68eac4e6ef9db617f7fbd79a04a3b323c982a09cdfc61f0ae0e8',
            y: '0x906d7170ba349c86879fb8006134cbf57bda9db9214a90b607b6b4ab57fc026e',
        },
    },
    fail: { keyType: 3, key: {} },
    weightedMultisig: {
        keyType: 4,
        key: {
            threshold: 2,
            keys: [
                {
                    weight: 1,
                    key: {
                        x: '0xc734b50ddb229be5e929fc4aa8080ae8240a802d23d3290e5e6156ce029b110e',
                        y: '0x61a443ac3ffff164d1fb3617875f07641014cf17af6b7dc38e429fe838763712',
                    },
                },
                {
                    weight: 1,
                    key: {
                        x: '0x12d45f1cc56fbd6cd8fc877ab63b5092ac77db907a8a42c41dad3e98d7c64dfb',
                        y: '0x8ef355a8d524eb444eba507f236309ce08370debaa136cb91b2f445774bff842',
                    },
                },
            ],
        },
    },
    roleBased: {
        keyType: 5,
        key: [
            {
                keyType: 2,
                key: {
                    x: '0xe4a01407460c1c03ac0c82fd84f303a699b210c0b054f4aff72ff7dcdf01512d',
                    y: '0xa5735a23ce1654b14680054a993441eae7c261983a56f8e0da61280758b5919',
                },
            },
            {
                keyType: 4,
                key: {
                    threshold: 2,
                    keys: [
                        {
                            weight: 1,
                            key: {
                                x: '0xe4a01407460c1c03ac0c82fd84f303a699b210c0b054f4aff72ff7dcdf01512d',
                                y: '0xa5735a23ce1654b14680054a993441eae7c261983a56f8e0da61280758b5919',
                            },
                        },
                        {
                            weight: 1,
                            key: {
                                x: '0x36f6355f5b532c3c1606f18fa2be7a16ae200c5159c8031dd25bfa389a4c9c06',
                                y: '0x6fdf9fc87a16ac359e66d9761445d5ccbb417fb7757a3f5209d713824596a50d',
                            },
                        },
                    ],
                },
            },
            {
                keyType: 2,
                key: {
                    x: '0xc8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f081447',
                    y: '0x94c27901465af0a703859ab47f8ae17e54aaba453b7cde5a6a9e4a32d45d72b2',
                },
            },
        ],
    },
}

// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeys.legacy)
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeys.public)
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeys.fail)
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeys.weightedMultisig)
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeys.roleBased)
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeysForRPC.legacy)
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeysForRPC.public)
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeysForRPC.fail)
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeysForRPC.weightedMultisig)
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeysForRPC.roleBased)
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeys.legacy, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeys.public, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeys.fail, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeys.weightedMultisig, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeys.roleBased, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeysForRPC.legacy, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeysForRPC.public, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeysForRPC.fail, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeysForRPC.weightedMultisig, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.encodeAccountKey(accountKeysForRPC.roleBased, (err: Error, ret: string) => {})

// $ExpectType Promise<AccountKeyForRPC>
rpc.klay.decodeAccountKey('rlpEncoded', (err: Error, ret: AccountKeyForRPC) => {})
// $ExpectType Promise<AccountKeyForRPC>
rpc.klay.decodeAccountKey('rlpEncoded', (err: Error, ret: AccountKeyForRPC) => {})

// $ExpectType Promise<AccountForRPC>
rpc.klay.getAccount('address')
// $ExpectType Promise<AccountForRPC>
rpc.klay.getAccount('address', 1)
// $ExpectType Promise<AccountForRPC>
rpc.klay.getAccount('address', '0x1')
// $ExpectType Promise<AccountForRPC>
rpc.klay.getAccount('address', 'latest')
// $ExpectType Promise<AccountForRPC>
rpc.klay.getAccount('address', new BigNumber(10))
// $ExpectType Promise<AccountForRPC>
rpc.klay.getAccount('address', new BN(10))
// $ExpectType Promise<AccountForRPC>
rpc.klay.getAccount('address', (err: Error, ret: AccountForRPC) => {})
// $ExpectType Promise<AccountForRPC>
rpc.klay.getAccount('address', 1, (err: Error, ret: AccountForRPC) => {})
// $ExpectType Promise<AccountForRPC>
rpc.klay.getAccount('address', '0x1', (err: Error, ret: AccountForRPC) => {})
// $ExpectType Promise<AccountForRPC>
rpc.klay.getAccount('address', 'latest', (err: Error, ret: AccountForRPC) => {})
// $ExpectType Promise<AccountForRPC>
rpc.klay.getAccount('address', new BigNumber(10), (err: Error, ret: AccountForRPC) => {})
// $ExpectType Promise<AccountForRPC>
rpc.klay.getAccount('address', new BN(10), (err: Error, ret: AccountForRPC) => {})

// $ExpectType Promise<AccountKeyForRPC>
rpc.klay.getAccountKey('address')
// $ExpectType Promise<AccountKeyForRPC>
rpc.klay.getAccountKey('address', 1)
// $ExpectType Promise<AccountKeyForRPC>
rpc.klay.getAccountKey('address', '0x1')
// $ExpectType Promise<AccountKeyForRPC>
rpc.klay.getAccountKey('address', 'latest')
// $ExpectType Promise<AccountKeyForRPC>
rpc.klay.getAccountKey('address', new BigNumber(10))
// $ExpectType Promise<AccountKeyForRPC>
rpc.klay.getAccountKey('address', new BN(10))
// $ExpectType Promise<AccountKeyForRPC>
rpc.klay.getAccountKey('address', (err: Error, ret: AccountKeyForRPC) => {})
// $ExpectType Promise<AccountKeyForRPC>
rpc.klay.getAccountKey('address', 1, (err: Error, ret: AccountKeyForRPC) => {})
// $ExpectType Promise<AccountKeyForRPC>
rpc.klay.getAccountKey('address', '0x1', (err: Error, ret: AccountKeyForRPC) => {})
// $ExpectType Promise<AccountKeyForRPC>
rpc.klay.getAccountKey('address', 'latest', (err: Error, ret: AccountKeyForRPC) => {})
// $ExpectType Promise<AccountKeyForRPC>
rpc.klay.getAccountKey('address', new BigNumber(10), (err: Error, ret: AccountKeyForRPC) => {})
// $ExpectType Promise<AccountKeyForRPC>
rpc.klay.getAccountKey('address', new BN(10), (err: Error, ret: AccountKeyForRPC) => {})

// $ExpectType Promise<string>
rpc.klay.getBalance('address')
// $ExpectType Promise<string>
rpc.klay.getBalance('address', 1)
// $ExpectType Promise<string>
rpc.klay.getBalance('address', '0x1')
// $ExpectType Promise<string>
rpc.klay.getBalance('address', 'latest')
// $ExpectType Promise<string>
rpc.klay.getBalance('address', new BigNumber(10))
// $ExpectType Promise<string>
rpc.klay.getBalance('address', new BN(10))
// $ExpectType Promise<string>
rpc.klay.getBalance('address', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getBalance('address', 1, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getBalance('address', '0x1', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getBalance('address', 'latest', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getBalance('address', new BigNumber(10), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getBalance('address', new BN(10), (err: Error, ret: string) => {})

// $ExpectType Promise<string>
rpc.klay.getCode('address')
// $ExpectType Promise<string>
rpc.klay.getCode('address', 1)
// $ExpectType Promise<string>
rpc.klay.getCode('address', '0x1')
// $ExpectType Promise<string>
rpc.klay.getCode('address', 'latest')
// $ExpectType Promise<string>
rpc.klay.getCode('address', new BigNumber(10))
// $ExpectType Promise<string>
rpc.klay.getCode('address', new BN(10))
// $ExpectType Promise<string>
rpc.klay.getCode('address', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getCode('address', 1, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getCode('address', '0x1', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getCode('address', 'latest', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getCode('address', new BigNumber(10), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getCode('address', new BN(10), (err: Error, ret: string) => {})

// $ExpectType Promise<string>
rpc.klay.getTransactionCount('address')
// $ExpectType Promise<string>
rpc.klay.getTransactionCount('address', 1)
// $ExpectType Promise<string>
rpc.klay.getTransactionCount('address', '0x1')
// $ExpectType Promise<string>
rpc.klay.getTransactionCount('address', 'latest')
// $ExpectType Promise<string>
rpc.klay.getTransactionCount('address', new BigNumber(10))
// $ExpectType Promise<string>
rpc.klay.getTransactionCount('address', new BN(10))
// $ExpectType Promise<string>
rpc.klay.getTransactionCount('address', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getTransactionCount('address', 1, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getTransactionCount('address', '0x1', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getTransactionCount('address', 'latest', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getTransactionCount('address', new BigNumber(10), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getTransactionCount('address', new BN(10), (err: Error, ret: string) => {})

// $ExpectType Promise<boolean>
rpc.klay.isContractAccount('address')
// $ExpectType Promise<boolean>
rpc.klay.isContractAccount('address', 1)
// $ExpectType Promise<boolean>
rpc.klay.isContractAccount('address', '0x1')
// $ExpectType Promise<boolean>
rpc.klay.isContractAccount('address', 'latest')
// $ExpectType Promise<boolean>
rpc.klay.isContractAccount('address', new BigNumber(10))
// $ExpectType Promise<boolean>
rpc.klay.isContractAccount('address', new BN(10))
// $ExpectType Promise<boolean>
rpc.klay.isContractAccount('address', (err: Error, ret: boolean) => {})
// $ExpectType Promise<boolean>
rpc.klay.isContractAccount('address', 1, (err: Error, ret: boolean) => {})
// $ExpectType Promise<boolean>
rpc.klay.isContractAccount('address', '0x1', (err: Error, ret: boolean) => {})
// $ExpectType Promise<boolean>
rpc.klay.isContractAccount('address', 'latest', (err: Error, ret: boolean) => {})
// $ExpectType Promise<boolean>
rpc.klay.isContractAccount('address', new BigNumber(10), (err: Error, ret: boolean) => {})
// $ExpectType Promise<boolean>
rpc.klay.isContractAccount('address', new BN(10), (err: Error, ret: boolean) => {})

// $ExpectType Promise<string>
rpc.klay.sign('address', 'message')
// $ExpectType Promise<string>
rpc.klay.sign('address', 'message', 1)
// $ExpectType Promise<string>
rpc.klay.sign('address', 'message', '0x1')
// $ExpectType Promise<string>
rpc.klay.sign('address', 'message', 'latest')
// $ExpectType Promise<string>
rpc.klay.sign('address', 'message', new BigNumber(10))
// $ExpectType Promise<string>
rpc.klay.sign('address', 'message', new BN(10))
// $ExpectType Promise<string>
rpc.klay.sign('address', 'message', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.sign('address', 'message', 1, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.sign('address', 'message', '0x1', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.sign('address', 'message', 'latest', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.sign('address', 'message', new BigNumber(10), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.sign('address', 'message', new BN(10), (err: Error, ret: string) => {})

// $ExpectType Promise<string>
rpc.klay.getBlockNumber()
// $ExpectType Promise<string>
rpc.klay.getBlockNumber((err: Error, ret: string) => {})

// $ExpectType Promise<Block>
rpc.klay.getBlock(1)
// $ExpectType Promise<Block>
rpc.klay.getBlock('hash')
// $ExpectType Promise<Block>
rpc.klay.getBlock('latest')
// $ExpectType Promise<Block>
rpc.klay.getBlock(new BigNumber(10))
// $ExpectType Promise<Block>
rpc.klay.getBlock(new BN(10))
// $ExpectType Promise<Block>
rpc.klay.getBlock(1, true)
// $ExpectType Promise<Block>
rpc.klay.getBlock('hash', true)
// $ExpectType Promise<Block>
rpc.klay.getBlock('latest', true)
// $ExpectType Promise<Block>
rpc.klay.getBlock(new BigNumber(10), true)
// $ExpectType Promise<Block>
rpc.klay.getBlock(new BN(10), true)
// $ExpectType Promise<Block>
rpc.klay.getBlock(1, (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlock('hash', (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlock('latest', (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlock(new BigNumber(10), (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlock(new BN(10), (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlock(1, true, (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlock('hash', true, (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlock('latest', true, (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlock(new BigNumber(10), true, (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlock(new BN(10), true, (err: Error, ret: Block) => {})

// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber(1)
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber(new BigNumber(10))
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber(new BN(10))
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber('genesis')
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber('latest')
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber(1, true)
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber(new BigNumber(10), true)
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber(new BN(10), true)
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber('genesis', true)
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber('latest', true)
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber(1, (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber(new BigNumber(10), (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber(new BN(10), (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber('genesis', (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber('latest', (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber(1, true, (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber(new BigNumber(10), true, (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber(new BN(10), true, (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber('genesis', true, (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlockByNumber('latest', true, (err: Error, ret: Block) => {})

// $ExpectType Promise<Block>
rpc.klay.getBlockByHash('hash')
// $ExpectType Promise<Block>
rpc.klay.getBlockByHash('hash', true)
// $ExpectType Promise<Block>
rpc.klay.getBlockByHash('hash', (err: Error, ret: Block) => {})
// $ExpectType Promise<Block>
rpc.klay.getBlockByHash('hash', true, (err: Error, ret: Block) => {})

// $ExpectType Promise<TransactionReceipt[]>
rpc.klay.getBlockReceipts('hash')
// $ExpectType Promise<TransactionReceipt[]>
rpc.klay.getBlockReceipts('hash', (err: Error, ret: TransactionReceipt[]) => {})

// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCount(0)
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCount(new BigNumber(0))
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCount(new BN(0))
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCount('genesis')
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCount('latest')
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCount('hash')
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCount(0, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCount(new BigNumber(0), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCount(new BN(0), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCount('genesis', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCount('latest', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCount('hash', (err: Error, ret: string) => {})

// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCountByNumber(0)
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCountByNumber(new BigNumber(0))
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCountByNumber(new BN(0))
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCountByNumber('genesis')
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCountByNumber('latest')
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCountByNumber(0, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCountByNumber(new BigNumber(0), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCountByNumber(new BN(0), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCountByNumber('genesis', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCountByNumber('latest', (err: Error, ret: string) => {})

// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCountByHash('hash')
// $ExpectType Promise<string>
rpc.klay.getBlockTransactionCountByHash('hash', (err: Error, ret: string) => {})

// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfo(0)
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfo(new BigNumber(0))
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfo(new BN(0))
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfo('genesis')
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfo('latest')
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfo('hash')
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfo(0, (err: Error, ret: BlockWithConsensusInfo) => {})
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfo(new BigNumber(0), (err: Error, ret: BlockWithConsensusInfo) => {})
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfo(new BN(0), (err: Error, ret: BlockWithConsensusInfo) => {})
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfo('genesis', (err: Error, ret: BlockWithConsensusInfo) => {})
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfo('latest', (err: Error, ret: BlockWithConsensusInfo) => {})
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfo('hash', (err: Error, ret: BlockWithConsensusInfo) => {})

// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfoByNumber(0)
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfoByNumber(new BigNumber(0))
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfoByNumber(new BN(0))
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfoByNumber('genesis')
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfoByNumber('latest')
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfoByNumber(0, (err: Error, ret: BlockWithConsensusInfo) => {})
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfoByNumber(new BigNumber(0), (err: Error, ret: BlockWithConsensusInfo) => {})
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfoByNumber(new BN(0), (err: Error, ret: BlockWithConsensusInfo) => {})
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfoByNumber('genesis', (err: Error, ret: BlockWithConsensusInfo) => {})
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfoByNumber('latest', (err: Error, ret: BlockWithConsensusInfo) => {})

// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfoByHash('hash')
// $ExpectType Promise<BlockWithConsensusInfo>
rpc.klay.getBlockWithConsensusInfoByHash('hash', (err: Error, ret: BlockWithConsensusInfo) => {})

// $ExpectType Promise<string[]>
rpc.klay.getCommittee(0)
// $ExpectType Promise<string[]>
rpc.klay.getCommittee(new BigNumber(0))
// $ExpectType Promise<string[]>
rpc.klay.getCommittee(new BN(0))
// $ExpectType Promise<string[]>
rpc.klay.getCommittee('genesis')
// $ExpectType Promise<string[]>
rpc.klay.getCommittee('latest')
// $ExpectType Promise<string[]>
rpc.klay.getCommittee('hash')
// $ExpectType Promise<string[]>
rpc.klay.getCommittee(0, (err: Error, ret: string[]) => {})
// $ExpectType Promise<string[]>
rpc.klay.getCommittee(new BigNumber(0), (err: Error, ret: string[]) => {})
// $ExpectType Promise<string[]>
rpc.klay.getCommittee(new BN(0), (err: Error, ret: string[]) => {})
// $ExpectType Promise<string[]>
rpc.klay.getCommittee('genesis', (err: Error, ret: string[]) => {})
// $ExpectType Promise<string[]>
rpc.klay.getCommittee('latest', (err: Error, ret: string[]) => {})
// $ExpectType Promise<string[]>
rpc.klay.getCommittee('hash', (err: Error, ret: string[]) => {})

// $ExpectType Promise<number>
rpc.klay.getCommitteeSize(0)
// $ExpectType Promise<number>
rpc.klay.getCommitteeSize(new BigNumber(0))
// $ExpectType Promise<number>
rpc.klay.getCommitteeSize(new BN(0))
// $ExpectType Promise<number>
rpc.klay.getCommitteeSize('genesis')
// $ExpectType Promise<number>
rpc.klay.getCommitteeSize('latest')
// $ExpectType Promise<number>
rpc.klay.getCommitteeSize('hash')
// $ExpectType Promise<number>
rpc.klay.getCommitteeSize(0, (err: Error, ret: number) => {})
// $ExpectType Promise<number>
rpc.klay.getCommitteeSize(new BigNumber(0), (err: Error, ret: number) => {})
// $ExpectType Promise<number>
rpc.klay.getCommitteeSize(new BN(0), (err: Error, ret: number) => {})
// $ExpectType Promise<number>
rpc.klay.getCommitteeSize('genesis', (err: Error, ret: number) => {})
// $ExpectType Promise<number>
rpc.klay.getCommitteeSize('latest', (err: Error, ret: number) => {})
// $ExpectType Promise<number>
rpc.klay.getCommitteeSize('hash', (err: Error, ret: number) => {})

// $ExpectType Promise<string[]>
rpc.klay.getCouncil(0)
// $ExpectType Promise<string[]>
rpc.klay.getCouncil(new BigNumber(0))
// $ExpectType Promise<string[]>
rpc.klay.getCouncil(new BN(0))
// $ExpectType Promise<string[]>
rpc.klay.getCouncil('genesis')
// $ExpectType Promise<string[]>
rpc.klay.getCouncil('latest')
// $ExpectType Promise<string[]>
rpc.klay.getCouncil('hash')
// $ExpectType Promise<string[]>
rpc.klay.getCouncil(0, (err: Error, ret: string[]) => {})
// $ExpectType Promise<string[]>
rpc.klay.getCouncil(new BigNumber(0), (err: Error, ret: string[]) => {})
// $ExpectType Promise<string[]>
rpc.klay.getCouncil(new BN(0), (err: Error, ret: string[]) => {})
// $ExpectType Promise<string[]>
rpc.klay.getCouncil('genesis', (err: Error, ret: string[]) => {})
// $ExpectType Promise<string[]>
rpc.klay.getCouncil('latest', (err: Error, ret: string[]) => {})
// $ExpectType Promise<string[]>
rpc.klay.getCouncil('hash', (err: Error, ret: string[]) => {})

// $ExpectType Promise<number>
rpc.klay.getCouncilSize(0)
// $ExpectType Promise<number>
rpc.klay.getCouncilSize(new BigNumber(0))
// $ExpectType Promise<number>
rpc.klay.getCouncilSize(new BN(0))
// $ExpectType Promise<number>
rpc.klay.getCouncilSize('genesis')
// $ExpectType Promise<number>
rpc.klay.getCouncilSize('latest')
// $ExpectType Promise<number>
rpc.klay.getCouncilSize('hash')
// $ExpectType Promise<number>
rpc.klay.getCouncilSize(0, (err: Error, ret: number) => {})
// $ExpectType Promise<number>
rpc.klay.getCouncilSize(new BigNumber(0), (err: Error, ret: number) => {})
// $ExpectType Promise<number>
rpc.klay.getCouncilSize(new BN(0), (err: Error, ret: number) => {})
// $ExpectType Promise<number>
rpc.klay.getCouncilSize('genesis', (err: Error, ret: number) => {})
// $ExpectType Promise<number>
rpc.klay.getCouncilSize('latest', (err: Error, ret: number) => {})
// $ExpectType Promise<number>
rpc.klay.getCouncilSize('hash', (err: Error, ret: number) => {})

// $ExpectType Promise<string>
rpc.klay.getStorageAt('address', 0)
// $ExpectType Promise<string>
rpc.klay.getStorageAt('address', 0, new BigNumber(0))
// $ExpectType Promise<string>
rpc.klay.getStorageAt('address', 0, new BN(0))
// $ExpectType Promise<string>
rpc.klay.getStorageAt('address', 0, 'genesis')
// $ExpectType Promise<string>
rpc.klay.getStorageAt('address', 0, 'latest')
// $ExpectType Promise<string>
rpc.klay.getStorageAt('address', 0, 'hash')
// $ExpectType Promise<string>
rpc.klay.getStorageAt('address', 0, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getStorageAt('address', 0, 0, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getStorageAt('address', 0, new BigNumber(0), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getStorageAt('address', 0, new BN(0), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getStorageAt('address', 0, 'genesis', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getStorageAt('address', 0, 'latest', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getStorageAt('address', 0, 'hash', (err: Error, ret: string) => {})

// $ExpectType Promise<boolean>
rpc.klay.isMining()
// $ExpectType Promise<boolean>
rpc.klay.isMining((err: Error, ret: boolean) => {})

// $ExpectType Promise<boolean | Syncing>
rpc.klay.isSyncing()
// $ExpectType Promise<boolean | Syncing>
rpc.klay.isSyncing((err: Error, ret: Syncing | boolean) => {})

// $ExpectType Promise<string>
rpc.klay.call({ from: 'address' })
// $ExpectType Promise<string>
rpc.klay.call({ from: 'address' }, new BigNumber(0))
// $ExpectType Promise<string>
rpc.klay.call({ from: 'address' }, new BN(0))
// $ExpectType Promise<string>
rpc.klay.call({ from: 'address' }, 'genesis')
// $ExpectType Promise<string>
rpc.klay.call({ from: 'address' }, 'latest')
// $ExpectType Promise<string>
rpc.klay.call({ from: 'address' }, 'hash')
// $ExpectType Promise<string>
rpc.klay.call({ from: 'address' }, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.call({ from: 'address' }, 0, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.call({ from: 'address' }, new BigNumber(0), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.call({ from: 'address' }, new BN(0), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.call({ from: 'address' }, 'genesis', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.call({ from: 'address' }, 'latest', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.call({ from: 'address' }, 'hash', (err: Error, ret: string) => {})

// $ExpectType Promise<string>
rpc.klay.estimateGas({ from: 'address' })
// $ExpectType Promise<string>
rpc.klay.estimateGas({ from: 'address' }, new BigNumber(0))
// $ExpectType Promise<string>
rpc.klay.estimateGas({ from: 'address' }, new BN(0))
// $ExpectType Promise<string>
rpc.klay.estimateGas({ from: 'address' }, 'genesis')
// $ExpectType Promise<string>
rpc.klay.estimateGas({ from: 'address' }, 'latest')
// $ExpectType Promise<string>
rpc.klay.estimateGas({ from: 'address' }, 'hash')
// $ExpectType Promise<string>
rpc.klay.estimateGas({ from: 'address' }, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.estimateGas({ from: 'address' }, 0, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.estimateGas({ from: 'address' }, new BigNumber(0), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.estimateGas({ from: 'address' }, new BN(0), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.estimateGas({ from: 'address' }, 'genesis', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.estimateGas({ from: 'address' }, 'latest', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.estimateGas({ from: 'address' }, 'hash', (err: Error, ret: string) => {})

// $ExpectType Promise<string>
rpc.klay.estimateComputationCost({ from: 'address' })
// $ExpectType Promise<string>
rpc.klay.estimateComputationCost({ from: 'address' }, new BigNumber(0))
// $ExpectType Promise<string>
rpc.klay.estimateComputationCost({ from: 'address' }, new BN(0))
// $ExpectType Promise<string>
rpc.klay.estimateComputationCost({ from: 'address' }, 'genesis')
// $ExpectType Promise<string>
rpc.klay.estimateComputationCost({ from: 'address' }, 'latest')
// $ExpectType Promise<string>
rpc.klay.estimateComputationCost({ from: 'address' }, 'hash')
// $ExpectType Promise<string>
rpc.klay.estimateComputationCost({ from: 'address' }, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.estimateComputationCost({ from: 'address' }, 0, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.estimateComputationCost({ from: 'address' }, new BigNumber(0), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.estimateComputationCost({ from: 'address' }, new BN(0), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.estimateComputationCost({ from: 'address' }, 'genesis', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.estimateComputationCost({ from: 'address' }, 'latest', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.estimateComputationCost({ from: 'address' }, 'hash', (err: Error, ret: string) => {})

// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionFromBlock(0, 0)
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionFromBlock(new BigNumber(0), 0)
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionFromBlock(new BN(0), 0)
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionFromBlock('genesis', 0)
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionFromBlock('latest', 0)
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionFromBlock('hash', 0)
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionFromBlock(0, 0, (err: Error, ret: TransactionForRPC) => {})
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionFromBlock(new BigNumber(0), 0, (err: Error, ret: TransactionForRPC) => {})
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionFromBlock(new BN(0), 0, (err: Error, ret: TransactionForRPC) => {})
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionFromBlock('genesis', 0, (err: Error, ret: TransactionForRPC) => {})
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionFromBlock('latest', 0, (err: Error, ret: TransactionForRPC) => {})
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionFromBlock('hash', 0, (err: Error, ret: TransactionForRPC) => {})

// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionByBlockNumberAndIndex(new BigNumber(0), 0)
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionByBlockNumberAndIndex(new BN(0), 0)
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionByBlockNumberAndIndex('genesis', 0)
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionByBlockNumberAndIndex('latest', 0)
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionByBlockNumberAndIndex(0, 0, (err: Error, ret: TransactionForRPC) => {})
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionByBlockNumberAndIndex(new BigNumber(0), 0, (err: Error, ret: TransactionForRPC) => {})
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionByBlockNumberAndIndex(new BN(0), 0, (err: Error, ret: TransactionForRPC) => {})
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionByBlockNumberAndIndex('genesis', 0, (err: Error, ret: TransactionForRPC) => {})
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionByBlockNumberAndIndex('latest', 0, (err: Error, ret: TransactionForRPC) => {})

// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionByBlockHashAndIndex('hash', 0)
// $ExpectType Promise<TransactionForRPC>
rpc.klay.getTransactionByBlockHashAndIndex('hash', 0, (err: Error, ret: TransactionForRPC) => {})

// $ExpectType Promise<TransactionForRPC | null>
rpc.klay.getTransaction('hash')
// $ExpectType Promise<TransactionForRPC | null>
rpc.klay.getTransaction('hash', (err: Error, ret: TransactionForRPC | null) => {})

// $ExpectType Promise<TransactionForRPC | null>
rpc.klay.getTransactionByHash('hash')
// $ExpectType Promise<TransactionForRPC | null>
rpc.klay.getTransactionByHash('hash', (err: Error, ret: TransactionForRPC | null) => {})

// $ExpectType Promise<TransactionForRPC | null>
rpc.klay.getTransactionBySenderTxHash('hash')
// $ExpectType Promise<TransactionForRPC | null>
rpc.klay.getTransactionBySenderTxHash('hash', (err: Error, ret: TransactionForRPC | null) => {})

// $ExpectType Promise<TransactionReceipt | null>
rpc.klay.getTransactionReceipt('hash')
// $ExpectType Promise<TransactionReceipt | null>
rpc.klay.getTransactionReceipt('hash', (err: Error, ret: TransactionReceipt | null) => {})

const txs = {
    basic: ValueTransfer.create({
        from: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
        to: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
        value: 1,
        gas: 25000,
    }),
    fd: FeeDelegatedValueTransfer.create({
        from: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
        to: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
        feePayer: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
        value: 1,
        gas: 25000,
    }),
    fdr: FeeDelegatedValueTransferWithRatio.create({
        from: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
        to: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
        feePayer: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
        feeRatio: 10,
        value: 1,
        gas: 25000,
    }),
}

// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.submitTransaction('signedTx')
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.submitTransaction(txs.basic)
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.submitTransaction(txs.fd)
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.submitTransaction(txs.fdr)
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.submitTransaction('signedTx', (err: Error, ret: string) => {})
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.submitTransaction(txs.basic, (err: Error, ret: string) => {})
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.submitTransaction(txs.fd, (err: Error, ret: string) => {})
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.submitTransaction(txs.fdr, (err: Error, ret: string) => {})

// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendRawTransaction('signedTx')
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendRawTransaction(txs.basic)
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendRawTransaction(txs.fd)
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendRawTransaction(txs.fdr)
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendRawTransaction('signedTx', (err: Error, ret: string) => {})
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendRawTransaction(txs.basic, (err: Error, ret: string) => {})
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendRawTransaction(txs.fd, (err: Error, ret: string) => {})
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendRawTransaction(txs.fdr, (err: Error, ret: string) => {})

// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendTransaction({
    type: 'VALUE_TRANSFER',
    from: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
    to: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
    value: 1,
    gas: 25000,
})
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendTransaction({
    senderRawTransaction: 'senderRawTransaction',
    feePayer: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
})
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendTransaction(txs.basic)
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendTransaction(txs.fd)
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendTransaction(txs.fdr)
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendTransaction(
    {
        type: 'VALUE_TRANSFER',
        from: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
        to: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
        value: 1,
        gas: 25000,
    },
    (err: Error, ret: string) => {}
)
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendTransaction(
    {
        senderRawTransaction: 'senderRawTransaction',
        feePayer: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
    },
    (err: Error, ret: string) => {}
)
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendTransaction(txs.basic, (err: Error, ret: string) => {})
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendTransaction(txs.fd, (err: Error, ret: string) => {})
// $ExpectType PromiEvent<TransactionReceipt>
rpc.klay.sendTransaction(txs.fdr, (err: Error, ret: string) => {})

// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransaction({
    type: 'VALUE_TRANSFER',
    from: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
    to: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
    value: 1,
    gas: 25000,
})
// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransaction({
    senderRawTransaction: 'senderRawTransaction',
    feePayer: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
})
// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransaction(txs.basic)
// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransaction(txs.fd)
// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransaction(txs.fdr)
// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransaction(
    {
        type: 'VALUE_TRANSFER',
        from: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
        to: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
        value: 1,
        gas: 25000,
    },
    (err: Error, ret: RLPEncodedTransaction) => {}
)
// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransaction(
    {
        senderRawTransaction: 'senderRawTransaction',
        feePayer: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
    },
    (err: Error, ret: RLPEncodedTransaction) => {}
)
// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransaction(txs.basic, (err: Error, ret: RLPEncodedTransaction) => {})
// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransaction(txs.fd, (err: Error, ret: RLPEncodedTransaction) => {})
// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransaction(txs.fdr, (err: Error, ret: RLPEncodedTransaction) => {})

// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransactionAsFeePayer({
    type: 'FEE_DELEGATED_VALUE_TRANSFER',
    from: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
    to: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
    feePayer: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
    value: 1,
    gas: 25000,
})
// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransactionAsFeePayer({
    senderRawTransaction: 'senderRawTransaction',
    feePayer: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
})
// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransactionAsFeePayer(txs.fd)
// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransactionAsFeePayer(txs.fdr)
// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransactionAsFeePayer(
    {
        type: 'FEE_DELEGATED_VALUE_TRANSFER',
        from: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
        to: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
        feePayer: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
        value: 1,
        gas: 25000,
    },
    (err: Error, ret: RLPEncodedTransaction) => {}
)
// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransactionAsFeePayer(
    {
        senderRawTransaction: 'senderRawTransaction',
        feePayer: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4',
    },
    (err: Error, ret: RLPEncodedTransaction) => {}
)
// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransactionAsFeePayer(txs.fd, (err: Error, ret: RLPEncodedTransaction) => {})
// $ExpectType Promise<RLPEncodedTransaction>
rpc.klay.signTransactionAsFeePayer(txs.fdr, (err: Error, ret: RLPEncodedTransaction) => {})

// $ExpectType Promise<DecodedAnchoringTransaction>
rpc.klay.getDecodedAnchoringTransactionByHash('hash')
// $ExpectType Promise<DecodedAnchoringTransaction>
rpc.klay.getDecodedAnchoringTransactionByHash('hash', (err: Error, ret: DecodedAnchoringTransaction) => {})

// $ExpectType Promise<string>
rpc.klay.getChainId()
// $ExpectType Promise<string>
rpc.klay.getChainId((err: Error, ret: string) => {})

// $ExpectType Promise<string>
rpc.klay.getClientVersion()
// $ExpectType Promise<string>
rpc.klay.getClientVersion((err: Error, ret: string) => {})

// $ExpectType Promise<string>
rpc.klay.getGasPrice()
// $ExpectType Promise<string>
rpc.klay.getGasPrice((err: Error, ret: string) => {})

// $ExpectType Promise<string>
rpc.klay.getGasPriceAt(0)
// $ExpectType Promise<string>
rpc.klay.getGasPriceAt(new BigNumber(0))
// $ExpectType Promise<string>
rpc.klay.getGasPriceAt(new BN(0))
// $ExpectType Promise<string>
rpc.klay.getGasPriceAt('genesis')
// $ExpectType Promise<string>
rpc.klay.getGasPriceAt('latest')
// $ExpectType Promise<string>
rpc.klay.getGasPriceAt('hash')
// $ExpectType Promise<string>
rpc.klay.getGasPriceAt(0, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getGasPriceAt(new BigNumber(0), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getGasPriceAt(new BN(0), (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getGasPriceAt('genesis', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getGasPriceAt('latest', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.klay.getGasPriceAt('hash', (err: Error, ret: string) => {})

// $ExpectType Promise<boolean>
rpc.klay.isParallelDBWrite()
// $ExpectType Promise<boolean>
rpc.klay.isParallelDBWrite((err: Error, ret: boolean) => {})

// $ExpectType Promise<boolean>
rpc.klay.isSenderTxHashIndexingEnabled()
// $ExpectType Promise<boolean>
rpc.klay.isSenderTxHashIndexingEnabled((err: Error, ret: boolean) => {})

// $ExpectType Promise<string>
rpc.klay.getProtocolVersion()
// $ExpectType Promise<string>
rpc.klay.getProtocolVersion((err: Error, ret: string) => {})

// $ExpectType Promise<string>
rpc.klay.getRewardbase()
// $ExpectType Promise<string>
rpc.klay.getRewardbase((err: Error, ret: string) => {})

// $ExpectType Promise<LogObject[]>
rpc.klay.getFilterChanges('filterId')
// $ExpectType Promise<LogObject[]>
rpc.klay.getFilterChanges('filterId', (err: Error, ret: LogObject[]) => {})

// $ExpectType Promise<LogObject[]>
rpc.klay.getFilterLogs('filterId')
// $ExpectType Promise<LogObject[]>
rpc.klay.getFilterLogs('filterId', (err: Error, ret: LogObject[]) => {})

// $ExpectType Promise<Log[]>
rpc.klay.getLogs({
    fromBlock: 'genesis',
    toBlock: 'latest',
    address: 'address',
    topics: ['topic'],
})
// $ExpectType Promise<Log[]>
rpc.klay.getLogs(
    {
        fromBlock: 'genesis',
        toBlock: 'latest',
        address: 'address',
        topics: ['topic'],
    },
    (err: Error, ret: Log[]) => {}
)

// $ExpectType Promise<string>
rpc.klay.newBlockFilter()
// $ExpectType Promise<string>
rpc.klay.newBlockFilter((err: Error, ret: string) => {})

// $ExpectType Promise<string>
rpc.klay.newFilter({
    fromBlock: 'genesis',
    toBlock: 'latest',
    address: 'address',
    topics: ['topic'],
})
// $ExpectType Promise<string>
rpc.klay.newFilter(
    {
        fromBlock: 'genesis',
        toBlock: 'latest',
        address: 'address',
        topics: ['topic'],
    },
    (err: Error, ret: string) => {}
)

// $ExpectType Promise<string>
rpc.klay.newPendingTransactionFilter()
// $ExpectType Promise<string>
rpc.klay.newPendingTransactionFilter((err: Error, ret: string) => {})

// $ExpectType Promise<boolean>
rpc.klay.uninstallFilter('filterId')
// $ExpectType Promise<boolean>
rpc.klay.uninstallFilter('filterId', (err: Error, ret: boolean) => {})

// $ExpectType Promise<string>
rpc.klay.sha3('data')
// $ExpectType Promise<string>
rpc.klay.sha3('data', (err: Error, ret: string) => {})

// $ExpectType Promise<number>
rpc.net.getNetworkID()
// $ExpectType Promise<number>
rpc.net.getNetworkID((err: Error, ret: string) => {})
// $ExpectType Promise<number>
rpc.net.getNetworkId()
// $ExpectType Promise<number>
rpc.net.getNetworkId((err: Error, ret: string) => {})

// $ExpectType Promise<boolean>
rpc.net.isListening()
// $ExpectType Promise<boolean>
rpc.net.isListening((err: Error, ret: boolean) => {})

// $ExpectType Promise<string>
rpc.net.getPeerCount()
// $ExpectType Promise<string>
rpc.net.getPeerCount((err: Error, ret: string) => {})

// $ExpectType Promise<PeerCountByType>
rpc.net.getPeerCountByType()
// $ExpectType Promise<PeerCountByType>
rpc.net.getPeerCountByType((err: Error, ret: PeerCountByType) => {})

// $ExpectType Promise<string>
rpc.governance.vote('governance.governancemode', 'none')
// $ExpectType Promise<string>
rpc.governance.vote('governance.unitprice', 10)
// $ExpectType Promise<string>
rpc.governance.vote('reward.useginicoeff', false)
// $ExpectType Promise<string>
rpc.governance.vote('governance.governancemode', 'none', (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.governance.vote('governance.unitprice', 10, (err: Error, ret: string) => {})
// $ExpectType Promise<string>
rpc.governance.vote('reward.useginicoeff', false, (err: Error, ret: string) => {})

// $ExpectType Promise<Tally[]>
rpc.governance.showTally()
// $ExpectType Promise<Tally[]>
rpc.governance.showTally((err: Error, ret: Tally[]) => {})

// $ExpectType Promise<number>
rpc.governance.getTotalVotingPower()
// $ExpectType Promise<number>
rpc.governance.getTotalVotingPower((err: Error, ret: number) => {})

// $ExpectType Promise<number>
rpc.governance.getMyVotingPower()
// $ExpectType Promise<number>
rpc.governance.getMyVotingPower((err: Error, ret: number) => {})

// $ExpectType Promise<MyVote[]>
rpc.governance.getMyVotes()
// $ExpectType Promise<MyVote[]>
rpc.governance.getMyVotes((err: Error, ret: MyVote[]) => {})

// $ExpectType Promise<ChainConfig>
rpc.governance.getChainConfig()
// $ExpectType Promise<ChainConfig>
rpc.governance.getChainConfig((err: Error, ret: ChainConfig) => {})

// $ExpectType Promise<string>
rpc.governance.getNodeAddress()
// $ExpectType Promise<string>
rpc.governance.getNodeAddress((err: Error, ret: string) => {})

// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemsAt(0)
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemsAt(new BigNumber(0))
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemsAt(new BN(0))
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemsAt('genesis')
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemsAt('latest')
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemsAt('hash')
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemsAt(0, (err: Error, ret: GovernanceItems) => {})
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemsAt(new BigNumber(0), (err: Error, ret: GovernanceItems) => {})
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemsAt(new BN(0), (err: Error, ret: GovernanceItems) => {})
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemsAt('genesis', (err: Error, ret: GovernanceItems) => {})
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemsAt('latest', (err: Error, ret: GovernanceItems) => {})
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemsAt('hash', (err: Error, ret: GovernanceItems) => {})

// $ExpectType Promise<VoteItems>
rpc.governance.getPendingChanges()
// $ExpectType Promise<VoteItems>
rpc.governance.getPendingChanges((err: Error, ret: VoteItems) => {})

// $ExpectType Promise<Vote[]>
rpc.governance.getVotes()
// $ExpectType Promise<Vote[]>
rpc.governance.getVotes((err: Error, ret: Vote[]) => {})

// $ExpectType Promise<number[]>
rpc.governance.getIdxCache()
// $ExpectType Promise<number[]>
rpc.governance.getIdxCache((err: Error, ret: number[]) => {})

// $ExpectType Promise<number[]>
rpc.governance.getIdxCacheFromDb()
// $ExpectType Promise<number[]>
rpc.governance.getIdxCacheFromDb((err: Error, ret: number[]) => {})

// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemCacheFromDb(0)
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemCacheFromDb(new BigNumber(0))
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemCacheFromDb(new BN(0))
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemCacheFromDb('0x0')
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemCacheFromDb(0, (err: Error, ret: GovernanceItems) => {})
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemCacheFromDb(new BigNumber(0), (err: Error, ret: GovernanceItems) => {})
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemCacheFromDb(new BN(0), (err: Error, ret: GovernanceItems) => {})
// $ExpectType Promise<GovernanceItems>
rpc.governance.getItemCacheFromDb('0x0', (err: Error, ret: GovernanceItems) => {})

// $ExpectType Promise<StakingInformation>
rpc.governance.getStakingInfo()
// $ExpectType Promise<StakingInformation>
rpc.governance.getStakingInfo(0)
// $ExpectType Promise<StakingInformation>
rpc.governance.getStakingInfo(new BigNumber(0))
// $ExpectType Promise<StakingInformation>
rpc.governance.getStakingInfo(new BN(0))
// $ExpectType Promise<StakingInformation>
rpc.governance.getStakingInfo('0x0')
// $ExpectType Promise<StakingInformation>
rpc.governance.getStakingInfo('hash')
// $ExpectType Promise<StakingInformation>
rpc.governance.getStakingInfo('genesis')
// $ExpectType Promise<StakingInformation>
rpc.governance.getStakingInfo('latest')
// $ExpectType Promise<StakingInformation>
rpc.governance.getStakingInfo((err: Error, ret: StakingInformation) => {})
// $ExpectType Promise<StakingInformation>
rpc.governance.getStakingInfo(0, (err: Error, ret: StakingInformation) => {})
// $ExpectType Promise<StakingInformation>
rpc.governance.getStakingInfo(new BigNumber(0), (err: Error, ret: StakingInformation) => {})
// $ExpectType Promise<StakingInformation>
rpc.governance.getStakingInfo(new BN(0), (err: Error, ret: StakingInformation) => {})
// $ExpectType Promise<StakingInformation>
rpc.governance.getStakingInfo('0x0', (err: Error, ret: StakingInformation) => {})
// $ExpectType Promise<StakingInformation>
rpc.governance.getStakingInfo('hash', (err: Error, ret: StakingInformation) => {})
// $ExpectType Promise<StakingInformation>
rpc.governance.getStakingInfo('genesis', (err: Error, ret: StakingInformation) => {})
// $ExpectType Promise<StakingInformation>
rpc.governance.getStakingInfo('latest', (err: Error, ret: StakingInformation) => {})
