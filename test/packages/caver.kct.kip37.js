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
const _ = require('lodash')

const testRPCURL = require('../testrpc')
const { expect } = require('../extendedChai')

const Caver = require('../../index.js')

let caver
let sender
let testAccount
let receiver
const testAddresses = []

const tokenId = 0
const tokenIds = [tokenId]

const ownerMap = {}

let multiTokenAddress

const tokenURI = 'https://game.example/item-id-8u5h2m.json'
const tokenInfo = { uri: tokenURI }

const prepareTestSetting = async () => {
    testAccount = caver.wallet.add(caver.wallet.keyring.generate())
    testAddresses.push(testAccount.address)

    receiver = caver.wallet.add(caver.wallet.keyring.generate())

    ownerMap[testAccount.address] = []
    ownerMap[receiver.address] = []

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
    // caver is for testing caver.kct.kip37
    caver = new Caver(testRPCURL)

    const senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey

    sender = caver.wallet.keyring.createFromPrivateKey(senderPrvKey)
    caver.wallet.add(sender)
    ownerMap[sender.address] = []

    prepareTestSetting().then(() => done())
})

describe('KIP37 token contract class test', () => {
    context('caver.kct.kip37.deploy deploys KIP-37 token contract', () => {
        it('CAVERJS-UNIT-KCT-160: should deploy multi token contract and return KIP37 instance', async () => {
            const deployed = await caver.kct.kip37.deploy(tokenInfo, sender.address)

            expect(deployed.options.address).not.to.be.undefined

            const account = await caver.klay.getAccount(deployed.options.address)

            expect(account.accType).to.equal(2)
            expect(account.account.key.keyType).to.equal(3)

            multiTokenAddress = deployed.options.address
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-161: should throw error when token information is insufficient or invalid', async () => {
            const expectedError = 'Invalid uri of token'
            const insufficientToken = {}
            const invalidToken = { uri: 1 }
            expect(() => caver.kct.kip37.deploy(insufficientToken, sender.address)).to.throws(expectedError)
            expect(() => caver.kct.kip37.deploy(invalidToken, sender.address)).to.throws(expectedError)
        }).timeout(200000)
    })

    context('kip37.clone', () => {
        it('CAVERJS-UNIT-KCT-162: should clone KIP37 instance with new token contract address', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const newTokenContract = caver.wallet.keyring.generate().address
            const cloned = token.clone(newTokenContract)

            expect(cloned.options.address.toLowerCase()).to.equal(newTokenContract.toLowerCase())
            expect(cloned.options.address.toLowerCase()).not.to.equal(token.options.address.toLowerCase())
        }).timeout(200000)
    })

    context('kip37.supportsInterface', () => {
        it('CAVERJS-UNIT-KCT-163: should return true if interfaceId is supported', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            expect(await token.supportsInterface('0x6433ca1f')).to.be.true // IKIP37
            expect(await token.supportsInterface('0x0e89341c')).to.be.true // IKIP37MetatdataURI
            expect(await token.supportsInterface('0xdfd9d9ec')).to.be.true // IKIP37Mintable
            expect(await token.supportsInterface('0x9e094e9e')).to.be.true // IKIP37Burnable
            expect(await token.supportsInterface('0x0e8ffdb7')).to.be.true // IKIP37Pausable

            expect(await token.supportsInterface('0x70a08231')).to.be.false
            expect(await token.supportsInterface('0x6352211e')).to.be.false
            expect(await token.supportsInterface('0x095ea7b3')).to.be.false
        }).timeout(200000)
    })

    context('kip37.create', () => {
        it('CAVERJS-UNIT-KCT-164: should create new token', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const created = await token.create(tokenId, 10000000000, tokenURI, { from: sender.address })

            expect(created.from).to.be.equals(sender.address.toLowerCase())
            expect(created.status).to.be.true
            expect(created.events).not.to.be.undefined
            expect(created.events.TransferSingle).not.to.be.undefined
            expect(created.events.TransferSingle.address).to.equal(multiTokenAddress)
            expect(created.events.URI).not.to.be.undefined
            expect(created.events.URI.address).to.equal(multiTokenAddress)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-165: should create new token with various type of tokenId and initialSupply', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            let created = await token.create('0x1', '10000000000', tokenURI, { from: sender.address })

            expect(created.from).to.be.equals(sender.address.toLowerCase())
            expect(created.status).to.be.true
            expect(created.events).not.to.be.undefined
            expect(created.events.TransferSingle).not.to.be.undefined
            expect(created.events.TransferSingle.address).to.equal(multiTokenAddress)
            expect(created.events.URI).not.to.be.undefined
            expect(created.events.URI.address).to.equal(multiTokenAddress)

            tokenIds.push(1)

            created = await token.create(new BigNumber(2), new BigNumber('10000000000'), tokenURI, { from: sender.address })

            expect(created.from).to.be.equals(sender.address.toLowerCase())
            expect(created.status).to.be.true
            expect(created.events).not.to.be.undefined
            expect(created.events.TransferSingle).not.to.be.undefined
            expect(created.events.TransferSingle.address).to.equal(multiTokenAddress)
            expect(created.events.URI).not.to.be.undefined
            expect(created.events.URI.address).to.equal(multiTokenAddress)

            tokenIds.push(2)
        }).timeout(200000)
    })

    context('kip37.uri', () => {
        it('CAVERJS-UNIT-KCT-166: should return the uri of the specific token', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const uri = await token.uri(tokenId)

            expect(uri).to.equal(tokenURI)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-167: should return the uri of the specific token with various tokenId types', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            expect(await token.uri(caver.utils.toHex(tokenId))).to.equal(tokenURI)
            expect(await token.uri(new BigNumber(tokenId))).to.equal(tokenURI)
        }).timeout(200000)
    })

    context('kip37.totalSupply', () => {
        it('CAVERJS-UNIT-KCT-168: should return the total supply of the specific token', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const totalSupply = await token.totalSupply(tokenId)

            expect(totalSupply.eq(new BigNumber(10000000000))).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-169: should return the total supply of the specific token with various tokenId types', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            let totalSupply = await token.totalSupply(caver.utils.toHex(tokenId))
            expect(totalSupply.eq(new BigNumber(10000000000))).to.be.true

            totalSupply = await token.totalSupply(new BigNumber(tokenId))
            expect(totalSupply.eq(new BigNumber(10000000000))).to.be.true
        }).timeout(200000)
    })

    context('kip37.mint', () => {
        it('CAVERJS-UNIT-KCT-170: should mint the specific token with single to and value', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const minted = await token.mint(testAccount.address, tokenId, 1, { from: sender.address })

            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(minted.events.TransferSingle).not.to.be.undefined
            expect(minted.events.TransferSingle.address).to.equal(multiTokenAddress)
            expect(minted.events.TransferSingle.returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferSingle.returnValues.from.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(minted.events.TransferSingle.returnValues.to.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(minted.events.TransferSingle.returnValues.id).to.equal(tokenId.toString())
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-171: should mint the specific token with multiple to and value', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const acct1 = caver.wallet.keyring.generate()
            const acct2 = caver.wallet.keyring.generate()
            let minted = await token.mint(
                [acct1.address, acct2.address, sender.address],
                caver.utils.toHex(tokenId),
                [new BigNumber(1), 2, 10000000],
                {
                    from: sender.address,
                }
            )

            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(_.isArray(minted.events.TransferSingle)).to.be.true
            expect(minted.events.TransferSingle.length).to.equal(3)
            expect(minted.events.TransferSingle[0].address).to.equal(multiTokenAddress)
            expect(minted.events.TransferSingle[0].returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferSingle[0].returnValues.from.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(minted.events.TransferSingle[0].returnValues.to.toLowerCase()).to.equal(acct1.address.toLowerCase())
            expect(minted.events.TransferSingle[0].returnValues.id).to.equal(tokenId.toString())
            expect(minted.events.TransferSingle[1].address).to.equal(multiTokenAddress)
            expect(minted.events.TransferSingle[1].returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferSingle[1].returnValues.from.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(minted.events.TransferSingle[1].returnValues.to.toLowerCase()).to.equal(acct2.address.toLowerCase())
            expect(minted.events.TransferSingle[1].returnValues.id).to.equal(tokenId.toString())
            expect(minted.events.TransferSingle[2].address).to.equal(multiTokenAddress)
            expect(minted.events.TransferSingle[2].returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferSingle[2].returnValues.from.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(minted.events.TransferSingle[2].returnValues.to.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferSingle[2].returnValues.id).to.equal(tokenId.toString())

            testAddresses.push(acct1.address)
            testAddresses.push(acct2.address)

            minted = await token.mint(
                [acct1.address, acct2.address, sender.address],
                caver.utils.toHex(tokenIds[1]),
                [new BigNumber(10), 20, caver.utils.toHex(30)],
                {
                    from: sender.address,
                }
            )

            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(_.isArray(minted.events.TransferSingle)).to.be.true
            expect(minted.events.TransferSingle.length).to.equal(3)
            expect(minted.events.TransferSingle[0].address).to.equal(multiTokenAddress)
            expect(minted.events.TransferSingle[0].returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferSingle[0].returnValues.from.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(minted.events.TransferSingle[0].returnValues.to.toLowerCase()).to.equal(acct1.address.toLowerCase())
            expect(minted.events.TransferSingle[0].returnValues.id).to.equal(tokenIds[1].toString())
            expect(minted.events.TransferSingle[1].address).to.equal(multiTokenAddress)
            expect(minted.events.TransferSingle[1].returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferSingle[1].returnValues.from.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(minted.events.TransferSingle[1].returnValues.to.toLowerCase()).to.equal(acct2.address.toLowerCase())
            expect(minted.events.TransferSingle[1].returnValues.id).to.equal(tokenIds[1].toString())
            expect(minted.events.TransferSingle[2].address).to.equal(multiTokenAddress)
            expect(minted.events.TransferSingle[2].returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferSingle[2].returnValues.from.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(minted.events.TransferSingle[2].returnValues.to.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferSingle[2].returnValues.id).to.equal(tokenIds[1].toString())
        }).timeout(200000)
    })

    context('kip37.balanceOf', () => {
        it('CAVERJS-UNIT-KCT-172: should return the balance of account with specific token', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const balance = await token.balanceOf(testAccount.address, tokenId)

            expect(balance.eq(new BigNumber(1))).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-173: should return the balance of account with specific token with various token type', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            let balance = await token.balanceOf(testAccount.address, caver.utils.toHex(tokenId))
            expect(balance.eq(new BigNumber(1))).to.be.true

            balance = await token.balanceOf(testAccount.address, new BigNumber(tokenId))
            expect(balance.eq(new BigNumber(1))).to.be.true
        }).timeout(200000)
    })

    context('kip37.balanceOfBatch', () => {
        it('CAVERJS-UNIT-KCT-174: should return the balance of accounts with specific token', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const balances = await token.balanceOfBatch(testAddresses, [tokenIds[0], tokenIds[1], tokenIds[1]])

            expect(balances.length).to.equal(3)
            expect(balances[0].eq(new BigNumber(1))).to.be.true
            expect(balances[1].eq(new BigNumber(10))).to.be.true
            expect(balances[2].eq(new BigNumber(20))).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-175: should return the balance of accounts with specific token with various tokenId types', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const balances = await token.balanceOfBatch(testAddresses, [
                caver.utils.toHex(tokenIds[0]),
                new BigNumber(tokenIds[1]),
                tokenIds[1].toString(),
            ])

            expect(balances.length).to.equal(3)
            expect(balances[0].eq(new BigNumber(1))).to.be.true
            expect(balances[1].eq(new BigNumber(10))).to.be.true
            expect(balances[2].eq(new BigNumber(20))).to.be.true
        }).timeout(200000)
    })

    context('kip37.setApprovalForAll', () => {
        it("CAVERJS-UNIT-KCT-176: should set approval of token operations for all of the caller's token", async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            let approved = await token.setApprovalForAll(testAccount.address, true, { from: sender.address })

            expect(approved.from).to.be.equals(sender.address.toLowerCase())
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.ApprovalForAll).not.to.be.undefined
            expect(approved.events.ApprovalForAll.address).to.equal(multiTokenAddress)
            expect(approved.events.ApprovalForAll.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(approved.events.ApprovalForAll.returnValues.operator.toLowerCase()).to.equal(testAccount.address)
            expect(approved.events.ApprovalForAll.returnValues.approved).to.be.true

            approved = await token.setApprovalForAll(sender.address, true, { from: testAccount.address })

            expect(approved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.ApprovalForAll).not.to.be.undefined
            expect(approved.events.ApprovalForAll.address).to.equal(multiTokenAddress)
            expect(approved.events.ApprovalForAll.returnValues.account.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(approved.events.ApprovalForAll.returnValues.operator.toLowerCase()).to.equal(sender.address)
            expect(approved.events.ApprovalForAll.returnValues.approved).to.be.true
        }).timeout(200000)
    })

    context('kip37.isApprovedForAll', () => {
        it("CAVERJS-UNIT-KCT-177: should return an approval of token operations for all of the caller's token", async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const approved = await token.isApprovedForAll(sender.address, testAccount.address)

            expect(approved).to.be.true
        }).timeout(200000)
    })

    context('kip37.paused', () => {
        it("CAVERJS-UNIT-KCT-178: should return whether or not the token contract's transaction is paused (no parameter)", async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const paused = await token.paused()

            expect(paused).to.be.false
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-179: should return whether or not the specific token is paused (with tokenId parameter)', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const paused = await token.paused(tokenId)

            expect(paused).to.be.false
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-180: should return whether or not the specific token is paused (with various tokenId types parameter)', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            let paused = await token.paused(caver.utils.toHex(tokenId))
            expect(paused).to.be.false

            paused = await token.paused(new BigNumber(tokenId))
            expect(paused).to.be.false
        }).timeout(200000)
    })

    context('kip37.isPauser', () => {
        it('CAVERJS-UNIT-KCT-181: should return whether the account is pauser or not', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            let isPauser = await token.isPauser(sender.address)
            expect(isPauser).to.be.true

            isPauser = await token.isPauser(testAccount.address)
            expect(isPauser).to.be.false
        }).timeout(200000)
    })

    context('kip37.isMinter', () => {
        it('CAVERJS-UNIT-KCT-182: should return whether the account is minter or not', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            let isMinter = await token.isMinter(sender.address)
            expect(isMinter).to.be.true

            isMinter = await token.isMinter(testAccount.address)
            expect(isMinter).to.be.false
        }).timeout(200000)
    })

    context('kip37.safeTransferFrom', () => {
        it('CAVERJS-UNIT-KCT-183: should transfer the token from owner to receiver', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const transfered = await token.safeTransferFrom(sender.address, receiver.address, tokenId, 1, 'data to send', {
                from: sender.address,
            })

            expect(transfered.from).to.be.equals(sender.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.TransferSingle).not.to.be.undefined
            expect(transfered.events.TransferSingle.address).to.equal(multiTokenAddress)
            expect(transfered.events.TransferSingle.returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(transfered.events.TransferSingle.returnValues.from.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(transfered.events.TransferSingle.returnValues.to.toLowerCase()).to.equal(receiver.address.toLowerCase())
            expect(transfered.events.TransferSingle.returnValues.id).to.equal(tokenId.toString())
            expect(transfered.events.TransferSingle.returnValues.value).to.equal('1')
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-184: should transfer the token from owner to receiver by approved operator', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const transfered = await token.safeTransferFrom(
                sender.address,
                receiver.address,
                caver.utils.toHex(tokenId),
                caver.utils.toHex(1),
                'data to send',
                {
                    from: testAccount.address,
                }
            )

            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.TransferSingle).not.to.be.undefined
            expect(transfered.events.TransferSingle.address).to.equal(multiTokenAddress)
            expect(transfered.events.TransferSingle.returnValues.operator.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(transfered.events.TransferSingle.returnValues.from.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(transfered.events.TransferSingle.returnValues.to.toLowerCase()).to.equal(receiver.address.toLowerCase())
            expect(transfered.events.TransferSingle.returnValues.id).to.equal(tokenId.toString())
            expect(transfered.events.TransferSingle.returnValues.value).to.equal('1')
        }).timeout(200000)
    })

    context('kip37.safeBatchTransferFrom', () => {
        it('CAVERJS-UNIT-KCT-185: should transfer the tokens from owner to receiver', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const ids = [tokenIds[0], tokenIds[1]]
            const values = [1, 2]
            const transfered = await token.safeBatchTransferFrom(sender.address, receiver.address, ids, values, 'data to send', {
                from: sender.address,
            })

            expect(transfered.from).to.be.equals(sender.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.TransferBatch).not.to.be.undefined
            expect(transfered.events.TransferBatch.address).to.equal(multiTokenAddress)
            expect(transfered.events.TransferBatch.returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(transfered.events.TransferBatch.returnValues.from.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(transfered.events.TransferBatch.returnValues.to.toLowerCase()).to.equal(receiver.address.toLowerCase())
            expect(_.isArray(transfered.events.TransferBatch.returnValues.ids)).to.be.true
            expect(_.isArray(transfered.events.TransferBatch.returnValues.values)).to.be.true
            expect(transfered.events.TransferBatch.returnValues.ids.length).to.equal(ids.length)
            expect(transfered.events.TransferBatch.returnValues.values.length).to.equal(ids.length)
            for (let i = 0; i < ids.length; i++) {
                expect(transfered.events.TransferBatch.returnValues.ids[i]).to.equal(ids[i].toString())
                expect(transfered.events.TransferBatch.returnValues.values[i]).to.equal(values[i].toString())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-186: should transfer the tokens from owner to receiver by approved operator', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const ids = [tokenIds[0], tokenIds[1]]
            const values = [1, 2]
            const transfered = await token.safeBatchTransferFrom(sender.address, receiver.address, ids, values, 'data to send', {
                from: testAccount.address,
            })

            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.TransferBatch).not.to.be.undefined
            expect(transfered.events.TransferBatch.address).to.equal(multiTokenAddress)
            expect(transfered.events.TransferBatch.returnValues.operator.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(transfered.events.TransferBatch.returnValues.from.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(transfered.events.TransferBatch.returnValues.to.toLowerCase()).to.equal(receiver.address.toLowerCase())
            expect(_.isArray(transfered.events.TransferBatch.returnValues.ids)).to.be.true
            expect(_.isArray(transfered.events.TransferBatch.returnValues.values)).to.be.true
            expect(transfered.events.TransferBatch.returnValues.ids.length).to.equal(ids.length)
            expect(transfered.events.TransferBatch.returnValues.values.length).to.equal(ids.length)
            for (let i = 0; i < ids.length; i++) {
                expect(transfered.events.TransferBatch.returnValues.ids[i]).to.equal(ids[i].toString())
                expect(transfered.events.TransferBatch.returnValues.values[i]).to.equal(values[i].toString())
            }
        }).timeout(200000)
    })

    context('kip37.mintBatch', () => {
        it('CAVERJS-UNIT-KCT-187: should mint the specific tokens', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const ids = tokenIds
            const values = new Array(tokenIds.length).fill(10)
            const minted = await token.mintBatch(testAccount.address, ids, values, {
                from: sender.address,
            })

            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(minted.events.TransferBatch).not.to.be.undefined
            expect(minted.events.TransferBatch.address).to.equal(multiTokenAddress)
            expect(minted.events.TransferBatch.returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferBatch.returnValues.from.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(minted.events.TransferBatch.returnValues.to.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(_.isArray(minted.events.TransferBatch.returnValues.ids)).to.be.true
            expect(_.isArray(minted.events.TransferBatch.returnValues.values)).to.be.true
            expect(minted.events.TransferBatch.returnValues.ids.length).to.equal(ids.length)
            expect(minted.events.TransferBatch.returnValues.values.length).to.equal(ids.length)
            for (let i = 0; i < ids.length; i++) {
                expect(minted.events.TransferBatch.returnValues.ids[i]).to.equal(ids[i].toString())
                expect(minted.events.TransferBatch.returnValues.values[i]).to.equal(values[i].toString())
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-188: should mint the specific tokens with various tokenId types', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            let ids = tokenIds.map(id => caver.utils.toHex(id))
            let values = new Array(tokenIds.length).fill(caver.utils.toHex(10))
            let minted = await token.mintBatch(testAccount.address, ids, values, {
                from: sender.address,
            })

            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(minted.events.TransferBatch).not.to.be.undefined
            expect(minted.events.TransferBatch.address).to.equal(multiTokenAddress)
            expect(minted.events.TransferBatch.returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferBatch.returnValues.from.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(minted.events.TransferBatch.returnValues.to.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(_.isArray(minted.events.TransferBatch.returnValues.ids)).to.be.true
            expect(_.isArray(minted.events.TransferBatch.returnValues.values)).to.be.true
            expect(minted.events.TransferBatch.returnValues.ids.length).to.equal(ids.length)
            expect(minted.events.TransferBatch.returnValues.values.length).to.equal(ids.length)
            for (let i = 0; i < ids.length; i++) {
                expect(minted.events.TransferBatch.returnValues.ids[i]).to.equal(caver.utils.hexToNumberString(ids[i]))
                expect(minted.events.TransferBatch.returnValues.values[i]).to.equal(caver.utils.hexToNumberString(values[i]))
            }

            ids = tokenIds.map(id => new BigNumber(id))
            values = new Array(tokenIds.length).fill(new BigNumber(10))
            minted = await token.mintBatch(testAccount.address, ids, values, {
                from: sender.address,
            })

            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(minted.events.TransferBatch).not.to.be.undefined
            expect(minted.events.TransferBatch.address).to.equal(multiTokenAddress)
            expect(minted.events.TransferBatch.returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferBatch.returnValues.from.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(minted.events.TransferBatch.returnValues.to.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(_.isArray(minted.events.TransferBatch.returnValues.ids)).to.be.true
            expect(_.isArray(minted.events.TransferBatch.returnValues.values)).to.be.true
            expect(minted.events.TransferBatch.returnValues.ids.length).to.equal(ids.length)
            expect(minted.events.TransferBatch.returnValues.values.length).to.equal(ids.length)
            for (let i = 0; i < ids.length; i++) {
                expect(minted.events.TransferBatch.returnValues.ids[i]).to.equal(ids[i].toString())
                expect(minted.events.TransferBatch.returnValues.values[i]).to.equal(values[i].toString())
            }
        }).timeout(200000)
    })

    context('kip37.addMinter', () => {
        it('CAVERJS-UNIT-KCT-189: should add minter', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const added = await token.addMinter(testAccount.address, { from: sender.address })

            expect(added.from).to.be.equals(sender.address.toLowerCase())
            expect(added.status).to.be.true
            expect(added.events).not.to.be.undefined
            expect(added.events.MinterAdded).not.to.be.undefined
            expect(added.events.MinterAdded.address).to.equal(multiTokenAddress)
            expect(added.events.MinterAdded.returnValues.account.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(await token.isMinter(testAccount.address)).to.be.true
        }).timeout(200000)
    })

    context('kip37.renounceMinter', () => {
        it('CAVERJS-UNIT-KCT-190: should renounce minter', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const removed = await token.renounceMinter({ from: testAccount.address })

            expect(removed.from).to.be.equals(testAccount.address.toLowerCase())
            expect(removed.status).to.be.true
            expect(removed.events).not.to.be.undefined
            expect(removed.events.MinterRemoved).not.to.be.undefined
            expect(removed.events.MinterRemoved.address).to.equal(multiTokenAddress)
            expect(removed.events.MinterRemoved.returnValues.account.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(await token.isMinter(testAccount.address)).to.be.false
        }).timeout(200000)
    })

    context('kip37.burn', () => {
        it('CAVERJS-UNIT-KCT-191: should burn the specific token', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const originalBalance = await token.balanceOf(sender.address, tokenIds[0])
            const burned = await token.burn(sender.address, tokenIds[0], 1, { from: sender.address })
            const afterBalance = await token.balanceOf(sender.address, tokenIds[0])

            expect(burned.from).to.be.equals(sender.address.toLowerCase())
            expect(burned.status).to.be.true
            expect(burned.events).not.to.be.undefined
            expect(burned.events.TransferSingle).not.to.be.undefined
            expect(burned.events.TransferSingle.address).to.equal(multiTokenAddress)
            expect(burned.events.TransferSingle.returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(burned.events.TransferSingle.returnValues.from.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(burned.events.TransferSingle.returnValues.to.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(burned.events.TransferSingle.returnValues.id).to.equal(tokenIds[0].toString())
            expect(burned.events.TransferSingle.returnValues.value).to.equal('1')
            expect(originalBalance.minus(afterBalance).eq(new BigNumber(1))).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-192: should burn the specific token by approved operator', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const originalBalance = await token.balanceOf(sender.address, tokenIds[0])
            const burned = await token.burn(sender.address, caver.utils.toHex(tokenIds[0]), '1', { from: testAccount.address })
            const afterBalance = await token.balanceOf(sender.address, tokenIds[0])

            expect(burned.from).to.be.equals(testAccount.address.toLowerCase())
            expect(burned.status).to.be.true
            expect(burned.events).not.to.be.undefined
            expect(burned.events.TransferSingle).not.to.be.undefined
            expect(burned.events.TransferSingle.address).to.equal(multiTokenAddress)
            expect(burned.events.TransferSingle.returnValues.operator.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(burned.events.TransferSingle.returnValues.from.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(burned.events.TransferSingle.returnValues.to.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(burned.events.TransferSingle.returnValues.id).to.equal(tokenIds[0].toString())
            expect(burned.events.TransferSingle.returnValues.value).to.equal('1')
            expect(originalBalance.minus(afterBalance).eq(new BigNumber(1))).to.be.true
        }).timeout(200000)
    })

    context('kip37.burnBatch', () => {
        it('CAVERJS-UNIT-KCT-193: should burn the specific tokens', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const ids = tokenIds
            const values = new Array(ids.length).fill(1)
            const accounts = new Array(ids.length).fill(testAccount.address)

            const originalBalances = await token.balanceOfBatch(accounts, ids)
            const burned = await token.burnBatch(testAccount.address, ids, values, { from: testAccount.address })
            const afterBalances = await token.balanceOfBatch(accounts, ids)

            expect(burned.from).to.be.equals(testAccount.address.toLowerCase())
            expect(burned.status).to.be.true
            expect(burned.events).not.to.be.undefined
            expect(burned.events.TransferBatch).not.to.be.undefined
            expect(burned.events.TransferBatch.address).to.equal(multiTokenAddress)
            expect(burned.events.TransferBatch.returnValues.operator.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(burned.events.TransferBatch.returnValues.from.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(burned.events.TransferBatch.returnValues.to.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(burned.events.TransferBatch.returnValues.ids.length).to.equal(ids.length)
            expect(burned.events.TransferBatch.returnValues.values.length).to.equal(ids.length)
            for (let i = 0; i < ids.length; i++) {
                expect(burned.events.TransferBatch.returnValues.ids[i]).to.equal(ids[i].toString())
                expect(burned.events.TransferBatch.returnValues.values[i]).to.equal(values[i].toString())
            }
            expect(originalBalances.length).to.equal(afterBalances.length)
            for (let i = 0; i < originalBalances.length; i++) {
                expect(originalBalances[i].minus(afterBalances[i]).eq(new BigNumber(1))).to.be.true
            }
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-194: should burn the specific tokens by approved operator', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const ids = tokenIds.map(id => caver.utils.toHex(id))
            const values = new Array(ids.length).fill(caver.utils.toHex(1))
            const accounts = new Array(ids.length).fill(testAccount.address)

            const originalBalances = await token.balanceOfBatch(accounts, ids)
            const burned = await token.burnBatch(testAccount.address, ids, values, { from: sender.address })
            const afterBalances = await token.balanceOfBatch(accounts, ids)

            expect(burned.from).to.be.equals(sender.address.toLowerCase())
            expect(burned.status).to.be.true
            expect(burned.events).not.to.be.undefined
            expect(burned.events.TransferBatch).not.to.be.undefined
            expect(burned.events.TransferBatch.address).to.equal(multiTokenAddress)
            expect(burned.events.TransferBatch.returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(burned.events.TransferBatch.returnValues.from.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(burned.events.TransferBatch.returnValues.to.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(burned.events.TransferBatch.returnValues.ids.length).to.equal(ids.length)
            expect(burned.events.TransferBatch.returnValues.values.length).to.equal(ids.length)
            for (let i = 0; i < ids.length; i++) {
                expect(burned.events.TransferBatch.returnValues.ids[i]).to.equal(caver.utils.hexToNumberString(ids[i]))
                expect(burned.events.TransferBatch.returnValues.values[i]).to.equal(caver.utils.hexToNumberString(values[i]))
            }
            expect(originalBalances.length).to.equal(afterBalances.length)
            for (let i = 0; i < originalBalances.length; i++) {
                expect(originalBalances[i].minus(afterBalances[i]).eq(new BigNumber(1))).to.be.true
            }
        }).timeout(200000)
    })

    context('kip37.pause', () => {
        it('CAVERJS-UNIT-KCT-195: should pause the KIP-37 token contract (without tokenId parameter)', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const paused = await token.pause({ from: sender.address })

            expect(paused.from).to.be.equals(sender.address.toLowerCase())
            expect(paused.status).to.be.true
            expect(paused.events).not.to.be.undefined
            expect(paused.events.Paused).not.to.be.undefined
            expect(paused.events.Paused.address).to.equal(multiTokenAddress)
            expect(paused.events.Paused.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(await token.paused()).to.be.true

            await token.unpause({ from: sender.address })
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-196: should pause the specific token', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const paused = await token.pause(tokenIds[0], { from: sender.address })

            expect(paused.from).to.be.equals(sender.address.toLowerCase())
            expect(paused.status).to.be.true
            expect(paused.events).not.to.be.undefined
            expect(paused.events.Paused).not.to.be.undefined
            expect(paused.events.Paused.address).to.equal(multiTokenAddress)
            expect(paused.events.Paused.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(paused.events.Paused.returnValues.tokenId).to.equal(tokenIds[0].toString())
            expect(await token.paused(tokenIds[0])).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-197: should pause the specific token with various tokenId types', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            let paused = await token.pause(caver.utils.toHex(tokenIds[1]), { from: sender.address })

            expect(paused.from).to.be.equals(sender.address.toLowerCase())
            expect(paused.status).to.be.true
            expect(paused.events).not.to.be.undefined
            expect(paused.events.Paused).not.to.be.undefined
            expect(paused.events.Paused.address).to.equal(multiTokenAddress)
            expect(paused.events.Paused.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(paused.events.Paused.returnValues.tokenId).to.equal(tokenIds[1].toString())
            expect(await token.paused(tokenIds[1])).to.be.true

            paused = await token.pause(new BigNumber(tokenIds[2]), { from: sender.address })

            expect(paused.from).to.be.equals(sender.address.toLowerCase())
            expect(paused.status).to.be.true
            expect(paused.events).not.to.be.undefined
            expect(paused.events.Paused).not.to.be.undefined
            expect(paused.events.Paused.address).to.equal(multiTokenAddress)
            expect(paused.events.Paused.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(paused.events.Paused.returnValues.tokenId).to.equal(tokenIds[2].toString())
            expect(await token.paused(tokenIds[2])).to.be.true
        }).timeout(200000)
    })

    context('kip37.unpause', () => {
        it('CAVERJS-UNIT-KCT-198: should unpause the KIP-37 token contract (without tokenId parameter)', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            await token.pause({ from: sender.address })
            expect(await token.paused()).to.be.true

            const unpaused = await token.unpause({ from: sender.address })

            expect(unpaused.from).to.be.equals(sender.address.toLowerCase())
            expect(unpaused.status).to.be.true
            expect(unpaused.events).not.to.be.undefined
            expect(unpaused.events.Unpaused).not.to.be.undefined
            expect(unpaused.events.Unpaused.address).to.equal(multiTokenAddress)
            expect(unpaused.events.Unpaused.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-199: should unpause the specific token', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const paused = await token.unpause(tokenIds[0], { from: sender.address })

            expect(paused.from).to.be.equals(sender.address.toLowerCase())
            expect(paused.status).to.be.true
            expect(paused.events).not.to.be.undefined
            expect(paused.events.Unpaused).not.to.be.undefined
            expect(paused.events.Unpaused.address).to.equal(multiTokenAddress)
            expect(paused.events.Unpaused.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(paused.events.Unpaused.returnValues.tokenId).to.equal(tokenIds[0].toString())
            expect(await token.paused(tokenIds[0])).to.be.false
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-200: should unpause the specific token with various tokenId types', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            let unpaused = await token.unpause(caver.utils.toHex(tokenIds[1]), { from: sender.address })

            expect(unpaused.from).to.be.equals(sender.address.toLowerCase())
            expect(unpaused.status).to.be.true
            expect(unpaused.events).not.to.be.undefined
            expect(unpaused.events.Unpaused).not.to.be.undefined
            expect(unpaused.events.Unpaused.address).to.equal(multiTokenAddress)
            expect(unpaused.events.Unpaused.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(unpaused.events.Unpaused.returnValues.tokenId).to.equal(tokenIds[1].toString())
            expect(await token.paused(tokenIds[1])).to.be.false

            unpaused = await token.unpause(new BigNumber(tokenIds[2]), { from: sender.address })

            expect(unpaused.from).to.be.equals(sender.address.toLowerCase())
            expect(unpaused.status).to.be.true
            expect(unpaused.events).not.to.be.undefined
            expect(unpaused.events.Unpaused).not.to.be.undefined
            expect(unpaused.events.Unpaused.address).to.equal(multiTokenAddress)
            expect(unpaused.events.Unpaused.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(unpaused.events.Unpaused.returnValues.tokenId).to.equal(tokenIds[2].toString())
            expect(await token.paused(tokenIds[2])).to.be.false
        }).timeout(200000)
    })

    context('kip37.addPauser', () => {
        it('CAVERJS-UNIT-KCT-201: should add pauser', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const added = await token.addPauser(testAccount.address, { from: sender.address })

            expect(added.from).to.be.equals(sender.address.toLowerCase())
            expect(added.status).to.be.true
            expect(added.events).not.to.be.undefined
            expect(added.events.PauserAdded).not.to.be.undefined
            expect(added.events.PauserAdded.address).to.equal(multiTokenAddress)
            expect(added.events.PauserAdded.returnValues.account.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(await token.isPauser(testAccount.address)).to.be.true
        }).timeout(200000)
    })

    context('kip37.renouncePauser', () => {
        it('CAVERJS-UNIT-KCT-202: should renounce pauser', async () => {
            const token = new caver.kct.kip37(multiTokenAddress)

            const removed = await token.renouncePauser({ from: testAccount.address })

            expect(removed.from).to.be.equals(testAccount.address.toLowerCase())
            expect(removed.status).to.be.true
            expect(removed.events).not.to.be.undefined
            expect(removed.events.PauserRemoved).not.to.be.undefined
            expect(removed.events.PauserRemoved.address).to.equal(multiTokenAddress)
            expect(removed.events.PauserRemoved.returnValues.account.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(await token.isPauser(testAccount.address)).to.be.false
        }).timeout(200000)
    })
})
