/*
    Copyright 2022 The caver-js Authors
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

const sandbox = sinon.createSandbox()

describe('get transaction', () => {
    afterEach(() => {
        sandbox.restore()
    })

    it('CAVERJS-UNIT-ETC-403: Use dedicated klaytnCall to send rpc request to their endpoint.', async () => {
        const caver = new Caver('https://api.baobab.klaytn.net:8651/')
        const caver2 = new Caver('https://public-node-api.klaytnapi.com/v1/cypress')

        const getChainIdStub1 = sandbox.stub(caver.rpc.klay.klaytnCall, 'getChainId')
        getChainIdStub1.resolves('0x3e9')
        const getChainIdStub2 = sandbox.stub(caver2.rpc.klay.klaytnCall, 'getChainId')
        getChainIdStub2.resolves('0x2019')

        const keyring = caver.wallet.keyring.generate()
        // Add to caver.wallet
        caver.wallet.add(keyring)

        // Create value transfer transaction
        const vt = caver.transaction.valueTransfer.create({
            from: keyring.address,
            to: caver.wallet.keyring.generate().address,
            value: caver.utils.toPeb(1, 'KLAY'),
            gas: 25000,
            gasPrice: caver.utils.toPeb(25, 'ston'),
            nonce: 0,
        })

        // Sign to the transaction
        await caver.wallet.sign(keyring.address, vt)

        expect(vt.chainId).to.equal('0x3e9')
        expect(getChainIdStub1).to.be.callCount(1)
        expect(getChainIdStub2).not.to.be.called
    }).timeout(10000)
})
