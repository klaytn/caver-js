/*
    Copyright 2018 The caver-js Authors
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

require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const Caver = require('../../index.js')

let caver
beforeEach(() => {
    caver = new Caver()
})

describe('Legacy: Legacy transaction', () => {
    const transaction = {
        from: '0x90b3e9a3770481345a7f17f22f16d020bccfd33e',
        to: '0xd03227635c90c7986f0e3a4e551cefbca8c55316',
        gas: '0x3b9ac9ff',
        gasPrice: '0x19',
        nonce: '0x0',
        value: '0x174876e800',
        chainId: '0x1',
    }
    const expectedRawTransaction =
        '0xf8668019843b9ac9ff94d03227635c90c7986f0e3a4e551cefbca8c5531685174876e8008025a0399466cac18fe56a0607adea3de14a8d1dca4b3445080361246ec125adb2a1f3a06d187fdceed7e5c9d1b9142cbd368ce615f77bbedebf1df3a05166c8561d71c4'

    it('CAVERJS-UNIT-SER-019 : Sign transaction', done => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

        caver.klay.accounts.wallet.add(privateKey)

        caver.klay.accounts
            .signTransaction(transaction, privateKey)
            .then(({ rawTransaction }) => {
                expect(rawTransaction).to.equal(expectedRawTransaction)
                done()
            })
            .catch(done)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-059: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals('LEGACY')
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(transaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(transaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(transaction.gas))
        expect(txObj.to).to.equals(transaction.to)
        expect(caver.utils.hexToNumber(txObj.value)).to.equals(caver.utils.hexToNumber(transaction.value))
        expect(txObj.data).to.equals(transaction.data)
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0]).to.equals(txObj.v)
        expect(txObj.signatures[1]).to.equals(txObj.r)
        expect(txObj.signatures[2]).to.equals(txObj.s)
    }).timeout(200000)
})

describe('Value transfer: Value Transfer', () => {
    const senderTransaction = {
        type: 'VALUE_TRANSFER',
        from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
        to: '0x75c3098Be5E4B63FBAc05838DaAEE378dD48098d',
        nonce: '0x1',
        gas: '0x3b9ac9ff',
        gasPrice: '0x19',
        value: '0x989680',
        chainId: '0x1',
    }
    const expectedRawTransaction =
        '0x08f87c0119843b9ac9ff9475c3098be5e4b63fbac05838daaee378dd48098d839896809490b3e9a3770481345a7f17f22f16d020bccfd33ef845f84325a079793f7c580e206b08fd6997df2bbeb89726fa9830c79231adb1b8aba40099f5a07a84e1833cc7ab78300e72bed861ee9b20f52709a8ea43d3d20ffec1c723e1d0'

    it('CAVERJS-UNIT-SER-020 : Sign transaction', async () => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-060: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.to).to.equals(senderTransaction.to)
        expect(caver.utils.hexToNumber(txObj.value)).to.equals(caver.utils.hexToNumber(senderTransaction.value))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
    }).timeout(200000)
})

describe('Value transfer: Fee Delegated Value Transfer', () => {
    const senderTransaction = {
        type: 'FEE_DELEGATED_VALUE_TRANSFER',
        from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
        to: '0x75c3098Be5E4B63FBAc05838DaAEE378dD48098d',
        nonce: '0x2',
        gas: '0x3b9ac9ff',
        gasPrice: '0x19',
        value: '0x989680',
        chainId: '0x1',
    }
    const feePayer = '0x33f524631e573329a550296f595c820d6c65213f'
    const expectedRawTransaction =
        '0x09f8d80219843b9ac9ff9475c3098be5e4b63fbac05838daaee378dd48098d839896809490b3e9a3770481345a7f17f22f16d020bccfd33ef845f84325a089bb7f66d87c72554beb2f4b9255f864a92866476932793ed755e95164e1679fa075fb8f74bf6f1ff35b15d889bc533502ce0dc68a0a0e1f106c566086b647530b9433f524631e573329a550296f595c820d6c65213ff845f84325a0d08b5ebd1323c3bcca6763994832e59172e06d5114cc6ea76c4a4f4f6f04f565a04a6b885dc4c5251f47326c97075274276c9f1c8098b8f42a3d03e6d4cb2faf3e'

    it('CAVERJS-UNIT-SER-015 : Sign transaction', async () => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)

        const feePayerTransaction = {
            senderRawTransaction,
            feePayer,
            chainId: '0x1',
        }

        const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
        const { rawTransaction } = await caver.klay.accounts.signTransaction(feePayerTransaction, feePayerPrivateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-055: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.to).to.equals(senderTransaction.to)
        expect(caver.utils.hexToNumber(txObj.value)).to.equals(caver.utils.hexToNumber(senderTransaction.value))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
        expect(txObj.feePayer).to.equals(feePayer)
        expect(txObj.payerV).not.to.be.undefined
        expect(txObj.payerR).not.to.be.undefined
        expect(txObj.payerS).not.to.be.undefined
        expect(txObj.feePayerSignatures).not.to.be.undefined
        expect(txObj.feePayerSignatures[0][0]).to.equals(txObj.payerV)
        expect(txObj.feePayerSignatures[0][1]).to.equals(txObj.payerR)
        expect(txObj.feePayerSignatures[0][2]).to.equals(txObj.payerS)
    }).timeout(200000)
})

describe('Value transfer: Fee Delegated Value Transfer With Ratio', () => {
    const senderTransaction = {
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
    const feePayer = '0x33f524631e573329a550296f595c820d6c65213f'
    const expectedRawTransaction =
        '0x0af8d90319843b9ac9ff9475c3098be5e4b63fbac05838daaee378dd48098d839896809490b3e9a3770481345a7f17f22f16d020bccfd33e14f845f84326a0fee9ac41e3e9840549d2d27e4bee763e539c4caaeefcd2b2a139fde131042c25a007237d7a7b9cd622bd53e4c6073d9ae6089898f6fce8484eaf3e835e59d1c9049433f524631e573329a550296f595c820d6c65213ff845f84325a0aac7918a35ae8500e851c5902e156a173c7aacde21ad81fabe58e7f4e2ce4871a027a129c39c0e0ada879c461c2104738fd893bcecd6f03919c8a1e040b45bb422'

    it('CAVERJS-UNIT-SER-018 : Sign transaction', async () => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)
        const decoded = caver.klay.decodeTransaction(senderRawTransaction)
        expect(decoded.feePayer).to.equals('0x')
        expect(decoded.payerV).to.equals('0x01')
        expect(decoded.payerR).to.equals('0x')
        expect(decoded.payerS).to.equals('0x')

        const feePayerTransaction = {
            senderRawTransaction,
            feePayer,
            chainId: '0x1',
        }

        const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
        const { rawTransaction } = await caver.klay.accounts.signTransaction(feePayerTransaction, feePayerPrivateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-058: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.to).to.equals(senderTransaction.to)
        expect(caver.utils.hexToNumber(txObj.value)).to.equals(caver.utils.hexToNumber(senderTransaction.value))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(caver.utils.hexToNumber(txObj.feeRatio)).to.equals(caver.utils.hexToNumber(senderTransaction.feeRatio))
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
        expect(txObj.feePayer).to.equals(feePayer)
        expect(txObj.payerV).not.to.be.undefined
        expect(txObj.payerR).not.to.be.undefined
        expect(txObj.payerS).not.to.be.undefined
        expect(txObj.feePayerSignatures).not.to.be.undefined
        expect(txObj.feePayerSignatures[0][0]).to.equals(txObj.payerV)
        expect(txObj.feePayerSignatures[0][1]).to.equals(txObj.payerR)
        expect(txObj.feePayerSignatures[0][2]).to.equals(txObj.payerS)
    }).timeout(200000)
})

describe('Value transfer memo: Value Transfer With Memo', () => {
    const senderTransaction = {
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
    const expectedRawTransaction =
        '0x10f8820419843b9ac9ff9475c3098be5e4b63fbac05838daaee378dd48098d839896809490b3e9a3770481345a7f17f22f16d020bccfd33e8568656c6c6ff845f84326a0eaa1cf4fd993bdc33e724d9c101b948ada698e1265ae9000151643c814dc3974a050d3db41bca1d5515cb3ef7996f0a9a367d7022e5739ed4cfc376d314c5ccb1c'

    it('CAVERJS-UNIT-SER-021 : Sign transaction', async () => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-061: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.to).to.equals(senderTransaction.to)
        expect(caver.utils.hexToNumber(txObj.value)).to.equals(caver.utils.hexToNumber(senderTransaction.value))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(txObj.data).to.equals(senderTransaction.data)
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
    }).timeout(200000)
})

describe('Value transfer memo: Fee Delegated Value Transfer Memo', () => {
    const senderTransaction = {
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
    const feePayer = '0x33f524631e573329a550296f595c820d6c65213f'
    const expectedRawTransaction =
        '0x11f8de0519843b9ac9ff9475c3098be5e4b63fbac05838daaee378dd48098d839896809490b3e9a3770481345a7f17f22f16d020bccfd33e8568656c6c6ff845f84325a028dc6454a57e6e9ae75760238fe4a791095f7acec08c097182cc70c07cc4af4fa0143c38af597ea5e88021ad1652b2b7373c0650d45f1c59927fabb85b75dbfe5d9433f524631e573329a550296f595c820d6c65213ff845f84325a0c95c415de41ba4b4098edd4b5405e39b486878a953c512507ce80126a78f9f0ea0699aca3c3a4deacc9629359a40a5aa1f51a9bbb909131c68a33e0a708276536b'

    it('CAVERJS-UNIT-SER-016 : Sign transaction', async () => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)
        const decoded = caver.klay.decodeTransaction(senderRawTransaction)
        expect(decoded.feePayer).to.equals('0x')
        expect(decoded.payerV).to.equals('0x01')
        expect(decoded.payerR).to.equals('0x')
        expect(decoded.payerS).to.equals('0x')

        const feePayerTransaction = {
            senderRawTransaction,
            feePayer,
            chainId: '0x1',
        }

        const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
        const { rawTransaction } = await caver.klay.accounts.signTransaction(feePayerTransaction, feePayerPrivateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-056: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.to).to.equals(senderTransaction.to)
        expect(caver.utils.hexToNumber(txObj.value)).to.equals(caver.utils.hexToNumber(senderTransaction.value))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(txObj.data).to.equals(senderTransaction.data)
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
        expect(txObj.feePayer).to.equals(feePayer)
        expect(txObj.payerV).not.to.be.undefined
        expect(txObj.payerR).not.to.be.undefined
        expect(txObj.payerS).not.to.be.undefined
        expect(txObj.feePayerSignatures).not.to.be.undefined
        expect(txObj.feePayerSignatures[0][0]).to.equals(txObj.payerV)
        expect(txObj.feePayerSignatures[0][1]).to.equals(txObj.payerR)
        expect(txObj.feePayerSignatures[0][2]).to.equals(txObj.payerS)
    }).timeout(200000)
})

describe('Value transfer memo with ratio: Fee Delegated Value Transfer Memo With Ratio', () => {
    const senderTransaction = {
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
    const feePayer = '0x33f524631e573329a550296f595c820d6c65213f'
    const expectedRawTransaction =
        '0x12f8df0619843b9ac9ff9475c3098be5e4b63fbac05838daaee378dd48098d839896809490b3e9a3770481345a7f17f22f16d020bccfd33e8568656c6c6f1ef845f84326a0f8284ce7dc9d7adbcb1c0ad1a80b12995eae39415927827f2020cb34d141bc9ea074a388f86ec887a94873c472f5bd22ec91051765f059ef250411f1aeda6daa159433f524631e573329a550296f595c820d6c65213ff845f84325a0e701b6ceaab17fbbe745edd32e26deb752468f0b2f5614372bce2098e3101baea06f4192982e093e604b64933fc942c94d6cf2ecbe285fffd35488308bae6b9f51'

    it('CAVERJS-UNIT-SER-017 : Sign transaction', async () => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)
        const decoded = caver.klay.decodeTransaction(senderRawTransaction)
        expect(decoded.feePayer).to.equals('0x')
        expect(decoded.payerV).to.equals('0x01')
        expect(decoded.payerR).to.equals('0x')
        expect(decoded.payerS).to.equals('0x')

        const feePayerTransaction = {
            senderRawTransaction,
            feePayer,
            chainId: '0x1',
        }

        const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
        const { rawTransaction } = await caver.klay.accounts.signTransaction(feePayerTransaction, feePayerPrivateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-057: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.to).to.equals(senderTransaction.to)
        expect(caver.utils.hexToNumber(txObj.value)).to.equals(caver.utils.hexToNumber(senderTransaction.value))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(txObj.data).to.equals(senderTransaction.data)
        expect(caver.utils.hexToNumber(txObj.feeRatio)).to.equals(caver.utils.hexToNumber(senderTransaction.feeRatio))
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
        expect(txObj.feePayer).to.equals(feePayer)
        expect(txObj.payerV).not.to.be.undefined
        expect(txObj.payerR).not.to.be.undefined
        expect(txObj.payerS).not.to.be.undefined
        expect(txObj.feePayerSignatures).not.to.be.undefined
        expect(txObj.feePayerSignatures[0][0]).to.equals(txObj.payerV)
        expect(txObj.feePayerSignatures[0][1]).to.equals(txObj.payerR)
        expect(txObj.feePayerSignatures[0][2]).to.equals(txObj.payerS)
    }).timeout(200000)
})

describe('Account: Account update', () => {
    const publicKey =
        '0x4ef27ba4b7d1ae09b166744c5b7ee4a7a0cc5c76b2e5d74523a0a4fb56db319162ff3255302045cd047a27141916d55615a7c1ead06e211e62119e7bc2a40def'

    const senderTransaction = {
        type: 'ACCOUNT_UPDATE',
        from: '0x88e245dec96830f012f8fc1806bc623b3774560d',
        publicKey,
        nonce: '0x0',
        gas: '0x3b9ac9ff',
        chainId: '0x7e3',
        gasPrice: '0x5d21dba00',
    }
    const expectedRawTransaction =
        '0x20f88e808505d21dba00843b9ac9ff9488e245dec96830f012f8fc1806bc623b3774560da302a1034ef27ba4b7d1ae09b166744c5b7ee4a7a0cc5c76b2e5d74523a0a4fb56db3191f847f845820feaa07545ef18848ed30d377258aa99ec44c848b14e3b7c0bc3c0793d5d9acffb917ca06ffcf9720d7d87fbc9544c7fd1790fb318c4ecb64fe5bcfccd658a5c3d1c30e9'
    it('CAVERJS-UNIT-SER-002 : Sign transaction', async () => {
        const privateKey = '0xed580f5bd71a2ee4dae5cb43e331b7d0318596e561e6add7844271ed94156b20'

        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-042: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(txObj.publicKey).to.equals(caver.utils.compressPublicKey(publicKey))
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
    }).timeout(200000)
})

describe('Account: Fee Delegated Account Update', () => {
    const senderTransaction = {
        type: 'FEE_DELEGATED_ACCOUNT_UPDATE',
        from: '0x5104711f7faa9e2dadf593e43db1577a2887636f',
        nonce: '0x0',
        gas: '0x3b9ac9ff',
        publicKey:
            '0x4ef27ba4b7d1ae09b166744c5b7ee4a7a0cc5c76b2e5d74523a0a4fb56db319162ff3255302045cd047a27141916d55615a7c1ead06e211e62119e7bc2a40def',
        chainId: '0x7e3',
        gasPrice: '0x5d21dba00',
    }
    const feePayer = '0x90b3e9a3770481345a7f17f22f16d020bccfd33e'
    const expectedRawTransaction =
        '0x21f8ec808505d21dba00843b9ac9ff945104711f7faa9e2dadf593e43db1577a2887636fa302a1034ef27ba4b7d1ae09b166744c5b7ee4a7a0cc5c76b2e5d74523a0a4fb56db3191f847f845820fe9a0fba050179aecd52243fb7242e74957f2adf1d40dd0e5dc29e0213ecbda794b1ba019aab6986ffa00ebacf811d801839d883993db9615b7673882ba03bd9ee9cc279490b3e9a3770481345a7f17f22f16d020bccfd33ef847f845820feaa0a907c040bc64b3c97a84a9aa7cb4b53cfafda3883a330809639defcd4170c3aea0595df9d70eef4b8c9f394c7415b60904e57cc851a9afe7604bd2ff83eb5fadb8'

    it('CAVERJS-UNIT-SER-007 : Sign transaction', async () => {
        const privateKey = '0xc64f2cd1196e2a1791365b00c4bc07ab8f047b73152e4617c6ed06ac221a4b0c'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)
        const decoded = caver.klay.decodeTransaction(senderRawTransaction)
        expect(decoded.feePayer).to.equals('0x')
        expect(decoded.payerV).to.equals('0x01')
        expect(decoded.payerR).to.equals('0x')
        expect(decoded.payerS).to.equals('0x')

        const feePayerTransaction = {
            senderRawTransaction,
            feePayer,
            chainId: '0x7e3',
        }

        const feePayerPrivateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        const { rawTransaction } = await caver.klay.accounts.signTransaction(feePayerTransaction, feePayerPrivateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-047: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
        expect(txObj.feePayer).to.equals(feePayer)
        expect(txObj.payerV).not.to.be.undefined
        expect(txObj.payerR).not.to.be.undefined
        expect(txObj.payerS).not.to.be.undefined
        expect(txObj.feePayerSignatures).not.to.be.undefined
        expect(txObj.feePayerSignatures[0][0]).to.equals(txObj.payerV)
        expect(txObj.feePayerSignatures[0][1]).to.equals(txObj.payerR)
        expect(txObj.feePayerSignatures[0][2]).to.equals(txObj.payerS)
        expect(txObj.publicKey).to.equals(caver.utils.compressPublicKey(senderTransaction.publicKey))
    }).timeout(200000)
})

describe('Account: Fee Delegated Account Update with ratio', () => {
    const senderTransaction = {
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

    const feePayer = '0x90b3e9a3770481345a7f17f22f16d020bccfd33e'
    const expectedRawTransaction =
        '0x22f8e48019843b9ac9ff94d03227635c90c7986f0e3a4e551cefbca8c55316a302a102c8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f0814470bf845f84325a06ccf7dcc61310b1b5f3d20daf165cde39a134040918c35029da9d3c25cb8f58ca06d31d05a1219d3e15acdb75cd88c58ab606cd0e78cc89ed3f16666e08c732e329490b3e9a3770481345a7f17f22f16d020bccfd33ef845f84326a0bc4efd4b0e3b2f3986c6e0eac78cdde28b49517dea23d479a6c2aaa5b955e573a02e23b4ee527b443ba90c845c289fbcfbc0c70ac75bcce94e05b75950cc80c42a'

    it('CAVERJS-UNIT-SER-008 : Sign transaction', async () => {
        const privateKey = '0x98275a145bc1726eb0445433088f5f882f8a4a9499135239cfb4040e78991dab'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)
        const decoded = caver.klay.decodeTransaction(senderRawTransaction)
        expect(decoded.feePayer).to.equals('0x')
        expect(decoded.payerV).to.equals('0x01')
        expect(decoded.payerR).to.equals('0x')
        expect(decoded.payerS).to.equals('0x')

        const feePayerTransaction = {
            senderRawTransaction,
            feePayer,
            chainId: '0x1',
        }

        const feePayerPrivateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        const { rawTransaction } = await caver.klay.accounts.signTransaction(feePayerTransaction, feePayerPrivateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-048: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(caver.utils.hexToNumber(txObj.feeRatio)).to.equals(caver.utils.hexToNumber(senderTransaction.feeRatio))
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
        expect(txObj.feePayer).to.equals(feePayer)
        expect(txObj.payerV).not.to.be.undefined
        expect(txObj.payerR).not.to.be.undefined
        expect(txObj.payerS).not.to.be.undefined
        expect(txObj.feePayerSignatures).not.to.be.undefined
        expect(txObj.feePayerSignatures[0][0]).to.equals(txObj.payerV)
        expect(txObj.feePayerSignatures[0][1]).to.equals(txObj.payerR)
        expect(txObj.feePayerSignatures[0][2]).to.equals(txObj.payerS)
        expect(txObj.publicKey).to.equals(caver.utils.compressPublicKey(senderTransaction.publicKey))
    }).timeout(200000)
})

describe('Contract: Contract deploy', () => {
    const senderTransaction = {
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

    const expectedRawTransaction =
        '0x28f902680880843b9ac9ff80809490b3e9a3770481345a7f17f22f16d020bccfd33eb901fe608060405234801561001057600080fd5b506101de806100206000396000f3006080604052600436106100615763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416631a39d8ef81146100805780636353586b146100a757806370a08231146100ca578063fd6b7ef8146100f8575b3360009081526001602052604081208054349081019091558154019055005b34801561008c57600080fd5b5061009561010d565b60408051918252519081900360200190f35b6100c873ffffffffffffffffffffffffffffffffffffffff60043516610113565b005b3480156100d657600080fd5b5061009573ffffffffffffffffffffffffffffffffffffffff60043516610147565b34801561010457600080fd5b506100c8610159565b60005481565b73ffffffffffffffffffffffffffffffffffffffff1660009081526001602052604081208054349081019091558154019055565b60016020526000908152604090205481565b336000908152600160205260408120805490829055908111156101af57604051339082156108fc029083906000818181858888f193505050501561019c576101af565b3360009081526001602052604090208190555b505600a165627a7a72305820627ca46bb09478a015762806cc00c431230501118c7c26c30ac58c4e09e51c4f00298080f845f84326a04696114c665e455e1e69bcd1f967d6e530a1404131e624807985eeec55bcf49ca0147f0ec54f75ed564dd480e20756c5754d8534a8b9697ff66d4b221945f0992f'

    it('CAVERJS-UNIT-SER-005 : Sign transaction', async () => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-045: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.to).to.equals(senderTransaction.to)
        expect(caver.utils.hexToNumber(txObj.value)).to.equals(caver.utils.hexToNumber(senderTransaction.value))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(txObj.data).to.equals(senderTransaction.data)
        expect(txObj.humanReadable).to.be.false
        expect(caver.utils.hexToNumber(txObj.codeFormat)).to.equals(0)
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
    }).timeout(200000)
})

describe('Contract: Fee Delegated Contract Deploy', () => {
    const senderTransaction = {
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
    const feePayer = '0x33f524631e573329a550296f595c820d6c65213f'
    const expectedRawTransaction =
        '0x29f902c40980843b9ac9ff80809490b3e9a3770481345a7f17f22f16d020bccfd33eb901fe608060405234801561001057600080fd5b506101de806100206000396000f3006080604052600436106100615763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416631a39d8ef81146100805780636353586b146100a757806370a08231146100ca578063fd6b7ef8146100f8575b3360009081526001602052604081208054349081019091558154019055005b34801561008c57600080fd5b5061009561010d565b60408051918252519081900360200190f35b6100c873ffffffffffffffffffffffffffffffffffffffff60043516610113565b005b3480156100d657600080fd5b5061009573ffffffffffffffffffffffffffffffffffffffff60043516610147565b34801561010457600080fd5b506100c8610159565b60005481565b73ffffffffffffffffffffffffffffffffffffffff1660009081526001602052604081208054349081019091558154019055565b60016020526000908152604090205481565b336000908152600160205260408120805490829055908111156101af57604051339082156108fc029083906000818181858888f193505050501561019c576101af565b3360009081526001602052604090208190555b505600a165627a7a72305820627ca46bb09478a015762806cc00c431230501118c7c26c30ac58c4e09e51c4f00298080f845f84325a0911ca262984630f874c71ea48a3179a47ab90be9b6fc605bb85042f79dfc8490a04319ee2d4c02f5bdf1c0c94e76ed9f7b29515a966e8a9fabd386d0f749fb6d8b9433f524631e573329a550296f595c820d6c65213ff845f84326a0cd71591389fb2ea6433905961788f737e7324fad0721e6482485c4b336480b0fa03d79140258d7e9352c1a560847cf92d32b0136c8f3ad77d450cdca5d66747723'

    it('CAVERJS-UNIT-SER-011 : Sign transaction', async () => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)
        const decoded = caver.klay.decodeTransaction(senderRawTransaction)
        expect(decoded.feePayer).to.equals('0x')
        expect(decoded.payerV).to.equals('0x01')
        expect(decoded.payerR).to.equals('0x')
        expect(decoded.payerS).to.equals('0x')

        const feePayerTransaction = {
            senderRawTransaction,
            feePayer,
            chainId: '0x1',
        }

        const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
        const { rawTransaction } = await caver.klay.accounts.signTransaction(feePayerTransaction, feePayerPrivateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-051: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.to).to.equals(senderTransaction.to)
        expect(caver.utils.hexToNumber(txObj.value)).to.equals(caver.utils.hexToNumber(senderTransaction.value))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(txObj.data).to.equals(senderTransaction.data)
        expect(txObj.humanReadable).to.be.false
        expect(caver.utils.hexToNumber(txObj.codeFormat)).to.equals(0)
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
        expect(txObj.feePayer).to.equals(feePayer)
        expect(txObj.payerV).not.to.be.undefined
        expect(txObj.payerR).not.to.be.undefined
        expect(txObj.payerS).not.to.be.undefined
        expect(txObj.feePayerSignatures).not.to.be.undefined
        expect(txObj.feePayerSignatures[0][0]).to.equals(txObj.payerV)
        expect(txObj.feePayerSignatures[0][1]).to.equals(txObj.payerR)
        expect(txObj.feePayerSignatures[0][2]).to.equals(txObj.payerS)
    }).timeout(200000)
})

describe('Contract: Fee Delegated Contract Deploy With Ratio', () => {
    const senderTransaction = {
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
    const feePayer = '0x33f524631e573329a550296f595c820d6c65213f'
    const expectedRawTransaction =
        '0x2af902c50a80843b9ac9ff80809490b3e9a3770481345a7f17f22f16d020bccfd33eb901fe608060405234801561001057600080fd5b506101de806100206000396000f3006080604052600436106100615763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416631a39d8ef81146100805780636353586b146100a757806370a08231146100ca578063fd6b7ef8146100f8575b3360009081526001602052604081208054349081019091558154019055005b34801561008c57600080fd5b5061009561010d565b60408051918252519081900360200190f35b6100c873ffffffffffffffffffffffffffffffffffffffff60043516610113565b005b3480156100d657600080fd5b5061009573ffffffffffffffffffffffffffffffffffffffff60043516610147565b34801561010457600080fd5b506100c8610159565b60005481565b73ffffffffffffffffffffffffffffffffffffffff1660009081526001602052604081208054349081019091558154019055565b60016020526000908152604090205481565b336000908152600160205260408120805490829055908111156101af57604051339082156108fc029083906000818181858888f193505050501561019c576101af565b3360009081526001602052604090208190555b505600a165627a7a72305820627ca46bb09478a015762806cc00c431230501118c7c26c30ac58c4e09e51c4f0029802180f845f84325a067a99f118cb6305b5491d71e4cbbac0d341f84dc886b22f2462d976200439660a034a83b6163ef4c0b7badae07cd2f74882c3c21079258c9062075fd7b3c455eec9433f524631e573329a550296f595c820d6c65213ff845f84326a0812d8de8d42e7bfdc6c9b8eecc3fe23695d3594c145a109443935212ebd5d1dba02bd1660711b91eb47594521ec3aa76ab13684875fc03f2b278e6a58265b623c7'

    it('CAVERJS-UNIT-SER-012 : Sign transaction', async () => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)
        const decoded = caver.klay.decodeTransaction(senderRawTransaction)
        expect(decoded.feePayer).to.equals('0x')
        expect(decoded.payerV).to.equals('0x01')
        expect(decoded.payerR).to.equals('0x')
        expect(decoded.payerS).to.equals('0x')

        const feePayerTransaction = {
            senderRawTransaction,
            feePayer,
            chainId: '0x1',
        }

        const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
        const { rawTransaction } = await caver.klay.accounts.signTransaction(feePayerTransaction, feePayerPrivateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-052: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.to).to.equals(senderTransaction.to)
        expect(caver.utils.hexToNumber(txObj.value)).to.equals(caver.utils.hexToNumber(senderTransaction.value))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(txObj.data).to.equals(senderTransaction.data)
        expect(txObj.humanReadable).to.be.false
        expect(caver.utils.hexToNumber(txObj.feeRatio)).to.equals(caver.utils.hexToNumber(senderTransaction.feeRatio))
        expect(caver.utils.hexToNumber(txObj.codeFormat)).to.equals(0)
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
        expect(txObj.feePayer).to.equals(feePayer)
        expect(txObj.payerV).not.to.be.undefined
        expect(txObj.payerR).not.to.be.undefined
        expect(txObj.payerS).not.to.be.undefined
        expect(txObj.feePayerSignatures).not.to.be.undefined
        expect(txObj.feePayerSignatures[0][0]).to.equals(txObj.payerV)
        expect(txObj.feePayerSignatures[0][1]).to.equals(txObj.payerR)
        expect(txObj.feePayerSignatures[0][2]).to.equals(txObj.payerS)
    }).timeout(200000)
})

describe('Contract: Contract execution', () => {
    const senderTransaction = {
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

    const expectedRawTransaction =
        '0x30f89e0b19843b9ac9ff945e008646fde91fb6eda7b1fdabc7d84649125cf50a9490b3e9a3770481345a7f17f22f16d020bccfd33ea46353586b00000000000000000000000090b3e9a3770481345a7f17f22f16d020bccfd33ef845f84325a0028f3080511406a4bab318001e44b5b6fd408ba27f45b376ec2e1949f364b570a0154d385b9addf7e39f1e48f84397cab85a95bb6baae884f6ed6f885d1c48f506'

    it('CAVERJS-UNIT-SER-006 : Sign transaction', async () => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-046: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.to).to.equals(senderTransaction.to)
        expect(caver.utils.hexToNumber(txObj.value)).to.equals(caver.utils.hexToNumber(senderTransaction.value))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(txObj.data).to.equals(senderTransaction.data)
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
    }).timeout(200000)
})

describe('Contract: Fee Delegated Contract Execution', () => {
    const senderTransaction = {
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
    const feePayer = '0x33f524631e573329a550296f595c820d6c65213f'
    const expectedRawTransaction =
        '0x31f8fa0c80843b9ac9ff945e008646fde91fb6eda7b1fdabc7d84649125cf50a9490b3e9a3770481345a7f17f22f16d020bccfd33ea46353586b00000000000000000000000090b3e9a3770481345a7f17f22f16d020bccfd33ef845f84326a0b85779d9e3a78189925de6cccbadf31183805f3ee7ce04da259551ed4bd1f697a0712fbeb1fcf1c418f6868c3e442cdc223a7d11f70fad240f2870cbfc4463c8249433f524631e573329a550296f595c820d6c65213ff845f84326a0e597315f311abcedeb03c9f0dce0808b70843250b60351fb2171bbef86dd92d8a038dab32a7e686bbfada4e107b7ba507027f07ae143a92296670c85028381602c'

    it('CAVERJS-UNIT-SER-013 : Sign transaction', async () => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)
        const decoded = caver.klay.decodeTransaction(senderRawTransaction)
        expect(decoded.feePayer).to.equals('0x')
        expect(decoded.payerV).to.equals('0x01')
        expect(decoded.payerR).to.equals('0x')
        expect(decoded.payerS).to.equals('0x')

        const feePayerTransaction = {
            senderRawTransaction,
            feePayer,
            chainId: '0x1',
        }

        const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
        const { rawTransaction } = await caver.klay.accounts.signTransaction(feePayerTransaction, feePayerPrivateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-053: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.to).to.equals(senderTransaction.to)
        expect(caver.utils.hexToNumber(txObj.value)).to.equals(caver.utils.hexToNumber(senderTransaction.value))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(txObj.data).to.equals(senderTransaction.data)
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
        expect(txObj.feePayer).to.equals(feePayer)
        expect(txObj.payerV).not.to.be.undefined
        expect(txObj.payerR).not.to.be.undefined
        expect(txObj.payerS).not.to.be.undefined
        expect(txObj.feePayerSignatures).not.to.be.undefined
        expect(txObj.feePayerSignatures[0][0]).to.equals(txObj.payerV)
        expect(txObj.feePayerSignatures[0][1]).to.equals(txObj.payerR)
        expect(txObj.feePayerSignatures[0][2]).to.equals(txObj.payerS)
    }).timeout(200000)
})

describe('Contract: Fee Delegated Contract Execution With Ratio', () => {
    const senderTransaction = {
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
    const feePayer = '0x33f524631e573329a550296f595c820d6c65213f'
    const expectedRawTransaction =
        '0x32f8fb0d80843b9ac9ff945e008646fde91fb6eda7b1fdabc7d84649125cf50a9490b3e9a3770481345a7f17f22f16d020bccfd33ea46353586b00000000000000000000000090b3e9a3770481345a7f17f22f16d020bccfd33e42f845f84326a05046585d8856e71f6d1c62a3f8caf8b514c22a4d1e1f3425e9a4953a2af5722da059a2bddbc94921a410afbdf1d0c590a58b52e2808bb9805c881fc80e3b51d3f89433f524631e573329a550296f595c820d6c65213ff845f84325a0c0d2c9d0b78b0edd486bfbe20546e3b67947f7a5fa6f348c125d75b465819911a04a3b673b870e9f21f4e7757ef870b6c65798d44d8cef34731225921a91e4a5eb'

    it('CAVERJS-UNIT-SER-014 : Sign transaction', async () => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)
        const decoded = caver.klay.decodeTransaction(senderRawTransaction)
        expect(decoded.feePayer).to.equals('0x')
        expect(decoded.payerV).to.equals('0x01')
        expect(decoded.payerR).to.equals('0x')
        expect(decoded.payerS).to.equals('0x')

        const feePayerTransaction = {
            senderRawTransaction,
            feePayer,
            chainId: '0x1',
        }

        const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
        const { rawTransaction } = await caver.klay.accounts.signTransaction(feePayerTransaction, feePayerPrivateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-054: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.to).to.equals(senderTransaction.to)
        expect(caver.utils.hexToNumber(txObj.value)).to.equals(caver.utils.hexToNumber(senderTransaction.value))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(txObj.data).to.equals(senderTransaction.data)
        expect(caver.utils.hexToNumber(txObj.feeRatio)).to.equals(caver.utils.hexToNumber(senderTransaction.feeRatio))
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
        expect(txObj.feePayer).to.equals(feePayer)
        expect(txObj.payerV).not.to.be.undefined
        expect(txObj.payerR).not.to.be.undefined
        expect(txObj.payerS).not.to.be.undefined
        expect(txObj.feePayerSignatures).not.to.be.undefined
        expect(txObj.feePayerSignatures[0][0]).to.equals(txObj.payerV)
        expect(txObj.feePayerSignatures[0][1]).to.equals(txObj.payerR)
        expect(txObj.feePayerSignatures[0][2]).to.equals(txObj.payerS)
    }).timeout(200000)
})

describe('Cancel: Cancel transaction', () => {
    const senderTransaction = {
        type: 'CANCEL',
        from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
        nonce: '0xe',
        gasPrice: '0x19',
        gas: '0x3b9ac9ff',
        chainId: '0x1',
    }
    const expectedRawTransaction =
        '0x38f8630e19843b9ac9ff9490b3e9a3770481345a7f17f22f16d020bccfd33ef845f84326a0626eff19976452915d2a8c0538e562d4cada07df28818732555028faa820f664a07b2d3a24c805898f2ab876646ed52311928aae7170ed684a1dc61f73cdca8797'

    it('CAVERJS-UNIT-SER-003 : Sign transaction', async () => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-043: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
    }).timeout(200000)
})

describe('Cancel: Fee Delegated Cancel Transaction', () => {
    const senderTransaction = {
        type: 'FEE_DELEGATED_CANCEL',
        from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
        nonce: 15,
        gas: '0x3b9ac9ff',
        gasPrice: '0x19',
        chainId: '0x1',
    }
    const feePayer = '0x33f524631e573329a550296f595c820d6c65213f'
    const expectedRawTransaction =
        '0x39f8bf0f19843b9ac9ff9490b3e9a3770481345a7f17f22f16d020bccfd33ef845f84326a04309d80412c206e604771e2a4b15017f2a0bdfc1f1dd28c9c63dabdc7e8d9ff0a05b98c2c1bb2faae610f791e424444664d6f18d8ed8787bfe66ea6672d974ef349433f524631e573329a550296f595c820d6c65213ff845f84325a062fbaa9cf65a57f61dd680e13f93cacf8ea064211f111cae11222cae6fdfde77a060df7c7b9958d2e10568df83a8e84e7c73b4549075957c344a7848d16fd34915'

    it('CAVERJS-UNIT-SER-009 : Sign transaction', async () => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)
        const decoded = caver.klay.decodeTransaction(senderRawTransaction)
        expect(decoded.feePayer).to.equals('0x')
        expect(decoded.payerV).to.equals('0x01')
        expect(decoded.payerR).to.equals('0x')
        expect(decoded.payerS).to.equals('0x')

        const feePayerTransaction = {
            senderRawTransaction,
            feePayer,
            chainId: '0x1',
        }

        const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
        const { rawTransaction } = await caver.klay.accounts.signTransaction(feePayerTransaction, feePayerPrivateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-049: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
        expect(txObj.feePayer).to.equals(feePayer)
        expect(txObj.payerV).not.to.be.undefined
        expect(txObj.payerR).not.to.be.undefined
        expect(txObj.payerS).not.to.be.undefined
        expect(txObj.feePayerSignatures).not.to.be.undefined
        expect(txObj.feePayerSignatures[0][0]).to.equals(txObj.payerV)
        expect(txObj.feePayerSignatures[0][1]).to.equals(txObj.payerR)
        expect(txObj.feePayerSignatures[0][2]).to.equals(txObj.payerS)
    }).timeout(200000)
})

describe('Cancel: Fee Delegated Cancel Transaction With Ratio', () => {
    const senderTransaction = {
        type: 'FEE_DELEGATED_CANCEL_WITH_RATIO',
        from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
        nonce: 16,
        gas: '0x3b9ac9ff',
        gasPrice: '0x0',
        chainId: '0x1',
        feeRatio: 88,
    }
    const feePayer = '0x33f524631e573329a550296f595c820d6c65213f'
    const expectedRawTransaction =
        '0x3af8c01080843b9ac9ff9490b3e9a3770481345a7f17f22f16d020bccfd33e58f845f84325a0b2af5e8d245f3832f2a08475b5410b59e2a62d7a4d0f68a6ff9efbb057ca3b5aa0622214af859315cb0ea8750f27fc076a293b06c6f3ace05ef19a63d7fbb621489433f524631e573329a550296f595c820d6c65213ff845f84325a09eeb92d4dc4ac12ea3612efe8d8b619f1d6bed9d5868d9a6fff0bab751ac89f5a07c12d76928ea9bc746ba3df8e429c48c8753947553bdfcf05ec51e7db7ade2b2'

    it('CAVERJS-UNIT-SER-010 : Sign transaction', async () => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)
        const decoded = caver.klay.decodeTransaction(senderRawTransaction)
        expect(decoded.feePayer).to.equals('0x')
        expect(decoded.payerV).to.equals('0x01')
        expect(decoded.payerR).to.equals('0x')
        expect(decoded.payerS).to.equals('0x')

        const feePayerTransaction = {
            senderRawTransaction,
            feePayer,
            chainId: '0x1',
        }

        const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
        const { rawTransaction } = await caver.klay.accounts.signTransaction(feePayerTransaction, feePayerPrivateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-050: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(caver.utils.hexToNumber(txObj.feeRatio)).to.equals(caver.utils.hexToNumber(senderTransaction.feeRatio))
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
        expect(txObj.feePayer).to.equals(feePayer)
        expect(txObj.payerV).not.to.be.undefined
        expect(txObj.payerR).not.to.be.undefined
        expect(txObj.payerS).not.to.be.undefined
        expect(txObj.feePayerSignatures).not.to.be.undefined
        expect(txObj.feePayerSignatures[0][0]).to.equals(txObj.payerV)
        expect(txObj.feePayerSignatures[0][1]).to.equals(txObj.payerR)
        expect(txObj.feePayerSignatures[0][2]).to.equals(txObj.payerS)
    }).timeout(200000)
})

describe('ServiceChain: Chain data anchoring', () => {
    const senderTransaction = {
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

    const expectedRawTransaction =
        '0x48f901251119843b9ac9ff9475c3098be5e4b63fbac05838daaee378dd48098d839896809490b3e9a3770481345a7f17f22f16d020bccfd33eb8a8f8a6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000003a0000000000000000000000000000000000000000000000000000000000000000405f844f84225a0578e55342e5d4a1e685e2e332dbe5534fb0c0c19cfe7cf84a1be9461bf876ee99f97529a612ab958bb332316d513ddbb57c11d3f8b1e0f951b05ae791dd225e0'

    it('CAVERJS-UNIT-SER-004 : Sign transaction', async () => {
        const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
        caver.klay.accounts.wallet.add(privateKey)

        const { rawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)

        expect(rawTransaction).to.equal(expectedRawTransaction)
    }).timeout(200000)

    it('CAVERJS-UNIT-SER-044: Decode raw transaction', async () => {
        const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

        expect(txObj).not.to.be.undefined
        expect(txObj.type).to.equals(senderTransaction.type)
        expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
        expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(senderTransaction.gasPrice))
        expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
        expect(txObj.to).to.equals(senderTransaction.to)
        expect(txObj.value).to.equals(senderTransaction.value)
        expect(txObj.from).to.equals(senderTransaction.from)
        expect(txObj.anchoredData).to.equals(senderTransaction.anchoredData)
        expect(txObj.v).not.to.be.undefined
        expect(txObj.r).not.to.be.undefined
        expect(txObj.s).not.to.be.undefined
        expect(txObj.signatures).not.to.be.undefined
        expect(txObj.signatures[0][0]).to.equals(txObj.v)
        expect(txObj.signatures[0][1]).to.equals(txObj.r)
        expect(txObj.signatures[0][2]).to.equals(txObj.s)
    }).timeout(200000)
})

// This test code is not supported yet.
// describe('Account: Account creation', () => {
//     const publicKey = '0xc8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f08144794c27901465af0a703859ab47f8ae17e54aaba453b7cde5a6a9e4a32d45d72b2'

//     const senderTransaction = {
//       type: 'ACCOUNT_CREATION',
//       from: '0x90B3E9A3770481345A7F17f22f16D020Bccfd33e',
//       to: 'colin.klaytn',
//       publicKey,
//       nonce: '0x7',
//       gas: '0x3b9ac9ff',
//       gasPrice: '0x19',
//       value: '0x174876e800',
//       chainId: '0x1',
//     }

//     const expectedRawTransaction = '0x18f8a30719843b9ac9ff94636f6c696e2e6b6c6179746e000000000000000085174876e8009490b3e9a3770481345a7f17f22f16d020bccfd33e01a302a102c8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f081447f845f84326a05065ac8337d2c1bb36a25f720c396b5f012205c0bc4022f6c027b1072410bf18a047b976ab41aa59b513dcc95d859eb687d1388a41921a21eb2d9468b4e8e58392'

//     it('CAVERJS-UNIT-SER-001 : Sign transaction', async () => {
//       const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
//       caver.klay.accounts.wallet.add(privateKey)

//       const { rawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, privateKey)

//       expect(rawTransaction).to.equal(expectedRawTransaction)

//     }).timeout(200000)

//     it('CAVERJS-UNIT-SER-041: Decode raw transaction', async () => {
//       const txObj = caver.klay.decodeTransaction(expectedRawTransaction)

//       expect(txObj).not.to.be.undefined
//       expect(txObj.type).to.equals(senderTransaction.type)
//       expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(senderTransaction.nonce))
//       expect(txObj.gasPrice).to.equals(senderTransaction.gasPrice)
//       expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(senderTransaction.gas))
//       expect(txObj.to).to.equals(senderTransaction.to)
//       expect(txObj.value).to.equals(senderTransaction.value)
//       expect(txObj.from).to.equals(senderTransaction.from)
//       expect(txObj.humanReadable).to.be.true
//       expect(txObj.publicKey).to.equals(caver.utils.compressPublicKey(publicKey))
//       expect(txObj.v).not.to.be.undefined
//       expect(txObj.r).not.to.be.undefined
//       expect(txObj.s).not.to.be.undefined
//     }).timeout(200000)
//   })
