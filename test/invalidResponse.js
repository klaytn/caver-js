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

const fetchMock = require('fetch-mock')
const { expect } = require('./extendedChai')
const Caver = require('../index')

describe('Connection error test', () => {
    it('CAVERJS-UNIT-ETC-051: return connection error.', async () => {
        const caver = new Caver(new Caver.providers.HttpProvider('invalid:1234'))

        await expect(caver.klay.getNodeInfo()).to.be.rejectedWith(Error, "CONNECTION ERROR: Couldn't connect to node invalid:1234.")
    })

    it('CAVERJS-UNIT-ETC-052: return invalid response error for non-json response.', async () => {
        const caver = new Caver(new Caver.providers.HttpProvider('/fetchMock'))

        fetchMock.mock('/fetchMock', 'Testing non-json format response')

        await expect(caver.klay.getChainId()).to.be.rejectedWith(Error, /Invalid JSON RPC response/)
        fetchMock.restore()
    })

    it('CAVERJS-UNIT-ETC-053: return timeout error.', async () => {
        const caver = new Caver(new Caver.providers.HttpProvider('/fetchMock', { timeout: 500 }))

        fetchMock.mock('/fetchMock', 'Testing non-json format response', { delay: 1000 })

        await expect(caver.klay.getChainId()).to.be.rejectedWith(Error, 'CONNECTION TIMEOUT: timeout of 500ms achived')
        fetchMock.restore()
    })
})
