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
const assert = require('assert')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')
const {decodeFromRawTransaction} = require('../../packages/caver-klay/caver-klay-accounts/src/makeRawTransaction')

let caver
var senderPrvKey, payerPrvKey
var senderAddress, payerAddress
var testAccount

before(() => {
  caver = new Caver(testRPCURL)
  senderPrvKey = process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
      ? '0x' + process.env.privateKey
      : process.env.privateKey
  payerPrvKey = process.env.privateKey2 && String(process.env.privateKey2).indexOf('0x') === -1
      ? '0x' + process.env.privateKey2
      : process.env.privateKey2

  caver.klay.accounts.wallet.add(senderPrvKey)
  caver.klay.accounts.wallet.add(payerPrvKey)

  const sender = caver.klay.accounts.privateKeyToAccount(senderPrvKey)
  senderAddress = sender.address
  const payer = caver.klay.accounts.privateKeyToAccount(payerPrvKey)
  payerAddress = payer.address

  testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('Value transfer memo with ratio: Fee Delegated Value Transfer Memo With Ratio', () => {
  const sender_transaction = {
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
  const expectedRawTransaction = '0x12f8df0619843b9ac9ff9475c3098be5e4b63fbac05838daaee378dd48098d839896809490b3e9a3770481345a7f17f22f16d020bccfd33e8568656c6c6f1ef845f84326a0f8284ce7dc9d7adbcb1c0ad1a80b12995eae39415927827f2020cb34d141bc9ea074a388f86ec887a94873c472f5bd22ec91051765f059ef250411f1aeda6daa159433f524631e573329a550296f595c820d6c65213ff845f84325a0e701b6ceaab17fbbe745edd32e26deb752468f0b2f5614372bce2098e3101baea06f4192982e093e604b64933fc942c94d6cf2ecbe285fffd35488308bae6b9f51'
  
  it('CAVERJS-UNIT-SER-017 : Sign transaction', async () => {
    const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

    caver.klay.accounts.wallet.add(privateKey)

    const { rawTransaction: senderRawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)
    const decoded = decodeFromRawTransaction(senderRawTransaction)
    expect(decoded.feePayer).to.equals('0x')
    expect(decoded.payerV).to.equals('0x01')
    expect(decoded.payerR).to.equals('0x')
    expect(decoded.payerS).to.equals('0x')

    const fee_payer_transaction = {
      senderRawTransaction: senderRawTransaction,
      feePayer,
      chainId: '0x1',
    }

    const feePayerPrivateKey = '0xb9d5558443585bca6f225b935950e3f6e69f9da8a5809a83f51c3365dff53936'
    const { rawTransaction } = await caver.klay.accounts.signTransaction(fee_payer_transaction, feePayerPrivateKey)

    expect(rawTransaction).to.equal(expectedRawTransaction)

  }).timeout(200000)

  it('CAVERJS-UNIT-SER-057: Decode raw transaction', async () => {
    const txObj = decodeFromRawTransaction(expectedRawTransaction)
    
    expect(txObj).not.to.be.undefined
    expect(txObj.type).to.equals(sender_transaction.type)
    expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(sender_transaction.nonce))
    expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(sender_transaction.gasPrice))
    expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(sender_transaction.gas))
    expect(txObj.to).to.equals(sender_transaction.to)
    expect(caver.utils.hexToNumber(txObj.value)).to.equals(caver.utils.hexToNumber(sender_transaction.value))
    expect(txObj.from).to.equals(sender_transaction.from)
    expect(txObj.data).to.equals(sender_transaction.data)
    expect(caver.utils.hexToNumber(txObj.feeRatio)).to.equals(caver.utils.hexToNumber(sender_transaction.feeRatio))
    expect(txObj.v).not.to.be.undefined
    expect(txObj.r).not.to.be.undefined
    expect(txObj.s).not.to.be.undefined
    expect(txObj.feePayer).to.equals(feePayer)
    expect(txObj.payerV).not.to.be.undefined
    expect(txObj.payerR).not.to.be.undefined
    expect(txObj.payerS).not.to.be.undefined
  }).timeout(200000)
})

describe('FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO transaction', () => {
  var feeDelegatedValueTransferMemoWithRatioObject

  beforeEach(() => {
    feeDelegatedValueTransferMemoWithRatioObject = {
      type: 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO',
      from: senderAddress,
      to: testAccount.address,
      value: 1,
      gas: 900000,
      feeRatio: 30,
      data: '0x68656c6c6f',
    }
  })

  it('If transaction object has all essential value, sendTransaction should not return error', async() => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey).then(async(ret) => {
      await caver.klay.sendTransaction({
        senderRawTransaction: ret.rawTransaction,
        feePayer: payerAddress,
      }).then(()=>result = true)
      .catch(()=>result = false)
    }).catch(()=>result = false)

    expect(result).to.be.true
  }).timeout(200000)

  // Error from missing
  it('CAVERJS-UNIT-TX-094 : If transaction object missing from, signTransaction should throw error', async() => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
    delete tx.from

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-094 : If transaction object missing from, sendTransaction should throw error', () => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
    delete tx.from

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error to missing
  it('CAVERJS-UNIT-TX-095 : If transaction object missing to, signTransaction should throw error', async() => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
    delete tx.to

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-095 : If transaction object missing to, sendTransaction should throw error', () => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
    delete tx.to

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error value missing
  it('CAVERJS-UNIT-TX-096 : If transaction object missing value, signTransaction should throw error', async() => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
    delete tx.value

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-096 : If transaction object missing value, sendTransaction should throw error', () => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
    delete tx.value

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error gas and gasLimit missing
  it('CAVERJS-UNIT-TX-097 : If transaction object missing gas and gasLimit, signTransaction should throw error', async() => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
    delete tx.gas

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-097 : If transaction object missing gas and gasLimit, sendTransaction should throw error', () => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
    delete tx.gas

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error data missing
  it('CAVERJS-UNIT-TX-098 : If transaction object missing data, signTransaction should throw error', async() => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
    delete tx.data

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-098 : If transaction object missing data, sendTransaction should throw error', () => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
    delete tx.data

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error feePayer missing (A check on the feePayer is performed when the feePayer attempts to sign the rawTransaction after sender signed.)
  it('CAVERJS-UNIT-TX-099 : If transaction object missing feePayer, signTransaction should throw error', () => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)

    caver.klay.accounts.signTransaction(tx, senderPrvKey).then((ret) => {
      expect(()=>caver.klay.sendTransaction({senderRawTransaction: ret.rawTransaction})).to.throws()
    })
  }).timeout(200000)

  // Error senderRawTransaction missing (A check on the senderRawTransaction is performed when the feePayer attempts to sign the rawTransaction after sender signed.)
  it('CAVERJS-UNIT-TX-100 : If transaction object missing senderRawTransaction, signTransaction should throw error', () => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)

    caver.klay.accounts.signTransaction(tx, senderPrvKey).then((ret) => {
      expect(()=>caver.klay.sendTransaction({feePayer: payerAddress})).to.throws()
    })
  }).timeout(200000)

  // Error feeRatio missing
  it('CAVERJS-UNIT-TX-101 : If transaction object missing feeRatio, signTransaction should throw error', async() => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
    delete tx.feeRatio

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-101 : If transaction object missing feeRatio, sendTransaction should throw error', () => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoWithRatioObject)
    delete tx.feeRatio

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary publicKey
  it('CAVERJS-UNIT-TX-102 : If transaction object has unnecessary publicKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4'}, feeDelegatedValueTransferMemoWithRatioObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-102 : If transaction object has unnecessary publicKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4'}, feeDelegatedValueTransferMemoWithRatioObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary multisig
  it('CAVERJS-UNIT-TX-103 : If transaction object has unnecessary multisig field, signTransaction should throw error', async() => {
    const multisig = {
      threshold: 3,
      keys: [
        { weight: 1, publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4' },
        { weight: 1, publicKey: '0x8244b727f63656f0c6c6923395b67cb293342de66557d26409fb0e6de96d74a58e20479c531ef99b86699969dcf0ff5c9545bf893f1aaeb20de1978b3e6bc89e' },
        { weight: 1, publicKey: '0x3c63118f279933d6530ffb3ca46d2473dec1ed94b9829d290e8aa8ac8b384c9d3d79a4596abbc172d1ac6b97c079f7a6c3a7902471a20a09ab4139858352fb4f' },
        { weight: 1, publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c' },
      ],
    }
    const tx = Object.assign({multisig}, feeDelegatedValueTransferMemoWithRatioObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-103 : If transaction object has unnecessary multisig field, sendTransaction should throw error', () => {
    const multisig = {
      threshold: 3,
      keys: [
        { weight: 1, publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4' },
        { weight: 1, publicKey: '0x8244b727f63656f0c6c6923395b67cb293342de66557d26409fb0e6de96d74a58e20479c531ef99b86699969dcf0ff5c9545bf893f1aaeb20de1978b3e6bc89e' },
        { weight: 1, publicKey: '0x3c63118f279933d6530ffb3ca46d2473dec1ed94b9829d290e8aa8ac8b384c9d3d79a4596abbc172d1ac6b97c079f7a6c3a7902471a20a09ab4139858352fb4f' },
        { weight: 1, publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c' },
      ],
    }
    const tx = Object.assign({multisig}, feeDelegatedValueTransferMemoWithRatioObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary roleTransactionKey
  it('CAVERJS-UNIT-TX-104 : If transaction object has unnecessary roleTransactionKey field, signTransaction should throw error', async() => {
    const roleTransactionKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleTransactionKey}, feeDelegatedValueTransferMemoWithRatioObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-104 : If transaction object has unnecessary roleTransactionKey field, sendTransaction should throw error', () => {
    const roleTransactionKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleTransactionKey}, feeDelegatedValueTransferMemoWithRatioObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary roleAccountUpdateKey
  it('CAVERJS-UNIT-TX-105 : If transaction object has unnecessary roleAccountUpdateKey field, signTransaction should throw error', async() => {
    const roleAccountUpdateKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleAccountUpdateKey}, feeDelegatedValueTransferMemoWithRatioObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-105 : If transaction object has unnecessary roleAccountUpdateKey field, sendTransaction should throw error', () => {
    const roleAccountUpdateKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleAccountUpdateKey}, feeDelegatedValueTransferMemoWithRatioObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary roleFeePayerKey
  it('CAVERJS-UNIT-TX-106 : If transaction object has unnecessary roleFeePayerKey field, signTransaction should throw error', async() => {
    const roleFeePayerKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleFeePayerKey}, feeDelegatedValueTransferMemoWithRatioObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-106 : If transaction object has unnecessary roleFeePayerKey field, sendTransaction should throw error', () => {
    const roleFeePayerKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleFeePayerKey}, feeDelegatedValueTransferMemoWithRatioObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary failKey
  it('CAVERJS-UNIT-TX-107 : If transaction object has unnecessary failKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({failKey: true}, feeDelegatedValueTransferMemoWithRatioObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-107 : If transaction object has unnecessary failKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true}, feeDelegatedValueTransferMemoWithRatioObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary codeFormat
  it('CAVERJS-UNIT-TX-108 : If transaction object has unnecessary codeFormat field, signTransaction should throw error', async() => {
    const tx = Object.assign({codeFormat: 'EVM'}, feeDelegatedValueTransferMemoWithRatioObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-108 : If transaction object has unnecessary codeFormat field, sendTransaction should throw error', () => {
    const tx = Object.assign({codeFormat: 'EVM'}, feeDelegatedValueTransferMemoWithRatioObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // UnnecessaryLegacyKey
  it('CAVERJS-UNIT-TX-564 : If transaction object has unnecessary legacyKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({legacyKey: true}, feeDelegatedValueTransferMemoWithRatioObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"legacyKey" cannot be used with FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-564 : If transaction object has unnecessary legacyKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true}, feeDelegatedValueTransferMemoWithRatioObject)
    
    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"legacyKey" cannot be used with FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO transaction')
  }).timeout(200000)
})