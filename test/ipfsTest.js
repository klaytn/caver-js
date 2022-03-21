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

const fs = require('fs')

const { expect } = require('./extendedChai')

const testRPCURL = require('./testrpc')

const Caver = require('../index')

const caver = new Caver(testRPCURL)

let sender

before(() => {
    const privateKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey
    sender = caver.wallet.add(caver.wallet.keyring.createFromPrivateKey(privateKey))
})

describe('Connect IPFS with Klaytn', () => {
    it('CAVERJS-UNIT-IPFS-001: should add file to IPFS and return hash', async () => {
        // Set IPFS Node
        caver.ipfs.setIPFSNode('ipfs.infura.io', 5001, true)

        // Create test txt file for IPFS
        const testFileName = './ipfsTestFile.txt'
        fs.openSync(testFileName, 'w+')
        fs.writeFileSync(testFileName, 'test data for IPFS')

        // Add file to IPFS
        const added = await caver.ipfs.add(testFileName)
        expect(typeof added).to.equal('string')

        // Add file to IPFS with file contents
        const contents = fs.readFileSync(testFileName)
        const addedWithContents = await caver.ipfs.add(contents)
        expect(typeof addedWithContents).to.equal('string')

        // Get contents from IPFS
        const fileFromIPFS = await caver.ipfs.get(added)

        // Create ValueTransferMemo transaction
        // to submit IPFS hash to Klaytn network
        const vtm = caver.transaction.valueTransferMemo.create({
            from: sender.address,
            to: sender.address,
            value: 1,
            input: caver.ipfs.toHex(added),
            gas: 30000,
        })

        // Sign to transaction
        await caver.wallet.sign(sender.address, vtm)

        // Send signed transaction
        const ret = await caver.rpc.klay.sendRawTransaction(vtm)
        expect(ret.input).to.equal(caver.ipfs.toHex(added))

        // Get a file from IPFS using the hash value recorded on the Klaytn network
        const catResult = await caver.ipfs.get(caver.ipfs.fromHex(ret.input))
        expect(catResult.compare(fileFromIPFS)).to.equal(0)

        fs.unlinkSync(testFileName)
    }).timeout(1000000)
})
