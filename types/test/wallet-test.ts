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

import Caver, {
    KeyringContainer,
    KeyringFactory,
    SingleKeyring,
    MultipleKeyring,
    RoleBasedKeyring,
    LegacyTransaction,
    ValueTransfer,
    FeeDelegatedValueTransfer,
    FeeDelegatedValueTransferWithRatio,
    ValueTransferMemo,
    FeeDelegatedValueTransferMemo,
    FeeDelegatedValueTransferMemoWithRatio,
    AccountUpdate,
    FeeDelegatedAccountUpdate,
    FeeDelegatedAccountUpdateWithRatio,
    SmartContractDeploy,
    FeeDelegatedSmartContractDeploy,
    FeeDelegatedSmartContractDeployWithRatio,
    SmartContractExecution,
    FeeDelegatedSmartContractExecution,
    FeeDelegatedSmartContractExecutionWithRatio,
    Cancel,
    FeeDelegatedCancel,
    FeeDelegatedCancelWithRatio,
    ChainDataAnchoring,
    FeeDelegatedChainDataAnchoring,
    FeeDelegatedChainDataAnchoringWithRatio,
    AbstractTransaction,
    AbstractFeeDelegatedTransaction,
    WeightedMultiSigOptions,
} from 'caver-js'
import { PrivateKey } from 'packages/caver-wallet/src/keyring/privateKey'

const caver = new Caver()

// $ExpectType KeyringContainer
caver.wallet

// $ExpectType KeyringContainer
let keyringContainer = new KeyringContainer()

// $ExpectType KeyringFactory
keyringContainer.keyring

const address = '0xde39030c0b51c01a83fc819fb79d47c90d6a3a60'
const prvKeys = [
    '0x99305a113c6182985e1ee6ec636ee5e8d0b93fcf3af7f72f8177938afca688f1',
    '0x97f2c7da1471122b0d0aa54d1ec6b0cc171c81d97e13d27c204d838f76c98310',
]
const keyrings = {
    single: new SingleKeyring(address, prvKeys[0]),
    multiple: new MultipleKeyring(address, prvKeys),
    roleBased: new RoleBasedKeyring(address, [prvKeys, prvKeys, prvKeys]),
}

// $ExpectType KeyringContainer
keyringContainer = new KeyringContainer(Object.values(keyrings))

// $ExpectType string[]
keyringContainer.generate(1)
// $ExpectType string[]
keyringContainer.generate(1, 'entropy')

// $ExpectType SingleKeyring
keyringContainer.newKeyring(address, prvKeys[0])
// $ExpectType MultipleKeyring
keyringContainer.newKeyring(address, prvKeys)
// $ExpectType RoleBasedKeyring
keyringContainer.newKeyring(address, [prvKeys, prvKeys, prvKeys])

// $ExpectType Keyring
keyringContainer.updateKeyring(keyrings.single)
// $ExpectType Keyring
keyringContainer.updateKeyring(keyrings.multiple)
// $ExpectType Keyring
keyringContainer.updateKeyring(keyrings.roleBased)

// $ExpectType Keyring
keyringContainer.getKeyring('address')

// $ExpectType boolean
keyringContainer.isExisted('address')

// $ExpectType Keyring
keyringContainer.add(keyrings.single)
// $ExpectType Keyring
keyringContainer.add(keyrings.multiple)
// $ExpectType Keyring
keyringContainer.add(keyrings.roleBased)

// $ExpectType boolean
keyringContainer.remove('address')

// $ExpectType SignedMessage
keyringContainer.signMessage('address', 'data', 0)
// $ExpectType SignedMessage
keyringContainer.signMessage('address', 'data', 0, 1)

const txs = {
    legacy: new LegacyTransaction({}),
    vt: new ValueTransfer({}),
    fdvt: new FeeDelegatedValueTransfer({}),
    fdrvt: new FeeDelegatedValueTransferWithRatio({}),
    vtm: new ValueTransferMemo({}),
    fdvtm: new FeeDelegatedValueTransferMemo({}),
    fdrvtm: new FeeDelegatedValueTransferMemoWithRatio({}),
    update: new AccountUpdate({}),
    fdupdate: new FeeDelegatedAccountUpdate({}),
    fdrupdate: new FeeDelegatedAccountUpdateWithRatio({}),
    deploy: new SmartContractDeploy({}),
    fddeploy: new FeeDelegatedSmartContractDeploy({}),
    fdrdeploy: new FeeDelegatedSmartContractDeployWithRatio({}),
    exe: new SmartContractExecution({}),
    fdexe: new FeeDelegatedSmartContractExecution({}),
    fdrexe: new FeeDelegatedSmartContractExecutionWithRatio({}),
    cancel: new Cancel({}),
    fdcancel: new FeeDelegatedCancel({}),
    fdrcancel: new FeeDelegatedCancelWithRatio({}),
    anchor: new ChainDataAnchoring({}),
    fdanchor: new FeeDelegatedChainDataAnchoring({}),
    fdranchor: new FeeDelegatedChainDataAnchoringWithRatio({}),
}

// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.legacy)
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.vt, 0)
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.vtm, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.update, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.deploy)
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.exe, 0)
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.cancel, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.anchor, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.fdvt)
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.fdvtm, 0)
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.fdupdate, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.fddeploy, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.fdexe)
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.fdcancel, 0)
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.fdanchor, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.fdrvt, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.fdrvtm)
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.fdrupdate, 0)
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.fdrdeploy, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.fdrexe, 0, (tx: AbstractTransaction) => '')
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.fdrcancel)
// $ExpectType Promise<AbstractTransaction>
keyringContainer.sign('address', txs.fdranchor, 0)

// $ExpectType Promise<AbstractFeeDelegatedTransaction>
keyringContainer.signAsFeePayer('address', txs.fdvt)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
keyringContainer.signAsFeePayer('address', txs.fdvtm, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
keyringContainer.signAsFeePayer('address', txs.fdupdate, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
keyringContainer.signAsFeePayer('address', txs.fddeploy, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
keyringContainer.signAsFeePayer('address', txs.fdexe)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
keyringContainer.signAsFeePayer('address', txs.fdcancel, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
keyringContainer.signAsFeePayer('address', txs.fdanchor, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
keyringContainer.signAsFeePayer('address', txs.fdrvt, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
keyringContainer.signAsFeePayer('address', txs.fdrvtm)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
keyringContainer.signAsFeePayer('address', txs.fdrupdate, 0)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
keyringContainer.signAsFeePayer('address', txs.fdrdeploy, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
keyringContainer.signAsFeePayer('address', txs.fdrexe, 0, (tx: AbstractFeeDelegatedTransaction) => '')
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
keyringContainer.signAsFeePayer('address', txs.fdrcancel)
// $ExpectType Promise<AbstractFeeDelegatedTransaction>
keyringContainer.signAsFeePayer('address', txs.fdranchor, 0)

// $ExpectType typeof PrivateKey
keyringContainer.keyring.privateKey
// $ExpectType typeof SingleKeyring
keyringContainer.keyring.singleKeyring
// $ExpectType typeof MultipleKeyring
keyringContainer.keyring.multipleKeyring
// $ExpectType typeof RoleBasedKeyring
keyringContainer.keyring.roleBasedKeyring
// $ExpectType typeof SignatureData
keyringContainer.keyring.signatureData

// $ExpectType SingleKeyring
keyringContainer.keyring.generate()
// $ExpectType SingleKeyring
keyringContainer.keyring.generate('entropy')

// $ExpectType string
keyringContainer.keyring.generateSingleKey()
// $ExpectType string
keyringContainer.keyring.generateSingleKey('entropy')

// $ExpectType string[]
keyringContainer.keyring.generateMultipleKeys(3)
// $ExpectType string[]
keyringContainer.keyring.generateMultipleKeys(3, 'entropy')

// $ExpectType string[][]
keyringContainer.keyring.generateRoleBasedKeys([3, 3, 3])
// $ExpectType string[][]
keyringContainer.keyring.generateRoleBasedKeys([3, 3, 3], 'entropy')

// $ExpectType SingleKeyring
keyringContainer.keyring.create('address', 'private key')
// $ExpectType MultipleKeyring
keyringContainer.keyring.create('address', ['private key'])
// $ExpectType RoleBasedKeyring
keyringContainer.keyring.create('address', [['private key'], ['private key'], ['private key']])

// $ExpectType SingleKeyring
keyringContainer.keyring.createFromPrivateKey('private key')

// $ExpectType SingleKeyring
keyringContainer.keyring.createFromKlaytnWalletKey('klaytn wallet key')

// $ExpectType SingleKeyring
keyringContainer.keyring.createWithSingleKey('address', 'private key')

// $ExpectType MultipleKeyring
keyringContainer.keyring.createWithMultipleKey('address', ['private key'])

// $ExpectType RoleBasedKeyring
keyringContainer.keyring.createWithRoleBasedKey('address', [['private key'], ['private key'], ['private key']])

// $ExpectType Keyring
keyringContainer.keyring.decrypt(
    {
        version: 3,
        id: '7a0a8557-22a5-4c90-b554-d6f3b13783ea',
        address: '0x86bce8c859f5f304aa30adb89f2f7b6ee5a0d6e2',
        crypto: {
            ciphertext: '696d0e8e8bd21ff1f82f7c87b6964f0f17f8bfbd52141069b59f084555f277b7',
            cipherparams: { iv: '1fd13e0524fa1095c5f80627f1d24cbd' },
            cipher: 'aes-128-ctr',
            kdf: 'scrypt',
            kdfparams: {
                dklen: 32,
                salt: '7ee980925cef6a60553cda3e91cb8e3c62733f64579f633d0f86ce050c151e26',
                n: 4096,
                r: 8,
                p: 1,
            },
            mac: '8684d8dc4bf17318cd46c85dbd9a9ec5d9b290e04d78d4f6b5be9c413ff30ea4',
        },
    },
    'password'
)
// $ExpectType Keyring
keyringContainer.keyring.decrypt(
    {
        version: 4,
        id: '55da3f9c-6444-4fc1-abfa-f2eabfc57501',
        address: '0x86bce8c859f5f304aa30adb89f2f7b6ee5a0d6e2',
        keyring: [
            [
                {
                    ciphertext: '93dd2c777abd9b80a0be8e1eb9739cbf27c127621a5d3f81e7779e47d3bb22f6',
                    cipherparams: { iv: '84f90907f3f54f53d19cbd6ae1496b86' },
                    cipher: 'aes-128-ctr',
                    kdf: 'scrypt',
                    kdfparams: {
                        dklen: 32,
                        salt: '69bf176a136c67a39d131912fb1e0ada4be0ed9f882448e1557b5c4233006e10',
                        n: 4096,
                        r: 8,
                        p: 1,
                    },
                    mac: '8f6d1d234f4a87162cf3de0c7fb1d4a8421cd8f5a97b86b1a8e576ffc1eb52d2',
                },
                {
                    ciphertext: '53d50b4e86b550b26919d9b8cea762cd3c637dfe4f2a0f18995d3401ead839a6',
                    cipherparams: { iv: 'd7a6f63558996a9f99e7daabd289aa2c' },
                    cipher: 'aes-128-ctr',
                    kdf: 'scrypt',
                    kdfparams: {
                        dklen: 32,
                        salt: '966116898d90c3e53ea09e4850a71e16df9533c1f9e1b2e1a9edec781e1ad44f',
                        n: 4096,
                        r: 8,
                        p: 1,
                    },
                    mac: 'bca7125e17565c672a110ace9a25755847d42b81aa7df4bb8f5ce01ef7213295',
                },
            ],
            [
                {
                    ciphertext: 'f16def98a70bb2dae053f791882f3254c66d63416633b8d91c2848893e7876ce',
                    cipherparams: { iv: 'f5006128a4c53bc02cada64d095c15cf' },
                    cipher: 'aes-128-ctr',
                    kdf: 'scrypt',
                    kdfparams: {
                        dklen: 32,
                        salt: '0d8a2f71f79c4880e43ff0795f6841a24cb18838b3ca8ecaeb0cda72da9a72ce',
                        n: 4096,
                        r: 8,
                        p: 1,
                    },
                    mac: '38b79276c3805b9d2ff5fbabf1b9d4ead295151b95401c1e54aed782502fc90a',
                },
            ],
            [
                {
                    ciphertext: '544dbcc327942a6a52ad6a7d537e4459506afc700a6da4e8edebd62fb3dd55ee',
                    cipherparams: { iv: '05dd5d25ad6426e026818b6fa9b25818' },
                    cipher: 'aes-128-ctr',
                    kdf: 'scrypt',
                    kdfparams: {
                        dklen: 32,
                        salt: '3a9003c1527f65c772c54c6056a38b0048c2e2d58dc0e584a1d867f2039a25aa',
                        n: 4096,
                        r: 8,
                        p: 1,
                    },
                    mac: '19a698b51409cc9ac22d63d329b1201af3c89a04a1faea3111eec4ca97f2e00f',
                },
                {
                    ciphertext: 'dd6b920f02cbcf5998ed205f8867ddbd9b6b088add8dfe1774a9fda29ff3920b',
                    cipherparams: { iv: 'ac04c0f4559dad80dc86c975d1ef7067' },
                    cipher: 'aes-128-ctr',
                    kdf: 'scrypt',
                    kdfparams: {
                        dklen: 32,
                        salt: '22279c6dbcc706d7daa120022a236cfe149496dca8232b0f8159d1df999569d6',
                        n: 4096,
                        r: 8,
                        p: 1,
                    },
                    mac: '1c54f7378fa279a49a2f790a0adb683defad8535a21bdf2f3dadc48a7bddf517',
                },
            ],
        ],
    },
    'password'
)

// $ExpectType SingleKeyring
let singleKeyring = new SingleKeyring(address, prvKeys[0])
// $ExpectType SingleKeyring
singleKeyring = new SingleKeyring(address, new PrivateKey(prvKeys[0]))

// $ExpectType string
singleKeyring.getPublicKey()
// $ExpectType string
singleKeyring.getPublicKey(true)

// $ExpectType SingleKeyring
singleKeyring.copy()

// $ExpectType SignatureData | SignatureData[]
singleKeyring.sign('hash', 1000, 0)
// $ExpectType SignatureData | SignatureData[]
singleKeyring.sign('hash', caver.utils.toHex(1000), 0)
// $ExpectType SignatureData | SignatureData[]
singleKeyring.sign('hash', 1000, 0, 0)
// $ExpectType SignatureData | SignatureData[]
singleKeyring.sign('hash', caver.utils.toHex(1000), 0, 0)

// $ExpectType SignedMessage
singleKeyring.signMessage('message', 0)
// $ExpectType SignedMessage
singleKeyring.signMessage('message', 0, 0)

// $ExpectType PrivateKey[]
singleKeyring.getKeyByRole(0)

// $ExpectType string
singleKeyring.getKlaytnWalletKey()

// $ExpectType Account
singleKeyring.toAccount()

// $ExpectType EncryptedKeystoreV4Json
singleKeyring.encrypt('password')
// $ExpectType EncryptedKeystoreV4Json
singleKeyring.encrypt('password', { cipher: 'aes-128-ctr' })

// $ExpectType EncryptedKeystoreV3Json
singleKeyring.encryptV3('password')
// $ExpectType EncryptedKeystoreV3Json
singleKeyring.encryptV3('password', { cipher: 'aes-128-ctr' })

// $ExpectType MultipleKeyring
let multipleKeyring = new MultipleKeyring(address, prvKeys)
// $ExpectType MultipleKeyring
multipleKeyring = new MultipleKeyring(address, [new PrivateKey(prvKeys[0]), new PrivateKey(prvKeys[1])])

// $ExpectType string[]
multipleKeyring.getPublicKey()
// $ExpectType string[]
multipleKeyring.getPublicKey(true)

// $ExpectType MultipleKeyring
multipleKeyring.copy()

// $ExpectType SignatureData | SignatureData[]
multipleKeyring.sign('hash', 1000, 0)
// $ExpectType SignatureData | SignatureData[]
multipleKeyring.sign('hash', caver.utils.toHex(1000), 0)
// $ExpectType SignatureData | SignatureData[]
multipleKeyring.sign('hash', 1000, 0, 0)
// $ExpectType SignatureData | SignatureData[]
multipleKeyring.sign('hash', caver.utils.toHex(1000), 0, 0)

// $ExpectType SignedMessage
multipleKeyring.signMessage('message', 0)
// $ExpectType SignedMessage
multipleKeyring.signMessage('message', 0, 0)

// $ExpectType PrivateKey[]
multipleKeyring.getKeyByRole(0)

// $ExpectType Account
multipleKeyring.toAccount()
// $ExpectType Account
multipleKeyring.toAccount({ threshold: 3, weigths: [1, 2] })
// $ExpectType Account
multipleKeyring.toAccount(new WeightedMultiSigOptions(3, [1, 2]))

// $ExpectType EncryptedKeystoreV4Json
multipleKeyring.encrypt('password')
// $ExpectType EncryptedKeystoreV4Json
multipleKeyring.encrypt('password', { cipher: 'aes-128-ctr' })

// $ExpectType RoleBasedKeyring
let roleBasedKeyring = new RoleBasedKeyring(address, [prvKeys, prvKeys, prvKeys])
// $ExpectType RoleBasedKeyring
roleBasedKeyring = new RoleBasedKeyring(address, [
    [new PrivateKey(prvKeys[0]), new PrivateKey(prvKeys[1])],
    [new PrivateKey(prvKeys[0]), new PrivateKey(prvKeys[1])],
    [new PrivateKey(prvKeys[0]), new PrivateKey(prvKeys[1])],
])

// $ExpectType string[][]
roleBasedKeyring.getPublicKey()
// $ExpectType string[][]
roleBasedKeyring.getPublicKey(true)

// $ExpectType RoleBasedKeyring
roleBasedKeyring.copy()

// $ExpectType SignatureData | SignatureData[]
roleBasedKeyring.sign('hash', 1000, 0)
// $ExpectType SignatureData | SignatureData[]
roleBasedKeyring.sign('hash', caver.utils.toHex(1000), 0)
// $ExpectType SignatureData | SignatureData[]
roleBasedKeyring.sign('hash', 1000, 0, 0)
// $ExpectType SignatureData | SignatureData[]
roleBasedKeyring.sign('hash', caver.utils.toHex(1000), 0, 0)

// $ExpectType SignedMessage
roleBasedKeyring.signMessage('message', 0)
// $ExpectType SignedMessage
roleBasedKeyring.signMessage('message', 0, 0)

// $ExpectType PrivateKey[]
roleBasedKeyring.getKeyByRole(0)

// $ExpectType Account
roleBasedKeyring.toAccount()
// $ExpectType Account
roleBasedKeyring.toAccount([{ threshold: 3, weigths: [1, 2] }, { threshold: 3, weigths: [1, 2] }, { threshold: 3, weigths: [1, 2] }])
// $ExpectType Account
roleBasedKeyring.toAccount([
    new WeightedMultiSigOptions(3, [1, 2]),
    new WeightedMultiSigOptions(3, [1, 2]),
    new WeightedMultiSigOptions(3, [1, 2]),
])

// $ExpectType EncryptedKeystoreV4Json
roleBasedKeyring.encrypt('password')
// $ExpectType EncryptedKeystoreV4Json
roleBasedKeyring.encrypt('password', { cipher: 'aes-128-ctr' })
