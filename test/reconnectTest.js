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

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
chai.use(sinonChai)

const expect = chai.expect

const websocketURL = require('./testWebsocket')

const Caver = require('../index')

const sandbox = sinon.createSandbox()

describe('websocket reconnect', () => {
    it('CAVERJS-UNIT-ETC-251: if user did not define reconnect option, close the connection when connection is removed from remote peer', done => {
        const ws = new Caver.providers.WebsocketProvider(websocketURL)
        const caver = new Caver(ws)
        const reconnectSpy = sandbox.spy(caver.currentProvider, 'reconnect')
        expect(caver.currentProvider.reconnectOptions.auto).to.be.false

        setTimeout(() => {
            expect(reconnectSpy).not.to.have.been.called
            caver.currentProvider.connection.close()
            done()
        }, 90000)
    }).timeout(150000)

    it('CAVERJS-UNIT-ETC-252: if user defined reconnect option, reconnect the connection when connection is removed from remote peer', () => {
        const ws = new Caver.providers.WebsocketProvider(websocketURL, { reconnect: { auto: true } })
        const caver = new Caver(ws)
        const reconnectStub = sandbox.stub(caver.currentProvider, 'reconnect')
        expect(caver.currentProvider.reconnectOptions.auto).to.be.true

        caver.currentProvider.connection.close()
        expect(reconnectStub).to.have.been.called
    }).timeout(15000)
})
