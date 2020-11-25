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

chai.use(sinonChai)

const expect = chai.expect

const Caver = require('../index.js')
const testRPCURL = require('./testrpc')
const { Manager } = require('../packages/caver-core-requestmanager/src/index')
const { kip7JsonInterface } = require('../packages/caver-kct/src/kctHelper')

describe('setRequestManager', () => {
    it('CAVERJS-UNIT-ETC-203: should call setRequestManager with each pacakge instead of setProvider', () => {
        const setProviderSpy = sinon.spy(Manager.prototype, 'setProvider')

        const originalProvider = new Caver.providers.HttpProvider(testRPCURL)
        const caver = new Caver(originalProvider)

        expect(caver).not.to.be.undefined
        expect(setProviderSpy).to.have.been.calledOnce

        const contract = new caver.klay.Contract(kip7JsonInterface)

        expect(contract.currentProvider).to.deep.equals(originalProvider)
        expect(caver.klay.currentProvider).to.deep.equals(originalProvider)

        const setKlayRequestManager = sinon.spy(caver.klay, 'setRequestManager')
        const setNetRequestManager = sinon.spy(caver.klay.net, 'setRequestManager')
        const setPersonalRequestManager = sinon.spy(caver.klay.personal, 'setRequestManager')
        const setAccountsRequestManager = sinon.spy(caver.klay.accounts, 'setRequestManager')
        const setKlayProvider = sinon.spy(caver.klay, 'setProvider')

        const newProvider = new Caver.providers.HttpProvider('http://localhost:8551/')
        caver.klay.setProvider(newProvider)

        expect(setKlayRequestManager).to.have.been.calledOnce
        expect(setNetRequestManager).to.have.been.calledOnce
        expect(setPersonalRequestManager).to.have.been.calledOnce
        expect(setAccountsRequestManager).to.have.been.calledOnce
        expect(setKlayProvider).to.have.been.calledOnce
        expect(contract.currentProvider).to.deep.equals(newProvider)
        expect(caver.klay.currentProvider).to.deep.equals(newProvider)
    })
})
