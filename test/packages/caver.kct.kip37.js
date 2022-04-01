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
const { TX_TYPE_STRING } = require('../../packages/caver-transaction/src/transactionHelper/transactionHelper')

const Caver = require('../../index')

let caver
let sender
let feePayer
let testAccount
let receiver
const testAddresses = []

const tokenId = 0
const tokenIds = [tokenId]

const ownerMap = {}

let kip37Address

const tokenURI = 'https://game.example/item-id/{id}.json'
const tokenInfo = { uri: tokenURI }

const prepareTestSetting = async () => {
    testAccount = caver.wallet.add(caver.wallet.keyring.generate())
    testAddresses.push(testAccount.address)

    receiver = caver.wallet.add(caver.wallet.keyring.generate())

    ownerMap[testAccount.address] = []
    ownerMap[receiver.address] = []

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
    // caver is for testing caver.kct.kip37
    caver = new Caver(testRPCURL)

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

            kip37Address = deployed.options.address
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
            const token = new caver.kct.kip37(kip37Address)

            const newTokenContract = caver.wallet.keyring.generate().address
            const cloned = token.clone(newTokenContract)

            expect(cloned.options.address.toLowerCase()).to.equal(newTokenContract.toLowerCase())
            expect(cloned.options.address.toLowerCase()).not.to.equal(token.options.address.toLowerCase())
        }).timeout(200000)
    })

    context('kip37.supportsInterface', () => {
        it('CAVERJS-UNIT-KCT-163: should return true if interfaceId is supported', async () => {
            const token = new caver.kct.kip37(kip37Address)

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
            const token = new caver.kct.kip37(kip37Address)

            const created = await token.create(tokenId, 10000000000, tokenURI, { from: sender.address })

            expect(created.from).to.be.equals(sender.address.toLowerCase())
            expect(created.status).to.be.true
            expect(created.events).not.to.be.undefined
            expect(created.events.TransferSingle).not.to.be.undefined
            expect(created.events.TransferSingle.address).to.equal(kip37Address)
            expect(created.events.URI).not.to.be.undefined
            expect(created.events.URI.address).to.equal(kip37Address)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-165: should create new token with various type of tokenId and initialSupply', async () => {
            const token = new caver.kct.kip37(kip37Address)

            let created = await token.create('0x1', '10000000000', tokenURI, { from: sender.address })

            expect(created.from).to.be.equals(sender.address.toLowerCase())
            expect(created.status).to.be.true
            expect(created.events).not.to.be.undefined
            expect(created.events.TransferSingle).not.to.be.undefined
            expect(created.events.TransferSingle.address).to.equal(kip37Address)
            expect(created.events.URI).not.to.be.undefined
            expect(created.events.URI.address).to.equal(kip37Address)

            tokenIds.push(1)

            created = await token.create(new BigNumber(2), new BigNumber('10000000000'), tokenURI, { from: sender.address })

            expect(created.from).to.be.equals(sender.address.toLowerCase())
            expect(created.status).to.be.true
            expect(created.events).not.to.be.undefined
            expect(created.events.TransferSingle).not.to.be.undefined
            expect(created.events.TransferSingle.address).to.equal(kip37Address)
            expect(created.events.URI).not.to.be.undefined
            expect(created.events.URI.address).to.equal(kip37Address)

            tokenIds.push(2)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-215: should create new token without uri', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const created = await token.create(3, 10000000000, { from: sender.address })

            expect(created.from).to.be.equals(sender.address.toLowerCase())
            expect(created.status).to.be.true
            expect(created.events).not.to.be.undefined
            expect(created.events.TransferSingle).not.to.be.undefined
            expect(created.events.TransferSingle.address).to.equal(kip37Address)
            expect(created.events.URI).to.be.undefined
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-216: should create new token with various type of tokenId and initialSupply without uri', async () => {
            const token = new caver.kct.kip37(kip37Address)

            let created = await token.create('0x4', '10000000000', { from: sender.address })

            expect(created.from).to.be.equals(sender.address.toLowerCase())
            expect(created.status).to.be.true
            expect(created.events).not.to.be.undefined
            expect(created.events.TransferSingle).not.to.be.undefined
            expect(created.events.TransferSingle.address).to.equal(kip37Address)
            expect(created.events.URI).to.be.undefined

            created = await token.create(new BigNumber(5), new BigNumber('10000000000'), { from: sender.address })

            expect(created.from).to.be.equals(sender.address.toLowerCase())
            expect(created.status).to.be.true
            expect(created.events).not.to.be.undefined
            expect(created.events.TransferSingle).not.to.be.undefined
            expect(created.events.TransferSingle.address).to.equal(kip37Address)
            expect(created.events.URI).to.be.undefined
        }).timeout(200000)
    })

    context('kip37.uri', () => {
        it('CAVERJS-UNIT-KCT-166: should return the uri of the specific token', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const uri = await token.uri(tokenId)

            expect(uri).to.equal('https://game.example/item-id/0000000000000000000000000000000000000000000000000000000000000000.json')
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-167: should return the uri of the specific token with various tokenId types', async () => {
            const token = new caver.kct.kip37(kip37Address)

            expect(await token.uri(caver.utils.toHex(tokenId))).to.equal(
                'https://game.example/item-id/0000000000000000000000000000000000000000000000000000000000000000.json'
            )
            expect(await token.uri(new BigNumber(tokenId))).to.equal(
                'https://game.example/item-id/0000000000000000000000000000000000000000000000000000000000000000.json'
            )
        }).timeout(200000)
    })

    context('kip37.totalSupply', () => {
        it('CAVERJS-UNIT-KCT-168: should return the total supply of the specific token', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const totalSupply = await token.totalSupply(tokenId)

            expect(totalSupply.eq(new BigNumber(10000000000))).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-169: should return the total supply of the specific token with various tokenId types', async () => {
            const token = new caver.kct.kip37(kip37Address)

            let totalSupply = await token.totalSupply(caver.utils.toHex(tokenId))
            expect(totalSupply.eq(new BigNumber(10000000000))).to.be.true

            totalSupply = await token.totalSupply(new BigNumber(tokenId))
            expect(totalSupply.eq(new BigNumber(10000000000))).to.be.true
        }).timeout(200000)
    })

    context('kip37.mint', () => {
        it('CAVERJS-UNIT-KCT-170: should mint the specific token with single to and value', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const minted = await token.mint(testAccount.address, tokenId, 1, { from: sender.address })

            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(minted.events.TransferSingle).not.to.be.undefined
            expect(minted.events.TransferSingle.address).to.equal(kip37Address)
            expect(minted.events.TransferSingle.returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferSingle.returnValues.from.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(minted.events.TransferSingle.returnValues.to.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(minted.events.TransferSingle.returnValues.id).to.equal(tokenId.toString())
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-171: should mint the specific token with multiple to and value', async () => {
            const token = new caver.kct.kip37(kip37Address)

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
            expect(minted.events.TransferSingle[0].address).to.equal(kip37Address)
            expect(minted.events.TransferSingle[0].returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferSingle[0].returnValues.from.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(minted.events.TransferSingle[0].returnValues.to.toLowerCase()).to.equal(acct1.address.toLowerCase())
            expect(minted.events.TransferSingle[0].returnValues.id).to.equal(tokenId.toString())
            expect(minted.events.TransferSingle[1].address).to.equal(kip37Address)
            expect(minted.events.TransferSingle[1].returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferSingle[1].returnValues.from.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(minted.events.TransferSingle[1].returnValues.to.toLowerCase()).to.equal(acct2.address.toLowerCase())
            expect(minted.events.TransferSingle[1].returnValues.id).to.equal(tokenId.toString())
            expect(minted.events.TransferSingle[2].address).to.equal(kip37Address)
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
            expect(minted.events.TransferSingle[0].address).to.equal(kip37Address)
            expect(minted.events.TransferSingle[0].returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferSingle[0].returnValues.from.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(minted.events.TransferSingle[0].returnValues.to.toLowerCase()).to.equal(acct1.address.toLowerCase())
            expect(minted.events.TransferSingle[0].returnValues.id).to.equal(tokenIds[1].toString())
            expect(minted.events.TransferSingle[1].address).to.equal(kip37Address)
            expect(minted.events.TransferSingle[1].returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferSingle[1].returnValues.from.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(minted.events.TransferSingle[1].returnValues.to.toLowerCase()).to.equal(acct2.address.toLowerCase())
            expect(minted.events.TransferSingle[1].returnValues.id).to.equal(tokenIds[1].toString())
            expect(minted.events.TransferSingle[2].address).to.equal(kip37Address)
            expect(minted.events.TransferSingle[2].returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferSingle[2].returnValues.from.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(minted.events.TransferSingle[2].returnValues.to.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(minted.events.TransferSingle[2].returnValues.id).to.equal(tokenIds[1].toString())
        }).timeout(200000)
    })

    context('kip37.balanceOf', () => {
        it('CAVERJS-UNIT-KCT-172: should return the balance of account with specific token', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const balance = await token.balanceOf(testAccount.address, tokenId)

            expect(balance.eq(new BigNumber(1))).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-173: should return the balance of account with specific token with various token type', async () => {
            const token = new caver.kct.kip37(kip37Address)

            let balance = await token.balanceOf(testAccount.address, caver.utils.toHex(tokenId))
            expect(balance.eq(new BigNumber(1))).to.be.true

            balance = await token.balanceOf(testAccount.address, new BigNumber(tokenId))
            expect(balance.eq(new BigNumber(1))).to.be.true
        }).timeout(200000)
    })

    context('kip37.balanceOfBatch', () => {
        it('CAVERJS-UNIT-KCT-174: should return the balance of accounts with specific token', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const balances = await token.balanceOfBatch(testAddresses, [tokenIds[0], tokenIds[1], tokenIds[1]])

            expect(balances.length).to.equal(3)
            expect(balances[0].eq(new BigNumber(1))).to.be.true
            expect(balances[1].eq(new BigNumber(10))).to.be.true
            expect(balances[2].eq(new BigNumber(20))).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-175: should return the balance of accounts with specific token with various tokenId types', async () => {
            const token = new caver.kct.kip37(kip37Address)

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
            const token = new caver.kct.kip37(kip37Address)

            let approved = await token.setApprovalForAll(testAccount.address, true, { from: sender.address })

            expect(approved.from).to.be.equals(sender.address.toLowerCase())
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.ApprovalForAll).not.to.be.undefined
            expect(approved.events.ApprovalForAll.address).to.equal(kip37Address)
            expect(approved.events.ApprovalForAll.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(approved.events.ApprovalForAll.returnValues.operator.toLowerCase()).to.equal(testAccount.address)
            expect(approved.events.ApprovalForAll.returnValues.approved).to.be.true

            approved = await token.setApprovalForAll(sender.address, true, { from: testAccount.address })

            expect(approved.from).to.be.equals(testAccount.address.toLowerCase())
            expect(approved.status).to.be.true
            expect(approved.events).not.to.be.undefined
            expect(approved.events.ApprovalForAll).not.to.be.undefined
            expect(approved.events.ApprovalForAll.address).to.equal(kip37Address)
            expect(approved.events.ApprovalForAll.returnValues.account.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(approved.events.ApprovalForAll.returnValues.operator.toLowerCase()).to.equal(sender.address)
            expect(approved.events.ApprovalForAll.returnValues.approved).to.be.true
        }).timeout(200000)
    })

    context('kip37.isApprovedForAll', () => {
        it("CAVERJS-UNIT-KCT-177: should return an approval of token operations for all of the caller's token", async () => {
            const token = new caver.kct.kip37(kip37Address)

            const approved = await token.isApprovedForAll(sender.address, testAccount.address)

            expect(approved).to.be.true
        }).timeout(200000)
    })

    context('kip37.paused', () => {
        it("CAVERJS-UNIT-KCT-178: should return whether or not the token contract's transaction is paused (no parameter)", async () => {
            const token = new caver.kct.kip37(kip37Address)

            const paused = await token.paused()

            expect(paused).to.be.false
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-179: should return whether or not the specific token is paused (with tokenId parameter)', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const paused = await token.paused(tokenId)

            expect(paused).to.be.false
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-180: should return whether or not the specific token is paused (with various tokenId types parameter)', async () => {
            const token = new caver.kct.kip37(kip37Address)

            let paused = await token.paused(caver.utils.toHex(tokenId))
            expect(paused).to.be.false

            paused = await token.paused(new BigNumber(tokenId))
            expect(paused).to.be.false
        }).timeout(200000)
    })

    context('kip37.isPauser', () => {
        it('CAVERJS-UNIT-KCT-181: should return whether the account is pauser or not', async () => {
            const token = new caver.kct.kip37(kip37Address)

            let isPauser = await token.isPauser(sender.address)
            expect(isPauser).to.be.true

            isPauser = await token.isPauser(testAccount.address)
            expect(isPauser).to.be.false
        }).timeout(200000)
    })

    context('kip37.isMinter', () => {
        it('CAVERJS-UNIT-KCT-182: should return whether the account is minter or not', async () => {
            const token = new caver.kct.kip37(kip37Address)

            let isMinter = await token.isMinter(sender.address)
            expect(isMinter).to.be.true

            isMinter = await token.isMinter(testAccount.address)
            expect(isMinter).to.be.false
        }).timeout(200000)
    })

    context('kip37.safeTransferFrom', () => {
        it('CAVERJS-UNIT-KCT-183: should transfer the token from owner to receiver', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const transfered = await token.safeTransferFrom(sender.address, receiver.address, tokenId, 1, 'data to send', {
                from: sender.address,
            })

            expect(transfered.from).to.be.equals(sender.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.TransferSingle).not.to.be.undefined
            expect(transfered.events.TransferSingle.address).to.equal(kip37Address)
            expect(transfered.events.TransferSingle.returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(transfered.events.TransferSingle.returnValues.from.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(transfered.events.TransferSingle.returnValues.to.toLowerCase()).to.equal(receiver.address.toLowerCase())
            expect(transfered.events.TransferSingle.returnValues.id).to.equal(tokenId.toString())
            expect(transfered.events.TransferSingle.returnValues.value).to.equal('1')
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-184: should transfer the token from owner to receiver by approved operator', async () => {
            const token = new caver.kct.kip37(kip37Address)

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
            expect(transfered.events.TransferSingle.address).to.equal(kip37Address)
            expect(transfered.events.TransferSingle.returnValues.operator.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(transfered.events.TransferSingle.returnValues.from.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(transfered.events.TransferSingle.returnValues.to.toLowerCase()).to.equal(receiver.address.toLowerCase())
            expect(transfered.events.TransferSingle.returnValues.id).to.equal(tokenId.toString())
            expect(transfered.events.TransferSingle.returnValues.value).to.equal('1')
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-217: should transfer the token without data', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const transfered = await token.safeTransferFrom(sender.address, receiver.address, tokenId, 1, {
                from: sender.address,
            })

            expect(transfered.from).to.be.equals(sender.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.TransferSingle).not.to.be.undefined
            expect(transfered.events.TransferSingle.address).to.equal(kip37Address)
            expect(transfered.events.TransferSingle.returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(transfered.events.TransferSingle.returnValues.from.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(transfered.events.TransferSingle.returnValues.to.toLowerCase()).to.equal(receiver.address.toLowerCase())
            expect(transfered.events.TransferSingle.returnValues.id).to.equal(tokenId.toString())
            expect(transfered.events.TransferSingle.returnValues.value).to.equal('1')
        }).timeout(200000)
    })

    context('kip37.safeBatchTransferFrom', () => {
        it('CAVERJS-UNIT-KCT-185: should transfer the tokens from owner to receiver', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const ids = [tokenIds[0], tokenIds[1]]
            const values = [1, 2]
            const transfered = await token.safeBatchTransferFrom(sender.address, receiver.address, ids, values, 'data to send', {
                from: sender.address,
            })

            expect(transfered.from).to.be.equals(sender.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.TransferBatch).not.to.be.undefined
            expect(transfered.events.TransferBatch.address).to.equal(kip37Address)
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
            const token = new caver.kct.kip37(kip37Address)

            const ids = [tokenIds[0], tokenIds[1]]
            const values = [1, 2]
            const transfered = await token.safeBatchTransferFrom(sender.address, receiver.address, ids, values, 'data to send', {
                from: testAccount.address,
            })

            expect(transfered.from).to.be.equals(testAccount.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.TransferBatch).not.to.be.undefined
            expect(transfered.events.TransferBatch.address).to.equal(kip37Address)
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

        it('CAVERJS-UNIT-KCT-218: should transfer the tokens without data', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const ids = [tokenIds[0], tokenIds[1]]
            const values = [1, 2]
            const transfered = await token.safeBatchTransferFrom(sender.address, receiver.address, ids, values, {
                from: sender.address,
            })

            expect(transfered.from).to.be.equals(sender.address.toLowerCase())
            expect(transfered.status).to.be.true
            expect(transfered.events).not.to.be.undefined
            expect(transfered.events.TransferBatch).not.to.be.undefined
            expect(transfered.events.TransferBatch.address).to.equal(kip37Address)
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
    })

    context('kip37.mintBatch', () => {
        it('CAVERJS-UNIT-KCT-187: should mint the specific tokens', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const ids = tokenIds
            const values = new Array(tokenIds.length).fill(10)
            const minted = await token.mintBatch(testAccount.address, ids, values, {
                from: sender.address,
            })

            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(minted.events.TransferBatch).not.to.be.undefined
            expect(minted.events.TransferBatch.address).to.equal(kip37Address)
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
            const token = new caver.kct.kip37(kip37Address)

            let ids = tokenIds.map(id => caver.utils.toHex(id))
            let values = new Array(tokenIds.length).fill(caver.utils.toHex(10))
            let minted = await token.mintBatch(testAccount.address, ids, values, {
                from: sender.address,
            })

            expect(minted.from).to.be.equals(sender.address.toLowerCase())
            expect(minted.status).to.be.true
            expect(minted.events).not.to.be.undefined
            expect(minted.events.TransferBatch).not.to.be.undefined
            expect(minted.events.TransferBatch.address).to.equal(kip37Address)
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
            expect(minted.events.TransferBatch.address).to.equal(kip37Address)
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
            const token = new caver.kct.kip37(kip37Address)

            const added = await token.addMinter(testAccount.address, { from: sender.address })

            expect(added.from).to.be.equals(sender.address.toLowerCase())
            expect(added.status).to.be.true
            expect(added.events).not.to.be.undefined
            expect(added.events.MinterAdded).not.to.be.undefined
            expect(added.events.MinterAdded.address).to.equal(kip37Address)
            expect(added.events.MinterAdded.returnValues.account.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(await token.isMinter(testAccount.address)).to.be.true
        }).timeout(200000)
    })

    context('kip37.renounceMinter', () => {
        it('CAVERJS-UNIT-KCT-190: should renounce minter', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const removed = await token.renounceMinter({ from: testAccount.address })

            expect(removed.from).to.be.equals(testAccount.address.toLowerCase())
            expect(removed.status).to.be.true
            expect(removed.events).not.to.be.undefined
            expect(removed.events.MinterRemoved).not.to.be.undefined
            expect(removed.events.MinterRemoved.address).to.equal(kip37Address)
            expect(removed.events.MinterRemoved.returnValues.account.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(await token.isMinter(testAccount.address)).to.be.false
        }).timeout(200000)
    })

    context('kip37.burn', () => {
        it('CAVERJS-UNIT-KCT-191: should burn the specific token', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const originalBalance = await token.balanceOf(sender.address, tokenIds[0])
            const burned = await token.burn(sender.address, tokenIds[0], 1, { from: sender.address })
            const afterBalance = await token.balanceOf(sender.address, tokenIds[0])

            expect(burned.from).to.be.equals(sender.address.toLowerCase())
            expect(burned.status).to.be.true
            expect(burned.events).not.to.be.undefined
            expect(burned.events.TransferSingle).not.to.be.undefined
            expect(burned.events.TransferSingle.address).to.equal(kip37Address)
            expect(burned.events.TransferSingle.returnValues.operator.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(burned.events.TransferSingle.returnValues.from.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(burned.events.TransferSingle.returnValues.to.toLowerCase()).to.equal('0x0000000000000000000000000000000000000000')
            expect(burned.events.TransferSingle.returnValues.id).to.equal(tokenIds[0].toString())
            expect(burned.events.TransferSingle.returnValues.value).to.equal('1')
            expect(originalBalance.minus(afterBalance).eq(new BigNumber(1))).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-192: should burn the specific token by approved operator', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const originalBalance = await token.balanceOf(sender.address, tokenIds[0])
            const burned = await token.burn(sender.address, caver.utils.toHex(tokenIds[0]), '1', { from: testAccount.address })
            const afterBalance = await token.balanceOf(sender.address, tokenIds[0])

            expect(burned.from).to.be.equals(testAccount.address.toLowerCase())
            expect(burned.status).to.be.true
            expect(burned.events).not.to.be.undefined
            expect(burned.events.TransferSingle).not.to.be.undefined
            expect(burned.events.TransferSingle.address).to.equal(kip37Address)
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
            const token = new caver.kct.kip37(kip37Address)

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
            expect(burned.events.TransferBatch.address).to.equal(kip37Address)
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
            const token = new caver.kct.kip37(kip37Address)

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
            expect(burned.events.TransferBatch.address).to.equal(kip37Address)
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
            const token = new caver.kct.kip37(kip37Address)

            const paused = await token.pause({ from: sender.address })

            expect(paused.from).to.be.equals(sender.address.toLowerCase())
            expect(paused.status).to.be.true
            expect(paused.events).not.to.be.undefined
            expect(paused.events.Paused).not.to.be.undefined
            expect(paused.events.Paused.address).to.equal(kip37Address)
            expect(paused.events.Paused.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(await token.paused()).to.be.true

            await token.unpause({ from: sender.address })
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-196: should pause the specific token', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const paused = await token.pause(tokenIds[0], { from: sender.address })

            expect(paused.from).to.be.equals(sender.address.toLowerCase())
            expect(paused.status).to.be.true
            expect(paused.events).not.to.be.undefined
            expect(paused.events.Paused).not.to.be.undefined
            expect(paused.events.Paused.address).to.equal(kip37Address)
            expect(paused.events.Paused.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(paused.events.Paused.returnValues.tokenId).to.equal(tokenIds[0].toString())
            expect(await token.paused(tokenIds[0])).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-197: should pause the specific token with various tokenId types', async () => {
            const token = new caver.kct.kip37(kip37Address)

            let paused = await token.pause(caver.utils.toHex(tokenIds[1]), { from: sender.address })

            expect(paused.from).to.be.equals(sender.address.toLowerCase())
            expect(paused.status).to.be.true
            expect(paused.events).not.to.be.undefined
            expect(paused.events.Paused).not.to.be.undefined
            expect(paused.events.Paused.address).to.equal(kip37Address)
            expect(paused.events.Paused.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(paused.events.Paused.returnValues.tokenId).to.equal(tokenIds[1].toString())
            expect(await token.paused(tokenIds[1])).to.be.true

            paused = await token.pause(new BigNumber(tokenIds[2]), { from: sender.address })

            expect(paused.from).to.be.equals(sender.address.toLowerCase())
            expect(paused.status).to.be.true
            expect(paused.events).not.to.be.undefined
            expect(paused.events.Paused).not.to.be.undefined
            expect(paused.events.Paused.address).to.equal(kip37Address)
            expect(paused.events.Paused.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(paused.events.Paused.returnValues.tokenId).to.equal(tokenIds[2].toString())
            expect(await token.paused(tokenIds[2])).to.be.true
        }).timeout(200000)
    })

    context('kip37.unpause', () => {
        it('CAVERJS-UNIT-KCT-198: should unpause the KIP-37 token contract (without tokenId parameter)', async () => {
            const token = new caver.kct.kip37(kip37Address)

            await token.pause({ from: sender.address })
            expect(await token.paused()).to.be.true

            const unpaused = await token.unpause({ from: sender.address })

            expect(unpaused.from).to.be.equals(sender.address.toLowerCase())
            expect(unpaused.status).to.be.true
            expect(unpaused.events).not.to.be.undefined
            expect(unpaused.events.Unpaused).not.to.be.undefined
            expect(unpaused.events.Unpaused.address).to.equal(kip37Address)
            expect(unpaused.events.Unpaused.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-199: should unpause the specific token', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const paused = await token.unpause(tokenIds[0], { from: sender.address })

            expect(paused.from).to.be.equals(sender.address.toLowerCase())
            expect(paused.status).to.be.true
            expect(paused.events).not.to.be.undefined
            expect(paused.events.Unpaused).not.to.be.undefined
            expect(paused.events.Unpaused.address).to.equal(kip37Address)
            expect(paused.events.Unpaused.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(paused.events.Unpaused.returnValues.tokenId).to.equal(tokenIds[0].toString())
            expect(await token.paused(tokenIds[0])).to.be.false
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-200: should unpause the specific token with various tokenId types', async () => {
            const token = new caver.kct.kip37(kip37Address)

            let unpaused = await token.unpause(caver.utils.toHex(tokenIds[1]), { from: sender.address })

            expect(unpaused.from).to.be.equals(sender.address.toLowerCase())
            expect(unpaused.status).to.be.true
            expect(unpaused.events).not.to.be.undefined
            expect(unpaused.events.Unpaused).not.to.be.undefined
            expect(unpaused.events.Unpaused.address).to.equal(kip37Address)
            expect(unpaused.events.Unpaused.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(unpaused.events.Unpaused.returnValues.tokenId).to.equal(tokenIds[1].toString())
            expect(await token.paused(tokenIds[1])).to.be.false

            unpaused = await token.unpause(new BigNumber(tokenIds[2]), { from: sender.address })

            expect(unpaused.from).to.be.equals(sender.address.toLowerCase())
            expect(unpaused.status).to.be.true
            expect(unpaused.events).not.to.be.undefined
            expect(unpaused.events.Unpaused).not.to.be.undefined
            expect(unpaused.events.Unpaused.address).to.equal(kip37Address)
            expect(unpaused.events.Unpaused.returnValues.account.toLowerCase()).to.equal(sender.address.toLowerCase())
            expect(unpaused.events.Unpaused.returnValues.tokenId).to.equal(tokenIds[2].toString())
            expect(await token.paused(tokenIds[2])).to.be.false
        }).timeout(200000)
    })

    context('kip37.addPauser', () => {
        it('CAVERJS-UNIT-KCT-201: should add pauser', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const added = await token.addPauser(testAccount.address, { from: sender.address })

            expect(added.from).to.be.equals(sender.address.toLowerCase())
            expect(added.status).to.be.true
            expect(added.events).not.to.be.undefined
            expect(added.events.PauserAdded).not.to.be.undefined
            expect(added.events.PauserAdded.address).to.equal(kip37Address)
            expect(added.events.PauserAdded.returnValues.account.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(await token.isPauser(testAccount.address)).to.be.true
        }).timeout(200000)
    })

    context('kip37.renouncePauser', () => {
        it('CAVERJS-UNIT-KCT-202: should renounce pauser', async () => {
            const token = new caver.kct.kip37(kip37Address)

            const removed = await token.renouncePauser({ from: testAccount.address })

            expect(removed.from).to.be.equals(testAccount.address.toLowerCase())
            expect(removed.status).to.be.true
            expect(removed.events).not.to.be.undefined
            expect(removed.events.PauserRemoved).not.to.be.undefined
            expect(removed.events.PauserRemoved.address).to.equal(kip37Address)
            expect(removed.events.PauserRemoved.returnValues.account.toLowerCase()).to.equal(testAccount.address.toLowerCase())
            expect(await token.isPauser(testAccount.address)).to.be.false
        }).timeout(200000)
    })

    context('KIP37.detectInterface', () => {
        it('CAVERJS-UNIT-KCT-211: should return valid object if contract is deployed by caver', async () => {
            const token = new caver.kct.kip37(kip37Address)
            let detected = await token.detectInterface()

            expect(detected.IKIP37).to.be.true
            expect(detected.IKIP37Metadata).to.be.true
            expect(detected.IKIP37Mintable).to.be.true
            expect(detected.IKIP37Burnable).to.be.true
            expect(detected.IKIP37Pausable).to.be.true

            // Test static function
            detected = await caver.kct.kip37.detectInterface(kip37Address)

            expect(detected.IKIP37).to.be.true
            expect(detected.IKIP37Metadata).to.be.true
            expect(detected.IKIP37Mintable).to.be.true
            expect(detected.IKIP37Burnable).to.be.true
            expect(detected.IKIP37Pausable).to.be.true
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-212: should return detected result object with IKIP37MetadataURI extension', async () => {
            // Deploy the KIP-37 contract implementing only IKIP37MetadataURI extension
            const byteCodeWithMintable =
                '0x60806040523480156200001157600080fd5b506040516200291338038062002913833981018060405260208110156200003757600080fd5b8101908080516401000000008111156200005057600080fd5b828101905060208101848111156200006757600080fd5b81518560018202830111640100000000821117156200008557600080fd5b505092919050505080620000a66301ffc9a760e01b620000ef60201b60201c565b620000b781620001f860201b60201c565b620000cf636433ca1f60e01b620000ef60201b60201c565b620000e7630e89341c60e01b620000ef60201b60201c565b5050620002c3565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614156200018c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f4b495031333a20696e76616c696420696e74657266616365206964000000000081525060200191505060405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b80600490805190602001906200021092919062000214565b5050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200025757805160ff191683800117855562000288565b8280016001018555821562000288579182015b82811115620002875782518255916020019190600101906200026a565b5b5090506200029791906200029b565b5090565b620002c091905b80821115620002bc576000816000905550600101620002a2565b5090565b90565b61264080620002d36000396000f3fe608060405234801561001057600080fd5b50600436106100925760003560e01c80634e1273f4116100665780634e1273f414610428578063a22cb465146105c9578063bd85b03914610619578063e985e9c51461065b578063f242432a146106d757610092565b8062fdd58e1461009757806301ffc9a7146100f95780630e89341c1461015e5780632eb2c2d614610205575b600080fd5b6100e3600480360360408110156100ad57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506107e6565b6040518082815260200191505060405180910390f35b6101446004803603602081101561010f57600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191690602001909291905050506108c6565b604051808215151515815260200191505060405180910390f35b61018a6004803603602081101561017457600080fd5b810190808035906020019092919050505061092d565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156101ca5780820151818401526020810190506101af565b50505050905090810190601f1680156101f75780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b610426600480360360a081101561021b57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019064010000000081111561027857600080fd5b82018360208201111561028a57600080fd5b803590602001918460208302840111640100000000831117156102ac57600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561030c57600080fd5b82018360208201111561031e57600080fd5b8035906020019184602083028401116401000000008311171561034057600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290803590602001906401000000008111156103a057600080fd5b8201836020820111156103b257600080fd5b803590602001918460018302840111640100000000831117156103d457600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506109d1565b005b6105726004803603604081101561043e57600080fd5b810190808035906020019064010000000081111561045b57600080fd5b82018360208201111561046d57600080fd5b8035906020019184602083028401116401000000008311171561048f57600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290803590602001906401000000008111156104ef57600080fd5b82018360208201111561050157600080fd5b8035906020019184602083028401116401000000008311171561052357600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290505050610e60565b6040518080602001828103825283818151815260200191508051906020019060200280838360005b838110156105b557808201518184015260208101905061059a565b505050509050019250505060405180910390f35b610617600480360360408110156105df57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080351515906020019092919050505061103e565b005b6106456004803603602081101561062f57600080fd5b81019080803590602001909291905050506111d9565b6040518082815260200191505060405180910390f35b6106bd6004803603604081101561067157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506111f6565b604051808215151515815260200191505060405180910390f35b6107e4600480360360a08110156106ed57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001909291908035906020019064010000000081111561075e57600080fd5b82018360208201111561077057600080fd5b8035906020019184600183028401116401000000008311171561079257600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050919291929050505061128a565b005b60008073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16141561086d576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260298152602001806124686029913960400191505060405180910390fd5b6001600083815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b6000806000837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff169050919050565b606060048054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156109c55780601f1061099a576101008083540402835291602001916109c5565b820191906000526020600020905b8154815290600101906020018083116109a857829003601f168201915b50505050509050919050565b8151835114610a2b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260268152602001806124916026913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161415610ab1576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602381526020018061258d6023913960400191505060405180910390fd5b610ab9611600565b73ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff161480610aff5750610afe85610af9611600565b6111f6565b5b610b54576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806124b76030913960400191505060405180910390fd5b6000610b5e611600565b9050610b6e818787878787611608565b60008090505b8451811015610d42576000858281518110610b8b57fe5b602002602001015190506000858381518110610ba357fe5b60200260200101519050610c2a816040518060600160405280602881526020016124e7602891396001600086815260200190815260200160002060008d73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546116109092919063ffffffff16565b6001600084815260200190815260200160002060008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550610ce1816001600085815260200190815260200160002060008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546116d090919063ffffffff16565b6001600084815260200190815260200160002060008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505050806001019050610b74565b508473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb8787604051808060200180602001838103835285818151815260200191508051906020019060200280838360005b83811015610df2578082015181840152602081019050610dd7565b50505050905001838103825284818151815260200191508051906020019060200280838360005b83811015610e34578082015181840152602081019050610e19565b5050505090500194505050505060405180910390a4610e57818787878787611758565b50505050505050565b60608151835114610ebc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260278152602001806124416027913960400191505060405180910390fd5b60608351604051908082528060200260200182016040528015610eee5781602001602082028038833980820191505090505b50905060008090505b845181101561103357600073ffffffffffffffffffffffffffffffffffffffff16858281518110610f2457fe5b602002602001015173ffffffffffffffffffffffffffffffffffffffff161415610f99576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602f8152602001806125e6602f913960400191505060405180910390fd5b60016000858381518110610fa957fe5b602002602001015181526020019081526020016000206000868381518110610fcd57fe5b602002602001015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205482828151811061101c57fe5b602002602001018181525050806001019050610ef7565b508091505092915050565b8173ffffffffffffffffffffffffffffffffffffffff1661105d611600565b73ffffffffffffffffffffffffffffffffffffffff1614156110ca576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602781526020018061250f6027913960400191505060405180910390fd5b80600260006110d7611600565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff16611184611600565b73ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3183604051808215151515815260200191505060405180910390a35050565b600060036000838152602001908152602001600020549050919050565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161415611310576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602381526020018061258d6023913960400191505060405180910390fd5b611318611600565b73ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff16148061135e575061135d85611358611600565b6111f6565b5b6113b3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260278152602001806125666027913960400191505060405180910390fd5b60006113bd611600565b90506113dd8187876113ce88611e28565b6113d788611e28565b87611608565b61145a836040518060600160405280602881526020016124e7602891396001600088815260200190815260200160002060008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546116109092919063ffffffff16565b6001600086815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550611511836001600087815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546116d090919063ffffffff16565b6001600086815260200190815260200160002060008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f628787604051808381526020018281526020019250505060405180910390a46115f7818787878787611e81565b50505050505050565b600033905090565b505050505050565b60008383111582906116bd576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b83811015611682578082015181840152602081019050611667565b50505050905090810190601f1680156116af5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b5060008385039050809150509392505050565b60008082840190508381101561174e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b60006117798573ffffffffffffffffffffffffffffffffffffffff1661242d565b15611e1d57600115158573ffffffffffffffffffffffffffffffffffffffff166301ffc9a7634e2312e060e01b6040518263ffffffff1660e01b815260040180827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060206040518083038186803b15801561181857600080fd5b505afa15801561182c573d6000803e3d6000fd5b505050506040513d602081101561184257600080fd5b810190808051906020019092919050505015151415611aa55760008573ffffffffffffffffffffffffffffffffffffffff1663bc197c8189898888886040518663ffffffff1660e01b8152600401808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001806020018060200180602001848103845287818151815260200191508051906020019060200280838360005b8381101561193c578082015181840152602081019050611921565b50505050905001848103835286818151815260200191508051906020019060200280838360005b8381101561197e578082015181840152602081019050611963565b50505050905001848103825285818151815260200191508051906020019080838360005b838110156119bd5780820151818401526020810190506119a2565b50505050905090810190601f1680156119ea5780820380516001836020036101000a031916815260200191505b5098505050505050505050602060405180830381600087803b158015611a0f57600080fd5b505af1158015611a23573d6000803e3d6000fd5b505050506040513d6020811015611a3957600080fd5b8101908080519060200190929190505050905063bc197c8160e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161415611aa3576001915050611e1e565b505b600115158573ffffffffffffffffffffffffffffffffffffffff166301ffc9a7637cc2d01760e01b6040518263ffffffff1660e01b815260040180827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060206040518083038186803b158015611b3f57600080fd5b505afa158015611b53573d6000803e3d6000fd5b505050506040513d6020811015611b6957600080fd5b810190808051906020019092919050505015151415611dcc5760008573ffffffffffffffffffffffffffffffffffffffff16639b49e33289898888886040518663ffffffff1660e01b8152600401808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001806020018060200180602001848103845287818151815260200191508051906020019060200280838360005b83811015611c63578082015181840152602081019050611c48565b50505050905001848103835286818151815260200191508051906020019060200280838360005b83811015611ca5578082015181840152602081019050611c8a565b50505050905001848103825285818151815260200191508051906020019080838360005b83811015611ce4578082015181840152602081019050611cc9565b50505050905090810190601f168015611d115780820380516001836020036101000a031916815260200191505b5098505050505050505050602060405180830381600087803b158015611d3657600080fd5b505af1158015611d4a573d6000803e3d6000fd5b505050506040513d6020811015611d6057600080fd5b81019080805190602001909291905050509050639b49e33260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161415611dca576001915050611e1e565b505b6040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260368152602001806125b06036913960400191505060405180910390fd5b5b9695505050505050565b6060806001604051908082528060200260200182016040528015611e5b5781602001602082028038833980820191505090505b5090508281600081518110611e6c57fe5b60200260200101818152505080915050919050565b6000611ea28573ffffffffffffffffffffffffffffffffffffffff1661242d565b1561241e57600060608673ffffffffffffffffffffffffffffffffffffffff1663f23a6e6160e01b8a8a898989604051602401808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200184815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015611f82578082015181840152602081019050611f67565b50505050905090810190601f168015611faf5780820380516001836020036101000a031916815260200191505b509650505050505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b602083106120485780518252602082019150602081019050602083039250612025565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d80600081146120aa576040519150601f19603f3d011682016040523d82523d6000602084013e6120af565b606091505b509150915081801561212a575063f23a6e6160e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19168180602001905160208110156120f857600080fd5b81019080805190602001909291905050507bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b1561213a57600192505050612423565b8673ffffffffffffffffffffffffffffffffffffffff1663e78b332560e01b8a8a898989604051602401808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200184815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b838110156122115780820151818401526020810190506121f6565b50505050905090810190601f16801561223e5780820380516001836020036101000a031916815260200191505b509650505050505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b602083106122d757805182526020820191506020810190506020830392506122b4565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d8060008114612339576040519150601f19603f3d011682016040523d82523d6000602084013e61233e565b606091505b5080925081935050508180156123bd575063e78b332560e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191681806020019051602081101561238b57600080fd5b81019080805190602001909291905050507bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b156123cd57600192505050612423565b6040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001806125366030913960400191505060405180910390fd5b600190505b9695505050505050565b600080823b90506000811191505091905056fe4b495033373a206163636f756e747320616e6420696473206c656e677468206d69736d617463684b495033373a2062616c616e636520717565727920666f7220746865207a65726f20616464726573734b495033373a2069647320616e6420616d6f756e7473206c656e677468206d69736d617463684b495033373a207472616e736665722063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f7665644b495033373a20696e73756666696369656e742062616c616e636520666f72207472616e736665724b495033373a2073657474696e6720617070726f76616c2073746174757320666f722073656c664b495033373a207472616e7366657220746f206e6f6e204b49503337526563656976657220696d706c656d656e7465724b495033373a2063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f7665644b495033373a207472616e7366657220746f20746865207a65726f20616464726573734b495033373a206261746368207472616e7366657220746f206e6f6e204b49503337526563656976657220696d706c656d656e7465724b495033373a2062617463682062616c616e636520717565727920666f7220746865207a65726f2061646472657373a165627a7a72305820b8e912f617ca3aa572692cdbdbfd18a21d3d744a66ca4959e70ba261686593770029'
            const abiWithMintable = [
                { inputs: [{ name: 'uri', type: 'string' }], payable: false, stateMutability: 'nonpayable', type: 'constructor' },
            ]

            const deployed = await new caver.contract(abiWithMintable)
                .deploy({
                    data: byteCodeWithMintable,
                    arguments: [tokenURI],
                })
                .send({ from: sender.address, gas: 10000000 })

            const contractAddress = deployed.options.address

            const token = new caver.kct.kip37(contractAddress)
            let detected = await token.detectInterface()

            expect(detected.IKIP37).to.be.true
            expect(detected.IKIP37Metadata).to.be.true
            expect(detected.IKIP37Mintable).to.be.false
            expect(detected.IKIP37Burnable).to.be.false
            expect(detected.IKIP37Pausable).to.be.false

            // Test static function
            detected = await caver.kct.kip37.detectInterface(contractAddress)

            expect(detected.IKIP37).to.be.true
            expect(detected.IKIP37Metadata).to.be.true
            expect(detected.IKIP37Mintable).to.be.false
            expect(detected.IKIP37Burnable).to.be.false
            expect(detected.IKIP37Pausable).to.be.false
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-213: should return detected result object without only IKIP37Pausable and IKIP37Burnable extensions', async () => {
            // Deploy the KIP-37 contract not implementing IKIP37Pausable and IKIP37Burnable extensions
            const byteCodeWithoutBurnablePausable =
                '0x60806040523480156200001157600080fd5b506040516200422138038062004221833981018060405260208110156200003757600080fd5b8101908080516401000000008111156200005057600080fd5b828101905060208101848111156200006757600080fd5b81518560018202830111640100000000821117156200008557600080fd5b505092919050505080620000a66301ffc9a760e01b6200012760201b60201c565b620000b7816200023060201b60201c565b620000cf636433ca1f60e01b6200012760201b60201c565b620000e7630e89341c60e01b6200012760201b60201c565b5062000108620000fc6200024c60201b60201c565b6200025460201b60201c565b6200012063dfd9d9ec60e01b6200012760201b60201c565b5062000528565b63ffffffff60e01b817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161415620001c4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f4b495031333a20696e76616c696420696e74657266616365206964000000000081525060200191505060405180910390fd5b6001600080837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b80600490805190602001906200024892919062000479565b5050565b600033905090565b6200026f816005620002b560201b620038931790919060201c565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b620002c782826200039960201b60201c565b156200033b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141562000422576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526022815260200180620041ff6022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10620004bc57805160ff1916838001178555620004ed565b82800160010185558215620004ed579182015b82811115620004ec578251825591602001919060010190620004cf565b5b509050620004fc919062000500565b5090565b6200052591905b808211156200052157600081600090555060010162000507565b5090565b90565b613cc780620005386000396000f3fe608060405234801561001057600080fd5b506004361061010a5760003560e01c806398650275116100a2578063cd53d08e11610071578063cd53d08e146108bc578063cfa84fc11461092a578063d81d0a1514610a80578063e985e9c514610bec578063f242432a14610c685761010a565b806398650275146107c4578063a22cb465146107ce578063aa271e1a1461081e578063bd85b0391461087a5761010a565b80634b068c78116100de5780634b068c78146104a05780634e1273f414610587578063836a104014610728578063983b2d56146107805761010a565b8062fdd58e1461010f57806301ffc9a7146101715780630e89341c146101d65780632eb2c2d61461027d575b600080fd5b61015b6004803603604081101561012557600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610d77565b6040518082815260200191505060405180910390f35b6101bc6004803603602081101561018757600080fd5b8101908080357bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19169060200190929190505050610e57565b604051808215151515815260200191505060405180910390f35b610202600480360360208110156101ec57600080fd5b8101908080359060200190929190505050610ebe565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610242578082015181840152602081019050610227565b50505050905090810190601f16801561026f5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61049e600480360360a081101561029357600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001906401000000008111156102f057600080fd5b82018360208201111561030257600080fd5b8035906020019184602083028401116401000000008311171561032457600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561038457600080fd5b82018360208201111561039657600080fd5b803590602001918460208302840111640100000000831117156103b857600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561041857600080fd5b82018360208201111561042a57600080fd5b8035906020019184600183028401116401000000008311171561044c57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050610f62565b005b61056d600480360360608110156104b657600080fd5b810190808035906020019092919080359060200190929190803590602001906401000000008111156104e757600080fd5b8201836020820111156104f957600080fd5b8035906020019184600183028401116401000000008311171561051b57600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505091929192905050506113f1565b604051808215151515815260200191505060405180910390f35b6106d16004803603604081101561059d57600080fd5b81019080803590602001906401000000008111156105ba57600080fd5b8201836020820111156105cc57600080fd5b803590602001918460208302840111640100000000831117156105ee57600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f8201169050808301925050505050505091929192908035906020019064010000000081111561064e57600080fd5b82018360208201111561066057600080fd5b8035906020019184602083028401116401000000008311171561068257600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f8201169050808301925050505050505091929192905050506115f0565b6040518080602001828103825283818151815260200191508051906020019060200280838360005b838110156107145780820151818401526020810190506106f9565b505050509050019250505060405180910390f35b61077e6004803603606081101561073e57600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506117ce565b005b6107c26004803603602081101561079657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506118ce565b005b6107cc61193f565b005b61081c600480360360408110156107e457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803515159060200190929190505050611951565b005b6108606004803603602081101561083457600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611aec565b604051808215151515815260200191505060405180910390f35b6108a66004803603602081101561089057600080fd5b8101908080359060200190929190505050611b09565b6040518082815260200191505060405180910390f35b6108e8600480360360208110156108d257600080fd5b8101908080359060200190929190505050611b26565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b610a7e6004803603606081101561094057600080fd5b81019080803590602001909291908035906020019064010000000081111561096757600080fd5b82018360208201111561097957600080fd5b8035906020019184602083028401116401000000008311171561099b57600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290803590602001906401000000008111156109fb57600080fd5b820183602082011115610a0d57600080fd5b80359060200191846020830284011164010000000083111715610a2f57600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290505050611b59565b005b610bea60048036036060811015610a9657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190640100000000811115610ad357600080fd5b820183602082011115610ae557600080fd5b80359060200191846020830284011164010000000083111715610b0757600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f82011690508083019250505050505050919291929080359060200190640100000000811115610b6757600080fd5b820183602082011115610b7957600080fd5b80359060200191846020830284011164010000000083111715610b9b57600080fd5b919080806020026020016040519081016040528093929190818152602001838360200280828437600081840152601f19601f820116905080830192505050505050509192919290505050611d00565b005b610c4e60048036036040811015610c0257600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050611e2e565b604051808215151515815260200191505060405180910390f35b610d75600480360360a0811015610c7e57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291908035906020019092919080359060200190640100000000811115610cef57600080fd5b820183602082011115610d0157600080fd5b80359060200191846001830284011164010000000083111715610d2357600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290505050611ec2565b005b60008073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610dfe576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526029815260200180613a536029913960400191505060405180910390fd5b6001600083815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b6000806000837bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060009054906101000a900460ff169050919050565b606060048054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610f565780601f10610f2b57610100808354040283529160200191610f56565b820191906000526020600020905b815481529060010190602001808311610f3957829003601f168201915b50505050509050919050565b8151835114610fbc576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526026815260200180613aa56026913960400191505060405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161415611042576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526023815260200180613c146023913960400191505060405180910390fd5b61104a612238565b73ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff161480611090575061108f8561108a612238565b611e2e565b5b6110e5576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180613acb6030913960400191505060405180910390fd5b60006110ef612238565b90506110ff818787878787612240565b60008090505b84518110156112d357600085828151811061111c57fe5b60200260200101519050600085838151811061113457fe5b602002602001015190506111bb81604051806060016040528060288152602001613afb602891396001600086815260200190815260200160002060008d73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546122489092919063ffffffff16565b6001600084815260200190815260200160002060008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550611272816001600085815260200190815260200160002060008b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461230890919063ffffffff16565b6001600084815260200190815260200160002060008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505050806001019050611105565b508473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb8787604051808060200180602001838103835285818151815260200191508051906020019060200280838360005b83811015611383578082015181840152602081019050611368565b50505050905001838103825284818151815260200191508051906020019060200280838360005b838110156113c55780820151818401526020810190506113aa565b5050505090500194505050505060405180910390a46113e8818787878787612390565b50505050505050565b60006114036113fe612238565b611aec565b611458576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180613b236030913960400191505060405180910390fd5b61146184612a60565b156114d4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601c8152602001807f4b495033373a20746f6b656e20616c726561647920637265617465640000000081525060200191505060405180910390fd5b336006600086815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061154133858560405180602001604052806000815250612ad2565b6000825111156115e957837f6bb7ff708619ba0610cba295a58592e0451dee2622938c8755667688daf3529b836040518080602001828103825283818151815260200191508051906020019080838360005b838110156115ae578082015181840152602081019050611593565b50505050905090810190601f1680156115db5780820380516001836020036101000a031916815260200191505b509250505060405180910390a25b9392505050565b6060815183511461164c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526027815260200180613a2c6027913960400191505060405180910390fd5b6060835160405190808252806020026020018201604052801561167e5781602001602082028038833980820191505090505b50905060008090505b84518110156117c357600073ffffffffffffffffffffffffffffffffffffffff168582815181106116b457fe5b602002602001015173ffffffffffffffffffffffffffffffffffffffff161415611729576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252602f815260200180613c6d602f913960400191505060405180910390fd5b6001600085838151811061173957fe5b60200260200101518152602001908152602001600020600086838151811061175d57fe5b602002602001015173ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020548282815181106117ac57fe5b602002602001018181525050806001019050611687565b508091505092915050565b6117de6117d9612238565b611aec565b611833576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180613b236030913960400191505060405180910390fd5b61183c83612a60565b6118ae576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260188152602001807f4b495033373a206e6f6e6578697374656e7420746f6b656e000000000000000081525060200191505060405180910390fd5b6118c982848360405180602001604052806000815250612ad2565b505050565b6118de6118d9612238565b611aec565b611933576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180613b236030913960400191505060405180910390fd5b61193c81612d30565b50565b61194f61194a612238565b612d8a565b565b8173ffffffffffffffffffffffffffffffffffffffff16611970612238565b73ffffffffffffffffffffffffffffffffffffffff1614156119dd576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526027815260200180613b746027913960400191505060405180910390fd5b80600260006119ea612238565b73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff16611a97612238565b73ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3183604051808215151515815260200191505060405180910390a35050565b6000611b02826005612de490919063ffffffff16565b9050919050565b600060036000838152602001908152602001600020549050919050565b60066020528060005260406000206000915054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b611b69611b64612238565b611aec565b611bbe576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180613b236030913960400191505060405180910390fd5b611bc783612a60565b611c39576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260188152602001807f4b495033373a206e6f6e6578697374656e7420746f6b656e000000000000000081525060200191505060405180910390fd5b8051825114611c93576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526029815260200180613a7c6029913960400191505060405180910390fd5b60008090505b8251811015611cfa576000838281518110611cb057fe5b602002602001015190506000838381518110611cc857fe5b60200260200101519050611ced82878360405180602001604052806000815250612ad2565b5050806001019050611c99565b50505050565b611d10611d0b612238565b611aec565b611d65576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180613b236030913960400191505060405180910390fd5b60008090505b8251811015611e0d57611d90838281518110611d8357fe5b6020026020010151612a60565b611e02576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260188152602001807f4b495033373a206e6f6e6578697374656e7420746f6b656e000000000000000081525060200191505060405180910390fd5b806001019050611d6b565b50611e2983838360405180602001604052806000815250612ec2565b505050565b6000600260008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161415611f48576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526023815260200180613c146023913960400191505060405180910390fd5b611f50612238565b73ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff161480611f965750611f9585611f90612238565b611e2e565b5b611feb576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526027815260200180613bed6027913960400191505060405180910390fd5b6000611ff5612238565b90506120158187876120068861327b565b61200f8861327b565b87612240565b61209283604051806060016040528060288152602001613afb602891396001600088815260200190815260200160002060008a73ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020546122489092919063ffffffff16565b6001600086815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550612149836001600087815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461230890919063ffffffff16565b6001600086815260200190815260200160002060008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f628787604051808381526020018281526020019250505060405180910390a461222f8187878787876132d4565b50505050505050565b600033905090565b505050505050565b60008383111582906122f5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b838110156122ba57808201518184015260208101905061229f565b50505050905090810190601f1680156122e75780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b5060008385039050809150509392505050565b600080828401905083811015612386576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601b8152602001807f536166654d6174683a206164646974696f6e206f766572666c6f77000000000081525060200191505060405180910390fd5b8091505092915050565b60006123b18573ffffffffffffffffffffffffffffffffffffffff16613880565b15612a5557600115158573ffffffffffffffffffffffffffffffffffffffff166301ffc9a7634e2312e060e01b6040518263ffffffff1660e01b815260040180827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060206040518083038186803b15801561245057600080fd5b505afa158015612464573d6000803e3d6000fd5b505050506040513d602081101561247a57600080fd5b8101908080519060200190929190505050151514156126dd5760008573ffffffffffffffffffffffffffffffffffffffff1663bc197c8189898888886040518663ffffffff1660e01b8152600401808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001806020018060200180602001848103845287818151815260200191508051906020019060200280838360005b83811015612574578082015181840152602081019050612559565b50505050905001848103835286818151815260200191508051906020019060200280838360005b838110156125b657808201518184015260208101905061259b565b50505050905001848103825285818151815260200191508051906020019080838360005b838110156125f55780820151818401526020810190506125da565b50505050905090810190601f1680156126225780820380516001836020036101000a031916815260200191505b5098505050505050505050602060405180830381600087803b15801561264757600080fd5b505af115801561265b573d6000803e3d6000fd5b505050506040513d602081101561267157600080fd5b8101908080519060200190929190505050905063bc197c8160e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614156126db576001915050612a56565b505b600115158573ffffffffffffffffffffffffffffffffffffffff166301ffc9a7637cc2d01760e01b6040518263ffffffff1660e01b815260040180827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060206040518083038186803b15801561277757600080fd5b505afa15801561278b573d6000803e3d6000fd5b505050506040513d60208110156127a157600080fd5b810190808051906020019092919050505015151415612a045760008573ffffffffffffffffffffffffffffffffffffffff16639b49e33289898888886040518663ffffffff1660e01b8152600401808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001806020018060200180602001848103845287818151815260200191508051906020019060200280838360005b8381101561289b578082015181840152602081019050612880565b50505050905001848103835286818151815260200191508051906020019060200280838360005b838110156128dd5780820151818401526020810190506128c2565b50505050905001848103825285818151815260200191508051906020019080838360005b8381101561291c578082015181840152602081019050612901565b50505050905090810190601f1680156129495780820380516001836020036101000a031916815260200191505b5098505050505050505050602060405180830381600087803b15801561296e57600080fd5b505af1158015612982573d6000803e3d6000fd5b505050506040513d602081101561299857600080fd5b81019080805190602001909291905050509050639b49e33260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161415612a02576001915050612a56565b505b6040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526036815260200180613c376036913960400191505060405180910390fd5b5b9695505050505050565b6000806006600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415915050919050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161415612b75576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f4b495033373a206d696e7420746f20746865207a65726f20616464726573730081525060200191505060405180910390fd5b6000612b7f612238565b9050612ba081600087612b918861327b565b612b9a8861327b565b87612240565b612c03836001600087815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205461230890919063ffffffff16565b6001600086815260200190815260200160002060008773ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550612c7d83600360008781526020019081526020016000205461230890919063ffffffff16565b60036000868152602001908152602001600020819055508473ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167fc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f628787604051808381526020018281526020019250505060405180910390a4612d28816000878787876132d4565b505050505050565b612d4481600561389390919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167f6ae172837ea30b801fbfcdd4108aa1d5bf8ff775444fd70256b44e6bf3dfc3f660405160405180910390a250565b612d9e81600561396e90919063ffffffff16565b8073ffffffffffffffffffffffffffffffffffffffff167fe94479a9f7e1952cc78f2d6baab678adc1b772d936c6583def489e524cb6669260405160405180910390a250565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415612e6b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526022815260200180613b9b6022913960400191505060405180910390fd5b8260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161415612f65576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f4b495033373a206d696e7420746f20746865207a65726f20616464726573730081525060200191505060405180910390fd5b8151835114612fbf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526026815260200180613aa56026913960400191505060405180910390fd5b6000612fc9612238565b9050612fda81600087878787612240565b60008090505b845181101561315c5761307260016000878481518110612ffc57fe5b6020026020010151815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205485838151811061305c57fe5b602002602001015161230890919063ffffffff16565b6001600087848151811061308257fe5b6020026020010151815260200190815260200160002060008873ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550613125600360008784815181106130ec57fe5b602002602001015181526020019081526020016000205485838151811061310f57fe5b602002602001015161230890919063ffffffff16565b6003600087848151811061313557fe5b60200260200101518152602001908152602001600020819055508080600101915050612fe0565b508473ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb8787604051808060200180602001838103835285818151815260200191508051906020019060200280838360005b8381101561320d5780820151818401526020810190506131f2565b50505050905001838103825284818151815260200191508051906020019060200280838360005b8381101561324f578082015181840152602081019050613234565b5050505090500194505050505060405180910390a461327381600087878787612390565b505050505050565b60608060016040519080825280602002602001820160405280156132ae5781602001602082028038833980820191505090505b50905082816000815181106132bf57fe5b60200260200101818152505080915050919050565b60006132f58573ffffffffffffffffffffffffffffffffffffffff16613880565b1561387157600060608673ffffffffffffffffffffffffffffffffffffffff1663f23a6e6160e01b8a8a898989604051602401808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200184815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b838110156133d55780820151818401526020810190506133ba565b50505050905090810190601f1680156134025780820380516001836020036101000a031916815260200191505b509650505050505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b6020831061349b5780518252602082019150602081019050602083039250613478565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d80600081146134fd576040519150601f19603f3d011682016040523d82523d6000602084013e613502565b606091505b509150915081801561357d575063f23a6e6160e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191681806020019051602081101561354b57600080fd5b81019080805190602001909291905050507bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b1561358d57600192505050613876565b8673ffffffffffffffffffffffffffffffffffffffff1663e78b332560e01b8a8a898989604051602401808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200184815260200183815260200180602001828103825283818151815260200191508051906020019080838360005b83811015613664578082015181840152602081019050613649565b50505050905090810190601f1680156136915780820380516001836020036101000a031916815260200191505b509650505050505050604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff83818316178352505050506040518082805190602001908083835b6020831061372a5780518252602082019150602081019050602083039250613707565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d806000811461378c576040519150601f19603f3d011682016040523d82523d6000602084013e613791565b606091505b508092508193505050818015613810575063e78b332560e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19168180602001905160208110156137de57600080fd5b81019080805190602001909291905050507bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b1561382057600192505050613876565b6040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526030815260200180613bbd6030913960400191505060405180910390fd5b600190505b9695505050505050565b600080823b905060008111915050919050565b61389d8282612de4565b15613910576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040180806020018281038252601f8152602001807f526f6c65733a206163636f756e7420616c72656164792068617320726f6c650081525060200191505060405180910390fd5b60018260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055505050565b6139788282612de4565b6139cd576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401808060200182810382526021815260200180613b536021913960400191505060405180910390fd5b60008260000160008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff021916908315150217905550505056fe4b495033373a206163636f756e747320616e6420696473206c656e677468206d69736d617463684b495033373a2062616c616e636520717565727920666f7220746865207a65726f20616464726573734b495033373a20746f4c69737420616e64205f76616c756573206c656e677468206d69736d617463684b495033373a2069647320616e6420616d6f756e7473206c656e677468206d69736d617463684b495033373a207472616e736665722063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f7665644b495033373a20696e73756666696369656e742062616c616e636520666f72207472616e736665724d696e746572526f6c653a2063616c6c657220646f6573206e6f74206861766520746865204d696e74657220726f6c65526f6c65733a206163636f756e7420646f6573206e6f74206861766520726f6c654b495033373a2073657474696e6720617070726f76616c2073746174757320666f722073656c66526f6c65733a206163636f756e7420697320746865207a65726f20616464726573734b495033373a207472616e7366657220746f206e6f6e204b49503337526563656976657220696d706c656d656e7465724b495033373a2063616c6c6572206973206e6f74206f776e6572206e6f7220617070726f7665644b495033373a207472616e7366657220746f20746865207a65726f20616464726573734b495033373a206261746368207472616e7366657220746f206e6f6e204b49503337526563656976657220696d706c656d656e7465724b495033373a2062617463682062616c616e636520717565727920666f7220746865207a65726f2061646472657373a165627a7a72305820ce694c8c35830759ea8ac17445c54a2799118c21020c02014c942aa3dd6570100029526f6c65733a206163636f756e7420697320746865207a65726f2061646472657373'
            const abiWithoutBurnablePausable = [
                { inputs: [{ name: 'uri', type: 'string' }], payable: false, stateMutability: 'nonpayable', type: 'constructor' },
            ]

            const deployed = await new caver.contract(abiWithoutBurnablePausable)
                .deploy({
                    data: byteCodeWithoutBurnablePausable,
                    arguments: [tokenURI],
                })
                .send({ from: sender.address, gas: 10000000 })
            const contractAddress = deployed.options.address

            const token = new caver.kct.kip37(contractAddress)
            let detected = await token.detectInterface()

            expect(detected.IKIP37).to.be.true
            expect(detected.IKIP37Metadata).to.be.true
            expect(detected.IKIP37Mintable).to.be.true
            expect(detected.IKIP37Burnable).to.be.false
            expect(detected.IKIP37Pausable).to.be.false

            // Test static function
            detected = await caver.kct.kip37.detectInterface(contractAddress)

            expect(detected.IKIP37).to.be.true
            expect(detected.IKIP37Metadata).to.be.true
            expect(detected.IKIP37Mintable).to.be.true
            expect(detected.IKIP37Burnable).to.be.false
            expect(detected.IKIP37Pausable).to.be.false
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-214: should throw an error if the KIP-13 specification is not satisfied ', async () => {
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

            const token = new caver.kct.kip37(contractAddress)

            const expectedError = `This contract does not support KIP-13.`
            await expect(token.detectInterface()).to.be.rejectedWith(expectedError)
            await expect(caver.kct.kip37.detectInterface(contractAddress)).to.be.rejectedWith(expectedError)
        }).timeout(200000)
    })

    context('KIP37 with fee delegation', () => {
        const contractDeployFormatter = receipt => {
            return receipt
        }

        it('CAVERJS-UNIT-KCT-244: should send TxTypeSmartContractDeploy to deploy when feeDelegation is defined as true', async () => {
            const deployed = await caver.kct.kip37.deploy(
                { uri: tokenURI },
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

        it('CAVERJS-UNIT-KCT-245: should send TxTypeFeeDelegatedSmartContractDeployWithRatio to deploy when feeRatio is defined and feeDelegation is defined as true', async () => {
            const deployed = await caver.kct.kip37.deploy(
                { uri: tokenURI },
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

        it('CAVERJS-UNIT-KCT-246: should send TxTypeSmartContractExecution to add minter when feeDelegation is defined as true', async () => {
            const token = caver.kct.kip37.create(kip37Address)

            const added = await token.addMinter(caver.wallet.keyring.generate().address, {
                from: sender.address,
                feeDelegation: true,
                feePayer: feePayer.address,
            })

            expect(added.from).to.equals(sender.address.toLowerCase())
            expect(added.status).to.be.true
            expect(added.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-247: should send TxTypeSmartContractExecution to add minter when feeDelegation is defined as true via options', async () => {
            const token = caver.kct.kip37.create(kip37Address)

            token.options.from = sender.address
            token.options.feeDelegation = true
            token.options.feePayer = feePayer.address

            const added = await token.addMinter(caver.wallet.keyring.generate().address)

            expect(added.from).to.equals(sender.address.toLowerCase())
            expect(added.status).to.be.true
            expect(added.type).to.equal(TX_TYPE_STRING.TxTypeFeeDelegatedSmartContractExecution)
        }).timeout(200000)

        it('CAVERJS-UNIT-KCT-248: should send TxTypeFeeDelegatedSmartContractExecutionWithRatio to add minter when feeRatio is defined and feeDelegation is defined as true', async () => {
            const token = caver.kct.kip37.create(kip37Address)

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

        it('CAVERJS-UNIT-KCT-249: should send TxTypeFeeDelegatedSmartContractExecutionWithRatio to add minter when feeRatio is defined and feeDelegation is defined as true via options', async () => {
            const token = caver.kct.kip37.create(kip37Address)

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

        it('CAVERJS-UNIT-KCT-250: should overwrite contract.options when user send sendOptions parameter', async () => {
            const token = caver.kct.kip37.create(kip37Address)

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

        it('CAVERJS-UNIT-KCT-251: should sign and return signed TxTypeFeeDelegatedSmartContractDeploy', async () => {
            const token = caver.kct.kip37.create()

            const signed = await token.sign(
                {
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    gas: 30000000,
                },
                'constructor',
                caver.kct.kip37.byteCode,
                tokenURI
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

        it('CAVERJS-UNIT-KCT-252: should sign as fee payer and return signed TxTypeFeeDelegatedSmartContractDeploy', async () => {
            const token = caver.kct.kip37.create()

            const signed = await token.signAsFeePayer(
                {
                    from: sender.address,
                    feeDelegation: true,
                    feePayer: feePayer.address,
                    gas: 30000000,
                },
                'constructor',
                caver.kct.kip37.byteCode,
                tokenURI
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

        it('CAVERJS-UNIT-KCT-253: should sign and return signed TxTypeFeeDelegatedSmartContractExecution', async () => {
            const token = caver.kct.kip37.create(kip37Address)

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

        it('CAVERJS-UNIT-KCT-254: should sign as fee payer and return signed TxTypeFeeDelegatedSmartContractExecution', async () => {
            const token = caver.kct.kip37.create(kip37Address)

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
