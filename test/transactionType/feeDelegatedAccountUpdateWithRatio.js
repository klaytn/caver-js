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

describe('Account: Fee Delegated Account Update with ratio', () => {
  const sender_transaction = {
    type: 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO',
    from: '0xd03227635c90c7986f0e3a4e551cefbca8c55316',
    nonce: '0x0',
    gas: '0x3b9ac9ff',
    gasPrice: '0x19',
    publicKey: '0xc8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f08144794c27901465af0a703859ab47f8ae17e54aaba453b7cde5a6a9e4a32d45d72b2',
    feeRatio: 11,
    chainId: '0x1',
  }

  const feePayer = '0x90b3e9a3770481345a7f17f22f16d020bccfd33e'
  const expectedRawTransaction = '0x22f8e48019843b9ac9ff94d03227635c90c7986f0e3a4e551cefbca8c55316a302a102c8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f0814470bf845f84325a06ccf7dcc61310b1b5f3d20daf165cde39a134040918c35029da9d3c25cb8f58ca06d31d05a1219d3e15acdb75cd88c58ab606cd0e78cc89ed3f16666e08c732e329490b3e9a3770481345a7f17f22f16d020bccfd33ef845f84326a0bc4efd4b0e3b2f3986c6e0eac78cdde28b49517dea23d479a6c2aaa5b955e573a02e23b4ee527b443ba90c845c289fbcfbc0c70ac75bcce94e05b75950cc80c42a'
  
  it('CAVERJS-UNIT-SER-008 : Sign transaction', async () => {
    caver = new Caver(testRPCURL)
    const privateKey = '0x98275a145bc1726eb0445433088f5f882f8a4a9499135239cfb4040e78991dab'

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

    const feePayerPrivateKey = '0xf8cc7c3813ad23817466b1802ee805ee417001fcce9376ab8728c92dd8ea0a6b'
    const { rawTransaction } = await caver.klay.accounts.signTransaction(fee_payer_transaction, feePayerPrivateKey)

    expect(rawTransaction).to.equal(expectedRawTransaction)

  }).timeout(200000)

  it('CAVERJS-UNIT-SER-048: Decode raw transaction', async () => {
    const txObj = decodeFromRawTransaction(expectedRawTransaction)

    expect(txObj).not.to.be.undefined
    expect(txObj.type).to.equals(sender_transaction.type)
    expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(sender_transaction.nonce))
    expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(sender_transaction.gasPrice))
    expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(sender_transaction.gas))
    expect(txObj.from).to.equals(sender_transaction.from)
    expect(caver.utils.hexToNumber(txObj.feeRatio)).to.equals(caver.utils.hexToNumber(sender_transaction.feeRatio))
    expect(txObj.v).not.to.be.undefined
    expect(txObj.r).not.to.be.undefined
    expect(txObj.s).not.to.be.undefined
    expect(txObj.feePayer).to.equals(feePayer)
    expect(txObj.payerV).not.to.be.undefined
    expect(txObj.payerR).not.to.be.undefined
    expect(txObj.payerS).not.to.be.undefined
    expect(txObj.publicKey).to.equals(caver.utils.compressPublicKey(sender_transaction.publicKey))
  }).timeout(200000)
})

describe('FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO transaction', () => {
  var accountUpdateObject
  var acct
  var publicKey, publicKey2, publicKey3, publicKey4
  var privateKey, privateKey2, privateKey3, privateKey4
  var multisig

  var createTestAccount = () => {
    publicKey = caver.klay.accounts.privateKeyToPublicKey(caver.klay.accounts.create().privateKey)
    testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
    const txObject = {
      from: senderAddress,
      to: testAccount.address,
      value: caver.utils.toPeb(1, 'KLAY'),
      gas: 900000,
    }
    // account update transaction object
    accountUpdateObject = {
      type: 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO',
      from: testAccount.address,
      gas: 900000,
      feeRatio: 30,
    }

    return caver.klay.sendTransaction(txObject)
  }

  before(function (done){
    this.timeout(200000)
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
  
    // Make testAccount for update testing (This will be used for key update)
    privateKey2 = caver.klay.accounts.create().privateKey
    publicKey2 = caver.klay.accounts.privateKeyToPublicKey(privateKey2)
    privateKey3 = caver.klay.accounts.create().privateKey
    publicKey3 = caver.klay.accounts.privateKeyToPublicKey(privateKey3)
    privateKey4 = caver.klay.accounts.create().privateKey
    publicKey4 = caver.klay.accounts.privateKeyToPublicKey(privateKey4)
    multisig = {
      threshold: 2,
      keys: [
        { weight: 1, publicKey: publicKey2 },
        { weight: 1, publicKey: publicKey3 },
        { weight: 1, publicKey: publicKey4 },
      ],
    }
  
    createTestAccount().then(()=>done())
  })

  // Error from missing
  it('CAVERJS-UNIT-TX-344 : If transaction object missing from, signTransaction should throw error', async () => {
    const tx = Object.assign({publicKey}, accountUpdateObject)
    delete tx.from

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch((err)=>expect(err.message).to.equals('"from" is missing'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-344 : If transaction object missing from, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey}, accountUpdateObject)
    delete tx.from

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The send transactions "from" field must be defined!')
  }).timeout(200000)

  // UnnecessaryTo
  it('CAVERJS-UNIT-TX-345 : If transaction object has to, signTransaction should throw error', async () => {
    const tx = Object.assign({publicKey, to: senderAddress}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"to" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO transaction'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-345 : If transaction object has to, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey, to: senderAddress}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"to" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO transaction')
  }).timeout(200000)

  // UnnecessaryValue
  it('CAVERJS-UNIT-TX-346 : If transaction object has value, signTransaction should throw error', async () => {
    const tx = Object.assign({publicKey, value: 1}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"value" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO transaction'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-346 : If transaction object has value, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey, value: 1}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"value" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO transaction')
  }).timeout(200000)

  // MissingGas
  it('CAVERJS-UNIT-TX-347 : If transaction object missing gas and gasLimit, signTransaction should throw error', async () => {
    const tx = Object.assign({publicKey}, accountUpdateObject)
    delete tx.gas

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"gas" is missing'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-347 : If transaction object missing gas and gasLimit, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey}, accountUpdateObject)
    delete tx.gas

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"gas" is missing')
  }).timeout(200000)

  // MissingKey
  it('CAVERJS-UNIT-TX-348 : If transaction object missing key information, signTransaction should throw error', async () => {
    const tx = Object.assign({}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('Missing key information with FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO transaction'))
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-348 : If transaction object missing key information, sendTransaction should throw error', () => {
    const tx = Object.assign({}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('Missing key information with FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO transaction')
  }).timeout(200000)

  // PublicKey
  it('CAVERJS-UNIT-TX-349 : If transaction object has only publicKey, update account with publicKey', async () => {
    const tx = Object.assign({publicKey: publicKey3}, accountUpdateObject)
    const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
    const fee_payer_transaction = {
      senderRawTransaction: ret.rawTransaction,
      feePayer: payerAddress,
    }
    const receipt = await caver.klay.sendTransaction(fee_payer_transaction)
    expect(receipt.from).to.equals(tx.from)
    expect(receipt.status).to.be.true

    const key = await caver.klay.getAccountKey(receipt.from)
    const xy = caver.utils.xyPointFromPublicKey(publicKey3)
    expect(key.keyType).to.equals(2)
    expect(key.key["x"]).to.equals(xy[0])
    expect(key.key["y"]).to.equals(xy[1])

    caver.klay.accounts.wallet.updatePrivateKey(privateKey3, testAccount.address)
  }).timeout(200000)

  // PublicKeyLength64
  it('CAVERJS-UNIT-TX-351 : If compressed publicKey length is 64, signTransaction should throw error', async () => {
    const tx = Object.assign({publicKey : caver.utils.randomHex(32)}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('Invalid public key'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-351 : If compressed publicKey length is 64, sendTransaction should throw error', async () => {
    const tx = Object.assign({publicKey : caver.utils.randomHex(32)}, accountUpdateObject)

    await caver.klay.sendTransaction(tx)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('Invalid public key'))
  }).timeout(200000)

  // PublicKeyLength126
  it('CAVERJS-UNIT-TX-352 : If uncompressed publicKey length is 126, signTransaction should throw error', async () => {
    const tx = Object.assign({publicKey : caver.utils.randomHex(63)}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('Invalid public key'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-352 : If uncompressed publicKey length is 126, sendTransaction should throw error', async () => {
    const tx = Object.assign({publicKey : caver.utils.randomHex(63)}, accountUpdateObject)

    await caver.klay.sendTransaction(tx)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('Invalid public key'))
  }).timeout(200000)

  // Update with multisig.
  it('CAVERJS-UNIT-TX-353 : If transaction object has multisig, update account with multisig', async () => {
    const tx = Object.assign({multisig}, accountUpdateObject)

    const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
    const receipt = await caver.klay.sendTransaction({
      senderRawTransaction: ret.rawTransaction,
      feePayer: payerAddress,
    })
    expect(receipt.from).to.equals(tx.from)
    expect(receipt.status).to.be.true

    const key = await caver.klay.getAccountKey(receipt.from)
    expect(key.keyType).to.equals(4)
    expect(key.key.threshold).to.equals(multisig.threshold)
    expect(key.key.keys.length).to.equals(multisig.keys.length)

    for(var i = 0; i < multisig.keys.length; i ++ ) {
      const xy = caver.utils.xyPointFromPublicKey(multisig.keys[i].publicKey)
      expect(key.key.keys[i].weight).to.equals(multisig.keys[i].weight)
      expect(key.key.keys[i].key["x"]).to.equals(xy[0])
      expect(key.key.keys[i].key["y"]).to.equals(xy[1])
    }

    await createTestAccount()
  }).timeout(200000)

  // Update with multisig and publicKey.
  it('CAVERJS-UNIT-TX-354 : If transaction object has multisig and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({publicKey, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))

  }).timeout(200000)

  it('CAVERJS-UNIT-TX-354 : If transaction object has multisig and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleTransactionKey.
  it('CAVERJS-UNIT-TX-355 : If transaction object has roleTransactionKey, update account with roleTransactionKey', async () => {
    var tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey: publicKey2}, roleFeePayerKey: {publicKey: publicKey3}}, accountUpdateObject)
    delete tx.feeRatio
    tx.type = 'ACCOUNT_UPDATE'
    await caver.klay.sendTransaction(tx)
    caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

    tx = Object.assign({roleTransactionKey: {publicKey: publicKey4}}, accountUpdateObject)
    const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
    const receipt = await caver.klay.sendTransaction({
      senderRawTransaction: ret.rawTransaction,
      feePayer: payerAddress,
    })
    expect(receipt.from).to.equals(tx.from)
    expect(receipt.status).to.be.true

    const key = await caver.klay.getAccountKey(receipt.from)
    const xy_transaction = caver.utils.xyPointFromPublicKey(publicKey4)
    const xy_update = caver.utils.xyPointFromPublicKey(publicKey2)
    const xy_fee = caver.utils.xyPointFromPublicKey(publicKey3)
    expect(key.keyType).to.equals(5)
    expect(key.key.length).to.equals(3)
    expect(key.key[0].key["x"]).to.equals(xy_transaction[0])
    expect(key.key[0].key["y"]).to.equals(xy_transaction[1])
    expect(key.key[1].key["x"]).to.equals(xy_update[0])
    expect(key.key[1].key["y"]).to.equals(xy_update[1])
    expect(key.key[2].key["x"]).to.equals(xy_fee[0])
    expect(key.key[2].key["y"]).to.equals(xy_fee[1])

    await createTestAccount()
  }).timeout(200000)

  // Update with roleTransactionKey and publicKey.
  it('CAVERJS-UNIT-TX-356 : If transaction object has roleTransactionKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-356 : If transaction object has roleTransactionKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleTransactionKey and multisig.
  it('CAVERJS-UNIT-TX-357 : If transaction object has roleTransactionKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-357 : If transaction object has roleTransactionKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleTransactionKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-358 : If transaction object has roleTransactionKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-358 : If transaction object has roleTransactionKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)
  
  // Update with roleAccountUpdateKey.
  it('CAVERJS-UNIT-TX-359 : If transaction object has roleAccountUpdateKey, update account with roleAccountUpdateKey', async () => {
    var tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey: publicKey2}, roleFeePayerKey: {publicKey: publicKey3}}, accountUpdateObject)
    delete tx.feeRatio
    tx.type = 'ACCOUNT_UPDATE'
    await caver.klay.sendTransaction(tx)
    caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

    tx = Object.assign({roleAccountUpdateKey: {publicKey: publicKey4}}, accountUpdateObject)
    const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
    const receipt = await caver.klay.sendTransaction({
      senderRawTransaction: ret.rawTransaction,
      feePayer: payerAddress,
    })
    expect(receipt.from).to.equals(tx.from)
    expect(receipt.status).to.be.true

    const key = await caver.klay.getAccountKey(receipt.from)
    const xy_transaction = caver.utils.xyPointFromPublicKey(publicKey)
    const xy_update = caver.utils.xyPointFromPublicKey(publicKey4)
    const xy_fee = caver.utils.xyPointFromPublicKey(publicKey3)
    expect(key.keyType).to.equals(5)
    expect(key.key.length).to.equals(3)
    expect(key.key[0].key["x"]).to.equals(xy_transaction[0])
    expect(key.key[0].key["y"]).to.equals(xy_transaction[1])
    expect(key.key[1].key["x"]).to.equals(xy_update[0])
    expect(key.key[1].key["y"]).to.equals(xy_update[1])
    expect(key.key[2].key["x"]).to.equals(xy_fee[0])
    expect(key.key[2].key["y"]).to.equals(xy_fee[1])

    await createTestAccount()
  }).timeout(200000)
  
  // Update with roleAccountUpdateKey and roleTransactionKey.
  it('CAVERJS-UNIT-TX-360 : If transaction object has roleAccountUpdateKey and roleTransactionKey, update account with roleAccountUpdateKey and roleTransactionKey', async () => {
    var tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey: publicKey2}, roleFeePayerKey: {publicKey: publicKey3}}, accountUpdateObject)
    delete tx.feeRatio
    tx.type = 'ACCOUNT_UPDATE'
    await caver.klay.sendTransaction(tx)
    caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

    tx = Object.assign({roleTransactionKey: {publicKey: publicKey4}, roleAccountUpdateKey: {publicKey: publicKey}}, accountUpdateObject)
    const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
    const receipt = await caver.klay.sendTransaction({
      senderRawTransaction: ret.rawTransaction,
      feePayer: payerAddress,
    })
    expect(receipt.from).to.equals(tx.from)
    expect(receipt.status).to.be.true

    const key = await caver.klay.getAccountKey(receipt.from)
    const xy_transaction = caver.utils.xyPointFromPublicKey(publicKey4)
    const xy_update = caver.utils.xyPointFromPublicKey(publicKey)
    const xy_fee = caver.utils.xyPointFromPublicKey(publicKey3)
    expect(key.keyType).to.equals(5)
    expect(key.key.length).to.equals(3)
    expect(key.key[0].key["x"]).to.equals(xy_transaction[0])
    expect(key.key[0].key["y"]).to.equals(xy_transaction[1])
    expect(key.key[1].key["x"]).to.equals(xy_update[0])
    expect(key.key[1].key["y"]).to.equals(xy_update[1])
    expect(key.key[2].key["x"]).to.equals(xy_fee[0])
    expect(key.key[2].key["y"]).to.equals(xy_fee[1])

    await createTestAccount()
  }).timeout(200000)

  // Update with roleAccountUpdateKey and publicKey.
  it('CAVERJS-UNIT-TX-361 : If transaction object has roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-361 : If transaction object has roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleAccountUpdateKey and multisig.
  it('CAVERJS-UNIT-TX-362 : If transaction object has roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-362 : If transaction object has roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleAccountUpdateKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-363 : If transaction object has roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-363 : If transaction object has roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleAccountUpdateKey, roleTransactionKey and publicKey.
  it('CAVERJS-UNIT-TX-364 : If transaction object has roleAccountUpdateKey, roleTransactionKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-364 : If transaction object has roleAccountUpdateKey, roleTransactionKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleAccountUpdateKey, roleTransactionKey and multisig.
  it('CAVERJS-UNIT-TX-365 : If transaction object has roleAccountUpdateKey, roleTransactionKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-365 : If transaction object has roleAccountUpdateKey, roleTransactionKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleAccountUpdateKey, roleTransactionKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-366 : If transaction object has roleAccountUpdateKey, roleTransactionKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-366 : If transaction object has roleAccountUpdateKey, roleTransactionKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleFeePayerKey.
  it('CAVERJS-UNIT-TX-367 : If transaction object has roleFeePayerKey, update account with roleFeePayerKey', async () => {
    var tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey: publicKey2}, roleFeePayerKey: {publicKey: publicKey3}}, accountUpdateObject)
    delete tx.feeRatio
    tx.type = 'ACCOUNT_UPDATE'
    await caver.klay.sendTransaction(tx)
    caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

    tx = Object.assign({roleFeePayerKey: {publicKey: publicKey4}}, accountUpdateObject)
    const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
    const receipt = await caver.klay.sendTransaction({
      senderRawTransaction: ret.rawTransaction,
      feePayer: payerAddress,
    })
    expect(receipt.from).to.equals(tx.from)
    expect(receipt.status).to.be.true

    const key = await caver.klay.getAccountKey(receipt.from)
    const xy_transaction = caver.utils.xyPointFromPublicKey(publicKey)
    const xy_update = caver.utils.xyPointFromPublicKey(publicKey2)
    const xy_fee = caver.utils.xyPointFromPublicKey(publicKey4)
    expect(key.keyType).to.equals(5)
    expect(key.key.length).to.equals(3)
    expect(key.key[0].key["x"]).to.equals(xy_transaction[0])
    expect(key.key[0].key["y"]).to.equals(xy_transaction[1])
    expect(key.key[1].key["x"]).to.equals(xy_update[0])
    expect(key.key[1].key["y"]).to.equals(xy_update[1])
    expect(key.key[2].key["x"]).to.equals(xy_fee[0])
    expect(key.key[2].key["y"]).to.equals(xy_fee[1])

    await createTestAccount()
  }).timeout(200000)

  // Update with roleFeePayerKey and roleTransactionKey.
  it('CAVERJS-UNIT-TX-368 : If transaction object has roleFeePayerKey and roleTransactionKey, update account with roleFeePayerKey and roleTransactionKey', async () => {
    var tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey: publicKey2}, roleFeePayerKey: {publicKey: publicKey3}}, accountUpdateObject)
    delete tx.feeRatio
    tx.type = 'ACCOUNT_UPDATE'
    await caver.klay.sendTransaction(tx)
    caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

    tx = Object.assign({roleTransactionKey: {publicKey: publicKey3}, roleFeePayerKey: {publicKey: publicKey4}}, accountUpdateObject)
    const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
    const receipt = await caver.klay.sendTransaction({
      senderRawTransaction: ret.rawTransaction,
      feePayer: payerAddress,
    })
    expect(receipt.from).to.equals(tx.from)
    expect(receipt.status).to.be.true

    const key = await caver.klay.getAccountKey(receipt.from)
    const xy_transaction = caver.utils.xyPointFromPublicKey(publicKey3)
    const xy_update = caver.utils.xyPointFromPublicKey(publicKey2)
    const xy_fee = caver.utils.xyPointFromPublicKey(publicKey4)
    expect(key.keyType).to.equals(5)
    expect(key.key.length).to.equals(3)
    expect(key.key[0].key["x"]).to.equals(xy_transaction[0])
    expect(key.key[0].key["y"]).to.equals(xy_transaction[1])
    expect(key.key[1].key["x"]).to.equals(xy_update[0])
    expect(key.key[1].key["y"]).to.equals(xy_update[1])
    expect(key.key[2].key["x"]).to.equals(xy_fee[0])
    expect(key.key[2].key["y"]).to.equals(xy_fee[1])

    await createTestAccount()
  }).timeout(200000)

  // Update with roleFeePayerKey and roleAccountUpdateKey.
  it('CAVERJS-UNIT-TX-369 : If transaction object has roleFeePayerKey and roleAccountUpdateKey, update account with roleFeePayerKey and roleAccountUpdateKey', async () => {
    var tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey: publicKey2}, roleFeePayerKey: {publicKey: publicKey3}}, accountUpdateObject)
    delete tx.feeRatio
    tx.type = 'ACCOUNT_UPDATE'
    await caver.klay.sendTransaction(tx)
    caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

    tx = Object.assign({roleAccountUpdateKey: {publicKey: publicKey3}, roleFeePayerKey: {publicKey: publicKey4}}, accountUpdateObject)
    const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
    const receipt = await caver.klay.sendTransaction({
      senderRawTransaction: ret.rawTransaction,
      feePayer: payerAddress,
    })
    expect(receipt.from).to.equals(tx.from)
    expect(receipt.status).to.be.true

    const key = await caver.klay.getAccountKey(receipt.from)
    const xy_transaction = caver.utils.xyPointFromPublicKey(publicKey)
    const xy_update = caver.utils.xyPointFromPublicKey(publicKey3)
    const xy_fee = caver.utils.xyPointFromPublicKey(publicKey4)
    expect(key.keyType).to.equals(5)
    expect(key.key.length).to.equals(3)
    expect(key.key[0].key["x"]).to.equals(xy_transaction[0])
    expect(key.key[0].key["y"]).to.equals(xy_transaction[1])
    expect(key.key[1].key["x"]).to.equals(xy_update[0])
    expect(key.key[1].key["y"]).to.equals(xy_update[1])
    expect(key.key[2].key["x"]).to.equals(xy_fee[0])
    expect(key.key[2].key["y"]).to.equals(xy_fee[1])

    await createTestAccount()
  }).timeout(200000)

  // Update with roleTransactionKey, roleAccountUpdateKey and roleFeePayerKey.
  it('CAVERJS-UNIT-TX-370 : If transaction object has roleTransactionKey, roleAccountUpdateKey and roleFeePayerKey, update account with roleTransactionKey, roleAccountUpdateKey and roleFeePayerKey', async () => {
    var tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey: publicKey2}, roleFeePayerKey: {publicKey: publicKey3}}, accountUpdateObject)
    const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
    const receipt = await caver.klay.sendTransaction({
      senderRawTransaction: ret.rawTransaction,
      feePayer: payerAddress,
    })
    expect(receipt.from).to.equals(tx.from)
    expect(receipt.status).to.be.true

    const key = await caver.klay.getAccountKey(receipt.from)
    const xy_transaction = caver.utils.xyPointFromPublicKey(publicKey)
    const xy_update = caver.utils.xyPointFromPublicKey(publicKey2)
    const xy_fee = caver.utils.xyPointFromPublicKey(publicKey3)
    expect(key.keyType).to.equals(5)
    expect(key.key.length).to.equals(3)
    expect(key.key[0].key["x"]).to.equals(xy_transaction[0])
    expect(key.key[0].key["y"]).to.equals(xy_transaction[1])
    expect(key.key[1].key["x"]).to.equals(xy_update[0])
    expect(key.key[1].key["y"]).to.equals(xy_update[1])
    expect(key.key[2].key["x"]).to.equals(xy_fee[0])
    expect(key.key[2].key["y"]).to.equals(xy_fee[1])

    await createTestAccount()
  }).timeout(200000)

  // Update with roleFeePayerKey and publicKey.
  it('CAVERJS-UNIT-TX-371 : If transaction object has roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-371 : If transaction object has roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleFeePayerKey and multisig.
  it('CAVERJS-UNIT-TX-372 : If transaction object has roleFeePayerKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-372 : If transaction object has roleFeePayerKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleFeePayerKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-373 : If transaction object has roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-373 : If transaction object has roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleFeePayerKey, roleTransactionKey and publicKey.
  it('CAVERJS-UNIT-TX-374 : If transaction object has roleFeePayerKey, roleTransactionKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-374 : If transaction object has roleFeePayerKey, roleTransactionKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleFeePayerKey, roleTransactionKey and multisig.
  it('CAVERJS-UNIT-TX-375 : If transaction object has roleFeePayerKey, roleTransactionKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-375 : If transaction object has roleFeePayerKey, roleTransactionKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleFeePayerKey, roleTransactionKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-376 : If transaction object has roleFeePayerKey, roleTransactionKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-376 : If transaction object has roleFeePayerKey, roleTransactionKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)
  
  // Update with roleFeePayerKey, roleAccountUpdateKey and publicKey.
  it('CAVERJS-UNIT-TX-377 : If transaction object has roleFeePayerKey, roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-377 : If transaction object has roleFeePayerKey, roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleFeePayerKey, roleAccountUpdateKey and multisig.
  it('CAVERJS-UNIT-TX-378 : If transaction object has roleFeePayerKey, roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-378 : If transaction object has roleFeePayerKey, roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleFeePayerKey, roleAccountUpdateKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-379 : If transaction object has roleFeePayerKey, roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-379 : If transaction object has roleFeePayerKey, roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)
  
  // Update with roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and publicKey.
  it('CAVERJS-UNIT-TX-380 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-380 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and multisig.
  it('CAVERJS-UNIT-TX-381 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-381 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-382 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-382 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)
  
  // Update with failKey.
  it('CAVERJS-UNIT-TX-383 : If transaction object has failKey, update account with failKey', async () => {
    const tx = Object.assign({failKey: true}, accountUpdateObject)
    const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
    const receipt = await caver.klay.sendTransaction({
      senderRawTransaction: ret.rawTransaction,
      feePayer: payerAddress,
    })
    expect(receipt.from).to.equals(tx.from)
    expect(receipt.status).to.be.true

    const key = await caver.klay.getAccountKey(receipt.from)
    expect(key.keyType).to.equals(3)

    await createTestAccount()
  }).timeout(200000)

  // Update with failKey and publicKey.
  it('CAVERJS-UNIT-TX-384 : If transaction object has failKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-384 : If transaction object has failKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey and multisig.
  it('CAVERJS-UNIT-TX-385 : If transaction object has failKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-385 : If transaction object has failKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-386 : If transaction object has failKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, publicKey, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-386 : If transaction object has failKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, publicKey, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey and roleTransactionKey.
  it('CAVERJS-UNIT-TX-387 : If transaction object has failKey and roleTransactionKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-387 : If transaction object has failKey and roleTransactionKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleTransactionKey and publicKey.
  it('CAVERJS-UNIT-TX-388 : If transaction object has failKey, roleTransactionKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-388 : If transaction object has failKey, roleTransactionKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleTransactionKey and multisig.
  it('CAVERJS-UNIT-TX-389 : If transaction object has failKey, roleTransactionKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-389 : If transaction object has failKey, roleTransactionKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-390 : If transaction object has failKey, roleTransactionKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-390 : If transaction object has failKey, roleTransactionKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey and roleAccountUpdateKey.
  it('CAVERJS-UNIT-TX-391 : If transaction object has failKey and roleAccountUpdateKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-391 : If transaction object has failKey and roleAccountUpdateKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleAccountUpdateKey and publicKey.
  it('CAVERJS-UNIT-TX-392 : If transaction object has failKey, roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-392 : If transaction object has failKey, roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleAccountUpdateKey and multisig.
  it('CAVERJS-UNIT-TX-393 : If transaction object has failKey, roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-393 : If transaction object has failKey, roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleAccountUpdateKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-394 : If transaction object has failKey, roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-394 : If transaction object has failKey, roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey and roleFeePayerKey.
  it('CAVERJS-UNIT-TX-395 : If transaction object has failKey and roleFeePayerKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleFeePayerKey: {publicKey}}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-395 : If transaction object has failKey and roleFeePayerKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleFeePayerKey: {publicKey}}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleFeePayerKey and publicKey.
  it('CAVERJS-UNIT-TX-396 : If transaction object has failKey, roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-396 : If transaction object has failKey, roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleFeePayerKey and multisig.
  it('CAVERJS-UNIT-TX-397 : If transaction object has failKey, roleFeePayerKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-397 : If transaction object has failKey, roleFeePayerKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleFeePayerKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-398 : If transaction object has failKey, roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-398 : If transaction object has failKey, roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleAccountUpdateKey and publicKey.
  it('CAVERJS-UNIT-TX-399 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-399 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleAccountUpdateKey and multisig.
  it('CAVERJS-UNIT-TX-400 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-400 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-401 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-401 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleFeePayerKey and publicKey.
  it('CAVERJS-UNIT-TX-402 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-402 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleFeePayerKey and multisig.
  it('CAVERJS-UNIT-TX-403 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-403 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleFeePayerKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-404 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-404 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleAccountUpdateKey, roleFeePayerKey and publicKey.
  it('CAVERJS-UNIT-TX-405 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-405 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleAccountUpdateKey, roleFeePayerKey and multisig.
  it('CAVERJS-UNIT-TX-406 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-406 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-407 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-407 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and publicKey.
  it('CAVERJS-UNIT-TX-408 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-408 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and multisig.
  it('CAVERJS-UNIT-TX-409 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-409 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-410 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-410 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // UnnecessaryData
  it('CAVERJS-UNIT-TX-411 : If transaction object has data, signTransaction should throw error', async () => {
    const tx = Object.assign({data: '0x68656c6c6f', publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"data" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO transaction'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-411 : If transaction object has data, sendTransaction should throw error', () => {
    const tx = Object.assign({data: '0x68656c6c6f', publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"data" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO transaction')
  }).timeout(200000)

  // Error feePayer missing (A check on the feePayer is performed when the feePayer attempts to sign the rawTransaction after sender signed.)
  it('CAVERJS-UNIT-TX-412 : If transaction object missing feePayer, signTransaction should throw error', async () => {
    const tx = Object.assign({publicKey}, accountUpdateObject)

    const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
    expect(()=>caver.klay.sendTransaction({senderRawTransaction: ret.rawTransaction})).to.throws('The "feePayer" field must be defined for signing with feePayer!')
  }).timeout(200000)

  // Error senderRawTransaction missing (A check on the senderRawTransaction is performed when the feePayer attempts to sign the rawTransaction after sender signed.)
  it('CAVERJS-UNIT-TX-413 : If transaction object missing senderRawTransaction, signTransaction should throw error', async () => {
    expect(()=>caver.klay.sendTransaction({feePayer: payerAddress})).to.throws('The "senderRawTransaction" field must be defined for signing with feePayer!')
  }).timeout(200000)

  // MissingFeeRatio
  it('CAVERJS-UNIT-TX-414 : If transaction object has feeRatio, signTransaction should throw error', async () => {
    const tx = Object.assign({publicKey}, accountUpdateObject)
    delete tx.feeRatio

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"feeRatio" is missing'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-414 : If transaction object has feeRatio, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey}, accountUpdateObject)
    delete tx.feeRatio

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"feeRatio" is missing')
  }).timeout(200000)

  // UnnecessaryCodeFormat
  it('CAVERJS-UNIT-TX-415 : If transaction object has codeFormat, signTransaction should throw error', async () => {
    const tx = Object.assign({codeFormat: 'EVM', publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('"codeFormat" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO transaction'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-415 : If transaction object has codeFormat, sendTransaction should throw error', () => {
    const tx = Object.assign({codeFormat: 'EVM', publicKey}, accountUpdateObject)

    expect(()=> caver.klay.sendTransaction(tx)).to.throws('"codeFormat" cannot be used with FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO transaction')
  }).timeout(200000)

  // Update account with legacyKey
  it('CAVERJS-UNIT-TX-416 : If transaction object has only legacyKey, update account with legacyKey', async () => {
    const tx = Object.assign({legacyKey: true}, accountUpdateObject)

    const ret = await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
    const receipt = await caver.klay.sendTransaction({
      senderRawTransaction: ret.rawTransaction,
      feePayer: payerAddress,
    })
    expect(receipt.from).to.equals(tx.from)
    expect(receipt.status).to.be.true

    const key = await caver.klay.getAccountKey(receipt.from)
    expect(key.keyType).to.equals(1)
  }).timeout(200000)

  // LegacyKey with publicKey
  it('CAVERJS-UNIT-TX-417 : If transaction object has legacyKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({legacyKey: true, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-417 : If transaction object has legacyKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // LegacyKey with multisig
  it('CAVERJS-UNIT-TX-418 : If transaction object has legacyKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({legacyKey: true, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-418 : If transaction object has legacyKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // LegacyKey with failKey
  it('CAVERJS-UNIT-TX-419 : If transaction object has legacyKey and failKey, signTransaction should throw error', async () => {
    const tx = Object.assign({legacyKey: true, failKey: true}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-419 : If transaction object has legacyKey and failKey, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true, failKey: true}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // LegacyKey with roleTransactionKey
  it('CAVERJS-UNIT-TX-420 : If transaction object has legacyKey and roleTransactionKey, signTransaction should throw error', async () => {
    const tx = Object.assign({legacyKey: true, roleTransactionKey: {publicKey}}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-420 : If transaction object has legacyKey and roleTransactionKey, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true, roleTransactionKey: {publicKey}}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // LegacyKey with roleAccountUpdateKey
  it('CAVERJS-UNIT-TX-421 : If transaction object has legacyKey and roleAccountUpdateKey, signTransaction should throw error', async () => {
    const tx = Object.assign({legacyKey: true, roleAccountUpdateKey: {publicKey}}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-421 : If transaction object has legacyKey and roleAccountUpdateKey, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true, roleAccountUpdateKey: {publicKey}}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)

  // LegacyKey with roleFeePayerKey
  it('CAVERJS-UNIT-TX-422 : If transaction object has legacyKey and roleFeePayerKey, signTransaction should throw error', async () => {
    const tx = Object.assign({legacyKey: true, roleFeePayerKey: {publicKey}}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>expect(err.message).to.equals('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.'))
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-422 : If transaction object has legacyKey and roleFeePayerKey, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true, roleFeePayerKey: {publicKey}}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO is duplicated.')
  }).timeout(200000)
})