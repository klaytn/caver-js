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

let caver
var senderPrvKey
var senderAddress
var testAccount

before(() => {
  caver = new Caver(testRPCURL)
  if (process.env.privateKey) {
    senderPrvKey = process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
      ? '0x' + process.env.privateKey
      : process.env.privateKey

    caver.klay.accounts.wallet.add(senderPrvKey)
  
    const sender = caver.klay.accounts.privateKeyToAccount(senderPrvKey)
    senderAddress = sender.address
  } else {
    const sender = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
    senderPrvKey = sender.privateKey
    senderAddress = sender.address
  }
  
  testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
})

describe('FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction', () => {
  var deployObject

  beforeEach(() => {
    deployObject = {
        type: 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY',
        from: senderAddress,
        value: 0,
        gas: 900000,
        data: '0x608060405234801561001057600080fd5b506101de806100206000396000f3006080604052600436106100615763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416631a39d8ef81146100805780636353586b146100a757806370a08231146100ca578063fd6b7ef8146100f8575b3360009081526001602052604081208054349081019091558154019055005b34801561008c57600080fd5b5061009561010d565b60408051918252519081900360200190f35b6100c873ffffffffffffffffffffffffffffffffffffffff60043516610113565b005b3480156100d657600080fd5b5061009573ffffffffffffffffffffffffffffffffffffffff60043516610147565b34801561010457600080fd5b506100c8610159565b60005481565b73ffffffffffffffffffffffffffffffffffffffff1660009081526001602052604081208054349081019091558154019055565b60016020526000908152604090205481565b336000908152600160205260408120805490829055908111156101af57604051339082156108fc029083906000818181858888f193505050501561019c576101af565b3360009081526001602052604090208190555b505600a165627a7a72305820627ca46bb09478a015762806cc00c431230501118c7c26c30ac58c4e09e51c4f0029',
      }
  })

  // MissingFrom
  it('CAVERJS-UNIT-TX-437 : If transaction object missing from, signTransaction should throw error', async() => {
    const tx = Object.assign({}, deployObject)
    delete tx.from

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"from" is missing'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-437 : If transaction object missing from, sendTransaction should throw error', () => {
    const tx = Object.assign({}, deployObject)
    delete tx.from

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The send transactions "from" field must be defined!')
  }).timeout(200000)

  // MissingValue
  it('CAVERJS-UNIT-TX-438 : If transaction object missing value, signTransaction should throw error', async() => {
    const tx = Object.assign({}, deployObject)
    delete tx.value

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"value" is missing'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-438 : If transaction object missing from, sendTransaction should throw error', () => {
    const tx = Object.assign({}, deployObject)
    delete tx.value

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"value" is missing')
  }).timeout(200000)

  // Missing gas and gasLimit
  it('CAVERJS-UNIT-TX-439 : If transaction object missing gas and gasLimit, signTransaction should throw error', async() => {
    const tx = Object.assign({}, deployObject)
    delete tx.gas

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"gas" is missing'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-439 : If transaction object missing gas and gasLimit, sendTransaction should throw error', () => {
    const tx = Object.assign({}, deployObject)
    delete tx.gas

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"gas" is missing')
  }).timeout(200000)

  // MissingData
  it('CAVERJS-UNIT-TX-440 : If transaction object missing data, signTransaction should throw error', async() => {
    const tx = Object.assign({}, deployObject)
    delete tx.data

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"data" is missing'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-440 : If transaction object missing data, sendTransaction should throw error', () => {
    const tx = Object.assign({}, deployObject)
    delete tx.data

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"data" is missing')
  }).timeout(200000)

  // InvalidCodeFormat
  it('CAVERJS-UNIT-TX-441 : If transaction object has invalid codeFormat, signTransaction should throw error', async() => {
    const tx = Object.assign({codeFormat: 'InvalidCodeFormat'}, deployObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The codeFormat(InvalidCodeFormat) is invalid.'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-441 : If transaction object has invalid codeFormat, sendTransaction should throw error', () => {
    const tx = Object.assign({codeFormat: 'InvalidCodeFormat'}, deployObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The codeFormat(InvalidCodeFormat) is invalid.')
  }).timeout(200000)

  // MissingFeePayer
  it('CAVERJS-UNIT-TX-442 : If transaction object missing feePayer field, should throw error', async() => {
    const tx = Object.assign({}, deployObject)

    const ret = await caver.klay.accounts.signTransaction(tx, senderPrvKey)

    expect(()=>caver.klay.sendTransaction({senderRawTransaction: ret.rawTransaction})).to.throws('The "feePayer" field must be defined for signing with feePayer!')
  }).timeout(200000)

  // MissingSenderRawTransaction
  it('CAVERJS-UNIT-TX-443 : If transaction object missing senderRawTransaction field, should throw error', async() => {
    expect(()=>caver.klay.sendTransaction({feePayer: testAccount.address})).to.throws('The "senderRawTransaction" field must be defined for signing with feePayer!')
  }).timeout(200000)

  // UnnecessaryFeeRatio
  it('CAVERJS-UNIT-TX-444 : If transaction object has unnecessary feeRatio field, signTransaction should throw error', async() => {
    const tx = Object.assign({feeRatio: 10}, deployObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"feeRatio" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-444 : If transaction object has unnecessary feeRatio field, sendTransaction should throw error', () => {
    const tx = Object.assign({feeRatio: 10}, deployObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"feeRatio" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction')
  }).timeout(200000)

  // UnnecessaryPublicKey
  it('CAVERJS-UNIT-TX-445 : If transaction object has unnecessary publicKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4'}, deployObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"publicKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-445 : If transaction object has unnecessary publicKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4'}, deployObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"publicKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction')
  }).timeout(200000)

  // UnnecessaryMultisig
  it('CAVERJS-UNIT-TX-446 : If transaction object has unnecessary multisig field, signTransaction should throw error', async() => {
    const multisig = {
      threshold: 3,
      keys: [
        { weight: 1, publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4' },
        { weight: 1, publicKey: '0x8244b727f63656f0c6c6923395b67cb293342de66557d26409fb0e6de96d74a58e20479c531ef99b86699969dcf0ff5c9545bf893f1aaeb20de1978b3e6bc89e' },
        { weight: 1, publicKey: '0x3c63118f279933d6530ffb3ca46d2473dec1ed94b9829d290e8aa8ac8b384c9d3d79a4596abbc172d1ac6b97c079f7a6c3a7902471a20a09ab4139858352fb4f' },
        { weight: 1, publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c' },
      ],
    }
    const tx = Object.assign({multisig}, deployObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"multisig" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-446 : If transaction object has unnecessary multisig field, sendTransaction should throw error', () => {
    const multisig = {
      threshold: 3,
      keys: [
        { weight: 1, publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4' },
        { weight: 1, publicKey: '0x8244b727f63656f0c6c6923395b67cb293342de66557d26409fb0e6de96d74a58e20479c531ef99b86699969dcf0ff5c9545bf893f1aaeb20de1978b3e6bc89e' },
        { weight: 1, publicKey: '0x3c63118f279933d6530ffb3ca46d2473dec1ed94b9829d290e8aa8ac8b384c9d3d79a4596abbc172d1ac6b97c079f7a6c3a7902471a20a09ab4139858352fb4f' },
        { weight: 1, publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c' },
      ],
    }
    const tx = Object.assign({multisig}, deployObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"multisig" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction')
  }).timeout(200000)

  // UnnecessaryRoleTransactionKey
  it('CAVERJS-UNIT-TX-447 : If transaction object has unnecessary roleTransactionKey field, signTransaction should throw error', async() => {
    const roleTransactionKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleTransactionKey}, deployObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"roleTransactionKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-447 : If transaction object has unnecessary roleTransactionKey field, sendTransaction should throw error', () => {
    const roleTransactionKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleTransactionKey}, deployObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"roleTransactionKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction')
  }).timeout(200000)

  // UnnecessaryRoleAccountUpdateKey
  it('CAVERJS-UNIT-TX-448 : If transaction object has unnecessary roleAccountUpdateKey field, signTransaction should throw error', async() => {
    const roleAccountUpdateKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleAccountUpdateKey}, deployObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"roleAccountUpdateKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-448 : If transaction object has unnecessary roleAccountUpdateKey field, sendTransaction should throw error', () => {
    const roleAccountUpdateKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleAccountUpdateKey}, deployObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"roleAccountUpdateKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction')
  }).timeout(200000)

  // UnnecessaryRoleFeePayerKey
  it('CAVERJS-UNIT-TX-449 : If transaction object has unnecessary roleFeePayerKey field, signTransaction should throw error', async() => {
    const roleFeePayerKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleFeePayerKey}, deployObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"roleFeePayerKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-449 : If transaction object has unnecessary roleFeePayerKey field, sendTransaction should throw error', () => {
    const roleFeePayerKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleFeePayerKey}, deployObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"roleFeePayerKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction')
  }).timeout(200000)

  // UnnecessaryFailKey
  it('CAVERJS-UNIT-TX-450 : If transaction object has unnecessary failKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({failKey: true}, deployObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"failKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-450 : If transaction object has unnecessary failKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true}, deployObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"failKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction')
  }).timeout(200000)

  // UnnecessaryLegacyKey
  it('CAVERJS-UNIT-TX-451 : If transaction object has unnecessary legacyKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({legacyKey: true}, deployObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"legacyKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-451 : If transaction object has unnecessary legacyKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true}, deployObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"legacyKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction')
  }).timeout(200000)

  // UnnecessaryTo
  it('CAVERJS-UNIT-TX-570 : If transaction object has unnecessary to field, signTransaction should throw error', async() => {
    const tx = Object.assign({to: "0x5e008646fde91fb6eda7b1fdabc7d84649125cf5"}, deployObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"to" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-570 : If transaction object has unnecessary to field, sendTransaction should throw error', () => {
    const tx = Object.assign({to: "0x5e008646fde91fb6eda7b1fdabc7d84649125cf5"}, deployObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"to" cannot be used with FEE_DELEGATED_SMART_CONTRACT_DEPLOY transaction')
  }).timeout(200000)
})