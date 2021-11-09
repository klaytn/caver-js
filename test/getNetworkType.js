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
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const Caver = require('../index')

const caver = new Caver('http://localhost:8551/')

const sandbox = sinon.createSandbox()

describe('getNetworkType', () => {
    afterEach(() => {
        sandbox.restore()
    })

    it('CAVERJS-UNIT-ETC-049: cypress mainnet should return "cypress"', async () => {
        const getIdStub = sandbox.stub(caver.klay.net, 'getId')
        getIdStub.resolves(8217)

        const getBlockStub = sandbox.stub(caver.klay, 'getBlock')
        getBlockStub.resolves({ hash: '0xc72e5293c3c3ba38ed8ae910f780e4caaa9fb95e79784f7ab74c3c262ea7137e' })

        const networkType = await caver.klay.net.getNetworkType()
        expect(networkType).to.equals('cypress')
    }).timeout(10000)

    it('CAVERJS-UNIT-ETC-050: baobab testnet should return "baobab"', async () => {
        const getIdStub = sandbox.stub(caver.klay.net, 'getId')
        getIdStub.resolves(1001)

        const getBlockStub = sandbox.stub(caver.klay, 'getBlock')
        getBlockStub.resolves({ hash: '0xe33ff05ceec2581ca9496f38a2bf9baad5d4eed629e896ccb33d1dc991bc4b4a' })

        const networkType = await caver.klay.net.getNetworkType()
        expect(networkType).to.equals('baobab')
    }).timeout(10000)
})
