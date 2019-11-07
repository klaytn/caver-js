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

const { expect } = require('chai')
const testRPCURL = require('./testrpc')

const Caver = require('../index.js')

const caver = new Caver(testRPCURL)

let sender
let payer
let receiver

before(() => {
    sender = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
    payer = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
    receiver = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('Decode Transaction', () => {
    it('CAVERJS-UNIT-SER-063: Decode transaction from raw transaction', async () => {
        // This test code is for testing the decodeTransaction for the scenario if it is a feeDelegated transaction type.
        // Check the transaction / decodeTransaction test for test / transactionType.
        const txObj = {
            type: 'FEE_DELEGATED_VALUE_TRANSFER',
            from: sender.address,
            to: receiver.address,
            value: 1,
            gas: 900000,
            nonce: 44,
            chainId: 10000,
            gasPrice: 25000000000,
        }
        let ret = await caver.klay.accounts.signTransaction(txObj, sender.privateKey)

        let decodedTx = caver.klay.decodeTransaction(ret.rawTransaction)

        expect(decodedTx.type).to.equals(txObj.type)
        expect(decodedTx.nonce).to.equals(txObj.nonce)
        expect(caver.utils.hexToNumber(decodedTx.gasPrice)).to.equals(caver.utils.hexToNumber(txObj.gasPrice))
        expect(caver.utils.hexToNumber(decodedTx.gas)).to.equals(caver.utils.hexToNumber(txObj.gas))
        expect(decodedTx.to).to.equals(txObj.to)
        expect(caver.utils.hexToNumber(decodedTx.value)).to.equals(caver.utils.hexToNumber(txObj.value))
        expect(decodedTx.from).to.equals(txObj.from)
        expect(decodedTx.v).not.to.undefined
        expect(decodedTx.r).not.to.undefined
        expect(decodedTx.s).not.to.undefined
        expect(decodedTx.signatures).not.to.be.undefined
        expect(decodedTx.signatures[0][0]).to.equals(decodedTx.v)
        expect(decodedTx.signatures[0][1]).to.equals(decodedTx.r)
        expect(decodedTx.signatures[0][2]).to.equals(decodedTx.s)
        expect(decodedTx.feePayer).to.equals('0x')
        expect(decodedTx.payerV).to.equals('0x01')
        expect(decodedTx.payerR).to.equals('0x')
        expect(decodedTx.payerS).to.equals('0x')

        ret = await caver.klay.accounts.signTransaction(
            {
                senderRawTransaction: ret.rawTransaction,
                feePayer: payer.address,
            },
            payer.privateKey
        )

        decodedTx = caver.klay.decodeTransaction(ret.rawTransaction)

        expect(decodedTx.type).to.equals(txObj.type)
        expect(decodedTx.nonce).to.equals(txObj.nonce)
        expect(caver.utils.hexToNumber(decodedTx.gasPrice)).to.equals(caver.utils.hexToNumber(txObj.gasPrice))
        expect(caver.utils.hexToNumber(decodedTx.gas)).to.equals(caver.utils.hexToNumber(txObj.gas))
        expect(decodedTx.to).to.equals(txObj.to)
        expect(caver.utils.hexToNumber(decodedTx.value)).to.equals(caver.utils.hexToNumber(txObj.value))
        expect(decodedTx.from).to.equals(txObj.from)
        expect(decodedTx.v).not.to.undefined
        expect(decodedTx.r).not.to.undefined
        expect(decodedTx.s).not.to.undefined
        expect(decodedTx.signatures).not.to.be.undefined
        expect(decodedTx.signatures[0][0]).to.equals(decodedTx.v)
        expect(decodedTx.signatures[0][1]).to.equals(decodedTx.r)
        expect(decodedTx.signatures[0][2]).to.equals(decodedTx.s)
        expect(decodedTx.feePayer.toLowerCase()).to.equals(payer.address.toLowerCase())
        expect(decodedTx.payerV).not.to.undefined
        expect(decodedTx.payerR).not.to.undefined
        expect(decodedTx.payerS).not.to.undefined
        expect(decodedTx.feePayerSignatures).not.to.be.undefined
        expect(decodedTx.feePayerSignatures[0][0]).to.equals(decodedTx.payerV)
        expect(decodedTx.feePayerSignatures[0][1]).to.equals(decodedTx.payerR)
        expect(decodedTx.feePayerSignatures[0][2]).to.equals(decodedTx.payerS)
    }).timeout(10000)

    it('CAVERJS-UNIT-SER-064: Decode sender multi signature transaction', () => {
        const rawTransaction =
            '0x08f8c6028505d21dba00830dbba094342a2853b442c66e47cc0aff29836983050bd1850294cde32e19cfa95b0f03de3d09c549d636e43bed22f88ef845824e43a0edb3620ea3a317e36000ab8177342770d245c27c0a641593ffef57a16532578ba028ecaf81729774b97d7c859c064c84095b9d575278dc1b7cc45cd88a29c0cf91f845824e43a0b2874877cb71c847ad33af3d4cb0861ce2b32c6d7649a3c99a213724871cb37ca00c3e960b277623d6298b9ebd5711083321f7caa162aec10cf2eb49e042081cdd'
        const decodedTx = caver.klay.decodeTransaction(rawTransaction)

        expect(decodedTx.type).to.equals('VALUE_TRANSFER')
        expect(caver.utils.hexToNumber(decodedTx.nonce)).to.equals(2)
        expect(caver.utils.hexToNumber(decodedTx.gasPrice)).to.equals(25000000000)
        expect(caver.utils.hexToNumber(decodedTx.gas)).to.equals(900000)
        expect(decodedTx.to).to.equals('0x342a2853b442c66e47cc0aff29836983050bd185')
        expect(caver.utils.hexToNumber(decodedTx.value)).to.equals(2)
        expect(decodedTx.from).to.equals('0xcde32e19cfa95b0f03de3d09c549d636e43bed22')
        expect(decodedTx.v).not.to.undefined
        expect(decodedTx.r).not.to.undefined
        expect(decodedTx.s).not.to.undefined
        expect(decodedTx.signatures).not.to.be.undefined
        expect(Array.isArray(decodedTx.signatures)).to.be.true
        expect(decodedTx.signatures.length).to.equals(2)
        expect(decodedTx.signatures[0][0]).to.equals(decodedTx.v)
        expect(decodedTx.signatures[0][1]).to.equals(decodedTx.r)
        expect(decodedTx.signatures[0][2]).to.equals(decodedTx.s)
    }).timeout(10000)

    it('CAVERJS-UNIT-SER-065: Decode sender and feePayer multi signature transaction', () => {
        const rawTransaction =
            '0x09f9016b018505d21dba00830dbba094ca4f2df6e617e340eb2004453e3cc449a8e51d9803946b0f4bb65b4bb4c92d55b1e8574cf8059f3b2da8f88ef845824e43a0cc14fd91517649de4f3e1e2729fa63dfb2ae401e5da54fa52f305fff445d803fa07e134086a557f28847aa689207bc4375bb69cae64ba6356dedc60d8c93929131f845824e44a07d90c9385ae713199f9c4016e06da63af4956294cd66329edc6bf925f03dbfc3a04802101f506df137b218a0880e5b78585c8b7074ecc246950b8e59473d8816de946b0f4bb65b4bb4c92d55b1e8574cf8059f3b2da8f88ef845824e43a09696eec79df68c33ef2dd43302ebb3e18193266d49d805897d0591c6a7e07de0a051b2467e9f84f75c7f1473c3d709df3c13c6824fdf2061c13fe1c41c6ea24155f845824e43a0f7615987a2eeed696d90405b950e26dde93d35ff2fd9d6d94838dc71a209a017a05811cf04dce40d76873ca9ce02a72bcd5b2e748274dc11cd6cfcd34c14cf49e1'
        const decodedTx = caver.klay.decodeTransaction(rawTransaction)

        expect(decodedTx.type).to.equals('FEE_DELEGATED_VALUE_TRANSFER')
        expect(caver.utils.hexToNumber(decodedTx.nonce)).to.equals(1)
        expect(caver.utils.hexToNumber(decodedTx.gasPrice)).to.equals(25000000000)
        expect(caver.utils.hexToNumber(decodedTx.gas)).to.equals(900000)
        expect(decodedTx.to).to.equals('0xca4f2df6e617e340eb2004453e3cc449a8e51d98')
        expect(caver.utils.hexToNumber(decodedTx.value)).to.equals(3)
        expect(decodedTx.from).to.equals('0x6b0f4bb65b4bb4c92d55b1e8574cf8059f3b2da8')
        expect(decodedTx.v).not.to.undefined
        expect(decodedTx.r).not.to.undefined
        expect(decodedTx.s).not.to.undefined
        expect(decodedTx.signatures).not.to.be.undefined
        expect(Array.isArray(decodedTx.signatures)).to.be.true
        expect(decodedTx.signatures.length).to.equals(2)
        expect(decodedTx.signatures[0][0]).to.equals(decodedTx.v)
        expect(decodedTx.signatures[0][1]).to.equals(decodedTx.r)
        expect(decodedTx.signatures[0][2]).to.equals(decodedTx.s)
        expect(decodedTx.feePayer).to.equals('0x6b0f4bb65b4bb4c92d55b1e8574cf8059f3b2da8')
        expect(decodedTx.payerV).not.to.undefined
        expect(decodedTx.payerR).not.to.undefined
        expect(decodedTx.payerS).not.to.undefined
        expect(decodedTx.feePayerSignatures).not.to.be.undefined
        expect(Array.isArray(decodedTx.feePayerSignatures)).to.be.true
        expect(decodedTx.feePayerSignatures.length).to.equals(2)
        expect(decodedTx.feePayerSignatures[0][0]).to.equals(decodedTx.payerV)
        expect(decodedTx.feePayerSignatures[0][1]).to.equals(decodedTx.payerR)
        expect(decodedTx.feePayerSignatures[0][2]).to.equals(decodedTx.payerS)
    }).timeout(10000)
})
