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

describe('Value transfer: Fee Delegated Value Transfer Memo', () => {
  const sender_transaction = {
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
  const expectedRawTransaction = '0x11f8de0519843b9ac9ff9475c3098be5e4b63fbac05838daaee378dd48098d839896809490b3e9a3770481345a7f17f22f16d020bccfd33e8568656c6c6ff845f84325a028dc6454a57e6e9ae75760238fe4a791095f7acec08c097182cc70c07cc4af4fa0143c38af597ea5e88021ad1652b2b7373c0650d45f1c59927fabb85b75dbfe5d9433f524631e573329a550296f595c820d6c65213ff845f84325a0c95c415de41ba4b4098edd4b5405e39b486878a953c512507ce80126a78f9f0ea0699aca3c3a4deacc9629359a40a5aa1f51a9bbb909131c68a33e0a708276536b'

  it('CAVERJS-UNIT-SER-016 : Sign transaction', async () => {
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

  it('CAVERJS-UNIT-SER-056: Decode raw transaction', async () => {
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
    expect(txObj.v).not.to.be.undefined
    expect(txObj.r).not.to.be.undefined
    expect(txObj.s).not.to.be.undefined
    expect(txObj.feePayer).to.equals(feePayer)
    expect(txObj.payerV).not.to.be.undefined
    expect(txObj.payerR).not.to.be.undefined
    expect(txObj.payerS).not.to.be.undefined
  }).timeout(200000)
})

describe('FEE_DELEGATED_VALUE_TRANSFER_MEMO transaction', () => {
  var feeDelegatedValueTransferMemoObject

  beforeEach(() => {
    feeDelegatedValueTransferMemoObject = {
      type: 'FEE_DELEGATED_VALUE_TRANSFER_MEMO',
      from: senderAddress,
      to: testAccount.address,
      value: 1,
      gas: 900000,
      data: '0x68656c6c6f',
    }
  })

  it('If transaction object has all essential value, sendTransaction should not return error', async() => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoObject)

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
  it('CAVERJS-UNIT-TX-079 : If transaction object missing from, signTransaction should throw error', async() => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoObject)
    delete tx.from

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-079 : If transaction object missing from, sendTransaction should throw error', () => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoObject)
    delete tx.from

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error to missing
  it('CAVERJS-UNIT-TX-080 : If transaction object missing to, signTransaction should throw error', async() => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoObject)
    delete tx.to

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-080 : If transaction object missing to, sendTransaction should throw error', () => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoObject)
    delete tx.to

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error value missing
  it('CAVERJS-UNIT-TX-081 : If transaction object missing value, signTransaction should throw error', async() => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoObject)
    delete tx.value

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-081 : If transaction object missing value, sendTransaction should throw error', () => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoObject)
    delete tx.value

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error gas and gasLimit missing
  it('CAVERJS-UNIT-TX-082 : If transaction object missing gas and gasLimit, signTransaction should throw error', async() => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoObject)
    delete tx.gas

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-082 : If transaction object missing gas and gasLimit, sendTransaction should throw error', () => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoObject)
    delete tx.gas

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error data missing
  it('CAVERJS-UNIT-TX-083 : If transaction object missing data, signTransaction should throw error', async() => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoObject)
    delete tx.data

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-083 : If transaction object missing data, sendTransaction should throw error', () => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoObject)
    delete tx.data

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error feePayer missing (A check on the feePayer is performed when the feePayer attempts to sign the rawTransaction after sender signed.)
  it('CAVERJS-UNIT-TX-084 : If transaction object missing feePayer, signTransaction should throw error', () => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoObject)

    caver.klay.accounts.signTransaction(tx, senderPrvKey).then((ret) => {
      expect(()=>caver.klay.sendTransaction({senderRawTransaction: ret.rawTransaction})).to.throws()
    })
  }).timeout(200000)

  // Error senderRawTransaction missing (A check on the senderRawTransaction is performed when the feePayer attempts to sign the rawTransaction after sender signed.)
  it('CAVERJS-UNIT-TX-085 : If transaction object missing senderRawTransaction, signTransaction should throw error', () => {
    const tx = Object.assign({}, feeDelegatedValueTransferMemoObject)

    caver.klay.accounts.signTransaction(tx, senderPrvKey).then((ret) => {
      expect(()=>caver.klay.sendTransaction({feePayer: payerAddress})).to.throws()
    })
  }).timeout(200000)

  // Error unnecessary feeRatio
  it('CAVERJS-UNIT-TX-086 : If transaction object has unnecessary feeRatio field, signTransaction should throw error', async() => {
    const tx = Object.assign({feeRatio: 20}, feeDelegatedValueTransferMemoObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-086 : If transaction object has unnecessary feeRatio field, sendTransaction should throw error', () => {
    const tx = Object.assign({feeRatio: 20}, feeDelegatedValueTransferMemoObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary publicKey
  it('CAVERJS-UNIT-TX-087 : If transaction object has unnecessary publicKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4'}, feeDelegatedValueTransferMemoObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-087 : If transaction object has unnecessary publicKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4'}, feeDelegatedValueTransferMemoObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary multisig
  it('CAVERJS-UNIT-TX-088 : If transaction object has unnecessary multisig field, signTransaction should throw error', async() => {
    const multisig = {
      threshold: 3,
      keys: [
        { weight: 1, publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4' },
        { weight: 1, publicKey: '0x8244b727f63656f0c6c6923395b67cb293342de66557d26409fb0e6de96d74a58e20479c531ef99b86699969dcf0ff5c9545bf893f1aaeb20de1978b3e6bc89e' },
        { weight: 1, publicKey: '0x3c63118f279933d6530ffb3ca46d2473dec1ed94b9829d290e8aa8ac8b384c9d3d79a4596abbc172d1ac6b97c079f7a6c3a7902471a20a09ab4139858352fb4f' },
        { weight: 1, publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c' },
      ],
    }
    const tx = Object.assign({multisig}, feeDelegatedValueTransferMemoObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-088 : If transaction object has unnecessary multisig field, sendTransaction should throw error', () => {
    const multisig = {
      threshold: 3,
      keys: [
        { weight: 1, publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4' },
        { weight: 1, publicKey: '0x8244b727f63656f0c6c6923395b67cb293342de66557d26409fb0e6de96d74a58e20479c531ef99b86699969dcf0ff5c9545bf893f1aaeb20de1978b3e6bc89e' },
        { weight: 1, publicKey: '0x3c63118f279933d6530ffb3ca46d2473dec1ed94b9829d290e8aa8ac8b384c9d3d79a4596abbc172d1ac6b97c079f7a6c3a7902471a20a09ab4139858352fb4f' },
        { weight: 1, publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c' },
      ],
    }
    const tx = Object.assign({multisig}, feeDelegatedValueTransferMemoObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary roleTransactionKey
  it('CAVERJS-UNIT-TX-089 : If transaction object has unnecessary roleTransactionKey field, signTransaction should throw error', async() => {
    const roleTransactionKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleTransactionKey}, feeDelegatedValueTransferMemoObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-089 : If transaction object has unnecessary roleTransactionKey field, sendTransaction should throw error', () => {
    const roleTransactionKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleTransactionKey}, feeDelegatedValueTransferMemoObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary roleAccountUpdateKey
  it('CAVERJS-UNIT-TX-090 : If transaction object has unnecessary roleAccountUpdateKey field, signTransaction should throw error', async() => {
    const roleAccountUpdateKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleAccountUpdateKey}, feeDelegatedValueTransferMemoObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-090 : If transaction object has unnecessary roleAccountUpdateKey field, sendTransaction should throw error', () => {
    const roleAccountUpdateKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleAccountUpdateKey}, feeDelegatedValueTransferMemoObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary roleFeePayerKey
  it('CAVERJS-UNIT-TX-091 : If transaction object has unnecessary roleFeePayerKey field, signTransaction should throw error', async() => {
    const roleFeePayerKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleFeePayerKey}, feeDelegatedValueTransferMemoObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-091 : If transaction object has unnecessary roleFeePayerKey field, sendTransaction should throw error', () => {
    const roleFeePayerKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleFeePayerKey}, feeDelegatedValueTransferMemoObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary failKey
  it('CAVERJS-UNIT-TX-092 : If transaction object has unnecessary failKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({failKey: true}, feeDelegatedValueTransferMemoObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-092 : If transaction object has unnecessary failKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true}, feeDelegatedValueTransferMemoObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary codeFormat
  it('CAVERJS-UNIT-TX-093 : If transaction object has unnecessary codeFormat field, signTransaction should throw error', async() => {
    const tx = Object.assign({codeFormat: 'EVM'}, feeDelegatedValueTransferMemoObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-093 : If transaction object has unnecessary codeFormat field, sendTransaction should throw error', () => {
    const tx = Object.assign({codeFormat: 'EVM'}, feeDelegatedValueTransferMemoObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // UnnecessaryLegacyKey
  it('CAVERJS-UNIT-TX-563 : If transaction object has unnecessary legacyKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({legacyKey: true}, feeDelegatedValueTransferMemoObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"legacyKey" cannot be used with FEE_DELEGATED_VALUE_TRANSFER_MEMO transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-563 : If transaction object has unnecessary legacyKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true}, feeDelegatedValueTransferMemoObject)
    
    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"legacyKey" cannot be used with FEE_DELEGATED_VALUE_TRANSFER_MEMO transaction')
  }).timeout(200000)
})