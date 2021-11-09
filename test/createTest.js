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

const { expect } = require('./extendedChai')

const Caver = require('../index')
const testRPCURL = require('./testrpc')

let caver

beforeEach(() => {
    caver = new Caver(testRPCURL)
})

describe('caver.contract', () => {
    it('CAVERJS-UNIT-ETC-266: caver.contract.create method creates a Contract instance.', () => {
        const abi = [
            {
                constant: false,
                inputs: [{ name: '_id', type: 'uint256' }, { name: '_toList', type: 'address[]' }, { name: '_values', type: 'uint256[]' }],
                name: 'mint',
                outputs: [],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
            {
                constant: false,
                inputs: [{ name: '_id', type: 'uint256' }, { name: '_to', type: 'address' }, { name: '_value', type: 'uint256' }],
                name: 'mint',
                outputs: [],
                payable: false,
                stateMutability: 'nonpayable',
                type: 'function',
            },
        ]
        const created = caver.contract.create(abi)
        expect(created.constructor.name).to.equal('Contract')
        expect(created._wallet).not.to.be.undefined
    })
})

describe('caver.kct', () => {
    it('CAVERJS-UNIT-KCT-219: caver.kct.kip7.create method creates a KIP7 instance.', () => {
        const created = caver.kct.kip7.create()
        expect(created.constructor.name).to.equal('KIP7')
        expect(created._wallet).not.to.be.undefined
    })

    it('CAVERJS-UNIT-KCT-220: caver.kct.kip17.create method creates a KIP17 instance.', () => {
        const created = caver.kct.kip17.create()
        expect(created.constructor.name).to.equal('KIP17')
        expect(created._wallet).not.to.be.undefined
    })

    it('CAVERJS-UNIT-KCT-221: caver.kct.kip37.create method creates a KIP37 instance.', () => {
        const created = caver.kct.kip37.create()
        expect(created.constructor.name).to.equal('KIP37')
        expect(created._wallet).not.to.be.undefined
    })
})

describe('caver.transaction', () => {
    let baseObj

    beforeEach(() => {
        baseObj = {
            from: caver.wallet.keyring.generate().address,
            to: caver.wallet.keyring.generate().address,
            gas: 1000000,
            value: 1,
        }
    })

    it('CAVERJS-UNIT-TRANSACTION-391: caver.transaction.legacyTransaction.create method creates a LegacyTransaction instance.', () => {
        const created = caver.transaction.legacyTransaction.create(baseObj)
        expect(created.constructor.name).to.equal('LegacyTransaction')
    })

    it('CAVERJS-UNIT-TRANSACTION-392: caver.transaction.valueTransfer.create method creates a ValueTransfer instance.', () => {
        const created = caver.transaction.valueTransfer.create(baseObj)
        expect(created.constructor.name).to.equal('ValueTransfer')
    })

    it('CAVERJS-UNIT-TRANSACTIONFD-514: caver.transaction.feeDelegatedValueTransfer.create method creates a FeeDelegatedValueTransfer instance.', () => {
        const created = caver.transaction.feeDelegatedValueTransfer.create(baseObj)
        expect(created.constructor.name).to.equal('FeeDelegatedValueTransfer')
    })

    it('CAVERJS-UNIT-TRANSACTIONFDR-528: caver.transaction.feeDelegatedValueTransferWithRatio.create method creates a FeeDelegatedValueTransferWithRatio instance.', () => {
        baseObj.feeRatio = 30

        const created = caver.transaction.feeDelegatedValueTransferWithRatio.create(baseObj)
        expect(created.constructor.name).to.equal('FeeDelegatedValueTransferWithRatio')
    })

    it('CAVERJS-UNIT-TRANSACTION-393: caver.transaction.valueTransferMemo.create method creates a ValueTransferMemo instance.', () => {
        baseObj.input = '0x01'

        const created = caver.transaction.valueTransferMemo.create(baseObj)
        expect(created.constructor.name).to.equal('ValueTransferMemo')
    })

    it('CAVERJS-UNIT-TRANSACTIONFD-515: caver.transaction.feeDelegatedValueTransferMemo.create method creates a FeeDelegatedValueTransferMemo instance.', () => {
        baseObj.input = '0x01'

        const created = caver.transaction.feeDelegatedValueTransferMemo.create(baseObj)
        expect(created.constructor.name).to.equal('FeeDelegatedValueTransferMemo')
    })

    it('CAVERJS-UNIT-TRANSACTIONFDR-529: caver.transaction.feeDelegatedValueTransferMemoWithRatio.create method creates a FeeDelegatedValueTransferMemoWithRatio instance.', () => {
        baseObj.input = '0x01'
        baseObj.feeRatio = 30

        const created = caver.transaction.feeDelegatedValueTransferMemoWithRatio.create(baseObj)
        expect(created.constructor.name).to.equal('FeeDelegatedValueTransferMemoWithRatio')
    })

    it('CAVERJS-UNIT-TRANSACTION-394: caver.transaction.accountUpdate.create method creates a AccountUpdate instance.', () => {
        baseObj.account = caver.account.createWithAccountKeyLegacy(baseObj.from)
        delete baseObj.to
        delete baseObj.value

        const created = caver.transaction.accountUpdate.create(baseObj)
        expect(created.constructor.name).to.equal('AccountUpdate')
    })

    it('CAVERJS-UNIT-TRANSACTIONFD-516: caver.transaction.feeDelegatedAccountUpdate.create method creates a FeeDelegatedAccountUpdate instance.', () => {
        baseObj.account = caver.account.createWithAccountKeyLegacy(baseObj.from)
        delete baseObj.to
        delete baseObj.value

        const created = caver.transaction.feeDelegatedAccountUpdate.create(baseObj)
        expect(created.constructor.name).to.equal('FeeDelegatedAccountUpdate')
    })

    it('CAVERJS-UNIT-TRANSACTIONFDR-530: caver.transaction.feeDelegatedAccountUpdateWithRatio.create method creates a FeeDelegatedAccountUpdateWithRatio instance.', () => {
        baseObj.account = caver.account.createWithAccountKeyLegacy(baseObj.from)
        baseObj.feeRatio = 30
        delete baseObj.to
        delete baseObj.value

        const created = caver.transaction.feeDelegatedAccountUpdateWithRatio.create(baseObj)
        expect(created.constructor.name).to.equal('FeeDelegatedAccountUpdateWithRatio')
    })

    it('CAVERJS-UNIT-TRANSACTION-395: caver.transaction.smartContractDeploy.create method creates a SmartContractDeploy instance.', () => {
        baseObj.input = '0x01'
        delete baseObj.to

        const created = caver.transaction.smartContractDeploy.create(baseObj)
        expect(created.constructor.name).to.equal('SmartContractDeploy')
    })

    it('CAVERJS-UNIT-TRANSACTIONFD-517: caver.transaction.feeDelegatedSmartContractDeploy.create method creates a FeeDelegatedSmartContractDeploy instance.', () => {
        baseObj.input = '0x01'
        delete baseObj.to

        const created = caver.transaction.feeDelegatedSmartContractDeploy.create(baseObj)
        expect(created.constructor.name).to.equal('FeeDelegatedSmartContractDeploy')
    })

    it('CAVERJS-UNIT-TRANSACTIONFDR-531: caver.transaction.feeDelegatedSmartContractDeployWithRatio.create method creates a FeeDelegatedSmartContractDeployWithRatio instance.', () => {
        baseObj.input = '0x01'
        baseObj.feeRatio = 30
        delete baseObj.to

        const created = caver.transaction.feeDelegatedSmartContractDeployWithRatio.create(baseObj)
        expect(created.constructor.name).to.equal('FeeDelegatedSmartContractDeployWithRatio')
    })

    it('CAVERJS-UNIT-TRANSACTION-396: caver.transaction.smartContractExecution.create method creates a SmartContractExecution instance.', () => {
        baseObj.input = '0x01'

        const created = caver.transaction.smartContractExecution.create(baseObj)
        expect(created.constructor.name).to.equal('SmartContractExecution')
    })

    it('CAVERJS-UNIT-TRANSACTIONFD-518: caver.transaction.feeDelegatedSmartContractExecution.create method creates a FeeDelegatedSmartContractExecution instance.', () => {
        baseObj.input = '0x01'

        const created = caver.transaction.feeDelegatedSmartContractExecution.create(baseObj)
        expect(created.constructor.name).to.equal('FeeDelegatedSmartContractExecution')
    })

    it('CAVERJS-UNIT-TRANSACTIONFDR-532: caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create method creates a FeeDelegatedSmartContractExecutionWithRatio instance.', () => {
        baseObj.input = '0x01'
        baseObj.feeRatio = 30

        const created = caver.transaction.feeDelegatedSmartContractExecutionWithRatio.create(baseObj)
        expect(created.constructor.name).to.equal('FeeDelegatedSmartContractExecutionWithRatio')
    })

    it('CAVERJS-UNIT-TRANSACTION-397: caver.transaction.cancel.create method creates a Cancel instance.', () => {
        delete baseObj.to
        delete baseObj.value

        const created = caver.transaction.cancel.create(baseObj)
        expect(created.constructor.name).to.equal('Cancel')
    })

    it('CAVERJS-UNIT-TRANSACTIONFD-519: caver.transaction.feeDelegatedCancel.create method creates a FeeDelegatedCancel instance.', () => {
        delete baseObj.to
        delete baseObj.value

        const created = caver.transaction.feeDelegatedCancel.create(baseObj)
        expect(created.constructor.name).to.equal('FeeDelegatedCancel')
    })

    it('CAVERJS-UNIT-TRANSACTIONFDR-533: caver.transaction.feeDelegatedCancelWithRatio.create method creates a FeeDelegatedCancelWithRatio instance.', () => {
        delete baseObj.to
        delete baseObj.value
        baseObj.feeRatio = 30

        const created = caver.transaction.feeDelegatedCancelWithRatio.create(baseObj)
        expect(created.constructor.name).to.equal('FeeDelegatedCancelWithRatio')
    })

    it('CAVERJS-UNIT-TRANSACTION-398: caver.transaction.chainDataAnchoring.create method creates a ChainDataAnchoring instance.', () => {
        baseObj.input = '0x01'
        delete baseObj.to
        delete baseObj.value

        const created = caver.transaction.chainDataAnchoring.create(baseObj)
        expect(created.constructor.name).to.equal('ChainDataAnchoring')
    })

    it('CAVERJS-UNIT-TRANSACTIONFD-520: caver.transaction.feeDelegatedChainDataAnchoring.create method creates a FeeDelegatedChainDataAnchoring instance.', () => {
        baseObj.input = '0x01'
        delete baseObj.to
        delete baseObj.value

        const created = caver.transaction.feeDelegatedChainDataAnchoring.create(baseObj)
        expect(created.constructor.name).to.equal('FeeDelegatedChainDataAnchoring')
    })

    it('CAVERJS-UNIT-TRANSACTIONFDR-534: caver.transaction.feeDelegatedChainDataAnchoringWithRatio.create method creates a FeeDelegatedChainDataAnchoringWithRatio instance.', () => {
        baseObj.input = '0x01'
        delete baseObj.to
        delete baseObj.value
        baseObj.feeRatio = 30

        const created = caver.transaction.feeDelegatedChainDataAnchoringWithRatio.create(baseObj)
        expect(created.constructor.name).to.equal('FeeDelegatedChainDataAnchoringWithRatio')
    })
})
