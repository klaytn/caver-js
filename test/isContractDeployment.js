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

const { expect } = require('./extendedChai')

const testRPCURL = require('./testrpc')

const Caver = require('../index.js')

const caver = new Caver(testRPCURL)

function coverInitialForTest(tx) {
    tx.to = tx.to || '0x'
    tx.data = tx.data || '0x'
    return tx
}

describe('caver.utils.isContractDeployment', () => {
    it('CAVERJS-UNIT-ETC-054: LEGACY (type X / deploy x)', () => {
        const txObject = {
            from: '0x90b3e9a3770481345a7f17f22f16d020bccfd33e',
            to: '0xd03227635c90c7986f0e3a4e551cefbca8c55316',
            gas: '0x3b9ac9ff',
            gasPrice: '0x19',
            nonce: '0x0',
            value: '0x174876e800',
            chainId: '0x1',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-055: LEGACY (type o / deploy x)', () => {
        const txObject = {
            type: 'LEGACY',
            from: '0x90b3e9a3770481345a7f17f22f16d020bccfd33e',
            to: '0xd03227635c90c7986f0e3a4e551cefbca8c55316',
            gas: '0x3b9ac9ff',
            gasPrice: '0x19',
            nonce: '0x0',
            value: '0x174876e800',
            chainId: '0x1',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-056: LEGACY (type X / deploy o)', () => {
        const txObject = {
            from: '0x90b3e9a3770481345a7f17f22f16d020bccfd33e',
            gas: '0x3b9ac9ff',
            gasPrice: '0x19',
            nonce: '0x0',
            data:
                '0x6080604052348015600f57600080fd5b5060e98061001e6000396000f300608060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063954ab4b2146044575b600080fd5b348015604f57600080fd5b5060566058565b005b7f90a042becc42ba1b13a5d545701bf5ceff20b24d9e5cc63b67f96ef814d80f0933604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a15600a165627a7a723058200ebb53e9d575350ceb2d92263b7d4920888706b5221f024e7bbc10e3dbb8e18d0029',
            value: 0,
            chainId: '0x1',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.true
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.true
    })

    it('CAVERJS-UNIT-ETC-057: LEGACY (type o / deploy o)', () => {
        const txObject = {
            type: 'LEGACY',
            from: '0x90b3e9a3770481345a7f17f22f16d020bccfd33e',
            gas: '0x3b9ac9ff',
            gasPrice: '0x19',
            nonce: '0x0',
            data:
                '0x6080604052348015600f57600080fd5b5060e98061001e6000396000f300608060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063954ab4b2146044575b600080fd5b348015604f57600080fd5b5060566058565b005b7f90a042becc42ba1b13a5d545701bf5ceff20b24d9e5cc63b67f96ef814d80f0933604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a15600a165627a7a723058200ebb53e9d575350ceb2d92263b7d4920888706b5221f024e7bbc10e3dbb8e18d0029',
            value: 0,
            chainId: '0x1',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.true
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.true
    })

    it('CAVERJS-UNIT-ETC-058: VALUE_TRANSFER', () => {
        const txObject = {
            type: 'VALUE_TRANSFER',
            from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
            to: '0x75c3098Be5E4B63FBAc05838DaAEE378dD48098d',
            nonce: '0x1',
            gas: '0x3b9ac9ff',
            gasPrice: '0x19',
            value: '0x989680',
            chainId: '0x1',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-059: FEE_DELEGATED_VALUE_TRANSFER', () => {
        const txObject = {
            type: 'FEE_DELEGATED_VALUE_TRANSFER',
            from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
            to: '0x75c3098Be5E4B63FBAc05838DaAEE378dD48098d',
            nonce: '0x2',
            gas: '0x3b9ac9ff',
            gasPrice: '0x19',
            value: '0x989680',
            chainId: '0x1',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-060: FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO', () => {
        const txObject = {
            type: 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO',
            from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
            to: '0x75c3098Be5E4B63FBAc05838DaAEE378dD48098d',
            nonce: '0x3',
            gas: '0x3b9ac9ff',
            feeRatio: 20,
            gasPrice: '0x19',
            value: '0x989680',
            chainId: '0x1',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-061: VALUE_TRANSFER_MEMO', () => {
        const txObject = {
            type: 'VALUE_TRANSFER_MEMO',
            from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
            to: '0x75c3098Be5E4B63FBAc05838DaAEE378dD48098d',
            nonce: '0x4',
            gas: '0x3b9ac9ff',
            gasPrice: '0x19',
            value: '0x989680',
            data: '0x68656c6c6f',
            chainId: '0x1',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-062: FEE_DELEGATED_VALUE_TRANSFER_MEMO', () => {
        const txObject = {
            type: 'FEE_DELEGATED_VALUE_TRANSFER_MEMO',
            from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
            to: '0x75c3098Be5E4B63FBAc05838DaAEE378dD48098d',
            nonce: '0x5',
            gas: '0x3b9ac9ff',
            gasPrice: '0x19',
            value: '0x989680',
            chainId: '0x1',
            data: '0x68656c6c6f',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-063: FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO', () => {
        const txObject = {
            type: 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO',
            from: '0x90b3e9a3770481345a7f17f22f16d020bccfd33e',
            to: '0x75c3098be5e4b63fbac05838daaee378dd48098d',
            nonce: '0x6',
            gas: '0x3b9ac9ff',
            feeRatio: 30,
            data: '0x68656c6c6f',
            gasPrice: '0x19',
            value: '0x989680',
            chainId: '0x1',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-064: ACCOUNT_UPDATE', () => {
        const txObject = {
            type: 'ACCOUNT_UPDATE',
            from: '0x88e245dec96830f012f8fc1806bc623b3774560d',
            publicKey:
                '0x4ef27ba4b7d1ae09b166744c5b7ee4a7a0cc5c76b2e5d74523a0a4fb56db319162ff3255302045cd047a27141916d55615a7c1ead06e211e62119e7bc2a40def',
            nonce: '0x0',
            gas: '0x3b9ac9ff',
            chainId: '0x7e3',
            gasPrice: '0x5d21dba00',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-065: FEE_DELEGATED_ACCOUNT_UPDATE', () => {
        const txObject = {
            type: 'FEE_DELEGATED_ACCOUNT_UPDATE',
            from: '0x5104711f7faa9e2dadf593e43db1577a2887636f',
            nonce: '0x0',
            gas: '0x3b9ac9ff',
            publicKey:
                '0x4ef27ba4b7d1ae09b166744c5b7ee4a7a0cc5c76b2e5d74523a0a4fb56db319162ff3255302045cd047a27141916d55615a7c1ead06e211e62119e7bc2a40def',
            chainId: '0x7e3',
            gasPrice: '0x5d21dba00',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-066: FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO', () => {
        const txObject = {
            type: 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO',
            from: '0xd03227635c90c7986f0e3a4e551cefbca8c55316',
            nonce: '0x0',
            gas: '0x3b9ac9ff',
            gasPrice: '0x19',
            publicKey:
                '0xc8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f08144794c27901465af0a703859ab47f8ae17e54aaba453b7cde5a6a9e4a32d45d72b2',
            feeRatio: 11,
            chainId: '0x1',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-067: SMART_CONTRACT_DEPLOY', () => {
        const txObject = {
            type: 'SMART_CONTRACT_DEPLOY',
            from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
            nonce: '0x8',
            data:
                '0x608060405234801561001057600080fd5b506101de806100206000396000f3006080604052600436106100615763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416631a39d8ef81146100805780636353586b146100a757806370a08231146100ca578063fd6b7ef8146100f8575b3360009081526001602052604081208054349081019091558154019055005b34801561008c57600080fd5b5061009561010d565b60408051918252519081900360200190f35b6100c873ffffffffffffffffffffffffffffffffffffffff60043516610113565b005b3480156100d657600080fd5b5061009573ffffffffffffffffffffffffffffffffffffffff60043516610147565b34801561010457600080fd5b506100c8610159565b60005481565b73ffffffffffffffffffffffffffffffffffffffff1660009081526001602052604081208054349081019091558154019055565b60016020526000908152604090205481565b336000908152600160205260408120805490829055908111156101af57604051339082156108fc029083906000818181858888f193505050501561019c576101af565b3360009081526001602052604090208190555b505600a165627a7a72305820627ca46bb09478a015762806cc00c431230501118c7c26c30ac58c4e09e51c4f0029',
            gas: '0x3b9ac9ff',
            gasPrice: '0x0',
            value: '0x0',
            chainId: '0x1',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.true
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.true
    })

    it('CAVERJS-UNIT-ETC-068: FEE_DELEGATED_SMART_CONTRACT_DEPLOY', () => {
        const txObject = {
            type: 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY',
            from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
            nonce: '0x9',
            data:
                '0x608060405234801561001057600080fd5b506101de806100206000396000f3006080604052600436106100615763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416631a39d8ef81146100805780636353586b146100a757806370a08231146100ca578063fd6b7ef8146100f8575b3360009081526001602052604081208054349081019091558154019055005b34801561008c57600080fd5b5061009561010d565b60408051918252519081900360200190f35b6100c873ffffffffffffffffffffffffffffffffffffffff60043516610113565b005b3480156100d657600080fd5b5061009573ffffffffffffffffffffffffffffffffffffffff60043516610147565b34801561010457600080fd5b506100c8610159565b60005481565b73ffffffffffffffffffffffffffffffffffffffff1660009081526001602052604081208054349081019091558154019055565b60016020526000908152604090205481565b336000908152600160205260408120805490829055908111156101af57604051339082156108fc029083906000818181858888f193505050501561019c576101af565b3360009081526001602052604090208190555b505600a165627a7a72305820627ca46bb09478a015762806cc00c431230501118c7c26c30ac58c4e09e51c4f0029',
            gas: '0x3b9ac9ff',
            gasPrice: '0x0',
            chainId: '0x1',
            value: '0x0',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.true
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.true
    })

    it('CAVERJS-UNIT-ETC-069: FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO', () => {
        const txObject = {
            type: 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO',
            from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
            nonce: 10,
            data:
                '0x608060405234801561001057600080fd5b506101de806100206000396000f3006080604052600436106100615763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416631a39d8ef81146100805780636353586b146100a757806370a08231146100ca578063fd6b7ef8146100f8575b3360009081526001602052604081208054349081019091558154019055005b34801561008c57600080fd5b5061009561010d565b60408051918252519081900360200190f35b6100c873ffffffffffffffffffffffffffffffffffffffff60043516610113565b005b3480156100d657600080fd5b5061009573ffffffffffffffffffffffffffffffffffffffff60043516610147565b34801561010457600080fd5b506100c8610159565b60005481565b73ffffffffffffffffffffffffffffffffffffffff1660009081526001602052604081208054349081019091558154019055565b60016020526000908152604090205481565b336000908152600160205260408120805490829055908111156101af57604051339082156108fc029083906000818181858888f193505050501561019c576101af565b3360009081526001602052604090208190555b505600a165627a7a72305820627ca46bb09478a015762806cc00c431230501118c7c26c30ac58c4e09e51c4f0029',
            gas: '0x3b9ac9ff',
            gasPrice: '0x0',
            chainId: '0x1',
            feeRatio: 33,
            value: '0x0',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.true
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.true
    })

    it('CAVERJS-UNIT-ETC-070: SMART_CONTRACT_EXECUTION', () => {
        const txObject = {
            type: 'SMART_CONTRACT_EXECUTION',
            from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
            to: '0x5e008646fde91fb6eda7b1fdabc7d84649125cf5',
            nonce: '0xb',
            data: '0x6353586b00000000000000000000000090b3e9a3770481345a7f17f22f16d020bccfd33e',
            gas: '0x3b9ac9ff',
            gasPrice: '0x19',
            value: '0xa',
            chainId: '0x1',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-071: FEE_DELEGATED_SMART_CONTRACT_EXECUTION', () => {
        const txObject = {
            type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
            from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
            to: '0x5e008646fde91fb6eda7b1fdabc7d84649125cf5',
            nonce: 12,
            value: '0xa',
            data: '0x6353586b00000000000000000000000090b3e9a3770481345a7f17f22f16d020bccfd33e',
            gas: '0x3b9ac9ff',
            gasPrice: '0x0',
            chainId: '0x1',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-072: FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO', () => {
        const txObject = {
            type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO',
            from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
            to: '0x5e008646fde91fb6eda7b1fdabc7d84649125cf5',
            nonce: 13,
            data: '0x6353586b00000000000000000000000090b3e9a3770481345a7f17f22f16d020bccfd33e',
            gas: '0x3b9ac9ff',
            gasPrice: '0x0',
            chainId: '0x1',
            feeRatio: 66,
            value: '0xa',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-073: CANCEL', () => {
        const txObject = {
            type: 'CANCEL',
            from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
            nonce: '0xe',
            gasPrice: '0x19',
            gas: '0x3b9ac9ff',
            chainId: '0x1',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-074: FEE_DELEGATED_CANCEL', () => {
        const txObject = {
            type: 'FEE_DELEGATED_CANCEL',
            from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
            nonce: 15,
            gas: '0x3b9ac9ff',
            gasPrice: '0x19',
            chainId: '0x1',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-075: FEE_DELEGATED_CANCEL_WITH_RATIO', () => {
        const txObject = {
            type: 'FEE_DELEGATED_CANCEL_WITH_RATIO',
            from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
            nonce: 16,
            gas: '0x3b9ac9ff',
            gasPrice: '0x0',
            chainId: '0x1',
            feeRatio: 88,
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })

    it('CAVERJS-UNIT-ETC-076: CHAIN_DATA_ANCHORING', () => {
        const txObject = {
            type: 'CHAIN_DATA_ANCHORING',
            from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
            to: '0x75c3098Be5E4B63FBAc05838DaAEE378dD48098d',
            nonce: '0x11',
            gasPrice: '0x19',
            gas: '0x3b9ac9ff',
            value: '0x989680',
            anchoredData:
                '0xf8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405',
            chainId: '0x1',
        }
        expect(caver.utils.isContractDeployment(txObject)).to.false
        expect(caver.utils.isContractDeployment(coverInitialForTest(txObject))).to.false
    })
})
