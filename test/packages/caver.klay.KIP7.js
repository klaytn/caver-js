/* eslint-disable no-loop-func */
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

const Caver = require('../../index.js')

let caver
let caver2
let kip7s
let sender
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

    const txObject = new caver.transaction.valueTransfer({
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
                const newTokenInfo = Object.assign({}, tokenInfo)
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
})
