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
var senderPrvKey
var senderAddress
var testAccount

before(() => {
  caver = new Caver(testRPCURL)
  senderPrvKey = process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
      ? '0x' + process.env.privateKey
      : process.env.privateKey

  caver.klay.accounts.wallet.add(senderPrvKey)

  const sender = caver.klay.accounts.privateKeyToAccount(senderPrvKey)
  senderAddress = sender.address

  testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
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
  const expectedRawTransaction = '0xf8668019843b9ac9ff94d03227635c90c7986f0e3a4e551cefbca8c5531685174876e8008025a0399466cac18fe56a0607adea3de14a8d1dca4b3445080361246ec125adb2a1f3a06d187fdceed7e5c9d1b9142cbd368ce615f77bbedebf1df3a05166c8561d71c4'
  
  it('CAVERJS-UNIT-SER-019 : Sign transaction', (done) => {
    const privateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'

    caver.klay.accounts.wallet.add(privateKey)

    caver.klay.accounts.signTransaction(transaction, privateKey)
      .then(({ rawTransaction }) => {
        expect(rawTransaction).to.equal(expectedRawTransaction)
        done()
      })
      .catch(done)
  }).timeout(200000)

  it('CAVERJS-UNIT-SER-059: Decode raw transaction', async () => {
    const txObj = decodeFromRawTransaction(expectedRawTransaction)
    
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
  }).timeout(200000)
})

describe('LEGACY transaction', () => {
  var legacyObject

  beforeEach(() => {
    legacyObject = {
      from: senderAddress,
      to: testAccount.address,
      gas: '0x3b9ac9ff',
      data: '0x60806040526000805534801561001457600080fd5b5060405161016f38038061016f8339810180604052810190808051906020019092919080518201929190505050816000819055505050610116806100596000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a723058206d2bc553736581b6387f9a0410856ca490fcdc7045a8991ad63a1fd71b651c3a0029000000000000000000000000000000000000000000000000000000000000007b000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000037374720000000000000000000000000000000000000000000000000000000000',
    }
  })

  it('If transaction object has all essential value(without data), sendTransaction should not return error', async () => {
    const tx = Object.assign({}, legacyObject)
    delete tx.data

    var result
    await caver.klay.sendTransaction(tx)
      .then(()=>result = true)
      .catch(()=>result = false)

    expect(result).to.be.true
  }).timeout(200000)

  it('If transaction object has all essential value(without to), sendTransaction should not return error', async() => {
    const tx = Object.assign({}, legacyObject)
    delete tx.to

    var result
    await caver.klay.sendTransaction(tx)
      .then(()=>result = true)
      .catch(()=>result = false)

    expect(result).to.be.true
  }).timeout(200000)

  // Error from missing
  it('CAVERJS-UNIT-TX-009 : If transaction object missing from, signTransaction should throw error', async() => {
    const tx = Object.assign({}, legacyObject)
    delete tx.from

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-009 : If transaction object missing from, sendTransaction should throw error', () => {
    const tx = Object.assign({}, legacyObject)
    delete tx.from

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error gas and gasLimit missing
  it('CAVERJS-UNIT-TX-010 : If transaction object missing gas and gasLimit, signTransaction should throw error', async() => {
    const tx = Object.assign({}, legacyObject)
    delete tx.gas

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-010 : If transaction object missing gas and gasLimit, sendTransaction should throw error', () => {
    const tx = Object.assign({}, legacyObject)
    delete tx.gas

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error to and data missing
  it('CAVERJS-UNIT-TX-011 : If transaction object missing to and data, signTransaction should throw error', async() => {
    const tx = Object.assign({}, legacyObject)
    delete tx.to
    delete tx.data

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-011 : If transaction object missing to and data, sendTransaction should throw error', () => {
    const tx = Object.assign({}, legacyObject)
    delete tx.to
    delete tx.data

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary feePayer
  it('CAVERJS-UNIT-TX-012 : If transaction object has unnecessary feePayer field, signTransaction should throw error', async() => {
    const tx = Object.assign({feePayer: testAccount.address}, legacyObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-012 : If transaction object has unnecessary feePayer field, sendTransaction should throw error', () => {
    const tx = Object.assign({feePayer: testAccount.address}, legacyObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary feeRatio
  it('CAVERJS-UNIT-TX-013 : If transaction object has unnecessary feeRatio field, signTransaction should throw error', async() => {
    const tx = Object.assign({feeRatio: 20}, legacyObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-013 : If transaction object has unnecessary feeRatio field, sendTransaction should throw error', () => {
    const tx = Object.assign({feeRatio: 20}, legacyObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary publicKey
  it('CAVERJS-UNIT-TX-014 : If transaction object has unnecessary publicKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4'}, legacyObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-014 : If transaction object has unnecessary publicKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4'}, legacyObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary multisig
  it('CAVERJS-UNIT-TX-015 : If transaction object has unnecessary multisig field, signTransaction should throw error', async() => {
    const multisig = {
      threshold: 3,
      keys: [
        { weight: 1, publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4' },
        { weight: 1, publicKey: '0x8244b727f63656f0c6c6923395b67cb293342de66557d26409fb0e6de96d74a58e20479c531ef99b86699969dcf0ff5c9545bf893f1aaeb20de1978b3e6bc89e' },
        { weight: 1, publicKey: '0x3c63118f279933d6530ffb3ca46d2473dec1ed94b9829d290e8aa8ac8b384c9d3d79a4596abbc172d1ac6b97c079f7a6c3a7902471a20a09ab4139858352fb4f' },
        { weight: 1, publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c' },
      ],
    }
    const tx = Object.assign({multisig}, legacyObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-015 : If transaction object has unnecessary multisig field, sendTransaction should throw error', () => {
    const multisig = {
      threshold: 3,
      keys: [
        { weight: 1, publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4' },
        { weight: 1, publicKey: '0x8244b727f63656f0c6c6923395b67cb293342de66557d26409fb0e6de96d74a58e20479c531ef99b86699969dcf0ff5c9545bf893f1aaeb20de1978b3e6bc89e' },
        { weight: 1, publicKey: '0x3c63118f279933d6530ffb3ca46d2473dec1ed94b9829d290e8aa8ac8b384c9d3d79a4596abbc172d1ac6b97c079f7a6c3a7902471a20a09ab4139858352fb4f' },
        { weight: 1, publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c' },
      ],
    }
    const tx = Object.assign({multisig}, legacyObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary roleTransactionKey
  it('CAVERJS-UNIT-TX-016 : If transaction object has unnecessary roleTransactionKey field, signTransaction should throw error', async() => {
    const roleTransactionKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleTransactionKey}, legacyObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-016 : If transaction object has unnecessary roleTransactionKey field, sendTransaction should throw error', () => {
    const roleTransactionKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleTransactionKey}, legacyObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary roleAccountUpdateKey
  it('CAVERJS-UNIT-TX-017 : If transaction object has unnecessary roleAccountUpdateKey field, signTransaction should throw error', async() => {
    const roleAccountUpdateKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleAccountUpdateKey}, legacyObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-017 : If transaction object has unnecessary roleAccountUpdateKey field, sendTransaction should throw error', () => {
    const roleAccountUpdateKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleAccountUpdateKey}, legacyObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary roleFeePayerKey
  it('CAVERJS-UNIT-TX-018 : If transaction object has unnecessary roleFeePayerKey field, signTransaction should throw error', async() => {
    const roleFeePayerKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleFeePayerKey}, legacyObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-018 : If transaction object has unnecessary roleFeePayerKey field, sendTransaction should throw error', () => {
    const roleFeePayerKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleFeePayerKey}, legacyObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary failKey
  it('CAVERJS-UNIT-TX-019 : If transaction object has unnecessary failKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({failKey: true}, legacyObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-019 : If transaction object has unnecessary failKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true}, legacyObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Error unnecessary codeFormat
  it('CAVERJS-UNIT-TX-020 : If transaction object has unnecessary codeFormat field, signTransaction should throw error', async() => {
    const tx = Object.assign({codeFormat: 'EVM'}, legacyObject)

    var result
    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>result = false)
      .catch(()=>result = true)
    expect(result).to.be.true
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-020 : If transaction object has unnecessary codeFormat field, sendTransaction should throw error', () => {
    const tx = Object.assign({codeFormat: 'EVM'}, legacyObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // UnnecessaryLegacyKey
  it('CAVERJS-UNIT-TX-558 : If transaction object has unnecessary legacyKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({legacyKey: true}, legacyObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"legacyKey" cannot be used with LEGACY transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-558 : If transaction object has unnecessary legacyKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true}, legacyObject)
    
    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"legacyKey" cannot be used with LEGACY transaction')
  }).timeout(200000)
})
