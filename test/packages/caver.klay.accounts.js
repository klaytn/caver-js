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

const BN = require('bn.js')
const Hash = require('eth-lib/lib/hash')

const testRPCURL = require('../testrpc')
const { expect, assert } = require('../extendedChai')

const setting = require('./setting')
const Caver = require('../../index')

const MessagePrefix = '\x19Klaytn Signed Message:\n'

let caver

beforeEach(() => {
    caver = new Caver(testRPCURL)
})

function isSameKeyString(str1, str2) {
    return str1.toLowerCase() === str2.toLowerCase()
}

function isSameKeyArray(arr1, arr2) {
    if (arr1.length !== arr2.length) return false
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i].toLowerCase() !== arr2[i].toLowerCase()) return false
    }
    return true
}

function isSameKeyObject(obj1, obj2) {
    const keys = Object.keys(obj1)
    keys.map(r => {
        if (typeof obj1[r] === 'string' && !isSameKeyString(obj1[r], obj2[r])) return false
        if (Array.isArray(obj1[r]) && !isSameKeyArray(obj1[r], obj2[r])) return false
    })
    return true
}

function compareAccountKey(keyFromAccount, key) {
    if (!keyFromAccount && !key) return

    if (typeof keyFromAccount.keys === 'string') {
        expect(isSameKeyString(keyFromAccount.keys, key)).to.be.true
        expect(isSameKeyString(keyFromAccount.transactionKey, key)).to.be.true
        expect(isSameKeyString(keyFromAccount.updateKey, key)).to.be.true
        expect(isSameKeyString(keyFromAccount.feePayerKey, key)).to.be.true
    } else if (Array.isArray(keyFromAccount.keys)) {
        expect(isSameKeyArray(keyFromAccount.keys, key)).to.be.true
        expect(isSameKeyArray(keyFromAccount.transactionKey, key)).to.be.true
        expect(isSameKeyArray(keyFromAccount.updateKey, key)).to.be.true
        expect(isSameKeyArray(keyFromAccount.feePayerKey, key)).to.be.true
    } else {
        expect(isSameKeyObject(keyFromAccount.keys, key)).to.be.true
        compareAccountKey(keyFromAccount._transactionKey, key.transactionKey)
        compareAccountKey(keyFromAccount._updateKey, key.updateKey)
        compareAccountKey(keyFromAccount._feePayerKey, key.feePayerKey)
    }
}

function isAccount(data, { keys, address } = {}) {
    // account object keys
    const objectKeys = [
        'address',
        'accountKey',
        'privateKey',
        'signTransaction',
        'feePayerSignTransaction',
        'sign',
        'encrypt',
        'getKlaytnWalletKey',
    ]

    expect(Object.getOwnPropertyNames(data)).to.deep.equal(objectKeys)

    expect(caver.utils.isAddress(data.address)).to.equal(true)

    if (keys !== undefined) {
        compareAccountKey(data.accountKey, keys)
    }

    if (address !== undefined) {
        expect(data.address.toLowerCase()).to.equal(address.toLowerCase())
    }
}

function checkHashMessage(hashed, originMessage) {
    const enveloped = MessagePrefix + originMessage.length + originMessage
    const originHashed = caver.utils.sha3(enveloped)
    expect(hashed).to.equal(originHashed)
}

function isKeystore(data, { address }, version = 4) {
    const objectKeys = ['version', 'id', 'address']

    if (version > 3) {
        objectKeys.push('keyring')
    } else {
        objectKeys.push('crypto')
    }

    expect(Object.getOwnPropertyNames(data)).to.deep.equal(objectKeys)

    expect(data.version).to.equals(version)

    expect(caver.utils.isAddress(data.address)).to.equal(true)

    const prefixTrimmed = data.address.replace(/^(0x)*/i, '')
    expect(prefixTrimmed).to.match(new RegExp(`^${address.slice(2)}$`, 'i'))
}

function isWallet(data, { accounts } = {}) {
    // check if function exists
    const fns = ['add', 'remove', 'clear']
    fns.forEach(fn => {
        expect(fn in data).to.equal(true)
    })

    expect(data.defaultKeyName).to.equal('caverjs_wallet')

    if (accounts && accounts.length > 0) {
        expect(data.length).to.equal(accounts.length)

        for (let i = 0; i < data.length; i++) {
            let accountObj = caver.klay.accounts.createWithAccountKey(data[i].address, data[i].accountKey)

            isAccount(accountObj, { keys: accounts[i].keys, address: accounts[i].address })

            accountObj = caver.klay.accounts.createWithAccountKey(data[i].address, data[accountObj.address].accountKey)

            isAccount(accountObj, { keys: accounts[i].keys, address: accounts[i].address })
        }
    }
}

describe('caver.klay.accounts.create', () => {
    context('CAVERJS-UNIT-WALLET-021 : input: no parameter', () => {
        it('should return valid account', () => {
            const result = caver.klay.accounts.create()
            return isAccount(result)
        })
    })

    context('CAVERJS-UNIT-WALLET-022 : input: entropy', () => {
        it('should return valid account', () => {
            const entropy = caver.utils.randomHex(32)

            const result = caver.klay.accounts.create(entropy)
            return isAccount(result)
        })
    })
})

describe('caver.klay.accounts.privateKeyToAccount', () => {
    context('input: valid privatekey', () => {
        it('should return valid account', () => {
            const privateKey = caver.utils.randomHex(32)
            const result = caver.klay.accounts.privateKeyToAccount(privateKey)
            return isAccount(result)
        })
    })

    context('input: invalid privatekey', () => {
        it('should throw an error', () => {
            const invalidPrivateKey = caver.utils.randomHex(31)

            const errorMessage = 'Invalid private key'
            expect(() => caver.klay.accounts.privateKeyToAccount(invalidPrivateKey)).to.throw(errorMessage)
        })
    })
})

describe('caver.klay.accounts.signTransaction', () => {
    let txObj
    let vtTx
    let account
    let feePayer
    let sender

    beforeEach(() => {
        account = caver.klay.accounts.create()
        caver.klay.accounts.wallet.add(account)
        feePayer = caver.klay.accounts.wallet.add('0x3bdc858e890c3c845ea9ca24b1e9ed183a56eb78d4bf5463da219a74f708eff6')
        sender = caver.klay.accounts.wallet.add('0x66de1a1fa104b008c3c34c1695415d71435384f3b68df03dda82e74f9d85064d')

        txObj = {
            from: account.address,
            nonce: '0x0',
            to: setting.toAddress,
            gas: setting.gas,
            gasPrice: setting.gasPrice,
            value: '0x1',
            chainId: 2019,
        }

        vtTx = {
            type: 'VALUE_TRANSFER',
            from: account.address,
            to: '0xd05c5926b0a2f31aadcc9a9cbd3868a50104d834',
            value: '0x1',
            gas: '0xdbba0',
            chainId: '0x7e3',
            gasPrice: '0x5d21dba00',
            nonce: '0x9a',
        }
    })

    context('CAVERJS-UNIT-WALLET-023 : input: tx, privateKey', () => {
        it('should return signature and rawTransaction', async () => {
            const result = await caver.klay.accounts.signTransaction(txObj, account.privateKey)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'signatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(caver.klay.accounts.recoverTransaction(result.rawTransaction)).to.equal(account.address)
        })
    })

    context('CAVERJS-UNIT-WALLET-026 : input: tx, privateKey, without nonce', () => {
        it('should return signature and rawTransaction', async () => {
            const tx = { ...txObj }
            delete tx.nonce

            const result = await caver.klay.accounts.signTransaction(tx, account.privateKey)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'signatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(caver.klay.accounts.recoverTransaction(result.rawTransaction)).to.equal(account.address)
        })
    })

    context('CAVERJS-UNIT-WALLET-027 : input: tx, privateKey, without gasPrice', () => {
        it('should return signature and rawTransaction', async () => {
            const tx = { ...txObj }
            delete tx.gasPrice

            const result = await caver.klay.accounts.signTransaction(tx, account.privateKey)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'signatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(caver.klay.accounts.recoverTransaction(result.rawTransaction)).to.equal(account.address)
        })
    })

    context('CAVERJS-UNIT-WALLET-028 : input: tx, privateKey, without chainId', () => {
        it('should return signature and rawTransaction', async () => {
            const tx = { ...txObj }
            delete tx.chainId

            const result = await caver.klay.accounts.signTransaction(tx, account.privateKey)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'signatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(caver.klay.accounts.recoverTransaction(result.rawTransaction)).to.equal(account.address)
        })
    })

    context('CAVERJS-UNIT-WALLET-024 : input: tx:invalid address, privateKey', () => {
        it('should throw an error', async () => {
            const invalid = { ...txObj }
            delete invalid.to
            delete invalid.data

            const errorMessage = 'contract creation without any data provided'

            await expect(caver.klay.accounts.signTransaction(invalid, account.privateKey)).to.be.rejectedWith(errorMessage)
        })
    })

    context('CAVERJS-UNIT-WALLET-024 : input: tx:invalid value, privateKey', async () => {
        it('should throw an error', async () => {
            const invalid = { ...txObj }
            invalid.value = '0xzzzz'

            const errorMessage = `Given input "${invalid.value}" is not a number.`

            await expect(caver.klay.accounts.signTransaction(invalid, account.privateKey)).to.be.rejectedWith(errorMessage)
        })
    })

    context('CAVERJS-UNIT-WALLET-025 : input: tx, privateKey:invalid', () => {
        it('should throw an error', async () => {
            const invalidPrivateKey = caver.utils.randomHex(31) // 31bytes

            const errorMessage = 'Invalid private key'

            await expect(caver.klay.accounts.signTransaction(txObj, invalidPrivateKey)).to.be.rejectedWith(errorMessage)
        })
    })

    context('CAVERJS-UNIT-WALLET-023 : input: tx, privateKey, callback', () => {
        it('should return signature and rawTransaction', done => {
            caver.klay.accounts.signTransaction(txObj, account.privateKey, (_, result) => {
                const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'signatures']
                expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

                expect(caver.klay.accounts.recoverTransaction(result.rawTransaction)).to.equal(account.address)
                done()
            })
        })
    })

    context('CAVERJS-UNIT-WALLET-102 : input: tx, privateKey, callback', () => {
        it('should return valid senderTxHash', async () => {
            const feeDelegatedTx = {
                type: 'FEE_DELEGATED_VALUE_TRANSFER',
                from: '0x76d1cc1cdb081de8627cab2c074f02ebc7bce0d0',
                to: '0xd05c5926b0a2f31aadcc9a9cbd3868a50104d834',
                value: '0x1',
                gas: '0xdbba0',
                chainId: '0x7e3',
                gasPrice: '0x5d21dba00',
                nonce: '0x9a',
            }
            const result = await caver.klay.accounts.signTransaction(
                feeDelegatedTx,
                '1881a973628dba6ab07b6b47c8f3fb50d8e7cbf71fef3b4739155619a3c126fa'
            )
            expect(result.senderTxHash).to.equal('0x1b7c0f2fc7548056e90d9690e8c397acf99eb38e622ac91ee22c2085065f8a55')
        })
    })

    context('CAVERJS-UNIT-WALLET-122 : input: legacyTx, privateKey of decoupled account', () => {
        it('should return signature and rawTransaction', async () => {
            const decoupledAccount = caver.klay.accounts.privateKeyToAccount(
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().address
            )

            const tx = {
                from: decoupledAccount.address,
                nonce: '0x0',
                to: setting.toAddress,
                gas: setting.gas,
                gasPrice: setting.gasPrice,
                value: '0x1',
                chainId: 2019,
            }

            const errorMessage = 'A legacy transaction must be with a legacy account key'

            await expect(caver.klay.accounts.signTransaction(tx, decoupledAccount.privateKey)).to.be.rejectedWith(errorMessage)
        })
    })

    context('CAVERJS-UNIT-WALLET-123 : input: if there are invalid number of parameters then signTrasnaction should reject', () => {
        it('should reject when there is no parameter', async () => {
            const errorMessage = 'Invalid parameter: The number of parameters is invalid.'
            await expect(caver.klay.accounts.signTransaction()).to.be.rejectedWith(errorMessage)
        })

        it('should reject when there are more than three parameters', async () => {
            const errorMessage = 'Invalid parameter: The number of parameters is invalid.'
            await expect(caver.klay.accounts.signTransaction({}, 'privateKey', () => {}, 'one more')).to.be.rejectedWith(errorMessage)
        })
    })

    context('CAVERJS-UNIT-WALLET-124 : input: if there are valid number of parameters then signTrasnaction should set properly', () => {
        it('should sign to transaction parameter with private key in wallet', async () => {
            const result = await caver.klay.accounts.signTransaction(txObj)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'signatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(typeof result.signatures[0]).to.equals('string')

            expect(caver.klay.accounts.recoverTransaction(result.rawTransaction)).to.equal(account.address)
        })

        it('should sign to transaction parameter with private key in wallet with callback', async () => {
            let isCalled = false
            const signed = await caver.klay.accounts.signTransaction(txObj, () => (isCalled = true))

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'signatures']
            expect(Object.getOwnPropertyNames(signed)).to.deep.equal(keys)

            expect(typeof signed.signatures[0]).to.equals('string')

            expect(caver.klay.accounts.recoverTransaction(signed.rawTransaction)).to.equal(account.address)

            expect(isCalled).to.be.true
        })

        it('should sign to transaction parameter with private key parameter', async () => {
            const result = await caver.klay.accounts.signTransaction(vtTx, account.privateKey)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'signatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(Array.isArray(result.signatures[0])).to.be.true
            expect(result.signatures.length).to.equals(1)
        })

        it('should sign to transaction parameter with private key array', async () => {
            const privateKeyArray = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const result = await caver.klay.accounts.signTransaction(vtTx, privateKeyArray)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'signatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(Array.isArray(result.signatures[0])).to.be.true
            expect(result.signatures.length).to.equals(2)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.signatures.length).to.equals(2)
            expect(decoded.signatures[0][0]).to.equals(result.signatures[0][0])
            expect(decoded.signatures[0][1]).to.equals(result.signatures[0][1])
            expect(decoded.signatures[0][2]).to.equals(result.signatures[0][2])
            expect(decoded.signatures[1][0]).to.equals(result.signatures[1][0])
            expect(decoded.signatures[1][1]).to.equals(result.signatures[1][1])
            expect(decoded.signatures[1][2]).to.equals(result.signatures[1][2])
        })
    })

    context('CAVERJS-UNIT-WALLET-130 : input: txObject', () => {
        it('should sign with feePayer and return feePayerSignatures', async () => {
            const feeDelegatedTx = {
                type: 'FEE_DELEGATED_VALUE_TRANSFER',
                from: '0x76d1cc1cdb081de8627cab2c074f02ebc7bce0d0',
                to: '0xd05c5926b0a2f31aadcc9a9cbd3868a50104d834',
                value: '0x1',
                gas: '0xdbba0',
                chainId: '0x7e3',
                gasPrice: '0x5d21dba00',
                nonce: '0x9a',
            }
            const senderSigned = await caver.klay.accounts.signTransaction(
                feeDelegatedTx,
                '1881a973628dba6ab07b6b47c8f3fb50d8e7cbf71fef3b4739155619a3c126fa'
            )

            const feePayerTransaction = {
                senderRawTransaction: senderSigned.rawTransaction,
                feePayer: account.address,
            }
            const feePayerSigned = await caver.klay.accounts.signTransaction(feePayerTransaction)
            expect(feePayerSigned.feePayerSignatures).not.to.be.undefined
            expect(Array.isArray(feePayerSigned.feePayerSignatures)).to.be.true

            const decoded = caver.klay.decodeTransaction(feePayerSigned.rawTransaction)
            expect(decoded.signatures.length).to.equals(1)
            expect(decoded.signatures[0][0]).to.equals(senderSigned.signatures[0][0])
            expect(decoded.signatures[0][1]).to.equals(senderSigned.signatures[0][1])
            expect(decoded.signatures[0][2]).to.equals(senderSigned.signatures[0][2])
            expect(decoded.feePayerSignatures[0][0]).to.equals(feePayerSigned.feePayerSignatures[0][0])
            expect(decoded.feePayerSignatures[0][1]).to.equals(feePayerSigned.feePayerSignatures[0][1])
            expect(decoded.feePayerSignatures[0][2]).to.equals(feePayerSigned.feePayerSignatures[0][2])
        })
    })

    context('CAVERJS-UNIT-WALLET-131 : input: txObject for fee payer without feePayer field', () => {
        it('should reject', async () => {
            const feeDelegatedTx = {
                type: 'FEE_DELEGATED_VALUE_TRANSFER',
                from: '0x76d1cc1cdb081de8627cab2c074f02ebc7bce0d0',
                to: '0xd05c5926b0a2f31aadcc9a9cbd3868a50104d834',
                value: '0x1',
                gas: '0xdbba0',
                chainId: '0x7e3',
                gasPrice: '0x5d21dba00',
                nonce: '0x9a',
            }
            const senderSigned = await caver.klay.accounts.signTransaction(
                feeDelegatedTx,
                '1881a973628dba6ab07b6b47c8f3fb50d8e7cbf71fef3b4739155619a3c126fa'
            )

            const feePayerTransaction = {
                senderRawTransaction: senderSigned.rawTransaction,
            }

            const errorMessage = `Invalid fee payer: ${feePayerTransaction.feePayer}`
            await expect(caver.klay.accounts.signTransaction(feePayerTransaction)).to.be.rejectedWith(errorMessage)
        })
    })

    context('CAVERJS-UNIT-WALLET-132 : input: txObject without private key', () => {
        it('when fail to find account, should reject with expected error message', async () => {
            const feeDelegatedTx = {
                type: 'FEE_DELEGATED_VALUE_TRANSFER',
                from: caver.klay.accounts.create().address,
                to: '0xd05c5926b0a2f31aadcc9a9cbd3868a50104d834',
                value: '0x1',
                gas: '0xdbba0',
                chainId: '0x7e3',
                gasPrice: '0x5d21dba00',
                nonce: '0x9a',
            }
            const errorMessage =
                'Failed to find get private key to sign. The account you want to use for signing must exist in caver.klay.accounts.wallet or you must pass the private key as a parameter.'
            await expect(caver.klay.accounts.signTransaction(feeDelegatedTx)).to.be.rejectedWith(errorMessage)
        })
    })

    context('CAVERJS-UNIT-WALLET-225: input: rawTransaction without other signatures', () => {
        it('should sign to transaction', async () => {
            const rawTransaction =
                '0x08f83c819a8505d21dba00830dbba094d05c5926b0a2f31aadcc9a9cbd3868a50104d8340194f63c07602e64ca5e2ffb325fdbe4b76015d56f1cc4c3018080'
            const result = await caver.klay.accounts.signTransaction(rawTransaction, account.privateKey)

            expect(result.signatures.length).to.equals(1)
            expect(result.feePayerSignatures).to.be.undefined
        })
    })

    context('CAVERJS-UNIT-WALLET-226: input: rawTransaction with other sender signatures', () => {
        it('should sign with private key and append to signatures', async () => {
            const rawTransaction =
                '0x08f880819a8505d21dba00830dbba094d05c5926b0a2f31aadcc9a9cbd3868a50104d8340194f63c07602e64ca5e2ffb325fdbe4b76015d56f1cf847f845824e44a068e480ad868cdbe509d3f6419f872d5f0bfe5c81dd6b56463df73f2225353ef0a005836c1c756bcc5262dfcb4aa1c1b69858475c389a770170f25105f58e23bc85'
            const result = await caver.klay.accounts.signTransaction(rawTransaction, account.privateKey)

            expect(result.signatures.length).to.equals(2)
            expect(result.feePayerSignatures).to.be.undefined
        })
    })

    context('CAVERJS-UNIT-WALLET-227: input: rawTransaction without signatures of sender and fee payer', () => {
        it('should sign with fee payer', async () => {
            const rawTransaction =
                '0x09f842819a8505d21dba00830dbba094d05c5926b0a2f31aadcc9a9cbd3868a50104d8340194127a24ec811aa1e45071a669e5d117a475e68149c4c301808080c4c3018080'
            const feePayerTx = {
                senderRawTransaction: rawTransaction,
                feePayer: feePayer.address,
            }
            const result = await caver.klay.accounts.signTransaction(feePayerTx, feePayer.privateKey)

            expect(result.signatures).to.be.undefined
            expect(result.feePayerSignatures.length).to.equals(1)
        })
    })

    context('CAVERJS-UNIT-WALLET-228: input: rawTransaction with signatures of fee payer', () => {
        it('should sign with sender and include existed signatures of fee payer', async () => {
            const rawTransaction =
                '0x09f89a819a8505d21dba00830dbba094d05c5926b0a2f31aadcc9a9cbd3868a50104d8340194127a24ec811aa1e45071a669e5d117a475e68149c4c3018080944a804669b2637b18d46e62109ed8edc0dc8526c7f847f845824e43a0113bf0986a48768e38daeff685ce56766aacf449f2aec8a0c77165777970f954a00717c4d4720fe706a075374f8eb0432f6c9f70c0a6e6267483d0b0cc8100ec07'
            const result = await caver.klay.accounts.signTransaction(rawTransaction, account.privateKey)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)

            expect(result.signatures.length).to.equals(1)
            expect(result.feePayerSignatures).to.be.undefined
            expect(decoded.signatures.length).to.equals(1)
            expect(decoded.feePayerSignatures.length).to.equals(1)
        })
    })

    context('CAVERJS-UNIT-WALLET-229: input: rawTransaction with signatures of sender and fee payer', () => {
        it('should append signatures of sender to existed signatures', async () => {
            const rawTransaction =
                '0x09f8de819a8505d21dba00830dbba094d05c5926b0a2f31aadcc9a9cbd3868a50104d8340194127a24ec811aa1e45071a669e5d117a475e68149f847f845824e44a030accfbec3b577a53103c843744754a98408e7518391a31399bc757610ad1fc5a00eecc65e8f6f1795f7665513442fe30f881ddce12ceb687a8a7d9b65a0eee595944a804669b2637b18d46e62109ed8edc0dc8526c7f847f845824e43a0113bf0986a48768e38daeff685ce56766aacf449f2aec8a0c77165777970f954a00717c4d4720fe706a075374f8eb0432f6c9f70c0a6e6267483d0b0cc8100ec07'
            const result = await caver.klay.accounts.signTransaction(rawTransaction, sender.privateKey)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)

            expect(result.signatures.length).to.equals(2)
            expect(result.feePayerSignatures).to.be.undefined
            expect(decoded.signatures.length).to.equals(2)
            expect(decoded.feePayerSignatures.length).to.equals(1)
        })
    })

    context('CAVERJS-UNIT-WALLET-230: input: rawTransaction with signatures of sender and fee payer', () => {
        it('should append signatures of fee payer to existed feePayerSignatures', async () => {
            const rawTransaction =
                '0x09f90125819a8505d21dba00830dbba094d05c5926b0a2f31aadcc9a9cbd3868a50104d8340194127a24ec811aa1e45071a669e5d117a475e68149f88ef845824e44a030accfbec3b577a53103c843744754a98408e7518391a31399bc757610ad1fc5a00eecc65e8f6f1795f7665513442fe30f881ddce12ceb687a8a7d9b65a0eee595f845824e44a006400dc68ab85d838a02e202e2ca52c6a30f11f7fa84f4046e08a940f4c95d1ea061a09e1a2dd6b823c42552d1cf0a4c0e408b4ada2b0236ef14ba0f036e6da262944a804669b2637b18d46e62109ed8edc0dc8526c7f847f845824e43a0113bf0986a48768e38daeff685ce56766aacf449f2aec8a0c77165777970f954a00717c4d4720fe706a075374f8eb0432f6c9f70c0a6e6267483d0b0cc8100ec07'
            const feePayerTx = {
                senderRawTransaction: rawTransaction,
                feePayer: feePayer.address,
            }
            const result = await caver.klay.accounts.signTransaction(feePayerTx, account.privateKey)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)

            expect(result.signatures).to.be.undefined
            expect(result.feePayerSignatures.length).to.equals(2)
            expect(decoded.signatures.length).to.equals(2)
            expect(decoded.feePayerSignatures.length).to.equals(2)
        })
    })

    context('CAVERJS-UNIT-WALLET-231: input: rawTransaction with signatures of sender and fee payer', () => {
        it('should remove duplicated signatures of sender', async () => {
            const tx = {
                type: 'VALUE_TRANSFER',
                from: account.address,
                to: '0xd05c5926b0a2f31aadcc9a9cbd3868a50104d834',
                value: '0x1',
                gas: '0xdbba0',
                gasPrice: '0x5d21dba00',
                nonce: '0x9a',
            }
            const { rawTransaction } = await caver.klay.accounts.signTransaction(tx, [
                account.privateKey,
                caver.klay.accounts.create().privateKey,
            ])
            const result = await caver.klay.accounts.signTransaction(rawTransaction, account.privateKey)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)

            expect(result.signatures.length).to.equals(2)
            expect(result.feePayerSignatures).to.be.undefined
            expect(decoded.signatures.length).to.equals(2)
        })
    })

    context('CAVERJS-UNIT-WALLET-232: input: rawTransaction with signatures of sender and fee payer', () => {
        it('should remove duplicated signatures of fee payer', async () => {
            const rawTransaction =
                '0x09f9016c819a8505d21dba00830dbba094d05c5926b0a2f31aadcc9a9cbd3868a50104d8340194127a24ec811aa1e45071a669e5d117a475e68149f88ef845824e44a030accfbec3b577a53103c843744754a98408e7518391a31399bc757610ad1fc5a00eecc65e8f6f1795f7665513442fe30f881ddce12ceb687a8a7d9b65a0eee595f845824e44a006400dc68ab85d838a02e202e2ca52c6a30f11f7fa84f4046e08a940f4c95d1ea061a09e1a2dd6b823c42552d1cf0a4c0e408b4ada2b0236ef14ba0f036e6da262944a804669b2637b18d46e62109ed8edc0dc8526c7f88ef845824e43a0113bf0986a48768e38daeff685ce56766aacf449f2aec8a0c77165777970f954a00717c4d4720fe706a075374f8eb0432f6c9f70c0a6e6267483d0b0cc8100ec07f845824e43a00553c26e9e69541f7feca9484a5af8997c6f55b04bcac315be9c4888213709c4a00d0df6543f53afd0f131283c9a52f3c0a389b65b7a54ffe4c88004ddab74dd58'
            const feePayerTx = {
                senderRawTransaction: rawTransaction,
                feePayer: feePayer.address,
                chainId: 10000,
            }
            const result = await caver.klay.accounts.signTransaction(feePayerTx, feePayer.privateKey)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)

            expect(result.signatures).to.be.undefined
            expect(result.feePayerSignatures.length).to.equals(2)
            expect(decoded.signatures.length).to.equals(2)
            expect(decoded.feePayerSignatures.length).to.equals(2)
        })
    })

    context('CAVERJS-UNIT-WALLET-233: input: transaction object with signatures of sender', () => {
        it('should append signatures when signatures is defined in transaction object', async () => {
            vtTx.signatures = [
                [
                    '0x4e44',
                    '0x30accfbec3b577a53103c843744754a98408e7518391a31399bc757610ad1fc5',
                    '0x0eecc65e8f6f1795f7665513442fe30f881ddce12ceb687a8a7d9b65a0eee595',
                ],
            ]
            const result = await caver.klay.accounts.signTransaction(vtTx, account.privateKey)
            const decoded = caver.klay.decodeTransaction(result.rawTransaction)

            expect(result.signatures.length).to.equals(2)
            expect(result.feePayerSignatures).to.be.undefined
            expect(decoded.signatures.length).to.equals(2)
        })
    })

    context('CAVERJS-UNIT-WALLET-234: input: rawTransaction with signatures of sender and fee payer', () => {
        it('should append feePayerSignatures when feePayerSignatures is defined in transaction object', async () => {
            const rawTransaction =
                '0x09f8de819a8505d21dba00830dbba094d05c5926b0a2f31aadcc9a9cbd3868a50104d8340194127a24ec811aa1e45071a669e5d117a475e68149f847f845824e44a030accfbec3b577a53103c843744754a98408e7518391a31399bc757610ad1fc5a00eecc65e8f6f1795f7665513442fe30f881ddce12ceb687a8a7d9b65a0eee595944a804669b2637b18d46e62109ed8edc0dc8526c7f847f845824e43a0113bf0986a48768e38daeff685ce56766aacf449f2aec8a0c77165777970f954a00717c4d4720fe706a075374f8eb0432f6c9f70c0a6e6267483d0b0cc8100ec07'
            const feePayerTx = {
                senderRawTransaction: rawTransaction,
                feePayer: feePayer.address,
                feePayerSignatures: [
                    [
                        '0x4e44',
                        '0xe5465dd2d07aaf56a43a1ee0dd01583105d8f34f335e27e0ae5321a913871d0d',
                        '0x77f6c873a2a2d94d3501fd8ccc9c9d9cfdcedbde2ce645605c6849bb64be0fcf',
                    ],
                ],
            }
            const result = await caver.klay.accounts.signTransaction(feePayerTx, account.privateKey)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)

            expect(result.signatures).to.be.undefined
            expect(result.feePayerSignatures.length).to.equals(3)
            expect(decoded.signatures.length).to.equals(1)
            expect(decoded.feePayerSignatures.length).to.equals(3)
        })
    })

    context('CAVERJS-UNIT-WALLET-235: input: transaction object with from account accountKeyMultiSig', () => {
        it('should sign with multiple private key in wallet', async () => {
            const multiSigKey = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const multiSigAddress = caver.klay.accounts.create().address
            const multiSigAccount = caver.klay.accounts.createWithAccountKey(multiSigAddress, multiSigKey)
            caver.klay.accounts.wallet.add(multiSigAccount)

            vtTx.from = multiSigAddress

            const result = await caver.klay.accounts.signTransaction(vtTx)

            expect(result.signatures.length).to.equals(2)
            expect(result.feePayerSignatures).to.be.undefined
        })
    })

    context('CAVERJS-UNIT-WALLET-236: input: transaction object with from account accountKeyRoleBased', () => {
        it('should sign with transactionKey', async () => {
            const keyObject = {
                transactionKey: [caver.klay.accounts.create().privateKey],
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: [
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                ],
            }
            const roleBasedAddress = caver.klay.accounts.create().address
            const roleBasedAccount = caver.klay.accounts.createWithAccountKey(roleBasedAddress, keyObject)
            caver.klay.accounts.wallet.add(roleBasedAccount)

            vtTx.from = roleBasedAddress

            const result = await caver.klay.accounts.signTransaction(vtTx)

            expect(result.signatures.length).to.equals(1)
            expect(result.feePayerSignatures).to.be.undefined
        })
    })

    context('CAVERJS-UNIT-WALLET-237: input: transaction object with from account accountKeyRoleBased', () => {
        it('should sign with updateKey when transaction is for account update', async () => {
            const keyObject = {
                transactionKey: [caver.klay.accounts.create().privateKey],
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: [
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                ],
            }
            const roleBasedAddress = caver.klay.accounts.create().address
            const roleBasedAccount = caver.klay.accounts.createWithAccountKey(roleBasedAddress, keyObject)
            caver.klay.accounts.wallet.add(roleBasedAccount)

            const updator = caver.klay.accounts.createAccountForUpdate(
                roleBasedAddress,
                '0x19d3e96ab579566fa7cbe735cbcad18e2382d44b5e1cb8e8284d0d6e7b37094e'
            )
            const updateTx = {
                type: 'ACCOUNT_UPDATE',
                from: roleBasedAddress,
                key: updator,
                gas: 90000,
            }

            const result = await caver.klay.accounts.signTransaction(updateTx)

            expect(result.signatures.length).to.equals(2)
            expect(result.feePayerSignatures).to.be.undefined
        })
    })

    context('CAVERJS-UNIT-WALLET-238: input: fee payer transaction object with fee payer account accountKeyRoleBased', () => {
        it('should sign with feePayerKey when transaction object is fee payer format', async () => {
            const keyObject = {
                transactionKey: [caver.klay.accounts.create().privateKey],
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: [
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                ],
            }
            const roleBasedAddress = caver.klay.accounts.create().address
            const roleBasedAccount = caver.klay.accounts.createWithAccountKey(roleBasedAddress, keyObject)
            caver.klay.accounts.wallet.add(roleBasedAccount)

            const rawTransaction =
                '0x09f842819a8505d21dba00830dbba094d05c5926b0a2f31aadcc9a9cbd3868a50104d8340194127a24ec811aa1e45071a669e5d117a475e68149c4c301808080c4c3018080'
            const feePayerTx = {
                senderRawTransaction: rawTransaction,
                feePayer: roleBasedAddress,
            }

            const result = await caver.klay.accounts.signTransaction(feePayerTx)

            expect(result.signatures).to.be.undefined
            expect(result.feePayerSignatures.length).to.equals(3)
        })
    })

    context('CAVERJS-UNIT-WALLET-239: input: rawTransaction with signatures of sender and fee payer with different fee payer', () => {
        it('should remove duplicated signatures of fee payer', async () => {
            const rawTransaction =
                '0x09f9016c819a8505d21dba00830dbba094d05c5926b0a2f31aadcc9a9cbd3868a50104d8340194127a24ec811aa1e45071a669e5d117a475e68149f88ef845824e44a030accfbec3b577a53103c843744754a98408e7518391a31399bc757610ad1fc5a00eecc65e8f6f1795f7665513442fe30f881ddce12ceb687a8a7d9b65a0eee595f845824e44a006400dc68ab85d838a02e202e2ca52c6a30f11f7fa84f4046e08a940f4c95d1ea061a09e1a2dd6b823c42552d1cf0a4c0e408b4ada2b0236ef14ba0f036e6da262944a804669b2637b18d46e62109ed8edc0dc8526c7f88ef845824e43a0113bf0986a48768e38daeff685ce56766aacf449f2aec8a0c77165777970f954a00717c4d4720fe706a075374f8eb0432f6c9f70c0a6e6267483d0b0cc8100ec07f845824e43a00553c26e9e69541f7feca9484a5af8997c6f55b04bcac315be9c4888213709c4a00d0df6543f53afd0f131283c9a52f3c0a389b65b7a54ffe4c88004ddab74dd58'
            const newFeePayer = caver.klay.accounts.create()
            const feePayerTx = {
                senderRawTransaction: rawTransaction,
                feePayer: newFeePayer.address,
            }

            const errorMessage = `Invalid feePayer: The fee payer(${feePayer.address}) included in the transaction does not match the fee payer(${newFeePayer.address}) you want to sign.`
            await expect(caver.klay.accounts.signTransaction(feePayerTx, newFeePayer.privateKey)).to.be.rejectedWith(errorMessage)
        })
    })

    context('CAVERJS-UNIT-WALLET-240: input: legacy rawTransaction with signatures of sender', () => {
        it('should throw error becuase encoded legacy transaction do not contain from', async () => {
            const rawTransaction =
                '0xf867808505d21dba00830dbba09430d8d4217145ba3f6cde24ec28c64c9120f2bdfb0180820feaa03ae52bd8b105a138f179ecc85c94296c851922775ef15d9d775b6cc1971ad19ca07164eff9bf7ac3f9a80d1578ee48ccaa08fe127d21ce00a5b3110b774289695b'

            const errorMessage = '"from" is missing'
            await expect(caver.klay.accounts.signTransaction(rawTransaction, account.privateKey)).to.be.rejectedWith(errorMessage)
        })
    })

    context('CAVERJS-UNIT-WALLET-241: input: legacy rawTransaction with signatures of sender', () => {
        it('should throw error becuase encoded legacy transaction do not contain from', async () => {
            txObj.signatures = [
                '0x0fea',
                '0x3ae52bd8b105a138f179ecc85c94296c851922775ef15d9d775b6cc1971ad19c',
                '0x7164eff9bf7ac3f9a80d1578ee48ccaa08fe127d21ce00a5b3110b774289695b',
            ]

            const errorMessage = 'Legacy transaction cannot be signed with multiple keys.'
            await expect(caver.klay.accounts.signTransaction(txObj, account.privateKey)).to.be.rejectedWith(errorMessage)
        })
    })

    context('CAVERJS-UNIT-WALLET-242: input: rawTransaction without fee payer in tx object', () => {
        it('should throw error when fee payer is not defined', async () => {
            const rawTransaction =
                '0x09f9016c819a8505d21dba00830dbba094d05c5926b0a2f31aadcc9a9cbd3868a50104d8340194127a24ec811aa1e45071a669e5d117a475e68149f88ef845824e44a030accfbec3b577a53103c843744754a98408e7518391a31399bc757610ad1fc5a00eecc65e8f6f1795f7665513442fe30f881ddce12ceb687a8a7d9b65a0eee595f845824e44a006400dc68ab85d838a02e202e2ca52c6a30f11f7fa84f4046e08a940f4c95d1ea061a09e1a2dd6b823c42552d1cf0a4c0e408b4ada2b0236ef14ba0f036e6da262944a804669b2637b18d46e62109ed8edc0dc8526c7f88ef845824e43a0113bf0986a48768e38daeff685ce56766aacf449f2aec8a0c77165777970f954a00717c4d4720fe706a075374f8eb0432f6c9f70c0a6e6267483d0b0cc8100ec07f845824e43a00553c26e9e69541f7feca9484a5af8997c6f55b04bcac315be9c4888213709c4a00d0df6543f53afd0f131283c9a52f3c0a389b65b7a54ffe4c88004ddab74dd58'
            const feePayerTx = { senderRawTransaction: rawTransaction }

            const errorMessage = 'Invalid fee payer: undefined'
            await expect(caver.klay.accounts.signTransaction(feePayerTx, account.privateKey)).to.be.rejectedWith(errorMessage)
        })
    })

    context('CAVERJS-UNIT-WALLET-243: input: update transaction object with AccountForUpdate with mismatched address', () => {
        it('should throw error when address is not matched', async () => {
            const updator = caver.klay.accounts.createAccountForUpdate(
                caver.klay.accounts.create().address,
                '0x19d3e96ab579566fa7cbe735cbcad18e2382d44b5e1cb8e8284d0d6e7b37094e'
            )
            const updateTx = {
                type: 'ACCOUNT_UPDATE',
                from: account.address,
                key: updator,
                gas: 90000,
            }

            const errorMessage = 'The value of the from field of the transaction does not match the address of AccountForUpdate.'
            await expect(caver.klay.accounts.signTransaction(updateTx)).to.be.rejectedWith(errorMessage)
        })
    })

    context('CAVERJS-UNIT-WALLET-390: sign transaction with signTransaction function in Account instance', () => {
        it('should be signed with transactionKey', async () => {
            const keyObject = {
                transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
            }
            const roleBasedAddress = caver.klay.accounts.create().address
            const roleBasedAccount = caver.klay.accounts.createWithAccountKey(roleBasedAddress, keyObject)

            vtTx.from = roleBasedAddress

            const result = await roleBasedAccount.signTransaction(vtTx)

            expect(result.signatures.length).to.equals(2)
            expect(result.feePayerSignatures).to.be.undefined
        })
    })

    context('CAVERJS-UNIT-WALLET-391: sign transaction with signTransaction function in Account instance', () => {
        it('should be signed with updateKey', async () => {
            const keyObject = {
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
            }
            const roleBasedAddress = caver.klay.accounts.create().address
            const roleBasedAccount = caver.klay.accounts.createWithAccountKey(roleBasedAddress, keyObject)

            const updateTx = {
                type: 'ACCOUNT_UPDATE',
                from: roleBasedAccount.address,
                gas: 100000,
                publicKey:
                    '0x4255497c08282874319715c4f2752ffc205591cfe8c10d285bfa673273b47db74b35980432bc3e36a62e356b9a29e2d0a1650c8f350a1ef121c460473236a873',
            }

            const result = await roleBasedAccount.signTransaction(updateTx)

            expect(result.signatures.length).to.equals(2)
            expect(result.feePayerSignatures).to.be.undefined
        })
    })

    context('CAVERJS-UNIT-WALLET-392: sign transaction with signTransaction function in Account instance', () => {
        it('should be signed with feePayerKey', async () => {
            const keyObject = {
                feePayerKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
            }
            const roleBasedAddress = caver.klay.accounts.create().address
            const roleBasedAccount = caver.klay.accounts.createWithAccountKey(roleBasedAddress, keyObject)

            const rawTransaction =
                '0x09f842819a8505d21dba00830dbba094d2553e0508d481892aa1b481b3ac29aba5c7fb4d01946f9a8851feca74f6694a12d11c9684f0b5c1d3b6c4c301808080c4c3018080'
            const feePayerTx = { senderRawTransaction: rawTransaction, feePayer: roleBasedAccount.address }

            const result = await roleBasedAccount.signTransaction(feePayerTx)

            expect(result.feePayerSignatures.length).to.equals(2)
        })
    })
})

describe('caver.klay.accounts.feePayerSignTransaction', () => {
    let txObj
    let sender
    let feePayer
    const withoutSig =
        '0x09f842819a8505d21dba00830dbba094d2553e0508d481892aa1b481b3ac29aba5c7fb4d01946f9a8851feca74f6694a12d11c9684f0b5c1d3b6c4c301808080c4c3018080'
    const withSenderSig =
        '0x09f90114819a8505d21dba00830dbba094d2553e0508d481892aa1b481b3ac29aba5c7fb4d01946f9a8851feca74f6694a12d11c9684f0b5c1d3b6f8d5f845820feaa06d2b6c9530a9f311a3ea42b2fc474ce0decefc65a88510161a392eef029714b8a0360fff97c9818dabb7d25ce4dc1afb4a5cca00409d79c0e3f76e151dec542701f845820feaa0fb24ef24dd6d10a9410417c56a5a8b09575d0611251f6f03b9199b4004cee087a02a1b040cc80942deda8523c2bf24364b3b2ea1a6d33165fde35d86a1c247ddfef845820fe9a0ae0d77d98aec5880efc7bd943fb58ea691e3023975e757a720586d3781284d9aa077072cfa045f872a1e33840e28ed2704f8a6d77f5077171b6b45e3ec7a671ddf80c4c3018080'
    const withFeePayerSig =
        '0x09f90128819a8505d21dba00830dbba094d2553e0508d481892aa1b481b3ac29aba5c7fb4d01946f9a8851feca74f6694a12d11c9684f0b5c1d3b6c4c3018080944a804669b2637b18d46e62109ed8edc0dc8526c7f8d5f845824e43a003df110e3d328d75ac8b05ff29e3b00b65c4402bc0f2556590077e3ffd699f85a0395252d8b2bf6a5b1b997d41694bb84b6e30bc846263b6fc55a023a66ef68630f845824e44a08eb3eb4414fe1b5f0f1baaa0192a9ee018b6132b8fc965918318bdd7087acb42a0211741eae45dae25659894ada38c0c5b03483337148182d2951e7386cb2c2ab8f845824e44a0691eaea2dead54efce368395f2394a9cbc7b3d68effd5c5b3ba9bee7b57dfa59a00b7cbe6b8ebcf013a197f6ee81e3c3e180cf62c940fd8f9282d3f6814d710c9d'
    const withBothSig =
        '0x09f901fa819a8505d21dba00830dbba094d2553e0508d481892aa1b481b3ac29aba5c7fb4d01946f9a8851feca74f6694a12d11c9684f0b5c1d3b6f8d5f845820feaa06d2b6c9530a9f311a3ea42b2fc474ce0decefc65a88510161a392eef029714b8a0360fff97c9818dabb7d25ce4dc1afb4a5cca00409d79c0e3f76e151dec542701f845820feaa0fb24ef24dd6d10a9410417c56a5a8b09575d0611251f6f03b9199b4004cee087a02a1b040cc80942deda8523c2bf24364b3b2ea1a6d33165fde35d86a1c247ddfef845820fe9a0ae0d77d98aec5880efc7bd943fb58ea691e3023975e757a720586d3781284d9aa077072cfa045f872a1e33840e28ed2704f8a6d77f5077171b6b45e3ec7a671ddf944a804669b2637b18d46e62109ed8edc0dc8526c7f8d5f845824e43a0e0cd799758d93f3ac9ff1fd5055bff9e7c7e664599f5615c5016c88b7c8edea5a00353e206c246a10a5ac4388924e8eb42fedbbbfb674efa8441f0b0c4957cf05df845824e43a04c5c84dcace452a5bde411d7888d116f0a993a579b11a79cc9ed7fa6e9adb421a023d33c71fced04801643d4d58c9fbb184625cbfaa8dab5a8e25ec5e84d25452af845824e44a0051fad2c19ee4936721b5985ebdf354d069f3e9e3d3c832751caf20f69202c20a03f340e42613e6868cff9b3312fa0f671523b340d469d7d69f6573724bd6f6047'

    beforeEach(() => {
        const senderRoleBasedKey = {
            transactionKey: [
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
            ],
        }
        const feePayerRoleBasedKey = {
            feePayerKey: [
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
            ],
        }

        sender = caver.klay.accounts.wallet.add(
            caver.klay.accounts.createWithAccountKey('0x6f9a8851feca74f6694a12d11c9684f0b5c1d3b6', senderRoleBasedKey)
        )
        feePayer = caver.klay.accounts.wallet.add(
            caver.klay.accounts.createWithAccountKey('0x4a804669b2637b18d46e62109ed8edc0dc8526c7', feePayerRoleBasedKey)
        )

        txObj = {
            type: 'FEE_DELEGATED_VALUE_TRANSFER',
            from: sender.address,
            to: '0xd2553e0508d481892aa1b481b3ac29aba5c7fb4d',
            value: '0x1',
            gas: '0xdbba0',
            chainId: '0x7e3',
            gasPrice: '0x5d21dba00',
            nonce: '0x9a',
        }
    })

    context('CAVERJS-UNIT-WALLET-273: input: tx object without signatures and feePayer', () => {
        it('should sign with feePayerKey of feePayer and return feePayerSignatures and rawTransaction', async () => {
            const result = await caver.klay.accounts.feePayerSignTransaction(txObj, feePayer.address)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-274: input: tx object(signatures) and feePayer', () => {
        it('should sign with feePayerKey of feePayer and return feePayerSignatures and rawTransaction', async () => {
            txObj.signatures = [
                [
                    '0x0fea',
                    '0x6d2b6c9530a9f311a3ea42b2fc474ce0decefc65a88510161a392eef029714b8',
                    '0x360fff97c9818dabb7d25ce4dc1afb4a5cca00409d79c0e3f76e151dec542701',
                ],
            ]
            const result = await caver.klay.accounts.feePayerSignTransaction(txObj, feePayer.address)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.signatures.length).to.equals(txObj.signatures.length)
            expect(decoded.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-275: input: tx object(feePayer/feePayerSignatures) and feePayer', () => {
        it('should append with feePayerKey of feePayer and return feePayerSignatures and rawTransaction', async () => {
            txObj.feePayer = feePayer.address
            txObj.feePayerSignatures = [
                [
                    '0x4e44',
                    '0x7328aa537646bfffebfd6f006f9a6e0520d077cb898225e4fa44f52c54c4c2f2',
                    '0x6302349a19b4b7b9d82798eac1d4716cdaa239e490fd8427f49c9bca4dd4b6a2',
                ],
            ]
            const result = await caver.klay.accounts.feePayerSignTransaction(txObj, feePayer.address)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length + 1)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length + 1)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-276: input: tx object(feePayerSignatures) and feePayer', () => {
        it('should set feePayer with value of feePayer parameter and append feePayerSignatures', async () => {
            txObj.feePayerSignatures = [
                [
                    '0x4e44',
                    '0x7328aa537646bfffebfd6f006f9a6e0520d077cb898225e4fa44f52c54c4c2f2',
                    '0x6302349a19b4b7b9d82798eac1d4716cdaa239e490fd8427f49c9bca4dd4b6a2',
                ],
            ]
            const result = await caver.klay.accounts.feePayerSignTransaction(txObj, feePayer.address)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length + 1)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length + 1)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-277: input: tx object(signatures/feePayer/feePayerSignatures) and feePayer', () => {
        it('should append with feePayerKey of feePayer and return feePayerSignatures and rawTransaction', async () => {
            txObj.signatures = [
                [
                    '0x0fea',
                    '0x6d2b6c9530a9f311a3ea42b2fc474ce0decefc65a88510161a392eef029714b8',
                    '0x360fff97c9818dabb7d25ce4dc1afb4a5cca00409d79c0e3f76e151dec542701',
                ],
            ]
            txObj.feePayer = feePayer.address
            txObj.feePayerSignatures = [
                [
                    '0x4e44',
                    '0x7328aa537646bfffebfd6f006f9a6e0520d077cb898225e4fa44f52c54c4c2f2',
                    '0x6302349a19b4b7b9d82798eac1d4716cdaa239e490fd8427f49c9bca4dd4b6a2',
                ],
            ]
            const result = await caver.klay.accounts.feePayerSignTransaction(txObj, feePayer.address)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length + 1)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.signatures.length).to.equals(txObj.signatures.length)
            expect(decoded.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length + 1)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-278: input: tx object(signatures/feePayer/feePayerSignatures), feePayer and privateKey', () => {
        it('should append with feePayerKey of feePayer and return feePayerSignatures and rawTransaction', async () => {
            txObj.signatures = [
                [
                    '0x0fea',
                    '0x6d2b6c9530a9f311a3ea42b2fc474ce0decefc65a88510161a392eef029714b8',
                    '0x360fff97c9818dabb7d25ce4dc1afb4a5cca00409d79c0e3f76e151dec542701',
                ],
            ]
            txObj.feePayer = feePayer.address
            txObj.feePayerSignatures = [
                [
                    '0x4e44',
                    '0x7328aa537646bfffebfd6f006f9a6e0520d077cb898225e4fa44f52c54c4c2f2',
                    '0x6302349a19b4b7b9d82798eac1d4716cdaa239e490fd8427f49c9bca4dd4b6a2',
                ],
            ]
            const result = await caver.klay.accounts.feePayerSignTransaction(txObj, feePayer.address, feePayer.feePayerKey[0])

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(2)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.signatures.length).to.equals(txObj.signatures.length)
            expect(decoded.feePayerSignatures.length).to.equals(2)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-279: input: tx object(feePayer), feePayer and privateKey', () => {
        it('should throw error when feePayer is not matched', async () => {
            txObj.feePayer = caver.klay.accounts.create().address

            const errorMessage = 'Invalid parameter: The address of fee payer does not match.'

            await expect(caver.klay.accounts.feePayerSignTransaction(txObj, feePayer.address)).to.be.rejectedWith(errorMessage)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-280: input: tx object(without nonce) and feePayer', () => {
        it('should return signature and rawTransaction', async () => {
            const tx = { ...txObj }
            delete tx.nonce

            const result = await caver.klay.accounts.feePayerSignTransaction(tx, feePayer.address)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-281: input: tx object(without nonce), feePayer and privateKey', () => {
        it('should return signature and rawTransaction', async () => {
            const tx = { ...txObj }
            delete tx.nonce

            const result = await caver.klay.accounts.feePayerSignTransaction(tx, feePayer.address, feePayer.feePayerKey[0])

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(1)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.feePayerSignatures.length).to.equals(1)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-282: input: tx object(without gasPrice) and feePayer', () => {
        it('should return signature and rawTransaction', async () => {
            const tx = { ...txObj }
            delete tx.gasPrice

            const result = await caver.klay.accounts.feePayerSignTransaction(tx, feePayer.address)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-283: input: tx object(without gasPrice), feePayer and privateKey', () => {
        it('should return signature and rawTransaction', async () => {
            const tx = { ...txObj }
            delete tx.gasPrice

            const result = await caver.klay.accounts.feePayerSignTransaction(tx, feePayer.address, feePayer.feePayerKey[0])

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(1)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.feePayerSignatures.length).to.equals(1)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-284: input: tx object(without chainId) and feePayer', () => {
        it('should return signature and rawTransaction', async () => {
            const tx = { ...txObj }
            delete tx.chainId

            const result = await caver.klay.accounts.feePayerSignTransaction(tx, feePayer.address)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-285: input: tx object(without chainId), feePayer and privateKey', () => {
        it('should return signature and rawTransaction', async () => {
            const tx = { ...txObj }
            delete tx.chainId

            const result = await caver.klay.accounts.feePayerSignTransaction(tx, feePayer.address, feePayer.feePayerKey[0])

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(1)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.feePayerSignatures.length).to.equals(1)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-286: input: tx object, feePayer and invalid privateKey', () => {
        it('should throw error when private key is invalid', async () => {
            const invalid = '0x01'
            const errorMessage = `Invalid private key(${invalid.slice(2)})`

            await expect(caver.klay.accounts.feePayerSignTransaction(txObj, feePayer.address, invalid)).to.be.rejectedWith(errorMessage)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-287: input: tx object, invalid feePayer address', () => {
        it('should throw error when private key is invalid', async () => {
            const invalid = 'feePayer'
            const errorMessage = `Invalid fee payer address : ${invalid}`

            await expect(caver.klay.accounts.feePayerSignTransaction(txObj, invalid)).to.be.rejectedWith(errorMessage)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-288: input: tx object(without from) and feePayer', () => {
        it('should throw error when invalid transaction', async () => {
            const invalid = { ...txObj }
            delete invalid.from

            const errorMessage = '"from" is missing'
            await expect(caver.klay.accounts.feePayerSignTransaction(invalid, feePayer.address)).to.be.rejectedWith(errorMessage)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-289: input: tx object(without from), feePayer and privateKey', () => {
        it('should throw error when invalid transaction', async () => {
            const invalid = { ...txObj }
            delete invalid.from

            const errorMessage = '"from" is missing'
            await expect(
                caver.klay.accounts.feePayerSignTransaction(invalid, feePayer.address, feePayer.feePayerKey[0])
            ).to.be.rejectedWith(errorMessage)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-290: input: RLP encoded rawTransaction(without signatures) string and feePayer', () => {
        it('should sign with feePayerKey of feePayer and return feePayerSignatures and rawTransaction', async () => {
            const result = await caver.klay.accounts.feePayerSignTransaction(withoutSig, feePayer.address)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(3)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-291: input: RLP encoded rawTransaction(with signatures of sender) string and feePayer', () => {
        it('should sign with feePayerKey of feePayer and return feePayerSignatures and rawTransaction', async () => {
            const result = await caver.klay.accounts.feePayerSignTransaction(withSenderSig, feePayer.address)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(3)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.signatures.length).to.equals(3)
            expect(decoded.feePayerSignatures.length).to.equals(3)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-292: input: RLP encoded rawTransaction(with signatures of fee payer) string and feePayer', () => {
        it('should append with feePayerKey of feePayer and return feePayerSignatures and rawTransaction', async () => {
            const result = await caver.klay.accounts.feePayerSignTransaction(withFeePayerSig, feePayer.address)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(6)
        })
    }).timeout(10000)

    context(
        'CAVERJS-UNIT-WALLET-293: input: RLP encoded rawTransaction(with signatures of sender and fee payer) string and feePayer',
        () => {
            it('should append with feePayerKey of feePayer and return feePayerSignatures and rawTransaction', async () => {
                const result = await caver.klay.accounts.feePayerSignTransaction(withBothSig, feePayer.address)

                const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
                expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

                expect(result.feePayerSignatures.length).to.equals(6)

                const decoded = caver.klay.decodeTransaction(result.rawTransaction)
                expect(decoded.signatures.length).to.equals(3)
                expect(decoded.feePayerSignatures.length).to.equals(6)
            })
        }
    ).timeout(10000)

    context(
        'CAVERJS-UNIT-WALLET-294: input: RLP encoded rawTransaction(with signatures of sender and fee payer) string, feePayer and privateKey',
        () => {
            it('should append with feePayerKey of feePayer and return feePayerSignatures and rawTransaction', async () => {
                const result = await caver.klay.accounts.feePayerSignTransaction(withBothSig, feePayer.address, feePayer.feePayerKey[0])

                const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
                expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

                expect(result.feePayerSignatures.length).to.equals(4)

                const decoded = caver.klay.decodeTransaction(result.rawTransaction)
                expect(decoded.signatures.length).to.equals(3)
                expect(decoded.feePayerSignatures.length).to.equals(4)
            })
        }
    ).timeout(10000)

    context(
        'CAVERJS-UNIT-WALLET-295: input: RLP encoded rawTransaction(with signatures of sender and fee payer) string with invalid feePayer',
        () => {
            it('should throw error when address of fee payer is invalid', async () => {
                const invalid = 'feePayer'
                const errorMessage = `Invalid fee payer address : ${invalid}`

                await expect(caver.klay.accounts.feePayerSignTransaction(withBothSig, invalid)).to.be.rejectedWith(errorMessage)
            })
        }
    ).timeout(10000)

    context(
        'CAVERJS-UNIT-WALLET-296: input: RLP encoded rawTransaction(with signatures of sender and fee payer) string, feePayer and invalid private key',
        () => {
            it('should throw error when private key is invalid', async () => {
                const invalid = '0x01'
                const errorMessage = `Invalid private key(${invalid.slice(2)})`

                await expect(caver.klay.accounts.feePayerSignTransaction(withBothSig, feePayer.address, invalid)).to.be.rejectedWith(
                    errorMessage
                )
            })
        }
    ).timeout(10000)

    context('CAVERJS-UNIT-WALLET-297: input: fee payer format transaction(without signatures) string and feePayer', () => {
        it('should sign with feePayerKey of feePayer and return feePayerSignatures and rawTransaction', async () => {
            const feePayerTx = {
                senderRawTransaction: withoutSig,
                feePayer: feePayer.address,
            }
            const result = await caver.klay.accounts.feePayerSignTransaction(feePayerTx, feePayer.address)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(3)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-298: input: fee payer format transaction(with signatures of sender) string and feePayer', () => {
        it('should sign with feePayerKey of feePayer and return feePayerSignatures and rawTransaction', async () => {
            const feePayerTx = {
                senderRawTransaction: withSenderSig,
                feePayer: feePayer.address,
            }
            const result = await caver.klay.accounts.feePayerSignTransaction(feePayerTx, feePayer.address)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(3)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.signatures.length).to.equals(3)
            expect(decoded.feePayerSignatures.length).to.equals(3)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-299: input: fee payer format transaction(with signatures of fee payer) string and feePayer', () => {
        it('should append with feePayerKey of feePayer and return feePayerSignatures and rawTransaction', async () => {
            const feePayerTx = {
                senderRawTransaction: withFeePayerSig,
                feePayer: feePayer.address,
            }
            const result = await caver.klay.accounts.feePayerSignTransaction(feePayerTx, feePayer.address)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(6)
        })
    }).timeout(10000)

    context(
        'CAVERJS-UNIT-WALLET-300: input: fee payer format transaction(with signatures of sender and fee payer) string and feePayer',
        () => {
            it('should append with feePayerKey of feePayer and return feePayerSignatures and rawTransaction', async () => {
                const feePayerTx = {
                    senderRawTransaction: withBothSig,
                    feePayer: feePayer.address,
                }
                const result = await caver.klay.accounts.feePayerSignTransaction(feePayerTx, feePayer.address)

                const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
                expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

                expect(result.feePayerSignatures.length).to.equals(6)

                const decoded = caver.klay.decodeTransaction(result.rawTransaction)
                expect(decoded.signatures.length).to.equals(3)
                expect(decoded.feePayerSignatures.length).to.equals(6)
            })
        }
    ).timeout(10000)

    context(
        'CAVERJS-UNIT-WALLET-301: input: fee payer format transaction(with signatures of sender and fee payer) string, feePayer and privateKey',
        () => {
            it('should append with feePayerKey of feePayer and return feePayerSignatures and rawTransaction', async () => {
                const feePayerTx = {
                    senderRawTransaction: withBothSig,
                    feePayer: feePayer.address,
                }
                const result = await caver.klay.accounts.feePayerSignTransaction(feePayerTx, feePayer.address, feePayer.feePayerKey[0])

                const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
                expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

                expect(result.feePayerSignatures.length).to.equals(4)

                const decoded = caver.klay.decodeTransaction(result.rawTransaction)
                expect(decoded.signatures.length).to.equals(3)
                expect(decoded.feePayerSignatures.length).to.equals(4)
            })
        }
    ).timeout(10000)

    context('CAVERJS-UNIT-WALLET-302: input: fee payer tx object(without feePayer) and feePayer', () => {
        it('should set feePayer information through feePayer parameter', async () => {
            const feePayerTx = { senderRawTransaction: withoutSig }

            const result = await caver.klay.accounts.feePayerSignTransaction(feePayerTx, feePayer.address)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-303: input: fee payer tx object(with 0x feePayer) and feePayer', () => {
        it('should set feePayer information through feePayer parameter', async () => {
            let feePayerTx = { senderRawTransaction: withoutSig, feePayer: '0x' }

            let result = await caver.klay.accounts.feePayerSignTransaction(feePayerTx, feePayer.address)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length)

            feePayerTx = { senderRawTransaction: withoutSig, feePayer: '0x0000000000000000000000000000000000000000' }

            result = await caver.klay.accounts.feePayerSignTransaction(feePayerTx, feePayer.address)

            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length)
        })
    }).timeout(10000)

    context(
        'CAVERJS-UNIT-WALLET-304: input: fee payer format transaction(with signatures of sender and fee payer) string with invalid feePayer',
        () => {
            it('should throw error when address of fee payer is invalid', async () => {
                const invalid = 'feePayer'
                const feePayerTx = {
                    senderRawTransaction: withBothSig,
                    feePayer: invalid,
                }
                const errorMessage = `Invalid fee payer address : ${invalid}`

                await expect(caver.klay.accounts.feePayerSignTransaction(feePayerTx, invalid)).to.be.rejectedWith(errorMessage)
            })
        }
    ).timeout(10000)

    context(
        'CAVERJS-UNIT-WALLET-305: input: fee payer format transaction(with signatures of sender and fee payer) string with not matched feePayer',
        () => {
            it('should throw error when address of fee payer in transaction object is not matched with fee payer parameter', async () => {
                const { address } = caver.klay.accounts.create()
                const feePayerTx = {
                    senderRawTransaction: withBothSig,
                    feePayer: caver.klay.accounts.create().address,
                }
                const errorMessage = 'Invalid parameter: The address of fee payer does not match.'

                await expect(caver.klay.accounts.feePayerSignTransaction(feePayerTx, address)).to.be.rejectedWith(errorMessage)
            })
        }
    ).timeout(10000)

    context(
        'CAVERJS-UNIT-WALLET-306: input: fee payer format transaction(with signatures of sender and fee payer) string, feePayer and invalid private key',
        () => {
            it('should throw error when private key is invalid', async () => {
                const invalid = '0x01'
                const feePayerTx = {
                    senderRawTransaction: withBothSig,
                    feePayer: feePayer.address,
                }
                const errorMessage = `Invalid private key(${invalid.slice(2)})`

                await expect(caver.klay.accounts.feePayerSignTransaction(feePayerTx, feePayer.address, invalid)).to.be.rejectedWith(
                    errorMessage
                )
            })
        }
    ).timeout(10000)

    context('CAVERJS-UNIT-WALLET-376: input: non fee delegated transaction, fee payer address', () => {
        it('should throw error when private key is invalid', async () => {
            const nonFeeDelegated = {
                type: 'VALUE_TRANSFER',
                from: sender.address,
                to: '0xd2553e0508d481892aa1b481b3ac29aba5c7fb4d',
                value: '0x1',
                gas: '0xdbba0',
                chainId: '0x7e3',
                gasPrice: '0x5d21dba00',
                nonce: '0x9a',
            }
            const errorMessage = 'Failed to sign transaction with fee payer: invalid transaction type(VALUE_TRANSFER)'

            await expect(caver.klay.accounts.feePayerSignTransaction(nonFeeDelegated, feePayer.address)).to.be.rejectedWith(errorMessage)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-377: input: non fee delegated transaction, fee payer address', () => {
        it('should throw error when private key is invalid', async () => {
            const nonFeeDelegated = {
                type: 'VALUE_TRANSFER',
                from: sender.address,
                to: '0xd2553e0508d481892aa1b481b3ac29aba5c7fb4d',
                value: '0x1',
                gas: '0xdbba0',
                chainId: '0x7e3',
                gasPrice: '0x5d21dba00',
                nonce: '0x9a',
            }
            const { rawTransaction } = await caver.klay.accounts.signTransaction(nonFeeDelegated)
            const errorMessage = "Failed to split fee payer: not a fee delegated transaction type('VALUE_TRANSFER')"

            await expect(caver.klay.accounts.feePayerSignTransaction(rawTransaction, feePayer.address)).to.be.rejectedWith(errorMessage)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-393: use feePayerSignTransaciton in Account instance', () => {
        it('should sign with feePayerKey to transaction as a fee payer', async () => {
            const result = await feePayer.feePayerSignTransaction(txObj)

            const keys = ['messageHash', 'v', 'r', 's', 'rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(result.feePayerSignatures.length).to.equals(feePayer.feePayerKey.length)
        })
    }).timeout(10000)

    context('CAVERJS-UNIT-WALLET-417: input: tx object(different chainId), feePayer', () => {
        it('should return different signature result when chainId is different', async () => {
            const tx = { ...txObj }

            tx.chainId = 10000
            const result1 = await caver.klay.accounts.feePayerSignTransaction(tx, feePayer.address, feePayer.feePayerKey[0])

            tx.chainId = 20000
            const result2 = await caver.klay.accounts.feePayerSignTransaction(tx, feePayer.address, feePayer.feePayerKey[0])

            expect(result1.feePayerSignatures[0][0]).not.to.equals(result2.feePayerSignatures[0][0])
            expect(result1.feePayerSignatures[0][1]).not.to.equals(result2.feePayerSignatures[0][1])
            expect(result1.feePayerSignatures[0][2]).not.to.equals(result2.feePayerSignatures[0][2])
        }).timeout(10000)
    })
})

describe('caver.klay.accounts.getRawTransactionWithSignatures', () => {
    let vtTx
    let feeDelegatedTx
    let sender
    let feePayer

    beforeEach(() => {
        const senderRoleBasedKey = {
            transactionKey: [
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
            ],
        }
        const feePayerRoleBasedKey = {
            feePayerKey: [
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
            ],
        }

        sender = caver.klay.accounts.wallet.add(
            caver.klay.accounts.createWithAccountKey('0x6f9a8851feca74f6694a12d11c9684f0b5c1d3b6', senderRoleBasedKey)
        )
        feePayer = caver.klay.accounts.wallet.add(
            caver.klay.accounts.createWithAccountKey('0x4a804669b2637b18d46e62109ed8edc0dc8526c7', feePayerRoleBasedKey)
        )

        vtTx = {
            type: 'VALUE_TRANSFER',
            from: sender.address,
            to: '0xd2553e0508d481892aa1b481b3ac29aba5c7fb4d',
            value: '0x1',
            gas: '0xdbba0',
            chainId: '0x7e3',
            gasPrice: '0x5d21dba00',
            nonce: '0x9a',
        }

        feeDelegatedTx = {
            type: 'FEE_DELEGATED_VALUE_TRANSFER',
            from: sender.address,
            to: '0xd2553e0508d481892aa1b481b3ac29aba5c7fb4d',
            value: '0x1',
            gas: '0xdbba0',
            chainId: '0x7e3',
            gasPrice: '0x5d21dba00',
            nonce: '0x9a',
        }
    })

    context('CAVERJS-UNIT-WALLET-307: input: value transfer tx object with signatures', () => {
        it('should return valid rawTransaction', async () => {
            const signResult = await caver.klay.accounts.signTransaction(vtTx)
            vtTx.signatures = signResult.signatures

            const result = await caver.klay.accounts.getRawTransactionWithSignatures(vtTx)

            const keys = ['rawTransaction', 'txHash', 'senderTxHash', 'signatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(signResult.rawTransaction).to.equals(result.rawTransaction)
        }).timeout(200000)
    })

    context('CAVERJS-UNIT-WALLET-308: input: fee delegated value transfer tx object with signatures', () => {
        it('should return valid rawTransaction', async () => {
            const signResult = await caver.klay.accounts.signTransaction(feeDelegatedTx)
            feeDelegatedTx.signatures = signResult.signatures

            const result = await caver.klay.accounts.getRawTransactionWithSignatures(feeDelegatedTx)

            const keys = ['rawTransaction', 'txHash', 'senderTxHash', 'signatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            expect(signResult.rawTransaction).to.equals(result.rawTransaction)
        }).timeout(200000)
    })

    context('CAVERJS-UNIT-WALLET-309: input: fee delegated value transfer tx object with feePayerSignatures', () => {
        it('should return valid rawTransaction', async () => {
            const tx = { ...feeDelegatedTx }

            const feePayerSignResult = await caver.klay.accounts.feePayerSignTransaction(feeDelegatedTx, feePayer.address)

            tx.feePayer = feePayer.address
            tx.feePayerSignatures = feePayerSignResult.feePayerSignatures

            const result = await caver.klay.accounts.getRawTransactionWithSignatures(tx)

            const keys = ['rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)
            expect(result.feePayerSignatures.length).to.equals(3)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(caver.utils.isEmptySig(decoded.signatures)).to.be.true
            expect(decoded.feePayerSignatures.length).to.equals(3)
        }).timeout(200000)
    })

    context('CAVERJS-UNIT-WALLET-310: input: fee delegated value transfer tx object with signatures and feePayerSignatures', () => {
        it('should return valid rawTransaction', async () => {
            const tx = { ...feeDelegatedTx }

            const signResult = await caver.klay.accounts.signTransaction(feeDelegatedTx)

            const feePayerSignResult = await caver.klay.accounts.feePayerSignTransaction(feeDelegatedTx, feePayer.address)

            tx.signatures = signResult.signatures
            tx.feePayer = feePayer.address
            tx.feePayerSignatures = feePayerSignResult.feePayerSignatures

            const result = await caver.klay.accounts.getRawTransactionWithSignatures(tx)

            const keys = ['rawTransaction', 'txHash', 'senderTxHash', 'signatures', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)
            expect(result.signatures.length).to.equals(3)
            expect(result.feePayerSignatures.length).to.equals(3)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.signatures.length).to.equals(3)
            expect(decoded.feePayerSignatures.length).to.equals(3)
        }).timeout(200000)
    })

    context('CAVERJS-UNIT-WALLET-311: input: fee payer tx format(includes signatures) object with signatures', () => {
        it('should return valid rawTransaction', async () => {
            const signResult = await caver.klay.accounts.signTransaction(feeDelegatedTx, sender.transactionKey[0])
            const signResult2 = await caver.klay.accounts.signTransaction(feeDelegatedTx, [
                sender.transactionKey[1],
                sender.transactionKey[2],
            ])

            const feePayerTx = {
                senderRawTransaction: signResult.rawTransaction,
                feePayer: feePayer.address,
                signatures: signResult2.signatures,
            }
            const result = await caver.klay.accounts.getRawTransactionWithSignatures(feePayerTx)

            const keys = ['rawTransaction', 'txHash', 'senderTxHash', 'signatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)
            expect(result.signatures.length).to.equals(3)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.signatures.length).to.equals(3)
        }).timeout(200000)
    })

    context(
        'CAVERJS-UNIT-WALLET-312: input: fee payer tx format(includes signatures and feePayerSignatures) object with signatures',
        () => {
            it('should return valid rawTransaction', async () => {
                const signResult = await caver.klay.accounts.signTransaction(feeDelegatedTx, sender.transactionKey[0])
                const signResult2 = await caver.klay.accounts.signTransaction(feeDelegatedTx, [
                    sender.transactionKey[1],
                    sender.transactionKey[2],
                ])
                const feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(
                    signResult.rawTransaction,
                    feePayer.address,
                    feePayer.feePayerKey[0]
                )

                const feePayerTx = {
                    senderRawTransaction: feePayerSigned.rawTransaction,
                    feePayer: feePayer.address,
                    signatures: signResult2.signatures,
                }
                const result = await caver.klay.accounts.getRawTransactionWithSignatures(feePayerTx)

                const keys = ['rawTransaction', 'txHash', 'senderTxHash', 'signatures', 'feePayerSignatures']
                expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)
                expect(result.signatures.length).to.equals(3)
                expect(result.feePayerSignatures.length).to.equals(1)

                const decoded = caver.klay.decodeTransaction(result.rawTransaction)
                expect(decoded.signatures.length).to.equals(3)
                expect(decoded.feePayerSignatures.length).to.equals(1)
            }).timeout(200000)
        }
    )

    context(
        'CAVERJS-UNIT-WALLET-313: input: fee payer tx format(includes signatures and feePayerSignatures) object with signatures and feePayerSignatures',
        () => {
            it('should return valid rawTransaction', async () => {
                const signResult = await caver.klay.accounts.signTransaction(feeDelegatedTx, sender.transactionKey[0])
                const signResult2 = await caver.klay.accounts.signTransaction(feeDelegatedTx, [
                    sender.transactionKey[1],
                    sender.transactionKey[2],
                ])
                const feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(
                    signResult.rawTransaction,
                    feePayer.address,
                    feePayer.feePayerKey[0]
                )
                const feePayerSigned2 = await caver.klay.accounts.feePayerSignTransaction(signResult.rawTransaction, feePayer.address, [
                    feePayer.feePayerKey[1],
                    feePayer.feePayerKey[2],
                ])

                const feePayerTx = {
                    senderRawTransaction: feePayerSigned.rawTransaction,
                    feePayer: feePayer.address,
                    signatures: signResult2.signatures,
                    feePayerSignatures: feePayerSigned2.feePayerSignatures,
                }
                const result = await caver.klay.accounts.getRawTransactionWithSignatures(feePayerTx)

                const keys = ['rawTransaction', 'txHash', 'senderTxHash', 'signatures', 'feePayerSignatures']
                expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)
                expect(result.signatures.length).to.equals(3)
                expect(result.feePayerSignatures.length).to.equals(3)

                const decoded = caver.klay.decodeTransaction(result.rawTransaction)
                expect(decoded.signatures.length).to.equals(3)
                expect(decoded.feePayerSignatures.length).to.equals(3)
            }).timeout(200000)
        }
    )

    context('CAVERJS-UNIT-WALLET-314: input: fee delegated value transfer tx object without signatures and feePayerSignatures', () => {
        it('should throw error when there is no signatures information', async () => {
            const errorMessage = 'There are no signatures or feePayerSignatures defined in the transaction object.'

            await expect(caver.klay.accounts.getRawTransactionWithSignatures(feeDelegatedTx)).to.be.rejectedWith(errorMessage)
        }).timeout(200000)
    })

    context('CAVERJS-UNIT-WALLET-315: input: fee delegated value transfer tx object without feePayerSignatures only(no feePayer)', () => {
        it('should throw error when tx defines feePayerSignatures only without feePayer', async () => {
            const tx = { ...feeDelegatedTx }
            const feePayerSignResult = await caver.klay.accounts.feePayerSignTransaction(feeDelegatedTx, feePayer.address)
            tx.feePayerSignatures = feePayerSignResult.feePayerSignatures

            const errorMessage = '"feePayer" is missing: feePayer must be defined with feePayerSignatures.'

            await expect(caver.klay.accounts.getRawTransactionWithSignatures(tx)).to.be.rejectedWith(errorMessage)
        }).timeout(200000)
    })

    context('CAVERJS-UNIT-WALLET-316: input: value transfer tx object with feePayer', () => {
        it('should throw error when non-feeDelegated tx defines feePayer', async () => {
            const signResult = await caver.klay.accounts.signTransaction(vtTx)
            vtTx.signatures = signResult.signatures
            vtTx.feePayer = feePayer.address

            const errorMessage = `"feePayer" cannot be used with ${vtTx.type} transaction`

            await expect(caver.klay.accounts.getRawTransactionWithSignatures(vtTx)).to.be.rejectedWith(errorMessage)
        }).timeout(200000)
    })

    context('CAVERJS-UNIT-WALLET-317: input: value transfer tx object with feePayerSignatures', () => {
        it('should throw error when non-feeDelegated tx defines feePayerSignatures', async () => {
            const feePayerSignResult = await caver.klay.accounts.feePayerSignTransaction(feeDelegatedTx, feePayer.address)
            vtTx.feePayerSignatures = feePayerSignResult.feePayerSignatures

            const errorMessage = `"feePayerSignatures" cannot be used with ${vtTx.type} transaction`

            await expect(caver.klay.accounts.getRawTransactionWithSignatures(vtTx)).to.be.rejectedWith(errorMessage)
        }).timeout(200000)
    })
})

describe('caver.klay.accounts.combineSignatures', () => {
    let feeDelegatedTx
    let sender
    let feePayer

    beforeEach(() => {
        const senderRoleBasedKey = {
            transactionKey: [
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
            ],
        }
        const feePayerRoleBasedKey = {
            feePayerKey: [
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
            ],
        }

        sender = caver.klay.accounts.wallet.add(
            caver.klay.accounts.createWithAccountKey('0x6f9a8851feca74f6694a12d11c9684f0b5c1d3b6', senderRoleBasedKey)
        )
        feePayer = caver.klay.accounts.wallet.add(
            caver.klay.accounts.createWithAccountKey('0x4a804669b2637b18d46e62109ed8edc0dc8526c7', feePayerRoleBasedKey)
        )

        feeDelegatedTx = {
            type: 'FEE_DELEGATED_VALUE_TRANSFER',
            from: sender.address,
            to: '0xd2553e0508d481892aa1b481b3ac29aba5c7fb4d',
            value: '0x1',
            gas: '0xdbba0',
            chainId: '0x7e3',
            gasPrice: '0x5d21dba00',
            nonce: '0x9a',
        }
    })

    context('CAVERJS-UNIT-WALLET-318: input: RLP encoded raw transaction string(includes signatures of sender only)', () => {
        it('should combine signatures and return valid rawTransaction', async () => {
            const signResult = await caver.klay.accounts.signTransaction(feeDelegatedTx, sender.transactionKey[0])
            const signResult2 = await caver.klay.accounts.signTransaction(feeDelegatedTx, sender.transactionKey[1])
            const signResult3 = await caver.klay.accounts.signTransaction(feeDelegatedTx, sender.transactionKey[2])

            const result = await caver.klay.accounts.combineSignatures([
                signResult.rawTransaction,
                signResult2.rawTransaction,
                signResult3.rawTransaction,
            ])

            const keys = ['rawTransaction', 'txHash', 'senderTxHash', 'signatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)
            expect(result.signatures.length).to.equals(3)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.signatures.length).to.equals(3)
        }).timeout(200000)
    })

    context('CAVERJS-UNIT-WALLET-319: input: RLP encoded raw transaction string(includes signatures of fee payer only)', () => {
        it('should combine signatures and return valid rawTransaction', async () => {
            const feePayerSignResult = await caver.klay.accounts.feePayerSignTransaction(
                feeDelegatedTx,
                feePayer.address,
                feePayer.feePayerKey[0]
            )
            const feePayerSignResult2 = await caver.klay.accounts.feePayerSignTransaction(
                feeDelegatedTx,
                feePayer.address,
                feePayer.feePayerKey[1]
            )
            const feePayerSignResult3 = await caver.klay.accounts.feePayerSignTransaction(
                feeDelegatedTx,
                feePayer.address,
                feePayer.feePayerKey[2]
            )

            const result = await caver.klay.accounts.combineSignatures([
                feePayerSignResult.rawTransaction,
                feePayerSignResult2.rawTransaction,
                feePayerSignResult3.rawTransaction,
            ])

            const keys = ['rawTransaction', 'txHash', 'senderTxHash', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)
            expect(result.feePayerSignatures.length).to.equals(3)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.feePayerSignatures.length).to.equals(3)
        }).timeout(200000)
    })

    context('CAVERJS-UNIT-WALLET-320: input: RLP encoded raw transaction string(includes signatures of sender and fee payer)', () => {
        it('should combine signatures and return valid rawTransaction', async () => {
            const signResult = await caver.klay.accounts.signTransaction(feeDelegatedTx)
            const feePayerSignResult = await caver.klay.accounts.feePayerSignTransaction(feeDelegatedTx, feePayer.address)

            const result = await caver.klay.accounts.combineSignatures([signResult.rawTransaction, feePayerSignResult.rawTransaction])

            const keys = ['rawTransaction', 'txHash', 'senderTxHash', 'signatures', 'feePayerSignatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)
            expect(result.signatures.length).to.equals(3)
            expect(result.feePayerSignatures.length).to.equals(3)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.signatures.length).to.equals(3)
            expect(decoded.feePayerSignatures.length).to.equals(3)
        }).timeout(200000)
    })

    context(
        'CAVERJS-UNIT-WALLET-321: input: RLP encoded raw transaction string(includes duplicated signatures of sender and fee payer)',
        () => {
            it('should remove duplicated signatures return valid rawTransaction', async () => {
                const signResult = await caver.klay.accounts.signTransaction(feeDelegatedTx)
                const signResult2 = await caver.klay.accounts.signTransaction(feeDelegatedTx, sender.transactionKey[0])
                const signResult3 = await caver.klay.accounts.signTransaction(feeDelegatedTx, sender.transactionKey[1])
                const signResult4 = await caver.klay.accounts.signTransaction(feeDelegatedTx, sender.transactionKey[2])

                const feePayerSignResult = await caver.klay.accounts.feePayerSignTransaction(feeDelegatedTx, feePayer.address)
                const feePayerSignResult2 = await caver.klay.accounts.feePayerSignTransaction(
                    feeDelegatedTx,
                    feePayer.address,
                    feePayer.feePayerKey[0]
                )
                const feePayerSignResult3 = await caver.klay.accounts.feePayerSignTransaction(
                    feeDelegatedTx,
                    feePayer.address,
                    feePayer.feePayerKey[1]
                )
                const feePayerSignResult4 = await caver.klay.accounts.feePayerSignTransaction(
                    feeDelegatedTx,
                    feePayer.address,
                    feePayer.feePayerKey[2]
                )

                const rawArray = [
                    signResult.rawTransaction,
                    signResult2.rawTransaction,
                    signResult3.rawTransaction,
                    signResult4.rawTransaction,
                    feePayerSignResult.rawTransaction,
                    feePayerSignResult2.rawTransaction,
                    feePayerSignResult3.rawTransaction,
                    feePayerSignResult4.rawTransaction,
                ]
                const result = await caver.klay.accounts.combineSignatures(rawArray)

                const keys = ['rawTransaction', 'txHash', 'senderTxHash', 'signatures', 'feePayerSignatures']
                expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)
                expect(result.signatures.length).to.equals(3)
                expect(result.feePayerSignatures.length).to.equals(3)

                const decoded = caver.klay.decodeTransaction(result.rawTransaction)
                expect(decoded.signatures.length).to.equals(3)
                expect(decoded.feePayerSignatures.length).to.equals(3)
            }).timeout(200000)
        }
    )

    context('CAVERJS-UNIT-WALLET-386: input: RLP encoded raw transaction string(includes signatures of sender only)', () => {
        it('should remove duplicated signatures return valid rawTransaction', async () => {
            const signResult = await caver.klay.accounts.signTransaction(feeDelegatedTx)
            const signResult2 = await caver.klay.accounts.signTransaction(feeDelegatedTx, sender.transactionKey[0])
            const signResult3 = await caver.klay.accounts.signTransaction(feeDelegatedTx, sender.transactionKey[1])
            const signResult4 = await caver.klay.accounts.signTransaction(feeDelegatedTx, sender.transactionKey[2])

            const rawArray = [signResult.rawTransaction, signResult2.rawTransaction, signResult3.rawTransaction, signResult4.rawTransaction]
            const result = await caver.klay.accounts.combineSignatures(rawArray)

            const keys = ['rawTransaction', 'txHash', 'senderTxHash', 'signatures']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)
            expect(result.signatures.length).to.equals(3)

            const decoded = caver.klay.decodeTransaction(result.rawTransaction)
            expect(decoded.signatures.length).to.equals(3)
        }).timeout(200000)
    })

    context('CAVERJS-UNIT-WALLET-387: input: not array', () => {
        it('should throw error when parameter is not array', async () => {
            const signResult = await caver.klay.accounts.signTransaction(feeDelegatedTx)

            const expectedError = 'The parameter of the combineSignatures function must be an array of RLP encoded transaction strings.'
            await expect(
                caver.klay.accounts.combineSignatures(signResult.rawTransaction, (error, result) => {
                    expect(error).not.to.be.undefined
                    expect(result).to.be.undefined
                })
            ).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('CAVERJS-UNIT-WALLET-388: input: different RLP encoded transaction', () => {
        it('should throw error when contents of transaction is not same', async () => {
            const signResult = await caver.klay.accounts.signTransaction(feeDelegatedTx, sender.transactionKey[0])
            feeDelegatedTx.value = 2
            const signResult2 = await caver.klay.accounts.signTransaction(feeDelegatedTx, sender.transactionKey[2])

            const expectedError = 'Failed to combineSignatures: Signatures that sign to different transaction cannot be combined.'
            await expect(
                caver.klay.accounts.combineSignatures([signResult.rawTransaction, signResult2.rawTransaction], (error, result) => {
                    expect(error).not.to.be.undefined
                    expect(result).to.be.undefined
                })
            ).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })
})

describe('caver.klay.accounts.recoverTransaction', () => {
    let account
    let rawTx

    beforeEach(async () => {
        account = caver.klay.accounts.create()

        const txObj = {
            from: account.address,
            nonce: '0x0',
            to: setting.toAddress,
            gas: setting.gas,
            gasPrice: setting.gasPrice,
            value: '0x1',
        }
        const signedTx = await account.signTransaction(txObj)
        rawTx = signedTx.rawTransaction
    })

    context('CAVERJS-UNIT-WALLET-029 : rawTransaction', () => {
        it('should return valid address', () => {
            const result = caver.klay.accounts.recoverTransaction(rawTx)
            expect(result).to.equal(account.address)
        })
    })

    context('CAVERJS-UNIT-WALLET-030 : rawTransaction:invalid', () => {
        it('should not equal to account.address', () => {
            const invalid = rawTx.slice(0, -2)
            const result = caver.klay.accounts.recoverTransaction(invalid)
            expect(result).to.not.equal(account.address)
        })
    })

    context('CAVERJS-UNIT-WALLET-104 : rawTransaction: leading zeroes of the signature are trimmed', () => {
        it('should equal to account.address', async () => {
            const transaction = {
                from: '0x13b0d8316F0c3cE0C3C51Ebb586A14d7d90112fD',
                nonce: '0x0',
                to: '0x30d8d4217145ba3f6cde24ec28c64c9120f2bdfb',
                gas: 900000,
                gasPrice: 25000000000,
                value: '0x1',
                chainId: 10000,
            }

            const privateKey = '0x72d72a46401220f08ccb1b17b550feb816840f2f8ce86361e7ee54ac7a9ee6d8'
            account = caver.klay.accounts.privateKeyToAccount(privateKey)

            const signed = await caver.klay.accounts.signTransaction(transaction, account.privateKey)

            const rlpDecoded = caver.utils.rlpDecode(signed.rawTransaction)
            expect(rlpDecoded[7].length).not.to.equals(rlpDecoded[8].length)

            const result = caver.klay.accounts.recoverTransaction(signed.rawTransaction)
            expect(result).to.not.equal(account.address)
        })
    })

    context('CAVERJS-UNIT-WALLET-105 : rawTransaction: Non-LEGACY transactions.', () => {
        it('should throw error', async () => {
            const transaction = {
                type: 'VALUE_TRANSFER',
                from: '0x13b0d8316F0c3cE0C3C51Ebb586A14d7d90112fD',
                nonce: '0x0',
                to: '0x30d8d4217145ba3f6cde24ec28c64c9120f2bdfb',
                gas: 900000,
                gasPrice: 25000000000,
                value: '0x1',
                chainId: 10000,
            }
            const address = '0x13b0d8316F0c3cE0C3C51Ebb586A14d7d90112fD'
            const privateKey = '0x72d72a46401220f08ccb1b17b550feb816840f2f8ce86361e7ee54ac7a9ee6d8'
            caver.klay.accounts.privateKeyToAccount(privateKey, address)

            const signed = await caver.klay.accounts.signTransaction(transaction, account.privateKey)

            const errorMessage = 'recoverTransaction only supports transactions of type "LEGACY".'
            expect(() => caver.klay.accounts.recoverTransaction(signed.rawTransaction)).to.throws(errorMessage)
        })
    })
})

describe('caver.klay.accounts.hashMessage', () => {
    it('CAVERJS-UNIT-WALLET-031, CAVERJS-UNIT-WALLET-032 : result should be same with keccak256(MessagePrefix + originMessage.length + originMessage)', () => {
        const message = 'Hello World'
        let result = caver.klay.accounts.hashMessage(message)
        checkHashMessage(result, message)

        const decoded = caver.utils.utf8ToHex(message)
        result = caver.klay.accounts.hashMessage(decoded)
        checkHashMessage(result, message)
    })
})

describe('caver.klay.accounts.sign', () => {
    let account

    beforeEach(() => {
        account = caver.klay.accounts.create()
    })

    context('CAVERJS-UNIT-WALLET-033 : input: data, privateKey', () => {
        it('should recover valid address', () => {
            const data = 'Some data'
            let result = caver.klay.accounts.sign(data, account.privateKey)

            const keys = ['message', 'messageHash', 'v', 'r', 's', 'signature']
            expect(Object.getOwnPropertyNames(result)).to.deep.equal(keys)

            if (data !== result.message) {
                expect(data).to.equal(caver.utils.utf8ToHex(result.message))
            }

            const decoded = caver.utils.utf8ToHex(data)
            result = caver.klay.accounts.sign(decoded, account.privateKey)
            checkHashMessage(result.messageHash, data)

            expect(caver.klay.accounts.recover(result)).to.equal(account.address)
        })
    })

    context('CAVERJS-UNIT-WALLET-034 : input: data, privateKey:invalid', () => {
        it('should throw an error', () => {
            const data = 'Some data'
            const invalid = caver.utils.randomHex(31) // 31bytes

            const errorMessage = 'Invalid private key'
            expect(() => caver.klay.accounts.sign(data, invalid)).to.throw(errorMessage)
        })
    })
})

// caver.klay.accounts.recover
describe('caver.klay.accounts.recover', () => {
    let account

    beforeEach(() => {
        account = caver.klay.accounts.create()
    })

    context('CAVERJS-UNIT-WALLET-035 : input: signatureObject', () => {
        it('result should be same with account.address', () => {
            const message = 'Some data'
            const sigObj = account.sign(message)

            const result = caver.klay.accounts.recover(sigObj)
            expect(result).to.equal(account.address)
        })
    })

    context('CAVERJS-UNIT-WALLET-036 : input: message, signature', () => {
        it('result should be same with account.address', () => {
            const message = 'Some data'
            const sigObj = account.sign(message)

            const result = caver.klay.accounts.recover(sigObj.message, sigObj.signature)
            expect(result).to.equal(account.address)
        })
    })

    context('CAVERJS-UNIT-WALLET-037 : input: message, signature, prefixed', () => {
        it('result should be same with account.address', () => {
            const message = 'Some data'
            const sigObj = account.sign(message)
            const prefixed = true

            const messageHash = caver.klay.accounts.hashMessage(message)

            const result = caver.klay.accounts.recover(messageHash, sigObj.signature, prefixed)
            expect(result).to.equal(account.address)
        })
    })

    context('CAVERJS-UNIT-WALLET-038 : input: message, v, r, s', () => {
        it('result should be same with account.address', () => {
            const message = 'Some data'
            const sigObj = account.sign(message)

            const result = caver.klay.accounts.recover(sigObj.message, sigObj.v, sigObj.r, sigObj.s)
            expect(result).to.equal(account.address)
        })
    })

    context('CAVERJS-UNIT-WALLET-039 : input: message, v, r, s, prefixed', () => {
        it('result should be same with account.address', () => {
            const message = 'Some data'
            const sigObj = account.sign(message)
            const prefixed = true

            const messageHash = caver.klay.accounts.hashMessage(message)

            const result = caver.klay.accounts.recover(messageHash, sigObj.v, sigObj.r, sigObj.s, prefixed)
            expect(result).to.equal(account.address)
        })
    })
})

// caver.klay.accounts.encrypt
describe('caver.klay.accounts.encrypt', () => {
    let account

    beforeEach(() => {
        account = caver.klay.accounts.create()
    })

    context('CAVERJS-UNIT-WALLET-040 : input: privateKey, password', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const result = caver.klay.accounts.encrypt(account.privateKey, password)

            isKeystore(result, account)

            const decryptedAccount = caver.klay.accounts.decrypt(result, password)
            isAccount(decryptedAccount, { keys: account.keys, address: account.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-041 : input: privateKey:invalid, password', () => {
        it('should throw an error', () => {
            const invalid = caver.utils.randomHex(31) // 31bytes
            const password = 'klaytn!@'

            const errorMessage = 'Invalid private key'
            expect(() => caver.klay.accounts.encrypt(invalid, password)).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-096 : input: privateKey:KlaytnWalletKey, password', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const result = caver.klay.accounts.encrypt(account.getKlaytnWalletKey(), password)

            isKeystore(result, account)

            const decryptedAccount = caver.klay.accounts.decrypt(result, password)
            isAccount(decryptedAccount, { keys: account.keys, address: account.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-097 : input: privateKey:KlaytnWalletKey, password, {address:valid}', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const result = caver.klay.accounts.encrypt(account.getKlaytnWalletKey(), password, { address: account.address })

            isKeystore(result, account)

            const decryptedAccount = caver.klay.accounts.decrypt(result, password)
            isAccount(decryptedAccount, { keys: account.keys, address: account.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-098 : input: privateKey:KlaytnWalletKey, password, {address:invalid}', () => {
        it('should throw an error', () => {
            const password = 'klaytn!@'

            const errorMessage = 'The address extracted from the private key does not match the address received as the input value.'
            expect(() =>
                caver.klay.accounts.encrypt(account.getKlaytnWalletKey(), password, { address: caver.klay.accounts.create().address })
            ).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-099 : input: privateKey:KlaytnWalletKey(decoupled), password', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, caver.klay.accounts.create().privateKey)

            const result = caver.klay.accounts.encrypt(testAccount.getKlaytnWalletKey(), password)

            isKeystore(result, testAccount)

            const decryptedAccount = caver.klay.accounts.decrypt(result, password)
            isAccount(decryptedAccount, { keys: testAccount.keys, address: testAccount.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-100 : input: privateKey:KlaytnWalletKey(decoupled), password, {address:valid}', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, caver.klay.accounts.create().privateKey)

            const result = caver.klay.accounts.encrypt(testAccount.getKlaytnWalletKey(), password, { address: testAccount.address })

            isKeystore(result, testAccount)

            const decryptedAccount = caver.klay.accounts.decrypt(result, password)
            isAccount(decryptedAccount, { keys: testAccount.keys, address: testAccount.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-101 : input: privateKey:KlaytnWalletKey(decoupled), password, {address:invalid}', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, caver.klay.accounts.create().privateKey)

            const errorMessage = 'The address extracted from the private key does not match the address received as the input value.'
            expect(() =>
                caver.klay.accounts.encrypt(testAccount.getKlaytnWalletKey(), password, { address: caver.klay.accounts.create().address })
            ).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-351: input: array of private key string, password, {address:valid}', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const key = [
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
            ]
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, key)

            const result = caver.klay.accounts.encrypt(testAccount.keys, password, { address: testAccount.address })

            isKeystore(result, testAccount)
            expect(result.keyring.length).to.equals(key.length)

            const decrypted = caver.klay.accounts.decrypt(result, password)
            isAccount(decrypted, { keys: testAccount.keys, address: testAccount.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-352: input: array of private key string, password', () => {
        it('should throw error when address is not defined', () => {
            const password = 'klaytn!@'

            const key = [
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
            ]
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, key)

            const errorMessage = 'The address must be defined inside the options object.'
            expect(() => caver.klay.accounts.encrypt(testAccount.keys, password)).to.throw(errorMessage)
        }).timeout(50000)
    })

    context(
        'CAVERJS-UNIT-WALLET-353: input: key object(transactionKey, updateKey and feePayerKey are defined), password, {address:valid}',
        () => {
            it('should encrypt password with privateKey', () => {
                const password = 'klaytn!@'

                const key = {
                    transactionKey: caver.klay.accounts.create().privateKey,
                    updateKey: caver.klay.accounts.create().privateKey,
                    feePayerKey: caver.klay.accounts.create().privateKey,
                }
                const testAccount = caver.klay.accounts.createWithAccountKey(account.address, key)

                const result = caver.klay.accounts.encrypt(testAccount.keys, password, { address: testAccount.address })

                isKeystore(result, testAccount)
                expect(result.keyring.length).to.equals(3)
                expect(result.keyring[0].length).to.equals(1)
                expect(result.keyring[1].length).to.equals(1)
                expect(result.keyring[2].length).to.equals(1)

                const decrypted = caver.klay.accounts.decrypt(result, password)
                isAccount(decrypted, { keys: testAccount.keys, address: testAccount.address })
            }).timeout(50000)
        }
    )

    context(
        'CAVERJS-UNIT-WALLET-354: input: key object(transactionKey, updateKey and feePayerKey are defined with array of private key), password, {address:valid}',
        () => {
            it('should encrypt password with privateKey', () => {
                const password = 'klaytn!@'

                const key = {
                    transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                    updateKey: [
                        caver.klay.accounts.create().privateKey,
                        caver.klay.accounts.create().privateKey,
                        caver.klay.accounts.create().privateKey,
                    ],
                    feePayerKey: [
                        caver.klay.accounts.create().privateKey,
                        caver.klay.accounts.create().privateKey,
                        caver.klay.accounts.create().privateKey,
                        caver.klay.accounts.create().privateKey,
                    ],
                }
                const testAccount = caver.klay.accounts.createWithAccountKey(account.address, key)

                const result = caver.klay.accounts.encrypt(testAccount.keys, password, { address: testAccount.address })

                isKeystore(result, testAccount)
                expect(result.keyring.length).to.equals(3)
                expect(result.keyring[0].length).to.equals(key.transactionKey.length)
                expect(result.keyring[1].length).to.equals(key.updateKey.length)
                expect(result.keyring[2].length).to.equals(key.feePayerKey.length)

                const decrypted = caver.klay.accounts.decrypt(result, password)
                isAccount(decrypted, { keys: testAccount.keys, address: testAccount.address })
            }).timeout(50000)
        }
    )

    context('CAVERJS-UNIT-WALLET-355: input: key object(transactionKey is defined), password, {address:valid}', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
            }
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, key)

            const result = caver.klay.accounts.encrypt(testAccount.keys, password, { address: testAccount.address })

            isKeystore(result, testAccount)
            expect(result.keyring.length).to.equals(1)
            expect(result.keyring[0].length).to.equals(1)

            const decrypted = caver.klay.accounts.decrypt(result, password)
            isAccount(decrypted, { keys: testAccount.keys, address: testAccount.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-356: input: key object(updateKey is defined), password, {address:valid}', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const key = {
                updateKey: caver.klay.accounts.create().privateKey,
            }
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, key)

            const result = caver.klay.accounts.encrypt(testAccount.keys, password, { address: testAccount.address })

            isKeystore(result, testAccount)
            expect(result.keyring.length).to.equals(2)
            expect(result.keyring[0].length).to.equals(0)
            expect(result.keyring[1].length).to.equals(1)

            const decrypted = caver.klay.accounts.decrypt(result, password)
            isAccount(decrypted, { keys: testAccount.keys, address: testAccount.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-357: input: key object(feePayerKey is defined), password, {address:valid}', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const key = {
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, key)

            const result = caver.klay.accounts.encrypt(testAccount.keys, password, { address: testAccount.address })

            isKeystore(result, testAccount)
            expect(result.keyring.length).to.equals(3)
            expect(result.keyring[0].length).to.equals(0)
            expect(result.keyring[1].length).to.equals(0)
            expect(result.keyring[2].length).to.equals(1)

            const decrypted = caver.klay.accounts.decrypt(result, password)
            isAccount(decrypted, { keys: testAccount.keys, address: testAccount.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-358: input: key object, password', () => {
        it('should throw error when address is not defined', () => {
            const password = 'klaytn!@'

            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: caver.klay.accounts.create().privateKey,
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, key)

            const errorMessage = 'The address must be defined inside the options object.'
            expect(() => caver.klay.accounts.encrypt(testAccount.keys, password)).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-359: input: AccountKeyPublic, password, {address:valid}', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const key = caver.klay.accounts.create().privateKey
            const accountKey = caver.klay.accounts.createAccountKey(key)
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, accountKey)

            const result = caver.klay.accounts.encrypt(accountKey, password, { address: testAccount.address })

            isKeystore(result, testAccount)
            expect(result.keyring.length).to.equals(1)

            const decrypted = caver.klay.accounts.decrypt(result, password)
            isAccount(decrypted, { keys: testAccount.keys, address: testAccount.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-360: input: AccountKeyPublic, password', () => {
        it('should throw error', () => {
            const password = 'klaytn!@'

            const key = caver.klay.accounts.create().privateKey
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const errorMessage = 'The address must be defined inside the options object.'
            expect(() => caver.klay.accounts.encrypt(accountKey, password)).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-361: input: AccountKeyMultiSig, password, {address:valid}', () => {
        it('should encrypt key with password', () => {
            const password = 'klaytn!@'

            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const accountKey = caver.klay.accounts.createAccountKey(key)
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, accountKey)

            const result = caver.klay.accounts.encrypt(accountKey, password, { address: testAccount.address })

            isKeystore(result, testAccount)
            expect(result.keyring.length).to.equals(key.length)

            const decrypted = caver.klay.accounts.decrypt(result, password)
            isAccount(decrypted, { keys: testAccount.keys, address: testAccount.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-362: input: AccountKeyMultiSig, password', () => {
        it('should throw error', () => {
            const password = 'klaytn!@'

            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const errorMessage = 'The address must be defined inside the options object.'
            expect(() => caver.klay.accounts.encrypt(accountKey, password)).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-363: input: AccountKeyRoleBased, password, {address:valid}', () => {
        it('should encrypt key with password', () => {
            const password = 'klaytn!@'

            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: [
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                ],
            }
            const accountKey = caver.klay.accounts.createAccountKey(key)
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, accountKey)

            const result = caver.klay.accounts.encrypt(accountKey, password, { address: testAccount.address })

            isKeystore(result, testAccount)
            expect(result.keyring.length).to.equals(3)
            expect(result.keyring[0].length).to.equals(1)
            expect(result.keyring[1].length).to.equals(key.updateKey.length)
            expect(result.keyring[2].length).to.equals(key.feePayerKey.length)

            const decrypted = caver.klay.accounts.decrypt(result, password)
            isAccount(decrypted, { keys: testAccount.keys, address: testAccount.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-364: input: AccountKeyMultiSig, password', () => {
        it('should throw error', () => {
            const password = 'klaytn!@'

            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: [
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                ],
            }
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const errorMessage = 'The address must be defined inside the options object.'
            expect(() => caver.klay.accounts.encrypt(accountKey, password)).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-365: input: Account with AccountKeyPublic, password, {address:valid}', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const key = caver.klay.accounts.create().privateKey
            const accountKey = caver.klay.accounts.createAccountKey(key)
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, accountKey)

            const result = caver.klay.accounts.encrypt(testAccount, password, { address: testAccount.address })

            isKeystore(result, testAccount)
            expect(result.keyring.length).to.equals(1)

            const decrypted = caver.klay.accounts.decrypt(result, password)
            isAccount(decrypted, { keys: testAccount.keys, address: testAccount.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-366: input: Account with AccountKeyPublic, password, {address:different address}', () => {
        it('should throw error when addresses are not matched', () => {
            const password = 'klaytn!@'

            const key = caver.klay.accounts.create().privateKey
            const accountKey = caver.klay.accounts.createAccountKey(key)
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, accountKey)

            const errorMessage = 'Address in account is not matched with address in options object'
            expect(() => caver.klay.accounts.encrypt(testAccount, password, { address: caver.klay.accounts.create().address })).to.throw(
                errorMessage
            )
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-367: input: Account with AccountKeyMultiSig, password, {address:valid}', () => {
        it('should encrypt key with password', () => {
            const password = 'klaytn!@'

            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const accountKey = caver.klay.accounts.createAccountKey(key)
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, accountKey)

            const result = caver.klay.accounts.encrypt(accountKey, password, { address: testAccount.address })

            isKeystore(result, testAccount)
            expect(result.keyring.length).to.equals(key.length)

            const decrypted = caver.klay.accounts.decrypt(result, password)
            isAccount(decrypted, { keys: testAccount.keys, address: testAccount.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-368: input: Account with AccountKeyMultiSig, password, {address:different address}', () => {
        it('should throw error when addresses are not matched', () => {
            const password = 'klaytn!@'

            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const accountKey = caver.klay.accounts.createAccountKey(key)
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, accountKey)

            const errorMessage = 'Address in account is not matched with address in options object'
            expect(() => caver.klay.accounts.encrypt(testAccount, password, { address: caver.klay.accounts.create().address })).to.throw(
                errorMessage
            )
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-369: input: Account with AccountKeyRoleBased, password, {address:valid}', () => {
        it('should encrypt key with password', () => {
            const password = 'klaytn!@'

            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: [
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                ],
            }
            const accountKey = caver.klay.accounts.createAccountKey(key)
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, accountKey)

            const result = caver.klay.accounts.encrypt(accountKey, password, { address: testAccount.address })

            isKeystore(result, testAccount)
            expect(result.keyring.length).to.equals(3)
            expect(result.keyring[0].length).to.equals(1)
            expect(result.keyring[1].length).to.equals(key.updateKey.length)
            expect(result.keyring[2].length).to.equals(key.feePayerKey.length)

            const decrypted = caver.klay.accounts.decrypt(result, password)
            isAccount(decrypted, { keys: testAccount.keys, address: testAccount.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-370: input: Account with AccountKeyRoleBased, password, {address:different address}', () => {
        it('should throw error when addresses are not matched', () => {
            const password = 'klaytn!@'

            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: [
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                ],
            }
            const accountKey = caver.klay.accounts.createAccountKey(key)
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, accountKey)

            const errorMessage = 'Address in account is not matched with address in options object'
            expect(() => caver.klay.accounts.encrypt(testAccount, password, { address: caver.klay.accounts.create().address })).to.throw(
                errorMessage
            )
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-385: input: Account with AccountKeyMultiSig, password, option', () => {
        it('should throw error when addresses are not matched', () => {
            const password = 'password'

            const testAccount = caver.klay.accounts.createWithAccountKey('0xf725a2950dc959638fa09f9d9b5426ad3dd8cd90', {
                transactionKey: '0x7dc66dca0e5d56940c99ad01903a8ba5fd9e1f7a51a8ab07cf81ccd1d3c4be16',
                updateKey: [
                    '0x5fc3216454ab841ffa2bed0933a27bcdf2965238372bff3ec4fe56cbf5389a87',
                    '0x79fe0616e7624314611b8e9c716b8d9c0c8c8c20f654021ff5fa7c46dc50709b',
                ],
                feePayerKey: '0xfac188dc156ef58d529ea14ac95379f502a390d5720a9575b87545e36b3f758e',
            })

            const encryptOption = {
                salt: 'e7c4605ad8200e0d93cd67f9d82fb9971e1a2763b22362017c2927231c2a733a',
                iv: Buffer.from('38aa896fc128075425e512f01e4b206c', 'hex'),
                kdf: 'scrypt',
                dklen: 32,
                n: 4096,
                r: 8,
                p: 1,
                cipher: 'aes-128-ctr',
                uuid: Buffer.from('e7c4605ad8200e0d93cd67f9d82fb997', 'hex'),
            }

            const expectedKeystore = {
                version: 4,
                id: 'e7c4605a-d820-4e0d-93cd-67f9d82fb997',
                address: '0xf725a2950dc959638fa09f9d9b5426ad3dd8cd90',
                keyring: [
                    [
                        {
                            ciphertext: 'b3126f30cb419a63f367ea2313c3cf1a27ef9f08fc9a5da50aec2b93f5afbef4',
                            cipherparams: { iv: '38aa896fc128075425e512f01e4b206c' },
                            cipher: 'aes-128-ctr',
                            kdf: 'scrypt',
                            kdfparams: {
                                dklen: 32,
                                salt: 'e7c4605ad8200e0d93cd67f9d82fb9971e1a2763b22362017c2927231c2a733a',
                                n: 4096,
                                r: 8,
                                p: 1,
                            },
                            mac: 'df371741da37e778a820905f5a43f60aabd904ad81012e4c58c9eb7160cde38b',
                        },
                    ],
                    [
                        {
                            ciphertext: '9117239e91b748e805d5aa2bb05b3f7228e7d24a9a19099c0193b189d3539a65',
                            cipherparams: { iv: '38aa896fc128075425e512f01e4b206c' },
                            cipher: 'aes-128-ctr',
                            kdf: 'scrypt',
                            kdfparams: {
                                dklen: 32,
                                salt: 'e7c4605ad8200e0d93cd67f9d82fb9971e1a2763b22362017c2927231c2a733a',
                                n: 4096,
                                r: 8,
                                p: 1,
                            },
                            mac: 'ded3da00062f4e04b8248c8c6c37299c205b8e48d26c5187586dfa49959a9f9a',
                        },
                        {
                            ciphertext: 'b72a04ec227e8fe39ee5c9bef292c923d6fd0c525b66f4bd30979b04fa3b7079',
                            cipherparams: { iv: '38aa896fc128075425e512f01e4b206c' },
                            cipher: 'aes-128-ctr',
                            kdf: 'scrypt',
                            kdfparams: {
                                dklen: 32,
                                salt: 'e7c4605ad8200e0d93cd67f9d82fb9971e1a2763b22362017c2927231c2a733a',
                                n: 4096,
                                r: 8,
                                p: 1,
                            },
                            mac: '28090ffbce196b3b2640eec40ed2964071ef1a7f5d72f4db279589115a85a94d',
                        },
                    ],
                    [
                        {
                            ciphertext: '34158a26d072397aad60e6684aaa3d4ad8d210a7df3863d77d18a2a14d54756c',
                            cipherparams: { iv: '38aa896fc128075425e512f01e4b206c' },
                            cipher: 'aes-128-ctr',
                            kdf: 'scrypt',
                            kdfparams: {
                                dklen: 32,
                                salt: 'e7c4605ad8200e0d93cd67f9d82fb9971e1a2763b22362017c2927231c2a733a',
                                n: 4096,
                                r: 8,
                                p: 1,
                            },
                            mac: '210d28df835312ff82042b77402a6b105cdb6576a379ebae22076b5c5bfdf66f',
                        },
                    ],
                ],
            }

            const result = caver.klay.accounts.encrypt(testAccount, password, encryptOption)

            function compareEncrypted(ret, exp) {
                expect(ret.ciphertext).to.equals(exp.ciphertext)
                expect(ret.cipherparams.iv).to.equals(exp.cipherparams.iv)
                expect(ret.cipher).to.equals(exp.cipher)
                expect(ret.kdf).to.equals(exp.kdf)
                expect(ret.kdfparams.dklen).to.equals(exp.kdfparams.dklen)
                expect(ret.kdfparams.salt).to.equals(exp.kdfparams.salt)
                expect(ret.kdfparams.n).to.equals(exp.kdfparams.n)
                expect(ret.kdfparams.r).to.equals(exp.kdfparams.r)
                expect(ret.kdfparams.p).to.equals(exp.kdfparams.p)
                expect(ret.mac).to.equals(exp.mac)
            }

            expect(result.version).to.equals(expectedKeystore.version)
            expect(result.id).to.equals(expectedKeystore.id)
            expect(result.address).to.equals(expectedKeystore.address)
            compareEncrypted(result.keyring[0][0], expectedKeystore.keyring[0][0])
            compareEncrypted(result.keyring[1][0], expectedKeystore.keyring[1][0])
            compareEncrypted(result.keyring[1][1], expectedKeystore.keyring[1][1])
            compareEncrypted(result.keyring[2][0], expectedKeystore.keyring[2][0])

            isKeystore(result, testAccount)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-389: input: Account with AccountKeyMultiSig, password, option(pbkdf2)', () => {
        it('should throw error when addresses are not matched', () => {
            const password = 'password'

            const testAccount = caver.klay.accounts.createWithAccountKey('0xf725a2950dc959638fa09f9d9b5426ad3dd8cd90', {
                transactionKey: '0x7dc66dca0e5d56940c99ad01903a8ba5fd9e1f7a51a8ab07cf81ccd1d3c4be16',
                updateKey: [
                    '0x5fc3216454ab841ffa2bed0933a27bcdf2965238372bff3ec4fe56cbf5389a87',
                    '0x79fe0616e7624314611b8e9c716b8d9c0c8c8c20f654021ff5fa7c46dc50709b',
                ],
                feePayerKey: '0xfac188dc156ef58d529ea14ac95379f502a390d5720a9575b87545e36b3f758e',
            })

            const encryptOption = {
                salt: 'e7c4605ad8200e0d93cd67f9d82fb9971e1a2763b22362017c2927231c2a733a',
                iv: Buffer.from('38aa896fc128075425e512f01e4b206c', 'hex'),
                kdf: 'pbkdf2',
                dklen: 32,
                c: 262144,
                cipher: 'aes-128-ctr',
                uuid: Buffer.from('e7c4605ad8200e0d93cd67f9d82fb997', 'hex'),
            }

            const result = caver.klay.accounts.encrypt(testAccount.keys, password, { address: testAccount.address, ...encryptOption })

            isKeystore(result, testAccount)

            expect(result.keyring.length).to.equals(3)
            expect(result.keyring[0].length).to.equals(1)
            expect(result.keyring[1].length).to.equals(2)
            expect(result.keyring[2].length).to.equals(1)

            const decrypted = caver.klay.accounts.decrypt(result, password)
            isAccount(decrypted, { keys: testAccount.keys, address: testAccount.address })
        }).timeout(50000)
    })
})

describe('caver.klay.accounts.encryptV3', () => {
    let account

    beforeEach(() => {
        account = caver.klay.accounts.create()
    })

    context('CAVERJS-UNIT-WALLET-399: input: privateKey, password', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const result = caver.klay.accounts.encryptV3(account.privateKey, password)

            isKeystore(result, account, 3)

            const decryptedAccount = caver.klay.accounts.decrypt(result, password)
            isAccount(decryptedAccount, { keys: account.keys, address: account.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-400: input: privateKey:invalid, password', () => {
        it('should throw an error', () => {
            const invalid = caver.utils.randomHex(31) // 31bytes
            const password = 'klaytn!@'

            const errorMessage = 'Invalid private key'
            expect(() => caver.klay.accounts.encryptV3(invalid, password)).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-401: input: privateKey:KlaytnWalletKey, password', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const result = caver.klay.accounts.encryptV3(account.getKlaytnWalletKey(), password)

            isKeystore(result, account, 3)

            const decryptedAccount = caver.klay.accounts.decrypt(result, password)
            isAccount(decryptedAccount, { keys: account.keys, address: account.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-402: input: privateKey:KlaytnWalletKey, password, {address:valid}', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const result = caver.klay.accounts.encryptV3(account.getKlaytnWalletKey(), password, { address: account.address })

            isKeystore(result, account, 3)

            const decryptedAccount = caver.klay.accounts.decrypt(result, password)
            isAccount(decryptedAccount, { keys: account.keys, address: account.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-403: input: privateKey:KlaytnWalletKey, password, {address:invalid}', () => {
        it('should throw an error', () => {
            const password = 'klaytn!@'

            const errorMessage = 'The address extracted from the private key does not match the address received as the input value.'
            expect(() =>
                caver.klay.accounts.encryptV3(account.getKlaytnWalletKey(), password, { address: caver.klay.accounts.create().address })
            ).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-404: input: privateKey:KlaytnWalletKey(decoupled), password', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, caver.klay.accounts.create().privateKey)

            const result = caver.klay.accounts.encryptV3(testAccount.getKlaytnWalletKey(), password)

            isKeystore(result, testAccount, 3)

            const decryptedAccount = caver.klay.accounts.decrypt(result, password)
            isAccount(decryptedAccount, { keys: testAccount.keys, address: testAccount.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-405: input: privateKey:KlaytnWalletKey(decoupled), password, {address:valid}', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, caver.klay.accounts.create().privateKey)

            const result = caver.klay.accounts.encryptV3(testAccount.getKlaytnWalletKey(), password, { address: testAccount.address })

            isKeystore(result, testAccount, 3)

            const decryptedAccount = caver.klay.accounts.decrypt(result, password)
            isAccount(decryptedAccount, { keys: testAccount.keys, address: testAccount.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-406: input: privateKey:KlaytnWalletKey(decoupled), password, {address:invalid}', () => {
        it('should encrypt password with privateKey', () => {
            const password = 'klaytn!@'

            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, caver.klay.accounts.create().privateKey)

            const errorMessage = 'The address extracted from the private key does not match the address received as the input value.'
            expect(() =>
                caver.klay.accounts.encryptV3(testAccount.getKlaytnWalletKey(), password, { address: caver.klay.accounts.create().address })
            ).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-407: input: array of private key strings, password', () => {
        it('should throw an error', () => {
            const password = 'klaytn!@'

            const key = [
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
            ]
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, key)

            const errorMessage =
                'Invalid parameter: encryptV3 only supports a single private key (also supports KlantnWalletKey format), or an instance of Account or AccountKeyPublic as a parameter. If you want to encrypt multiple keys, use caver.klay.accounts.encrypt which encrypts to keystore v4.'
            expect(() => caver.klay.accounts.encryptV3(testAccount.keys, password)).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-408: input: array of private key strings, password, {address:valid}', () => {
        it('should throw an error', () => {
            const password = 'klaytn!@'

            const key = [
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
            ]
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, key)

            const errorMessage =
                'Invalid parameter: encryptV3 only supports a single private key (also supports KlantnWalletKey format), or an instance of Account or AccountKeyPublic as a parameter. If you want to encrypt multiple keys, use caver.klay.accounts.encrypt which encrypts to keystore v4.'
            expect(() => caver.klay.accounts.encryptV3(testAccount.keys, password, { address: testAccount.address })).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-409: input: key object, password', () => {
        it('should throw an error', () => {
            const password = 'klaytn!@'

            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: caver.klay.accounts.create().privateKey,
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, key)

            const errorMessage =
                'Invalid parameter: encryptV3 only supports a single private key (also supports KlantnWalletKey format), or an instance of Account or AccountKeyPublic as a parameter. If you want to encrypt multiple keys, use caver.klay.accounts.encrypt which encrypts to keystore v4.'
            expect(() => caver.klay.accounts.encryptV3(testAccount.keys, password)).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-410: input: key object, password, {address}', () => {
        it('should throw an error', () => {
            const password = 'klaytn!@'

            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: caver.klay.accounts.create().privateKey,
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            const testAccount = caver.klay.accounts.createWithAccountKey(account.address, key)

            const errorMessage =
                'Invalid parameter: encryptV3 only supports a single private key (also supports KlantnWalletKey format), or an instance of Account or AccountKeyPublic as a parameter. If you want to encrypt multiple keys, use caver.klay.accounts.encrypt which encrypts to keystore v4.'
            expect(() => caver.klay.accounts.encryptV3(testAccount.keys, password, { address: testAccount.address })).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-411: input: AccountKeyPublic, password', () => {
        it('should throw error', () => {
            const password = 'klaytn!@'

            const key = caver.klay.accounts.create().privateKey
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const errorMessage = 'The address must be defined inside the options object.'
            expect(() => caver.klay.accounts.encryptV3(accountKey, password)).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-412: input: AccountKeyMultiSig, password, {address}', () => {
        it('should throw error', () => {
            const password = 'klaytn!@'

            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const errorMessage =
                'Invalid parameter: encryptV3 only supports a single private key (also supports KlantnWalletKey format), or an instance of Account or AccountKeyPublic as a parameter. If you want to encrypt multiple keys, use caver.klay.accounts.encrypt which encrypts to keystore v4.'
            expect(() => caver.klay.accounts.encryptV3(accountKey, password, { address: account.address })).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-413: input: AccountKeyMultiSig, password', () => {
        it('should throw error', () => {
            const password = 'klaytn!@'

            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const errorMessage =
                'Invalid parameter: encryptV3 only supports a single private key (also supports KlantnWalletKey format), or an instance of Account or AccountKeyPublic as a parameter. If you want to encrypt multiple keys, use caver.klay.accounts.encrypt which encrypts to keystore v4.'
            expect(() => caver.klay.accounts.encryptV3(accountKey, password)).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-414: input: AccountKeyRoleBased, password, {address}', () => {
        it('should throw error', () => {
            const password = 'klaytn!@'

            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: caver.klay.accounts.create().privateKey,
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const errorMessage =
                'Invalid parameter: encryptV3 only supports a single private key (also supports KlantnWalletKey format), or an instance of Account or AccountKeyPublic as a parameter. If you want to encrypt multiple keys, use caver.klay.accounts.encrypt which encrypts to keystore v4.'
            expect(() => caver.klay.accounts.encryptV3(accountKey, password, { address: account.address })).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-415: input: AccountKeyRoleBased, password', () => {
        it('should throw error', () => {
            const password = 'klaytn!@'

            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: caver.klay.accounts.create().privateKey,
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const errorMessage =
                'Invalid parameter: encryptV3 only supports a single private key (also supports KlantnWalletKey format), or an instance of Account or AccountKeyPublic as a parameter. If you want to encrypt multiple keys, use caver.klay.accounts.encrypt which encrypts to keystore v4.'
            expect(() => caver.klay.accounts.encryptV3(accountKey, password)).to.throw(errorMessage)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-416: input: invalid parameter, password', () => {
        const password = 'klaytn!@'

        const invalidParameters = [1234, null, undefined, new BN('234'), -1]

        const errorMessage =
            'Invalid parameter: encryptV3 only supports a single private key (also supports KlantnWalletKey format), or an instance of Account or AccountKeyPublic as a parameter. If you want to encrypt multiple keys, use caver.klay.accounts.encrypt which encrypts to keystore v4.'

        it('should throw error', () => {
            for (const param of invalidParameters) {
                expect(() => caver.klay.accounts.encryptV3(param, password)).to.throw(errorMessage)
            }
        })
    })
})

describe('caver.klay.accounts.decrypt', () => {
    let account

    beforeEach(() => {
        account = caver.klay.accounts.create()
    })

    context('CAVERJS-UNIT-WALLET-042 : input: keystoreJsonV4, password', () => {
        it('After decrypting, should return valid account', () => {
            const password = 'klaytn!@'
            const keystoreJsonV4 = caver.klay.accounts.encrypt(account.privateKey, password)

            const result = caver.klay.accounts.decrypt(keystoreJsonV4, password)
            isKeystore(keystoreJsonV4, result)

            isAccount(result, { keys: account.keys, address: account.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-103 : input: keystoreJsonV4(without 0x address format), password', () => {
        it('After decrypting, should return valid account', () => {
            const password = 'klaytn!@'
            const keystoreJsonV4 = caver.klay.accounts.encrypt(account.privateKey, password)
            keystoreJsonV4.address = keystoreJsonV4.address.replace('0x', '')

            const result = caver.klay.accounts.decrypt(keystoreJsonV4, password)

            expect(result.address.slice(0, 2)).to.equals('0x')
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-371: input: keystoreJsonV4 that encrypts Account with AccountKeyMultiSig, password', () => {
        it('After decrypting, should return valid account', () => {
            const password = 'klaytn!@'
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const keystoreJsonV4 = caver.klay.accounts.encrypt(key, password, { address: account.address })

            const result = caver.klay.accounts.decrypt(keystoreJsonV4, password)

            isAccount(result, { keys: key, address: account.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-372: input: keystoreJsonV4 that encrypts Account with AccountKeyRoleBased, password', () => {
        it('After decrypting, should return valid account', () => {
            const password = 'klaytn!@'
            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: [
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                ],
            }
            const keystoreJsonV4 = caver.klay.accounts.encrypt(key, password, { address: account.address })

            const result = caver.klay.accounts.decrypt(keystoreJsonV4, password)

            isAccount(result, { keys: key, address: account.address })
        }).timeout(50000)
    })

    context(
        'CAVERJS-UNIT-WALLET-373: input: keystoreJsonV4 that encrypts Account with AccountKeyRoleBased(transactionKey only), password',
        () => {
            it('After decrypting, should return valid account', () => {
                const password = 'klaytn!@'
                const key = {
                    transactionKey: caver.klay.accounts.create().privateKey,
                }
                const keystoreJsonV4 = caver.klay.accounts.encrypt(key, password, { address: account.address })

                const result = caver.klay.accounts.decrypt(keystoreJsonV4, password)

                isAccount(result, { keys: key, address: account.address })
            }).timeout(50000)
        }
    )

    context(
        'CAVERJS-UNIT-WALLET-374: input: keystoreJsonV4 that encrypts Account with AccountKeyRoleBased(updateKey only), password',
        () => {
            it('After decrypting, should return valid account', () => {
                const password = 'klaytn!@'
                const key = {
                    updateKey: caver.klay.accounts.create().privateKey,
                }
                const keystoreJsonV4 = caver.klay.accounts.encrypt(key, password, { address: account.address })

                const result = caver.klay.accounts.decrypt(keystoreJsonV4, password)

                isAccount(result, { keys: key, address: account.address })
            }).timeout(50000)
        }
    )

    context(
        'CAVERJS-UNIT-WALLET-375: input: keystoreJsonV4 that encrypts Account with AccountKeyRoleBased(feePayerKey only), password',
        () => {
            it('After decrypting, should return valid account', () => {
                const password = 'klaytn!@'
                const key = {
                    feePayerKey: caver.klay.accounts.create().privateKey,
                }
                const keystoreJsonV4 = caver.klay.accounts.encrypt(key, password, { address: account.address })

                const result = caver.klay.accounts.decrypt(keystoreJsonV4, password)

                isAccount(result, { keys: key, address: account.address })
            }).timeout(50000)
        }
    )

    context('CAVERJS-UNIT-WALLET-378: input: keystoreJsonV4 that encrypts Account, password', () => {
        it('After decrypting, should return valid account', () => {
            const password = 'klaytn!@'
            const key = caver.klay.accounts.create().privateKey
            const keystore = caver.klay.accounts.encrypt(key, password, { address: account.address })
            keystore.version = 3
            keystore.crypto = keystore.keyring[0]
            delete keystore.keyring

            const result = caver.klay.accounts.decrypt(keystore, password)

            isAccount(result, { keys: key, address: account.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-379: input: keystoreJsonV4 that encrypts Account, password', () => {
        it('should throw error with invalid keystore v3 which not defines crypto', () => {
            const password = 'klaytn!@'
            const key = caver.klay.accounts.create().privateKey
            const keystore = caver.klay.accounts.encrypt(key, password, { address: account.address })
            keystore.version = 3

            const expectedError = "Invalid keystore V3 format: 'crypto' is not defined."

            expect(() => caver.klay.accounts.decrypt(keystore, password)).to.throws(expectedError)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-380: input: keystoreJsonV4 that encrypts Account, password', () => {
        it('should throw error with invalid keystore v3 which defines crypto and keyring', () => {
            const password = 'klaytn!@'
            const key = caver.klay.accounts.create().privateKey
            const keystore = caver.klay.accounts.encrypt(key, password, { address: account.address })
            keystore.version = 3
            keystore.crypto = keystore.keyring[0]

            const expectedError = "Invalid key store format: 'crypto' can not be with 'keyring'"

            expect(() => caver.klay.accounts.decrypt(keystore, password)).to.throws(expectedError)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-381: input: keystoreJsonV4 that encrypts Account, password', () => {
        it('should throw error with invalid keystore v3 which defines crypto and keyring', () => {
            const password = 'klaytn!@'
            const key = caver.klay.accounts.create().privateKey
            const keystore = caver.klay.accounts.encrypt(key, password, { address: account.address })
            keystore.crypto = keystore.keyring[0]

            const expectedError = "Invalid key store format: 'crypto' can not be with 'keyring'"

            expect(() => caver.klay.accounts.decrypt(keystore, password)).to.throws(expectedError)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-382: input: keystoreJsonV4 that encrypts Account, password', () => {
        it('should throw error with invalid length of key', () => {
            const password = 'klaytn!@'
            const key = caver.klay.accounts.create().privateKey
            const keystore = caver.klay.accounts.encrypt(key, password, { address: account.address })
            keystore.keyring = [[], [], [], []]

            const expectedError = 'Invalid key store format'

            expect(() => caver.klay.accounts.decrypt(keystore, password)).to.throws(expectedError)
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-383: input: hard coded keystoreJsonV4 that encrypts Account, password', () => {
        it('should decrypt and return valid account', () => {
            const keystoreJsonV4 = {
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
            }
            const password = 'password'
            const expectedAccount = caver.klay.accounts.createWithAccountKey('0x86bce8c859f5f304aa30adb89f2f7b6ee5a0d6e2', {
                transactionKey: [
                    '0xd1e9f8f00ef9f93365f5eabccccb3f3c5783001b61a40f0f74270e50158c163d',
                    '0x4bd8d0b0c1575a7a35915f9af3ef8beb11ad571337ec9b6aca7c88ca7458ef5c',
                ],
                updateKey: '0xdc2690ac6017e32ef17ea219c2a2fd14a2bb73e7a0a253dfd69abba3eb8d7d91',
                feePayerKey: [
                    '0xf17bf8b7bee09ffc50a401b7ba8e633b9e55eedcf776782f2a55cf7cc5c40aa8',
                    '0x4f8f1e9e1466609b836dba611a0a24628aea8ee11265f757aa346bde3d88d548',
                ],
            })

            const result = caver.klay.accounts.decrypt(keystoreJsonV4, password)

            isAccount(result, { keys: expectedAccount.keys, address: expectedAccount.address })
        }).timeout(50000)
    })

    context('CAVERJS-UNIT-WALLET-384: input: hard coded keystoreJsonV3 that encrypts Account, password', () => {
        it('should decrypt and return valid account', () => {
            const keystoreJsonV3 = {
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
            }
            const password = 'password'
            const expectedAccount = caver.klay.accounts.privateKeyToAccount(
                '0x36e0a792553f94a7660e5484cfc8367e7d56a383261175b9abced7416a5d87df',
                '0x86bce8c859f5f304aa30adb89f2f7b6ee5a0d6e2'
            )

            const result = caver.klay.accounts.decrypt(keystoreJsonV3, password)

            isAccount(result, { keys: expectedAccount.keys, address: expectedAccount.address })
            expect(keystoreJsonV3.crypto).not.to.be.undefined
        }).timeout(50000)
    })

    /*
        it('keystoreJsonV3, password:invalid [KLAYTN-52]', () => {
            const invalid = ''
            const keystoreJsonV3 = caver.klay.accounts.encrypt(account.privateKey, invalid)

            utils.log('input', keystoreJsonV3, invalid)

            const expectedError = {
            name: 'Error',
            message: ''
            }
            validateErrorCodeblock(() => caver.klay.accounts.decrypt(keystoreJsonV3, invalid), expectedError)
        })
    */
})

describe('caver.klay.accounts.getLegacyAccount', () => {
    context('CAVERJS-UNIT-WALLET-106 : input: valid privateKey', () => {
        it('should return account which is derived from private key', () => {
            const testAccount = caver.klay.accounts.create()
            const result = caver.klay.accounts.getLegacyAccount(testAccount.privateKey)

            expect(result.klaytnWalletKeyAddress).to.equals('')
            expect(result.legacyAccount.address).to.equals(testAccount.address)
            expect(result.legacyAccount.privateKey).to.equals(testAccount.privateKey)
        })
    })

    context('CAVERJS-UNIT-WALLET-107 : input: nonDecoupled valid KlaytnWalletKey format', () => {
        it('should return account which is derived from private key and address from KlaytnWalletKey format', () => {
            const testAccount = caver.klay.accounts.create()
            const result = caver.klay.accounts.getLegacyAccount(testAccount.getKlaytnWalletKey())

            expect(result.klaytnWalletKeyAddress).to.equals(testAccount.address)
            expect(result.legacyAccount.address).to.equals(result.klaytnWalletKeyAddress)
            expect(result.legacyAccount.privateKey).to.equals(testAccount.privateKey)
        })
    })

    context('CAVERJS-UNIT-WALLET-108 : input: decoupled valid KlaytnWalletKey format', () => {
        it('should return account which is derived from private key and address from KlaytnWalletKey format', () => {
            // decoupled
            const { privateKey } = caver.klay.accounts.create()
            const { address } = caver.klay.accounts.create()
            const testAccount = caver.klay.accounts.privateKeyToAccount(privateKey, address)

            const result = caver.klay.accounts.getLegacyAccount(testAccount.getKlaytnWalletKey())

            expect(result.klaytnWalletKeyAddress).to.equals(testAccount.address)
            expect(result.legacyAccount.address).not.to.equals(result.klaytnWalletKeyAddress)
            expect(result.legacyAccount.privateKey).to.equals(testAccount.privateKey)
        })
    })

    context('CAVERJS-UNIT-WALLET-109 : input: invalid privateKey', () => {
        it('should throw error if input is invalid privateKey string', () => {
            const expectedError = 'Invalid private key'

            expect(() => caver.klay.accounts.getLegacyAccount('0x')).to.throws(expectedError)
            expect(() => caver.klay.accounts.getLegacyAccount('1')).to.throws(expectedError)
            expect(() => caver.klay.accounts.getLegacyAccount('a')).to.throws(expectedError)
            expect(() =>
                caver.klay.accounts.getLegacyAccount('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140FF')
            ).to.throws(expectedError)
        })

        it('should throw error if input is invalid privateKey type', () => {
            const expectedError = 'The private key must be of type string'

            expect(() => caver.klay.accounts.getLegacyAccount(1234)).to.throws(expectedError)
            expect(() => caver.klay.accounts.getLegacyAccount({})).to.throws(expectedError)
            expect(() => caver.klay.accounts.getLegacyAccount()).to.throws(expectedError)
            expect(() => caver.klay.accounts.getLegacyAccount(undefined)).to.throws(expectedError)
            expect(() => caver.klay.accounts.getLegacyAccount(null)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-110 : input: invalid KlaytnWalletKey format', () => {
        it('should throw error if input is invalid KlaytnWalletKey string', () => {
            const expectedError = 'Invalid private key'
            expect(() => caver.klay.accounts.getLegacyAccount(`${caver.klay.accounts.create().privateKey}0x000x00`)).to.throws(
                expectedError
            )
        })
    })
})

describe('caver.klay.accounts.isDecoupled', () => {
    context('CAVERJS-UNIT-WALLET-111 : input: valid privateKey and decoupled address', () => {
        it('should return true if input is decoupled private and address', () => {
            const { privateKey } = caver.klay.accounts.create()
            const { address } = caver.klay.accounts.create()
            const testAccount = caver.klay.accounts.privateKeyToAccount(privateKey, address)

            expect(caver.klay.accounts.isDecoupled(testAccount.privateKey, testAccount.address)).to.be.true
        })
    })

    context('CAVERJS-UNIT-WALLET-112 : input: valid KlaytnWalletKey', () => {
        it('should return true if input is decoupled KlaytnWalletKey', () => {
            const { privateKey } = caver.klay.accounts.create()
            const { address } = caver.klay.accounts.create()
            const testAccount = caver.klay.accounts.privateKeyToAccount(privateKey, address)

            expect(caver.klay.accounts.isDecoupled(testAccount.getKlaytnWalletKey())).to.be.true
            expect(caver.klay.accounts.isDecoupled(testAccount.getKlaytnWalletKey(), testAccount.address)).to.be.true
        })
    })

    context('CAVERJS-UNIT-WALLET-113 : input: valid privateKey', () => {
        it('should return false if input is valid privateKey', () => {
            expect(caver.klay.accounts.isDecoupled(caver.klay.accounts.create().privateKey)).to.be.false
            expect(caver.klay.accounts.isDecoupled(caver.klay.accounts.create().privateKey.slice(2))).to.be.false
        })
    })

    context('CAVERJS-UNIT-WALLET-114 : input: valid KlaytnWalletKey', () => {
        it('should return true if input is nonDecoupled KlaytnWalletKey', () => {
            const testAccount = caver.klay.accounts.create()
            expect(caver.klay.accounts.isDecoupled(testAccount.getKlaytnWalletKey())).to.be.false
            expect(caver.klay.accounts.isDecoupled(testAccount.getKlaytnWalletKey(), testAccount.address)).to.be.false
        })
    })

    context('CAVERJS-UNIT-WALLET-115 : input: invalid privateKey', () => {
        it('should throw error if input is invalid privateKey string', () => {
            const expectedError = 'Invalid private key'

            expect(() => caver.klay.accounts.isDecoupled('0x')).to.throws(expectedError)
            expect(() => caver.klay.accounts.isDecoupled('1')).to.throws(expectedError)
            expect(() => caver.klay.accounts.isDecoupled('a')).to.throws(expectedError)
            expect(() => caver.klay.accounts.isDecoupled('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140FF')).to.throws(
                expectedError
            )
        })

        it('should throw error if input is invalid privateKey type', () => {
            const expectedError = 'The private key must be of type string'

            expect(() => caver.klay.accounts.isDecoupled(1234)).to.throws(expectedError)
            expect(() => caver.klay.accounts.isDecoupled({})).to.throws(expectedError)
            expect(() => caver.klay.accounts.isDecoupled()).to.throws(expectedError)
            expect(() => caver.klay.accounts.isDecoupled(undefined)).to.throws(expectedError)
            expect(() => caver.klay.accounts.isDecoupled(null)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-116 : input: not match address with KlaytnWalletKey and input', () => {
        it('should throw error if input is invalid privateKey string', () => {
            const { privateKey } = caver.klay.accounts.create()
            const { address } = caver.klay.accounts.create()
            const testAccount = caver.klay.accounts.privateKeyToAccount(privateKey, address)

            const expectedError = 'The address extracted from the private key does not match the address received as the input value.'

            expect(() => caver.klay.accounts.isDecoupled(testAccount.getKlaytnWalletKey(), caver.klay.accounts.create().address)).to.throws(
                expectedError
            )
        })
    })
})

describe('caver.klay.accounts._getRoleKey', () => {
    let account

    beforeEach(() => {
        const keyObject = {
            transactionKey: [
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
            ],
            updateKey: [caver.klay.accounts.create().privateKey],
            feePayerKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
        }
        account = caver.klay.accounts.createWithAccountKey(caver.klay.accounts.create().address, keyObject)
    })

    context('CAVERJS-UNIT-WALLET-133: input: legacy tx and account', () => {
        it('should return transactionKey', () => {
            const tx = {}
            const roleKey = caver.klay.accounts._getRoleKey(tx, account)
            expect(isSameKeyArray(roleKey, account.transactionKey)).to.be.true
        })
    })

    context('CAVERJS-UNIT-WALLET-134: input: update tx and account', () => {
        it('should return updateKey', () => {
            const tx = { type: 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO' }
            const roleKey = caver.klay.accounts._getRoleKey(tx, account)
            expect(isSameKeyArray(roleKey, account.updateKey)).to.be.true
        })
    })

    context('CAVERJS-UNIT-WALLET-135: input: tx for fee payer and account', () => {
        it('should return feePayerKey', () => {
            const tx = { senderRawTransaction: '0x', feePayer: account.address }
            const roleKey = caver.klay.accounts._getRoleKey(tx, account)
            expect(isSameKeyArray(roleKey, account.feePayerKey)).to.be.true
        })
    })

    context('CAVERJS-UNIT-WALLET-136: input: tx and account', () => {
        it('should throw error if there is not key matched with role', () => {
            const testAccount = { updateKey: caver.klay.accounts.create().privateKey }
            const expectedError = 'The key corresponding to the role used for signing is not defined.'
            expect(() => caver.klay.accounts._getRoleKey({}, testAccount)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-137: input: tx and account', () => {
        it('should throw error if there is not key matched with role', () => {
            const testAccount = { transactionKey: caver.klay.accounts.create().privateKey }
            const expectedError = 'The key corresponding to the role used for signing is not defined.'
            expect(() => caver.klay.accounts._getRoleKey({ type: 'ACCOUNT_UPDATE' }, testAccount)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-138: input: tx and account', () => {
        it('should throw error if there is not key matched with role', () => {
            const testAccount = { transactionKey: caver.klay.accounts.create().privateKey }
            const expectedError = 'The key corresponding to the role used for signing is not defined.'
            expect(() => caver.klay.accounts._getRoleKey({ senderRawTransaction: '0x', feePayer: account.address }, testAccount)).to.throws(
                expectedError
            )
        })
    })
})

describe('caver.klay.accounts.createAccountKey', () => {
    context('CAVERJS-UNIT-WALLET-139: input: private key string`', () => {
        it('should return AccountKeyPublic', () => {
            const key = caver.klay.accounts.create().privateKey
            const accountKey = caver.klay.accounts.createAccountKey(key)

            expect(accountKey.type).to.equals('AccountKeyPublic')
            expect(accountKey.defaultKey).to.equals(key)
            compareAccountKey(accountKey, key)
            expect(typeof accountKey.toPublicKey).to.equals('function')
            expect(typeof accountKey.update).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-140: input: array of private key string', () => {
        it('should return accountKeyMultiSig', () => {
            const key = [
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
            ]
            const accountKey = caver.klay.accounts.createAccountKey(key)

            expect(accountKey.type).to.equals('AccountKeyMultiSig')
            expect(accountKey.defaultKey).to.equals(key[0])
            compareAccountKey(accountKey, key)
            expect(typeof accountKey.toPublicKey).to.equals('function')
            expect(typeof accountKey.update).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-141: input: keyObject(transactionKey is defined with private key string)', () => {
        it('should return accountKeyRoleBased', () => {
            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
            }
            const accountKey = caver.klay.accounts.createAccountKey(key)

            expect(accountKey.type).to.equals('AccountKeyRoleBased')
            expect(accountKey.defaultKey).to.equals(key.transactionKey)
            compareAccountKey(accountKey, key)
            expect(typeof accountKey.toPublicKey).to.equals('function')
            expect(typeof accountKey.update).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-142: input: keyObject(transactionKey is defined with array of private key string)', () => {
        it('should return accountKeyRoleBased', () => {
            const key = {
                transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
            }
            const accountKey = caver.klay.accounts.createAccountKey(key)

            expect(accountKey.type).to.equals('AccountKeyRoleBased')
            expect(accountKey.defaultKey).to.equals(key.transactionKey[0])
            compareAccountKey(accountKey, key)
            expect(typeof accountKey.toPublicKey).to.equals('function')
            expect(typeof accountKey.update).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-143: input: keyObject(updateKey is defined with private key string)', () => {
        it('should return accountKeyRoleBased', () => {
            const key = {
                updateKey: caver.klay.accounts.create().privateKey,
            }
            const accountKey = caver.klay.accounts.createAccountKey(key)

            expect(accountKey.type).to.equals('AccountKeyRoleBased')
            expect(accountKey.defaultKey).to.equals(key.updateKey)
            compareAccountKey(accountKey, key)
            expect(typeof accountKey.toPublicKey).to.equals('function')
            expect(typeof accountKey.update).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-144: input: keyObject(updateKey is defined with array of private key string)', () => {
        it('should return accountKeyRoleBased', () => {
            const key = {
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
            }
            const accountKey = caver.klay.accounts.createAccountKey(key)

            expect(accountKey.type).to.equals('AccountKeyRoleBased')
            expect(accountKey.defaultKey).to.equals(key.updateKey[0])
            compareAccountKey(accountKey, key)
            expect(typeof accountKey.toPublicKey).to.equals('function')
            expect(typeof accountKey.update).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-145: input: keyObject(feePayerKey is defined with private key string)', () => {
        it('should return accountKeyRoleBased', () => {
            const key = {
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            const accountKey = caver.klay.accounts.createAccountKey(key)

            expect(accountKey.type).to.equals('AccountKeyRoleBased')
            expect(accountKey.defaultKey).to.equals(key.feePayerKey)
            compareAccountKey(accountKey, key)
            expect(typeof accountKey.toPublicKey).to.equals('function')
            expect(typeof accountKey.update).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-146: input: keyObject(feePayerKey is defined with array of private key string)', () => {
        it('should return accountKeyRoleBased', () => {
            const key = {
                feePayerKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
            }
            const accountKey = caver.klay.accounts.createAccountKey(key)

            expect(accountKey.type).to.equals('AccountKeyRoleBased')
            expect(accountKey.defaultKey).to.equals(key.feePayerKey[0])
            compareAccountKey(accountKey, key)
            expect(typeof accountKey.toPublicKey).to.equals('function')
            expect(typeof accountKey.update).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-147: input: keyObject(transactionKey, updateKey, feePayerKey are defined)', () => {
        it('should return accountKeyRoleBased', () => {
            const key = {
                transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                updateKey: caver.klay.accounts.create().privateKey,
                feePayerKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
            }

            const accountKey = caver.klay.accounts.createAccountKey(key)

            expect(accountKey.type).to.equals('AccountKeyRoleBased')
            expect(accountKey.defaultKey).to.equals(key.transactionKey[0])
            compareAccountKey(accountKey, key)
            expect(typeof accountKey.toPublicKey).to.equals('function')
            expect(typeof accountKey.update).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-148: input: invalid type of parameter', () => {
        it('should throw Error', () => {
            let param = 1
            let expectedError = `Invalid accountKey type: ${typeof param}`
            expect(() => caver.klay.accounts.createAccountKey(param)).to.throws(expectedError)

            param = undefined
            expectedError = `Invalid accountKey type: ${typeof param}`
            expect(() => caver.klay.accounts.createAccountKey(param)).to.throws(expectedError)

            param = null
            expectedError = `Invalid accountKey type: ${typeof param}`
            expect(() => caver.klay.accounts.createAccountKey(param)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-149: input: invalid parameter', () => {
        it('should throw Error', () => {
            let param = 'invalidString'
            let expectedError = 'Invalid private key'
            expect(() => caver.klay.accounts.createAccountKey(param)).to.throws(expectedError)

            param = ['invalidString']
            expectedError = 'Invalid private key'
            expect(() => caver.klay.accounts.createAccountKey(param)).to.throws(expectedError)

            param = {}
            expectedError = 'Failed to create AccountKeyRoleBased: empty object'
            expect(() => caver.klay.accounts.createAccountKey(param)).to.throws(expectedError)
        })
    })
})

describe('caver.klay.accounts.createAccountKeyPublic', () => {
    context('CAVERJS-UNIT-WALLET-150: input: private key string`', () => {
        it('should return AccountKeyPublic', () => {
            const key = caver.klay.accounts.create().privateKey
            const accountKey = caver.klay.accounts.createAccountKeyPublic(key)

            expect(accountKey.type).to.equals('AccountKeyPublic')
            expect(accountKey.defaultKey).to.equals(key)
            compareAccountKey(accountKey, key)
            expect(typeof accountKey.toPublicKey).to.equals('function')
            expect(typeof accountKey.update).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-151: input: AccountKeyPublic', () => {
        it('should return AccountKeyPublic', () => {
            const key = caver.klay.accounts.create().privateKey
            const accountKey = caver.klay.accounts.createAccountKeyPublic(caver.klay.accounts.createAccountKeyPublic(key))

            expect(accountKey.type).to.equals('AccountKeyPublic')
            expect(accountKey.defaultKey).to.equals(key)
            compareAccountKey(accountKey, key)
            expect(typeof accountKey.toPublicKey).to.equals('function')
            expect(typeof accountKey.update).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-152: input: invalid type of parameter', () => {
        it('should throw Error', () => {
            let param = 1
            let expectedError = 'Creating a AccountKeyPublic requires a private key string.'
            expect(() => caver.klay.accounts.createAccountKeyPublic(param)).to.throws(expectedError)

            param = []
            expectedError = 'Creating a AccountKeyPublic requires a private key string.'
            expect(() => caver.klay.accounts.createAccountKeyPublic(param)).to.throws(expectedError)

            param = {}
            expectedError = 'Creating a AccountKeyPublic requires a private key string.'
            expect(() => caver.klay.accounts.createAccountKeyPublic(param)).to.throws(expectedError)

            param = undefined
            expectedError = 'Creating a AccountKeyPublic requires a private key string.'
            expect(() => caver.klay.accounts.createAccountKeyPublic(param)).to.throws(expectedError)

            param = null
            expectedError = 'Creating a AccountKeyPublic requires a private key string.'
            expect(() => caver.klay.accounts.createAccountKeyPublic(param)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-153: input: invalid parameter', () => {
        it('should throw Error', () => {
            const param = 'invalidString'
            const expectedError = 'Invalid private key'
            expect(() => caver.klay.accounts.createAccountKeyPublic(param)).to.throws(expectedError)
        })
    })
})

describe('caver.klay.accounts.createAccountKeyMultiSig', () => {
    context('CAVERJS-UNIT-WALLET-154: input: private key string`', () => {
        it('should return AccountKeyMultiSig', () => {
            const key = [caver.klay.accounts.create().privateKey]
            const accountKey = caver.klay.accounts.createAccountKeyMultiSig(key)

            expect(accountKey.type).to.equals('AccountKeyMultiSig')
            expect(accountKey.defaultKey).to.equals(key[0])
            compareAccountKey(accountKey, key)
            expect(typeof accountKey.toPublicKey).to.equals('function')
            expect(typeof accountKey.update).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-155: input: AccountKeyMultiSig', () => {
        it('should return AccountKeyMultiSig', () => {
            const key = [caver.klay.accounts.create().privateKey]
            const accountKey = caver.klay.accounts.createAccountKeyMultiSig(caver.klay.accounts.createAccountKeyMultiSig(key))

            expect(accountKey.type).to.equals('AccountKeyMultiSig')
            expect(accountKey.defaultKey).to.equals(key[0])
            compareAccountKey(accountKey, key)
            expect(typeof accountKey.toPublicKey).to.equals('function')
            expect(typeof accountKey.update).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-156: input: invalid type of parameter', () => {
        it('should throw Error', () => {
            let param = 1
            let expectedError = 'Creating a AccountKeyMultiSig requires an array of private key string.'
            expect(() => caver.klay.accounts.createAccountKeyMultiSig(param)).to.throws(expectedError)

            param = 'string'
            expectedError = 'Creating a AccountKeyMultiSig requires an array of private key string.'
            expect(() => caver.klay.accounts.createAccountKeyMultiSig(param)).to.throws(expectedError)

            param = {}
            expectedError = 'Creating a AccountKeyMultiSig requires an array of private key string.'
            expect(() => caver.klay.accounts.createAccountKeyMultiSig(param)).to.throws(expectedError)

            param = undefined
            expectedError = 'Creating a AccountKeyMultiSig requires an array of private key string.'
            expect(() => caver.klay.accounts.createAccountKeyMultiSig(param)).to.throws(expectedError)

            param = null
            expectedError = 'Creating a AccountKeyMultiSig requires an array of private key string.'
            expect(() => caver.klay.accounts.createAccountKeyMultiSig(param)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-157: input: invalid parameter', () => {
        it('should throw Error', () => {
            const param = ['invalidString']
            const expectedError = 'Invalid private key'
            expect(() => caver.klay.accounts.createAccountKeyMultiSig(param)).to.throws(expectedError)
        })
    })
})

describe('caver.klay.accounts.createAccountKeyRoleBased', () => {
    context('CAVERJS-UNIT-WALLET-158: input: private key string', () => {
        it('should return AccountKeyRoleBased', () => {
            const key = {
                transactionKey: [caver.klay.accounts.create().privateKey],
                updateKey: caver.klay.accounts.create().privateKey,
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            const accountKey = caver.klay.accounts.createAccountKeyRoleBased(key)

            expect(accountKey.type).to.equals('AccountKeyRoleBased')
            expect(accountKey.defaultKey).to.equals(key.transactionKey[0])
            compareAccountKey(accountKey, key)
            expect(typeof accountKey.toPublicKey).to.equals('function')
            expect(typeof accountKey.update).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-159: input: AccountKeyRoleBased', () => {
        it('should return AccountKeyRoleBased', () => {
            const key = {
                transactionKey: [caver.klay.accounts.create().privateKey],
                updateKey: caver.klay.accounts.create().privateKey,
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            const accountKey = caver.klay.accounts.createAccountKeyRoleBased(caver.klay.accounts.createAccountKeyRoleBased(key))

            expect(accountKey.type).to.equals('AccountKeyRoleBased')
            expect(accountKey.defaultKey).to.equals(key.transactionKey[0])
            compareAccountKey(accountKey, key)
            expect(typeof accountKey.toPublicKey).to.equals('function')
            expect(typeof accountKey.update).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-160: input: invalid type of parameter', () => {
        it('should throw Error', () => {
            let param = 1
            let expectedError = 'Creating a AccountKeyRoleBased requires an object.'
            expect(() => caver.klay.accounts.createAccountKeyRoleBased(param)).to.throws(expectedError)

            param = 'string'
            expectedError = 'Creating a AccountKeyRoleBased requires an object.'
            expect(() => caver.klay.accounts.createAccountKeyRoleBased(param)).to.throws(expectedError)

            param = []
            expectedError = 'Creating a AccountKeyRoleBased requires an object.'
            expect(() => caver.klay.accounts.createAccountKeyRoleBased(param)).to.throws(expectedError)

            param = undefined
            expectedError = 'Creating a AccountKeyRoleBased requires an object.'
            expect(() => caver.klay.accounts.createAccountKeyRoleBased(param)).to.throws(expectedError)

            param = null
            expectedError = 'Creating a AccountKeyRoleBased requires an object.'
            expect(() => caver.klay.accounts.createAccountKeyRoleBased(param)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-161: input: empty object', () => {
        it('should throw Error', () => {
            const param = {}
            const expectedError = 'Failed to create AccountKeyRoleBased: empty object'
            expect(() => caver.klay.accounts.createAccountKeyRoleBased(param)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-162: input: invalid role is defined', () => {
        it('should throw Error', () => {
            const param = { invalidRole: 'invalidString' }
            const expectedError = 'Failed to create AccountKeyRoleBased. Invalid role is defined : invalidRole'
            expect(() => caver.klay.accounts.createAccountKeyRoleBased(param)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-163: input: invalid parameter', () => {
        it('should throw Error', () => {
            const param = { transactionKey: 'invalidString' }
            const expectedError = 'Invalid private key'
            expect(() => caver.klay.accounts.createAccountKeyRoleBased(param)).to.throws(expectedError)
        })
    })
})

describe('caver.klay.accounts.accountKeyToPublicKey', () => {
    context('CAVERJS-UNIT-WALLET-164: input: private key string', () => {
        it('should return string of public key', () => {
            const key = caver.klay.accounts.create().privateKey
            const expectedPublicKey = caver.klay.accounts.privateKeyToPublicKey(key)

            const publicKey = caver.klay.accounts.accountKeyToPublicKey(key)

            expect(expectedPublicKey).to.equals(publicKey)
        })
    })

    context('CAVERJS-UNIT-WALLET-165: input: AccountKeyPublic', () => {
        it('should return string of public key', () => {
            const key = caver.klay.accounts.create().privateKey
            const accountKey = caver.klay.accounts.createAccountKeyPublic(key)
            const expectedPublicKey = caver.klay.accounts.privateKeyToPublicKey(key)

            const publicKey = caver.klay.accounts.accountKeyToPublicKey(accountKey)

            expect(expectedPublicKey).to.equals(publicKey)
        })
    })

    context('CAVERJS-UNIT-WALLET-166: input: array of private key string', () => {
        it('should return array of public key string', () => {
            const key = [caver.klay.accounts.create().privateKey]
            const expectedPublicKey = [caver.klay.accounts.privateKeyToPublicKey(key[0])]

            const publicKey = caver.klay.accounts.accountKeyToPublicKey(key)

            expect(isSameKeyArray(expectedPublicKey, publicKey)).to.be.true
        })
    })

    context('CAVERJS-UNIT-WALLET-167: input: AccountKeyMultiSig', () => {
        it('should return array of public key string', () => {
            const key = [caver.klay.accounts.create().privateKey]
            const accountKey = caver.klay.accounts.createAccountKeyMultiSig(key)
            const expectedPublicKey = [caver.klay.accounts.privateKeyToPublicKey(key[0])]

            const publicKey = caver.klay.accounts.accountKeyToPublicKey(accountKey)

            expect(isSameKeyArray(expectedPublicKey, publicKey)).to.be.true
        })
    })

    context('CAVERJS-UNIT-WALLET-168: input: object defines key', () => {
        it('should return object of public key string', () => {
            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: caver.klay.accounts.create().privateKey,
                feePayerKey: [caver.klay.accounts.create().privateKey],
            }
            const expectedPublicKey = {
                transactionKey: caver.klay.accounts.privateKeyToPublicKey(key.transactionKey),
                updateKey: caver.klay.accounts.privateKeyToPublicKey(key.updateKey),
                feePayerKey: [caver.klay.accounts.privateKeyToPublicKey(key.feePayerKey[0])],
            }

            const publicKey = caver.klay.accounts.accountKeyToPublicKey(key)

            expect(publicKey.transactionKey).to.equals(expectedPublicKey.transactionKey)
            expect(publicKey.updateKey).to.equals(expectedPublicKey.updateKey)
            expect(isSameKeyArray(expectedPublicKey.feePayerKey, publicKey.feePayerKey)).to.be.true
        })
    })

    context('CAVERJS-UNIT-WALLET-169: input: AccountKeyRoleBased', () => {
        it('should return array of public key string', () => {
            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: caver.klay.accounts.create().privateKey,
                feePayerKey: [caver.klay.accounts.create().privateKey],
            }
            const accountKey = caver.klay.accounts.createAccountKeyRoleBased(key)
            const expectedPublicKey = {
                transactionKey: caver.klay.accounts.privateKeyToPublicKey(key.transactionKey),
                updateKey: caver.klay.accounts.privateKeyToPublicKey(key.updateKey),
                feePayerKey: [caver.klay.accounts.privateKeyToPublicKey(key.feePayerKey[0])],
            }

            const publicKey = caver.klay.accounts.accountKeyToPublicKey(accountKey)

            expect(publicKey.transactionKey).to.equals(expectedPublicKey.transactionKey)
            expect(publicKey.updateKey).to.equals(expectedPublicKey.updateKey)
            expect(isSameKeyArray(expectedPublicKey.feePayerKey, publicKey.feePayerKey)).to.be.true
        })
    })

    context('CAVERJS-UNIT-WALLET-170: input: object defines transactionKey only', () => {
        it('should return object of public key string', () => {
            const key = { transactionKey: caver.klay.accounts.create().privateKey }
            const expectedPublicKey = {
                transactionKey: caver.klay.accounts.privateKeyToPublicKey(key.transactionKey),
            }

            const publicKey = caver.klay.accounts.accountKeyToPublicKey(key)

            expect(publicKey.transactionKey).to.equals(expectedPublicKey.transactionKey)
            expect(publicKey.updateKey).to.be.undefined
            expect(publicKey.feePayerKey).to.be.undefined
        })
    })

    context('CAVERJS-UNIT-WALLET-171: input: object defines updateKey only', () => {
        it('should return object of public key string', () => {
            const key = { updateKey: caver.klay.accounts.create().privateKey }
            const expectedPublicKey = {
                updateKey: caver.klay.accounts.privateKeyToPublicKey(key.updateKey),
            }

            const publicKey = caver.klay.accounts.accountKeyToPublicKey(key)

            expect(publicKey.transactionKey).to.be.undefined
            expect(publicKey.updateKey).to.equals(expectedPublicKey.updateKey)
            expect(publicKey.feePayerKey).to.be.undefined
        })
    })

    context('CAVERJS-UNIT-WALLET-172: input: object defines feePayerKey only', () => {
        it('should return object of public key string', () => {
            const key = { feePayerKey: caver.klay.accounts.create().privateKey }
            const expectedPublicKey = {
                feePayerKey: caver.klay.accounts.privateKeyToPublicKey(key.feePayerKey),
            }

            const publicKey = caver.klay.accounts.accountKeyToPublicKey(key)

            expect(publicKey.transactionKey).to.be.undefined
            expect(publicKey.updateKey).to.be.undefined
            expect(publicKey.feePayerKey).to.equals(expectedPublicKey.feePayerKey)
        })
    })
})

describe('caver.klay.accounts.createWithAccountKey', () => {
    context('CAVERJS-UNIT-WALLET-173: input: address and private key string', () => {
        it('should return Account with AccountKeyPublic', () => {
            const { address } = caver.klay.accounts.create()
            const key = caver.klay.accounts.create().privateKey

            const account = caver.klay.accounts.createWithAccountKey(address, key)

            isAccount(account, { keys: key, address })
            expect(account.privateKey).to.equals(key)
            expect(account.accountKeyType).to.equals('AccountKeyPublic')
            expect(typeof account.toPublicKey).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-174: input: address and array of private key string', () => {
        it('should return Account with AccountKeyMultiSig', () => {
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]

            const account = caver.klay.accounts.createWithAccountKey(address, key)

            isAccount(account, { keys: key, address })
            expect(account.privateKey).to.equals(key[0])
            expect(account.accountKeyType).to.equals('AccountKeyMultiSig')
            expect(typeof account.toPublicKey).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-175: input: address and object of private key', () => {
        it('should return Account with AccountKeyRoleBased', () => {
            const { address } = caver.klay.accounts.create()
            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: [caver.klay.accounts.create().privateKey],
            }

            const account = caver.klay.accounts.createWithAccountKey(address, key)
            isAccount(account, { keys: key, address })
            expect(account.privateKey).to.equals(key.transactionKey)
            expect(account.accountKeyType).to.equals('AccountKeyRoleBased')
            expect(typeof account.toPublicKey).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-176: input: address and object defines only transactionKey', () => {
        it('should return Account with AccountKeyRoleBased', () => {
            const { address } = caver.klay.accounts.create()
            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
            }

            const account = caver.klay.accounts.createWithAccountKey(address, key)
            isAccount(account, { keys: key, address })
            expect(account.privateKey).to.equals(key.transactionKey)
            expect(account.accountKeyType).to.equals('AccountKeyRoleBased')
            expect(typeof account.toPublicKey).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-177: input: address and object defines only updateKey', () => {
        it('should return Account with AccountKeyRoleBased', () => {
            const { address } = caver.klay.accounts.create()
            const key = {
                updateKey: caver.klay.accounts.create().privateKey,
            }

            const account = caver.klay.accounts.createWithAccountKey(address, key)
            isAccount(account, { keys: key, address })
            expect(account.privateKey).to.equals(key.updateKey)
            expect(account.accountKeyType).to.equals('AccountKeyRoleBased')
            expect(typeof account.toPublicKey).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-178: input: address and object defines only feePayerKey', () => {
        it('should return Account with AccountKeyRoleBased', () => {
            const { address } = caver.klay.accounts.create()
            const key = {
                feePayerKey: caver.klay.accounts.create().privateKey,
            }

            const account = caver.klay.accounts.createWithAccountKey(address, key)
            isAccount(account, { keys: key, address })
            expect(account.privateKey).to.equals(key.feePayerKey)
            expect(account.accountKeyType).to.equals('AccountKeyRoleBased')
            expect(typeof account.toPublicKey).to.equals('function')
        })
    })
})

describe('caver.klay.accounts.createWithAccountKeyPublic', () => {
    context('CAVERJS-UNIT-WALLET-179: input: address and private key string', () => {
        it('should return Account with AccountKeyPublic', () => {
            const { address } = caver.klay.accounts.create()
            const key = caver.klay.accounts.create().privateKey

            const account = caver.klay.accounts.createWithAccountKeyPublic(address, key)

            isAccount(account, { keys: key, address })
            expect(account.privateKey).to.equals(key)
            expect(account.accountKeyType).to.equals('AccountKeyPublic')
            expect(typeof account.toPublicKey).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-180: input: address and AccountKeyPublic', () => {
        it('should return Account with AccountKeyPublic', () => {
            const { address } = caver.klay.accounts.create()
            const key = caver.klay.accounts.create().privateKey
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const account = caver.klay.accounts.createWithAccountKeyPublic(address, accountKey)

            isAccount(account, { keys: key, address })
            expect(account.privateKey).to.equals(key)
            expect(account.accountKeyType).to.equals('AccountKeyPublic')
            expect(typeof account.toPublicKey).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-181: input: address and array of private key string', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]

            const expectedError = 'Creating a AccountKeyPublic requires a private key string.'

            expect(() => caver.klay.accounts.createWithAccountKeyPublic(address, key)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-182: input: address and object', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = { transactionKey: caver.klay.accounts.create().privateKey }

            const expectedError = 'Creating a AccountKeyPublic requires a private key string.'

            expect(() => caver.klay.accounts.createWithAccountKeyPublic(address, key)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-183: input: address and AccountKeyMultiSig', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const expectedError = `Failed to create account with AccountKeyPublic. Invalid account key : ${accountKey.type}`

            expect(() => caver.klay.accounts.createWithAccountKeyPublic(address, accountKey)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-184: input: address and AccountKeyRoleBased', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = { transactionKey: caver.klay.accounts.create().privateKey }
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const expectedError = `Failed to create account with AccountKeyPublic. Invalid account key : ${accountKey.type}`

            expect(() => caver.klay.accounts.createWithAccountKeyPublic(address, accountKey)).to.throws(expectedError)
        })
    })
})

describe('caver.klay.accounts.createWithAccountKeyMultiSig', () => {
    context('CAVERJS-UNIT-WALLET-185: input: address and array of private key string', () => {
        it('should return Account with AccountKeyMultiSig', () => {
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey]

            const account = caver.klay.accounts.createWithAccountKeyMultiSig(address, key)

            isAccount(account, { keys: key, address })
            expect(account.privateKey).to.equals(key[0])
            expect(account.accountKeyType).to.equals('AccountKeyMultiSig')
            expect(typeof account.toPublicKey).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-186: input: address and AccountKeyMultiSig', () => {
        it('should return Account with AccountKeyMultiSig', () => {
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey]
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const account = caver.klay.accounts.createWithAccountKeyMultiSig(address, accountKey)

            isAccount(account, { keys: key, address })
            expect(account.privateKey).to.equals(key[0])
            expect(account.accountKeyType).to.equals('AccountKeyMultiSig')
            expect(typeof account.toPublicKey).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-187: input: address and private key string', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = caver.klay.accounts.create().privateKey

            const expectedError = 'Creating a AccountKeyMultiSig requires an array of private key string.'

            expect(() => caver.klay.accounts.createWithAccountKeyMultiSig(address, key)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-188: input: address and object', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = { transactionKey: caver.klay.accounts.create().privateKey }

            const expectedError = 'Creating a AccountKeyMultiSig requires an array of private key string.'

            expect(() => caver.klay.accounts.createWithAccountKeyMultiSig(address, key)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-189: input: address and AccountKeyPublic', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = caver.klay.accounts.create().privateKey
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const expectedError = `Failed to create account with AccountKeyMultiSig. Invalid account key : ${accountKey.type}`

            expect(() => caver.klay.accounts.createWithAccountKeyMultiSig(address, accountKey)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-190: input: address and AccountKeyRoleBased', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = { transactionKey: caver.klay.accounts.create().privateKey }
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const expectedError = `Failed to create account with AccountKeyMultiSig. Invalid account key : ${accountKey.type}`

            expect(() => caver.klay.accounts.createWithAccountKeyMultiSig(address, accountKey)).to.throws(expectedError)
        })
    })
})

describe('caver.klay.accounts.createWithAccountKeyRoleBased', () => {
    context('CAVERJS-UNIT-WALLET-191: input: address and object of key', () => {
        it('should return Account with AccountKeyRoleBased', () => {
            const { address } = caver.klay.accounts.create()
            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: caver.klay.accounts.create().privateKey,
            }

            const account = caver.klay.accounts.createWithAccountKeyRoleBased(address, key)

            isAccount(account, { keys: key, address })
            expect(account.privateKey).to.equals(key.transactionKey)
            expect(account.accountKeyType).to.equals('AccountKeyRoleBased')
            expect(typeof account.toPublicKey).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-192: input: address and AccountKeyRoleBased', () => {
        it('should return Account with AccountKeyRoleBased', () => {
            const { address } = caver.klay.accounts.create()
            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const account = caver.klay.accounts.createWithAccountKeyRoleBased(address, accountKey)

            isAccount(account, { keys: key, address })
            expect(account.privateKey).to.equals(key.transactionKey)
            expect(account.accountKeyType).to.equals('AccountKeyRoleBased')
            expect(typeof account.toPublicKey).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-193: input: address and private key string', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = caver.klay.accounts.create().privateKey

            const expectedError = 'Creating a AccountKeyRoleBased requires an object.'

            expect(() => caver.klay.accounts.createWithAccountKeyRoleBased(address, key)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-194: input: address and array of private key string', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey]

            const expectedError = 'Creating a AccountKeyRoleBased requires an object.'

            expect(() => caver.klay.accounts.createWithAccountKeyRoleBased(address, key)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-195: input: address and AccountKeyPublic', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = caver.klay.accounts.create().privateKey
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const expectedError = `Failed to create account with AccountKeyRoleBased. Invalid account key : ${accountKey.type}`

            expect(() => caver.klay.accounts.createWithAccountKeyRoleBased(address, accountKey)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-196: input: address and AccountKeyMultiSig', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const accountKey = caver.klay.accounts.createAccountKey(key)

            const expectedError = `Failed to create account with AccountKeyRoleBased. Invalid account key : ${accountKey.type}`

            expect(() => caver.klay.accounts.createWithAccountKeyRoleBased(address, accountKey)).to.throws(expectedError)
        })
    })
})

describe('caver.klay.accounts.createAccountForUpdate', () => {
    context('CAVERJS-UNIT-WALLET-197: input: address and private key string', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = caver.klay.accounts.create().privateKey
            const publicKey = caver.klay.accounts.privateKeyToPublicKey(key)

            const accountForUpdate = caver.klay.accounts.createAccountForUpdate(address, key)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.publicKey).to.equals(publicKey)
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-198: input: address and AccountKeyPublic', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = caver.klay.accounts.create().privateKey
            const accountKey = caver.klay.accounts.createAccountKeyPublic(key)
            const publicKey = caver.klay.accounts.privateKeyToPublicKey(key)

            const accountForUpdate = caver.klay.accounts.createAccountForUpdate(address, accountKey)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.publicKey).to.equals(publicKey)
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-199: input: address and array of private key string', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const options = { threshold: 2, weight: [1, 1] }
            const publicKey = [caver.klay.accounts.privateKeyToPublicKey(key[0]), caver.klay.accounts.privateKeyToPublicKey(key[1])]

            const accountForUpdate = caver.klay.accounts.createAccountForUpdate(address, key, options)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.multisig.threshold).to.equals(options.threshold)
            expect(accountForUpdate.keyForUpdate.multisig.keys[0].weight).to.equals(options.weight[0])
            expect(accountForUpdate.keyForUpdate.multisig.keys[0].publicKey).to.equals(publicKey[0])
            expect(accountForUpdate.keyForUpdate.multisig.keys[1].weight).to.equals(options.weight[1])
            expect(accountForUpdate.keyForUpdate.multisig.keys[1].publicKey).to.equals(publicKey[1])
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-200: input: address and AccountKeyMultiSig', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const accountKey = caver.klay.accounts.createAccountKeyMultiSig(key)
            const options = { threshold: 2, weight: [1, 1] }
            const publicKey = [caver.klay.accounts.privateKeyToPublicKey(key[0]), caver.klay.accounts.privateKeyToPublicKey(key[1])]

            const accountForUpdate = caver.klay.accounts.createAccountForUpdate(address, accountKey, options)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.multisig.threshold).to.equals(options.threshold)
            expect(accountForUpdate.keyForUpdate.multisig.keys[0].weight).to.equals(options.weight[0])
            expect(accountForUpdate.keyForUpdate.multisig.keys[0].publicKey).to.equals(publicKey[0])
            expect(accountForUpdate.keyForUpdate.multisig.keys[1].weight).to.equals(options.weight[1])
            expect(accountForUpdate.keyForUpdate.multisig.keys[1].publicKey).to.equals(publicKey[1])
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-201: input: address and object', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            const options = { updateKey: { threshold: 2, weight: [1, 1] } }
            const publicKey = {
                transactionKey: caver.klay.accounts.privateKeyToPublicKey(key.transactionKey),
                updateKey: [
                    caver.klay.accounts.privateKeyToPublicKey(key.updateKey[0]),
                    caver.klay.accounts.privateKeyToPublicKey(key.updateKey[1]),
                ],
                feePayerKey: caver.klay.accounts.privateKeyToPublicKey(key.feePayerKey),
            }

            const accountForUpdate = caver.klay.accounts.createAccountForUpdate(address, key, options)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.roleTransactionKey.publicKey).to.equals(publicKey.transactionKey)
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.threshold).to.equals(options.updateKey.threshold)
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys[0].weight).to.equals(options.updateKey.weight[0])
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys[0].publicKey).to.equals(publicKey.updateKey[0])
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys[1].weight).to.equals(options.updateKey.weight[1])
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys[1].publicKey).to.equals(publicKey.updateKey[1])
            expect(accountForUpdate.keyForUpdate.roleFeePayerKey.publicKey).to.equals(publicKey.feePayerKey)
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-202: input: address and AccountKeyRoleBased', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            const accountKey = caver.klay.accounts.createAccountKeyRoleBased(key)
            const options = { updateKey: { threshold: 2, weight: [1, 1] } }
            const publicKey = {
                transactionKey: caver.klay.accounts.privateKeyToPublicKey(key.transactionKey),
                updateKey: [
                    caver.klay.accounts.privateKeyToPublicKey(key.updateKey[0]),
                    caver.klay.accounts.privateKeyToPublicKey(key.updateKey[1]),
                ],
                feePayerKey: caver.klay.accounts.privateKeyToPublicKey(key.feePayerKey),
            }

            const accountForUpdate = caver.klay.accounts.createAccountForUpdate(address, accountKey, options)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.roleTransactionKey.publicKey).to.equals(publicKey.transactionKey)
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.threshold).to.equals(options.updateKey.threshold)
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys[0].weight).to.equals(options.updateKey.weight[0])
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys[0].publicKey).to.equals(publicKey.updateKey[0])
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys[1].weight).to.equals(options.updateKey.weight[1])
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys[1].publicKey).to.equals(publicKey.updateKey[1])
            expect(accountForUpdate.keyForUpdate.roleFeePayerKey.publicKey).to.equals(publicKey.feePayerKey)
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-203: input: address and object defines transactionKey only', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = { transactionKey: caver.klay.accounts.create().privateKey }
            const publicKey = { transactionKey: caver.klay.accounts.privateKeyToPublicKey(key.transactionKey) }

            const accountForUpdate = caver.klay.accounts.createAccountForUpdate(address, key)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.roleTransactionKey.publicKey).to.equals(publicKey.transactionKey)
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey).to.be.undefined
            expect(accountForUpdate.keyForUpdate.roleFeePayerKey).to.be.undefined
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-204: input: address and AccountKeyRoleBased defines transactionKey only', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = { transactionKey: caver.klay.accounts.create().privateKey }
            const accountKey = caver.klay.accounts.createAccountKeyRoleBased(key)
            const publicKey = { transactionKey: caver.klay.accounts.privateKeyToPublicKey(key.transactionKey) }

            const accountForUpdate = caver.klay.accounts.createAccountForUpdate(address, accountKey)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.roleTransactionKey.publicKey).to.equals(publicKey.transactionKey)
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey).to.be.undefined
            expect(accountForUpdate.keyForUpdate.roleFeePayerKey).to.be.undefined
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-205: input: address and object defines updateKey only', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = { updateKey: caver.klay.accounts.create().privateKey }
            const publicKey = { updateKey: caver.klay.accounts.privateKeyToPublicKey(key.updateKey) }

            const accountForUpdate = caver.klay.accounts.createAccountForUpdate(address, key)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.roleTransactionKey).to.be.undefined
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.publicKey).to.equals(publicKey.updateKey)
            expect(accountForUpdate.keyForUpdate.roleFeePayerKey).to.be.undefined
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-206: input: address and AccountKeyRoleBased defines updateKey only', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = { updateKey: caver.klay.accounts.create().privateKey }
            const accountKey = caver.klay.accounts.createAccountKeyRoleBased(key)
            const publicKey = { updateKey: caver.klay.accounts.privateKeyToPublicKey(key.updateKey) }

            const accountForUpdate = caver.klay.accounts.createAccountForUpdate(address, accountKey)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.roleTransactionKey).to.be.undefined
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.publicKey).to.equals(publicKey.updateKey)
            expect(accountForUpdate.keyForUpdate.roleFeePayerKey).to.be.undefined
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-207: input: address and object defines feePayerKey only', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = { feePayerKey: caver.klay.accounts.create().privateKey }
            const publicKey = { feePayerKey: caver.klay.accounts.privateKeyToPublicKey(key.feePayerKey) }

            const accountForUpdate = caver.klay.accounts.createAccountForUpdate(address, key)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.roleTransactionKey).to.be.undefined
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey).to.be.undefined
            expect(accountForUpdate.keyForUpdate.roleFeePayerKey.publicKey).to.equals(publicKey.feePayerKey)
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-208: input: address and AccountKeyRoleBased defines feePayerKey only', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = { feePayerKey: caver.klay.accounts.create().privateKey }
            const accountKey = caver.klay.accounts.createAccountKeyRoleBased(key)
            const publicKey = { feePayerKey: caver.klay.accounts.privateKeyToPublicKey(key.feePayerKey) }

            const accountForUpdate = caver.klay.accounts.createAccountForUpdate(address, accountKey)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.roleTransactionKey).to.be.undefined
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey).to.be.undefined
            expect(accountForUpdate.keyForUpdate.roleFeePayerKey.publicKey).to.equals(publicKey.feePayerKey)
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-209: input: address and array of private key without options', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]

            const expectedError = 'For AccountKeyMultiSig, threshold and weight should be defined in options object.'

            expect(() => caver.klay.accounts.createAccountForUpdate(address, key)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-210: input: address and array of private key with invalid options(weight sum < threshold)', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const options = { threshold: 4, weight: [1, 1] }

            const expectedError = 'Invalid options for AccountKeyMultiSig: The sum of weights is less than the threshold.'

            expect(() => caver.klay.accounts.createAccountForUpdate(address, key, options)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-211: input: address and array of private key with invalid options(weight is not array)', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const options = { threshold: 4, weight: 1 }

            const expectedError = 'The weight should be defined as a array.'

            expect(() => caver.klay.accounts.createAccountForUpdate(address, key, options)).to.throws(expectedError)
        })
    })

    context(
        'CAVERJS-UNIT-WALLET-212: input: address and array of private key with invalid options(weight length is not matched with key array)',
        () => {
            it('should throw error', () => {
                const { address } = caver.klay.accounts.create()
                const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
                const options = { threshold: 2, weight: [1, 1, 1, 1] }

                const expectedError = 'The length of keys in AccountKeyMultiSig and the length of weight array do not match.'

                expect(() => caver.klay.accounts.createAccountForUpdate(address, key, options)).to.throws(expectedError)
            })
        }
    )

    context('CAVERJS-UNIT-WALLET-213: input: address and object has multisig without options', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = { transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey] }

            const expectedError = 'For AccountKeyMultiSig, threshold and weight should be defined in options object.'

            expect(() => caver.klay.accounts.createAccountForUpdate(address, key)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-214: input: address and array of private key with invalid options(weight sum < threshold)', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = { transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey] }
            const options = { transactionKey: { threshold: 4, weight: [1, 1] } }

            const expectedError = 'Invalid options for AccountKeyMultiSig: The sum of weights is less than the threshold.'

            expect(() => caver.klay.accounts.createAccountForUpdate(address, key, options)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-215: input: address and array of private key with invalid options(weight is not array)', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = { transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey] }
            const options = { transactionKey: { threshold: 4, weight: 1 } }

            const expectedError = 'The weight should be defined as a array.'

            expect(() => caver.klay.accounts.createAccountForUpdate(address, key, options)).to.throws(expectedError)
        })
    })

    context(
        'CAVERJS-UNIT-WALLET-216: input: address and array of private key with invalid options(weight length is not matched with key array)',
        () => {
            it('should throw error', () => {
                const { address } = caver.klay.accounts.create()
                const key = { transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey] }
                const options = { transactionKey: { threshold: 2, weight: [1, 1, 1, 1] } }

                const expectedError = 'The length of keys in AccountKeyMultiSig and the length of weight array do not match.'

                expect(() => caver.klay.accounts.createAccountForUpdate(address, key, options)).to.throws(expectedError)
            })
        }
    )

    context('CAVERJS-UNIT-WALLET-348: input: address and key object which has legacyKey and failKey', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = { transactionKey: 'legacyKey', feePayerKey: 'failKey' }

            const accountForUpdate = caver.klay.accounts.createAccountForUpdate(address, key)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.roleTransactionKey.legacyKey).to.be.true
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey).to.be.undefined
            expect(accountForUpdate.keyForUpdate.roleFeePayerKey.failKey).to.be.true
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })

    context(
        'CAVERJS-UNIT-WALLET-349: input: address and key object which has transactionKey(legacyKey), updateKey(multiSigKey) and feePayerKey(failKey)',
        () => {
            it('should return AccountForUpdate', () => {
                const { address } = caver.klay.accounts.create()
                const updateKey = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
                const updatePublicKey = [
                    caver.klay.accounts.privateKeyToPublicKey(updateKey[0]),
                    caver.klay.accounts.privateKeyToPublicKey(updateKey[1]),
                ]
                const key = { transactionKey: 'legacyKey', updateKey, feePayerKey: 'failKey' }
                const options = { updateKey: { threshold: 2, weight: [1, 1] } }

                const accountForUpdate = caver.klay.accounts.createAccountForUpdate(address, key, options)

                expect(accountForUpdate.address).to.equals(address)
                expect(accountForUpdate.keyForUpdate.roleTransactionKey.legacyKey).to.be.true
                expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.threshold).to.equals(options.updateKey.threshold)
                expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys.length).to.equals(updateKey.length)
                expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys[0].publicKey).to.equals(updatePublicKey[0])
                expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys[1].publicKey).to.equals(updatePublicKey[1])
                expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys[0].weight).to.equals(options.updateKey.weight[0])
                expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys[1].weight).to.equals(options.updateKey.weight[1])
                expect(accountForUpdate.keyForUpdate.roleFeePayerKey.failKey).to.be.true
                expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
            })
        }
    )

    context('CAVERJS-UNIT-WALLET-350: input: address and key object which has legacyKey and failKey with options', () => {
        it('should throw error', () => {
            const { address } = caver.klay.accounts.create()
            const key = { transactionKey: 'legacyKey', feePayerKey: 'failKey' }
            const options = { transactionKey: { threshold: 2, weight: [1, 1, 1, 1] } }

            const expectedError = 'Failed to keyFormatter for AccountForUpdate: AccountKeyPublic/legacyKey/failKey cannot have options'

            expect(() => caver.klay.accounts.createAccountForUpdate(address, key, options)).to.throws(expectedError)
        })
    })
})

describe('caver.klay.accounts.createAccountForUpdateWithPublicKey', () => {
    context('CAVERJS-UNIT-WALLET-217: input: address and public key string', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = caver.klay.accounts.create().privateKey
            const publicKey = caver.klay.accounts.privateKeyToPublicKey(key)

            const accountForUpdate = caver.klay.accounts.createAccountForUpdateWithPublicKey(address, publicKey)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.publicKey).to.equals(publicKey)
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-218: input: address and array of public key string', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const options = { threshold: 2, weight: [1, 1] }
            const publicKey = [caver.klay.accounts.privateKeyToPublicKey(key[0]), caver.klay.accounts.privateKeyToPublicKey(key[1])]

            const accountForUpdate = caver.klay.accounts.createAccountForUpdateWithPublicKey(address, publicKey, options)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.multisig.threshold).to.equals(options.threshold)
            expect(accountForUpdate.keyForUpdate.multisig.keys[0].weight).to.equals(options.weight[0])
            expect(accountForUpdate.keyForUpdate.multisig.keys[0].publicKey).to.equals(publicKey[0])
            expect(accountForUpdate.keyForUpdate.multisig.keys[1].weight).to.equals(options.weight[1])
            expect(accountForUpdate.keyForUpdate.multisig.keys[1].publicKey).to.equals(publicKey[1])
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-219: input: address and object of public key', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: caver.klay.accounts.create().privateKey,
            }

            const options = { updateKey: { threshold: 2, weight: [1, 1] } }
            const publicKey = {
                transactionKey: caver.klay.accounts.privateKeyToPublicKey(key.transactionKey),
                updateKey: [
                    caver.klay.accounts.privateKeyToPublicKey(key.updateKey[0]),
                    caver.klay.accounts.privateKeyToPublicKey(key.updateKey[1]),
                ],
                feePayerKey: caver.klay.accounts.privateKeyToPublicKey(key.feePayerKey),
            }

            const accountForUpdate = caver.klay.accounts.createAccountForUpdateWithPublicKey(address, publicKey, options)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.roleTransactionKey.publicKey).to.equals(publicKey.transactionKey)
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.threshold).to.equals(options.updateKey.threshold)
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys[0].weight).to.equals(options.updateKey.weight[0])
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys[0].publicKey).to.equals(publicKey.updateKey[0])
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys[1].weight).to.equals(options.updateKey.weight[1])
            expect(accountForUpdate.keyForUpdate.roleAccountUpdateKey.multisig.keys[1].publicKey).to.equals(publicKey.updateKey[1])
            expect(accountForUpdate.keyForUpdate.roleFeePayerKey.publicKey).to.equals(publicKey.feePayerKey)
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })

    context('CAVERJS-UNIT-WALLET-220: input: address and object of public key with invalid role', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: caver.klay.accounts.create().privateKey,
            }

            const options = { updateKey: { threshold: 2, weight: [1, 1] } }
            const publicKey = {
                invalidRoleKey: caver.klay.accounts.privateKeyToPublicKey(key.transactionKey),
                updateKey: [
                    caver.klay.accounts.privateKeyToPublicKey(key.updateKey[0]),
                    caver.klay.accounts.privateKeyToPublicKey(key.updateKey[1]),
                ],
                feePayerKey: caver.klay.accounts.privateKeyToPublicKey(key.feePayerKey),
            }

            const expectedError = 'Invalid role is defined: invalidRoleKey'

            expect(() => caver.klay.accounts.createAccountForUpdateWithPublicKey(address, publicKey, options)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-221: input: address and array of public key string without options', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const publicKey = [caver.klay.accounts.privateKeyToPublicKey(key[0]), caver.klay.accounts.privateKeyToPublicKey(key[1])]

            const expectedError = 'For AccountKeyMultiSig, threshold and weight should be defined in options object.'

            expect(() => caver.klay.accounts.createAccountForUpdateWithPublicKey(address, publicKey)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-222: input: address and object of public key string without options', () => {
        it('should return AccountForUpdate', () => {
            const { address } = caver.klay.accounts.create()
            const key = { updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey] }
            const publicKey = [
                caver.klay.accounts.privateKeyToPublicKey(key.updateKey[0]),
                caver.klay.accounts.privateKeyToPublicKey(key.updateKey[1]),
            ]

            const expectedError = 'For AccountKeyMultiSig, threshold and weight should be defined in options object.'

            expect(() => caver.klay.accounts.createAccountForUpdateWithPublicKey(address, publicKey)).to.throws(expectedError)
        })
    })
})

describe('caver.klay.accounts.createAccountForUpdateWithLegacyKey', () => {
    context('CAVERJS-UNIT-WALLET-223: input: address', () => {
        it('should return AccountForUpdate with legacy key setting', () => {
            const { address } = caver.klay.accounts.create()

            const accountForUpdate = caver.klay.accounts.createAccountForUpdateWithLegacyKey(address)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.legacyKey).to.be.true
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })
})

describe('caver.klay.accounts.createAccountForUpdateWithFailKey', () => {
    context('CAVERJS-UNIT-WALLET-224: input: address', () => {
        it('should return AccountForUpdate with fail key setting', () => {
            const { address } = caver.klay.accounts.create()

            const accountForUpdate = caver.klay.accounts.createAccountForUpdateWithFailKey(address)

            expect(accountForUpdate.address).to.equals(address)
            expect(accountForUpdate.keyForUpdate.failKey).to.be.true
            expect(typeof accountForUpdate.fillUpdateObject).to.equals('function')
        })
    })
})

describe('caver.klay.accounts.signTransactionWithHash', () => {
    let account
    let legacyTx
    let vtTx
    let legacyHash
    let vtHash

    function hashTx(txObj) {
        const rlpEncoded = caver.klay.accounts.encodeRLPByTxType(txObj)
        return Hash.keccak256(rlpEncoded)
    }

    beforeEach(function(done) {
        this.timeout(100000)

        account = caver.klay.accounts.create()

        caver.klay.getChainId().then(chainId => {
            chainId = caver.utils.numberToHex(chainId)

            legacyTx = {
                type: 'LEGACY',
                from: account.address,
                to: account.address,
                value: '0x1',
                data: '0x',
                gasPrice: '0x5d21dba00',
                gas: '0xdbba0',
                nonce: '0x1',
                chainId,
            }
            legacyHash = hashTx(legacyTx)

            vtTx = {
                type: 'VALUE_TRANSFER',
                from: account.address,
                to: account.address,
                value: '0x1',
                gasPrice: '0x5d21dba00',
                gas: '0xdbba0',
                nonce: '0x1',
                chainId,
            }
            vtHash = hashTx(vtTx)
            done()
        })
    })

    context('CAVERJS-UNIT-WALLET-418: input: hash, privateKey, chainId, callback', () => {
        it('should return signing result', async () => {
            let callbackCalled = false

            const callback = (err, result) => {
                if (err || !result) assert(false)
                callbackCalled = true
            }

            const sig = await caver.klay.accounts.signTransactionWithHash(legacyHash, account.keys, legacyTx.chainId, callback)

            expect(callbackCalled).to.be.true
            expect(Array.isArray(sig)).to.be.true
            expect(sig.length).to.equals(1)
            expect(sig[0].V).not.to.be.undefined
            expect(sig[0].R).not.to.be.undefined
            expect(sig[0].S).not.to.be.undefined

            let sigFromSignTransaction = await caver.klay.accounts.signTransaction(legacyTx, account.keys)
            sigFromSignTransaction = caver.utils.transformSignaturesToObject(sigFromSignTransaction.signatures)

            expect(sig[0].V).to.equals(sigFromSignTransaction.V)
            expect(sig[0].R).to.equals(sigFromSignTransaction.R)
            expect(sig[0].S).to.equals(sigFromSignTransaction.S)
        })
    })

    context('CAVERJS-UNIT-WALLET-419: input: hash, privateKeys, chainId, callback', () => {
        it('should return signing result', async () => {
            let callbackCalled = false

            const callback = (err, result) => {
                if (err || !result) assert(false)
                callbackCalled = true
            }

            const privateKeys = [caver.klay.accounts.create().keys, account.keys]

            const sig = await caver.klay.accounts.signTransactionWithHash(vtHash, privateKeys, vtTx.chainId, callback)

            expect(callbackCalled).to.be.true
            expect(Array.isArray(sig)).to.be.true
            expect(sig.length).to.equals(2)
            expect(sig[0].V).not.to.be.undefined
            expect(sig[0].R).not.to.be.undefined
            expect(sig[0].S).not.to.be.undefined
            expect(sig[1].V).not.to.be.undefined
            expect(sig[1].R).not.to.be.undefined
            expect(sig[1].S).not.to.be.undefined

            let sigFromSignTransaction = await caver.klay.accounts.signTransaction(vtTx, privateKeys)
            sigFromSignTransaction = caver.utils.transformSignaturesToObject(sigFromSignTransaction.signatures)

            expect(sig[0].V).to.equals(sigFromSignTransaction[0].V)
            expect(sig[0].R).to.equals(sigFromSignTransaction[0].R)
            expect(sig[0].S).to.equals(sigFromSignTransaction[0].S)
            expect(sig[1].V).to.equals(sigFromSignTransaction[1].V)
            expect(sig[1].R).to.equals(sigFromSignTransaction[1].R)
            expect(sig[1].S).to.equals(sigFromSignTransaction[1].S)
        })
    })

    context('CAVERJS-UNIT-WALLET-420: input: hash, privateKey, chainId', () => {
        it('should return signing result', async () => {
            const sig = await caver.klay.accounts.signTransactionWithHash(legacyHash, account.keys, legacyTx.chainId)

            expect(Array.isArray(sig)).to.be.true
            expect(sig.length).to.equals(1)
            expect(sig[0].V).not.to.be.undefined
            expect(sig[0].R).not.to.be.undefined
            expect(sig[0].S).not.to.be.undefined

            let sigFromSignTransaction = await caver.klay.accounts.signTransaction(legacyTx, account.keys)
            sigFromSignTransaction = caver.utils.transformSignaturesToObject(sigFromSignTransaction.signatures)

            expect(sig[0].V).to.equals(sigFromSignTransaction.V)
            expect(sig[0].R).to.equals(sigFromSignTransaction.R)
            expect(sig[0].S).to.equals(sigFromSignTransaction.S)
        })
    })

    context('CAVERJS-UNIT-WALLET-421: input: hash, privateKeys, chainId', () => {
        it('should return signing result', async () => {
            const privateKeys = [caver.klay.accounts.create().keys, account.keys]

            const sig = await caver.klay.accounts.signTransactionWithHash(vtHash, privateKeys, vtTx.chainId)

            expect(Array.isArray(sig)).to.be.true
            expect(sig.length).to.equals(2)
            expect(sig[0].V).not.to.be.undefined
            expect(sig[0].R).not.to.be.undefined
            expect(sig[0].S).not.to.be.undefined
            expect(sig[1].V).not.to.be.undefined
            expect(sig[1].R).not.to.be.undefined
            expect(sig[1].S).not.to.be.undefined

            let sigFromSignTransaction = await caver.klay.accounts.signTransaction(vtTx, privateKeys)
            sigFromSignTransaction = caver.utils.transformSignaturesToObject(sigFromSignTransaction.signatures)

            expect(sig[0].V).to.equals(sigFromSignTransaction[0].V)
            expect(sig[0].R).to.equals(sigFromSignTransaction[0].R)
            expect(sig[0].S).to.equals(sigFromSignTransaction[0].S)
            expect(sig[1].V).to.equals(sigFromSignTransaction[1].V)
            expect(sig[1].R).to.equals(sigFromSignTransaction[1].R)
            expect(sig[1].S).to.equals(sigFromSignTransaction[1].S)
        })
    })

    context('CAVERJS-UNIT-WALLET-422: input: hash, privateKey, different chainId', () => {
        it('should sign with chainId parameter and return signing result', async () => {
            let chainId = caver.utils.hexToNumber(legacyTx.chainId)
            chainId += 1
            const sig = await caver.klay.accounts.signTransactionWithHash(legacyHash, account.keys, chainId)
            const sig2 = await caver.klay.accounts.signTransactionWithHash(legacyHash, account.keys, legacyTx.chainId)

            expect(sig[0].V).not.to.equals(sig2[0].V)
        })
    })

    context('CAVERJS-UNIT-WALLET-423: input: hash, privateKey', () => {
        it('should return signing result', async () => {
            const sig = await caver.klay.accounts.signTransactionWithHash(legacyHash, account.keys)

            expect(Array.isArray(sig)).to.be.true
            expect(sig.length).to.equals(1)
            expect(sig[0].V).not.to.be.undefined
            expect(sig[0].R).not.to.be.undefined
            expect(sig[0].S).not.to.be.undefined

            const tx = { ...legacyTx }
            delete tx.chainId
            let sigFromSignTransaction = await caver.klay.accounts.signTransaction(tx, account.keys)
            sigFromSignTransaction = caver.utils.transformSignaturesToObject(sigFromSignTransaction.signatures)

            expect(sig[0].V).to.equals(sigFromSignTransaction.V)
            expect(sig[0].R).to.equals(sigFromSignTransaction.R)
            expect(sig[0].S).to.equals(sigFromSignTransaction.S)
        })
    })

    context('CAVERJS-UNIT-WALLET-424: input: hash, privateKeys', () => {
        it('should return signing result', async () => {
            const privateKeys = [caver.klay.accounts.create().keys, account.keys]

            const sig = await caver.klay.accounts.signTransactionWithHash(vtHash, privateKeys)

            expect(Array.isArray(sig)).to.be.true
            expect(sig.length).to.equals(2)
            expect(sig[0].V).not.to.be.undefined
            expect(sig[0].R).not.to.be.undefined
            expect(sig[0].S).not.to.be.undefined
            expect(sig[1].V).not.to.be.undefined
            expect(sig[1].R).not.to.be.undefined
            expect(sig[1].S).not.to.be.undefined

            const tx = { ...vtTx }
            delete tx.chainId
            let sigFromSignTransaction = await caver.klay.accounts.signTransaction(tx, privateKeys)
            sigFromSignTransaction = caver.utils.transformSignaturesToObject(sigFromSignTransaction.signatures)

            expect(sig[0].V).to.equals(sigFromSignTransaction[0].V)
            expect(sig[0].R).to.equals(sigFromSignTransaction[0].R)
            expect(sig[0].S).to.equals(sigFromSignTransaction[0].S)
            expect(sig[1].V).to.equals(sigFromSignTransaction[1].V)
            expect(sig[1].R).to.equals(sigFromSignTransaction[1].R)
            expect(sig[1].S).to.equals(sigFromSignTransaction[1].S)
        })
    })

    context('CAVERJS-UNIT-WALLET-425: input: hash', () => {
        it('should throw error when parameters are not enough', async () => {
            const expectedError = 'Invalid parameter: The number of parameters is invalid.'
            await expect(caver.klay.accounts.signTransactionWithHash(vtHash)).to.be.rejectedWith(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-426: input: hash, privateKeys, chainId, callback, one more param', () => {
        it('should throw error when parameters are too many', async () => {
            const expectedError = 'Invalid parameter: The number of parameters is invalid.'
            await expect(
                caver.klay.accounts.signTransactionWithHash(vtHash, account.keys, vtTx.chainId, () => {}, account.keys)
            ).to.be.rejectedWith(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-427: input: invalid hash, private key', () => {
        it('should throw error when hash is not defined', async () => {
            const expectedError = 'Invalid parameter: The hash of transaction must be defined as a parameter.'

            await expect(caver.klay.accounts.signTransactionWithHash(null, account.keys)).to.be.rejectedWith(expectedError)
            await expect(caver.klay.accounts.signTransactionWithHash(undefined, account.keys)).to.be.rejectedWith(expectedError)
            await expect(caver.klay.accounts.signTransactionWithHash('', account.keys)).to.be.rejectedWith(expectedError)
        })

        it('should throw error when hash is not 0x-hex prefixed', async () => {
            const expectedError = 'Invalid parameter: The hash of transaction must be 0x-hex prefixed string format.'

            await expect(caver.klay.accounts.signTransactionWithHash(vtHash.slice(2), account.keys)).to.be.rejectedWith(expectedError)
        })

        it('should throw error when hash is not transaction hash', async () => {
            const expectedError = 'Invalid parameter: The hash of transaction must be 0x-hex prefixed string format.'

            await expect(caver.klay.accounts.signTransactionWithHash('0x', account.keys)).to.be.rejectedWith(expectedError)
            await expect(
                caver.klay.accounts.signTransactionWithHash('0x2dfd75d0112787667907a81fbb50fae056a3c81f', account.keys)
            ).to.be.rejectedWith(expectedError)
        })

        it('should throw error when hash is not hex prefixed string', async () => {
            const expectedError = 'Invalid parameter: The hash of transaction must be 0x-hex prefixed string format.'

            await expect(caver.klay.accounts.signTransactionWithHash(1, account.keys)).to.be.rejectedWith(expectedError)
            await expect(caver.klay.accounts.signTransactionWithHash(vtTx, account.keys)).to.be.rejectedWith(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-428: input: hash, invalid private key', () => {
        it('should throw error when private key is invalid', async () => {
            const expectedError = 'Invalid parameter: The private key should be a private key string or an array of private keys.'

            await expect(caver.klay.accounts.signTransactionWithHash(vtHash, 1)).to.be.rejectedWith(expectedError)
            await expect(caver.klay.accounts.signTransactionWithHash(vtHash, null)).to.be.rejectedWith(expectedError)
            await expect(caver.klay.accounts.signTransactionWithHash(vtHash, undefined)).to.be.rejectedWith(expectedError)
            await expect(caver.klay.accounts.signTransactionWithHash(vtHash, {})).to.be.rejectedWith(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-429: input: hash, private key, invalid chainId, callback', () => {
        it('should throw error when chainId is invalid', async () => {
            const expectedError = 'Invalid parameter: The parameter for the chain id is invalid.'

            await expect(caver.klay.accounts.signTransactionWithHash(vtHash, account.keys, {}, () => {})).to.be.rejectedWith(expectedError)
            await expect(caver.klay.accounts.signTransactionWithHash(vtHash, account.keys, [], () => {})).to.be.rejectedWith(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-430: input: hash, invalid private key chainId, callback', () => {
        it('should throw error when error is occured during paring', async () => {
            let privateKey = caver.utils.randomHex(31)
            let expectedError = `Invalid private key(${privateKey.slice(2)})`

            await expect(caver.klay.accounts.signTransactionWithHash(vtHash, privateKey, vtTx.chainId, () => {})).to.be.rejectedWith(
                expectedError
            )

            privateKey = '1234'
            expectedError = `Invalid private key(${privateKey})`
            await expect(caver.klay.accounts.signTransactionWithHash(vtHash, privateKey, vtTx.chainId, () => {})).to.be.rejectedWith(
                expectedError
            )

            privateKey = 'zzzz'
            expectedError = `Invalid private key(${privateKey})`
            await expect(caver.klay.accounts.signTransactionWithHash(vtHash, privateKey, vtTx.chainId, () => {})).to.be.rejectedWith(
                expectedError
            )
        })

        it('should throw error when isValidPrivateKey is false', async () => {
            let privateKey = '0x0000000000000000000000000000000000000000000000000000000000000000'
            let expectedError = `Failed to sign transaction with hash: Invalid private key ${privateKey}`
            await expect(caver.klay.accounts.signTransactionWithHash(vtHash, privateKey, vtTx.chainId, () => {})).to.be.rejectedWith(
                expectedError
            )

            privateKey = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'
            expectedError = `Failed to sign transaction with hash: Invalid private key ${privateKey}`
            await expect(caver.klay.accounts.signTransactionWithHash(vtHash, privateKey, vtTx.chainId, () => {})).to.be.rejectedWith(
                expectedError
            )
        })
    })
})

describe('caver.klay.accounts.wallet', () => {
    it('CAVERJS-UNIT-WALLET-043 : should return valid wallet instance', () => {
        const result = caver.klay.accounts.wallet
        isWallet(result)

        const accounts = []
        const accountCount = Math.floor(Math.random() * 10) + 1
        for (let i = 0; i < accountCount; i++) {
            const account = caver.klay.accounts.create()
            accounts.push(account)
            caver.klay.accounts.wallet.add(account)
        }

        isWallet(result, { accounts })
    })
})

describe('caver.klay.accounts.wallet.create', () => {
    const validateCheckForWalletCreation = (result, numberOfAccounts) => {
        isWallet(result)
        expect(result.length).to.equal(numberOfAccounts)
        for (let i = 0; i < result.length; i++) {
            const accountByIndex = caver.klay.accounts.createWithAccountKey(result[i].address, result[i].accountKey)
            const accountByAddress = caver.klay.accounts.createWithAccountKey(
                result[accountByIndex.address].address,
                result[accountByIndex.address].accountKey
            )

            isAccount(accountByIndex, { keys: accountByAddress.keys, address: accountByAddress.address })
            isAccount(accountByAddress, { keys: accountByIndex.keys, address: accountByIndex.address })
        }
    }

    context('CAVERJS-UNIT-WALLET-044 : input: numberOfAccounts', () => {
        it('should return valid wallet instance', () => {
            const numberOfAccounts = Math.floor(Math.random() * 5) + 1
            const result = caver.klay.accounts.wallet.create(numberOfAccounts)
            validateCheckForWalletCreation(result, numberOfAccounts)
        })
    })

    context('CAVERJS-UNIT-WALLET-045 : input: numberOfAccounts:invalid', () => {
        it('should return 0 wallet', () => {
            const invalid = -1
            const result = caver.klay.accounts.wallet.create(invalid)
            validateCheckForWalletCreation(result, 0)
        })
    })

    context('CAVERJS-UNIT-WALLET-046 : input: numberOfAccounts, entropy', () => {
        it('should return valid wallet instance', () => {
            const numberOfAccounts = Math.floor(Math.random() * 5) + 1
            const entropy = caver.utils.randomHex(32)

            const result = caver.klay.accounts.wallet.create(numberOfAccounts, entropy)
            validateCheckForWalletCreation(result, numberOfAccounts)
        })
    })
})

describe('caver.klay.accounts.wallet.add', () => {
    const validateCheckForWalletAddition = (data, { account, wallet }) => {
        const accounts = []

        accounts.push(caver.klay.accounts.createWithAccountKey(data.address, data.accountKey))
        accounts.push(caver.klay.accounts.createWithAccountKey(wallet[data.index].address, wallet[data.index].accountKey))
        accounts.push(caver.klay.accounts.createWithAccountKey(wallet[data.address].address, wallet[data.address].accountKey))

        for (let i = 0; i < accounts.length; i++) {
            const acc = accounts[i]
            isAccount(acc, { keys: account.keys, address: account.address })
        }
    }

    context('CAVERJS-UNIT-WALLET-047 : input: account', () => {
        it('should have valid wallet instance after addition', () => {
            const account = caver.klay.accounts.create()
            const result = caver.klay.accounts.wallet.add(account)

            validateCheckForWalletAddition(result, { account, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-048 : input: privateKey', () => {
        it('should have valid wallet instance after addition', () => {
            const account = caver.klay.accounts.create()
            const result = caver.klay.accounts.wallet.add(account.privateKey)

            validateCheckForWalletAddition(result, { account, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-052 : input: KlaytnWalletKey', () => {
        it('should have valid wallet instance after addition', () => {
            // KlaytnWalletkey with nonHumanReadableAddress
            let klaytnWalletKey =
                '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
            let account = caver.klay.accounts.privateKeyToAccount(klaytnWalletKey)
            let result = caver.klay.accounts.wallet.add(klaytnWalletKey)

            validateCheckForWalletAddition(result, { account, wallet: caver.klay.accounts.wallet })

            // KlaytnWalletkey with nonHumanReadableAddress (decoupled)
            klaytnWalletKey =
                '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000x34ef488daef1da6fcc3470be0a5351dc223e20d0'
            account = caver.klay.accounts.privateKeyToAccount(klaytnWalletKey)
            result = caver.klay.accounts.wallet.add(klaytnWalletKey)

            validateCheckForWalletAddition(result, { account, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-050, CAVERJS-UNIT-WALLET-051 : input: privateKey, address', () => {
        it('should have valid wallet instance after addition', () => {
            let account = caver.klay.accounts.create()
            let result = caver.klay.accounts.wallet.add(account.privateKey, account.address)

            validateCheckForWalletAddition(result, { account, wallet: caver.klay.accounts.wallet })

            account = caver.klay.accounts.create()
            let address = '0xc98e2616b445d0b7ff2bcc45adc554ebbf5fd576'
            account.address = address
            result = caver.klay.accounts.wallet.add(account.privateKey, address)

            validateCheckForWalletAddition(result, { account, wallet: caver.klay.accounts.wallet })

            account = caver.klay.accounts.create()
            address = '0x6a61736d696e652e6b6c6179746e000000000000'
            account.address = address
            result = caver.klay.accounts.wallet.add(account.privateKey, address)

            validateCheckForWalletAddition(result, { account, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-053 CAVERJS-UNIT-WALLET-054 : input: KlaytnWalletKey, address', () => {
        it('should have valid wallet instance after addition', () => {
            let klaytnWalletKey =
                '0xc1ad21b3da99cbb6a57cf181ec3e36af77ae37112585f700c81db19115f74b110x000xc4f88823f5030e4343c1494b502d534e9f15152d'
            let account = caver.klay.accounts.privateKeyToAccount(klaytnWalletKey)
            let result = caver.klay.accounts.wallet.add(klaytnWalletKey, account.address)

            validateCheckForWalletAddition(result, { account, wallet: caver.klay.accounts.wallet })

            // decoupled
            klaytnWalletKey =
                '0xc1ad21b3da99cbb6a57cf181ec3e36af77ae37112585f700c81db19115f74b110x000x95e024d64534948a89748d4c3e82e02d05721beb'
            account = caver.klay.accounts.privateKeyToAccount(klaytnWalletKey)
            result = caver.klay.accounts.wallet.add(klaytnWalletKey, account.address)

            validateCheckForWalletAddition(result, { account, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-055 : input: KlaytnWalletKey, invalid address', () => {
        it('should have valid wallet instance after addition', () => {
            const klaytnWalletKey =
                '0x2d21dc5d73e29177af17a1376f3e5769b94086479735e711670c2d599c3f97ab0x000x53b0e6ebd395093d83ac9b0e1e47b4b31b7c18c4'
            expect(() => caver.klay.accounts.wallet.add(klaytnWalletKey, '0x95e024d64534948a89748d4c3e82e02d05721beb')).to.throw()
        })
    })

    context('CAVERJS-UNIT-WALLET-056 : input: invalid KlaytnWalletKey', () => {
        it('should have valid wallet instance after addition', () => {
            const klaytnWalletKey =
                '0x39d87f15c695ec94d6d7107b48dee85e252f21fedd371e1c6badc4afa71efbdf0x010x167bcdef96658b7b7a94ac398a8e7275e719a10c'
            expect(() => caver.klay.accounts.wallet.add(klaytnWalletKey)).to.throw()
        })
    })

    context('CAVERJS-UNIT-WALLET-049 : input: account:invalid', () => {
        it('should throw an error', () => {
            const invalid = -1
            const errorMessage = 'Invalid accountKey type: number'
            expect(() => caver.klay.accounts.wallet.add(invalid)).to.throw(errorMessage)
        })
    })

    context('CAVERJS-UNIT-WALLET-244: input: userInputAddress and AccountKeyPublic', () => {
        it('should have valid Account instance in wallet after addition', () => {
            const key = caver.klay.accounts.create().privateKey
            const { address } = caver.klay.accounts.create()
            const accountKeyPublic = caver.klay.accounts.createAccountKeyPublic(key)
            const accountWithPublic = caver.klay.accounts.createWithAccountKey(address, accountKeyPublic)

            const accountInWallet = caver.klay.accounts.wallet.add(accountKeyPublic, address)
            validateCheckForWalletAddition(accountInWallet, { account: accountWithPublic, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-245: input: userInputAddress and AccountKeyMultiSig', () => {
        it('should have valid Account instance in wallet after addition', () => {
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const { address } = caver.klay.accounts.create()
            const accountKeyMultiSig = caver.klay.accounts.createAccountKeyMultiSig(key)
            const accountWithMultiSig = caver.klay.accounts.createWithAccountKey(address, accountKeyMultiSig)

            const accountInWallet = caver.klay.accounts.wallet.add(accountKeyMultiSig, address)
            validateCheckForWalletAddition(accountInWallet, { account: accountWithMultiSig, wallet: caver.klay.accounts.wallet })
        })
    })

    context(
        'CAVERJS-UNIT-WALLET-246: input: userInputAddress and AccountKeyRoleBased which defines transactionKey, updateKey and feePayerKey',
        () => {
            it('should have valid Account instance in wallet after addition', () => {
                const key = {
                    transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                    updateKey: caver.klay.accounts.create().privateKey,
                    feePayerKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                }
                const { address } = caver.klay.accounts.create()
                const accountKeyRoleBased = caver.klay.accounts.createAccountKeyRoleBased(key)
                const accountWithRoleBased = caver.klay.accounts.createWithAccountKey(address, accountKeyRoleBased)

                const accountInWallet = caver.klay.accounts.wallet.add(accountKeyRoleBased, address)
                validateCheckForWalletAddition(accountInWallet, { account: accountWithRoleBased, wallet: caver.klay.accounts.wallet })
            })
        }
    )

    context('CAVERJS-UNIT-WALLET-247: input: userInputAddress and AccountKeyRoleBased which defines transactionKey only', () => {
        it('should have valid Account instance in wallet after addition', () => {
            const key = {
                transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
            }
            const { address } = caver.klay.accounts.create()
            const accountKeyRoleBased = caver.klay.accounts.createAccountKeyRoleBased(key)
            const accountWithRoleBased = caver.klay.accounts.createWithAccountKey(address, accountKeyRoleBased)

            const accountInWallet = caver.klay.accounts.wallet.add(accountKeyRoleBased, address)
            validateCheckForWalletAddition(accountInWallet, { account: accountWithRoleBased, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-248: input: userInputAddress and AccountKeyRoleBased which defines updateKey only', () => {
        it('should have valid Account instance in wallet after addition', () => {
            const key = {
                updateKey: caver.klay.accounts.create().privateKey,
            }
            const { address } = caver.klay.accounts.create()
            const accountKeyRoleBased = caver.klay.accounts.createAccountKeyRoleBased(key)
            const accountWithRoleBased = caver.klay.accounts.createWithAccountKey(address, accountKeyRoleBased)

            const accountInWallet = caver.klay.accounts.wallet.add(accountKeyRoleBased, address)
            validateCheckForWalletAddition(accountInWallet, { account: accountWithRoleBased, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-249: input: userInputAddress and AccountKeyRoleBased which defines feePayerKey only', () => {
        it('should have valid Account instance in wallet after addition', () => {
            const key = {
                feePayerKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
            }
            const { address } = caver.klay.accounts.create()
            const accountKeyRoleBased = caver.klay.accounts.createAccountKeyRoleBased(key)
            const accountWithRoleBased = caver.klay.accounts.createWithAccountKey(address, accountKeyRoleBased)

            const accountInWallet = caver.klay.accounts.wallet.add(accountKeyRoleBased, address)
            validateCheckForWalletAddition(accountInWallet, { account: accountWithRoleBased, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-250: input: AccountKeyPublic without userInputAddress', () => {
        it('should throw error', () => {
            const accountKey = caver.klay.accounts.createAccountKey(caver.klay.accounts.create().privateKey)

            const expectedError = 'Address is not defined. Address cannot be determined from AccountKey'
            expect(() => caver.klay.accounts.wallet.add(accountKey)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-251: input: AccountKeyMultiSig without userInputAddress', () => {
        it('should throw error', () => {
            const accountKey = caver.klay.accounts.createAccountKey([
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
            ])

            const expectedError = 'Address is not defined. Address cannot be determined from AccountKey'
            expect(() => caver.klay.accounts.wallet.add(accountKey)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-252: input: AccountKeyRoleBased without userInputAddress', () => {
        it('should throw error', () => {
            const accountKey = caver.klay.accounts.createAccountKey({ transactionKey: caver.klay.accounts.create().privateKey })

            const expectedError = 'Address is not defined. Address cannot be determined from AccountKey'
            expect(() => caver.klay.accounts.wallet.add(accountKey)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-253: input: Account with AccountKeyPublic', () => {
        it('should have valid Account instance in wallet after addition', () => {
            const key = caver.klay.accounts.create().privateKey
            const { address } = caver.klay.accounts.create()
            const accountWithPublic = caver.klay.accounts.createWithAccountKey(address, key)

            const accountInWallet = caver.klay.accounts.wallet.add(accountWithPublic)
            validateCheckForWalletAddition(accountInWallet, { account: accountWithPublic, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-254: input: Account with AccountKeyMultiSig', () => {
        it('should have valid Account instance in wallet after addition', () => {
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const { address } = caver.klay.accounts.create()
            const accountWithMultiSig = caver.klay.accounts.createWithAccountKey(address, key)

            const accountInWallet = caver.klay.accounts.wallet.add(accountWithMultiSig)
            validateCheckForWalletAddition(accountInWallet, { account: accountWithMultiSig, wallet: caver.klay.accounts.wallet })
        })
    })

    context(
        'CAVERJS-UNIT-WALLET-255: input: Account with AccountKeyRoleBased which defines transactionKey, updateKey and feePayerKey',
        () => {
            it('should have valid Account instance in wallet after addition', () => {
                const key = {
                    transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                    updateKey: caver.klay.accounts.create().privateKey,
                    feePayerKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                }
                const { address } = caver.klay.accounts.create()
                const accountWithRoleBased = caver.klay.accounts.createWithAccountKey(address, key)

                const accountInWallet = caver.klay.accounts.wallet.add(accountWithRoleBased)
                validateCheckForWalletAddition(accountInWallet, { account: accountWithRoleBased, wallet: caver.klay.accounts.wallet })
            })
        }
    )

    context('CAVERJS-UNIT-WALLET-256: input: Account with AccountKeyRoleBased which defines transactionKey only', () => {
        it('should have valid Account instance in wallet after addition', () => {
            const key = {
                transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
            }
            const { address } = caver.klay.accounts.create()
            const accountWithRoleBased = caver.klay.accounts.createWithAccountKey(address, key)

            const accountInWallet = caver.klay.accounts.wallet.add(accountWithRoleBased)
            validateCheckForWalletAddition(accountInWallet, { account: accountWithRoleBased, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-257: input: Account with AccountKeyRoleBased which defines updateKey only', () => {
        it('should have valid Account instance in wallet after addition', () => {
            const key = {
                updateKey: caver.klay.accounts.create().privateKey,
            }
            const { address } = caver.klay.accounts.create()
            const accountWithRoleBased = caver.klay.accounts.createWithAccountKey(address, key)

            const accountInWallet = caver.klay.accounts.wallet.add(accountWithRoleBased)
            validateCheckForWalletAddition(accountInWallet, { account: accountWithRoleBased, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-258: input: Account with AccountKeyRoleBased which defines feePayerKey only', () => {
        it('should have valid Account instance in wallet after addition', () => {
            const key = {
                feePayerKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
            }
            const { address } = caver.klay.accounts.create()
            const accountWithRoleBased = caver.klay.accounts.createWithAccountKey(address, key)

            const accountInWallet = caver.klay.accounts.wallet.add(accountWithRoleBased)
            validateCheckForWalletAddition(accountInWallet, { account: accountWithRoleBased, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-259: input: Account with AccountKeyPublic and userInputAddress', () => {
        it('should have valid Account instance with userInputAddress as an address in wallet after addition', () => {
            const key = caver.klay.accounts.create().privateKey
            const { address } = caver.klay.accounts.create()
            const accountWithPublic = caver.klay.accounts.createWithAccountKey(address, key)
            const userInputAddrees = caver.klay.accounts.create().address

            const accountInWallet = caver.klay.accounts.wallet.add(accountWithPublic, userInputAddrees)
            accountWithPublic.address = userInputAddrees

            validateCheckForWalletAddition(accountInWallet, { account: accountWithPublic, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-260: input: object which has address and privateKey', () => {
        it('should have valid Account instance in wallet after addition', () => {
            const key = caver.klay.accounts.create().privateKey
            const { address } = caver.klay.accounts.create()
            const accountWithPublic = caver.klay.accounts.createWithAccountKey(address, key)

            const inputObject = {
                address: accountWithPublic.address,
                privateKey: accountWithPublic.privateKey,
            }

            const accountInWallet = caver.klay.accounts.wallet.add(inputObject)

            validateCheckForWalletAddition(accountInWallet, { account: accountWithPublic, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-261: input: userInputAddress and object which has address and privateKey', () => {
        it('should have valid Account instance with userInputAddress as an address in wallet after addition', () => {
            const key = caver.klay.accounts.create().privateKey
            const { address } = caver.klay.accounts.create()
            const accountWithPublic = caver.klay.accounts.createWithAccountKey(address, key)
            const userInputAddrees = caver.klay.accounts.create().address

            const inputObject = {
                address: accountWithPublic.address,
                privateKey: accountWithPublic.privateKey,
            }

            const accountInWallet = caver.klay.accounts.wallet.add(inputObject, userInputAddrees)
            accountWithPublic.address = userInputAddrees

            validateCheckForWalletAddition(accountInWallet, { account: accountWithPublic, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-262: input: userInputAddress and array of private key string', () => {
        it('should have valid Account instance with userInputAddress as an address in wallet after addition', () => {
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const { address } = caver.klay.accounts.create()
            const account = caver.klay.accounts.createWithAccountKey(address, key)

            const accountInWallet = caver.klay.accounts.wallet.add(key, address)

            validateCheckForWalletAddition(accountInWallet, { account, wallet: caver.klay.accounts.wallet })
        })
    })

    context(
        'CAVERJS-UNIT-WALLET-263: input: userInputAddress and key object which defines transactionKey, updateKey and feePayerKey',
        () => {
            it('should have valid Account instance with userInputAddress as an address in wallet after addition', () => {
                const key = {
                    transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                    updateKey: caver.klay.accounts.create().privateKey,
                    feePayerKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                }
                const { address } = caver.klay.accounts.create()
                const account = caver.klay.accounts.createWithAccountKey(address, key)

                const accountInWallet = caver.klay.accounts.wallet.add(key, address)

                validateCheckForWalletAddition(accountInWallet, { account, wallet: caver.klay.accounts.wallet })
            })
        }
    )

    context('CAVERJS-UNIT-WALLET-264: input: userInputAddress and key object which defines transactionKey only', () => {
        it('should have valid Account instance with userInputAddress as an address in wallet after addition', () => {
            const key = {
                transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
            }
            const { address } = caver.klay.accounts.create()
            const account = caver.klay.accounts.createWithAccountKey(address, key)

            const accountInWallet = caver.klay.accounts.wallet.add(key, address)

            validateCheckForWalletAddition(accountInWallet, { account, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-265: input: userInputAddress and key object which defines updateKey only', () => {
        it('should have valid Account instance with userInputAddress as an address in wallet after addition', () => {
            const key = {
                updateKey: caver.klay.accounts.create().privateKey,
            }
            const { address } = caver.klay.accounts.create()
            const account = caver.klay.accounts.createWithAccountKey(address, key)

            const accountInWallet = caver.klay.accounts.wallet.add(key, address)

            validateCheckForWalletAddition(accountInWallet, { account, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-266: input: userInputAddress and key object which defines feePayerKey only', () => {
        it('should have valid Account instance with userInputAddress as an address in wallet after addition', () => {
            const key = {
                feePayerKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
            }
            const { address } = caver.klay.accounts.create()
            const account = caver.klay.accounts.createWithAccountKey(address, key)

            const accountInWallet = caver.klay.accounts.wallet.add(key, address)

            validateCheckForWalletAddition(accountInWallet, { account, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-267: input: invalid type parameter', () => {
        it('should throw error', () => {
            let invalid = {}

            let expectedError = 'Failed to create AccountKeyRoleBased: empty object'
            expect(() => caver.klay.accounts.wallet.add(invalid)).to.throws(expectedError)

            invalid = undefined
            expectedError = `Invalid accountKey type: ${typeof invalid}`
            expect(() => caver.klay.accounts.wallet.add(invalid)).to.throws(expectedError)

            invalid = null
            expectedError = `Invalid accountKey type: ${typeof invalid}`
            expect(() => caver.klay.accounts.wallet.add(invalid)).to.throws(expectedError)

            invalid = 1
            expectedError = `Invalid accountKey type: ${typeof invalid}`
            expect(() => caver.klay.accounts.wallet.add(invalid)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-268: input: invalid role defined', () => {
        it('should throw error', () => {
            const invalid = { invalidRole: caver.klay.accounts.create().privateKey }

            const expectedError = 'Failed to create AccountKeyRoleBased. Invalid role is defined : invalidRole'
            expect(() => caver.klay.accounts.wallet.add(invalid)).to.throws(expectedError)
        })
    })
})

describe('caver.klay.accounts.wallet.remove', () => {
    const validateCheckForWalletRemove = (data, { expected = true, account, wallet }) => {
        expect(data).to.equal(expected)

        if (data) {
            expect(typeof wallet[account.address]).to.equal('undefined')
        }
    }

    context('CAVERJS-UNIT-WALLET-057, CAVERJS-UNIT-WALLET-058, CAVERJS-UNIT-WALLET-059 : input: account', () => {
        it('should remove wallet instance', () => {
            const numberOfAccounts = Math.floor(Math.random() * 5) + 1
            caver.klay.accounts.wallet.create(numberOfAccounts)

            let account = caver.klay.accounts.wallet[Math.floor(Math.random() * numberOfAccounts)]

            let result = caver.klay.accounts.wallet.remove(account.index)
            validateCheckForWalletRemove(result, { account, wallet: caver.klay.accounts.wallet })

            account = caver.klay.accounts.create()
            caver.klay.accounts.wallet.add(account.privateKey)

            result = caver.klay.accounts.wallet.remove(account.address)
            validateCheckForWalletRemove(result, { account, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-060 : input: account:invalid', () => {
        it('should return false for removing invalid wallet instance index', () => {
            const numberOfAccounts = Math.floor(Math.random() * 5) + 1
            caver.klay.accounts.wallet.create(numberOfAccounts)

            let invalid = -1
            let result = caver.klay.accounts.wallet.remove(invalid)
            validateCheckForWalletRemove(result, { expected: false })

            invalid = numberOfAccounts
            result = caver.klay.accounts.wallet.remove(invalid)
            validateCheckForWalletRemove(result, { expected: false })
        })
    })

    context('CAVERJS-UNIT-WALLET-269: input: Account with AccountKeyPublic', () => {
        it('should remove wallet instance', () => {
            const { address } = caver.klay.accounts.create()
            const key = caver.klay.accounts.create().privateKey
            const account = caver.klay.accounts.createWithAccountKey(address, key)
            let accountInWallet = caver.klay.accounts.wallet.add(account)

            let result = caver.klay.accounts.wallet.remove(accountInWallet.index)

            expect(accountInWallet.accountKey).to.be.null
            validateCheckForWalletRemove(result, { account: accountInWallet, wallet: caver.klay.accounts.wallet })

            accountInWallet = caver.klay.accounts.wallet.add(account)

            result = caver.klay.accounts.wallet.remove(accountInWallet.address)

            expect(accountInWallet.accountKey).to.be.null
            validateCheckForWalletRemove(result, { account: accountInWallet, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-270: input: Account with AccountKeyMultiSig', () => {
        it('should remove wallet instance', () => {
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const account = caver.klay.accounts.createWithAccountKey(address, key)
            let accountInWallet = caver.klay.accounts.wallet.add(account)

            let result = caver.klay.accounts.wallet.remove(accountInWallet.index)

            expect(accountInWallet.accountKey).to.be.null
            validateCheckForWalletRemove(result, { account: accountInWallet, wallet: caver.klay.accounts.wallet })

            accountInWallet = caver.klay.accounts.wallet.add(account)

            result = caver.klay.accounts.wallet.remove(accountInWallet.address)

            expect(accountInWallet.accountKey).to.be.null
            validateCheckForWalletRemove(result, { account: accountInWallet, wallet: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-271: input: Account with AccountKeyRoleBased', () => {
        it('should remove wallet instance', () => {
            const { address } = caver.klay.accounts.create()
            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: caver.klay.accounts.create().privateKey,
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            const account = caver.klay.accounts.createWithAccountKey(address, key)
            let accountInWallet = caver.klay.accounts.wallet.add(account)

            let result = caver.klay.accounts.wallet.remove(accountInWallet.index)

            expect(accountInWallet.accountKey).to.be.null
            validateCheckForWalletRemove(result, { account: accountInWallet, wallet: caver.klay.accounts.wallet })

            accountInWallet = caver.klay.accounts.wallet.add(account)

            result = caver.klay.accounts.wallet.remove(accountInWallet.address)

            expect(accountInWallet.accountKey).to.be.null
            validateCheckForWalletRemove(result, { account: accountInWallet, wallet: caver.klay.accounts.wallet })
        })
    })
})

describe('caver.klay.accounts.wallet.clear', () => {
    context('CAVERJS-UNIT-WALLET-061 : input: no parameter', () => {
        it('should clear all wallet instance', () => {
            const numberOfAccounts = Math.floor(Math.random() * 5) + 1
            caver.klay.accounts.wallet.create(numberOfAccounts)

            let result = caver.klay.accounts.wallet.clear()
            isWallet(result)
            expect(result.length).to.equal(0)
            expect(caver.klay.accounts.wallet.length).to.equal(0)

            result = caver.klay.accounts.wallet.clear()
            isWallet(result)
            expect(result.length).to.equal(0)
            expect(caver.klay.accounts.wallet.length).to.equal(0)
        })
    })
})

describe('caver.klay.accounts.wallet.encrypt', () => {
    context('CAVERJS-UNIT-WALLET-062 : input: password', () => {
        it('should encrypted as v4Keystore', () => {
            const password = 'klaytn!@'

            const numberOfAccounts = Math.floor(Math.random() * 5) + 1
            caver.klay.accounts.wallet.create(numberOfAccounts)

            const result = caver.klay.accounts.wallet.encrypt(password)

            expect(result.length).to.equal(caver.klay.accounts.wallet.length)
            result.forEach((v, i) => {
                isKeystore(v, { address: caver.klay.accounts.wallet[i].address })
            })
            const decryptedWallet = caver.klay.accounts.wallet.decrypt(result, password)
            isWallet(decryptedWallet, { accounts: caver.klay.accounts.wallet })
        })
    })

    context('CAVERJS-UNIT-WALLET-272: input: password', () => {
        it('should throw error if there is Account with AccountKeyMultiSig or AccountKeyRoleBased', () => {
            const password = 'klaytn!@'

            // AccountKeyMultiSig
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            caver.klay.accounts.wallet.add(caver.klay.accounts.createWithAccountKey(address, key))

            // AccountKeyRoleBased
            const roleBasedaddress = caver.klay.accounts.create().address
            const roleBasedkey = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: caver.klay.accounts.create().privateKey,
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            caver.klay.accounts.wallet.add(caver.klay.accounts.createWithAccountKey(roleBasedaddress, roleBasedkey))

            const result = caver.klay.accounts.wallet.encrypt(password)

            expect(result.length).to.equal(caver.klay.accounts.wallet.length)
            result.forEach((v, i) => {
                isKeystore(v, { address: caver.klay.accounts.wallet[i].address })
            })
            const decryptedWallet = caver.klay.accounts.wallet.decrypt(result, password)
            isWallet(decryptedWallet, { accounts: caver.klay.accounts.wallet })
        })
    })

    /*
  it('password:invalid [KLAYTN-52]', () => {
	const invalid = ''

	const numberOfAccounts = Math.floor(Math.random() * 5) + 1
	caver.klay.accounts.wallet.create(numberOfAccounts)

	utils.log('input', invalid)

	const expectedError = {
	  name: 'Error',
	  message: ''
	}
	validateErrorCodeblock(() => caver.klay.accounts.wallet.encrypt(invalid), expectedError)
  })
  */
})

describe('caver.klay.accounts.wallet.decrypt', () => {
    context('CAVERJS-UNIT-WALLET-063 : input: keystoreArray, password', () => {
        it('should decrypt v4Keystore to account instance', () => {
            const password = 'klaytn!@'

            const numberOfAccounts = Math.floor(Math.random() * 5) + 1
            caver.klay.accounts.wallet.create(numberOfAccounts)

            // AccountKeyMultiSig
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            caver.klay.accounts.wallet.add(caver.klay.accounts.createWithAccountKey(address, key))

            // AccountKeyRoleBased
            const roleBasedaddress = caver.klay.accounts.create().address
            const roleBasedkey = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: caver.klay.accounts.create().privateKey,
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            caver.klay.accounts.wallet.add(caver.klay.accounts.createWithAccountKey(roleBasedaddress, roleBasedkey))

            const encryptedKeystore = caver.klay.accounts.wallet.encrypt(password)
            caver.klay.accounts.wallet.clear()

            const result = caver.klay.accounts.wallet.decrypt(encryptedKeystore, password)
            isWallet(result, { accounts: caver.klay.accounts.wallet })
        })
    })

    /*
  it('keystoreArray, password:invalid [KLAYTN-52]', () => {
	const invalid = ''

	const numberOfAccounts = Math.floor(Math.random() * 5) + 1
	caver.klay.accounts.wallet.create(numberOfAccounts)

	const encryptedKeystore = caver.klay.accounts.wallet.encrypt(invalid)

	utils.log('input', encryptedKeystore, invalid)

	const expectedError = {
	  name: 'Error',
	  message: ''
	}
	validateErrorCodeblock(() => caver.klay.accounts.wallet.decrypt(encryptedKeystore, invalid), expectedError)
  })
  */
})

describe('caver.klay.accounts.wallet.getAccount', () => {
    context('CAVERJS-UNIT-WALLET-125 : input: number', () => {
        it('should return Account from Wallet', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())

            const fromWallet = caver.klay.accounts.wallet.getAccount(testAccount.index)

            expect(testAccount.address).to.equals(fromWallet.address)
            expect(testAccount.privateKey).to.equals(fromWallet.privateKey)
            expect(testAccount.index).to.equals(fromWallet.index)
        })
    })

    context('CAVERJS-UNIT-WALLET-126 : input: invalid number index', () => {
        it('should throw Error', () => {
            const errorMessage = `The index(${caver.klay.accounts.wallet.length}) is out of range(Wallet length : ${caver.klay.accounts.wallet.length}).`

            expect(() => caver.klay.accounts.wallet.getAccount(caver.klay.accounts.wallet.length)).to.throws(errorMessage)
        })
    })

    context('CAVERJS-UNIT-WALLET-127 : input: invalid parameter type for getAccount', () => {
        it('should throw Error', () => {
            const errorMessage = 'Accounts in the Wallet can be searched by only index or address.'

            expect(() => caver.klay.accounts.wallet.getAccount({})).to.throws(errorMessage)
        })
    })

    context('CAVERJS-UNIT-WALLET-128 : input: invalid address for getAccount', () => {
        it('should throw Error', () => {
            const input = 'address'
            const errorMessage = `Failed to getAccount from Wallet: invalid address(${input})`

            expect(() => caver.klay.accounts.wallet.getAccount(input)).to.throws(errorMessage)
        })
    })

    context('CAVERJS-UNIT-WALLET-129 : input: validAddress', () => {
        it('should return Account from Wallet', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())

            let fromWallet = caver.klay.accounts.wallet.getAccount(testAccount.address)

            expect(testAccount.address).to.equals(fromWallet.address)
            expect(testAccount.privateKey).to.equals(fromWallet.privateKey)
            expect(testAccount.index).to.equals(fromWallet.index)

            fromWallet = caver.klay.accounts.wallet.getAccount(testAccount.address.toLowerCase())

            expect(testAccount.address).to.equals(fromWallet.address)
            expect(testAccount.privateKey).to.equals(fromWallet.privateKey)
            expect(testAccount.index).to.equals(fromWallet.index)

            fromWallet = caver.klay.accounts.wallet.getAccount(testAccount.address.toUpperCase())

            expect(testAccount.address).to.equals(fromWallet.address)
            expect(testAccount.privateKey).to.equals(fromWallet.privateKey)
            expect(testAccount.index).to.equals(fromWallet.index)
        })
    })
})

describe('caver.klay.accounts.wallet.updatePrivateKey', () => {
    context('CAVERJS-UNIT-WALLET-322: input: private key string and address', () => {
        it('should update the private key of account by updating the accountKey', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            const originalPrivateKey = testAccount.privateKey
            const updatePrivateKey = caver.klay.accounts.create().privateKey

            let account = caver.klay.accounts.wallet.getAccount(testAccount.address)
            expect(account.privateKey).to.equals(originalPrivateKey)

            account = caver.klay.accounts.wallet.updatePrivateKey(updatePrivateKey, testAccount.address)
            expect(account.privateKey).to.equals(updatePrivateKey)
        })
    })

    context('CAVERJS-UNIT-WALLET-323: input: KlaytnWalletKey and address', () => {
        it('should update the private key of account by updating the accountKey', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            const originalPrivateKey = testAccount.privateKey
            const updatedAccount = caver.klay.accounts.createWithAccountKey(testAccount.address, caver.klay.accounts.create().privateKey)
            const klaytnWalletKey = updatedAccount.getKlaytnWalletKey()
            const updatedPrivateKey = updatedAccount.privateKey

            let account = caver.klay.accounts.wallet.getAccount(testAccount.address)
            expect(account.privateKey).to.equals(originalPrivateKey)

            account = caver.klay.accounts.wallet.updatePrivateKey(klaytnWalletKey, testAccount.address)
            expect(account.privateKey).to.equals(updatedPrivateKey)
        })
    })

    context('CAVERJS-UNIT-WALLET-324: input: private key or address are undefined', () => {
        it('should throw error', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            const updatePrivateKey = caver.klay.accounts.create().privateKey

            const expectedError = 'To update the privatKey in wallet, need to set both privateKey and address.'

            expect(() => caver.klay.accounts.wallet.updatePrivateKey()).to.throws(expectedError)
            expect(() => caver.klay.accounts.wallet.updatePrivateKey(updatePrivateKey)).to.throws(expectedError)
            expect(() => caver.klay.accounts.wallet.updatePrivateKey(undefined, testAccount.address)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-325: input: invalid type of privateKey', () => {
        it('should throw error', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())

            let invalid = ''
            let expectedError = `Invalid private key(${invalid})`
            expect(() => caver.klay.accounts.wallet.updatePrivateKey(invalid, testAccount.address)).to.throws(expectedError)

            invalid = {}
            expectedError = 'The private key used for the update is not a valid string.'
            expect(() => caver.klay.accounts.wallet.updatePrivateKey(invalid, testAccount.address)).to.throws(expectedError)

            invalid = 1
            expectedError = 'The private key used for the update is not a valid string.'
            expect(() => caver.klay.accounts.wallet.updatePrivateKey(invalid, testAccount.address)).to.throws(expectedError)

            invalid = []
            expectedError = 'The private key used for the update is not a valid string.'
            expect(() => caver.klay.accounts.wallet.updatePrivateKey(invalid, testAccount.address)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-326: input: private key string and address', () => {
        it('should throw error when accountKey in Account is AccountKeyMultiSig', () => {
            const { address } = caver.klay.accounts.create()
            const key = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.createWithAccountKey(address, key))
            const updatePrivateKey = caver.klay.accounts.create().privateKey

            const expectedError =
                'Account using AccountKeyMultiSig or AccountKeyRoleBased must be updated using the caver.klay.accounts.updateAccountKey function.'
            expect(() => caver.klay.accounts.wallet.updatePrivateKey(updatePrivateKey, testAccount.address)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-327: input: private key string and address', () => {
        it('should throw error when accountKey in Account is AccountKeyRoleBased', () => {
            const { address } = caver.klay.accounts.create()
            const key = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: caver.klay.accounts.create().privateKey,
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.createWithAccountKey(address, key))
            const updatePrivateKey = caver.klay.accounts.create().privateKey

            const expectedError =
                'Account using AccountKeyMultiSig or AccountKeyRoleBased must be updated using the caver.klay.accounts.updateAccountKey function.'
            expect(() => caver.klay.accounts.wallet.updatePrivateKey(updatePrivateKey, testAccount.address)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-328: input: invalid private key string and address', () => {
        it('should throw error', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            let invalid = '0x01'

            let expectedError = `Invalid private key(${invalid.slice(2)})`
            expect(() => caver.klay.accounts.wallet.updatePrivateKey(invalid, testAccount.address)).to.throws(expectedError)

            invalid = 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364142'
            expectedError = 'Invalid private key'
            expect(() => caver.klay.accounts.wallet.updatePrivateKey(invalid, testAccount.address)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-329: input: KlaytnWalletKey and address', () => {
        it('should throw error when address from KlaytnWalletKey is not matched with address parameter', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            const updatedAccount = caver.klay.accounts.createWithAccountKey(
                caver.klay.accounts.create().address,
                caver.klay.accounts.create().privateKey
            )
            const klaytnWalletKey = updatedAccount.getKlaytnWalletKey()

            const expectedError = 'The address extracted from the private key does not match the address received as the input value.'
            expect(() => caver.klay.accounts.wallet.updatePrivateKey(klaytnWalletKey, testAccount.address)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-330: input: not existed address of account', () => {
        it('should throw error when account cannot be found with address', () => {
            const notExistAddress = caver.klay.accounts.create().address
            const updatePrivateKey = caver.klay.accounts.create().privateKey

            const expectedError = `Failed to find account with ${notExistAddress}`

            expect(() => caver.klay.accounts.wallet.updatePrivateKey(updatePrivateKey, notExistAddress)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-331: input: invalid address', () => {
        it('should throw error when account cannot be found with address', () => {
            const invalidAddress = 'invalidAddress'
            const updatePrivateKey = caver.klay.accounts.create().privateKey

            const expectedError = `Invalid address : ${invalidAddress}`

            expect(() => caver.klay.accounts.wallet.updatePrivateKey(updatePrivateKey, invalidAddress)).to.throws(expectedError)
        })
    })
})

describe('caver.klay.accounts.wallet.updateAccountKey', () => {
    context('CAVERJS-UNIT-WALLET-332: input: address and private key string', () => {
        it('should update the accountKey', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            const updatePrivateKey = caver.klay.accounts.create().privateKey

            const account = caver.klay.accounts.wallet.updateAccountKey(testAccount.address, updatePrivateKey)
            compareAccountKey(account.accountKey, updatePrivateKey)
        })
    })

    context('CAVERJS-UNIT-WALLET-333: input: address and AccountKeyPublic', () => {
        it('should update the accountKey', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            const updatePrivateKey = caver.klay.accounts.createAccountKeyPublic(caver.klay.accounts.create().privateKey)

            const account = caver.klay.accounts.wallet.updateAccountKey(testAccount.address, updatePrivateKey)
            compareAccountKey(account.accountKey, updatePrivateKey.keys)
        })
    })

    context('CAVERJS-UNIT-WALLET-334: input: address and array of private key string', () => {
        it('should update the accountKey', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            const updatePrivateKey = [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey]

            const account = caver.klay.accounts.wallet.updateAccountKey(testAccount.address, updatePrivateKey)
            compareAccountKey(account.accountKey, updatePrivateKey)
        })
    })

    context('CAVERJS-UNIT-WALLET-335: input: address and AccountKeyMultiSig', () => {
        it('should update the accountKey', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            const updatePrivateKey = caver.klay.accounts.createAccountKeyMultiSig([
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
            ])

            const account = caver.klay.accounts.wallet.updateAccountKey(testAccount.address, updatePrivateKey)
            compareAccountKey(account.accountKey, updatePrivateKey.keys)
        })
    })

    context('CAVERJS-UNIT-WALLET-336: input: address and key object which defines transactionKey, updateKey and feePayerKey', () => {
        it('should update the accountKey', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            const updatePrivateKey = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: caver.klay.accounts.create().privateKey,
            }

            const account = caver.klay.accounts.wallet.updateAccountKey(testAccount.address, updatePrivateKey)
            compareAccountKey(account.accountKey, updatePrivateKey)
        })
    })

    context(
        'CAVERJS-UNIT-WALLET-337: input: address and AccountKeyRoleBased which defines transactionKey, updateKey and feePayerKey',
        () => {
            it('should update the accountKey', () => {
                const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
                const keyObject = {
                    transactionKey: caver.klay.accounts.create().privateKey,
                    updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                    feePayerKey: caver.klay.accounts.create().privateKey,
                }
                const updatePrivateKey = caver.klay.accounts.createAccountKeyRoleBased(keyObject)

                const account = caver.klay.accounts.wallet.updateAccountKey(testAccount.address, updatePrivateKey)
                compareAccountKey(account.accountKey, updatePrivateKey.keys)
            })
        }
    )

    context('CAVERJS-UNIT-WALLET-338: input: address and key object which defines transactionKey only', () => {
        it('should update the accountKey', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            const updatePrivateKey = {
                transactionKey: caver.klay.accounts.create().privateKey,
            }

            const account = caver.klay.accounts.wallet.updateAccountKey(testAccount.address, updatePrivateKey)
            compareAccountKey(account.accountKey, updatePrivateKey)
        })
    })

    context('CAVERJS-UNIT-WALLET-339: input: address and AccountKeyRoleBased which defines transactionKey only', () => {
        it('should update the accountKey', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            const keyObject = {
                transactionKey: caver.klay.accounts.create().privateKey,
            }
            const updatePrivateKey = caver.klay.accounts.createAccountKeyRoleBased(keyObject)

            const account = caver.klay.accounts.wallet.updateAccountKey(testAccount.address, updatePrivateKey)
            compareAccountKey(account.accountKey, updatePrivateKey.keys)
        })
    })

    context('CAVERJS-UNIT-WALLET-340: input: address and key object which defines updateKey only', () => {
        it('should update the accountKey', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            const updatePrivateKey = {
                updateKey: caver.klay.accounts.create().privateKey,
            }

            const account = caver.klay.accounts.wallet.updateAccountKey(testAccount.address, updatePrivateKey)
            compareAccountKey(account.accountKey, updatePrivateKey)
        })
    })

    context('CAVERJS-UNIT-WALLET-341: input: address and AccountKeyRoleBased which defines updateKey only', () => {
        it('should update the accountKey', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            const keyObject = {
                updateKey: caver.klay.accounts.create().privateKey,
            }
            const updatePrivateKey = caver.klay.accounts.createAccountKeyRoleBased(keyObject)

            const account = caver.klay.accounts.wallet.updateAccountKey(testAccount.address, updatePrivateKey)
            compareAccountKey(account.accountKey, updatePrivateKey.keys)
        })
    })

    context('CAVERJS-UNIT-WALLET-342: input: address and key object which defines feePayerKey only', () => {
        it('should update the accountKey', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            const updatePrivateKey = {
                feePayerKey: caver.klay.accounts.create().privateKey,
            }

            const account = caver.klay.accounts.wallet.updateAccountKey(testAccount.address, updatePrivateKey)
            compareAccountKey(account.accountKey, updatePrivateKey)
        })
    })

    context('CAVERJS-UNIT-WALLET-343: input: address and AccountKeyRoleBased which defines feePayerKey only', () => {
        it('should update the accountKey', () => {
            const testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            const keyObject = {
                updateKey: caver.klay.accounts.create().privateKey,
            }
            const updatePrivateKey = caver.klay.accounts.createAccountKeyRoleBased(keyObject)

            const account = caver.klay.accounts.wallet.updateAccountKey(testAccount.address, updatePrivateKey)
            compareAccountKey(account.accountKey, updatePrivateKey.keys)
        })
    })

    context('CAVERJS-UNIT-WALLET-344: input: address of role based account and key object which defines role key partially', () => {
        it('should update the key defined inside the AccountKey only', () => {
            const originalKeyObject = {
                transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                feePayerKey: caver.klay.accounts.create().privateKey,
            }
            const testAccount = caver.klay.accounts.wallet.add(
                caver.klay.accounts.createWithAccountKey(caver.klay.accounts.create().address, originalKeyObject)
            )

            const keyObject = {
                transactionKey: caver.klay.accounts.create().privateKey,
                updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
            }

            const updatedAccount = caver.klay.accounts.wallet.updateAccountKey(testAccount.address, keyObject)

            const expectedUpdatedKey = {
                transactionKey: keyObject.transactionKey,
                updateKey: keyObject.updateKey,
                feePayerKey: originalKeyObject.feePayerKey,
            }
            compareAccountKey(updatedAccount.accountKey, expectedUpdatedKey)
        })
    })

    context(
        'CAVERJS-UNIT-WALLET-345: input: address of role based account and AccountKeyRoleBased which defines role key partially',
        () => {
            it('should update the key defined inside the AccountKey only', () => {
                const originalKeyObject = {
                    transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                    feePayerKey: caver.klay.accounts.create().privateKey,
                }
                const testAccount = caver.klay.accounts.wallet.add(
                    caver.klay.accounts.createWithAccountKey(caver.klay.accounts.create().address, originalKeyObject)
                )

                const keyObject = {
                    transactionKey: caver.klay.accounts.create().privateKey,
                    updateKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                }

                const updatePrivateKey = caver.klay.accounts.createAccountKeyRoleBased(keyObject)

                const updatedAccount = caver.klay.accounts.wallet.updateAccountKey(testAccount.address, updatePrivateKey)

                const expectedUpdatedKey = {
                    transactionKey: keyObject.transactionKey,
                    updateKey: keyObject.updateKey,
                    feePayerKey: originalKeyObject.feePayerKey,
                }
                compareAccountKey(updatedAccount.accountKey, expectedUpdatedKey)
            })
        }
    )

    context('CAVERJS-UNIT-WALLET-346: input: not existed address of account', () => {
        it('should throw error when account cannot be found with address', () => {
            const notExistAddress = caver.klay.accounts.create().address
            const updatePrivateKey = caver.klay.accounts.create().privateKey

            const expectedError = `Failed to find account with ${notExistAddress}`

            expect(() => caver.klay.accounts.wallet.updateAccountKey(notExistAddress, updatePrivateKey)).to.throws(expectedError)
        })
    })

    context('CAVERJS-UNIT-WALLET-347: input: invalid address', () => {
        it('should throw error when account cannot be found with address', () => {
            const invalidAddress = 'invalidAddress'
            const updatePrivateKey = caver.klay.accounts.create().privateKey

            const expectedError = `Invalid address : ${invalidAddress}`

            expect(() => caver.klay.accounts.wallet.updateAccountKey(invalidAddress, updatePrivateKey)).to.throws(expectedError)
        })
    })
})

describe('caver.klay.accounts.wallet.getKlaytnWalletKey.', () => {
    // Using private key for testing with getKlaytnWalletKey
    context('CAVERJS-UNIT-WALLET-064 : getKlaytnWalletKey using wallet with private key. Access wallet by address', () => {
        it('should return valid KlaytnWalletKey', () => {
            const testPrivateKey = '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04'
            const acct = caver.klay.accounts.wallet.add(testPrivateKey)
            expect(acct.privateKey).equal('0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04')
            expect(acct.address).equal('0xee135d0b57c7ff81b198763cfd7c43f03a5f7622')

            const ret = caver.klay.accounts.wallet.getKlaytnWalletKey(acct.address)
            expect(ret).equal(
                '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
            )
        })
    })

    context('CAVERJS-UNIT-WALLET-065 : getKlaytnWalletKey using wallet with private key. Access wallet by index', () => {
        it('should return valid KlaytnWalletKey', () => {
            const testPrivateKey = '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04'
            const acct = caver.klay.accounts.wallet.add(testPrivateKey)
            expect(acct.privateKey).equal('0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04')
            expect(acct.address).equal('0xee135d0b57c7ff81b198763cfd7c43f03a5f7622')

            const ret = caver.klay.accounts.wallet.getKlaytnWalletKey(acct.index)
            expect(ret).equal(
                '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
            )
        })
    })

    context('CAVERJS-UNIT-WALLET-066 : getKlaytnWalletKey using account with private key.', () => {
        it('should return valid KlaytnWalletKey', () => {
            const testPrivateKey = '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04'
            const acct = caver.klay.accounts.wallet.add(testPrivateKey)
            expect(acct.privateKey).equal('0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04')
            expect(acct.address).equal('0xee135d0b57c7ff81b198763cfd7c43f03a5f7622')

            const ret = acct.getKlaytnWalletKey()
            expect(ret).equal(
                '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
            )
        })
    })

    // Using KlaytnWalletKey for testing with getKlaytnWalletKey
    context('CAVERJS-UNIT-WALLET-071 : getKlaytnWalletKey using wallet with KlaytnWalletKey. Access wallet by address', () => {
        it('should return valid KlaytnWalletKey', () => {
            const testPrivateKey =
                '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
            const acct = caver.klay.accounts.wallet.add(testPrivateKey)
            expect(acct.privateKey).equal('0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04')
            expect(acct.address).equal('0xee135d0b57c7ff81b198763cfd7c43f03a5f7622')

            const ret = caver.klay.accounts.wallet.getKlaytnWalletKey(acct.address)
            expect(ret).equal(
                '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
            )
        })
    })

    context('CAVERJS-UNIT-WALLET-072 : getKlaytnWalletKey using wallet with KlaytnWalletKey. Access wallet by index', () => {
        it('should return valid KlaytnWalletKey', () => {
            const testPrivateKey =
                '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
            const acct = caver.klay.accounts.wallet.add(testPrivateKey)
            expect(acct.privateKey).equal('0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04')
            expect(acct.address).equal('0xee135d0b57c7ff81b198763cfd7c43f03a5f7622')

            const ret = caver.klay.accounts.wallet.getKlaytnWalletKey(acct.index)
            expect(ret).equal(
                '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
            )
        })
    })

    context('CAVERJS-UNIT-WALLET-073 : getKlaytnWalletKey using account with KlaytnWalletKey.', () => {
        it('should return valid KlaytnWalletKey', () => {
            const testPrivateKey =
                '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
            const acct = caver.klay.accounts.wallet.add(testPrivateKey)
            expect(acct.privateKey).equal('0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d04')
            expect(acct.address).equal('0xee135d0b57c7ff81b198763cfd7c43f03a5f7622')

            const ret = acct.getKlaytnWalletKey()
            expect(ret).equal(
                '0x600dfc414fe433881f6606c24955e4143df9d203ccb3e335efe970a4ad017d040x000xee135d0b57c7ff81b198763cfd7c43f03a5f7622'
            )
        })
    })

    context('CAVERJS-UNIT-WALLET-394 : getKlaytnWalletKey using wallet with KlaytnWalletKey.', () => {
        it('should throw error if accountKey of account is not AccountKeyPublic', () => {
            const keys = [caver.klay.accounts.create().keys, caver.klay.accounts.create().keys, caver.klay.accounts.create().keys]
            let multiSigAccount = caver.klay.accounts.createWithAccountKey(caver.klay.accounts.create().address, keys)
            multiSigAccount = caver.klay.accounts.wallet.add(multiSigAccount)

            expect(() => caver.klay.accounts.wallet.getKlaytnWalletKey(multiSigAccount.index)).to.throws(
                'The account cannot be exported in KlaytnWalletKey format. Use caver.klay.accounts.encrypt or account.encrypt.'
            )

            const keyObject = {
                transactionKey: caver.klay.accounts.create().keys,
                updateKey: [caver.klay.accounts.create().keys, caver.klay.accounts.create().keys],
                feePayerKey: caver.klay.accounts.create().keys,
            }
            let roleBasedAccount = caver.klay.accounts.createWithAccountKey(caver.klay.accounts.create().address, keyObject)
            roleBasedAccount = caver.klay.accounts.wallet.add(roleBasedAccount)

            expect(() => caver.klay.accounts.wallet.getKlaytnWalletKey(roleBasedAccount.index)).to.throws(
                'The account cannot be exported in KlaytnWalletKey format. Use caver.klay.accounts.encrypt or account.encrypt.'
            )
        })
    })

    context('CAVERJS-UNIT-WALLET-395 : getKlaytnWalletKey using account with KlaytnWalletKey.', () => {
        it('should throw error if accountKey of account is not AccountKeyPublic', () => {
            const keys = [caver.klay.accounts.create().keys, caver.klay.accounts.create().keys, caver.klay.accounts.create().keys]
            let multiSigAccount = caver.klay.accounts.createWithAccountKey(caver.klay.accounts.create().address, keys)
            multiSigAccount = caver.klay.accounts.wallet.add(multiSigAccount)

            expect(() => multiSigAccount.getKlaytnWalletKey(multiSigAccount.index)).to.throws(
                'The account cannot be exported in KlaytnWalletKey format. Use caver.klay.accounts.encrypt or account.encrypt.'
            )

            const keyObject = {
                transactionKey: caver.klay.accounts.create().keys,
                updateKey: [caver.klay.accounts.create().keys, caver.klay.accounts.create().keys],
                feePayerKey: caver.klay.accounts.create().keys,
            }
            let roleBasedAccount = caver.klay.accounts.createWithAccountKey(caver.klay.accounts.create().address, keyObject)
            roleBasedAccount = caver.klay.accounts.wallet.add(roleBasedAccount)

            expect(() => roleBasedAccount.getKlaytnWalletKey(roleBasedAccount.index)).to.throws(
                'The account cannot be exported in KlaytnWalletKey format. Use caver.klay.accounts.encrypt or account.encrypt.'
            )
        })
    })
})
