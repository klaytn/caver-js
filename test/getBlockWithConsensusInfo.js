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

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

const Caver = require('../index.js')
const testRPCURL = require('./testrpc')

const caver = new Caver(testRPCURL)

const { expect } = chai

function checkKeyExistence(info) {
    if (info === undefined) return false
    if (info.blockscore === undefined) return false
    if (info.committee === undefined) return false
    if (info.extraData === undefined) return false
    if (info.gasUsed === undefined) return false
    if (info.governanceData === undefined) return false
    if (info.hash === undefined) return false
    if (info.logsBloom === undefined) return false
    if (info.number === undefined) return false
    if (info.parentHash === undefined) return false
    if (info.proposer === undefined) return false
    if (info.receiptsRoot === undefined) return false
    if (info.reward === undefined) return false
    if (info.size === undefined) return false
    if (info.stateRoot === undefined) return false
    if (info.timestamp === undefined) return false
    if (info.timestampFoS === undefined) return false
    if (info.totalBlockScore === undefined) return false
    if (info.transactions === undefined) return false
    if (info.transactionsRoot === undefined) return false
    if (info.voteData === undefined) return false

    return true
}

describe('get block with consensus info', () => {
    it('Call on exist block', async () => {
        const blockInfo = await caver.klay.getBlockWithConsensusInfo(0)
        expect(checkKeyExistence(blockInfo)).to.equals(true)
        expect(blockInfo.committee).to.be.empty
        expect(blockInfo.gasUsed).to.equal('0x0')
        expect(blockInfo.number).to.equal('0x0')
    })

    it('Call on "genesis" block tag', async () => {
        caver.klay.defaultBlock = 'genesis'
        const blockInfo = await caver.klay.getBlockWithConsensusInfo()
        expect(checkKeyExistence(blockInfo)).to.equals(true)
        expect(blockInfo.committee).to.be.empty
        expect(blockInfo.gasUsed).to.equal('0x0')
        expect(blockInfo.number).to.equal('0x0')
    })

    it('Call on non-existent block', done => {
        caver.klay.getBlockNumber().then(currentBlock => {
            caver.klay
                .getBlockWithConsensusInfo(currentBlock + 10000)
                .then(() => done(false))
                .catch(() => done())
        })
    })

    it('committee should be empty on earliest blockInfo', async () => {
        const blockInfo = await caver.klay.getBlockWithConsensusInfo('earliest')
        expect(checkKeyExistence(blockInfo)).to.equals(true)
        expect(blockInfo.committee).to.be.empty
        expect(blockInfo.gasUsed).to.equal('0x0')
        expect(blockInfo.number).to.equal('0x0')
    })

    it('committee should be empty on genesis blockInfo', async () => {
        const blockInfo = await caver.klay.getBlockWithConsensusInfo('genesis')
        expect(checkKeyExistence(blockInfo)).to.equals(true)
        expect(blockInfo.committee).to.be.empty
        expect(blockInfo.gasUsed).to.equal('0x0')
        expect(blockInfo.number).to.equal('0x0')
    })

    it('should show latest blockInfo without error', async () => {
        const blockInfo = await caver.klay.getBlockWithConsensusInfo('latest')
        expect(checkKeyExistence(blockInfo)).to.equals(true)
        expect(blockInfo.committee).not.to.be.empty
    })

    it('should throw an error with `pending` parameter', done => {
        caver.klay
            .getBlockWithConsensusInfo('pending')
            .then(() => done(false))
            .catch(() => done())
    })

    it('should throw an error with invalid parameter', () => {
        const invalid = 'invalidParam'
        const expectedErrorMessage = `Given input "${invalid}" is not a number.`
        expect(() => caver.klay.getBlockWithConsensusInfo(invalid)).to.throw(expectedErrorMessage)
    })
})
