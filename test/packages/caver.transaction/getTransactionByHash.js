/*
    Copyright 2021 The caver-js Authors
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

const testRPCURL = require('../../testrpc')
const Caver = require('../../../index.js')

const AbstractTransaction = require('../../../packages/caver-transaction/src/transactionTypes/abstractTransaction')
const txSamples = require('./transactionSamples')

let caver
let getTransactionByHashSpy

const sandbox = sinon.createSandbox()

before(() => {
    caver = new Caver(testRPCURL)
    AbstractTransaction._klaytnCall = {
        getGasPrice: () => {},
        getTransactionCount: () => {},
        getChainId: () => {},
        getTransactionByHash: () => {},
    }
})

describe('caver.transaction.getTransactionByHash', () => {
    afterEach(() => {
        sandbox.restore()
    })

    context('legacyTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTION-399: should return a legacyTransaction instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.legacyTransaction)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.legacyTransaction.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeLegacyTransaction')
        })
    })

    context('valueTransfer', () => {
        it('CAVERJS-UNIT-TRANSACTION-400: should return a valueTransfer instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.valueTransfer)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.valueTransfer.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeValueTransfer')
        })

        it('CAVERJS-UNIT-TRANSACTION-401: should return a feeDelegatedValueTransfer instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedValueTransfer)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedValueTransfer.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedValueTransfer')
        })

        it('CAVERJS-UNIT-TRANSACTION-402: should return a feeDelegatedValueTransferWithRatio instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedValueTransferWithRatio)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedValueTransferWithRatio.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedValueTransferWithRatio')
        })
    })

    context('valueTransferMemo', () => {
        it('CAVERJS-UNIT-TRANSACTION-403: should return a valueTransferMemo instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.valueTransferMemo)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.valueTransferMemo.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeValueTransferMemo')
        })

        it('CAVERJS-UNIT-TRANSACTION-404: should return a feeDelegatedValueTransferMemo instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedValueTransferMemo)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedValueTransferMemo.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedValueTransferMemo')
        })

        it('CAVERJS-UNIT-TRANSACTION-405: should return a feeDelegatedValueTransferMemoWithRatio instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedValueTransferMemoWithRatio)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedValueTransferMemoWithRatio.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedValueTransferMemoWithRatio')
        })
    })

    context('accountUpdate', () => {
        it('CAVERJS-UNIT-TRANSACTION-406: should return a accountUpdate instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.accountUpdate)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.accountUpdate.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeAccountUpdate')
        })

        it('CAVERJS-UNIT-TRANSACTION-407: should return a feeDelegatedAccountUpdate instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedAccountUpdate)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedAccountUpdate.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedAccountUpdate')
        })

        it('CAVERJS-UNIT-TRANSACTION-408: should return a feeDelegatedAccountUpdateWithRatio instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedAccountUpdateWithRatio)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedAccountUpdateWithRatio.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedAccountUpdateWithRatio')
        })
    })

    context('smartContractDeploy', () => {
        it('CAVERJS-UNIT-TRANSACTION-409: should return a smartContractDeploy instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.smartContractDeploy)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.smartContractDeploy.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeSmartContractDeploy')
        })

        it('CAVERJS-UNIT-TRANSACTION-410: should return a feeDelegatedSmartContractDeploy instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedSmartContractDeploy)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedSmartContractDeploy.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedSmartContractDeploy')
        })

        it('CAVERJS-UNIT-TRANSACTION-411: should return a feeDelegatedSmartContractDeployWithRatio instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedSmartContractDeployWithRatio)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedSmartContractDeployWithRatio.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedSmartContractDeployWithRatio')
        })
    })

    context('smartContractExecution', () => {
        it('CAVERJS-UNIT-TRANSACTION-412: should return a smartContractExecution instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.smartContractExecution)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.smartContractExecution.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeSmartContractExecution')
        })

        it('CAVERJS-UNIT-TRANSACTION-413: should return a feeDelegatedSmartContractExecution instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedSmartContractExecution)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedSmartContractExecution.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedSmartContractExecution')
        })

        it('CAVERJS-UNIT-TRANSACTION-414: should return a feeDelegatedSmartContractExecutionWithRatio instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedSmartContractExecutionWithRatio)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedSmartContractExecutionWithRatio.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedSmartContractExecutionWithRatio')
        })
    })

    context('cancel', () => {
        it('CAVERJS-UNIT-TRANSACTION-415: should return a cancel instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.cancel)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.cancel.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeCancel')
        })

        it('CAVERJS-UNIT-TRANSACTION-416: should return a feeDelegatedCancel instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedCancel)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedCancel.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedCancel')
        })

        it('CAVERJS-UNIT-TRANSACTION-417: should return a feeDelegatedCancelWithRatio instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedCancelWithRatio)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedCancelWithRatio.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedCancelWithRatio')
        })
    })

    context('chainDataAnchoring', () => {
        it('CAVERJS-UNIT-TRANSACTION-418: should return a chainDataAnchoring instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.chainDataAnchoring)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.chainDataAnchoring.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeChainDataAnchoring')
        })

        it('CAVERJS-UNIT-TRANSACTION-419: should return a feeDelegatedChainDataAnchoring instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedChainDataAnchoring)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedChainDataAnchoring.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedChainDataAnchoring')
        })

        it('CAVERJS-UNIT-TRANSACTION-420: should return a feeDelegatedChainDataAnchoringWithRatio instance', async () => {
            getTransactionByHashSpy = sandbox.stub(AbstractTransaction._klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedChainDataAnchoringWithRatio)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedChainDataAnchoringWithRatio.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedChainDataAnchoringWithRatio')
        })
    })
})
