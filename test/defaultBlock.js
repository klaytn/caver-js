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

const { expect } = require('chai')
const Caver = require('../index.js')
const testRPCURL = require('./testrpc')

const caver = new Caver(testRPCURL)

describe('caver.klay.defaultBlock', () => {
    // this.constructor.defaultBlock || 'latest'
    it('CAVERJS-UNIT-ETC-026 : defaultBlock should be latest if not set', async () => {
        expect(caver.klay.defaultBlock).to.equals('latest')
    })

    it('CAVERJS-UNIT-ETC-027 : defaultBlock should allow to set with earliest block tag', async () => {
        expect(() => {
            caver.klay.defaultBlock = 'earliest'
        }).not.to.throw()
    })

    it('CAVERJS-UNIT-ETC-028 : defaultBlock should return earliest block tag after setting defaultBlock with earliest', async () => {
        caver.klay.defaultBlock = 'earliest'
        expect(caver.klay.defaultBlock).to.equals('earliest')
    })

    it('CAVERJS-UNIT-ETC-029 : defaultBlock should allow to set with genesis block tag', async () => {
        expect(() => {
            caver.klay.defaultBlock = 'genesis'
        }).not.to.throw()
    })

    it('CAVERJS-UNIT-ETC-030 : defaultBlock should return genesis block tag after setting defaultBlock with genesis', async () => {
        caver.klay.defaultBlock = 'genesis'
        expect(caver.klay.defaultBlock).to.equals('genesis')
    })

    it('CAVERJS-UNIT-ETC-031 : defaultBlock should allow to set with latest block tag', async () => {
        expect(() => {
            caver.klay.defaultBlock = 'latest'
        }).not.to.throw()
    })

    it('CAVERJS-UNIT-ETC-032 : defaultBlock should return latest block tag after setting defaultBlock with latest', async () => {
        caver.klay.defaultBlock = 'latest'
        expect(caver.klay.defaultBlock).to.equals('latest')
    })

    it('CAVERJS-UNIT-ETC-033 : defaultBlock should allow to set with pending block tag', async () => {
        expect(() => {
            caver.klay.defaultBlock = 'pending'
        }).not.to.throw()
    })

    it('CAVERJS-UNIT-ETC-034 : defaultBlock should return pending block tag after setting defaultBlock with pending', async () => {
        caver.klay.defaultBlock = 'pending'
        expect(caver.klay.defaultBlock).to.equals('pending')
    })

    it('CAVERJS-UNIT-ETC-035 : defaultBlock should allow to set with valid block number', async () => {
        expect(() => {
            caver.klay.defaultBlock = 1
        }).not.to.throw()
    })

    it('CAVERJS-UNIT-ETC-036 : defaultBlock should allow to set with invalid block number', async () => {
        expect(() => {
            caver.klay.defaultBlock = 'invalidBlockNumber'
        }).to.throw()
    })
})
