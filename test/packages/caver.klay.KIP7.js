/*
	Copyright 2020 The caver-js Authors
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

const BigNumber = require('bignumber.js')

const testRPCURL = require('../testrpc')
const { expect } = require('../extendedChai')
const { TX_TYPE_STRING } = require('../../packages/caver-transaction/src/transactionHelper/transactionHelper')

const Caver = require('../../index')

let caver
let caver2
let kip7s
let sender
let feePayer
let testAccount
let receiver

let kip7Address

const tokenInfo = {
    name: 'Jasmine',
    symbol: 'JAS',
    decimals: 18,
    initialSupply: new BigNumber(1000000000000000000),
}

const prepareTestSetting = async () => {
    testAccount = caver.wallet.add(caver.wallet.keyring.generate())
    receiver = caver.wallet.add(caver.wallet.keyring.generate())

    caver2.klay.accounts.wallet.add(testAccount.key.privateKey)
    caver2.klay.accounts.wallet.add(receiver.key.privateKey)

    const txObject = caver.transaction.valueTransfer.create({
        from: sender.address,
        to: testAccount.address,
        value: caver.utils.toPeb(3, 'KLAY'),
        gas: 900000,
    })

    await txObject.sign(sender)

    return caver.rpc.klay.sendRawTransaction(txObject)
}

before(function(done) {
    this.timeout(200000)
    // caver is for testing caver.kct.kip7
    caver = new Caver(testRPCURL)

    // caver2 is for testing caver.klay.KIP7
    caver2 = new Caver(testRPCURL)

    const senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    sender = caver.wallet.keyring.createFromPrivateKey(senderPrvKey)
    caver.wallet.add(sender)

    const feePayerPrvKey =
        process.env.privateKey2 && String(process.env.privateKey2).indexOf('0x') === -1
            ? `0x${process.env.privateKey2}`
            : process.env.privateKey2

    feePayer = caver.wallet.keyring.createFromPrivateKey(feePayerPrvKey)
    caver.wallet.add(feePayer)

    caver2.klay.accounts.wallet.add(senderPrvKey)

    kip7s = [caver.kct.kip7, caver2.klay.KIP7]

    prepareTestSetting().then(() => done())
})

describe(`KIP7 token contract class test`, () => {
    context('kip7 token contract deploy', () => {
        it('CAVERJS-UNIT-KCT-001: should deploy KIP7 token contract and return KIP7 instance', async () => {
            for (const kip7 of kip7s) {
                const deployed = await kip7.deploy(tokenInfo, sender.address)

                expect(deployed.options.address).not.to.be.undefined

                const account = await caver.klay.getAccount(deployed.options.address)

                expect(account.accType).to.equals(2)
                expect(account.account.key.keyType).to.equals(3)

                // Check deploy with string initial supply
                const newTokenInfo = { ...tokenInfo }
                newTokenInfo.initialSupply = String(newTokenInfo.initialSupply)

                const deployed2 = await kip7.deploy(newTokenInfo, sender.address)
                expect(deployed2.options.address).not.to.be.undefined

                const account2 = await caver.klay.getAccount(deployed.options.address)

                expect(account2.accType).to.equals(2)
                expect(account2.account.key.keyType).to.equals(3)

                kip7Address = deployed.options.address
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-002: should throw error when token information is insufficient or invalid', async () => {
            for (const kip7 of kip7s) {
                let expectedError = 'Failed to validate token info for deploy: Invalid name of token'
                let insufficientToken = {}
                let invalidToken = { name: 1 }
                expect(() => kip7.deploy(insufficientToken, sender.address)).to.throws(expectedError)
                expect(() => kip7.deploy(invalidToken, sender.address)).to.throws(expectedError)

                expectedError = 'Failed to validate token info for deploy: Invalid symbol of token'
                insufficientToken = { name: 'Jasmine' }
                invalidToken = { name: 'Jasmine', symbol: 1 }
                expect(() => kip7.deploy(insufficientToken, sender.address)).to.throws(expectedError)
                expect(() => kip7.deploy(invalidToken, sender.address)).to.throws(expectedError)

                expectedError = 'Failed to validate token info for deploy: Invalid decimals of token'
                insufficientToken = { name: 'Jasmine', symbol: 'JAS' }
                invalidToken = { name: 'Jasmine', symbol: 'JAS', decimals: [1234] }
                expect(() => kip7.deploy(insufficientToken, sender.address)).to.throws(expectedError)
                expect(() => kip7.deploy(invalidToken, sender.address)).to.throws(expectedError)

                expectedError = 'Failed to validate token info for deploy: Invalid initialSupply of token'
                insufficientToken = { name: 'Jasmine', symbol: 'JAS', decimals: 18 }
                expect(() => kip7.deploy(insufficientToken, sender.address)).to.throws(expectedError)

                expectedError = 'Failed to validate token info for deploy: invalid parameter value'
                invalidToken = { name: 'Jasmine', symbol: 'JAS', decimals: 18, initialSupply: 'invalid' }
                expect(() => kip7.deploy(invalidToken, sender.address)).to.throws(expectedError)

                expectedError = 'Failed to validate token info for deploy: unsupported type'
                invalidToken = { name: 'Jasmine', symbol: 'JAS', decimals: 18, initialSupply: [1234] }
                expect(() => kip7.deploy(invalidToken, sender.address)).to.throws(expectedError)
            }
        }).timeout(200000)
    })

    context('KIP7.clone', () => {
        it('CAVERJS-UNIT-KCT-003: should clone KIP7 instance with new token contract address', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7('0x6726d0c6fc895e8db37039d94b440563118f3137')

                const newTokenContract = caver.klay.accounts.create().address
                const cloned = token.clone(newTokenContract)

                expect(cloned.options.address).to.equals(newTokenContract)
                expect(cloned.options.address).not.to.equals(token.options.address)
            }
        }).timeout(200000)
    })

    context('KIP7.name', () => {
        it('CAVERJS-UNIT-KCT-004: should call name method', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const name = await token.name()

                expect(name).to.equals(tokenInfo.name)
            }
        }).timeout(200000)
    })

    context('KIP7.symbol', () => {
        it('CAVERJS-UNIT-KCT-005: should call symbol method', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const symbol = await token.symbol()

                expect(symbol).to.equals(tokenInfo.symbol)
            }
        }).timeout(200000)
    })

    context('KIP7.decimals', () => {
        it('CAVERJS-UNIT-KCT-006: should call decimals method', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const decimals = await token.decimals()

                expect(decimals).to.equals(tokenInfo.decimals)
            }
        }).timeout(200000)
    })

    context('KIP7.totalSupply', () => {
        it('CAVERJS-UNIT-KCT-007: should call totalSupply method', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const totalSupply = await token.totalSupply()

                expect(totalSupply.eq(tokenInfo.initialSupply)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP7.balanceOf', () => {
        it('CAVERJS-UNIT-KCT-008: should call balanceOf method and deployer should have initialSupply', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const balance = await token.balanceOf(sender.address)

                expect(balance.eq(tokenInfo.initialSupply)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-009: should call balanceOf method and return 0 if account does not have any token', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const balance = await token.balanceOf(caver.klay.accounts.create().address)

                expect(balance.toString()).to.equals('0')
            }
        }).timeout(200000)
    })

    context('KIP7.allowance', () => {
        it('CAVERJS-UNIT-KCT-010: should call allowance method', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const allowance = await token.allowance(sender.address, testAccount.address)
                expect(allowance.toString()).to.equals('0')
            }
        }).timeout(200000)
    })

    context('KIP7.approve', () => {
        it('CAVERJS-UNIT-KCT-011: should send transaction for calling approve method and set allowance without sendParams', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const allowanceAmount = 10
                const originalAllowance = await token.allowance(sender.address, testAccount.address)

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const approved = await token.approve(testAccount.address, new BigNumber(allowanceAmount))
                expect(approved.from).to.equals(sender.address.toLowerCase())
                expect(approved.status).to.be.true
                expect(approved.events).not.to.be.undefined
                expect(approved.events.Approval).not.to.be.undefined
                expect(approved.events.Approval.address).to.equals(kip7Address)

                const afterAllowance = await token.allowance(sender.address, testAccount.address)

                expect(afterAllowance.minus(originalAllowance).eq(allowanceAmount)).to.be.true

                // reset allowance
                await token.approve(testAccount.address, 0)
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-012: should send transaction for calling approve method and set allowance with sendParams(from)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const additionalAllowance = 10
                const originalAllowance = await token.allowance(sender.address, testAccount.address)

                const newAllowance = originalAllowance.plus(new BigNumber(additionalAllowance))

                const approved = await token.approve(testAccount.address, newAllowance, { from: sender.address })
                expect(approved.from).to.equals(sender.address.toLowerCase())
                expect(approved.status).to.be.true
                expect(approved.events).not.to.be.undefined
                expect(approved.events.Approval).not.to.be.undefined
                expect(approved.events.Approval.address).to.equals(kip7Address)

                const afterAllowance = await token.allowance(sender.address, testAccount.address)

                expect(afterAllowance.minus(originalAllowance).eq(additionalAllowance)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-013: should send transaction for calling approve method and set allowance with sendParams(from, gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const additionalAllowance = 10
                const originalAllowance = await token.allowance(sender.address, testAccount.address)

                const newAllowance = originalAllowance.plus(new BigNumber(additionalAllowance))

                const customGasLimit = '0x186a0'

                const approved = await token.approve(testAccount.address, newAllowance, { from: sender.address, gas: customGasLimit })
                expect(approved.gas).to.equals(customGasLimit)
                expect(approved.status).to.be.true
                expect(approved.events).not.to.be.undefined
                expect(approved.events.Approval).not.to.be.undefined
                expect(approved.events.Approval.address).to.equals(kip7Address)

                const afterAllowance = await token.allowance(sender.address, testAccount.address)

                expect(afterAllowance.minus(originalAllowance).eq(additionalAllowance)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-014: should send transaction for calling approve method and set allowance with sendParams(gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const additionalAllowance = 10
                const originalAllowance = await token.allowance(sender.address, testAccount.address)

                const newAllowance = originalAllowance.plus(new BigNumber(additionalAllowance))

                const customGasLimit = '0x186a0'

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const approved = await token.approve(testAccount.address, newAllowance.toString(10), { gas: customGasLimit })
                expect(approved.from).to.equals(sender.address.toLowerCase())
                expect(approved.gas).to.equals(customGasLimit)
                expect(approved.status).to.be.true
                expect(approved.events).not.to.be.undefined
                expect(approved.events.Approval).not.to.be.undefined
                expect(approved.events.Approval.address).to.equals(kip7Address)

                const afterAllowance = await token.allowance(sender.address, testAccount.address)

                expect(afterAllowance.minus(originalAllowance).eq(additionalAllowance)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP7.transfer', () => {
        it('CAVERJS-UNIT-KCT-015: should send transaction to transfer token and trigger Transfer event without sendParams', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const transferAmount = 10
                const originalBalance = await token.balanceOf(testAccount.address)

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const transfered = await token.transfer(testAccount.address, new BigNumber(transferAmount))
                expect(transfered.from).to.equals(sender.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(testAccount.address)

                expect(afterBalance.minus(originalBalance).eq(transferAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-016: should send transaction to transfer token and trigger Transfer event with sendParams(from)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const transferAmount = new BigNumber(10)
                const originalBalance = await token.balanceOf(testAccount.address)

                const transfered = await token.transfer(testAccount.address, transferAmount.toString(10), { from: sender.address })
                expect(transfered.from).to.equals(sender.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(testAccount.address)

                expect(afterBalance.minus(originalBalance).eq(transferAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-017: should send transaction to transfer token and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const transferAmount = 10
                const originalBalance = await token.balanceOf(testAccount.address)

                const customGasLimit = '0x186a0'

                const transfered = await token.transfer(testAccount.address, transferAmount, { from: sender.address, gas: customGasLimit })
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(testAccount.address)

                expect(afterBalance.minus(originalBalance).eq(transferAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-018: should send transaction to transfer token and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const transferAmount = 10
                const originalBalance = await token.balanceOf(testAccount.address)

                const customGasLimit = '0x186a0'

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const transfered = await token.transfer(testAccount.address, transferAmount, { gas: customGasLimit })
                expect(transfered.from).to.equals(sender.address.toLowerCase())
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(testAccount.address)

                expect(afterBalance.minus(originalBalance).eq(transferAmount)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP7.transferFrom', () => {
        it('CAVERJS-UNIT-KCT-019: should send transaction to transfer token and trigger Transfer event without sendParams', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                const allowanceAmount = 10000
                await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
                const originalAllowance = await token.allowance(sender.address, testAccount.address)
                expect(originalAllowance.eq(allowanceAmount)).to.be.true

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const transfered = await token.transferFrom(sender.address, receiver.address, new BigNumber(allowanceAmount))
                expect(transfered.from).to.equals(testAccount.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)
                expect((await token.allowance(sender.address, testAccount.address)).toString()).to.equals('0')

                expect(afterBalance.minus(originalBalance).eq(allowanceAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-020: should send transaction to transfer token and trigger Transfer event with sendParams(from)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                const allowanceAmount = new BigNumber(10000)
                await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
                const originalAllowance = await token.allowance(sender.address, testAccount.address)
                expect(originalAllowance.eq(allowanceAmount)).to.be.true

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const transfered = await token.transferFrom(sender.address, receiver.address, allowanceAmount.toString(10), {
                    from: testAccount.address,
                })
                expect(transfered.from).to.equals(testAccount.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)
                expect((await token.allowance(sender.address, testAccount.address)).toString()).to.equals('0')

                expect(afterBalance.minus(originalBalance).eq(allowanceAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-021: should send transaction to transfer token and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                const allowanceAmount = 10000
                await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
                const originalAllowance = await token.allowance(sender.address, testAccount.address)
                expect(originalAllowance.eq(allowanceAmount)).to.be.true

                const customGasLimit = '0x186a0'
                const transfered = await token.transferFrom(sender.address, receiver.address, allowanceAmount, {
                    from: testAccount.address,
                    gas: customGasLimit,
                })
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)
                expect((await token.allowance(sender.address, testAccount.address)).toString()).to.equals('0')

                expect(afterBalance.minus(originalBalance).eq(allowanceAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-022: should send transaction to transfer token and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                const allowanceAmount = 10000
                await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
                const originalAllowance = await token.allowance(sender.address, testAccount.address)
                expect(originalAllowance.eq(allowanceAmount)).to.be.true

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const customGasLimit = '0x186a0'
                const transfered = await token.transferFrom(sender.address, receiver.address, allowanceAmount, { gas: customGasLimit })
                expect(transfered.from).to.equals(testAccount.address.toLowerCase())
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)
                expect((await token.allowance(sender.address, testAccount.address)).toString()).to.equals('0')

                expect(afterBalance.minus(originalBalance).eq(allowanceAmount)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP7.safeTransfer', () => {
        it('CAVERJS-UNIT-KCT-144: should send token via safeTransfer without data and trigger Transfer event without sendParams', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const transferAmount = new BigNumber(10)
                const transfered = await token.safeTransfer(receiver.address, new BigNumber(transferAmount))
                expect(transfered.from).to.equals(sender.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)

                expect(afterBalance.minus(originalBalance).eq(transferAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-145: should send token via safeTransfer without data and trigger Transfer event with sendParams(from)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                const transferAmount = new BigNumber(10)
                const transfered = await token.safeTransfer(receiver.address, transferAmount.toString(10), {
                    from: sender.address,
                })
                expect(transfered.from).to.equals(sender.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)

                expect(afterBalance.minus(originalBalance).eq(transferAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-146: should send token via safeTransfer without data and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                const customGasLimit = '0x249f0'
                const transferAmount = new BigNumber(10)
                const transfered = await token.safeTransfer(receiver.address, transferAmount, {
                    from: sender.address,
                    gas: customGasLimit,
                })
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)

                expect(afterBalance.minus(originalBalance).eq(transferAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-147: should send token via safeTransfer without data and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const customGasLimit = '0x249f0'
                const transferAmount = new BigNumber(10)
                const transfered = await token.safeTransfer(receiver.address, transferAmount, { gas: customGasLimit })
                expect(transfered.from).to.equals(sender.address.toLowerCase())
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)

                expect(afterBalance.minus(originalBalance).eq(transferAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-148: should send token via safeTransfer with data and trigger Transfer event without sendParams', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const data = Buffer.from('buffered data')
                const transferAmount = new BigNumber(10)
                const transfered = await token.safeTransfer(receiver.address, transferAmount, data)
                const encodedParamters = caver.klay.abi.encodeParameters(
                    ['address', 'uint256', 'bytes'],
                    [receiver.address, transferAmount.toString(10), data]
                )
                expect(transfered.input.slice(10)).to.equals(encodedParamters.slice(2))
                expect(transfered.from).to.equals(sender.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)

                expect(afterBalance.minus(originalBalance).eq(transferAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-149: should send token via safeTransfer with data and trigger Transfer event with sendParams(from)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const data = Buffer.from('buffered data')
                const transferAmount = new BigNumber(10)
                const transfered = await token.safeTransfer(receiver.address, transferAmount.toString(10), data, {
                    from: sender.address,
                })
                const encodedParamters = caver.klay.abi.encodeParameters(
                    ['address', 'uint256', 'bytes'],
                    [receiver.address, transferAmount.toString(10), data]
                )
                expect(transfered.input.slice(10)).to.equals(encodedParamters.slice(2))
                expect(transfered.from).to.equals(sender.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)

                expect(afterBalance.minus(originalBalance).eq(transferAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-150: should send token via safeTransfer with data and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                const customGasLimit = '0x30d40'
                const data = Buffer.from('buffered data')
                const transferAmount = new BigNumber(10)
                const transfered = await token.safeTransfer(receiver.address, transferAmount, data, {
                    from: sender.address,
                    gas: customGasLimit,
                })
                const encodedParamters = caver.klay.abi.encodeParameters(
                    ['address', 'uint256', 'bytes'],
                    [receiver.address, transferAmount.toString(10), data]
                )
                expect(transfered.input.slice(10)).to.equals(encodedParamters.slice(2))
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)

                expect(afterBalance.minus(originalBalance).eq(transferAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-151: should send token via safeTransfer with data and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const customGasLimit = '0x30d40'
                const data = Buffer.from('buffered data')
                const transferAmount = new BigNumber(10)
                const transfered = await token.safeTransfer(receiver.address, transferAmount, data, {
                    gas: customGasLimit,
                })
                const encodedParamters = caver.klay.abi.encodeParameters(
                    ['address', 'uint256', 'bytes'],
                    [receiver.address, transferAmount.toString(10), data]
                )
                expect(transfered.input.slice(10)).to.equals(encodedParamters.slice(2))
                expect(transfered.from).to.equals(sender.address.toLowerCase())
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)

                expect(afterBalance.minus(originalBalance).eq(transferAmount)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP7.safeTransferFrom', () => {
        it('CAVERJS-UNIT-KCT-152: should send token via safeTransferFrom without data and trigger Transfer event without sendParams', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                const allowanceAmount = 10000
                await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
                const originalAllowance = await token.allowance(sender.address, testAccount.address)
                expect(originalAllowance.eq(allowanceAmount)).to.be.true

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const transfered = await token.safeTransferFrom(sender.address, receiver.address, new BigNumber(allowanceAmount))
                expect(transfered.from).to.equals(testAccount.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)
                expect((await token.allowance(sender.address, testAccount.address)).toString()).to.equals('0')

                expect(afterBalance.minus(originalBalance).eq(allowanceAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-153: should send token via safeTransferFrom without data and trigger Transfer event with sendParams(from)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                const allowanceAmount = new BigNumber(10000)
                await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
                const originalAllowance = await token.allowance(sender.address, testAccount.address)
                expect(originalAllowance.eq(allowanceAmount)).to.be.true

                const transfered = await token.safeTransferFrom(sender.address, receiver.address, allowanceAmount.toString(10), {
                    from: testAccount.address,
                })
                expect(transfered.from).to.equals(testAccount.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)
                expect((await token.allowance(sender.address, testAccount.address)).toString()).to.equals('0')

                expect(afterBalance.minus(originalBalance).eq(allowanceAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-154: should send token via safeTransferFrom without data and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                const allowanceAmount = 10000
                await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
                const originalAllowance = await token.allowance(sender.address, testAccount.address)
                expect(originalAllowance.eq(allowanceAmount)).to.be.true

                const customGasLimit = '0x249f0'
                const transfered = await token.safeTransferFrom(sender.address, receiver.address, allowanceAmount, {
                    from: testAccount.address,
                    gas: customGasLimit,
                })
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)
                expect((await token.allowance(sender.address, testAccount.address)).toString()).to.equals('0')

                expect(afterBalance.minus(originalBalance).eq(allowanceAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-155: should send token via safeTransferFrom without data and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                const allowanceAmount = 10000
                await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
                const originalAllowance = await token.allowance(sender.address, testAccount.address)
                expect(originalAllowance.eq(allowanceAmount)).to.be.true

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const customGasLimit = '0x249f0'
                const transfered = await token.safeTransferFrom(sender.address, receiver.address, allowanceAmount, { gas: customGasLimit })
                expect(transfered.from).to.equals(testAccount.address.toLowerCase())
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)
                expect((await token.allowance(sender.address, testAccount.address)).toString()).to.equals('0')

                expect(afterBalance.minus(originalBalance).eq(allowanceAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-156: should send token via safeTransferFrom with data and trigger Transfer event without sendParams', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                const allowanceAmount = 10000
                await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
                const originalAllowance = await token.allowance(sender.address, testAccount.address)
                expect(originalAllowance.eq(allowanceAmount)).to.be.true

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const data = Buffer.from('buffered data')
                const transfered = await token.safeTransferFrom(sender.address, receiver.address, new BigNumber(allowanceAmount), data)
                const encodedParamters = caver.klay.abi.encodeParameters(
                    ['address', 'address', 'uint256', 'bytes'],
                    [sender.address, receiver.address, allowanceAmount, data]
                )
                expect(transfered.input.slice(10)).to.equals(encodedParamters.slice(2))
                expect(transfered.from).to.equals(testAccount.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)
                expect((await token.allowance(sender.address, testAccount.address)).toString()).to.equals('0')

                expect(afterBalance.minus(originalBalance).eq(allowanceAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-157: should send token via safeTransferFrom with data and trigger Transfer event with sendParams(from)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                const allowanceAmount = new BigNumber(10000)
                await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
                const originalAllowance = await token.allowance(sender.address, testAccount.address)
                expect(originalAllowance.eq(allowanceAmount)).to.be.true

                const data = Buffer.from('buffered data')
                const transfered = await token.safeTransferFrom(sender.address, receiver.address, allowanceAmount.toString(10), data, {
                    from: testAccount.address,
                })
                const encodedParamters = caver.klay.abi.encodeParameters(
                    ['address', 'address', 'uint256', 'bytes'],
                    [sender.address, receiver.address, allowanceAmount.toString(10), data]
                )
                expect(transfered.input.slice(10)).to.equals(encodedParamters.slice(2))
                expect(transfered.from).to.equals(testAccount.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)
                expect((await token.allowance(sender.address, testAccount.address)).toString()).to.equals('0')

                expect(afterBalance.minus(originalBalance).eq(allowanceAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-158: should send token via safeTransferFrom with data and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                const allowanceAmount = 10000
                await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
                const originalAllowance = await token.allowance(sender.address, testAccount.address)
                expect(originalAllowance.eq(allowanceAmount)).to.be.true

                const customGasLimit = '0x30d40'
                const data = Buffer.from('buffered data')
                const transfered = await token.safeTransferFrom(sender.address, receiver.address, allowanceAmount, data, {
                    from: testAccount.address,
                    gas: customGasLimit,
                })
                const encodedParamters = caver.klay.abi.encodeParameters(
                    ['address', 'address', 'uint256', 'bytes'],
                    [sender.address, receiver.address, allowanceAmount, data]
                )
                expect(transfered.input.slice(10)).to.equals(encodedParamters.slice(2))
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)
                expect((await token.allowance(sender.address, testAccount.address)).toString()).to.equals('0')

                expect(afterBalance.minus(originalBalance).eq(allowanceAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-159: should send token via safeTransferFrom with data and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalBalance = await token.balanceOf(receiver.address)

                const allowanceAmount = 10000
                await token.approve(testAccount.address, allowanceAmount, { from: sender.address })
                const originalAllowance = await token.allowance(sender.address, testAccount.address)
                expect(originalAllowance.eq(allowanceAmount)).to.be.true

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const customGasLimit = '0x30d40'
                const data = Buffer.from('buffered data')
                const transfered = await token.safeTransferFrom(sender.address, receiver.address, allowanceAmount, data, {
                    gas: customGasLimit,
                })
                const encodedParamters = caver.klay.abi.encodeParameters(
                    ['address', 'address', 'uint256', 'bytes'],
                    [sender.address, receiver.address, allowanceAmount, data]
                )
                expect(transfered.input.slice(10)).to.equals(encodedParamters.slice(2))
                expect(transfered.from).to.equals(testAccount.address.toLowerCase())
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip7Address)

                const afterBalance = await token.balanceOf(receiver.address)
                expect((await token.allowance(sender.address, testAccount.address)).toString()).to.equals('0')

                expect(afterBalance.minus(originalBalance).eq(allowanceAmount)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP7.isMinter', () => {
        it('CAVERJS-UNIT-KCT-023: should call isMinter method', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                expect(await token.isMinter(sender.address)).to.be.true
                expect(await token.isMinter(testAccount.address)).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP7.isPauser', () => {
        it('CAVERJS-UNIT-KCT-024: should call isPauser method', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                expect(await token.isPauser(sender.address)).to.be.true
                expect(await token.isPauser(testAccount.address)).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP7.paused', () => {
        it('CAVERJS-UNIT-KCT-025: should call paused method', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                expect(await token.paused()).to.be.false

                await token.pause({ from: sender.address })

                expect(await token.paused()).to.be.true

                await token.unpause({ from: sender.address })

                expect(await token.paused()).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP7.mint', () => {
        it('CAVERJS-UNIT-KCT-026: should send transaction for minting and trigger Transfer event without sendParams', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalSupply = await token.totalSupply()

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const mintingAmount = 10000
                const minted = await token.mint(testAccount.address, new BigNumber(mintingAmount))
                expect(minted.from).to.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(kip7Address)

                const afterSupply = await token.totalSupply()

                expect(afterSupply.minus(originalSupply).eq(mintingAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-027: should send transaction for minting and trigger Transfer event with sendParams(from)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalSupply = await token.totalSupply()

                const mintingAmount = new BigNumber(10000)
                const minted = await token.mint(testAccount.address, mintingAmount.toString(10), { from: sender.address })
                expect(minted.from).to.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(kip7Address)

                const afterSupply = await token.totalSupply()

                expect(afterSupply.minus(originalSupply).eq(mintingAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-028: should send transaction for minting and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalSupply = await token.totalSupply()

                const mintingAmount = 10000
                const customGasLimit = '0x30d40'
                const minted = await token.mint(testAccount.address, mintingAmount, { from: sender.address, gas: customGasLimit })
                expect(minted.gas).to.equals(customGasLimit)
                expect(minted.from).to.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(kip7Address)

                const afterSupply = await token.totalSupply()

                expect(afterSupply.minus(originalSupply).eq(mintingAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-029: should send transaction for minting and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalSupply = await token.totalSupply()

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const mintingAmount = 10000
                const customGasLimit = '0x30d40'
                const minted = await token.mint(testAccount.address, mintingAmount, { gas: customGasLimit })
                expect(minted.from).to.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(kip7Address)

                const afterSupply = await token.totalSupply()

                expect(afterSupply.minus(originalSupply).eq(mintingAmount)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP7.addMinter', () => {
        it('CAVERJS-UNIT-KCT-030: should send transaction for adding minter and trigger MinterAdded event without sendParams', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const newMinter = caver.klay.accounts.create().address
                expect(await token.isMinter(newMinter)).to.be.false

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const minterAdded = await token.addMinter(newMinter)
                expect(minterAdded.from).to.equals(sender.address.toLowerCase())
                expect(minterAdded.status).to.be.true
                expect(minterAdded.events).not.to.be.undefined
                expect(minterAdded.events.MinterAdded).not.to.be.undefined
                expect(minterAdded.events.MinterAdded.address).to.equals(kip7Address)

                expect(await token.isMinter(newMinter)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-031: should send transaction for adding minter and trigger MinterAdded event with sendParams(from)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const newMinter = caver.klay.accounts.create().address
                expect(await token.isMinter(newMinter)).to.be.false

                const minterAdded = await token.addMinter(newMinter, { from: sender.address })
                expect(minterAdded.from).to.equals(sender.address.toLowerCase())
                expect(minterAdded.status).to.be.true
                expect(minterAdded.events).not.to.be.undefined
                expect(minterAdded.events.MinterAdded).not.to.be.undefined
                expect(minterAdded.events.MinterAdded.address).to.equals(kip7Address)

                expect(await token.isMinter(newMinter)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-032: should send transaction for adding minter and trigger MinterAdded event with sendParams(from, gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const newMinter = caver.klay.accounts.create().address
                expect(await token.isMinter(newMinter)).to.be.false

                const customGasLimit = '0x30d40'
                const minterAdded = await token.addMinter(newMinter, { from: sender.address, gas: customGasLimit })
                expect(minterAdded.gas).to.equals(customGasLimit)
                expect(minterAdded.from).to.equals(sender.address.toLowerCase())
                expect(minterAdded.status).to.be.true
                expect(minterAdded.events).not.to.be.undefined
                expect(minterAdded.events.MinterAdded).not.to.be.undefined
                expect(minterAdded.events.MinterAdded.address).to.equals(kip7Address)

                expect(await token.isMinter(newMinter)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-033: should send transaction for adding minter and trigger MinterAdded event with sendParams(gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const newMinter = caver.klay.accounts.create().address
                expect(await token.isMinter(newMinter)).to.be.false

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const customGasLimit = '0x30d40'
                const minterAdded = await token.addMinter(newMinter, { gas: customGasLimit })
                expect(minterAdded.from).to.equals(sender.address.toLowerCase())
                expect(minterAdded.status).to.be.true
                expect(minterAdded.events).not.to.be.undefined
                expect(minterAdded.events.MinterAdded).not.to.be.undefined
                expect(minterAdded.events.MinterAdded.address).to.equals(kip7Address)

                expect(await token.isMinter(newMinter)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP7.renounceMinter', () => {
        it('CAVERJS-UNIT-KCT-034: should send transaction for removing minter and trigger MinterRemoved event without sendParams', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                await token.addMinter(testAccount.address, { from: sender.address })
                expect(await token.isMinter(testAccount.address)).to.be.true

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const minterRemoved = await token.renounceMinter()
                expect(minterRemoved.from).to.equals(testAccount.address.toLowerCase())
                expect(minterRemoved.status).to.be.true
                expect(minterRemoved.events).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved.address).to.equals(kip7Address)

                expect(await token.isMinter(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-035: should send transaction for removing minter and trigger MinterRemoved event with sendParams(from)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                await token.addMinter(testAccount.address, { from: sender.address })
                expect(await token.isMinter(testAccount.address)).to.be.true

                const minterRemoved = await token.renounceMinter({ from: testAccount.address })
                expect(minterRemoved.from).to.equals(testAccount.address.toLowerCase())
                expect(minterRemoved.status).to.be.true
                expect(minterRemoved.events).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved.address).to.equals(kip7Address)

                expect(await token.isMinter(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-036: should send transaction for removing minter and trigger MinterRemoved event with sendParams(from, gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                await token.addMinter(testAccount.address, { from: sender.address })
                expect(await token.isMinter(testAccount.address)).to.be.true

                const customGasLimit = '0x30d40'
                const minterRemoved = await token.renounceMinter({ from: testAccount.address, gas: customGasLimit })
                expect(minterRemoved.gas).to.equals(customGasLimit)
                expect(minterRemoved.from).to.equals(testAccount.address.toLowerCase())
                expect(minterRemoved.status).to.be.true
                expect(minterRemoved.events).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved.address).to.equals(kip7Address)

                expect(await token.isMinter(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-037: should send transaction for removing minter and trigger MinterRemoved event with sendParams(gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                await token.addMinter(testAccount.address, { from: sender.address })
                expect(await token.isMinter(testAccount.address)).to.be.true

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const customGasLimit = '0x30d40'
                const minterRemoved = await token.renounceMinter({ gas: customGasLimit })
                expect(minterRemoved.from).to.equals(testAccount.address.toLowerCase())
                expect(minterRemoved.status).to.be.true
                expect(minterRemoved.events).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved.address).to.equals(kip7Address)

                expect(await token.isMinter(testAccount.address)).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP7.burn', () => {
        it('CAVERJS-UNIT-KCT-038: should send transaction for burning and trigger Transfer event without sendParams', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalSupply = await token.totalSupply()

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const burningAmount = 1000
                const burned = await token.burn(new BigNumber(burningAmount))
                expect(burned.from).to.equals(sender.address.toLowerCase())
                expect(burned.status).to.be.true
                expect(burned.events).not.to.be.undefined
                expect(burned.events.Transfer).not.to.be.undefined
                expect(burned.events.Transfer.address).to.equals(kip7Address)

                const afterSupply = await token.totalSupply()
                expect(originalSupply.minus(afterSupply).eq(burningAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-039: should send transaction for burning and trigger Transfer event with sendParams(from)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalSupply = await token.totalSupply()

                const burningAmount = new BigNumber(1000)
                const burned = await token.burn(burningAmount.toString(10), { from: sender.address })
                expect(burned.from).to.equals(sender.address.toLowerCase())
                expect(burned.status).to.be.true
                expect(burned.events).not.to.be.undefined
                expect(burned.events.Transfer).not.to.be.undefined
                expect(burned.events.Transfer.address).to.equals(kip7Address)

                const afterSupply = await token.totalSupply()
                expect(originalSupply.minus(afterSupply).eq(burningAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-040: should send transaction for burning and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalSupply = await token.totalSupply()

                const burningAmount = 1000
                const customGasLimit = '0x30d40'
                const burned = await token.burn(burningAmount, { from: sender.address, gas: customGasLimit })
                expect(burned.gas).to.equals(customGasLimit)
                expect(burned.from).to.equals(sender.address.toLowerCase())
                expect(burned.status).to.be.true
                expect(burned.events).not.to.be.undefined
                expect(burned.events.Transfer).not.to.be.undefined
                expect(burned.events.Transfer.address).to.equals(kip7Address)

                const afterSupply = await token.totalSupply()
                expect(originalSupply.minus(afterSupply).eq(burningAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-041: should send transaction for burning and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalSupply = await token.totalSupply()

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const burningAmount = 1000
                const customGasLimit = '0x30d40'
                const burned = await token.burn(burningAmount, { gas: customGasLimit })
                expect(burned.from).to.equals(sender.address.toLowerCase())
                expect(burned.status).to.be.true
                expect(burned.events).not.to.be.undefined
                expect(burned.events.Transfer).not.to.be.undefined
                expect(burned.events.Transfer.address).to.equals(kip7Address)

                const afterSupply = await token.totalSupply()
                expect(originalSupply.minus(afterSupply).eq(burningAmount)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP7.burnFrom', () => {
        it('CAVERJS-UNIT-KCT-042: should send transaction for burning token and trigger Transfer event without sendParams', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalSupply = await token.totalSupply()

                const burningAmount = 10000
                await token.approve(testAccount.address, new BigNumber(burningAmount), { from: sender.address })
                const originalAllowance = await token.allowance(sender.address, testAccount.address)
                expect(originalAllowance.toNumber()).to.equals(burningAmount)

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const burned = await token.burnFrom(sender.address, burningAmount)
                expect(burned.from).to.equals(testAccount.address.toLowerCase())
                expect(burned.status).to.be.true
                expect(burned.events).not.to.be.undefined
                expect(burned.events.Transfer).not.to.be.undefined
                expect(burned.events.Transfer.address).to.equals(kip7Address)

                expect((await token.allowance(sender.address, testAccount.address)).toString()).to.equals('0')
                const afterSupply = await token.totalSupply()
                expect(originalSupply.minus(afterSupply).eq(burningAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-043: should send transaction for burning token and trigger Transfer event with sendParams(from)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalSupply = await token.totalSupply()

                const burningAmount = new BigNumber(10000)
                await token.approve(testAccount.address, burningAmount.toString(10), { from: sender.address })
                const originalAllowance = await token.allowance(sender.address, testAccount.address)
                expect(originalAllowance.eq(burningAmount)).to.be.true

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const burned = await token.burnFrom(sender.address, burningAmount, { from: testAccount.address })
                expect(burned.from).to.equals(testAccount.address.toLowerCase())
                expect(burned.status).to.be.true
                expect(burned.events).not.to.be.undefined
                expect(burned.events.Transfer).not.to.be.undefined
                expect(burned.events.Transfer.address).to.equals(kip7Address)

                expect((await token.allowance(sender.address, testAccount.address)).toString()).to.equals('0')
                const afterSupply = await token.totalSupply()
                expect(originalSupply.minus(afterSupply).eq(burningAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-044: should send transaction for burning token and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalSupply = await token.totalSupply()

                const burningAmount = 10000
                await token.approve(testAccount.address, burningAmount, { from: sender.address })
                const originalAllowance = await token.allowance(sender.address, testAccount.address)
                expect(originalAllowance.toNumber()).to.equals(burningAmount)

                const customGasLimit = '0x186a0'
                const burned = await token.burnFrom(sender.address, burningAmount, {
                    from: testAccount.address,
                    gas: customGasLimit,
                })
                expect(burned.gas).to.equals(customGasLimit)
                expect(burned.status).to.be.true
                expect(burned.events).not.to.be.undefined
                expect(burned.events.Transfer).not.to.be.undefined
                expect(burned.events.Transfer.address).to.equals(kip7Address)

                expect((await token.allowance(sender.address, testAccount.address)).toString()).to.equals('0')
                const afterSupply = await token.totalSupply()
                expect(originalSupply.minus(afterSupply).eq(burningAmount)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-045: should send transaction for burning token and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const originalSupply = await token.totalSupply()

                const burningAmount = 10000
                await token.approve(testAccount.address, burningAmount, { from: sender.address })
                const originalAllowance = await token.allowance(sender.address, testAccount.address)
                expect(originalAllowance.toNumber()).to.equals(burningAmount)

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const customGasLimit = '0x186a0'
                const burned = await token.burnFrom(sender.address, burningAmount, { gas: customGasLimit })
                expect(burned.from).to.equals(testAccount.address.toLowerCase())
                expect(burned.gas).to.equals(customGasLimit)
                expect(burned.status).to.be.true
                expect(burned.events).not.to.be.undefined
                expect(burned.events.Transfer).not.to.be.undefined
                expect(burned.events.Transfer.address).to.equals(kip7Address)

                expect((await token.allowance(sender.address, testAccount.address)).toString()).to.equals('0')
                const afterSupply = await token.totalSupply()
                expect(originalSupply.minus(afterSupply).eq(burningAmount)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP7.addPauser', () => {
        it('CAVERJS-UNIT-KCT-046: should send transaction for adding pauser and trigger PauserAdded event without sendParams', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const newPauser = caver.klay.accounts.create().address
                expect(await token.isPauser(newPauser)).to.be.false

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const pauserAdded = await token.addPauser(newPauser)
                expect(pauserAdded.from).to.equals(sender.address.toLowerCase())
                expect(pauserAdded.status).to.be.true
                expect(pauserAdded.events).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded.address).to.equals(kip7Address)

                expect(await token.isPauser(newPauser)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-047: should send transaction for adding pauser and trigger PauserAdded event with sendParams(from)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const newPauser = caver.klay.accounts.create().address
                expect(await token.isPauser(newPauser)).to.be.false

                const pauserAdded = await token.addPauser(newPauser, { from: sender.address })
                expect(pauserAdded.from).to.equals(sender.address.toLowerCase())
                expect(pauserAdded.status).to.be.true
                expect(pauserAdded.events).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded.address).to.equals(kip7Address)

                expect(await token.isPauser(newPauser)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-048: should send transaction for adding pauser and trigger PauserAdded event with sendParams(from, gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const newPauser = caver.klay.accounts.create().address
                expect(await token.isPauser(newPauser)).to.be.false

                const customGasLimit = '0x30d40'
                const pauserAdded = await token.addPauser(newPauser, { from: sender.address, gas: customGasLimit })
                expect(pauserAdded.gas).to.equals(customGasLimit)
                expect(pauserAdded.from).to.equals(sender.address.toLowerCase())
                expect(pauserAdded.status).to.be.true
                expect(pauserAdded.events).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded.address).to.equals(kip7Address)

                expect(await token.isPauser(newPauser)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-049: should send transaction for adding pauser and trigger PauserAdded event with sendParams(gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const newPauser = caver.klay.accounts.create().address
                expect(await token.isPauser(newPauser)).to.be.false

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const customGasLimit = '0x30d40'
                const pauserAdded = await token.addPauser(newPauser, { gas: customGasLimit })
                expect(pauserAdded.from).to.equals(sender.address.toLowerCase())
                expect(pauserAdded.status).to.be.true
                expect(pauserAdded.events).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded.address).to.equals(kip7Address)

                expect(await token.isPauser(newPauser)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP7.pause', () => {
        it('CAVERJS-UNIT-KCT-050: should send transaction for pausing without sendParams', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const doPause = await token.pause()
                expect(doPause.from).to.equals(sender.address.toLowerCase())
                expect(doPause.status).to.be.true
                expect(doPause.events).not.to.be.undefined
                expect(doPause.events.Paused).not.to.be.undefined
                expect(doPause.events.Paused.address).to.equals(kip7Address)

                expect(await token.paused()).to.be.true

                await token.unpause({ from: sender.address })
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-051: should send transaction for pausing with sendParams(from)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const doPause = await token.pause({ from: sender.address })
                expect(doPause.from).to.equals(sender.address.toLowerCase())
                expect(doPause.status).to.be.true
                expect(doPause.events).not.to.be.undefined
                expect(doPause.events.Paused).not.to.be.undefined
                expect(doPause.events.Paused.address).to.equals(kip7Address)

                expect(await token.paused()).to.be.true

                await token.unpause({ from: sender.address })
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-052: should send transaction for pausing with sendParams(from, gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                const customGasLimit = '0x30d40'
                const doPause = await token.pause({ from: sender.address, gas: customGasLimit })
                expect(doPause.gas).to.equals(customGasLimit)
                expect(doPause.from).to.equals(sender.address.toLowerCase())
                expect(doPause.status).to.be.true
                expect(doPause.events).not.to.be.undefined
                expect(doPause.events.Paused).not.to.be.undefined
                expect(doPause.events.Paused.address).to.equals(kip7Address)

                expect(await token.paused()).to.be.true

                await token.unpause({ from: sender.address })
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-053: should send transaction for pausing with sendParams(gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const customGasLimit = '0x30d40'
                const doPause = await token.pause({ gas: customGasLimit })
                expect(doPause.from).to.equals(sender.address.toLowerCase())
                expect(doPause.status).to.be.true
                expect(doPause.events).not.to.be.undefined
                expect(doPause.events.Paused).not.to.be.undefined
                expect(doPause.events.Paused.address).to.equals(kip7Address)

                expect(await token.paused()).to.be.true

                await token.unpause({ from: sender.address })
            }
        }).timeout(200000)
    })

    context('KIP7.unpause', () => {
        it('CAVERJS-UNIT-KCT-054: should send transaction for unpausing without sendParams', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                await token.pause({ from: sender.address })

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const doUnpause = await token.unpause()
                expect(doUnpause.from).to.equals(sender.address.toLowerCase())
                expect(doUnpause.status).to.be.true
                expect(doUnpause.events).not.to.be.undefined
                expect(doUnpause.events.Unpaused).not.to.be.undefined
                expect(doUnpause.events.Unpaused.address).to.equals(kip7Address)

                expect(await token.paused()).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-055: should send transaction for unpausing with sendParams(from)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                await token.pause({ from: sender.address })

                const doUnpause = await token.unpause({ from: sender.address })
                expect(doUnpause.from).to.equals(sender.address.toLowerCase())
                expect(doUnpause.status).to.be.true
                expect(doUnpause.events).not.to.be.undefined
                expect(doUnpause.events.Unpaused).not.to.be.undefined
                expect(doUnpause.events.Unpaused.address).to.equals(kip7Address)

                expect(await token.paused()).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-056: should send transaction for unpausing with sendParams(from, gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                await token.pause({ from: sender.address })

                const customGasLimit = '0x30d40'
                const doUnpause = await token.unpause({ from: sender.address, gas: customGasLimit })
                expect(doUnpause.gas).to.equals(customGasLimit)
                expect(doUnpause.from).to.equals(sender.address.toLowerCase())
                expect(doUnpause.status).to.be.true
                expect(doUnpause.events).not.to.be.undefined
                expect(doUnpause.events.Unpaused).not.to.be.undefined
                expect(doUnpause.events.Unpaused.address).to.equals(kip7Address)

                expect(await token.paused()).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-057: should send transaction for unpausing with sendParams(gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                await token.pause({ from: sender.address })

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const customGasLimit = '0x30d40'
                const doUnpause = await token.unpause({ gas: customGasLimit })
                expect(doUnpause.from).to.equals(sender.address.toLowerCase())
                expect(doUnpause.status).to.be.true
                expect(doUnpause.events).not.to.be.undefined
                expect(doUnpause.events.Unpaused).not.to.be.undefined
                expect(doUnpause.events.Unpaused.address).to.equals(kip7Address)

                expect(await token.paused()).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP7.renouncePauser', () => {
        it('CAVERJS-UNIT-KCT-058: should send transaction for removing pauser and trigger PauserRemoved event without sendParams', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                await token.addPauser(testAccount.address, { from: sender.address })
                expect(await token.isPauser(testAccount.address)).to.be.true

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const pauserRemoved = await token.renouncePauser()
                expect(pauserRemoved.from).to.equals(testAccount.address.toLowerCase())
                expect(pauserRemoved.status).to.be.true
                expect(pauserRemoved.events).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved.address).to.equals(kip7Address)

                expect(await token.isPauser(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-059: should send transaction for removing pauser and trigger PauserRemoved event with sendParams(from)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                await token.addPauser(testAccount.address, { from: sender.address })
                expect(await token.isPauser(testAccount.address)).to.be.true

                const pauserRemoved = await token.renouncePauser({ from: testAccount.address })
                expect(pauserRemoved.from).to.equals(testAccount.address.toLowerCase())
                expect(pauserRemoved.status).to.be.true
                expect(pauserRemoved.events).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved.address).to.equals(kip7Address)

                expect(await token.isPauser(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-060: should send transaction for removing pauser and trigger PauserRemoved event with sendParams(from, gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                await token.addPauser(testAccount.address, { from: sender.address })
                expect(await token.isPauser(testAccount.address)).to.be.true

                const customGasLimit = '0x30d40'
                const pauserRemoved = await token.renouncePauser({ from: testAccount.address, gas: customGasLimit })
                expect(pauserRemoved.gas).to.equals(customGasLimit)
                expect(pauserRemoved.from).to.equals(testAccount.address.toLowerCase())
                expect(pauserRemoved.status).to.be.true
                expect(pauserRemoved.events).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved.address).to.equals(kip7Address)

                expect(await token.isPauser(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-061: should send transaction for removing pauser and trigger PauserRemoved event with sendParams(gas)', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                await token.addPauser(testAccount.address, { from: sender.address })
                expect(await token.isPauser(testAccount.address)).to.be.true

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const customGasLimit = '0x30d40'
                const pauserRemoved = await token.renouncePauser({ gas: customGasLimit })
                expect(pauserRemoved.from).to.equals(testAccount.address.toLowerCase())
                expect(pauserRemoved.status).to.be.true
                expect(pauserRemoved.events).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved.address).to.equals(kip7Address)

                expect(await token.isPauser(testAccount.address)).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP7.supportsInterface', () => {
        it('CAVERJS-UNIT-KCT-139: should return true if interfaceId is supported', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)

                // KIP7
                expect(await token.supportsInterface('0x65787371')).to.be.true
                // KIP7Burnable
                expect(await token.supportsInterface('0x3b5a0bf8')).to.be.true
                // KIP7Detailed
                expect(await token.supportsInterface('0xa219a025')).to.be.true
                // KIP7Mintable
                expect(await token.supportsInterface('0xeab83e20')).to.be.true
                // KIP7Pausable
                expect(await token.supportsInterface('0x4d5507ff')).to.be.true

                // Unsupported interfaceId
                expect(await token.supportsInterface('0x3a2820fe')).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP7.detectInterface', () => {
        it('CAVERJS-UNIT-KCT-203: should return valid object if contract is deployed by caver', async () => {
            for (const kip7 of kip7s) {
                const token = new kip7(kip7Address)
                let detected = await token.detectInterface()

                expect(detected.IKIP7).to.be.true
                expect(detected.IKIP7Metadata).to.be.true
                expect(detected.IKIP7Mintable).to.be.true
                expect(detected.IKIP7Burnable).to.be.true
                expect(detected.IKIP7Pausable).to.be.true

                // Test static function
                detected = await kip7.detectInterface(kip7Address)

                expect(detected.IKIP7).to.be.true
                expect(detected.IKIP7Metadata).to.be.true
                expect(detected.IKIP7Mintable).to.be.true
                expect(detected.IKIP7Burnable).to.be.true
                expect(detected.IKIP7Pausable).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-204: should return detected result object with only IKIP7Mintable extension', async () => {
            // Deploy the KIP-7 contract implementing only IKIP7Mintable extension
            const byteCodeWithMintable =
                '0x60806040523480156200001157600080fd5b5060405160208062001fea833981018060405260208110156200003357600080fd5b81019080805190602001909291905050506200005c6301ffc9a760e01b620000b660201b60201c565b62000074636578737160e01b620000b660201b60201c565b6200008533620001bf60201b60201c565b6200009d63eab83e2060e01b620000b660201b60201c565b620000af33826200022060201b60201c565b5062000639565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916141562000153576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f4b495031333a20696e76616c696420696e74657266616365206964000000000081525060200191505060405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b620001da816004620003ec60201b6200167d1790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415620002c4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f4b4950373a206d696e7420746f20746865207a65726f2061646472657373000081525060200191505060405180910390fd5b620002e081600354620004d060201b620015f51790919060201c565b6003819055506200033f81600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054620004d060201b620015f51790919060201c565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b620003fe82826200055960201b60201c565b1562000472576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b6000808284019050838110156200054f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415620005e2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602281526020018062001fc86022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b61197f80620006496000396000f3fe608060405234801561001057600080fd5b50600436106100f55760003560e01c806370a0823111610097578063aa271e1a11610066578063aa271e1a14610497578063b88d4fde146104f3578063dd62ed3e146105f8578063eb79554914610670576100f5565b806370a082311461038b578063983b2d56146103e35780639865027514610427578063a9059cbb14610431576100f5565b806323b872dd116100d357806323b872dd146101e357806340c10f1914610269578063423f6cef146102cf57806342842e0e1461031d576100f5565b806301ffc9a7146100fa578063095ea7b31461015f57806318160ddd146101c5575b600080fd5b6101456004803603602081101561011057600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19169060200190929190505050610755565b604051808215151515815260200191505060405180910390f35b6101ab6004803603604081101561017557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506107bc565b604051808215151515815260200191505060405180910390f35b6101cd6107d3565b6040518082815260200191505060405180910390f35b61024f600480360360608110156101f957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506107dd565b604051808215151515815260200191505060405180910390f35b6102b56004803603604081101561027f57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919050505061088e565b604051808215151515815260200191505060405180910390f35b61031b600480360360408110156102e557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610902565b005b6103896004803603606081101561033357600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610920565b005b6103cd600480360360208110156103a157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610940565b6040518082815260200191505060405180910390f35b610425600480360360208110156103f957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610989565b005b61042f6109f3565b005b61047d6004803603604081101561044757600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506109fe565b604051808215151515815260200191505060405180910390f35b6104d9600480360360208110156104ad57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610a15565b604051808215151515815260200191505060405180910390f35b6105f66004803603608081101561050957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019064010000000081111561057057600080fd5b82018360208201111561058257600080fd5b803590602001918460018302840111640100000000831117156105a457600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050610a32565b005b61065a6004803603604081101561060e57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610aa5565b6040518082815260200191505060405180910390f35b6107536004803603606081101561068657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156106cd57600080fd5b8201836020820111156106df57600080fd5b8035906020019184600183028401116401000000008311171561070157600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050610b2c565b005b6000806000837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff169050919050565b60006107c9338484610b9d565b6001905092915050565b6000600354905090565b60006107ea848484610d94565b610883843361087e85600260008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461103490919063ffffffff16565b610b9d565b600190509392505050565b600061089933610a15565b6108ee576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603081526020018061189a6030913960400191505060405180910390fd5b6108f883836110bd565b6001905092915050565b61091c828260405180602001604052806000815250610b2c565b5050565b61093b83838360405180602001604052806000815250610a32565b505050565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b61099233610a15565b6109e7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252603081526020018061189a6030913960400191505060405180910390fd5b6109f08161127a565b50565b6109fc336112d4565b565b6000610a0b338484610d94565b6001905092915050565b6000610a2b82600461132e90919063ffffffff16565b9050919050565b610a3d8484846107dd565b50610a4a8484848461140c565b610a9f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e81526020018061184a602e913960400191505060405180910390fd5b50505050565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b610b3683836109fe565b50610b433384848461140c565b610b98576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e81526020018061184a602e913960400191505060405180910390fd5b505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610c23576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260238152602001806119316023913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610ca9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806118296021913960400191505060405180910390fd5b80600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040518082815260200191505060405180910390a3505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610e1a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001806118eb6024913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610ea0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806118786022913960400191505060405180910390fd5b610ef281600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461103490919063ffffffff16565b600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610f8781600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546115f590919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a3505050565b6000828211156110ac576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f536166654d6174683a207375627472616374696f6e206f766572666c6f77000081525060200191505060405180910390fd5b600082840390508091505092915050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611160576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f4b4950373a206d696e7420746f20746865207a65726f2061646472657373000081525060200191505060405180910390fd5b611175816003546115f590919063ffffffff16565b6003819055506111cd81600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546115f590919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b61128e81600461167d90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b6112e881600461175890919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fe94479a9f7e1952cc78f2d6baab678adc1b772d936c6583def489e524cb6669260405160405180910390a250565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156113b5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602281526020018061190f6022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b600061142d8473ffffffffffffffffffffffffffffffffffffffff16611815565b61143a57600190506115ed565b60008473ffffffffffffffffffffffffffffffffffffffff16639d188c22338887876040518563ffffffff1660e01b8152600401808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b838110156115155780820151818401526020810190506114fa565b50505050905090810190601f1680156115425780820380516001836020036101000a031916815260200191505b5095505050505050602060405180830381600087803b15801561156457600080fd5b505af1158015611578573d6000803e3d6000fd5b505050506040513d602081101561158e57600080fd5b81019080805190602001909291905050509050639d188c2260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149150505b949350505050565b600080828401905083811015611673576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b611687828261132e565b156116fa576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b611762828261132e565b6117b7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260218152602001806118ca6021913960400191505060405180910390fd5b60008260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b600080823b90506000811191505091905056fe4b4950373a20617070726f766520746f20746865207a65726f20616464726573734b4950373a207472616e7366657220746f206e6f6e204b495037526563656976657220696d706c656d656e7465724b4950373a207472616e7366657220746f20746865207a65726f20616464726573734d696e746572526f6c653a2063616c6c657220646f6573206e6f74206861766520746865204d696e74657220726f6c65526f6c65733a206163636f756e7420646f6573206e6f74206861766520726f6c654b4950373a207472616e736665722066726f6d20746865207a65726f2061646472657373526f6c65733a206163636f756e7420697320746865207a65726f20616464726573734b4950373a20617070726f76652066726f6d20746865207a65726f2061646472657373a165627a7a723058208a7b2477a3befbd83e78ac12086b96a9c9d0acccbc5ed2544c3fa5c6ee326c3d0029526f6c65733a206163636f756e7420697320746865207a65726f2061646472657373'
            const abiWithMintable = [
                {
                    inputs: [{ name: 'initialSupply', type: 'uint256' }],
                    payable: false,
                    stateMutability: 'nonpayable',
                    type: 'constructor',
                },
            ]

            const deployed = await new caver.contract(abiWithMintable)
                .deploy({
                    data: byteCodeWithMintable,
                    arguments: ['100000000000'],
                })
                .send({ from: sender.address, gas: 10000000 })

            const contractAddress = deployed.options.address

            for (const kip7 of kip7s) {
                const token = new kip7(contractAddress)
                let detected = await token.detectInterface()

                expect(detected.IKIP7).to.be.true
                expect(detected.IKIP7Metadata).to.be.false
                expect(detected.IKIP7Mintable).to.be.true
                expect(detected.IKIP7Burnable).to.be.false
                expect(detected.IKIP7Pausable).to.be.false

                // Test static function
                detected = await kip7.detectInterface(contractAddress)

                expect(detected.IKIP7).to.be.true
                expect(detected.IKIP7Metadata).to.be.false
                expect(detected.IKIP7Mintable).to.be.true
                expect(detected.IKIP7Burnable).to.be.false
                expect(detected.IKIP7Pausable).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-205: should return detected result object without only IKIP7Pausable and IKIP7Burnable extensions', async () => {
            // Deploy the KIP-7 contract not implementing IKIP7Pausable and IKIP7Burnable extensions
            const byteCodeWithoutBurnablePausable =
                '0x60806040523480156200001157600080fd5b506040516200245f3803806200245f833981018060405260808110156200003757600080fd5b8101908080516401000000008111156200005057600080fd5b828101905060208101848111156200006757600080fd5b81518560018202830111640100000000821117156200008557600080fd5b50509291906020018051640100000000811115620000a257600080fd5b82810190506020810184811115620000b957600080fd5b8151856001820283011164010000000082111715620000d757600080fd5b50509291906020018051906020019092919080519060200190929190505050838383620001116301ffc9a760e01b620001d660201b60201c565b62000129636578737160e01b620001d660201b60201c565b6200013a33620002df60201b60201c565b6200015263eab83e2060e01b620001d660201b60201c565b82600590805190602001906200016a92919062000759565b5081600690805190602001906200018392919062000759565b5080600760006101000a81548160ff021916908360ff160217905550620001b763a219a02560e01b620001d660201b60201c565b505050620001cc33826200034060201b60201c565b5050505062000808565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916141562000273576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f4b495031333a20696e76616c696420696e74657266616365206964000000000081525060200191505060405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b620002fa8160046200050c60201b620019231790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415620003e4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f4b4950373a206d696e7420746f20746865207a65726f2061646472657373000081525060200191505060405180910390fd5b6200040081600354620005f060201b6200189b1790919060201c565b6003819055506200045f81600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054620005f060201b6200189b1790919060201c565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b6200051e82826200067960201b60201c565b1562000592576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b6000808284019050838110156200066f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141562000702576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806200243d6022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200079c57805160ff1916838001178555620007cd565b82800160010185558215620007cd579182015b82811115620007cc578251825591602001919060010190620007af565b5b509050620007dc9190620007e0565b5090565b6200080591905b8082111562000801576000816000905550600101620007e7565b5090565b90565b611c2580620008186000396000f3fe608060405234801561001057600080fd5b50600436106101165760003560e01c806370a08231116100a2578063a9059cbb11610071578063a9059cbb1461057c578063aa271e1a146105e2578063b88d4fde1461063e578063dd62ed3e14610743578063eb795549146107bb57610116565b806370a082311461045357806395d89b41146104ab578063983b2d561461052e578063986502751461057257610116565b806323b872dd116100e957806323b872dd14610287578063313ce5671461030d57806340c10f1914610331578063423f6cef1461039757806342842e0e146103e557610116565b806301ffc9a71461011b57806306fdde0314610180578063095ea7b31461020357806318160ddd14610269575b600080fd5b6101666004803603602081101561013157600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191690602001909291905050506108a0565b604051808215151515815260200191505060405180910390f35b610188610907565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156101c85780820151818401526020810190506101ad565b50505050905090810190601f1680156101f55780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61024f6004803603604081101561021957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506109a9565b604051808215151515815260200191505060405180910390f35b6102716109c0565b6040518082815260200191505060405180910390f35b6102f36004803603606081101561029d57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506109ca565b604051808215151515815260200191505060405180910390f35b610315610a7b565b604051808260ff1660ff16815260200191505060405180910390f35b61037d6004803603604081101561034757600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610a92565b604051808215151515815260200191505060405180910390f35b6103e3600480360360408110156103ad57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610b06565b005b610451600480360360608110156103fb57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610b24565b005b6104956004803603602081101561046957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610b44565b6040518082815260200191505060405180910390f35b6104b3610b8d565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156104f35780820151818401526020810190506104d8565b50505050905090810190601f1680156105205780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6105706004803603602081101561054457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610c2f565b005b61057a610c99565b005b6105c86004803603604081101561059257600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610ca4565b604051808215151515815260200191505060405180910390f35b610624600480360360208110156105f857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610cbb565b604051808215151515815260200191505060405180910390f35b6107416004803603608081101561065457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156106bb57600080fd5b8201836020820111156106cd57600080fd5b803590602001918460018302840111640100000000831117156106ef57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050610cd8565b005b6107a56004803603604081101561075957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610d4b565b6040518082815260200191505060405180910390f35b61089e600480360360608110156107d157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019064010000000081111561081857600080fd5b82018360208201111561082a57600080fd5b8035906020019184600183028401116401000000008311171561084c57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050610dd2565b005b6000806000837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff169050919050565b606060058054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561099f5780601f106109745761010080835404028352916020019161099f565b820191906000526020600020905b81548152906001019060200180831161098257829003601f168201915b5050505050905090565b60006109b6338484610e43565b6001905092915050565b6000600354905090565b60006109d784848461103a565b610a708433610a6b85600260008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546112da90919063ffffffff16565b610e43565b600190509392505050565b6000600760009054906101000a900460ff16905090565b6000610a9d33610cbb565b610af2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180611b406030913960400191505060405180910390fd5b610afc8383611363565b6001905092915050565b610b20828260405180602001604052806000815250610dd2565b5050565b610b3f83838360405180602001604052806000815250610cd8565b505050565b6000600160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b606060068054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610c255780601f10610bfa57610100808354040283529160200191610c25565b820191906000526020600020905b815481529060010190602001808311610c0857829003601f168201915b5050505050905090565b610c3833610cbb565b610c8d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180611b406030913960400191505060405180910390fd5b610c9681611520565b50565b610ca23361157a565b565b6000610cb133848461103a565b6001905092915050565b6000610cd18260046115d490919063ffffffff16565b9050919050565b610ce38484846109ca565b50610cf0848484846116b2565b610d45576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e815260200180611af0602e913960400191505060405180910390fd5b50505050565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b610ddc8383610ca4565b50610de9338484846116b2565b610e3e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e815260200180611af0602e913960400191505060405180910390fd5b505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610ec9576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526023815260200180611bd76023913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610f4f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180611acf6021913960400191505060405180910390fd5b80600260008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925836040518082815260200191505060405180910390a3505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614156110c0576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526024815260200180611b916024913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611146576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526022815260200180611b1e6022913960400191505060405180910390fd5b61119881600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546112da90919063ffffffff16565b600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190555061122d81600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461189b90919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a3505050565b600082821115611352576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f536166654d6174683a207375627472616374696f6e206f766572666c6f77000081525060200191505060405180910390fd5b600082840390508091505092915050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611406576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f4b4950373a206d696e7420746f20746865207a65726f2061646472657373000081525060200191505060405180910390fd5b61141b8160035461189b90919063ffffffff16565b60038190555061147381600160008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461189b90919063ffffffff16565b600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508173ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040518082815260200191505060405180910390a35050565b61153481600461192390919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b61158e8160046119fe90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fe94479a9f7e1952cc78f2d6baab678adc1b772d936c6583def489e524cb6669260405160405180910390a250565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561165b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526022815260200180611bb56022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b60006116d38473ffffffffffffffffffffffffffffffffffffffff16611abb565b6116e05760019050611893565b60008473ffffffffffffffffffffffffffffffffffffffff16639d188c22338887876040518563ffffffff1660e01b8152600401808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b838110156117bb5780820151818401526020810190506117a0565b50505050905090810190601f1680156117e85780820380516001836020036101000a031916815260200191505b5095505050505050602060405180830381600087803b15801561180a57600080fd5b505af115801561181e573d6000803e3d6000fd5b505050506040513d602081101561183457600080fd5b81019080805190602001909291905050509050639d188c2260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149150505b949350505050565b600080828401905083811015611919576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b61192d82826115d4565b156119a0576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b611a0882826115d4565b611a5d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180611b706021913960400191505060405180910390fd5b60008260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b600080823b90506000811191505091905056fe4b4950373a20617070726f766520746f20746865207a65726f20616464726573734b4950373a207472616e7366657220746f206e6f6e204b495037526563656976657220696d706c656d656e7465724b4950373a207472616e7366657220746f20746865207a65726f20616464726573734d696e746572526f6c653a2063616c6c657220646f6573206e6f74206861766520746865204d696e74657220726f6c65526f6c65733a206163636f756e7420646f6573206e6f74206861766520726f6c654b4950373a207472616e736665722066726f6d20746865207a65726f2061646472657373526f6c65733a206163636f756e7420697320746865207a65726f20616464726573734b4950373a20617070726f76652066726f6d20746865207a65726f2061646472657373a165627a7a7230582038f1cf7c9b15c61ab7c78564198e79d88eb545130b79cde885f96529521316950029526f6c65733a206163636f756e7420697320746865207a65726f2061646472657373'
            const abiWithoutBurnablePausable = [
                {
                    inputs: [
                        { name: 'name', type: 'string' },
                        { name: 'symbol', type: 'string' },
                        { name: 'decimals', type: 'uint8' },
                        { name: 'initialSupply', type: 'uint256' },
                    ],
                    payable: false,
                    stateMutability: 'nonpayable',
                    type: 'constructor',
                },
            ]

            const deployed = await new caver.contract(abiWithoutBurnablePausable)
                .deploy({
                    data: byteCodeWithoutBurnablePausable,
                    arguments: ['Test', 'TST', 18, '100000000000'],
                })
                .send({ from: sender.address, gas: 10000000 })
            const contractAddress = deployed.options.address

            for (const kip7 of kip7s) {
                const token = new kip7(contractAddress)
                let detected = await token.detectInterface()

                expect(detected.IKIP7).to.be.true
                expect(detected.IKIP7Metadata).to.be.true
                expect(detected.IKIP7Mintable).to.be.true
                expect(detected.IKIP7Burnable).to.be.false
                expect(detected.IKIP7Pausable).to.be.false

                // Test static function
                detected = await kip7.detectInterface(contractAddress)

                expect(detected.IKIP7).to.be.true
                expect(detected.IKIP7Metadata).to.be.true
                expect(detected.IKIP7Mintable).to.be.true
                expect(detected.IKIP7Burnable).to.be.false
                expect(detected.IKIP7Pausable).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-206: should throw an error if the KIP-13 specification is not satisfied ', async () => {
            const byteCode =
                '0x608060405234801561001057600080fd5b5061051f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063693ec85e1461003b578063e942b5161461016f575b600080fd5b6100f46004803603602081101561005157600080fd5b810190808035906020019064010000000081111561006e57600080fd5b82018360208201111561008057600080fd5b803590602001918460018302840111640100000000831117156100a257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506102c1565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610134578082015181840152602081019050610119565b50505050905090810190601f1680156101615780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102bf6004803603604081101561018557600080fd5b81019080803590602001906401000000008111156101a257600080fd5b8201836020820111156101b457600080fd5b803590602001918460018302840111640100000000831117156101d657600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561023957600080fd5b82018360208201111561024b57600080fd5b8035906020019184600183028401116401000000008311171561026d57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506103cc565b005b60606000826040518082805190602001908083835b602083106102f957805182526020820191506020810190506020830392506102d6565b6001836020036101000a03801982511681845116808217855250505050505090500191505090815260200160405180910390208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156103c05780601f10610395576101008083540402835291602001916103c0565b820191906000526020600020905b8154815290600101906020018083116103a357829003601f168201915b50505050509050919050565b806000836040518082805190602001908083835b6020831061040357805182526020820191506020810190506020830392506103e0565b6001836020036101000a0380198251168184511680821785525050505050509050019150509081526020016040518091039020908051906020019061044992919061044e565b505050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061048f57805160ff19168380011785556104bd565b828001600101855582156104bd579182015b828111156104bc5782518255916020019190600101906104a1565b5b5090506104ca91906104ce565b5090565b6104f091905b808211156104ec5760008160009055506001016104d4565b5090565b9056fea165627a7a723058203ffebc792829e0434ecc495da1b53d24399cd7fff506a4fd03589861843e14990029'
            const abi = [
                {
                    constant: true,
                    inputs: [{ name: 'key', type: 'string' }],
                    name: 'get',
                    outputs: [{ name: '', type: 'string' }],
                    payable: false,
                    stateMutability: 'view',
                    type: 'function',
                },
                {
                    constant: false,
                    inputs: [{ name: 'key', type: 'string' }, { name: 'value', type: 'string' }],
                    name: 'set',
                    outputs: [],
                    payable: false,
                    stateMutability: 'nonpayable',
                    type: 'function',
                },
            ]

            const deployed = await new caver.contract(abi)
                .deploy({
                    data: byteCode,
                })
                .send({ from: sender.address, gas: 10000000 })
            const contractAddress = deployed.options.address

            for (const kip7 of kip7s) {
                const token = new kip7(contractAddress)

                const expectedError = `This contract does not support KIP-13.`
                await expect(token.detectInterface()).to.be.rejectedWith(expectedError)
                await expect(kip7.detectInterface(contractAddress)).to.be.rejectedWith(expectedError)
            }
        }).timeout(200000)
    })

    context('KIP7 with fee delegation', () => {
        const contractDeployFormatter = receipt => {
            return receipt
        }

        it('CAVERJS-UNIT-KCT-222: should send TxTypeSmartContractDeploy to deploy when feeDelegation is defined as true', async () => {
            const deployed = await caver.kct.kip7.deploy(
                {
                    name: 'Jasmine',
                    symbol: 'JAS',
                    decimals: 18,
                    initialSupply: '10000000000000000000',
                },
                {
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    contractDeployFormatter,
                }
            )

            expect(deployed.from).to.equals(sender.address.toLowerCase())
            expect(deployed.status).to.be.true
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-223: should send TxTypeFeeDelegatedSmartContractDeployWithRatio to deploy when feeRatio is defined and feeDelegation is defined as true', async () => {
            const deployed = await caver.kct.kip7.deploy(
                {
                    name: 'Jasmine',
                    symbol: 'JAS',
                    decimals: 18,
                    initialSupply: '10000000000000000000',
                },
                {
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    feeRatio: 30,
                    contractDeployFormatter,
                }
            )

            expect(deployed.from).to.equals(sender.address.toLowerCase())
            expect(deployed.status).to.be.true
            expect(deployed.feeRatio).to.equal(caver.utils.numberToHex(30))
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeployWithRatio)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-224: should send TxTypeSmartContractExecution to add minter when feeDelegation is defined as true', async () => {
            const token = caver.kct.kip7.create(kip7Address)

            const added = await token.addMinter(caver.wallet.keyring.generate().address, {
                from: sender.address,
                feeDelegation: true,
                feePayer: feePayer.address,
            })

            expect(added.from).to.equals(sender.address.toLowerCase())
            expect(added.status).to.be.true
            expect(added.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-225: should send TxTypeSmartContractExecution to add minter when feeDelegation is defined as true via options', async () => {
            const token = caver.kct.kip7.create(kip7Address)

            token.options.from = sender.address
            token.options.feeDelegation = true
            token.options.feePayer = feePayer.address

            const added = await token.addMinter(caver.wallet.keyring.generate().address)

            expect(added.from).to.equals(sender.address.toLowerCase())
            expect(added.status).to.be.true
            expect(added.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-226: should send TxTypeFeeDelegatedSmartContractExecutionWithRatio to add minter when feeRatio is defined and feeDelegation is defined as true', async () => {
            const token = caver.kct.kip7.create(kip7Address)

            const added = await token.addMinter(caver.wallet.keyring.generate().address, {
                from: sender.address,
                feeDelegation: true,
                feePayer: feePayer.address,
                feeRatio: 30,
            })

            expect(added.from).to.equals(sender.address.toLowerCase())
            expect(added.status).to.be.true
            expect(added.feeRatio).to.equal(caver.utils.numberToHex(30))
            expect(added.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-227: should send TxTypeFeeDelegatedSmartContractExecutionWithRatio to add minter when feeRatio is defined and feeDelegation is defined as true via options', async () => {
            const token = caver.kct.kip7.create(kip7Address)

            token.options.from = sender.address
            token.options.feeDelegation = true
            token.options.feePayer = feePayer.address
            token.options.feeRatio = 30

            const added = await token.addMinter(caver.wallet.keyring.generate().address)

            expect(added.from).to.equals(sender.address.toLowerCase())
            expect(added.status).to.be.true
            expect(added.feeRatio).to.equal(caver.utils.numberToHex(30))
            expect(added.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-228: should overwrite contract.options when user send sendOptions parameter', async () => {
            const token = caver.kct.kip7.create(kip7Address)

            token.options.from = feePayer.address
            token.options.feeDelegation = false
            token.options.feePayer = sender.address
            token.options.feeRatio = 50

            const added = await token.addMinter(caver.wallet.keyring.generate().address, {
                from: sender.address,
                feeDelegation: true,
                feePayer: feePayer.address,
                feeRatio: 30,
                gas: 1231234,
            })

            expect(added.from).to.equals(sender.address.toLowerCase())
            expect(added.status).to.be.true
            expect(added.feeRatio).to.equal(caver.utils.numberToHex(30))
            expect(added.gas).to.equal(caver.utils.numberToHex(1231234))
            expect(added.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecutionWithRatio)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-229: should sign and return signed TxTypeFeeDelegatedSmartContractDeploy', async () => {
            const token = caver.kct.kip7.create()

            const signed = await token.sign(
                {
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    gas: 30000000,
                },
                'constructor',
                caver.kct.kip7.byteCode,
                'Jasmine',
                'JAS',
                18,
                '10000000000000000000'
            )

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            await caver.wallet.signAsFeePayer(feePayer.address, signed)

            const deployed = await caver.rpc.klay.sendRawTransaction(signed)

            expect(deployed.from).to.equals(sender.address.toLowerCase())
            expect(deployed.feePayer).to.equals(feePayer.address.toLowerCase())
            expect(deployed.status).to.equal('0x1')
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-230: should sign as fee payer and return signed TxTypeFeeDelegatedSmartContractDeploy', async () => {
            const token = caver.kct.kip7.create()

            const signed = await token.signAsFeePayer(
                {
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    gas: 30000000,
                },
                'constructor',
                caver.kct.kip7.byteCode,
                'Jasmine',
                'JAS',
                18,
                '10000000000000000000'
            )

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)

            await caver.wallet.sign(sender.address, signed)

            const deployed = await caver.rpc.klay.sendRawTransaction(signed)

            expect(deployed.from).to.equals(sender.address.toLowerCase())
            expect(deployed.feePayer).to.equals(feePayer.address.toLowerCase())
            expect(deployed.status).to.equal('0x1')
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractDeploy)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-231: should sign and return signed TxTypeFeeDelegatedSmartContractExecution', async () => {
            const token = caver.kct.kip7.create(kip7Address)

            const signed = await token.sign(
                {
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    gas: 30000000,
                },
                'addMinter',
                caver.wallet.keyring.generate().address
            )

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.signatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            await caver.wallet.signAsFeePayer(feePayer.address, signed)

            const deployed = await caver.rpc.klay.sendRawTransaction(signed)

            expect(deployed.from).to.equals(sender.address.toLowerCase())
            expect(deployed.feePayer).to.equals(feePayer.address.toLowerCase())
            expect(deployed.status).to.equal('0x1')
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-232: should sign as fee payer and return signed TxTypeFeeDelegatedSmartContractExecution', async () => {
            const token = caver.kct.kip7.create(kip7Address)

            const signed = await token.signAsFeePayer(
                {
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    gas: 30000000,
                },
                'addMinter',
                caver.wallet.keyring.generate().address
            )

            expect(signed.from).to.equal(sender.address)
            expect(signed.feePayer).to.equal(feePayer.address)
            expect(caver.utils.isEmptySig(signed.feePayerSignatures)).to.be.false
            expect(signed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)

            await caver.wallet.sign(sender.address, signed)

            const deployed = await caver.rpc.klay.sendRawTransaction(signed)

            expect(deployed.from).to.equals(sender.address.toLowerCase())
            expect(deployed.feePayer).to.equals(feePayer.address.toLowerCase())
            expect(deployed.status).to.equal('0x1')
            expect(deployed.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)
        }).timeout(200000)
    })
})
