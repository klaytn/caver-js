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

describe('get transaction count', () => {
    it('should not throw an error with "genesis" default block', async () => {
        const cnt = await caver.klay.getTransactionCount(caver.klay.accounts.create().address, 'genesis')
        expect(cnt).to.be.a('number')
    })

    it('should not throw an error with "earliest" default block', async () => {
        const cnt = await caver.klay.getTransactionCount(caver.klay.accounts.create().address, 'earliest')
        expect(cnt).to.be.a('number')
    })

    it('should not throw an error with "latest" default block', async () => {
        const cnt = await caver.klay.getTransactionCount(caver.klay.accounts.create().address, 'latest')
        expect(cnt).to.be.a('number')
    })

    it('should not throw an error with "pending" default block', async () => {
        const cnt = await caver.klay.getTransactionCount(caver.klay.accounts.create().address, 'pending')
        expect(cnt).to.be.a('number')
    })
})
