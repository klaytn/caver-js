/*
    Copyright 2019 The caver-js Authors
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
const { expect } = require('chai')
const nock = require('nock')
const Caver = require('../index.js')
const testRPCURL = require('./testrpc')

const authorizationValue = 'WLRyv95rHM3urcccdS7v42tFElH7G7zG9sTeshf5'
const option = {
    headers: [{ name: 'Authorization', value: authorizationValue }],
}

describe('test Http Header', () => {
    before(() => {
        nock(testRPCURL)
            .post('/')
            .matchHeader('Authorization', value => value === authorizationValue)
            .reply(200, '{"jsonrpc":"2.0","id":1,"result":1001}')
    })
    after(() => {
        nock.restore()
    })

    it('should return networkId correctly', async () => {
        const caver = new Caver(new Caver.providers.HttpProvider(testRPCURL, option))
        const networkId = await caver.klay.net.getId()
        expect(networkId).to.exist
    })

    it('should return null when there is no Authorization value in header', async () => {
        const caver = new Caver(testRPCURL)
        return expect(caver.klay.net.getId()).to.be.rejected
    })
})
