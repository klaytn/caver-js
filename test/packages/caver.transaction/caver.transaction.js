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
const Caver = require('../../../index')

const txSamples = require('./transactionSamples')

let caver
let getTransactionByHashSpy

const sandbox = sinon.createSandbox()

before(() => {
    caver = new Caver(testRPCURL)
})

describe('caver.transaction.getTransactionByHash', () => {
    afterEach(() => {
        sandbox.restore()
    })

    context('legacyTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTION-399: should return a legacyTransaction instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.legacyTransaction)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.legacyTransaction.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeLegacyTransaction')
        })
    })

    context('valueTransfer', () => {
        it('CAVERJS-UNIT-TRANSACTION-400: should return a valueTransfer instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.valueTransfer)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.valueTransfer.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeValueTransfer')
        })

        it('CAVERJS-UNIT-TRANSACTION-401: should return a feeDelegatedValueTransfer instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedValueTransfer)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedValueTransfer.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedValueTransfer')
        })

        it('CAVERJS-UNIT-TRANSACTION-402: should return a feeDelegatedValueTransferWithRatio instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedValueTransferWithRatio)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedValueTransferWithRatio.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedValueTransferWithRatio')
        })
    })

    context('valueTransferMemo', () => {
        it('CAVERJS-UNIT-TRANSACTION-403: should return a valueTransferMemo instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.valueTransferMemo)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.valueTransferMemo.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeValueTransferMemo')
        })

        it('CAVERJS-UNIT-TRANSACTION-404: should return a feeDelegatedValueTransferMemo instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedValueTransferMemo)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedValueTransferMemo.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedValueTransferMemo')
        })

        it('CAVERJS-UNIT-TRANSACTION-405: should return a feeDelegatedValueTransferMemoWithRatio instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedValueTransferMemoWithRatio)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedValueTransferMemoWithRatio.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedValueTransferMemoWithRatio')
        })
    })

    context('accountUpdate', () => {
        it('CAVERJS-UNIT-TRANSACTION-406: should return a accountUpdate instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.accountUpdate)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.accountUpdate.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeAccountUpdate')
        })

        it('CAVERJS-UNIT-TRANSACTION-407: should return a feeDelegatedAccountUpdate instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedAccountUpdate)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedAccountUpdate.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedAccountUpdate')
        })

        it('CAVERJS-UNIT-TRANSACTION-408: should return a feeDelegatedAccountUpdateWithRatio instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedAccountUpdateWithRatio)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedAccountUpdateWithRatio.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedAccountUpdateWithRatio')
        })
    })

    context('smartContractDeploy', () => {
        it('CAVERJS-UNIT-TRANSACTION-409: should return a smartContractDeploy instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.smartContractDeploy)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.smartContractDeploy.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeSmartContractDeploy')
        })

        it('CAVERJS-UNIT-TRANSACTION-410: should return a feeDelegatedSmartContractDeploy instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedSmartContractDeploy)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedSmartContractDeploy.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedSmartContractDeploy')
        })

        it('CAVERJS-UNIT-TRANSACTION-411: should return a feeDelegatedSmartContractDeployWithRatio instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedSmartContractDeployWithRatio)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedSmartContractDeployWithRatio.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedSmartContractDeployWithRatio')
        })
    })

    context('smartContractExecution', () => {
        it('CAVERJS-UNIT-TRANSACTION-412: should return a smartContractExecution instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.smartContractExecution)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.smartContractExecution.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeSmartContractExecution')
        })

        it('CAVERJS-UNIT-TRANSACTION-413: should return a feeDelegatedSmartContractExecution instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedSmartContractExecution)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedSmartContractExecution.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedSmartContractExecution')
        })

        it('CAVERJS-UNIT-TRANSACTION-414: should return a feeDelegatedSmartContractExecutionWithRatio instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedSmartContractExecutionWithRatio)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedSmartContractExecutionWithRatio.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedSmartContractExecutionWithRatio')
        })
    })

    context('cancel', () => {
        it('CAVERJS-UNIT-TRANSACTION-415: should return a cancel instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.cancel)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.cancel.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeCancel')
        })

        it('CAVERJS-UNIT-TRANSACTION-416: should return a feeDelegatedCancel instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedCancel)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedCancel.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedCancel')
        })

        it('CAVERJS-UNIT-TRANSACTION-417: should return a feeDelegatedCancelWithRatio instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedCancelWithRatio)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedCancelWithRatio.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedCancelWithRatio')
        })
    })

    context('chainDataAnchoring', () => {
        it('CAVERJS-UNIT-TRANSACTION-418: should return a chainDataAnchoring instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.chainDataAnchoring)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.chainDataAnchoring.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeChainDataAnchoring')
        })

        it('CAVERJS-UNIT-TRANSACTION-419: should return a feeDelegatedChainDataAnchoring instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedChainDataAnchoring)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedChainDataAnchoring.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedChainDataAnchoring')
        })

        it('CAVERJS-UNIT-TRANSACTION-420: should return a feeDelegatedChainDataAnchoringWithRatio instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.feeDelegatedChainDataAnchoringWithRatio)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.feeDelegatedChainDataAnchoringWithRatio.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeFeeDelegatedChainDataAnchoringWithRatio')
        })
    })

    context('ethereumAccessList', () => {
        it('CAVERJS-UNIT-TRANSACTION-552: should return an ethereumAccessList instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.ethereumAccessList)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.ethereumAccessList.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeEthereumAccessList')
        })
    })

    context('ethereumDynamicFee', () => {
        it('CAVERJS-UNIT-TRANSACTION-553: should return an ethereumDynamicFee instance', async () => {
            getTransactionByHashSpy = sandbox.stub(caver.transaction.klaytnCall, 'getTransactionByHash')
            getTransactionByHashSpy.returns(txSamples.ethereumDynamicFee)

            const txObj = await caver.transaction.getTransactionByHash(txSamples.ethereumDynamicFee.hash)

            expect(getTransactionByHashSpy).to.have.been.called
            expect(txObj.type).to.equal('TxTypeEthereumDynamicFee')
        })
    })
})

describe('caver.transaction.recoverPublicKeys and caver.transaction.recoverFeePayerPublicKeys', () => {
    const expectedPublicKeyArray = [
        '0x8bb6aaeb2d96d024754d3b50babf116cece68977acbe8ba6a66f14d5217c60d96af020a0568661e7c72e753e80efe084a3aed9f9ac87bf44d09ce67aad3d4e01',
        '0xc7751c794337a93e4db041fb5401c2c816cf0a099d8fd4b1f3f555aab5dfead2417521bb0c03d8637f350df15ef6a6cb3cdb806bd9d10bc71982dd03ff5d9ddd',
        '0x3919091ba17c106dd034af508cfe00b963d173dffab2c7702890e25a96d107ca1bb4f148ee1984751e57d2435468558193ce84ab9a7731b842e9672e40dc0f22',
    ]
    const expectedSenderPublicKeyArray = [
        '0xfbda4ac2c04336609f7e5a363c71c1565b442d552b82cbd0e75bbabaf215fd28b69ce88a6b9f2a463f1420bd9a0992413254748a7ab46d5ba78d09b35cf0e912',
        '0xa234bd09ea829cb39dd2f5aced2318039f30ce5fe28f5eb28a256bac8617eb5db57ac7683fa21a01c8cbd2ca31c2cf93c97871c73896bf051f9bc0885c87ebe2',
        '0x6ed39def6b25fc001790d267922281483c372b5d2486ae955ece1f1b64b19aea85392c8555947a1c63577439afdb74c77ef07d50520435d31cf4afb3dfe0074f',
    ]
    const expectedFeePayerPublicKeyArray = [
        '0x2b557d80ddac3a0bbcc8a7861773ca7434c969e2721a574bb94a1e3aa5ceed3819f08a82b31682c038f9f691fb38ee4aaf7e016e2c973a1bd1e48a51f60a54ea',
        '0x1a1cfe1e2ec4b15520c57c20c2460981a2f16003c8db11a0afc282abf929fa1c1868f60f91b330c423aa660913d86acc2a0b1b15e7ba1fe571e5928a19825a7e',
        '0xdea23a89dbbde1a0c26466c49c1edd32785432389641797038c2b53815cb5c73d6cf5355986fd9a22a68bb57b831857fd1636362b383bd632966392714b60d72',
    ]

    context('legacyTransaction', () => {
        it('CAVERJS-UNIT-TRANSACTION-429: recoverPublciKeys should recover public keys from signatures', async () => {
            const rawTx =
                '0xf868808505d21dba008402faf0809459177716c34ac6e49e295a0e78e33522f14d61ee0180820fe9a0ecdec357060dbbb4bd3790e98b1733ec3a0b02b7e4ec7a5622f93cd9bee229fea00a4a5e28753e7c1d999b286fb07933c5bf353079b8ed4d1ed509a838b48be02c'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)

            expect(publicKeys[0].toLowerCase()).to.equal(expectedPublicKeyArray[0])
        })
    })

    context('valueTransfer', () => {
        it('CAVERJS-UNIT-TRANSACTION-430: recoverPublciKeys should recover public keys from signatures', async () => {
            const rawTx =
                '0x08f9010e808505d21dba008402faf0809459177716c34ac6e49e295a0e78e33522f14d61ee0194f21460730845e3652aa3cc9bc13b345e4f53984af8d5f845820feaa02b5934c6d26bb3e65edf099d79c57c743d2f70744ca09d3ba9a1099edff9f173a00797886edff4b449c1a599943e3a6003ae9e46b3f3f34862ced327e43fba3a6af845820fe9a063177648732ef855f800eb9f80f68501abb507f84c0d660286a6e0801334a1d2a0620a996623c114f2df35b11ec8ac4f3758d3ad89cf81ba13614e51908cfe9218f845820fe9a086c8ecbfd892be41d48443a2243274beb6daed3f72895045965a3baede4c350ea069ea748aff6e4c106d3a8ba597d8f134745b76f12dacb581318f9da07351511a'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('valueTransferMemo', () => {
        it('CAVERJS-UNIT-TRANSACTION-431: recoverPublciKeys should recover public keys from signatures', async () => {
            const rawTx =
                '0x10f90114808505d21dba008402faf0809459177716c34ac6e49e295a0e78e33522f14d61ee0194f21460730845e3652aa3cc9bc13b345e4f53984a8568656c6c6ff8d5f845820feaa011a1ccec9b1bd489c46f1fc34e102be17355ebd373048ef458fd57e4e5df7e8fa0124e8a23b6316f1e308aed1daed99d991bf40ea16b8a146dce464c1c0462d0cbf845820feaa0fb4bb3b834ddb9d3d3dd0aed8fa0565f8fa4dd12a10a1e2c43a23ba58b254d23a05e3ee8d665a5d1097654149976963fbb8224e96c05cf7846ee3b511f75e633b4f845820fe9a0f7df849f0f2bf4c4743465c2049830b2a27b143bb2799ad211d2a6e07fc83899a05ccef241bcbe6c25d8affbacfb8fe02e5971cd32980ff2df2e627696d6368162'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('accountUpdate', () => {
        it('CAVERJS-UNIT-TRANSACTION-432: recoverPublciKeys should recover public keys from signatures', async () => {
            const rawTx =
                '0x20f8fb808505d21dba008402faf08094f21460730845e3652aa3cc9bc13b345e4f53984a8201c0f8d5f845820feaa084299d74e8b491d7272d86b5ff4f4f4605830406befd360c90adaae56af99359a0196240cda43810ba4c19dd865435b991a9c16a91859357777594fb9e77d02d01f845820feaa0af27d2163b85e3de5f8b7fee56df509be231d3935890515bfe783e2f38c1c092a01b5d6ff80bd3964ce311c658cdeac0e43a2171a87bb287695c9be2b3517651e9f845820feaa0f17ec890c3eeae90702f811b4bb880c6631913bb307207bf0bccbcdc229f571aa06f2f203218cc8ddbab785cd59dec47105c7919ab4192295c8307c9a0701605ed'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('smartContractDeploy', () => {
        it('CAVERJS-UNIT-TRANSACTION-433: recoverPublciKeys should recover public keys from signatures', async () => {
            const rawTx =
                '0x28f9030d808505d21dba008402faf080800194f21460730845e3652aa3cc9bc13b345e4f53984ab9020e60806040526000805534801561001457600080fd5b506101ea806100246000396000f30060806040526004361061006d576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd1461007257806342cbb15c1461009d578063767800de146100c8578063b22636271461011f578063d14e62b814610150575b600080fd5b34801561007e57600080fd5b5061008761017d565b6040518082815260200191505060405180910390f35b3480156100a957600080fd5b506100b2610183565b6040518082815260200191505060405180910390f35b3480156100d457600080fd5b506100dd61018b565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561012b57600080fd5b5061014e60048036038101908080356000191690602001909291905050506101b1565b005b34801561015c57600080fd5b5061017b600480360381019080803590602001909291905050506101b4565b005b60005481565b600043905090565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b50565b80600081905550505600a165627a7a7230582053c65686a3571c517e2cf4f741d842e5ee6aa665c96ce70f46f9a594794f11eb00298080f8d5f845820fe9a0feebbc3a1f22a6ee05ec661f2e25136c1f21923bf9208ee2b271884cf78d88d4a0391afac91aa0353cbab0701d412e520e7c1adba4d3283cc0dd4ea6a30f5df698f845820fe9a0ddef5cd655e17979ce2252c30a54d385b34d81bfa636ab269c3d998026bbe9aca05aa38b9ebca9840fd195e6d5ff6200e66c8cd5e455ccab4d90c84a34bf51851af845820feaa09dd8f9110795b3fda8e924054e9d928e8b00bdf4c51fce70ac3981b231463003a0596f184a3fbead7bfa362cc2ca4d932ce2fc622a70e02beddac1c7a394b26e27'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('smartContractExecution', () => {
        it('CAVERJS-UNIT-TRANSACTION-434: recoverPublciKeys should recover public keys from signatures', async () => {
            const rawTx =
                '0x30f90154808505d21dba008402faf0809459177716c34ac6e49e295a0e78e33522f14d61ee0194f21460730845e3652aa3cc9bc13b345e4f53984ab844d95aced7000000000000000000000000640a4c021cb5889fa1d37378f04a36ad452862240000000000000000000000000000000000000000000000000000000000000001f8d5f845820fe9a0d544476d9d0cadad0f5d6aea6f487d56299166af7b0c372459674a6f05ffcdd7a077842050ad1b259b3ba53165784ec38ac0bfc5e1c4efb7a5cc0524cfc5e62ef2f845820fe9a010eae9aac3bb49e5ff86e69cf06ae8694f94660317adf8f43f906ad52072a5f6a0212130f92da5e832ac94565f245930b58aeed65775339b4aaae091971741c6e5f845820fe9a0c63d6be7f19c43d529d90dfe317db3cc5bee27f54c9141ae86e771b06756f528a03bf1621074fdad4c37c7575a76bde0e937d8e72db914df87080d35763dea4567'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('cancel', () => {
        it('CAVERJS-UNIT-TRANSACTION-435: recoverPublciKeys should recover public keys from signatures', async () => {
            const rawTx =
                '0x38f8f8808505d21dba008402faf08094f21460730845e3652aa3cc9bc13b345e4f53984af8d5f845820feaa0ac0efc65393b4136e474c8185af7f44491e797d8aa2e07d6853703c4efdbf7dca03691224986fec26012fe329f6bed56c6964a3d4f3bc8ff704131970735cd0a2ff845820feaa004f1bbc8767546157bdae445b7e88722c0f94a29efa47d1a3d2241954c3bc816a05701a35937563b3a7542c5766a6218698424c60c0a63b8e463ba88b21e6dbee3f845820feaa0b1f2d463eee52f6f03f3a5320eb863f964a89b1fdc466ccc93ae22b96044e6efa03ea104cc4de8f071d9b5cc3da4197b3299408d7da44e8359bb7b36fde9bf3b30'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('chainDataAnchoring', () => {
        it('CAVERJS-UNIT-TRANSACTION-436: recoverPublciKeys should recover public keys from signatures', async () => {
            const rawTx =
                '0x48f8f9808505d21dba008402faf08094f21460730845e3652aa3cc9bc13b345e4f53984a01f8d5f845820fe9a0a39cf5423469b5a5b86e33b5524646385ceff9f668e3df9896f8415075244cb2a018e29b0ef01370561703f6dfd56982ec17fdc29a6b2e3c42ee44947f2fc475b8f845820feaa0911a055d5e29205086dbe7847fe0a916ad636b861f3eaf70a8ea7f24b6205e25a05d01c8c0f3e8797ac2bd8e18795bd78f0682c6eabfa197061059e37daa2709d0f845820fe9a065a8769cb8363a9ba20f82ee5cbc4f57dd0cbf315361354d5e009963f2c47d99a02e39afc5004f8d65954568f8143bbaa1a8fb8fca0e981b513ee41308a46d5988'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('feeDelegatedValueTransfer', () => {
        it('CAVERJS-UNIT-TRANSACTIONFD-535: recoverPublciKeys should recover public keys and recoverFeePayerPublicKeys should recover fee payer public keys', async () => {
            const rawTx =
                '0x09f901fa808505d21dba008402faf0809459177716c34ac6e49e295a0e78e33522f14d61ee019407a9a76ef778676c3bd2b334edcf581db31a85e5f8d5f845820feaa0cb2bbf04a12ec3a06163c30ce8782739ec4745a53e265aa9443f1c0d678bb871a07dd348c7d8fce6be36b661f116973d1c36cc92a389ad4a1a4053bd486060a083f845820fe9a06d5dfca992d6833c0da272578bc6ea941be45f44fb2fa114310ebe18d673ed52a04dc5cd7985c9ce7d44d46d65e65c995a4a8c97159a1eed8b2efb0510b981ab7cf845820feaa0945151edf556fbcebf832092d4534b9a3b1f3d46f85bce09e7d7211070cb57bea01617c8f918f96970baddd12f240a9824eca6b29d91eb7333adacb987f2dcd8dd94b5db72925b1b6b79299a1a49ae226cd7861083acf8d5f845820feaa086fd17d788e89a6e0639395b3c0a04f916103debd6cbe639d6f4ff5034dde3e8a00795551c551d9096234c290689767f34f2d409c95166ab18d216dbc93845ba16f845820feaa00653b6d1cdb90462094b089ce8e2fed0e3b8ec2c44125965e1a5af286644c758a0259b10e3bf594d48535fd0d95e15d095897c8d075c01dd56e7417d5943b0d53af845820fe9a0ce8d051427adab10d1dc93de49123aeab18ba8aadedce0d57ef5b7fa451b1f4fa04fe2a845d92ff48abca3e1d59637fab5f4a4e3172d91772d9bfce60760edc506'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)
            const feePayerPublicKeys = caver.transaction.recoverFeePayerPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedSenderPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedSenderPublicKeyArray[i].toLowerCase())
            }

            expect(feePayerPublicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
            for (let i = 0; i < feePayerPublicKeys.length; i++) {
                expect(feePayerPublicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('feeDelegatedValueTransferMemo', () => {
        it('CAVERJS-UNIT-TRANSACTIONFD-536: recoverPublciKeys should recover public keys and recoverFeePayerPublicKeys should recover fee payer public keys', async () => {
            const rawTx =
                '0x11f90200808505d21dba008402faf0809459177716c34ac6e49e295a0e78e33522f14d61ee019407a9a76ef778676c3bd2b334edcf581db31a85e58568656c6c6ff8d5f845820fe9a0c00f56ab3f8c02b16c720137d96d2eeb0259cba50826d6e173df34388354a232a009aedb74fb9e01f8705c8eef6311b8e3f34bade2660bb110f1a73fa3b2782883f845820fe9a0ba7ced7cb6b115187a6ca7f12b801108e5b90c7a207048b0e8aa70cbcdb72092a016beed3e1e075c7898d3adb69ae873b4cbb394a8a90ea5add0ecb34c67561d6ff845820fe9a020527b9a720529e98691351d4522053bd8bce18031142a6dd6026137e3dd41eda072c2a17f9f2795723a41c7bd875bdc5bb1d4e0ca8f3e559d27b33165d73fab0994b5db72925b1b6b79299a1a49ae226cd7861083acf8d5f845820feaa0a7d87ac3adc04ef6a8fffdfc0f6ab97850b12ab398746c1e440a61e981d23a62a04a15edc69d8311e7431cd29b4f4476eff407a1290e8bc7f5f2a314a55de1727ff845820feaa074d1d0b351e47116a74287ee502f4c8281e6170050a6279b3b414ae4a230c610a003b43231b264086f4a8592458637c765e124bf091352f4e49647e8497000bd52f845820fe9a0675c8961d9c1036bfd1a6f04caf5894f42793c122674f4fd6164a5284f3da2bba04b891e4f9a418115ecf3060157bccb1fa6b734f2f84ab703441c7cac727318b4'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)
            const feePayerPublicKeys = caver.transaction.recoverFeePayerPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedSenderPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedSenderPublicKeyArray[i].toLowerCase())
            }

            expect(feePayerPublicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
            for (let i = 0; i < feePayerPublicKeys.length; i++) {
                expect(feePayerPublicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('feeDelegatedAccountUpdate', () => {
        it('CAVERJS-UNIT-TRANSACTIONFD-537: recoverPublciKeys should recover public keys and recoverFeePayerPublicKeys should recover fee payer public keys', async () => {
            const rawTx =
                '0x21f901e7808505d21dba008402faf0809407a9a76ef778676c3bd2b334edcf581db31a85e58201c0f8d5f845820fe9a0a849d233748e341d955a9008f88871e2ec618599f3a09a7722b812608b8c2c37a05772746c507f8b057db00d5b6b6cd0e26a41b4b6a19bfe977f3c914194753ddef845820fe9a0c11c4db571c74b4963ac76ad8e5233102e232e05ee5fe1454597bc4d1210cf53a059120cb8228dc6248b166ffa56e5743655805640bd6683b6a86b03910afad093f845820fe9a012d280c22eb1fa66a92fa2b0cf88f4ffc30dc9bacc24adbe57cbf3aecd4607bea0472d256d3b5ed5527ccec6ac719d68ed70ce2b29b741538bdee137102d4df96894b5db72925b1b6b79299a1a49ae226cd7861083acf8d5f845820feaa04cac4b47e5ba0b7898e56e3c645e5395fc241d1f2ccfb4c9f7c790dd7e5e26c0a0608f3efed06c61842737439de237153ed79b6692eaa801e814ff985cf4bf6a87f845820feaa0a7d3617041789846c16ae1f9fc0c6661421bf5fb39d3f4580a3dadd08b2cf96ca03f74439b085d7cd13898598c40faa4643c9ee1f2b6b0d43ec6cb4e1a72f1391ef845820feaa0ab3dec0d7f92b764041efd5b0551317374a109cbeb527e0483aacf5d5f0770c1a07cc7c2b88dc03bc3d3f85f610a87de867d828b66d41cc6d856e2299a463b73d4'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)
            const feePayerPublicKeys = caver.transaction.recoverFeePayerPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedSenderPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedSenderPublicKeyArray[i].toLowerCase())
            }

            expect(feePayerPublicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
            for (let i = 0; i < feePayerPublicKeys.length; i++) {
                expect(feePayerPublicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('feeDelegatedSmartContractDeploy', () => {
        it('CAVERJS-UNIT-TRANSACTIONFD-538: recoverPublciKeys should recover public keys and recoverFeePayerPublicKeys should recover fee payer public keys', async () => {
            const rawTx =
                '0x29f903f9808505d21dba008402faf080800194f21460730845e3652aa3cc9bc13b345e4f53984ab9020e60806040526000805534801561001457600080fd5b506101ea806100246000396000f30060806040526004361061006d576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd1461007257806342cbb15c1461009d578063767800de146100c8578063b22636271461011f578063d14e62b814610150575b600080fd5b34801561007e57600080fd5b5061008761017d565b6040518082815260200191505060405180910390f35b3480156100a957600080fd5b506100b2610183565b6040518082815260200191505060405180910390f35b3480156100d457600080fd5b506100dd61018b565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561012b57600080fd5b5061014e60048036038101908080356000191690602001909291905050506101b1565b005b34801561015c57600080fd5b5061017b600480360381019080803590602001909291905050506101b4565b005b60005481565b600043905090565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b50565b80600081905550505600a165627a7a7230582053c65686a3571c517e2cf4f741d842e5ee6aa665c96ce70f46f9a594794f11eb00298080f8d5f845820feaa0dbc279377e1b3433877016cfa42894900a74d6f7062bca8d5b68c7db99ac2795a0511a93e0d98c4f720bf7d893345fdab67a197ec3e71448be891fe2f8f9add753f845820feaa097aa0af42193e293913bae7ac5dff8aaf92a68f897e2355398577fe9ccc240a7a023c342168aeb7ea53667524c55f36ad66a084c9e262d770cd32265a628d45929f845820feaa0a01c3ae994dda394d53d1e6a1029944ad11aa5a763893f5208d9f3912d9a245ea00e9f1987785e20340c9ff0c8a7a5a8f37ebd7bf5b90f21d09fd177da7579df0c94b5db72925b1b6b79299a1a49ae226cd7861083acf8d5f845820fe9a0895807ee1347b54531797bb31a4c1800be1939eb9583d97473b4b007b01c896aa03fc1999eaf5cb3840fa45b6da381f639f3cd13817bb2b59fb46e414458e2152bf845820feaa0fcd35961923b1b2fb7af425acece62420eb1b829adb55c7ccb942f7c399ee13da06aa4f7503fe960eed60758b1fc981ad6dd56088b14f4ff92e356f8a0073c1701f845820fe9a04a819e9a29ad3e55a121bf45648a10f771b8785e231636b7db7918e82f93242ba0578eecb0fdb10c942404907fd960c4e7b6ed381525ca1d945bca3af532260e0f'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)
            const feePayerPublicKeys = caver.transaction.recoverFeePayerPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedSenderPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedSenderPublicKeyArray[i].toLowerCase())
            }

            expect(feePayerPublicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
            for (let i = 0; i < feePayerPublicKeys.length; i++) {
                expect(feePayerPublicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('feeDelegatedSmartContractExecution', () => {
        it('CAVERJS-UNIT-TRANSACTIONFD-539: recoverPublciKeys should recover public keys and recoverFeePayerPublicKeys should recover fee payer public keys', async () => {
            const rawTx =
                '0x31f90240808505d21dba008402faf0809459177716c34ac6e49e295a0e78e33522f14d61ee0194f21460730845e3652aa3cc9bc13b345e4f53984ab844d95aced7000000000000000000000000640a4c021cb5889fa1d37378f04a36ad452862240000000000000000000000000000000000000000000000000000000000000001f8d5f845820fe9a042f52da40e7648cec0eb5d7f84bc5b3c4218bfc5d8056476af620e1e42cb63a5a0478057f9e32cdc46b57be7c5022a6d81f61e07b515481332df3479662084affff845820feaa06e2d666a01df1804531c0da5cc25a3ddfcb99d506110a2c1fe2a21b09e94c562a019c980243caec5d9f008be963d600d904ea3aa9ac8c453acc0d137f05b171607f845820fe9a0cefeda599c36faffa7241e217230c6af1c87f69dd1360673c382f2529a8ab044a06c3da66cd9bcd4cdf3a854da2b30ce36449554cac771aaaf4c70047906b0cd8994b5db72925b1b6b79299a1a49ae226cd7861083acf8d5f845820fe9a027cb27294a4a7f7fb9c1aa30348ee6b591412cfcefe4f0c28dbebdd290970703a0750c5466ec44e07ac67c8950b4150a654503ca13e451508595711c1b83b44d8af845820feaa02b672a1f4ddac03256bcecb96b834ecc0e74430b787f722ba610f3f270d9e8a1a00e10fa45ae7f06989ef1facd543458c24f37cd8d38d9a937d18a6d39dbcf82adf845820feaa0ef6acf5c104eaf67dbd9b8de636362c0fb9445f979d948f50a95fab7a16f3d62a02bfb69ad74351e9a17d529cb186df78a1e7431d3575384986aa130b233aa24d8'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)
            const feePayerPublicKeys = caver.transaction.recoverFeePayerPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedSenderPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedSenderPublicKeyArray[i].toLowerCase())
            }

            expect(feePayerPublicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
            for (let i = 0; i < feePayerPublicKeys.length; i++) {
                expect(feePayerPublicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('feeDelegatedCancel', () => {
        it('CAVERJS-UNIT-TRANSACTIONFD-540: recoverPublciKeys should recover public keys and recoverFeePayerPublicKeys should recover fee payer public keys', async () => {
            const rawTx =
                '0x39f901e4808505d21dba008402faf08094f21460730845e3652aa3cc9bc13b345e4f53984af8d5f845820fe9a028ea52ee79b54fa321551689d4be9b932de1171ef239345953803c14576e10a1a011cb13643552c8a73d566a2e5dea8ed95c0173afef2842e3835fc67ba0bea411f845820feaa06b8597441a8e1fe98a9f76bd75bafea8d0f0af2fcaadf5a8f31244e923fc5bd3a07e865b1b7858866f748ac288bf5547d31d3e92ee27024c1c0c5050f03ae470f9f845820fe9a01180d0ed68f60a9af4c65264dd6dc9d91cb63fa967d6c7ec7b8e79e556ba16baa07039807b648fd82799637ac0190bd8caa3945d856cbe73a34ca549d9e2ec6f9994b5db72925b1b6b79299a1a49ae226cd7861083acf8d5f845820fe9a09a82ffdca6d654b9e65de5bab227bd4dd72c0c9e0e56e4035f2ce500b0eef297a00d28d0727d497e26f6356ad943b773b14860a66b8a8b45659692254073916715f845820feaa036f0a2ae5dd31fb23d9e3c6991a39bf926cf4eabb268253e9e42ae909ef60ca6a0283c87a0bb5a38de39c6cba969ea487c7c0df3f3af1873b7058e1c7aa3a1d725f845820fe9a02a3e055bd00aa863007b165d70749639fe26e15810dc4359c1e71bd9fe6a6b86a04a7cc2f1ba8ec721ed055cbc5dd8ebf58c9aa457c93e328ccfbdf826c8e4f094'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)
            const feePayerPublicKeys = caver.transaction.recoverFeePayerPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedSenderPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedSenderPublicKeyArray[i].toLowerCase())
            }

            expect(feePayerPublicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
            for (let i = 0; i < feePayerPublicKeys.length; i++) {
                expect(feePayerPublicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('feeDelegatedChainDataAnchoring', () => {
        it('CAVERJS-UNIT-TRANSACTIONFD-541: recoverPublciKeys should recover public keys and recoverFeePayerPublicKeys should recover fee payer public keys', async () => {
            const rawTx =
                '0x49f901e5808505d21dba008402faf08094f21460730845e3652aa3cc9bc13b345e4f53984a01f8d5f845820fe9a08e0f6116cf3627c8adc6f689da53fe43945d7d25e79e48b765b6e5a83de2d945a0286a8ec630d0f4c87e41e64dbeb5c6ed5e81b1948785dbcd39cde2d071ef4f71f845820feaa0edbf01e5bf50aa81402240995e052399ee5926f525bde435d9bd810cbc84496ba05eb7888a9a60fe8a5d687f6bf098b7117cc303b5d35a0c27fd940543826594f3f845820feaa0f1bbf5a8555f6a789df1fdfd52661fbff709ac23fcc61a7fdf7cc73362a2a17ca0144164861a7c4c16e01378a8cb92649ce73ddf16646d6123694f658e0985eb1d94b5db72925b1b6b79299a1a49ae226cd7861083acf8d5f845820fe9a027126a519f2b62e94b1515390a0b7de7069c2521fb4d94e9ddd7b02825409497a07dbcc819bd881b40889399b8ff5bee2622868a143267854f2599e53a0aef4fc4f845820feaa0d2afd9d7d93317e5c85dd29b78ce189a8c74918e20f4f95d7c659fda023626f5a05a141c460eccafbbcf201ae043884d5b8d285de718c4f86312aac50ac01c4013f845820fe9a0d2927037328b8a811803c0a905d7cc72a8b7223646ec245f20e5a57d1c65d85aa04c121bb1c839339d0db45f6205eb9faf972f1a01929276987265dc4e2e85c1bd'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)
            const feePayerPublicKeys = caver.transaction.recoverFeePayerPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedSenderPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedSenderPublicKeyArray[i].toLowerCase())
            }

            expect(feePayerPublicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
            for (let i = 0; i < feePayerPublicKeys.length; i++) {
                expect(feePayerPublicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('feeDelegatedValueTransferWithRatio', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-549: recoverPublciKeys should recover public keys and recoverFeePayerPublicKeys should recover fee payer public keys', async () => {
            const rawTx =
                '0x0af901fb808505d21dba008402faf0809459177716c34ac6e49e295a0e78e33522f14d61ee019407a9a76ef778676c3bd2b334edcf581db31a85e563f8d5f845820fe9a06f9f0e03201564ec8a32c4cbff016a0c85b87f03e274707b21671cdf326c662aa077cffd7d2ea37d9a000ccbb68e5976f749ec964074cd68fe6c2c174102f28315f845820fe9a0a5e4d1569d1c4bc5a9e0e4fef09b0b5e0224402c486baf5887aede88246eba9fa05199e243bef005dc37eefcf144355aaa9687d3f2b0a3535bad4f4c9464c3a609f845820feaa091b1b9ce709a58eda8348070572ded1d42578eb3fdc18907e15e890878609e90a016be616510baab5f1b09db15d54debc3fea2a3be8c6f2ff974e4e912ca085ec994b5db72925b1b6b79299a1a49ae226cd7861083acf8d5f845820fe9a0db7685be27d4a207a779e5f9c21aada2b975c84901024ccda9cf3c4f4448c3c3a01571b03b29527f991f17ad563558cecd1f1d688fa828020e175b80c2c2383c2cf845820fe9a05750ff286dbc47570ef8930e71f426af4ea5a4d83094af2132d5a218abd82032a0465f8d1d966693997f09054e66d5250a44751bfa168d4a1ef29908b6620ee4c7f845820fe9a04ec6f1ae409dcdccdccbef67094974a70acc13b01a306fb51cee0ea5f47d3228a003ee9a9fe8376ccbacd9adf0d930280900ce1c7c165a334e013cf5de4a83da9d'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)
            const feePayerPublicKeys = caver.transaction.recoverFeePayerPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedSenderPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedSenderPublicKeyArray[i].toLowerCase())
            }

            expect(feePayerPublicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
            for (let i = 0; i < feePayerPublicKeys.length; i++) {
                expect(feePayerPublicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('feeDelegatedValueTransferMemoWithRatio', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-550: recoverPublciKeys should recover public keys and recoverFeePayerPublicKeys should recover fee payer public keys', async () => {
            const rawTx =
                '0x12f90201808505d21dba008402faf0809459177716c34ac6e49e295a0e78e33522f14d61ee019407a9a76ef778676c3bd2b334edcf581db31a85e58568656c6c6f63f8d5f845820fe9a0ce82f1c80ff7abd6c345177a655e1f8764280f4077bf864ff74393e17a8d8408a07382964f32e0b572a828a2ae8d78fca28eab0b5b1636a8a899de78c8c0f6fb12f845820feaa07153102d1714210ac9610c3b6d6ab2d207eddf7af0f887813d0c4a9082329aa2a012c672dbbb99483e2b783f635ff53b02abd1e065b508b42b24a9a9e21721395cf845820fe9a07c30e08534153db8686c32618e37f7afe2763f5d5836ddff2d681c5f3af167d2a04ddeb74725b5e6644396c002e9fd53c3c08b7b819043f126baa59543460fed4994b5db72925b1b6b79299a1a49ae226cd7861083acf8d5f845820feaa08e250033adf8cf1cff0403fa9488bb30efed8e8c22b895533798e915a4be8c4fa04d7617488ab70e25e83bb4ecb30cc9af7523baaad16a1346e7d78222b5c0095af845820fe9a010c8f757761eac2f5f4af9aa5d1040b852ca150a3952a3757c983c0582230166a018e1f62542058fe8dbe14566d4029366aeb4a8c94d7d13254ed655c5d8d13f2df845820fe9a05fd3f6054c328e57aecbad46dcd396be2828c8e6c25f4cd527958d917812da93a07d9378cd09aa856c1e86fa9462ad54c91ecc63c315afb132a07745c07a9109c9'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)
            const feePayerPublicKeys = caver.transaction.recoverFeePayerPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedSenderPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedSenderPublicKeyArray[i].toLowerCase())
            }

            expect(feePayerPublicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
            for (let i = 0; i < feePayerPublicKeys.length; i++) {
                expect(feePayerPublicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('feeDelegatedAccountUpdateWithRatio', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-551: recoverPublciKeys should recover public keys and recoverFeePayerPublicKeys should recover fee payer public keys', async () => {
            const rawTx =
                '0x22f901e8808505d21dba008402faf0809407a9a76ef778676c3bd2b334edcf581db31a85e58201c063f8d5f845820feaa08eb5dfc7e7a0684ec1bae214c2f8a2e1a02fa64c1f2130ebfd9a3b3a632c2c0ba05c6ade954838134af916afe64107a5503c98211803dd774e75d6a70390a11456f845820feaa029b764526dfdc63fbbf0c4ba5f11f4fa1eddfda78db3a7d24ae0088f1b615724a03e54b2d70e1723bebae9b4a9d5118ad0cb14dec97bce076a72551fa71901f7a0f845820fe9a0ea4aa6a30d0c10c904db4351c1b083b49f589ea86b535b038ee9cafefbe57d18a06ac7dc2d1de4ba51bab9dfd22ba566394683e2daef5e577bd36d78139bc10b0094b5db72925b1b6b79299a1a49ae226cd7861083acf8d5f845820fe9a00c29fc700f0fe2265411ceea1068998ea1d78f9c86fae43f29ae683747c07b42a0481ef864d9ab6000e187bcd5a6b2f243465e28d08da282dd66dae2009c0284e5f845820feaa0a175d60b8ad6b54d4e249c233a40c73d66fae599d440e244a8ba2cd0252b30dfa00ffa68e1c8a2060af56e0a2962fab6235233b28bb473745b2fc8c0bc1b02136af845820feaa0cc6ba796398975803dc0e34ddaa2f01346f3fd9da494fe98170507a0f573d085a02930d6972c4fe3b09f36a5e4921424c23396d679082b4e48d87de4e5352b2bab'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)
            const feePayerPublicKeys = caver.transaction.recoverFeePayerPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedSenderPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedSenderPublicKeyArray[i].toLowerCase())
            }

            expect(feePayerPublicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
            for (let i = 0; i < feePayerPublicKeys.length; i++) {
                expect(feePayerPublicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('feeDelegatedSmartContractDeployWithRatio', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-552: recoverPublciKeys should recover public keys and recoverFeePayerPublicKeys should recover fee payer public keys', async () => {
            const rawTx =
                '0x2af903fa808505d21dba008402faf080800194f21460730845e3652aa3cc9bc13b345e4f53984ab9020e60806040526000805534801561001457600080fd5b506101ea806100246000396000f30060806040526004361061006d576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd1461007257806342cbb15c1461009d578063767800de146100c8578063b22636271461011f578063d14e62b814610150575b600080fd5b34801561007e57600080fd5b5061008761017d565b6040518082815260200191505060405180910390f35b3480156100a957600080fd5b506100b2610183565b6040518082815260200191505060405180910390f35b3480156100d457600080fd5b506100dd61018b565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561012b57600080fd5b5061014e60048036038101908080356000191690602001909291905050506101b1565b005b34801561015c57600080fd5b5061017b600480360381019080803590602001909291905050506101b4565b005b60005481565b600043905090565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b50565b80600081905550505600a165627a7a7230582053c65686a3571c517e2cf4f741d842e5ee6aa665c96ce70f46f9a594794f11eb0029806380f8d5f845820fe9a07f4202d99aead9a883a04a03888c5a7474695765c7bdeab953a4c023370134f3a035f2d08de9ca8807f0590458e79857a883ea8650373a44acd79d1897ac7feac6f845820feaa09cb21ad8ca5f27a5aa9ec478ab693441404f95ca270d763b4792e6ae6cdaae4da064854ca9e3cbd20e6c7548c41c96b497c3291bf99aa0eb4752cd0540d20eb833f845820feaa04161b6ba2491efda4c031742a136f815b3aa0c0d97f5896a62c253b43d72bccfa06e646db88b41eda38c9d108d44e0d839387f4dfb8fbacff2cbf85e25c573935d94b5db72925b1b6b79299a1a49ae226cd7861083acf8d5f845820fe9a0c9d4fdd99ee0017b5e0cd16b02e1777a0bbee4e322a9dfe9740fde617d9b28d1a052501774839c3c2593988b29fc7c49dbcfc4137c5ad33e59d7cb007a97e6838af845820fe9a07f53da21c754c396bc9f4210d18b61eb79721c7887798c20010e84e0fde5907da0088c05176dd8a26f0de12c07b8f3f9e980c74050cfdf2c9d53703e82a6784c4ff845820fe9a039a00b4f2f9d00a23fe1eb66eba9459db59ffeeb724c6172651659150171d677a00c105c691bc2425e19828aacc9d03839144e1916c6b7691001d1046e55e4f11c'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)
            const feePayerPublicKeys = caver.transaction.recoverFeePayerPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedSenderPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedSenderPublicKeyArray[i].toLowerCase())
            }

            expect(feePayerPublicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
            for (let i = 0; i < feePayerPublicKeys.length; i++) {
                expect(feePayerPublicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('feeDelegatedSmartContractExecutionWithRatio', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-553: recoverPublciKeys should recover public keys and recoverFeePayerPublicKeys should recover fee payer public keys', async () => {
            const rawTx =
                '0x32f90241808505d21dba008402faf0809459177716c34ac6e49e295a0e78e33522f14d61ee0194f21460730845e3652aa3cc9bc13b345e4f53984ab844d95aced7000000000000000000000000640a4c021cb5889fa1d37378f04a36ad45286224000000000000000000000000000000000000000000000000000000000000000163f8d5f845820feaa0ec91b2f010d2a67c553924a5da051c22b1fde3271ef5ca0caaef88e84a687346a04bdc835e82717a34354b7cb445d679f9fcfa4bfd5cb3e201c74aa1cfa1a0c264f845820feaa088bff49b9b12dc37f2a9665dc9bf88bf433e3e66b8772006f0b21a6acb619511a01e56201dc2e43d108e7d568b1596d762f68296a47067d6da59f55b88a4c341d1f845820fe9a0da52e3241059667a2dcb50a541b88b46cc1a8d7a5c5cc1047453815b03d9d34ca017dc3367702f6e20092e8b1893cf0fdec60e8dde82891e9b278607c97ca25a4a94b5db72925b1b6b79299a1a49ae226cd7861083acf8d5f845820fe9a0cb516e7ab54063b6096bc7299f24731f08a3589576efe2a0bb590a0f22439db2a01b930b0ae22db6c66f1584b083707198ab7736edafd59a80064a4e1d2f18823ef845820feaa02b345d208f3087287f35204f6fc1a68e6086a3a360f99fc6cc869095ad7770efa04407f06020e6f26978c0fb57dbf4d45f6535ee7218835fcc8a03003fb4309944f845820feaa08baf44a961ca99e953f27cc5c865e492f8db46b0b9a58a0ad1418efeb01bb217a04d3c1f7a43017f33a70541ab4f7d962da1c3246a88280cf53d0cb1c74b3a7100'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)
            const feePayerPublicKeys = caver.transaction.recoverFeePayerPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedSenderPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedSenderPublicKeyArray[i].toLowerCase())
            }

            expect(feePayerPublicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
            for (let i = 0; i < feePayerPublicKeys.length; i++) {
                expect(feePayerPublicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('feeDelegatedCancelWithRatio', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-554: recoverPublciKeys should recover public keys and recoverFeePayerPublicKeys should recover fee payer public keys', async () => {
            const rawTx =
                '0x3af901e5808505d21dba008402faf08094f21460730845e3652aa3cc9bc13b345e4f53984a63f8d5f845820fe9a07ac5d06032c34b9bebd7dfe4ac28e6598063dd7eed54e72b2af055b0a332e093a05a20e07cef87154b3a7dbdda9044b48d38396f4bacf1cbace86611c7749f42b4f845820fe9a0cabd929a0faad4b8ff77a5a99d39b999c340338021fa698d089e83a3ab392edfa0198037b25d3fed716cf48955534dc454bde7ad3c89800da24df14467d734bb09f845820feaa0887181b46e0239ebe00dcaf178b144022a3105459498af1f8b5933958b56a0cfa012992599813850c97663182d78e089dd50112a913f1296f28c6e9a9b6396d0de94b5db72925b1b6b79299a1a49ae226cd7861083acf8d5f845820fe9a08844ca009e53562c442244ce81b0dee09fb3ba3a84b433e549e59d0e73295589a06b65723d5ce47ab3bccec9b26c3b551a4fe5010c5651838c61c32faed3acd39df845820feaa0a621c7c9f4e69e8ae920c6d50b1bf215a73e1d62b642421556a895ed88f5fbd1a023eb023c9e597730ebb4cfdf9a06e702140640d15f2c2d2c6bffd9ebdb3e0f52f845820fe9a0b42f70a4d5abebee97013d79066cbecc211c1aaf720aed3f430574f7f9a240c3a05bb9ca49da9ad60cf49f4738db96d9de1ac4e670ef42254572987e485951d80c'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)
            const feePayerPublicKeys = caver.transaction.recoverFeePayerPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedSenderPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedSenderPublicKeyArray[i].toLowerCase())
            }

            expect(feePayerPublicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
            for (let i = 0; i < feePayerPublicKeys.length; i++) {
                expect(feePayerPublicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('feeDelegatedChainDataAnchoringWithRatio', () => {
        it('CAVERJS-UNIT-TRANSACTIONFDR-555: recoverPublciKeys should recover public keys and recoverFeePayerPublicKeys should recover fee payer public keys', async () => {
            const rawTx =
                '0x4af901e6808505d21dba008402faf08094f21460730845e3652aa3cc9bc13b345e4f53984a0163f8d5f845820fe9a022ccd4dd18c487fe87a8d4de4d6550e81cccb1472e5d63ef3c25019780ee54f4a06fab59918e1ab97965fce02bb400a2bc1524fc19e6bb8302b0d2396c78f1066cf845820feaa0bd88f61069d56ff6e5fc664f44efc6b44a3fdfb8a702d14241fc85a167b762bfa06d8caac668c67be6eb50f08543eb99d771d110dd1ff6543b1c79cdca6d8bf0cff845820feaa01e41ecda481be947f6bed22dd733b9a3edb41c3f953f50a67f231ef30b2d00afa02023c8979665b5e2fd8c62b26835b98802816f8198040fd98ee3144beca66a8294b5db72925b1b6b79299a1a49ae226cd7861083acf8d5f845820fe9a05e9438ce131f2bc0c10f668341a0c7d5ced2d3ffe884c757de6cf155db0d3cc1a05844091f58cc3f2c9ecc75d9f27b188944ac76be7bb2d227014e4feda8f18a4df845820feaa0d5c4691f6a2a00cac4653c3276be4281ab7815fdde5aa3dbff1bfb6512a97b75a078cb77d008484065aebd202a0ac7186a0ed8912b4f7f9fb97cb8bc8d86ff6a3ef845820feaa09f545e82f0aa7598410e28b713e3d52404e321ec4527b2ad3fc71d94ff031f80a011527fde8e10dc5b543da4fe7b892c2df96bff247851e02047740b939f5856e1'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)
            const feePayerPublicKeys = caver.transaction.recoverFeePayerPublicKeys(rawTx)

            expect(publicKeys.length).to.equal(expectedSenderPublicKeyArray.length)
            for (let i = 0; i < publicKeys.length; i++) {
                expect(publicKeys[i].toLowerCase()).to.equal(expectedSenderPublicKeyArray[i].toLowerCase())
            }

            expect(feePayerPublicKeys.length).to.equal(expectedFeePayerPublicKeyArray.length)
            for (let i = 0; i < feePayerPublicKeys.length; i++) {
                expect(feePayerPublicKeys[i].toLowerCase()).to.equal(expectedFeePayerPublicKeyArray[i].toLowerCase())
            }
        })
    })

    context('ethereumAccessList', () => {
        it('CAVERJS-UNIT-TRANSACTION-554: recoverPublciKeys should recover public keys from signatures', async () => {
            const expected =
                '0xde8009313a986ec6d21dca780bd0bd12f0f8b177a29f50e833e5b3187391319cae9a5c8d179601417aeba6330b69b436f01f55d1c89ebb705adafd55d9636573'
            const rawTx =
                '0x7801f90109822710238505d21dba00829c4094c5fb1386b60160614a8151dcd4b0ae41325d1cb801b844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039f85bf859945430192ae264b3feff967fc08982b9c6f5694023f842a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000701a05ac25e47591243af2d6b8e7f54d608e9e0e0aeb5194d34c17852bd7e376f4857a0095a40394f33e95cce9695d5badf4270f4cc8aff0b5395cefc3a0fe213be1f30'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)

            expect(publicKeys[0].toLowerCase()).to.equal(expected)
        })
    })

    context('ethereumDynamicFee', () => {
        it('CAVERJS-UNIT-TRANSACTION-555: recoverPublciKeys should recover public keys from signatures', async () => {
            const expected =
                '0xde8009313a986ec6d21dca780bd0bd12f0f8b177a29f50e833e5b3187391319cae9a5c8d179601417aeba6330b69b436f01f55d1c89ebb705adafd55d9636573'
            const rawTx =
                '0x7802f9010f822710258505d21dba008505d21dba00829c40941fc92c23f71a7de4cdb4394a37fc636986a0f48401b844a9059cbb0000000000000000000000008a4c9c443bb0645df646a2d5bb55def0ed1e885a0000000000000000000000000000000000000000000000000000000000003039f85bf8599467116062f1626f7b3019631f03d301b8f701f709f842a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000780a04fc52da183020a27dc4b684a45404445630e946b0c1a37edeb538d4bdae63040a07d56dbcc61f42ffcbced105f838d20b8fe71e85a4d0344c7f60815fddfeae4cc'

            const publicKeys = caver.transaction.recoverPublicKeys(rawTx)

            expect(publicKeys[0].toLowerCase()).to.equal(expected)
        })
    })
})
