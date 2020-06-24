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
let kip17s
let sender
let testAccount
let receiver

let tokenId = 0

const ownerMap = {}

let nonFungibleTokenAddress

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

                nonFungibleTokenAddress = deployed.options.address
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
                const token = new kip17(nonFungibleTokenAddress)

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
                const token = new kip17(nonFungibleTokenAddress)

                const name = await token.name()

                expect(name).to.equals(tokenInfo.name)
            }
        }).timeout(200000)
    })

    context('KIP17.symbol', () => {
        it('CAVERJS-UNIT-KCT-066: should call symbol method', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const symbol = await token.symbol()

                expect(symbol).to.equals(tokenInfo.symbol)
            }
        }).timeout(200000)
    })

    context('KIP17.totalSupply', () => {
        let expectedTotal = 0
        it('CAVERJS-UNIT-KCT-067: should call totalSupply method', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

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
                const token = new kip17(nonFungibleTokenAddress)

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
                const token = new kip17(nonFungibleTokenAddress)

                const tokenByIndex = await token.tokenOfOwnerByIndex(sender.address, 0)
                expect(tokenByIndex.eq(0)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP17.tokenByIndex', () => {
        it('CAVERJS-UNIT-KCT-070: should call tokenByIndex method', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

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
                const token = new kip17(nonFungibleTokenAddress)

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
                const token = new kip17(nonFungibleTokenAddress)

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
                const token = new kip17(nonFungibleTokenAddress)

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
                const token = new kip17(nonFungibleTokenAddress)

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
                const token = new kip17(nonFungibleTokenAddress)

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
                const token = new kip17(nonFungibleTokenAddress)

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
                const token = new kip17(nonFungibleTokenAddress)

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
                const token = new kip17(nonFungibleTokenAddress)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const approved = await token.approve(testAccount.address, mintedTokenId)
                expect(approved.from).to.be.equals(sender.address.toLowerCase())
                expect(approved.status).to.be.true
                expect(approved.events).not.to.be.undefined
                expect(approved.events.Approval).not.to.be.undefined
                expect(approved.events.Approval.address).to.equals(nonFungibleTokenAddress)

                const getApproved = await token.getApproved(mintedTokenId)

                expect(getApproved.toLowerCase()).to.equals(testAccount.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-079: should send transaction for calling approve method and set approve with token id with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                const approved = await token.approve(testAccount.address, mintedTokenId, { from: sender.address })
                expect(approved.from).to.be.equals(sender.address.toLowerCase())
                expect(approved.status).to.be.true
                expect(approved.events).not.to.be.undefined
                expect(approved.events.Approval).not.to.be.undefined
                expect(approved.events.Approval.address).to.equals(nonFungibleTokenAddress)

                const getApproved = await token.getApproved(mintedTokenId)

                expect(getApproved.toLowerCase()).to.equals(testAccount.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-080: should send transaction for calling approve method and set approve with token id with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

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
                expect(approved.events.Approval.address).to.equals(nonFungibleTokenAddress)

                const getApproved = await token.getApproved(mintedTokenId)

                expect(getApproved.toLowerCase()).to.equals(testAccount.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-081: should send transaction for calling approve method and set approve with token id with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                const customGasLimit = '0x186a0'

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const approved = await token.approve(testAccount.address, mintedTokenId, { gas: customGasLimit })
                expect(approved.from).to.be.equals(sender.address.toLowerCase())
                expect(approved.gas).to.equals(customGasLimit)
                expect(approved.status).to.be.true
                expect(approved.events).not.to.be.undefined
                expect(approved.events.Approval).not.to.be.undefined
                expect(approved.events.Approval.address).to.equals(nonFungibleTokenAddress)

                const getApproved = await token.getApproved(mintedTokenId)

                expect(getApproved.toLowerCase()).to.equals(testAccount.address.toLowerCase())
            }
        }).timeout(200000)
    })

    context('KIP17.setApprovalForAll', () => {
        it('CAVERJS-UNIT-KCT-082: should send transaction for calling setApprovalForAll method and set approve with all token without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const testKeyring = caver.wallet.keyring.generate()

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const setApprovalForAll = await token.setApprovalForAll(testKeyring.address, false)
                expect(setApprovalForAll.from).to.be.equals(sender.address.toLowerCase())
                expect(setApprovalForAll.status).to.be.true
                expect(setApprovalForAll.events).not.to.be.undefined
                expect(setApprovalForAll.events.ApprovalForAll).not.to.be.undefined
                expect(setApprovalForAll.events.ApprovalForAll.address).to.equals(nonFungibleTokenAddress)

                const isApprovedForAll = await token.isApprovedForAll(sender.address, testKeyring.address)

                expect(isApprovedForAll).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-083: should send transaction for calling setApprovalForAll method and set approve with all token with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const testKeyring = caver.wallet.keyring.generate()

                const setApprovalForAll = await token.setApprovalForAll(testKeyring.address, true, { from: sender.address })
                expect(setApprovalForAll.from).to.be.equals(sender.address.toLowerCase())
                expect(setApprovalForAll.status).to.be.true
                expect(setApprovalForAll.events).not.to.be.undefined
                expect(setApprovalForAll.events.ApprovalForAll).not.to.be.undefined
                expect(setApprovalForAll.events.ApprovalForAll.address).to.equals(nonFungibleTokenAddress)

                const isApprovedForAll = await token.isApprovedForAll(sender.address, testKeyring.address)

                expect(isApprovedForAll).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-084: should send transaction for calling setApprovalForAll method and set approve with all token with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

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
                expect(setApprovalForAll.events.ApprovalForAll.address).to.equals(nonFungibleTokenAddress)

                const isApprovedForAll = await token.isApprovedForAll(sender.address, testKeyring.address)

                expect(isApprovedForAll).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-085: should send transaction for calling setApprovalForAll method and set approve with all token with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const testKeyring = caver.wallet.keyring.generate()

                const customGasLimit = '0x186a0'

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const setApprovalForAll = await token.setApprovalForAll(testKeyring.address, true, { gas: customGasLimit })
                expect(setApprovalForAll.from).to.be.equals(sender.address.toLowerCase())
                expect(setApprovalForAll.gas).to.equals(customGasLimit)
                expect(setApprovalForAll.status).to.be.true
                expect(setApprovalForAll.events).not.to.be.undefined
                expect(setApprovalForAll.events.ApprovalForAll).not.to.be.undefined
                expect(setApprovalForAll.events.ApprovalForAll.address).to.equals(nonFungibleTokenAddress)

                const isApprovedForAll = await token.isApprovedForAll(sender.address, testKeyring.address)

                expect(isApprovedForAll).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP17.transferFrom', () => {
        it('CAVERJS-UNIT-KCT-086: should send transaction to transfer token and trigger Transfer event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const tokenIdToTransfer = mintedTokenId
                const transfered = await token.transferFrom(sender.address, receiver.address, tokenIdToTransfer)
                expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(tokenIdToTransfer)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-087: should send transaction to transfer token and trigger Transfer event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const tokenIdToTransfer = mintedTokenId
                const transfered = await token.transferFrom(sender.address, receiver.address, tokenIdToTransfer, {
                    from: testAccount.address,
                })
                expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(tokenIdToTransfer)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-088: should send transaction to transfer token and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

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
                expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(tokenIdToTransfer)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-089: should send transaction to transfer token and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const customGasLimit = '0x249f0'

                const tokenIdToTransfer = mintedTokenId
                const transfered = await token.transferFrom(sender.address, receiver.address, tokenIdToTransfer, { gas: customGasLimit })
                expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(tokenIdToTransfer)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)
    })

    context('KIP17.safeTransferFrom', () => {
        it('CAVERJS-UNIT-KCT-090: should send token via safeTransferFrom without data and trigger Transfer event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const transfered = await token.safeTransferFrom(sender.address, receiver.address, mintedTokenId)
                expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(mintedTokenId)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-091: should send token via safeTransferFrom without data and trigger Transfer event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const transfered = await token.safeTransferFrom(sender.address, receiver.address, mintedTokenId, {
                    from: testAccount.address,
                })
                expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(mintedTokenId)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-092: should send token via safeTransferFrom without data and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

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
                expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(mintedTokenId)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-093: should send token via safeTransferFrom without data and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const customGasLimit = '0x249f0'

                const transfered = await token.safeTransferFrom(sender.address, receiver.address, mintedTokenId, { gas: customGasLimit })
                expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
                expect(transfered.gas).to.equals(customGasLimit)
                expect(transfered.status).to.be.true
                expect(transfered.events).not.to.be.undefined
                expect(transfered.events.Transfer).not.to.be.undefined
                expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(mintedTokenId)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-094: should send token via safeTransferFrom with data and trigger Transfer event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip7 instance
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
                expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(mintedTokenId)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-095: should send token via safeTransferFrom with data and trigger Transfer event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip7 instance
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
                expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(mintedTokenId)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-096: should send token via safeTransferFrom with data and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

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
                expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(mintedTokenId)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-097: should send token via safeTransferFrom with data and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const mintedTokenId = tokenId
                await token.mintWithTokenURI(sender.address, mintedTokenId, tokenURI, { from: sender.address })
                ownerMap[sender.address].push(mintedTokenId)
                tokenId++

                await token.approve(testAccount.address, mintedTokenId, { from: sender.address })

                // set deafult from address in kip7 instance
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
                expect(transfered.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(mintedTokenId)
                expect(owner.toLowerCase()).to.be.equals(receiver.address.toLowerCase())
            }
        }).timeout(200000)
    })

    context('KIP17.addMinter', () => {
        it('CAVERJS-UNIT-KCT-098: should send transaction for adding minter and trigger MinterAdded event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const newMinter = caver.klay.accounts.create().address
                expect(await token.isMinter(newMinter)).to.be.false

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const minterAdded = await token.addMinter(newMinter)
                expect(minterAdded.from).to.be.equals(sender.address.toLowerCase())
                expect(minterAdded.status).to.be.true
                expect(minterAdded.events).not.to.be.undefined
                expect(minterAdded.events.MinterAdded).not.to.be.undefined
                expect(minterAdded.events.MinterAdded.address).to.equals(nonFungibleTokenAddress)

                expect(await token.isMinter(newMinter)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-099: should send transaction for adding minter and trigger MinterAdded event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const newMinter = caver.klay.accounts.create().address
                expect(await token.isMinter(newMinter)).to.be.false

                const minterAdded = await token.addMinter(newMinter, { from: sender.address })
                expect(minterAdded.from).to.be.equals(sender.address.toLowerCase())
                expect(minterAdded.status).to.be.true
                expect(minterAdded.events).not.to.be.undefined
                expect(minterAdded.events.MinterAdded).not.to.be.undefined
                expect(minterAdded.events.MinterAdded.address).to.equals(nonFungibleTokenAddress)

                expect(await token.isMinter(newMinter)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-100: should send transaction for adding minter and trigger MinterAdded event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const newMinter = caver.klay.accounts.create().address
                expect(await token.isMinter(newMinter)).to.be.false

                const customGasLimit = '0x30d40'
                const minterAdded = await token.addMinter(newMinter, { from: sender.address, gas: customGasLimit })
                expect(minterAdded.gas).to.equals(customGasLimit)
                expect(minterAdded.from).to.be.equals(sender.address.toLowerCase())
                expect(minterAdded.status).to.be.true
                expect(minterAdded.events).not.to.be.undefined
                expect(minterAdded.events.MinterAdded).not.to.be.undefined
                expect(minterAdded.events.MinterAdded.address).to.equals(nonFungibleTokenAddress)

                expect(await token.isMinter(newMinter)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-101: should send transaction for adding minter and trigger MinterAdded event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const newMinter = caver.klay.accounts.create().address
                expect(await token.isMinter(newMinter)).to.be.false

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const customGasLimit = '0x30d40'
                const minterAdded = await token.addMinter(newMinter, { gas: customGasLimit })
                expect(minterAdded.from).to.be.equals(sender.address.toLowerCase())
                expect(minterAdded.status).to.be.true
                expect(minterAdded.events).not.to.be.undefined
                expect(minterAdded.events.MinterAdded).not.to.be.undefined
                expect(minterAdded.events.MinterAdded.address).to.equals(nonFungibleTokenAddress)

                expect(await token.isMinter(newMinter)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP17.renounceMinter', () => {
        it('CAVERJS-UNIT-KCT-102: should send transaction for removing minter and trigger MinterRemoved event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                await token.addMinter(testAccount.address, { from: sender.address })
                expect(await token.isMinter(testAccount.address)).to.be.true

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const minterRemoved = await token.renounceMinter()
                expect(minterRemoved.from).to.be.equals(testAccount.address.toLowerCase())
                expect(minterRemoved.status).to.be.true
                expect(minterRemoved.events).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved.address).to.equals(nonFungibleTokenAddress)

                expect(await token.isMinter(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-103: should send transaction for removing minter and trigger MinterRemoved event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                await token.addMinter(testAccount.address, { from: sender.address })
                expect(await token.isMinter(testAccount.address)).to.be.true

                const minterRemoved = await token.renounceMinter({ from: testAccount.address })
                expect(minterRemoved.from).to.be.equals(testAccount.address.toLowerCase())
                expect(minterRemoved.status).to.be.true
                expect(minterRemoved.events).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved.address).to.equals(nonFungibleTokenAddress)

                expect(await token.isMinter(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-104: should send transaction for removing minter and trigger MinterRemoved event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                await token.addMinter(testAccount.address, { from: sender.address })
                expect(await token.isMinter(testAccount.address)).to.be.true

                const customGasLimit = '0x30d40'
                const minterRemoved = await token.renounceMinter({ from: testAccount.address, gas: customGasLimit })
                expect(minterRemoved.gas).to.equals(customGasLimit)
                expect(minterRemoved.from).to.be.equals(testAccount.address.toLowerCase())
                expect(minterRemoved.status).to.be.true
                expect(minterRemoved.events).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved.address).to.equals(nonFungibleTokenAddress)

                expect(await token.isMinter(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-105: should send transaction for removing minter and trigger MinterRemoved event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                await token.addMinter(testAccount.address, { from: sender.address })
                expect(await token.isMinter(testAccount.address)).to.be.true

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const customGasLimit = '0x30d40'
                const minterRemoved = await token.renounceMinter({ gas: customGasLimit })
                expect(minterRemoved.from).to.be.equals(testAccount.address.toLowerCase())
                expect(minterRemoved.status).to.be.true
                expect(minterRemoved.events).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved).not.to.be.undefined
                expect(minterRemoved.events.MinterRemoved.address).to.equals(nonFungibleTokenAddress)

                expect(await token.isMinter(testAccount.address)).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP17.mintWithTokenURI', () => {
        it('CAVERJS-UNIT-KCT-106: should send transaction for minting and trigger Transfer event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const originalSupply = await token.totalSupply()

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const minted = await token.mintWithTokenURI(testAccount.address, tokenId, tokenURI)
                expect(minted.from).to.be.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(tokenId)
                expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

                const afterSupply = await token.totalSupply()

                expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-107: should send transaction for minting and trigger Transfer event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const originalSupply = await token.totalSupply()

                const minted = await token.mintWithTokenURI(testAccount.address, tokenId, tokenURI, { from: sender.address })
                expect(minted.from).to.be.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(tokenId)
                expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

                const afterSupply = await token.totalSupply()

                expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-108: should send transaction for minting and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

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
                expect(minted.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(tokenId)
                expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

                const afterSupply = await token.totalSupply()

                expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-109: should send transaction for minting and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const originalSupply = await token.totalSupply()

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const customGasLimit = '0x493e0'
                const minted = await token.mintWithTokenURI(testAccount.address, tokenId, tokenURI, { gas: customGasLimit })
                expect(minted.from).to.be.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(nonFungibleTokenAddress)

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
                const token = new kip17(nonFungibleTokenAddress)

                await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

                const originalSupply = await token.totalSupply()

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const burned = await token.burn(tokenId)
                expect(burned.from).to.be.equals(sender.address.toLowerCase())
                expect(burned.status).to.be.true
                expect(burned.events).not.to.be.undefined
                expect(burned.events.Transfer).not.to.be.undefined
                expect(burned.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const afterSupply = await token.totalSupply()
                expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-111: should send transaction for burning and trigger Transfer event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

                const originalSupply = await token.totalSupply()

                const burned = await token.burn(tokenId, { from: sender.address })
                expect(burned.from).to.be.equals(sender.address.toLowerCase())
                expect(burned.status).to.be.true
                expect(burned.events).not.to.be.undefined
                expect(burned.events.Transfer).not.to.be.undefined
                expect(burned.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const afterSupply = await token.totalSupply()
                expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-112: should send transaction for burning and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

                const originalSupply = await token.totalSupply()

                const customGasLimit = '0x30d40'
                const burned = await token.burn(tokenId, { from: sender.address, gas: customGasLimit })
                expect(burned.gas).to.equals(customGasLimit)
                expect(burned.from).to.be.equals(sender.address.toLowerCase())
                expect(burned.status).to.be.true
                expect(burned.events).not.to.be.undefined
                expect(burned.events.Transfer).not.to.be.undefined
                expect(burned.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const afterSupply = await token.totalSupply()
                expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-113: should send transaction for burning and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                await token.mintWithTokenURI(sender.address, tokenId, tokenURI, { from: sender.address })

                const originalSupply = await token.totalSupply()

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const customGasLimit = '0x30d40'
                const burned = await token.burn(tokenId, { gas: customGasLimit })
                expect(burned.from).to.be.equals(sender.address.toLowerCase())
                expect(burned.status).to.be.true
                expect(burned.events).not.to.be.undefined
                expect(burned.events.Transfer).not.to.be.undefined
                expect(burned.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const afterSupply = await token.totalSupply()
                expect(Number(originalSupply) - Number(afterSupply)).to.be.equals(1)
                tokenId++
            }
        }).timeout(200000)
    })

    context('KIP17.pause', () => {
        it('CAVERJS-UNIT-KCT-114: should send transaction for pausing without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const doPause = await token.pause()
                expect(doPause.from).to.be.equals(sender.address.toLowerCase())
                expect(doPause.status).to.be.true
                expect(doPause.events).not.to.be.undefined
                expect(doPause.events.Paused).not.to.be.undefined
                expect(doPause.events.Paused.address).to.equals(nonFungibleTokenAddress)

                expect(await token.paused()).to.be.true

                await token.unpause({ from: sender.address })
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-115: should send transaction for pausing with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const doPause = await token.pause({ from: sender.address })
                expect(doPause.from).to.be.equals(sender.address.toLowerCase())
                expect(doPause.status).to.be.true
                expect(doPause.events).not.to.be.undefined
                expect(doPause.events.Paused).not.to.be.undefined
                expect(doPause.events.Paused.address).to.equals(nonFungibleTokenAddress)

                expect(await token.paused()).to.be.true

                await token.unpause({ from: sender.address })
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-116: should send transaction for pausing with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const customGasLimit = '0x30d40'
                const doPause = await token.pause({ from: sender.address, gas: customGasLimit })
                expect(doPause.gas).to.equals(customGasLimit)
                expect(doPause.from).to.be.equals(sender.address.toLowerCase())
                expect(doPause.status).to.be.true
                expect(doPause.events).not.to.be.undefined
                expect(doPause.events.Paused).not.to.be.undefined
                expect(doPause.events.Paused.address).to.equals(nonFungibleTokenAddress)

                expect(await token.paused()).to.be.true

                await token.unpause({ from: sender.address })
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-117: should send transaction for pausing with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const customGasLimit = '0x30d40'
                const doPause = await token.pause({ gas: customGasLimit })
                expect(doPause.from).to.be.equals(sender.address.toLowerCase())
                expect(doPause.status).to.be.true
                expect(doPause.events).not.to.be.undefined
                expect(doPause.events.Paused).not.to.be.undefined
                expect(doPause.events.Paused.address).to.equals(nonFungibleTokenAddress)

                expect(await token.paused()).to.be.true

                await token.unpause({ from: sender.address })
            }
        }).timeout(200000)
    })

    context('KIP17.unpause', () => {
        it('CAVERJS-UNIT-KCT-118: should send transaction for unpausing without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                await token.pause({ from: sender.address })

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const doUnpause = await token.unpause()
                expect(doUnpause.from).to.be.equals(sender.address.toLowerCase())
                expect(doUnpause.status).to.be.true
                expect(doUnpause.events).not.to.be.undefined
                expect(doUnpause.events.Unpaused).not.to.be.undefined
                expect(doUnpause.events.Unpaused.address).to.equals(nonFungibleTokenAddress)

                expect(await token.paused()).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-119: should send transaction for unpausing with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                await token.pause({ from: sender.address })

                const doUnpause = await token.unpause({ from: sender.address })
                expect(doUnpause.from).to.be.equals(sender.address.toLowerCase())
                expect(doUnpause.status).to.be.true
                expect(doUnpause.events).not.to.be.undefined
                expect(doUnpause.events.Unpaused).not.to.be.undefined
                expect(doUnpause.events.Unpaused.address).to.equals(nonFungibleTokenAddress)

                expect(await token.paused()).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-120: should send transaction for unpausing with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                await token.pause({ from: sender.address })

                const customGasLimit = '0x30d40'
                const doUnpause = await token.unpause({ from: sender.address, gas: customGasLimit })
                expect(doUnpause.gas).to.equals(customGasLimit)
                expect(doUnpause.from).to.be.equals(sender.address.toLowerCase())
                expect(doUnpause.status).to.be.true
                expect(doUnpause.events).not.to.be.undefined
                expect(doUnpause.events.Unpaused).not.to.be.undefined
                expect(doUnpause.events.Unpaused.address).to.equals(nonFungibleTokenAddress)

                expect(await token.paused()).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-121: should send transaction for unpausing with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                await token.pause({ from: sender.address })

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const customGasLimit = '0x30d40'
                const doUnpause = await token.unpause({ gas: customGasLimit })
                expect(doUnpause.from).to.be.equals(sender.address.toLowerCase())
                expect(doUnpause.status).to.be.true
                expect(doUnpause.events).not.to.be.undefined
                expect(doUnpause.events.Unpaused).not.to.be.undefined
                expect(doUnpause.events.Unpaused.address).to.equals(nonFungibleTokenAddress)

                expect(await token.paused()).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP17.addPauser', () => {
        it('CAVERJS-UNIT-KCT-122: should send transaction for adding pauser and trigger PauserAdded event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const newPauser = caver.klay.accounts.create().address
                expect(await token.isPauser(newPauser)).to.be.false

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const pauserAdded = await token.addPauser(newPauser)
                expect(pauserAdded.from).to.be.equals(sender.address.toLowerCase())
                expect(pauserAdded.status).to.be.true
                expect(pauserAdded.events).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded.address).to.equals(nonFungibleTokenAddress)

                expect(await token.isPauser(newPauser)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-123: should send transaction for adding pauser and trigger PauserAdded event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const newPauser = caver.klay.accounts.create().address
                expect(await token.isPauser(newPauser)).to.be.false

                const pauserAdded = await token.addPauser(newPauser, { from: sender.address })
                expect(pauserAdded.from).to.be.equals(sender.address.toLowerCase())
                expect(pauserAdded.status).to.be.true
                expect(pauserAdded.events).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded.address).to.equals(nonFungibleTokenAddress)

                expect(await token.isPauser(newPauser)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-124: should send transaction for adding pauser and trigger PauserAdded event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const newPauser = caver.klay.accounts.create().address
                expect(await token.isPauser(newPauser)).to.be.false

                const customGasLimit = '0x493e0'
                const pauserAdded = await token.addPauser(newPauser, { from: sender.address, gas: customGasLimit })
                expect(pauserAdded.gas).to.equals(customGasLimit)
                expect(pauserAdded.from).to.be.equals(sender.address.toLowerCase())
                expect(pauserAdded.status).to.be.true
                expect(pauserAdded.events).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded.address).to.equals(nonFungibleTokenAddress)

                expect(await token.isPauser(newPauser)).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-125: should send transaction for adding pauser and trigger PauserAdded event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const newPauser = caver.klay.accounts.create().address
                expect(await token.isPauser(newPauser)).to.be.false

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const customGasLimit = '0x493e0'
                const pauserAdded = await token.addPauser(newPauser, { gas: customGasLimit })
                expect(pauserAdded.from).to.be.equals(sender.address.toLowerCase())
                expect(pauserAdded.status).to.be.true
                expect(pauserAdded.events).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded).not.to.be.undefined
                expect(pauserAdded.events.PauserAdded.address).to.equals(nonFungibleTokenAddress)

                expect(await token.isPauser(newPauser)).to.be.true
            }
        }).timeout(200000)
    })

    context('KIP17.renouncePauser', () => {
        it('CAVERJS-UNIT-KCT-126: should send transaction for removing pauser and trigger PauserRemoved event without sendParams', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                await token.addPauser(testAccount.address, { from: sender.address })
                expect(await token.isPauser(testAccount.address)).to.be.true

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const pauserRemoved = await token.renouncePauser()
                expect(pauserRemoved.from).to.be.equals(testAccount.address.toLowerCase())
                expect(pauserRemoved.status).to.be.true
                expect(pauserRemoved.events).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved.address).to.equals(nonFungibleTokenAddress)

                expect(await token.isPauser(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-127: should send transaction for removing pauser and trigger PauserRemoved event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                await token.addPauser(testAccount.address, { from: sender.address })
                expect(await token.isPauser(testAccount.address)).to.be.true

                const pauserRemoved = await token.renouncePauser({ from: testAccount.address })
                expect(pauserRemoved.from).to.be.equals(testAccount.address.toLowerCase())
                expect(pauserRemoved.status).to.be.true
                expect(pauserRemoved.events).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved.address).to.equals(nonFungibleTokenAddress)

                expect(await token.isPauser(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-128: should send transaction for removing pauser and trigger PauserRemoved event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                await token.addPauser(testAccount.address, { from: sender.address })
                expect(await token.isPauser(testAccount.address)).to.be.true

                const customGasLimit = '0x30d40'
                const pauserRemoved = await token.renouncePauser({ from: testAccount.address, gas: customGasLimit })
                expect(pauserRemoved.gas).to.equals(customGasLimit)
                expect(pauserRemoved.from).to.be.equals(testAccount.address.toLowerCase())
                expect(pauserRemoved.status).to.be.true
                expect(pauserRemoved.events).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved.address).to.equals(nonFungibleTokenAddress)

                expect(await token.isPauser(testAccount.address)).to.be.false
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-129: should send transaction for removing pauser and trigger PauserRemoved event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                await token.addPauser(testAccount.address, { from: sender.address })
                expect(await token.isPauser(testAccount.address)).to.be.true

                // set deafult from address in kip7 instance
                token.options.from = testAccount.address

                const customGasLimit = '0x30d40'
                const pauserRemoved = await token.renouncePauser({ gas: customGasLimit })
                expect(pauserRemoved.from).to.be.equals(testAccount.address.toLowerCase())
                expect(pauserRemoved.status).to.be.true
                expect(pauserRemoved.events).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved).not.to.be.undefined
                expect(pauserRemoved.events.PauserRemoved.address).to.equals(nonFungibleTokenAddress)

                expect(await token.isPauser(testAccount.address)).to.be.false
            }
        }).timeout(200000)
    })

    context('KIP17.supportsInterface', () => {
        it('CAVERJS-UNIT-KCT-138: should return true if interfaceId is supported', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

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
                const token = new kip17(nonFungibleTokenAddress)

                const originalSupply = await token.totalSupply()

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const minted = await token.mint(testAccount.address, tokenId)
                expect(minted.from).to.be.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(tokenId)
                expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

                const afterSupply = await token.totalSupply()

                expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-141: should send transaction for minting and trigger Transfer event with sendParams(from)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const originalSupply = await token.totalSupply()

                const minted = await token.mint(testAccount.address, tokenId, { from: sender.address })
                expect(minted.from).to.be.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(tokenId)
                expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

                const afterSupply = await token.totalSupply()

                expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-142: should send transaction for minting and trigger Transfer event with sendParams(from, gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

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
                expect(minted.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(tokenId)
                expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

                const afterSupply = await token.totalSupply()

                expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
                tokenId++
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-143: should send transaction for minting and trigger Transfer event with sendParams(gas)', async () => {
            for (const kip17 of kip17s) {
                const token = new kip17(nonFungibleTokenAddress)

                const originalSupply = await token.totalSupply()

                // set deafult from address in kip7 instance
                token.options.from = sender.address

                const customGasLimit = '0x493e0'
                const minted = await token.mint(testAccount.address, tokenId, { gas: customGasLimit })
                expect(minted.from).to.be.equals(sender.address.toLowerCase())
                expect(minted.status).to.be.true
                expect(minted.events).not.to.be.undefined
                expect(minted.events.Transfer).not.to.be.undefined
                expect(minted.events.Transfer.address).to.equals(nonFungibleTokenAddress)

                const owner = await token.ownerOf(tokenId)
                expect(owner.toLowerCase()).to.equals(testAccount.address.toLowerCase())

                const afterSupply = await token.totalSupply()

                expect(Number(afterSupply) - Number(originalSupply)).to.equals(1)
                tokenId++
            }
        }).timeout(200000)
    })
})
