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
let kip17s
let sender
let feePayer
let testAccount
let receiver

let tokenId = 0

const ownerMap = {}

let kip17Address

const tokenInfo = {
    name: 'Jasmine',
    symbol: 'JAS',
}

const tokenURI = 'https://game.example/item-id-8u5h2m.json'

const prepareTestSetting = async () => {
    testAccount = caver.wallet.add(caver.wallet.keyring.generate())
    receiver = caver.wallet.add(caver.wallet.keyring.generate())
    ownerMap[testAccount.address] = []
    ownerMap[receiver.address] = []

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
    // caver is for testing caver.kct.kip17
    caver = new Caver(testRPCURL)

    // caver2 is for testing kip17
    caver2 = new Caver(testRPCURL)

    const senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    sender = caver.wallet.keyring.createFromPrivateKey(senderPrvKey)
    caver.wallet.add(sender)
    ownerMap[sender.address] = []

    const feePayerPrvKey =
        process.env.privateKey2 && String(process.env.privateKey2).indexOf('0x') === -1
            ? `0x${process.env.privateKey2}`
            : process.env.privateKey2

    feePayer = caver.wallet.keyring.createFromPrivateKey(feePayerPrvKey)
    caver.wallet.add(feePayer)

    caver2.klay.accounts.wallet.add(senderPrvKey)

    kip17s = [caver.kct.kip17, caver2.klay.KIP17]

    prepareTestSetting().then(() => done())
})

describe('KIP17 token contract class test', () => {
    context('kip17 toekn contract deploy', () => {
        it('CAVERJS-UNIT-KCT-062: should deploy non fungible token contract and return KIP17 instance', async () => {
            for (const kip17 of kip17s) {
                const deployed = await kip17.deploy(tokenInfo, sender.address)

                expect(deployed.options.address).not.to.be.undefined

                const account = await caver.klay.getAccount(deployed.options.address)

                expect(account.accType).to.equals(2)
                expect(account.account.key.keyType).to.equals(3)

                kip17Address = deployed.options.address
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-063: should throw error when token information is insufficient or invalid', async () => {
            for (const kip17 of kip17s) {
                let expectedError = 'Invalid name of token'
                let insufficientToken = {}
                let invalidToken = { name: 1 }
                expect(() => kip17.deploy(insufficientToken, sender.address)).to.throws(expectedError)
                expect(() => kip17.deploy(invalidToken, sender.address)).to.throws(expectedError)

                expectedError = 'Invalid symbol of token'
                insufficientToken = { name: 'Jasmine' }
                invalidToken = { name: 'Jasmine', symbol: 1 }
                expect(() => kip17.deploy(insufficientToken, sender.address)).to.throws(expectedError)
                expect(() => kip17.deploy(invalidToken, sender.address)).to.throws(expectedError)
            }
        }).timeout(200000)
    })

    context('KIP17.clone', () => {
        it('CAVERJS-UNIT-KCT-064: should clone KIP17 instance with new token contract address', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const newTokenContract = caver.klay.accounts.create().address
                const cloned = token.clone(newTokenContract)

                expect(cloned.options.address).to.equals(newTokenContract)
                expect(cloned.options.address).not.to.equals(token.options.address)
            }
        }).timeout(200000)
    })

    context('KIP17.name', () => {
        it('CAVERJS-UNIT-KCT-065: should call name method', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const name = await token.name()

                expect(name).to.equals(tokenInfo.name)
            }
        }).timeout(200000)
    })

    context('KIP17.symbol', () => {
        it('CAVERJS-UNIT-KCT-066: should call symbol method', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const symbol = await token.symbol()

                expect(symbol).to.equals(tokenInfo.symbol)
            }
        }).timeout(200000)
    })

    context('KIP17.totalSupply', () => {
        let expectedTotal = 0
        it('CAVERJS-UNIT-KCT-067: should call totalSupply method', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                let totalSupply = await token.totalSupply()
                expect(totalSupply.eq(expectedTotal)).to.be.true

                await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(tokenId)
                expectedTotal++
                tokenId++

                totalSupply = await token.totalSupply()
                expect(totalSupply.eq(expectedTotal)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP17.tokenURI', () => {
        it('CAVERJS-UNIT-KCT-068: should call tokenURI method', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                let uri = await token.tokenURI(new BigNumber(0))
                expect(uri).to.equals(tokenURI)

                uri = await token.tokenURI(0)
                expect(uri).to.equals(tokenURI)

                uri = await token.tokenURI('0')
                expect(uri).to.equals(tokenURI)
            }
        }).timeout(200000)
    })

    context('KIP17.tokenOfOwnerByIndex', () => {
        it('CAVERJS-UNIT-KCT-069: should call tokenOfOwnerByIndex method', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const tokenByIndex = await token.tokenOfOwnerByIndex(sender.address, 0)
                expect(tokenByIndex.eq(0)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP17.tokenByIndex', () => {
        it('CAVERJS-UNIT-KCT-070: should call tokenByIndex method', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                let tokenByIndex = await token.tokenByIndex(0)
                expect(tokenByIndex.eq(0)).to.be.true

                await token.mintWithTokenURI(testAccount.address, tokenId, tokenURI, { from: sender.address })
                ownerMap[testAccount.address].push(tokenId)
                tokenId++

                tokenByIndex = await token.tokenByIndex(1)
                expect(tokenByIndex.eq(1)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP17.balanceOf', () => {
        it('CAVERJS-UNIT-KCT-071: should call balanceOf method', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                let balance = await token.balanceOf(sender.address)
                expect(balance.eq(0)).to.be.false

                balance = await token.balanceOf(caver.klay.accounts.create().address)
                expect(balance.eq(0)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP17.ownerOf', () => {
        it('CAVERJS-UNIT-KCT-072: should call balanceOf method', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                let owner = await token.ownerOf('0')
                expect(owner.toLowerCase()).to.equals(sender.address.toLowerCase())

                owner = await token.ownerOf(new BigNumber(tokenId - 1))
                expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())
            }
        }).timeout(200000)
    })

    context('KIP17.getApproved', () => {
        let approvedId = 0
        it('CAVERJS-UNIT-KCT-073: should call getApproved method', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                let approved = await token.getApproved(approvedId)
                expect(approved).to.equals('0x0000000000000000000000000000000000000000')

                await token.approve(testAccount.address, approvedId, { from: sender.address })
                approvedId++

                approved = await token.getApproved(new BigNumber(0))
                expect(approved.toLowerCase()).to.equals(testAccount.address.toLowerCase())
            }
        }).timeout(200000)
    })

    context('KIP17.isApprovedForAll', () => {
        it('CAVERJS-UNIT-KCT-074: should call isApprovedForAll method', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                let isApprovedForAll = await token.isApprovedForAll(sender.address, testAccount.address)
                expect(isApprovedForAll).to.be.false

                await token.setApprovalForAll(testAccount.address, true, { from: sender.address })

                isApprovedForAll = await token.isApprovedForAll(sender.address, testAccount.address)
                expect(isApprovedForAll).to.be.true

                await token.setApprovalForAll(testAccount.address, false, { from: sender.address })
            }
        }).timeout(200000)
    })

    context('KIP17.isMinter', () => {
        it('CAVERJS-UNIT-KCT-075: should call isMinter method', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                let isMinter = await token.isMinter(sender.address)
                expect(isMinter).to.be.true

                isMinter = await token.isMinter(testAccount.address)
                expect(isMinter).to.be.false

                await token.addMinter(testAccount.address, { from: sender.address })

                isMinter = await token.isMinter(testAccount.address)
                expect(isMinter).to.be.true

                await token.renounceMinter({ from: testAccount.address })

                isMinter = await token.isMinter(testAccount.address)
                expect(isMinter).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP17.paused', () => {
        it('CAVERJS-UNIT-KCT-076: should call paused method', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                let paused = await token.paused()
                expect(paused).to.be.false

                await token.pause({ from: sender.address })

                paused = await token.paused()
                expect(paused).to.be.true

                await token.unpause({ from: sender.address })

                paused = await token.paused()
                expect(paused).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP17.isPauser', () => {
        it('CAVERJS-UNIT-KCT-077: should call isPauser method', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                let isPauser = await token.isPauser(sender.address)
                expect(isPauser).to.be.true

                isPauser = await token.isPauser(testAccount.address)
                expect(isPauser).to.be.false

                await token.addPauser(testAccount.address, { from: sender.address })

                isPauser = await token.isPauser(testAccount.address)
                expect(isPauser).to.be.true

                await token.renouncePauser({ from: testAccount.address })

                isPauser = await token.isPauser(testAccount.address)
                expect(isPauser).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP17.approve', () => {
        it('CAVERJS-UNIT-KCT-078: should send transaction for calling approve method and set approve with token id without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const approved = await token.approve(testAccount.address, mintedTokenId)
                expect(approved.from).to.be.equals(sender.address.toLowerCase())
                expect(approved.status).to.be.true
                expect(approved.events).not.to.be.undefined
                expect(approved.events.Approval).not.to.be.undefined
                expect(approved.events.Approval.address).to.equals(kip17Address)

                const getApproved = await token.getApproved(mintedTokenId)

                expect(getApproved.toLowerCase()).to.equals(testAccount.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-079: should send transaction for calling approve method and set approve with token id with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                const approved = await token.approve(testAccount.address, mintedTokenId, { from: sender.address })
                expect(approved.from).to.be.equals(sender.address.toLowerCase())
                expect(approved.status).to.be.true
                expect(approved.events).not.to.be.undefined
                expect(approved.events.Approval).not.to.be.undefined
                expect(approved.events.Approval.address).to.equals(kip17Address)

                const getApproved = await token.getApproved(mintedTokenId)

                expect(getApproved.toLowerCase()).to.equals(testAccount.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-080: should send transaction for calling approve method and set approve with token id with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                const customGasLimit = '0x186a0'

                const approved = await token.approve(testAccount.address, mintedTokenId, { from: sender.address, gas: customGasLimit })
                expect(approved.gas).to.equals(customGasLimit)
                expect(approved.status).to.be.true
                expect(approved.events).not.to.be.undefined
                expect(approved.events.Approval).not.to.be.undefined
                expect(approved.events.Approval.address).to.equals(kip17Address)

                const getApproved = await token.getApproved(mintedTokenId)

                expect(getApproved.toLowerCase()).to.equals(testAccount.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-081: should send transaction for calling approve method and set approve with token id with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                const customGasLimit = '0x186a0'

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const approved = await token.approve(testAccount.address, mintedTokenId, { gas: customGasLimit })
                expect(approved.from).to.be.equals(sender.address.toLowerCase())
                expect(approved.gas).to.equals(customGasLimit)
                expect(approved.status).to.be.true
                expect(approved.events).not.to.be.undefined
                expect(approved.events.Approval).not.to.be.undefined
                expect(approved.events.Approval.address).to.equals(kip17Address)

                const getApproved = await token.getApproved(mintedTokenId)

                expect(getApproved.toLowerCase()).to.equals(testAccount.address.toLowerCase())
            }
        }).timeout(200000)
    })

    context('KIP17.setApprovalForAll', () => {
        it('CAVERJS-UNIT-KCT-082: should send transaction for calling setApprovalForAll method and set approve with all token without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const testKeyring = caver.wallet.keyring.generate()

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const setApprovalForAll = await token.setApprovalForAll(testKeyring.address, false)
                expect(setApprovalForAll.from).to.be.equals(sender.address.toLowerCase())
                expect(setApprovalForAll.status).to.be.true
                expect(setApprovalForAll.events).not.to.be.undefined
                expect(setApprovalForAll.events.ApprovalForAll).not.to.be.undefined
                expect(setApprovalForAll.events.ApprovalForAll.address).to.equals(kip17Address)

                const isApprovedForAll = await token.isApprovedForAll(sender.address, testKeyring.address)

                expect(isApprovedForAll).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-083: should send transaction for calling setApprovalForAll method and set approve with all token with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const testKeyring = caver.wallet.keyring.generate()

                const setApprovalForAll = await token.setApprovalForAll(testKeyring.address, true, { from: sender.address })
                expect(setApprovalForAll.from).to.be.equals(sender.address.toLowerCase())
                expect(setApprovalForAll.status).to.be.true
                expect(setApprovalForAll.events).not.to.be.undefined
                expect(setApprovalForAll.events.ApprovalForAll).not.to.be.undefined
                expect(setApprovalForAll.events.ApprovalForAll.address).to.equals(kip17Address)

                const isApprovedForAll = await token.isApprovedForAll(sender.address, testKeyring.address)

                expect(isApprovedForAll).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-084: should send transaction for calling setApprovalForAll method and set approve with all token with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const testKeyring = caver.wallet.keyring.generate()

                const customGasLimit = '0x186a0'

                const setApprovalForAll = await token.setApprovalForAll(testKeyring.address, false, {
                    from: sender.address,
                    gas: customGasLimit,
                })
                expect(setApprovalForAll.gas).to.equals(customGasLimit)
                expect(setApprovalForAll.status).to.be.true
                expect(setApprovalForAll.events).not.to.be.undefined
                expect(setApprovalForAll.events.ApprovalForAll).not.to.be.undefined
                expect(setApprovalForAll.events.ApprovalForAll.address).to.equals(kip17Address)

                const isApprovedForAll = await token.isApprovedForAll(sender.address, testKeyring.address)

                expect(isApprovedForAll).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-085: should send transaction for calling setApprovalForAll method and set approve with all token with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const testKeyring = caver.wallet.keyring.generate()

                const customGasLimit = '0x186a0'

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const setApprovalForAll = await token.setApprovalForAll(testKeyring.address, true, { gas: customGasLimit })
                expect(setApprovalForAll.from).to.be.equals(sender.address.toLowerCase())
                expect(setApprovalForAll.gas).to.equals(customGasLimit)
                expect(setApprovalForAll.status).to.be.true
                expect(setApprovalForAll.events).not.to.be.undefined
                expect(setApprovalForAll.events.ApprovalForAll).not.to.be.undefined
                expect(setApprovalForAll.events.ApprovalForAll.address).to.equals(kip17Address)

                const isApprovedForAll = await token.isApprovedForAll(sender.address, testKeyring.address)

                expect(isApprovedForAll).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP17.transferFrom', () => {
        it('CAVERJS-UNIT-KCT-086: should send transaction to transfer token and trigger Transfer event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip17 instance
                token.options.from = testAccount.address

                const tokenIdToTransfer = mintedTokenId
                const transfered = await token.transferFrom(sender.address, receiver.address, tokenIdToTransfer)
                expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(tokenIdToTransfer)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-087: should send transaction to transfer token and trigger Transfer event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip17 instance
                token.options.from = testAccount.address

                const tokenIdToTransfer = mintedTokenId
                const transfered = await token.transferFrom(sender.address, receiver.address, tokenIdToTransfer, {
                    from: testAccount.address,
                })
                expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(tokenIdToTransfer)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-088: should send transaction to transfer token and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                const customGasLimit = '0x249f0'

                const tokenIdToTransfer = mintedTokenId
                const transfered = await token.transferFrom(sender.address, receiver.address, tokenIdToTransfer, {
                    from: testAccount.address,
                    gas: customGasLimit,
                })
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(tokenIdToTransfer)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-089: should send transaction to transfer token and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip17 instance
                token.options.from = testAccount.address

                const customGasLimit = '0x249f0'

                const tokenIdToTransfer = mintedTokenId
                const transfered = await token.transferFrom(sender.address, receiver.address, tokenIdToTransfer, { gas: customGasLimit })
                expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(tokenIdToTransfer)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)
    })

    context('KIP17.safeTransferFrom', () => {
        it('CAVERJS-UNIT-KCT-090: should send token via safeTransferFrom without data and trigger Transfer event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip17 instance
                token.options.from = testAccount.address

                const transfered = await token.safeTransferFrom(sender.address, receiver.address, mintedTokenId)
                expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(mintedTokenId)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-091: should send token via safeTransferFrom without data and trigger Transfer event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip17 instance
                token.options.from = testAccount.address

                const transfered = await token.safeTransferFrom(sender.address, receiver.address, mintedTokenId, {
                    from: testAccount.address,
                })
                expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(mintedTokenId)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-092: should send token via safeTransferFrom without data and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                const customGasLimit = '0x249f0'

                const transfered = await token.safeTransferFrom(sender.address, receiver.address, mintedTokenId, {
                    from: testAccount.address,
                    gas: customGasLimit,
                })
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(mintedTokenId)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-093: should send token via safeTransferFrom without data and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip17 instance
                token.options.from = testAccount.address

                const customGasLimit = '0x249f0'

                const transfered = await token.safeTransferFrom(sender.address, receiver.address, mintedTokenId, { gas: customGasLimit })
                expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(mintedTokenId)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-094: should send token via safeTransferFrom with data and trigger Transfer event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip17 instance
                token.options.from = testAccount.address

                const data = Buffer.from('buffered data')
                const transfered = await token.safeTransferFrom(sender.address, receiver.address, mintedTokenId, data)
                const encodedParamters = caver.klay.abi.encodeParameters(
                    ['address', 'address', 'uint256', 'bytes'],
                    [sender.address, receiver.address, mintedTokenId, data]
                )
                expect(transfered.input.slice(10)).to.equals(encodedParamters.slice(2))
                expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(mintedTokenId)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-095: should send token via safeTransferFrom with data and trigger Transfer event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip17 instance
                token.options.from = testAccount.address

                const data = '0x1234'
                const transfered = await token.safeTransferFrom(sender.address, receiver.address, mintedTokenId, data, {
                    from: testAccount.address,
                })
                const encodedParamters = caver.klay.abi.encodeParameters(
                    ['address', 'address', 'uint256', 'bytes'],
                    [sender.address, receiver.address, mintedTokenId, caver.utils.toBuffer(data)]
                )
                expect(transfered.input.slice(10)).to.equals(encodedParamters.slice(2))
                expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(mintedTokenId)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-096: should send token via safeTransferFrom with data and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                const customGasLimit = '0x249f0'

                const data = 1234
                const transfered = await token.safeTransferFrom(sender.address, receiver.address, mintedTokenId, data, {
                    from: testAccount.address,
                    gas: customGasLimit,
                })
                const encodedParamters = caver.klay.abi.encodeParameters(
                    ['address', 'address', 'uint256', 'bytes'],
                    [sender.address, receiver.address, mintedTokenId, caver.utils.toBuffer(data)]
                )
                expect(transfered.input.slice(10)).to.equals(encodedParamters.slice(2))
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(mintedTokenId)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-097: should send token via safeTransferFrom with data and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip17 instance
                token.options.from = testAccount.address

                const customGasLimit = '0x249f0'

                const data = [1, 2, 3, 4]
                const transfered = await token.safeTransferFrom(sender.address, receiver.address, mintedTokenId, [1, 2, 3, 4], {
                    gas: customGasLimit,
                })
                const encodedParamters = caver.klay.abi.encodeParameters(
                    ['address', 'address', 'uint256', 'bytes'],
                    [sender.address, receiver.address, mintedTokenId, caver.utils.toBuffer(data)]
                )
                expect(transfered.input.slice(10)).to.equals(encodedParamters.slice(2))
                expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(mintedTokenId)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)
    })

    context('KIP17.addMinter', () => {
        it('CAVERJS-UNIT-KCT-098: should send transaction for adding minter and trigger MinterAdded event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const newMinter = caver.klay.accounts.create().address
                expect(await token.isMinter(newMinter)).to.be.false

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const minterAdded = await token.addMinter(newMinter)
                expect(minterAdded.from).to.be.equals(sender.address.toLowerCase())
                expect(minterAdded.status).to.be.true
                expect(minterAdded.events).not.to.be.undefined
                expect(minterAdded.events.MinterAdded).not.to.be.undefined
                expect(minterAdded.events.MinterAdded.address).to.equals(kip17Address)

                expect(await token.isMinter(newMinter)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-099: should send transaction for adding minter and trigger MinterAdded event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const newMinter = caver.klay.accounts.create().address
                expect(await token.isMinter(newMinter)).to.be.false

                const minterAdded = await token.addMinter(newMinter, { from: sender.address })
                expect(minterAdded.from).to.be.equals(sender.address.toLowerCase())
                expect(minterAdded.status).to.be.true
                expect(minterAdded.events).not.to.be.undefined
                expect(minterAdded.events.MinterAdded).not.to.be.undefined
                expect(minterAdded.events.MinterAdded.address).to.equals(kip17Address)

                expect(await token.isMinter(newMinter)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-100: should send transaction for adding minter and trigger MinterAdded event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const newMinter = caver.klay.accounts.create().address
                expect(await token.isMinter(newMinter)).to.be.false

                const customGasLimit = '0x30d40'
                const minterAdded = await token.addMinter(newMinter, { from: sender.address, gas: customGasLimit })
                expect(minterAdded.gas).to.equals(customGasLimit)
                expect(minterAdded.from).to.be.equals(sender.address.toLowerCase())
                expect(minterAdded.status).to.be.true
                expect(minterAdded.events).not.to.be.undefined
                expect(minterAdded.events.MinterAdded).not.to.be.undefined
                expect(minterAdded.events.MinterAdded.address).to.equals(kip17Address)

                expect(await token.isMinter(newMinter)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-101: should send transaction for adding minter and trigger MinterAdded event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const newMinter = caver.klay.accounts.create().address
                expect(await token.isMinter(newMinter)).to.be.false

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const customGasLimit = '0x30d40'
                const minterAdded = await token.addMinter(newMinter, { gas: customGasLimit })
                expect(minterAdded.from).to.be.equals(sender.address.toLowerCase())
                expect(minterAdded.status).to.be.true
                expect(minterAdded.events).not.to.be.undefined
                expect(minterAdded.events.MinterAdded).not.to.be.undefined
                expect(minterAdded.events.MinterAdded.address).to.equals(kip17Address)

                expect(await token.isMinter(newMinter)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP17.renounceMinter', () => {
        it('CAVERJS-UNIT-KCT-102: should send transaction for removing minter and trigger MinterRemoved event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                await token.addMinter(testAccount.address, { from: sender.address })
                expect(await token.isMinter(testAccount.address)).to.be.true

                // set deafult from address in kip17 instance
                token.options.from = testAccount.address

                const minterRemoved = await token.renounceMinter()
                expect(minterRemoved.from).to.be.equals(testAccount.address.toLowerCase())
                expect(minterRemoved.status).to.be.true
                expect(minterRemoved.events).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved.address).to.equals(kip17Address)

                expect(await token.isMinter(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-103: should send transaction for removing minter and trigger MinterRemoved event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                await token.addMinter(testAccount.address, { from: sender.address })
                expect(await token.isMinter(testAccount.address)).to.be.true

                const minterRemoved = await token.renounceMinter({ from: testAccount.address })
                expect(minterRemoved.from).to.be.equals(testAccount.address.toLowerCase())
                expect(minterRemoved.status).to.be.true
                expect(minterRemoved.events).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved.address).to.equals(kip17Address)

                expect(await token.isMinter(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-104: should send transaction for removing minter and trigger MinterRemoved event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                await token.addMinter(testAccount.address, { from: sender.address })
                expect(await token.isMinter(testAccount.address)).to.be.true

                const customGasLimit = '0x30d40'
                const minterRemoved = await token.renounceMinter({ from: testAccount.address, gas: customGasLimit })
                expect(minterRemoved.gas).to.equals(customGasLimit)
                expect(minterRemoved.from).to.be.equals(testAccount.address.toLowerCase())
                expect(minterRemoved.status).to.be.true
                expect(minterRemoved.events).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved.address).to.equals(kip17Address)

                expect(await token.isMinter(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-105: should send transaction for removing minter and trigger MinterRemoved event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                await token.addMinter(testAccount.address, { from: sender.address })
                expect(await token.isMinter(testAccount.address)).to.be.true

                // set deafult from address in kip17 instance
                token.options.from = testAccount.address

                const customGasLimit = '0x30d40'
                const minterRemoved = await token.renounceMinter({ gas: customGasLimit })
                expect(minterRemoved.from).to.be.equals(testAccount.address.toLowerCase())
                expect(minterRemoved.status).to.be.true
                expect(minterRemoved.events).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved.address).to.equals(kip17Address)

                expect(await token.isMinter(testAccount.address)).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP17.mintWithTokenURI', () => {
        it('CAVERJS-UNIT-KCT-106: should send transaction for minting and trigger Transfer event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const originalSupply = await token.totalSupply()

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const minted = await token.mintWithTokenURI(testAccount.address, tokenId, tokenURI)
                expect(minted.from).to.be.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(tokenId)
                expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

                const afterSupply = await token.totalSupply()

                expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-107: should send transaction for minting and trigger Transfer event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const originalSupply = await token.totalSupply()

                const minted = await token.mintWithTokenURI(testAccount.address, tokenId, tokenURI, { from: sender.address })
                expect(minted.from).to.be.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(tokenId)
                expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

                const afterSupply = await token.totalSupply()

                expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-108: should send transaction for minting and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const originalSupply = await token.totalSupply()

                const customGasLimit = '0x493e0'
                const minted = await token.mintWithTokenURI(testAccount.address, tokenId, tokenURI, {
                    from: sender.address,
                    gas: customGasLimit,
                })
                expect(minted.gas).to.equals(customGasLimit)
                expect(minted.from).to.be.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(tokenId)
                expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

                const afterSupply = await token.totalSupply()

                expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-109: should send transaction for minting and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const originalSupply = await token.totalSupply()

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const customGasLimit = '0x493e0'
                const minted = await token.mintWithTokenURI(testAccount.address, tokenId, tokenURI, { gas: customGasLimit })
                expect(minted.from).to.be.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(tokenId)
                expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

                const afterSupply = await token.totalSupply()

                expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
                tokenId++
            }
        }).timeout(200000)
    })

    context('KIP17.burn', () => {
        it('CAVERJS-UNIT-KCT-110: should send transaction for burning and trigger Transfer event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

                const originalSupply = await token.totalSupply()

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const burned = await token.burn(tokenId)
                expect(burned.from).to.be.equals(sender.address.toLowerCase())
                expect(burned.status).to.be.true
                expect(burned.events).not.to.be.undefined
                expect(burned.events.Transfer).not.to.be.undefined
                expect(burned.events.Transfer.address).to.equals(kip17Address)

                const afterSupply = await token.totalSupply()
                expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-111: should send transaction for burning and trigger Transfer event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

                const originalSupply = await token.totalSupply()

                const burned = await token.burn(tokenId, { from: sender.address })
                expect(burned.from).to.be.equals(sender.address.toLowerCase())
                expect(burned.status).to.be.true
                expect(burned.events).not.to.be.undefined
                expect(burned.events.Transfer).not.to.be.undefined
                expect(burned.events.Transfer.address).to.equals(kip17Address)

                const afterSupply = await token.totalSupply()
                expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-112: should send transaction for burning and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

                const originalSupply = await token.totalSupply()

                const customGasLimit = '0x30d40'
                const burned = await token.burn(tokenId, { from: sender.address, gas: customGasLimit })
                expect(burned.gas).to.equals(customGasLimit)
                expect(burned.from).to.be.equals(sender.address.toLowerCase())
                expect(burned.status).to.be.true
                expect(burned.events).not.to.be.undefined
                expect(burned.events.Transfer).not.to.be.undefined
                expect(burned.events.Transfer.address).to.equals(kip17Address)

                const afterSupply = await token.totalSupply()
                expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-113: should send transaction for burning and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

                const originalSupply = await token.totalSupply()

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const customGasLimit = '0x30d40'
                const burned = await token.burn(tokenId, { gas: customGasLimit })
                expect(burned.from).to.be.equals(sender.address.toLowerCase())
                expect(burned.status).to.be.true
                expect(burned.events).not.to.be.undefined
                expect(burned.events.Transfer).not.to.be.undefined
                expect(burned.events.Transfer.address).to.equals(kip17Address)

                const afterSupply = await token.totalSupply()
                expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(1)
                tokenId++
            }
        }).timeout(200000)
    })

    context('KIP17.pause', () => {
        it('CAVERJS-UNIT-KCT-114: should send transaction for pausing without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const doPause = await token.pause()
                expect(doPause.from).to.be.equals(sender.address.toLowerCase())
                expect(doPause.status).to.be.true
                expect(doPause.events).not.to.be.undefined
                expect(doPause.events.Paused).not.to.be.undefined
                expect(doPause.events.Paused.address).to.equals(kip17Address)

                expect(await token.paused()).to.be.true

                await token.unpause({ from: sender.address })
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-115: should send transaction for pausing with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const doPause = await token.pause({ from: sender.address })
                expect(doPause.from).to.be.equals(sender.address.toLowerCase())
                expect(doPause.status).to.be.true
                expect(doPause.events).not.to.be.undefined
                expect(doPause.events.Paused).not.to.be.undefined
                expect(doPause.events.Paused.address).to.equals(kip17Address)

                expect(await token.paused()).to.be.true

                await token.unpause({ from: sender.address })
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-116: should send transaction for pausing with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const customGasLimit = '0x30d40'
                const doPause = await token.pause({ from: sender.address, gas: customGasLimit })
                expect(doPause.gas).to.equals(customGasLimit)
                expect(doPause.from).to.be.equals(sender.address.toLowerCase())
                expect(doPause.status).to.be.true
                expect(doPause.events).not.to.be.undefined
                expect(doPause.events.Paused).not.to.be.undefined
                expect(doPause.events.Paused.address).to.equals(kip17Address)

                expect(await token.paused()).to.be.true

                await token.unpause({ from: sender.address })
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-117: should send transaction for pausing with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const customGasLimit = '0x30d40'
                const doPause = await token.pause({ gas: customGasLimit })
                expect(doPause.from).to.be.equals(sender.address.toLowerCase())
                expect(doPause.status).to.be.true
                expect(doPause.events).not.to.be.undefined
                expect(doPause.events.Paused).not.to.be.undefined
                expect(doPause.events.Paused.address).to.equals(kip17Address)

                expect(await token.paused()).to.be.true

                await token.unpause({ from: sender.address })
            }
        }).timeout(200000)
    })

    context('KIP17.unpause', () => {
        it('CAVERJS-UNIT-KCT-118: should send transaction for unpausing without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                await token.pause({ from: sender.address })

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const doUnpause = await token.unpause()
                expect(doUnpause.from).to.be.equals(sender.address.toLowerCase())
                expect(doUnpause.status).to.be.true
                expect(doUnpause.events).not.to.be.undefined
                expect(doUnpause.events.Unpaused).not.to.be.undefined
                expect(doUnpause.events.Unpaused.address).to.equals(kip17Address)

                expect(await token.paused()).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-119: should send transaction for unpausing with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                await token.pause({ from: sender.address })

                const doUnpause = await token.unpause({ from: sender.address })
                expect(doUnpause.from).to.be.equals(sender.address.toLowerCase())
                expect(doUnpause.status).to.be.true
                expect(doUnpause.events).not.to.be.undefined
                expect(doUnpause.events.Unpaused).not.to.be.undefined
                expect(doUnpause.events.Unpaused.address).to.equals(kip17Address)

                expect(await token.paused()).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-120: should send transaction for unpausing with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                await token.pause({ from: sender.address })

                const customGasLimit = '0x30d40'
                const doUnpause = await token.unpause({ from: sender.address, gas: customGasLimit })
                expect(doUnpause.gas).to.equals(customGasLimit)
                expect(doUnpause.from).to.be.equals(sender.address.toLowerCase())
                expect(doUnpause.status).to.be.true
                expect(doUnpause.events).not.to.be.undefined
                expect(doUnpause.events.Unpaused).not.to.be.undefined
                expect(doUnpause.events.Unpaused.address).to.equals(kip17Address)

                expect(await token.paused()).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-121: should send transaction for unpausing with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                await token.pause({ from: sender.address })

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const customGasLimit = '0x30d40'
                const doUnpause = await token.unpause({ gas: customGasLimit })
                expect(doUnpause.from).to.be.equals(sender.address.toLowerCase())
                expect(doUnpause.status).to.be.true
                expect(doUnpause.events).not.to.be.undefined
                expect(doUnpause.events.Unpaused).not.to.be.undefined
                expect(doUnpause.events.Unpaused.address).to.equals(kip17Address)

                expect(await token.paused()).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP17.addPauser', () => {
        it('CAVERJS-UNIT-KCT-122: should send transaction for adding pauser and trigger PauserAdded event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const newPauser = caver.klay.accounts.create().address
                expect(await token.isPauser(newPauser)).to.be.false

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const pauserAdded = await token.addPauser(newPauser)
                expect(pauserAdded.from).to.be.equals(sender.address.toLowerCase())
                expect(pauserAdded.status).to.be.true
                expect(pauserAdded.events).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded.address).to.equals(kip17Address)

                expect(await token.isPauser(newPauser)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-123: should send transaction for adding pauser and trigger PauserAdded event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const newPauser = caver.klay.accounts.create().address
                expect(await token.isPauser(newPauser)).to.be.false

                const pauserAdded = await token.addPauser(newPauser, { from: sender.address })
                expect(pauserAdded.from).to.be.equals(sender.address.toLowerCase())
                expect(pauserAdded.status).to.be.true
                expect(pauserAdded.events).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded.address).to.equals(kip17Address)

                expect(await token.isPauser(newPauser)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-124: should send transaction for adding pauser and trigger PauserAdded event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const newPauser = caver.klay.accounts.create().address
                expect(await token.isPauser(newPauser)).to.be.false

                const customGasLimit = '0x493e0'
                const pauserAdded = await token.addPauser(newPauser, { from: sender.address, gas: customGasLimit })
                expect(pauserAdded.gas).to.equals(customGasLimit)
                expect(pauserAdded.from).to.be.equals(sender.address.toLowerCase())
                expect(pauserAdded.status).to.be.true
                expect(pauserAdded.events).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded.address).to.equals(kip17Address)

                expect(await token.isPauser(newPauser)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-125: should send transaction for adding pauser and trigger PauserAdded event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const newPauser = caver.klay.accounts.create().address
                expect(await token.isPauser(newPauser)).to.be.false

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const customGasLimit = '0x493e0'
                const pauserAdded = await token.addPauser(newPauser, { gas: customGasLimit })
                expect(pauserAdded.from).to.be.equals(sender.address.toLowerCase())
                expect(pauserAdded.status).to.be.true
                expect(pauserAdded.events).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded.address).to.equals(kip17Address)

                expect(await token.isPauser(newPauser)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP17.renouncePauser', () => {
        it('CAVERJS-UNIT-KCT-126: should send transaction for removing pauser and trigger PauserRemoved event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                await token.addPauser(testAccount.address, { from: sender.address })
                expect(await token.isPauser(testAccount.address)).to.be.true

                // set deafult from address in kip17 instance
                token.options.from = testAccount.address

                const pauserRemoved = await token.renouncePauser()
                expect(pauserRemoved.from).to.be.equals(testAccount.address.toLowerCase())
                expect(pauserRemoved.status).to.be.true
                expect(pauserRemoved.events).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved.address).to.equals(kip17Address)

                expect(await token.isPauser(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-127: should send transaction for removing pauser and trigger PauserRemoved event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                await token.addPauser(testAccount.address, { from: sender.address })
                expect(await token.isPauser(testAccount.address)).to.be.true

                const pauserRemoved = await token.renouncePauser({ from: testAccount.address })
                expect(pauserRemoved.from).to.be.equals(testAccount.address.toLowerCase())
                expect(pauserRemoved.status).to.be.true
                expect(pauserRemoved.events).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved.address).to.equals(kip17Address)

                expect(await token.isPauser(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-128: should send transaction for removing pauser and trigger PauserRemoved event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                await token.addPauser(testAccount.address, { from: sender.address })
                expect(await token.isPauser(testAccount.address)).to.be.true

                const customGasLimit = '0x30d40'
                const pauserRemoved = await token.renouncePauser({ from: testAccount.address, gas: customGasLimit })
                expect(pauserRemoved.gas).to.equals(customGasLimit)
                expect(pauserRemoved.from).to.be.equals(testAccount.address.toLowerCase())
                expect(pauserRemoved.status).to.be.true
                expect(pauserRemoved.events).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved.address).to.equals(kip17Address)

                expect(await token.isPauser(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-129: should send transaction for removing pauser and trigger PauserRemoved event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                await token.addPauser(testAccount.address, { from: sender.address })
                expect(await token.isPauser(testAccount.address)).to.be.true

                // set deafult from address in kip17 instance
                token.options.from = testAccount.address

                const customGasLimit = '0x30d40'
                const pauserRemoved = await token.renouncePauser({ gas: customGasLimit })
                expect(pauserRemoved.from).to.be.equals(testAccount.address.toLowerCase())
                expect(pauserRemoved.status).to.be.true
                expect(pauserRemoved.events).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved.address).to.equals(kip17Address)

                expect(await token.isPauser(testAccount.address)).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP17.supportsInterface', () => {
        it('CAVERJS-UNIT-KCT-138: should return true if interfaceId is supported', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                expect(await token.supportsInterface('0x80ac58cd')).to.be.true // kip17
                expect(await token.supportsInterface('0x780e9d63')).to.be.true // kip17Enumerable
                expect(await token.supportsInterface('0x5b5e139f')).to.be.true // kip17Metadata
                expect(await token.supportsInterface('0x42966c68')).to.be.true // kip17Burnable
                expect(await token.supportsInterface('0xfac27f46')).to.be.true // kip17MetadataMintable
                expect(await token.supportsInterface('0x4d5507ff')).to.be.true // kip17Pausable
                expect(await token.supportsInterface('0xeab83e20')).to.be.true // kip17Mintable

                expect(await token.supportsInterface('0x70a08231')).to.be.false
                expect(await token.supportsInterface('0x6352211e')).to.be.false
                expect(await token.supportsInterface('0x095ea7b3')).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP17.mint', () => {
        it('CAVERJS-UNIT-KCT-140: should send transaction for minting and trigger Transfer event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const originalSupply = await token.totalSupply()

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const minted = await token.mint(testAccount.address, tokenId)
                expect(minted.from).to.be.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(tokenId)
                expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

                const afterSupply = await token.totalSupply()

                expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-141: should send transaction for minting and trigger Transfer event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const originalSupply = await token.totalSupply()

                const minted = await token.mint(testAccount.address, tokenId, { from: sender.address })
                expect(minted.from).to.be.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(tokenId)
                expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

                const afterSupply = await token.totalSupply()

                expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-142: should send transaction for minting and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const originalSupply = await token.totalSupply()

                const customGasLimit = '0x493e0'
                const minted = await token.mint(testAccount.address, tokenId, {
                    from: sender.address,
                    gas: customGasLimit,
                })
                expect(minted.gas).to.equals(customGasLimit)
                expect(minted.from).to.be.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(tokenId)
                expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

                const afterSupply = await token.totalSupply()

                expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-143: should send transaction for minting and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)

                const originalSupply = await token.totalSupply()

                // set deafult from address in kip17 instance
                token.options.from = sender.address

                const customGasLimit = '0x493e0'
                const minted = await token.mint(testAccount.address, tokenId, { gas: customGasLimit })
                expect(minted.from).to.be.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(kip17Address)

                const owner = await token.ownerOf(tokenId)
                expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

                const afterSupply = await token.totalSupply()

                expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
                tokenId++
            }
        }).timeout(200000)
    })

    context('KIP17.detectInterface', () => {
        it('CAVERJS-UNIT-KCT-207: should return valid object if contract is deployed by caver', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(kip17Address)
                let detected = await token.detectInterface()

                expect(detected.IKIP17).to.be.true
                expect(detected.IKIP17Metadata).to.be.true
                expect(detected.IKIP17Enumerable).to.be.true
                expect(detected.IKIP17Mintable).to.be.true
                expect(detected.IKIP17MetadataMintable).to.be.true
                expect(detected.IKIP17Burnable).to.be.true
                expect(detected.IKIP17Pausable).to.be.true

                // Test static function
                detected = await kip17.detectInterface(kip17Address)

                expect(detected.IKIP17).to.be.true
                expect(detected.IKIP17Metadata).to.be.true
                expect(detected.IKIP17Enumerable).to.be.true
                expect(detected.IKIP17Mintable).to.be.true
                expect(detected.IKIP17MetadataMintable).to.be.true
                expect(detected.IKIP17Burnable).to.be.true
                expect(detected.IKIP17Pausable).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-208: should return detected result object with KIP17Full and IKIP17MetadataMintable extension', async () => {
            // Deploy the KIP-17 contract implementing only IKIP17MetadataMintable extension
            const byteCodeWithFullMetadataMintable =
                '0x60806040523480156200001157600080fd5b506040516200334238038062003342833981018060405260408110156200003757600080fd5b8101908080516401000000008111156200005057600080fd5b828101905060208101848111156200006757600080fd5b81518560018202830111640100000000821117156200008557600080fd5b50509291906020018051640100000000811115620000a257600080fd5b82810190506020810184811115620000b957600080fd5b8151856001820283011164010000000082111715620000d757600080fd5b505092919050505081818181620000fb6301ffc9a760e01b620001aa60201b60201c565b620001136380ac58cd60e01b620001aa60201b60201c565b6200012b63780e9d6360e01b620001aa60201b60201c565b816009908051906020019062000143929190620004d8565b5080600a90805190602001906200015c929190620004d8565b5062000175635b5e139f60e01b620001aa60201b60201c565b505050506200018a33620002b360201b60201c565b620001a263fac27f4660e01b620001aa60201b60201c565b505062000587565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916141562000247576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f4b495031333a20696e76616c696420696e74657266616365206964000000000081525060200191505060405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b620002ce81600c6200031460201b620026b71790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b620003268282620003f860201b60201c565b156200039a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141562000481576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526022815260200180620033206022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200051b57805160ff19168380011785556200054c565b828001600101855582156200054c579182015b828111156200054b5782518255916020019190600101906200052e565b5b5090506200055b91906200055f565b5090565b6200058491905b808211156200058057600081600090555060010162000566565b5090565b90565b612d8980620005976000396000f3fe608060405234801561001057600080fd5b506004361061012c5760003560e01c80636352211e116100ad578063a22cb46511610071578063a22cb46514610707578063aa271e1a14610757578063b88d4fde146107b3578063c87b56dd146108b8578063e985e9c51461095f5761012c565b80636352211e1461057057806370a08231146105de57806395d89b4114610636578063983b2d56146106b957806398650275146106fd5761012c565b806323b872dd116100f457806323b872dd146102f35780632f745c591461036157806342842e0e146103c35780634f6ccce71461043157806350bb4e7f146104735761012c565b806301ffc9a71461013157806306fdde0314610196578063081812fc14610219578063095ea7b31461028757806318160ddd146102d5575b600080fd5b61017c6004803603602081101561014757600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191690602001909291905050506109db565b604051808215151515815260200191505060405180910390f35b61019e610a42565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156101de5780820151818401526020810190506101c3565b50505050905090810190601f16801561020b5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102456004803603602081101561022f57600080fd5b8101908080359060200190929190505050610ae4565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6102d36004803603604081101561029d57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610b7f565b005b6102dd610d75565b6040518082815260200191505060405180910390f35b61035f6004803603606081101561030957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610d82565b005b6103ad6004803603604081101561037757600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610df1565b6040518082815260200191505060405180910390f35b61042f600480360360608110156103d957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610eb0565b005b61045d6004803603602081101561044757600080fd5b8101908080359060200190929190505050610ed0565b6040518082815260200191505060405180910390f35b6105566004803603606081101561048957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156104d057600080fd5b8201836020820111156104e257600080fd5b8035906020019184600183028401116401000000008311171561050457600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050610f50565b604051808215151515815260200191505060405180910390f35b61059c6004803603602081101561058657600080fd5b8101908080359060200190929190505050610fcf565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b610620600480360360208110156105f457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611097565b6040518082815260200191505060405180910390f35b61063e61116c565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561067e578082015181840152602081019050610663565b50505050905090810190601f1680156106ab5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6106fb600480360360208110156106cf57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061120e565b005b610705611278565b005b6107556004803603604081101561071d57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803515159060200190929190505050611283565b005b6107996004803603602081101561076d57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611426565b604051808215151515815260200191505060405180910390f35b6108b6600480360360808110156107c957600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019064010000000081111561083057600080fd5b82018360208201111561084257600080fd5b8035906020019184600183028401116401000000008311171561086457600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611443565b005b6108e4600480360360208110156108ce57600080fd5b81019080803590602001909291905050506114b5565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610924578082015181840152602081019050610909565b50505050905090810190601f1680156109515780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6109c16004803603604081101561097557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506115c8565b604051808215151515815260200191505060405180910390f35b6000806000837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff169050919050565b606060098054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610ada5780601f10610aaf57610100808354040283529160200191610ada565b820191906000526020600020905b815481529060010190602001808311610abd57829003601f168201915b5050505050905090565b6000610aef8261165c565b610b44576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b815260200180612cd1602b913960400191505060405180910390fd5b6002600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b6000610b8a82610fcf565b90508073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610c2e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4b495031373a20617070726f76616c20746f2063757272656e74206f776e657281525060200191505060405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161480610c6e5750610c6d81336115c8565b5b610cc3576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526037815260200180612cfc6037913960400191505060405180910390fd5b826002600084815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550818373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a4505050565b6000600780549050905090565b610d8c33826116ce565b610de1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180612bd36030913960400191505060405180910390fd5b610dec8383836117c2565b505050565b6000610dfc83611097565b8210610e53576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602a815260200180612b05602a913960400191505060405180910390fd5b600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208281548110610e9d57fe5b9060005260206000200154905092915050565b610ecb83838360405180602001604052806000815250611443565b505050565b6000610eda610d75565b8210610f31576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b815260200180612ca6602b913960400191505060405180910390fd5b60078281548110610f3e57fe5b90600052602060002001549050919050565b6000610f5b33611426565b610fb0576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180612b2f6030913960400191505060405180910390fd5b610fba84846117e6565b610fc48383611807565b600190509392505050565b6000806001600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16141561108e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526028815260200180612b806028913960400191505060405180910390fd5b80915050919050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561111e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526029815260200180612c556029913960400191505060405180910390fd5b611165600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020611891565b9050919050565b6060600a8054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156112045780601f106111d957610100808354040283529160200191611204565b820191906000526020600020905b8154815290600101906020018083116111e757829003601f168201915b5050505050905090565b61121733611426565b61126c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180612b2f6030913960400191505060405180910390fd5b6112758161189f565b50565b611281336118f9565b565b3373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611325576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260188152602001807f4b495031373a20617070726f766520746f2063616c6c6572000000000000000081525060200191505060405180910390fd5b80600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3183604051808215151515815260200191505060405180910390a35050565b600061143c82600c61195390919063ffffffff16565b9050919050565b61144e848484610d82565b61145a84848484611a31565b6114af576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180612c256030913960400191505060405180910390fd5b50505050565b60606114c08261165c565b611515576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e815260200180612ab4602e913960400191505060405180910390fd5b600b60008381526020019081526020016000208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156115bc5780601f10611591576101008083540402835291602001916115bc565b820191906000526020600020905b81548152906001019060200180831161159f57829003601f168201915b50505050509050919050565b6000600460008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b6000806001600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415915050919050565b60006116d98261165c565b61172e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b815260200180612d33602b913960400191505060405180910390fd5b600061173983610fcf565b90508073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff1614806117a857508373ffffffffffffffffffffffffffffffffffffffff1661179084610ae4565b73ffffffffffffffffffffffffffffffffffffffff16145b806117b957506117b881856115c8565b5b91505092915050565b6117cd838383611f93565b6117d783826121ee565b6117e1828261238c565b505050565b6117f08282612453565b6117fa828261238c565b6118038161266b565b5050565b6118108261165c565b611865576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b815260200180612ba8602b913960400191505060405180910390fd5b80600b6000848152602001908152602001600020908051906020019061188c9291906129e2565b505050565b600081600001549050919050565b6118b381600c6126b790919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b61190d81600c61279290919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fe94479a9f7e1952cc78f2d6baab678adc1b772d936c6583def489e524cb6669260405160405180910390a250565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156119da576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526022815260200180612c036022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b6000806060611a558673ffffffffffffffffffffffffffffffffffffffff1661284f565b611a6457600192505050611f8b565b8573ffffffffffffffffffffffffffffffffffffffff1663150b7a0260e01b33898888604051602401808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015611b34578082015181840152602081019050611b19565b50505050905090810190601f168015611b615780820380516001836020036101000a031916815260200191505b5095505050505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b60208310611bf95780518252602082019150602081019050602083039250611bd6565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d8060008114611c5b576040519150601f19603f3d011682016040523d82523d6000602084013e611c60565b606091505b5080925081935050506000815114158015611ce4575063150b7a0260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916818060200190516020811015611cb257600080fd5b81019080805190602001909291905050507bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b15611cf457600192505050611f8b565b8573ffffffffffffffffffffffffffffffffffffffff16636745782b60e01b33898888604051602401808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015611dc4578082015181840152602081019050611da9565b50505050905090810190601f168015611df15780820380516001836020036101000a031916815260200191505b5095505050505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b60208310611e895780518252602082019150602081019050602083039250611e66565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d8060008114611eeb576040519150601f19603f3d011682016040523d82523d6000602084013e611ef0565b606091505b5080925081935050506000815114158015611f745750636745782b60e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916818060200190516020811015611f4257600080fd5b81019080805190602001909291905050507bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b15611f8457600192505050611f8b565b6000925050505b949350505050565b8273ffffffffffffffffffffffffffffffffffffffff16611fb382610fcf565b73ffffffffffffffffffffffffffffffffffffffff161461201f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526028815260200180612c7e6028913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156120a5576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526023815260200180612ae26023913960400191505060405180910390fd5b6120ae81612862565b6120f5600360008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020612920565b61213c600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020612943565b816001600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a4505050565b60006122466001600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208054905061295990919063ffffffff16565b9050600060066000848152602001908152602001600020549050818114612333576000600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002083815481106122b357fe5b9060005260206000200154905080600560008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020838154811061230b57fe5b9060005260206000200181905550816006600083815260200190815260200160002081905550505b600560008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208054809190600190036123859190612a62565b5050505050565b600560008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805490506006600083815260200190815260200160002081905550600560008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190806001815401808255809150509060018203906000526020600020016000909192909190915055505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156124f6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f4b495031373a206d696e7420746f20746865207a65726f20616464726573730081525060200191505060405180910390fd5b6124ff8161165c565b15612572576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f4b495031373a20746f6b656e20616c7265616479206d696e746564000000000081525060200191505060405180910390fd5b816001600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061260b600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020612943565b808273ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a45050565b6007805490506008600083815260200190815260200160002081905550600781908060018154018082558091505090600182039060005260206000200160009091929091909150555050565b6126c18282611953565b15612734576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b61279c8282611953565b6127f1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180612b5f6021913960400191505060405180910390fd5b60008260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b600080823b905060008111915050919050565b600073ffffffffffffffffffffffffffffffffffffffff166002600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161461291d5760006002600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b50565b6129386001826000015461295990919063ffffffff16565b816000018190555050565b6001816000016000828254019250508190555050565b6000828211156129d1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f536166654d6174683a207375627472616374696f6e206f766572666c6f77000081525060200191505060405180910390fd5b600082840390508091505092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10612a2357805160ff1916838001178555612a51565b82800160010185558215612a51579182015b82811115612a50578251825591602001919060010190612a35565b5b509050612a5e9190612a8e565b5090565b815481835581811115612a8957818360005260206000209182019101612a889190612a8e565b5b505050565b612ab091905b80821115612aac576000816000905550600101612a94565b5090565b9056fe4b495031374d657461646174613a2055524920717565727920666f72206e6f6e6578697374656e7420746f6b656e4b495031373a207472616e7366657220746f20746865207a65726f20616464726573734b49503137456e756d657261626c653a206f776e657220696e646578206f7574206f6620626f756e64734d696e746572526f6c653a2063616c6c657220646f6573206e6f74206861766520746865204d696e74657220726f6c65526f6c65733a206163636f756e7420646f6573206e6f74206861766520726f6c654b495031373a206f776e657220717565727920666f72206e6f6e6578697374656e7420746f6b656e4b495031374d657461646174613a2055524920736574206f66206e6f6e6578697374656e7420746f6b656e4b495031373a207472616e736665722063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f766564526f6c65733a206163636f756e7420697320746865207a65726f20616464726573734b495031373a207472616e7366657220746f206e6f6e204b49503137526563656976657220696d706c656d656e7465724b495031373a2062616c616e636520717565727920666f7220746865207a65726f20616464726573734b495031373a207472616e73666572206f6620746f6b656e2074686174206973206e6f74206f776e4b49503137456e756d657261626c653a20676c6f62616c20696e646578206f7574206f6620626f756e64734b495031373a20617070726f76656420717565727920666f72206e6f6e6578697374656e7420746f6b656e4b495031373a20617070726f76652063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f76656420666f7220616c6c4b495031373a206f70657261746f7220717565727920666f72206e6f6e6578697374656e7420746f6b656ea165627a7a723058208b7a6dcd5f7fc75450d49553b138abdd36f29599463acdcb619ea30f613d86b60029526f6c65733a206163636f756e7420697320746865207a65726f2061646472657373'
            const abiWithMintable = [
                {
                    inputs: [{ name: 'name', type: 'string' }, { name: 'symbol', type: 'string' }],
                    payable: false,
                    stateMutability: 'nonpayable',
                    type: 'constructor',
                },
            ]

            const deployed = await new caver.contract(abiWithMintable)
                .deploy({
                    data: byteCodeWithFullMetadataMintable,
                    arguments: ['Test', 'TST'],
                })
                .send({ from: sender.address, gas: 10000000 })

            const contractAddress = deployed.options.address

            for (const kip17 of kip17s) {
                const token = new kip17(contractAddress)
                let detected = await token.detectInterface()

                expect(detected.IKIP17).to.be.true
                expect(detected.IKIP17Metadata).to.be.true
                expect(detected.IKIP17Enumerable).to.be.true
                expect(detected.IKIP17Mintable).to.be.false
                expect(detected.IKIP17MetadataMintable).to.be.true
                expect(detected.IKIP17Burnable).to.be.false
                expect(detected.IKIP17Pausable).to.be.false

                // Test static function
                detected = await kip17.detectInterface(contractAddress)

                expect(detected.IKIP17).to.be.true
                expect(detected.IKIP17Metadata).to.be.true
                expect(detected.IKIP17Enumerable).to.be.true
                expect(detected.IKIP17Mintable).to.be.false
                expect(detected.IKIP17MetadataMintable).to.be.true
                expect(detected.IKIP17Burnable).to.be.false
                expect(detected.IKIP17Pausable).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-209: should return detected result object without IKIP17Pausable and IKIP17Burnable extensions', async () => {
            // Deploy the KIP-17 contract not implementing IKIP17Pausable and IKIP17Burnable extensions
            const byteCodeWithoutBurnablePausable =
                '0x60806040523480156200001157600080fd5b506040516200343f3803806200343f833981018060405260408110156200003757600080fd5b8101908080516401000000008111156200005057600080fd5b828101905060208101848111156200006757600080fd5b81518560018202830111640100000000821117156200008557600080fd5b50509291906020018051640100000000811115620000a257600080fd5b82810190506020810184811115620000b957600080fd5b8151856001820283011164010000000082111715620000d757600080fd5b505092919050505081818181620000fb6301ffc9a760e01b620001c260201b60201c565b620001136380ac58cd60e01b620001c260201b60201c565b6200012b63780e9d6360e01b620001c260201b60201c565b816009908051906020019062000143929190620004f0565b5080600a90805190602001906200015c929190620004f0565b5062000175635b5e139f60e01b620001c260201b60201c565b505050506200018a33620002cb60201b60201c565b620001a263eab83e2060e01b620001c260201b60201c565b620001ba63fac27f4660e01b620001c260201b60201c565b50506200059f565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614156200025f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f4b495031333a20696e76616c696420696e74657266616365206964000000000081525060200191505060405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b620002e681600c6200032c60201b6200279c1790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b6200033e82826200041060201b60201c565b15620003b2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141562000499576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260228152602001806200341d6022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200053357805160ff191683800117855562000564565b8280016001018555821562000564579182015b828111156200056357825182559160200191906001019062000546565b5b50905062000573919062000577565b5090565b6200059c91905b80821115620005985760008160009055506001016200057e565b5090565b90565b612e6e80620005af6000396000f3fe608060405234801561001057600080fd5b50600436106101375760003560e01c806350bb4e7f116100b8578063986502751161007c578063986502751461076e578063a22cb46514610778578063aa271e1a146107c8578063b88d4fde14610824578063c87b56dd14610929578063e985e9c5146109d057610137565b806350bb4e7f146104e45780636352211e146105e157806370a082311461064f57806395d89b41146106a7578063983b2d561461072a57610137565b806323b872dd116100ff57806323b872dd146102fe5780632f745c591461036c57806340c10f19146103ce57806342842e0e146104345780634f6ccce7146104a257610137565b806301ffc9a71461013c57806306fdde03146101a1578063081812fc14610224578063095ea7b31461029257806318160ddd146102e0575b600080fd5b6101876004803603602081101561015257600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19169060200190929190505050610a4c565b604051808215151515815260200191505060405180910390f35b6101a9610ab3565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156101e95780820151818401526020810190506101ce565b50505050905090810190601f1680156102165780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6102506004803603602081101561023a57600080fd5b8101908080359060200190929190505050610b55565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6102de600480360360408110156102a857600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610bf0565b005b6102e8610de6565b6040518082815260200191505060405180910390f35b61036a6004803603606081101561031457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610df3565b005b6103b86004803603604081101561038257600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610e62565b6040518082815260200191505060405180910390f35b61041a600480360360408110156103e457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610f21565b604051808215151515815260200191505060405180910390f35b6104a06004803603606081101561044a57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610f95565b005b6104ce600480360360208110156104b857600080fd5b8101908080359060200190929190505050610fb5565b6040518082815260200191505060405180910390f35b6105c7600480360360608110156104fa57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019064010000000081111561054157600080fd5b82018360208201111561055357600080fd5b8035906020019184600183028401116401000000008311171561057557600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611035565b604051808215151515815260200191505060405180910390f35b61060d600480360360208110156105f757600080fd5b81019080803590602001909291905050506110b4565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6106916004803603602081101561066557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061117c565b6040518082815260200191505060405180910390f35b6106af611251565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156106ef5780820151818401526020810190506106d4565b50505050905090810190601f16801561071c5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61076c6004803603602081101561074057600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506112f3565b005b61077661135d565b005b6107c66004803603604081101561078e57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803515159060200190929190505050611368565b005b61080a600480360360208110156107de57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061150b565b604051808215151515815260200191505060405180910390f35b6109276004803603608081101561083a57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156108a157600080fd5b8201836020820111156108b357600080fd5b803590602001918460018302840111640100000000831117156108d557600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611528565b005b6109556004803603602081101561093f57600080fd5b810190808035906020019092919050505061159a565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561099557808201518184015260208101905061097a565b50505050905090810190601f1680156109c25780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b610a32600480360360408110156109e657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506116ad565b604051808215151515815260200191505060405180910390f35b6000806000837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff169050919050565b606060098054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610b4b5780601f10610b2057610100808354040283529160200191610b4b565b820191906000526020600020905b815481529060010190602001808311610b2e57829003601f168201915b5050505050905090565b6000610b6082611741565b610bb5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b815260200180612db6602b913960400191505060405180910390fd5b6002600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b6000610bfb826110b4565b90508073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610c9f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260208152602001807f4b495031373a20617070726f76616c20746f2063757272656e74206f776e657281525060200191505060405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161480610cdf5750610cde81336116ad565b5b610d34576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526037815260200180612de16037913960400191505060405180910390fd5b826002600084815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550818373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a4505050565b6000600780549050905090565b610dfd33826117b3565b610e52576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180612cb86030913960400191505060405180910390fd5b610e5d8383836118a7565b505050565b6000610e6d8361117c565b8210610ec4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602a815260200180612bea602a913960400191505060405180910390fd5b600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208281548110610f0e57fe5b9060005260206000200154905092915050565b6000610f2c3361150b565b610f81576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180612c146030913960400191505060405180910390fd5b610f8b83836118cb565b6001905092915050565b610fb083838360405180602001604052806000815250611528565b505050565b6000610fbf610de6565b8210611016576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b815260200180612d8b602b913960400191505060405180910390fd5b6007828154811061102357fe5b90600052602060002001549050919050565b60006110403361150b565b611095576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180612c146030913960400191505060405180910390fd5b61109f84846118cb565b6110a983836118ec565b600190509392505050565b6000806001600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415611173576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526028815260200180612c656028913960400191505060405180910390fd5b80915050919050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611203576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526029815260200180612d3a6029913960400191505060405180910390fd5b61124a600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020611976565b9050919050565b6060600a8054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156112e95780601f106112be576101008083540402835291602001916112e9565b820191906000526020600020905b8154815290600101906020018083116112cc57829003601f168201915b5050505050905090565b6112fc3361150b565b611351576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180612c146030913960400191505060405180910390fd5b61135a81611984565b50565b611366336119de565b565b3373ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561140a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260188152602001807f4b495031373a20617070726f766520746f2063616c6c6572000000000000000081525060200191505060405180910390fd5b80600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3183604051808215151515815260200191505060405180910390a35050565b600061152182600c611a3890919063ffffffff16565b9050919050565b611533848484610df3565b61153f84848484611b16565b611594576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180612d0a6030913960400191505060405180910390fd5b50505050565b60606115a582611741565b6115fa576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602e815260200180612b99602e913960400191505060405180910390fd5b600b60008381526020019081526020016000208054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156116a15780601f10611676576101008083540402835291602001916116a1565b820191906000526020600020905b81548152906001019060200180831161168457829003601f168201915b50505050509050919050565b6000600460008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b6000806001600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415915050919050565b60006117be82611741565b611813576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b815260200180612e18602b913960400191505060405180910390fd5b600061181e836110b4565b90508073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16148061188d57508373ffffffffffffffffffffffffffffffffffffffff1661187584610b55565b73ffffffffffffffffffffffffffffffffffffffff16145b8061189e575061189d81856116ad565b5b91505092915050565b6118b2838383612078565b6118bc83826122d3565b6118c68282612471565b505050565b6118d58282612538565b6118df8282612471565b6118e881612750565b5050565b6118f582611741565b61194a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602b815260200180612c8d602b913960400191505060405180910390fd5b80600b60008481526020019081526020016000209080519060200190611971929190612ac7565b505050565b600081600001549050919050565b61199881600c61279c90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b6119f281600c61287790919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fe94479a9f7e1952cc78f2d6baab678adc1b772d936c6583def489e524cb6669260405160405180910390a250565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611abf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526022815260200180612ce86022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b6000806060611b3a8673ffffffffffffffffffffffffffffffffffffffff16612934565b611b4957600192505050612070565b8573ffffffffffffffffffffffffffffffffffffffff1663150b7a0260e01b33898888604051602401808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015611c19578082015181840152602081019050611bfe565b50505050905090810190601f168015611c465780820380516001836020036101000a031916815260200191505b5095505050505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b60208310611cde5780518252602082019150602081019050602083039250611cbb565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d8060008114611d40576040519150601f19603f3d011682016040523d82523d6000602084013e611d45565b606091505b5080925081935050506000815114158015611dc9575063150b7a0260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916818060200190516020811015611d9757600080fd5b81019080805190602001909291905050507bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b15611dd957600192505050612070565b8573ffffffffffffffffffffffffffffffffffffffff16636745782b60e01b33898888604051602401808573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015611ea9578082015181840152602081019050611e8e565b50505050905090810190601f168015611ed65780820380516001836020036101000a031916815260200191505b5095505050505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b60208310611f6e5780518252602082019150602081019050602083039250611f4b565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d8060008114611fd0576040519150601f19603f3d011682016040523d82523d6000602084013e611fd5565b606091505b50809250819350505060008151141580156120595750636745782b60e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191681806020019051602081101561202757600080fd5b81019080805190602001909291905050507bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b1561206957600192505050612070565b6000925050505b949350505050565b8273ffffffffffffffffffffffffffffffffffffffff16612098826110b4565b73ffffffffffffffffffffffffffffffffffffffff1614612104576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526028815260200180612d636028913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561218a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526023815260200180612bc76023913960400191505060405180910390fd5b61219381612947565b6121da600360008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020612a05565b612221600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020612a28565b816001600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a4505050565b600061232b6001600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002080549050612a3e90919063ffffffff16565b9050600060066000848152602001908152602001600020549050818114612418576000600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020838154811061239857fe5b9060005260206000200154905080600560008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002083815481106123f057fe5b9060005260206000200181905550816006600083815260200190815260200160002081905550505b600560008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002080548091906001900361246a9190612b47565b5050505050565b600560008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805490506006600083815260200190815260200160002081905550600560008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208190806001815401808255809150509060018203906000526020600020016000909192909190915055505050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156125db576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f4b495031373a206d696e7420746f20746865207a65726f20616464726573730081525060200191505060405180910390fd5b6125e481611741565b15612657576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f4b495031373a20746f6b656e20616c7265616479206d696e746564000000000081525060200191505060405180910390fd5b816001600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506126f0600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020612a28565b808273ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a45050565b6007805490506008600083815260200190815260200160002081905550600781908060018154018082558091505090600182039060005260206000200160009091929091909150555050565b6127a68282611a38565b15612819576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b6128818282611a38565b6128d6576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180612c446021913960400191505060405180910390fd5b60008260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b600080823b905060008111915050919050565b600073ffffffffffffffffffffffffffffffffffffffff166002600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614612a025760006002600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505b50565b612a1d60018260000154612a3e90919063ffffffff16565b816000018190555050565b6001816000016000828254019250508190555050565b600082821115612ab6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601e8152602001807f536166654d6174683a207375627472616374696f6e206f766572666c6f77000081525060200191505060405180910390fd5b600082840390508091505092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10612b0857805160ff1916838001178555612b36565b82800160010185558215612b36579182015b82811115612b35578251825591602001919060010190612b1a565b5b509050612b439190612b73565b5090565b815481835581811115612b6e57818360005260206000209182019101612b6d9190612b73565b5b505050565b612b9591905b80821115612b91576000816000905550600101612b79565b5090565b9056fe4b495031374d657461646174613a2055524920717565727920666f72206e6f6e6578697374656e7420746f6b656e4b495031373a207472616e7366657220746f20746865207a65726f20616464726573734b49503137456e756d657261626c653a206f776e657220696e646578206f7574206f6620626f756e64734d696e746572526f6c653a2063616c6c657220646f6573206e6f74206861766520746865204d696e74657220726f6c65526f6c65733a206163636f756e7420646f6573206e6f74206861766520726f6c654b495031373a206f776e657220717565727920666f72206e6f6e6578697374656e7420746f6b656e4b495031374d657461646174613a2055524920736574206f66206e6f6e6578697374656e7420746f6b656e4b495031373a207472616e736665722063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f766564526f6c65733a206163636f756e7420697320746865207a65726f20616464726573734b495031373a207472616e7366657220746f206e6f6e204b49503137526563656976657220696d706c656d656e7465724b495031373a2062616c616e636520717565727920666f7220746865207a65726f20616464726573734b495031373a207472616e73666572206f6620746f6b656e2074686174206973206e6f74206f776e4b49503137456e756d657261626c653a20676c6f62616c20696e646578206f7574206f6620626f756e64734b495031373a20617070726f76656420717565727920666f72206e6f6e6578697374656e7420746f6b656e4b495031373a20617070726f76652063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f76656420666f7220616c6c4b495031373a206f70657261746f7220717565727920666f72206e6f6e6578697374656e7420746f6b656ea165627a7a72305820f1e4b54636e204b36742d94fe36135c736f22cb8b569f00dbc1b06129135841f0029526f6c65733a206163636f756e7420697320746865207a65726f2061646472657373'
            const abiWithoutBurnablePausable = [
                {
                    inputs: [{ name: 'name', type: 'string' }, { name: 'symbol', type: 'string' }],
                    payable: false,
                    stateMutability: 'nonpayable',
                    type: 'constructor',
                },
            ]

            const deployed = await new caver.contract(abiWithoutBurnablePausable)
                .deploy({
                    data: byteCodeWithoutBurnablePausable,
                    arguments: ['Test', 'TST'],
                })
                .send({ from: sender.address, gas: 10000000 })
            const contractAddress = deployed.options.address

            for (const kip17 of kip17s) {
                const token = new kip17(contractAddress)
                let detected = await token.detectInterface()

                expect(detected.IKIP17).to.be.true
                expect(detected.IKIP17Metadata).to.be.true
                expect(detected.IKIP17Enumerable).to.be.true
                expect(detected.IKIP17Mintable).to.be.true
                expect(detected.IKIP17MetadataMintable).to.be.true
                expect(detected.IKIP17Burnable).to.be.false
                expect(detected.IKIP17Pausable).to.be.false

                // Test static function
                detected = await kip17.detectInterface(contractAddress)

                expect(detected.IKIP17).to.be.true
                expect(detected.IKIP17Metadata).to.be.true
                expect(detected.IKIP17Enumerable).to.be.true
                expect(detected.IKIP17Mintable).to.be.true
                expect(detected.IKIP17MetadataMintable).to.be.true
                expect(detected.IKIP17Burnable).to.be.false
                expect(detected.IKIP17Pausable).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-210: should throw an error if the KIP-13 specification is not satisfied ', async () => {
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

            for (const kip17 of kip17s) {
                const token = new kip17(contractAddress)

                const expectedError = `This contract does not support KIP-13.`
                await expect(token.detectInterface()).to.be.rejectedWith(expectedError)
                await expect(kip17.detectInterface(contractAddress)).to.be.rejectedWith(expectedError)
            }
        }).timeout(200000)
    })

    context('KIP17 with fee delegation', () => {
        const contractDeployFormatter = receipt => {
            return receipt
        }

        it('CAVERJS-UNIT-KCT-233: should send TxTypeSmartContractDeploy to deploy when feeDelegation is defined as true', async () => {
            const deployed = await caver.kct.kip17.deploy(
                {
                    name: 'Jasmine',
                    symbol: 'JAS',
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

        it('CAVERJS-UNIT-KCT-234: should send TxTypeFeeDelegatedSmartContractDeployWithRatio to deploy when feeRatio is defined and feeDelegation is defined as true', async () => {
            const deployed = await caver.kct.kip17.deploy(
                {
                    name: 'Jasmine',
                    symbol: 'JAS',
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

        it('CAVERJS-UNIT-KCT-235: should send TxTypeSmartContractExecution to add minter when feeDelegation is defined as true', async () => {
            const token = caver.kct.kip17.create(kip17Address)

            const added = await token.addMinter(caver.wallet.keyring.generate().address, {
                from: sender.address,
                feeDelegation: true,
                feePayer: feePayer.address,
            })

            expect(added.from).to.equals(sender.address.toLowerCase())
            expect(added.status).to.be.true
            expect(added.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-236: should send TxTypeSmartContractExecution to add minter when feeDelegation is defined as true via options', async () => {
            const token = caver.kct.kip17.create(kip17Address)

            token.options.from = sender.address
            token.options.feeDelegation = true
            token.options.feePayer = feePayer.address

            const added = await token.addMinter(caver.wallet.keyring.generate().address)

            expect(added.from).to.equals(sender.address.toLowerCase())
            expect(added.status).to.be.true
            expect(added.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-237: should send TxTypeFeeDelegatedSmartContractExecutionWithRatio to add minter when feeRatio is defined and feeDelegation is defined as true', async () => {
            const token = caver.kct.kip17.create(kip17Address)

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

        it('CAVERJS-UNIT-KCT-238: should send TxTypeFeeDelegatedSmartContractExecutionWithRatio to add minter when feeRatio is defined and feeDelegation is defined as true via options', async () => {
            const token = caver.kct.kip17.create(kip17Address)

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

        it('CAVERJS-UNIT-KCT-239: should overwrite contract.options when user send sendOptions parameter', async () => {
            const token = caver.kct.kip17.create(kip17Address)

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

        it('CAVERJS-UNIT-KCT-240: should sign and return signed TxTypeFeeDelegatedSmartContractDeploy', async () => {
            const token = caver.kct.kip17.create()

            const signed = await token.sign(
                {
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    gas: 30000000,
                },
                'constructor',
                caver.kct.kip17.byteCode,
                'Jasmine',
                'JAS'
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

        it('CAVERJS-UNIT-KCT-241: should sign as fee payer and return signed TxTypeFeeDelegatedSmartContractDeploy', async () => {
            const token = caver.kct.kip17.create()

            const signed = await token.signAsFeePayer(
                {
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    gas: 30000000,
                },
                'constructor',
                caver.kct.kip17.byteCode,
                'Jasmine',
                'JAS'
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

        it('CAVERJS-UNIT-KCT-242: should sign and return signed TxTypeFeeDelegatedSmartContractExecution', async () => {
            const token = caver.kct.kip17.create(kip17Address)

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

        it('CAVERJS-UNIT-KCT-243: should sign as fee payer and return signed TxTypeFeeDelegatedSmartContractExecution', async () => {
            const token = caver.kct.kip17.create(kip17Address)

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
