/*
    Copyright 2018 The caver-js Authors
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

const { expect } = require('../extendedChai')
const AccountForUpdate = require('../../packages/caver-klay/caver-klay-accounts/src/account/accountForUpdate')
const Account = require('../../packages/caver-account')

const Keyring = require('../../packages/caver-wallet/src/keyring/keyringFactory')
const { KEY_ROLE } = require('../../packages/caver-wallet/src/keyring/keyringHelper')

const SignatureData = require('../../packages/caver-wallet/src/keyring/signatureData')

const unitMap = {
    peb: '1',
    kpeb: '1000',
    Mpeb: '1000000',
    Gpeb: '1000000000',
    Ston: '1000000000',
    ston: '1000000000',
    uKLAY: '1000000000000',
    mKLAY: '1000000000000000',
    KLAY: '1000000000000000000',
    kKLAY: '1000000000000000000000',
    MKLAY: '1000000000000000000000000',
    GKLAY: '1000000000000000000000000000',
    TKLAY: '1000000000000000000000000000000',
}

const generateDecoupledKeyring = () => {
    const keyring = Keyring.generate()
    keyring.key = Keyring.generateSingleKey()
    return keyring
}

const generateMultiSigKeyring = (num = 3) => {
    const keyring = Keyring.createWithMultipleKey(Keyring.generate().address, Keyring.generateMultipleKeys(num))
    return keyring
}

const generateRoleBasedKeyring = numArr => {
    if (numArr === undefined) {
        numArr = Array(KEY_ROLE.roleLast).fill(1)
    }
    const keyring = Keyring.createWithRoleBasedKey(Keyring.generate().address, Keyring.generateRoleBasedKeys(numArr))
    return keyring
}

const testAddress = '0x79a5f4710b4c08cb03bfefbe023567449870d7c6'
const pubStrings = [
    '0x66665bdceff63fc3731e8bc606fb48e4572b1216c914bb170cdf7de021bf02c375330dacaa36ee3194d7067cec4b14faf08c71ecbf2fc2107421e45f3dd59c87',
    '0xee49071c9c06dcb41dc9fd84a2a0b45db8817fa51a14a179b4fa7e4caeabff1120602e1f44c7c0f894362a06c6e7f3a6b9fc404d8322e1366d8b4176cecc86ff',
    '0xeaf3b83abd06936f3def55581fc86ea4553ecf4c3ed1015445d3b0edc68a900a32ff5464dd7bf04145be42ee8c0aed05d47df1e0e9052b62990454b09bfe76a8',
]
const input =
    '0x60806040526000805534801561001457600080fd5b5060405161016f38038061016f8339810180604052810190808051906020019092919080518201929190505050816000819055505050610116806100596000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a723058206d2bc553736581b6387f9a0410856ca490fcdc7045a8991ad63a1fd71b651c3a0029000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000037374720000000000000000000000000000000000000000000000000000000000'

const propertiesForUnnecessary = {
    accessList: {
        name: 'accessList',
        value: {
            address: '0x5430192ae264b3feff967fc08982b9c6f5694023',
            storageKeys: [
                '0x0000000000000000000000000000000000000000000000000000000000000003',
                '0x0000000000000000000000000000000000000000000000000000000000000007',
            ],
        },
    },
    codeFormat: { name: 'codeFormat', value: 'EVM' },
    to: { name: 'to', value: testAddress },
    value: { name: 'value', value: 1 },
    data: { name: 'data', value: input },
    input: { name: 'input', value: input },
    feePayer: { name: 'feePayer', value: testAddress },
    feeRatio: { name: 'feeRatio', value: 10 },
    feePayerSignatures: {
        name: 'feePayerSignatures',
        value: [
            [
                '0xfea',
                '0x7f135404d5f1c3a92c6a5811b741dc89318d965e6ac70a9ac3209589991e07b',
                '0x34ac5394d116ab2b99170230cfa6e81ea957379e506be824cf1079f4e0a67826',
            ],
        ],
    },
    account: { name: 'account', value: Account.createWithAccountKeyLegacy(testAddress) },
    key: { name: 'key', value: new AccountForUpdate(testAddress, 'legacyKey') },
    legacyKey: { name: 'legacyKey', value: true },
    publicKey: {
        name: 'publicKey',
        value: pubStrings[0],
    },
    failKey: { name: 'failKey', value: true },
    multisig: {
        name: 'multisig',
        value: {
            threshold: 2,
            keys: [
                {
                    weights: 1,
                    publicKey: pubStrings[0],
                },
                {
                    weights: 1,
                    publicKey: pubStrings[1],
                },
            ],
        },
    },
    roleTransactionKey: {
        name: 'roleTransactionKey',
        value: {
            publicKey: pubStrings[0],
        },
    },
    roleAccountUpdateKey: {
        name: 'roleAccountUpdateKey',
        value: {
            publicKey: pubStrings[0],
        },
    },
    roleFeePayerKey: {
        name: 'roleFeePayerKey',
        value: {
            publicKey: pubStrings[0],
        },
    },
    humanReadable: {
        name: 'humanReadable',
        value: true,
    },
    gasPrice: {
        name: 'gasPrice',
        value: '0x5d21dba00',
    },
    maxPriorityFeePerGas: {
        name: 'maxPriorityFeePerGas',
        value: '0x5d21dba00',
    },
    maxFeePerGas: {
        name: 'maxFeePerGas',
        value: '0x5d21dba00',
    },
}

const checkSignature = (tx, expected = {}) => {
    let { expectedSignatures, expectedLength } = expected

    if (expectedLength === undefined) {
        if (expectedSignatures !== undefined) {
            expectedLength = expectedSignatures.length
        } else {
            expectedLength = 1
        }
    }

    expect(tx.signatures.length).to.equal(expectedLength)

    for (let i = 0; i < expectedLength; i++) {
        expect(tx.signatures[i] instanceof SignatureData).to.be.true

        if (expectedSignatures) {
            expect(tx.signatures[i].v).to.equal(expectedSignatures[i][0])
            expect(tx.signatures[i].r).to.equal(expectedSignatures[i][1])
            expect(tx.signatures[i].s).to.equal(expectedSignatures[i][2])
        }
    }
}

const checkFeePayerSignature = (tx, expected = {}) => {
    let { expectedFeePayerSignatures, expectedLength } = expected

    if (expectedLength === undefined) {
        if (expectedFeePayerSignatures !== undefined) {
            expectedLength = expectedFeePayerSignatures.length
        } else {
            expectedLength = 1
        }
    }

    expect(tx.feePayerSignatures.length).to.equal(expectedLength)

    for (let i = 0; i < expectedLength; i++) {
        expect(tx.feePayerSignatures[i] instanceof SignatureData).to.be.true

        if (expectedFeePayerSignatures) {
            expect(tx.feePayerSignatures[i].v).to.equal(expectedFeePayerSignatures[i][0])
            expect(tx.feePayerSignatures[i].r).to.equal(expectedFeePayerSignatures[i][1])
            expect(tx.feePayerSignatures[i].s).to.equal(expectedFeePayerSignatures[i][2])
        }
    }
}

const makeAccount = (address, type, options) => {
    const defaultOption = { threshold: 1, weights: [1, 1, 1] }
    switch (type) {
        case accountKeyTestCases.LEGACY:
            return Account.createWithAccountKeyLegacy(address)
        case accountKeyTestCases.PUBLIC:
            const keyring = generateDecoupledKeyring()
            keyring.address = address
            return keyring.toAccount()
        case accountKeyTestCases.FAIL:
            return Account.createWithAccountKeyFail(address)
        case accountKeyTestCases.MULTISIG:
            options = options || defaultOption
            const multiSig = generateMultiSigKeyring(options.weights.length)
            multiSig.address = address
            return multiSig.toAccount(options)
        case accountKeyTestCases.ROLEBAED:
            options = options || [defaultOption, defaultOption, defaultOption]

            const roleBasedWithMultiSig = generateRoleBasedKeyring([
                options[0].weights ? options[0].weights.length : 1,
                options[1].weights ? options[1].weights.length : 1,
                options[2].weights ? options[2].weights.length : 1,
            ])
            roleBasedWithMultiSig.address = address
            return roleBasedWithMultiSig.toAccount(options)
    }
}

const accountKeyTestCases = {
    LEGACY: 0,
    PUBLIC: 1,
    FAIL: 2,
    MULTISIG: 3,
    ROLEBAED: 4,
}

module.exports = {
    unitMap,
    generateDecoupledKeyring,
    generateMultiSigKeyring,
    generateRoleBasedKeyring,
    propertiesForUnnecessary,
    checkSignature,
    checkFeePayerSignature,
    makeAccount,
    accountKeyTestCases,
}
