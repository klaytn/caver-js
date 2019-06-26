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

describe('Contract: Fee Delegated Contract Execution', () => {
  const sender_transaction = {
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
  const expectedRawTransaction = '0x31f8fa0c80843b9ac9ff945e008646fde91fb6eda7b1fdabc7d84649125cf50a9490b3e9a3770481345a7f17f22f16d020bccfd33ea46353586b00000000000000000000000090b3e9a3770481345a7f17f22f16d020bccfd33ef845f84326a0b85779d9e3a78189925de6cccbadf31183805f3ee7ce04da259551ed4bd1f697a0712fbeb1fcf1c418f6868c3e442cdc223a7d11f70fad240f2870cbfc4463c8249433f524631e573329a550296f595c820d6c65213ff845f84326a0e597315f311abcedeb03c9f0dce0808b70843250b60351fb2171bbef86dd92d8a038dab32a7e686bbfada4e107b7ba507027f07ae143a92296670c85028381602c'
  
  it('CAVERJS-UNIT-SER-013 : Sign transaction', async () => {
    caver = new Caver(testRPCURL)
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

  it('CAVERJS-UNIT-SER-053: Decode raw transaction', async () => {
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

describe('FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction', () => {
  var executionObject
  var contractAddress

  var deployContract = async () => {
    const deployTx = {
      type: 'SMART_CONTRACT_DEPLOY',
      from: senderAddress,
      value: 0,
      gas: 900000,
      data: '0x60806040526000805534801561001457600080fd5b5060405161016f38038061016f8339810180604052810190808051906020019092919080518201929190505050816000819055505050610116806100596000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a723058206d2bc553736581b6387f9a0410856ca490fcdc7045a8991ad63a1fd71b651c3a00290000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000013200000000000000000000000000000000000000000000000000000000000000',
    }

    const receipt = await caver.klay.sendTransaction(deployTx)
    contractAddress = receipt.contractAddress
    executionObject.to = contractAddress
  }

  before(function (done){
    this.timeout(200000)
    caver = new Caver(testRPCURL)
    senderPrvKey = process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
        ? '0x' + process.env.privateKey
        : process.env.privateKey

    senderAddress = caver.klay.accounts.wallet.add(senderPrvKey).address
    testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())

    executionObject = {
      type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
      from: senderAddress,
      gas: '0x3b9ac9ff',
      data: '0xd14e62b80000000000000000000000000000000000000000000000000000000000000005',
    }
    deployContract().then(()=>done())
  })

  // MissingFrom
  it('CAVERJS-UNIT-TX-481 : If transaction object missing from, signTransaction should throw error', async() => {
    const tx = Object.assign({}, executionObject)
    delete tx.from

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"from" is missing'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-481 : If transaction object missing from, sendTransaction should throw error', () => {
    const tx = Object.assign({}, executionObject)
    delete tx.from

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The send transactions "from" field must be defined!')
  }).timeout(200000)

  // MissingTo
  it('CAVERJS-UNIT-TX-482 : If transaction object missing to, signTransaction should throw error', async() => {
    const tx = Object.assign({}, executionObject)
    delete tx.to

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"to" is missing'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-482 : If transaction object missing to, sendTransaction should throw error', () => {
    const tx = Object.assign({}, executionObject)
    delete tx.to

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"to" is missing')
  }).timeout(200000)

  // Missing gas and gasLimit
  it('CAVERJS-UNIT-TX-483 : If transaction object missing gas and gasLimit, signTransaction should throw error', async() => {
    const tx = Object.assign({}, executionObject)
    delete tx.gas

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"gas" is missing'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-483 : If transaction object missing gas and gasLimit, sendTransaction should throw error', () => {
    const tx = Object.assign({}, executionObject)
    delete tx.gas

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"gas" is missing')
  }).timeout(200000)

  // MissingData
  it('CAVERJS-UNIT-TX-484 : If transaction object missing data, signTransaction should throw error', async() => {
    const tx = Object.assign({}, executionObject)
    delete tx.data

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"data" is missing'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-484 : If transaction object missing data, sendTransaction should throw error', () => {
    const tx = Object.assign({}, executionObject)
    delete tx.data

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"data" is missing')
  }).timeout(200000)

  // MissingFeePayer
  it('CAVERJS-UNIT-TX-485 : If transaction object missing feePayer, should throw error', async() => {
    const tx = Object.assign({}, executionObject)

    const ret = await caver.klay.accounts.signTransaction(tx, senderPrvKey)
    expect(()=>caver.klay.sendTransaction({senderRawTransaction: ret.rawTransaction})).to.throws('The "feePayer" field must be defined for signing with feePayer!')
  }).timeout(200000)
  
  // MissingSenderRawTransaction
  it('CAVERJS-UNIT-TX-486 : If transaction object missing senderRawTransaction field, should throw error', async() => {
    expect(()=>caver.klay.sendTransaction({feePayer: testAccount.address})).to.throws('The "senderRawTransaction" field must be defined for signing with feePayer!')
  }).timeout(200000)

  // UnnecessaryFeeRatio
  it('CAVERJS-UNIT-TX-487 : If transaction object has unnecessary feeRatio field, signTransaction should throw error', async() => {
    const tx = Object.assign({feeRatio: 10}, executionObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"feeRatio" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-487 : If transaction object has unnecessary feeRatio field, sendTransaction should throw error', () => {
    const tx = Object.assign({feeRatio: 10}, executionObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"feeRatio" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction')
  }).timeout(200000)

  // UnnecessaryPublicKey
  it('CAVERJS-UNIT-TX-488 : If transaction object has unnecessary publicKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4'}, executionObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"publicKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-488 : If transaction object has unnecessary publicKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4'}, executionObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"publicKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction')
  }).timeout(200000)

  // UnnecessaryMultisig
  it('CAVERJS-UNIT-TX-489 : If transaction object has unnecessary multisig field, signTransaction should throw error', async() => {
    const multisig = {
      threshold: 3,
      keys: [
        { weight: 1, publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4' },
        { weight: 1, publicKey: '0x8244b727f63656f0c6c6923395b67cb293342de66557d26409fb0e6de96d74a58e20479c531ef99b86699969dcf0ff5c9545bf893f1aaeb20de1978b3e6bc89e' },
        { weight: 1, publicKey: '0x3c63118f279933d6530ffb3ca46d2473dec1ed94b9829d290e8aa8ac8b384c9d3d79a4596abbc172d1ac6b97c079f7a6c3a7902471a20a09ab4139858352fb4f' },
        { weight: 1, publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c' },
      ],
    }
    const tx = Object.assign({multisig}, executionObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"multisig" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-489 : If transaction object has unnecessary multisig field, sendTransaction should throw error', () => {
    const multisig = {
      threshold: 3,
      keys: [
        { weight: 1, publicKey: '0x006dc19d50bbc8a8e4b0f26c0dd3e78978f5f691a6161c41e3b0e4d1aa2d60fad62f37912b59f484b2e05bd3c9c3b4d93b0ca570d6d4421eee544e7da99e9de4' },
        { weight: 1, publicKey: '0x8244b727f63656f0c6c6923395b67cb293342de66557d26409fb0e6de96d74a58e20479c531ef99b86699969dcf0ff5c9545bf893f1aaeb20de1978b3e6bc89e' },
        { weight: 1, publicKey: '0x3c63118f279933d6530ffb3ca46d2473dec1ed94b9829d290e8aa8ac8b384c9d3d79a4596abbc172d1ac6b97c079f7a6c3a7902471a20a09ab4139858352fb4f' },
        { weight: 1, publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c' },
      ],
    }
    const tx = Object.assign({multisig}, executionObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"multisig" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction')
  }).timeout(200000)

  // UnnecessaryRoleTransactionKey
  it('CAVERJS-UNIT-TX-490 : If transaction object has unnecessary roleTransactionKey field, signTransaction should throw error', async() => {
    const roleTransactionKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleTransactionKey}, executionObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"roleTransactionKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-490 : If transaction object has unnecessary roleTransactionKey field, sendTransaction should throw error', () => {
    const roleTransactionKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleTransactionKey}, executionObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"roleTransactionKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction')
  }).timeout(200000)

  // UnnecessaryRoleAccountUpdateKey
  it('CAVERJS-UNIT-TX-491 : If transaction object has unnecessary roleAccountUpdateKey field, signTransaction should throw error', async() => {
    const roleAccountUpdateKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleAccountUpdateKey}, executionObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"roleAccountUpdateKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-491 : If transaction object has unnecessary roleAccountUpdateKey field, sendTransaction should throw error', () => {
    const roleAccountUpdateKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleAccountUpdateKey}, executionObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"roleAccountUpdateKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction')
  }).timeout(200000)

  // UnnecessaryRoleFeePayerKey
  it('CAVERJS-UNIT-TX-492 : If transaction object has unnecessary roleFeePayerKey field, signTransaction should throw error', async() => {
    const roleFeePayerKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleFeePayerKey}, executionObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"roleFeePayerKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-492 : If transaction object has unnecessary roleFeePayerKey field, sendTransaction should throw error', () => {
    const roleFeePayerKey = {
      publicKey: '0xf4fa613bf44e5fa7505ad196605a1f32d3eb695f41916fb50f6c3ce65d345a059ebc2dc69629808c2a7c98eb0f2daad68f0b39f0a49141318fe59b777e6b8d1c',
    }
    const tx = Object.assign({roleFeePayerKey}, executionObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"roleFeePayerKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction')
  }).timeout(200000)

  // UnnecessaryFailKey
  it('CAVERJS-UNIT-TX-493 : If transaction object has unnecessary failKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({failKey: true}, executionObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"failKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-493 : If transaction object has unnecessary failKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true}, executionObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"failKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction')
  }).timeout(200000)

  // UnnecessaryCodeFormat
  it('CAVERJS-UNIT-TX-494 : If transaction object has unnecessary codeFormat field, signTransaction should throw error', async() => {
    const tx = Object.assign({codeFormat: 'EVM'}, executionObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"codeFormat" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-494 : If transaction object has unnecessary codeFormat field, sendTransaction should throw error', () => {
    const tx = Object.assign({codeFormat: 'EVM'}, executionObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"codeFormat" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction')
  }).timeout(200000)

  // UnnecessaryLegacyKey
  it('CAVERJS-UNIT-TX-495 : If transaction object has unnecessary legacyKey field, signTransaction should throw error', async() => {
    const tx = Object.assign({legacyKey: true}, executionObject)

    await caver.klay.accounts.signTransaction(tx, senderPrvKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"legacyKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-495 : If transaction object has unnecessary legacyKey field, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true}, executionObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"legacyKey" cannot be used with FEE_DELEGATED_SMART_CONTRACT_EXECUTION transaction')
  }).timeout(200000)
})