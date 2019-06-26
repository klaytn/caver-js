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

describe('Account: Account update', () => {
  const publicKey = '0x4ef27ba4b7d1ae09b166744c5b7ee4a7a0cc5c76b2e5d74523a0a4fb56db319162ff3255302045cd047a27141916d55615a7c1ead06e211e62119e7bc2a40def'

  const sender_transaction = {
    type: 'ACCOUNT_UPDATE',
    from: '0x88e245dec96830f012f8fc1806bc623b3774560d',
    publicKey,
    nonce: '0x0',
    gas: '0x3b9ac9ff',
    chainId: '0x7e3',
    gasPrice: '0x5d21dba00',
  }
  const expectedRawTransaction ='0x20f88e808505d21dba00843b9ac9ff9488e245dec96830f012f8fc1806bc623b3774560da302a1034ef27ba4b7d1ae09b166744c5b7ee4a7a0cc5c76b2e5d74523a0a4fb56db3191f847f845820feaa07545ef18848ed30d377258aa99ec44c848b14e3b7c0bc3c0793d5d9acffb917ca06ffcf9720d7d87fbc9544c7fd1790fb318c4ecb64fe5bcfccd658a5c3d1c30e9'
  it('CAVERJS-UNIT-SER-002 : Sign transaction', async () => {
    caver = new Caver(testRPCURL)
    const privateKey = '0xed580f5bd71a2ee4dae5cb43e331b7d0318596e561e6add7844271ed94156b20'

    caver.klay.accounts.wallet.add(privateKey)
    

    const { rawTransaction } = await caver.klay.accounts.signTransaction(sender_transaction, privateKey)

    expect(rawTransaction).to.equal(expectedRawTransaction)

  }).timeout(200000)

  it('CAVERJS-UNIT-SER-042: Decode raw transaction', async () => {
    const txObj = decodeFromRawTransaction(expectedRawTransaction)

    expect(txObj).not.to.be.undefined
    expect(txObj.type).to.equals(sender_transaction.type)
    expect(caver.utils.hexToNumber(txObj.nonce)).to.equals(caver.utils.hexToNumber(sender_transaction.nonce))
    expect(caver.utils.hexToNumber(txObj.gasPrice)).to.equals(caver.utils.hexToNumber(sender_transaction.gasPrice))
    expect(caver.utils.hexToNumber(txObj.gas)).to.equals(caver.utils.hexToNumber(sender_transaction.gas))
    expect(txObj.from).to.equals(sender_transaction.from)
    expect(txObj.publicKey).to.equals(caver.utils.compressPublicKey(publicKey))
    expect(txObj.v).not.to.be.undefined
    expect(txObj.r).not.to.be.undefined
    expect(txObj.s).not.to.be.undefined
  }).timeout(200000)
})

describe('ACCOUNT_UPDATE transaction', () => {
  var accountUpdateObject
  var acct
  var publicKey, publicKey2, publicKey3, publicKey4
  var privateKey, privateKey2, privateKey3, privateKey4
  var multisig

  var createTestAccount = () => {
    testAccount = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
    publicKey = caver.klay.accounts.privateKeyToPublicKey(caver.klay.accounts.create().privateKey)
    const txObject = {
      from: senderAddress,
      to: testAccount.address,
      value: caver.utils.toPeb(1, 'KLAY'),
      gas: 900000,
    }
    // account update transaction object
    accountUpdateObject = {
      type: 'ACCOUNT_UPDATE',
      from: testAccount.address,
      gas: 900000,
    }

    return caver.klay.sendTransaction(txObject)
  }

  before(function (done){
    this.timeout(200000)
    caver = new Caver(testRPCURL)
    senderPrvKey = process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
        ? '0x' + process.env.privateKey
        : process.env.privateKey
  
    caver.klay.accounts.wallet.add(senderPrvKey)
  
    const sender = caver.klay.accounts.privateKeyToAccount(senderPrvKey)
    senderAddress = sender.address
  
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
  it('CAVERJS-UNIT-TX-187 : If transaction object missing from, signTransaction should throw error', async () => {
    const tx = Object.assign({publicKey}, accountUpdateObject)
    delete tx.from

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-187 : If transaction object missing from, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey}, accountUpdateObject)
    delete tx.from

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // UnnecessaryTo
  it('CAVERJS-UNIT-TX-188 : If transaction object has to, signTransaction should throw error', async () => {
    const tx = Object.assign({publicKey, to: senderAddress}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-188 : If transaction object has to, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey, to: senderAddress}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // UnnecessaryValue
  it('CAVERJS-UNIT-TX-189 : If transaction object has value, signTransaction should throw error', async () => {
    const tx = Object.assign({publicKey, value: 1}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-189 : If transaction object has value, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey, value: 1}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // MissingGas
  it('CAVERJS-UNIT-TX-190 : If transaction object missing gas and gasLimit, signTransaction should throw error', async () => {
    const tx = Object.assign({publicKey}, accountUpdateObject)
    delete tx.gas

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-190 : If transaction object missing gas and gasLimit, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey}, accountUpdateObject)
    delete tx.gas

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // MissingKey
  it('CAVERJS-UNIT-TX-191 : If transaction object missing key information, signTransaction should throw error', async () => {
    const tx = Object.assign({}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>{
        expect(err.message).to.equals('Missing key information with ACCOUNT_UPDATE transaction')
      })
  }).timeout(200000)
  
  it('CAVERJS-UNIT-TX-191 : If transaction object missing key information, sendTransaction should throw error', () => {
    const tx = Object.assign({}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws('Missing key information with ACCOUNT_UPDATE transaction')
  }).timeout(200000)

  // PublicKey
  it('CAVERJS-UNIT-TX-192 : If transaction object has only publicKey, update account with publicKey', async () => {
    const tx = Object.assign({publicKey: publicKey3}, accountUpdateObject)
    const receipt = await caver.klay.sendTransaction(tx)
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
  it('CAVERJS-UNIT-TX-194 : If compressed publicKey length is 64, signTransaction should throw error', async () => {
    const tx = Object.assign({publicKey : caver.utils.randomHex(32)}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-194 : If compressed publicKey length is 64, sendTransaction should throw error', async () => {
    const tx = Object.assign({publicKey : caver.utils.randomHex(32)}, accountUpdateObject)

    var result
    await caver.klay.sendTransaction(tx)
      .then(()=>result = false)
      .catch(()=>result = true)
      
    expect(result).to.be.true
  }).timeout(200000)

  // PublicKeyLength126
  it('CAVERJS-UNIT-TX-195 : If uncompressed publicKey length is 126, signTransaction should throw error', async () => {
    const tx = Object.assign({publicKey : caver.utils.randomHex(63)}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-195 : If uncompressed publicKey length is 126, sendTransaction should throw error', async () => {
    const tx = Object.assign({publicKey : caver.utils.randomHex(63)}, accountUpdateObject)

    var result
    await caver.klay.sendTransaction(tx)
      .then(()=>result = false)
      .catch(()=>result = true)
      
    expect(result).to.be.true
  }).timeout(200000)

  // Update with multisig.
  it('CAVERJS-UNIT-TX-196 : If transaction object has multisig, update account with multisig', async () => {
    const tx = Object.assign({multisig}, accountUpdateObject)

    const receipt = await caver.klay.sendTransaction(tx)
    expect(receipt.from).to.equals(tx.from)
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
  it('CAVERJS-UNIT-TX-197 : If transaction object has multisig and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({publicKey, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-197 : If transaction object has multisig and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({publicKey, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleTransactionKey.
  it('CAVERJS-UNIT-TX-198 : If transaction object has roleTransactionKey, update account with roleTransactionKey', async () => {
    var tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey: publicKey2}, roleFeePayerKey: {publicKey: publicKey3}}, accountUpdateObject)
    await caver.klay.sendTransaction(tx)
    caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

    tx = Object.assign({roleTransactionKey: {publicKey: publicKey4}}, accountUpdateObject)
    const receipt = await caver.klay.sendTransaction(tx)
    expect(receipt.from).to.equals(tx.from)
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
  it('CAVERJS-UNIT-TX-199 : If transaction object has roleTransactionKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-199 : If transaction object has roleTransactionKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleTransactionKey and multisig.
  it('CAVERJS-UNIT-TX-200 : If transaction object has roleTransactionKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-200 : If transaction object has roleTransactionKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleTransactionKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-201 : If transaction object has roleTransactionKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-201 : If transaction object has roleTransactionKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)
  
  // Update with roleAccountUpdateKey.
  it('CAVERJS-UNIT-TX-202 : If transaction object has roleAccountUpdateKey, update account with roleAccountUpdateKey', async () => {
    var tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey: publicKey2}, roleFeePayerKey: {publicKey: publicKey3}}, accountUpdateObject)
    await caver.klay.sendTransaction(tx)
    caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

    tx = Object.assign({roleAccountUpdateKey: {publicKey: publicKey4}}, accountUpdateObject)
    const receipt = await caver.klay.sendTransaction(tx)
    expect(receipt.from).to.equals(tx.from)
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
  it('CAVERJS-UNIT-TX-203 : If transaction object has roleAccountUpdateKey and roleTransactionKey, update account with roleAccountUpdateKey and roleTransactionKey', async () => {
    var tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey: publicKey2}, roleFeePayerKey: {publicKey: publicKey3}}, accountUpdateObject)
    await caver.klay.sendTransaction(tx)
    caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

    tx = Object.assign({roleTransactionKey: {publicKey: publicKey4}, roleAccountUpdateKey: {publicKey: publicKey}}, accountUpdateObject)
    const receipt = await caver.klay.sendTransaction(tx)
    expect(receipt.from).to.equals(tx.from)
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
  it('CAVERJS-UNIT-TX-204 : If transaction object has roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-204 : If transaction object has roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleAccountUpdateKey and multisig.
  it('CAVERJS-UNIT-TX-205 : If transaction object has roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-205 : If transaction object has roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleAccountUpdateKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-206 : If transaction object has roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-206 : If transaction object has roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleAccountUpdateKey, roleTransactionKey and publicKey.
  it('CAVERJS-UNIT-TX-207 : If transaction object has roleAccountUpdateKey, roleTransactionKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-207 : If transaction object has roleAccountUpdateKey, roleTransactionKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleAccountUpdateKey, roleTransactionKey and multisig.
  it('CAVERJS-UNIT-TX-208 : If transaction object has roleAccountUpdateKey, roleTransactionKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-208 : If transaction object has roleAccountUpdateKey, roleTransactionKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleAccountUpdateKey, roleTransactionKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-209 : If transaction object has roleAccountUpdateKey, roleTransactionKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-209 : If transaction object has roleAccountUpdateKey, roleTransactionKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleFeePayerKey.
  it('CAVERJS-UNIT-TX-210 : If transaction object has roleFeePayerKey, update account with roleFeePayerKey', async () => {
    var tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey: publicKey2}, roleFeePayerKey: {publicKey: publicKey3}}, accountUpdateObject)
    await caver.klay.sendTransaction(tx)
    caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

    tx = Object.assign({roleFeePayerKey: {publicKey: publicKey4}}, accountUpdateObject)
    const receipt = await caver.klay.sendTransaction(tx)
    expect(receipt.from).to.equals(tx.from)
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
  it('CAVERJS-UNIT-TX-211 : If transaction object has roleFeePayerKey and roleTransactionKey, update account with roleFeePayerKey and roleTransactionKey', async () => {
    var tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey: publicKey2}, roleFeePayerKey: {publicKey: publicKey3}}, accountUpdateObject)
    await caver.klay.sendTransaction(tx)
    caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

    tx = Object.assign({roleTransactionKey: {publicKey: publicKey3}, roleFeePayerKey: {publicKey: publicKey4}}, accountUpdateObject)
    const receipt = await caver.klay.sendTransaction(tx)
    expect(receipt.from).to.equals(tx.from)
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
  it('CAVERJS-UNIT-TX-212 : If transaction object has roleFeePayerKey and roleAccountUpdateKey, update account with roleFeePayerKey and roleAccountUpdateKey', async () => {
    var tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey: publicKey2}, roleFeePayerKey: {publicKey: publicKey3}}, accountUpdateObject)
    await caver.klay.sendTransaction(tx)
    caver.klay.accounts.wallet.updatePrivateKey(privateKey2, testAccount.address)

    tx = Object.assign({roleAccountUpdateKey: {publicKey: publicKey3}, roleFeePayerKey: {publicKey: publicKey4}}, accountUpdateObject)
    const receipt = await caver.klay.sendTransaction(tx)
    expect(receipt.from).to.equals(tx.from)
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
  it('CAVERJS-UNIT-TX-213 : If transaction object has roleTransactionKey, roleAccountUpdateKey and roleFeePayerKey, update account with roleTransactionKey, roleAccountUpdateKey and roleFeePayerKey', async () => {
    var tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey: publicKey2}, roleFeePayerKey: {publicKey: publicKey3}}, accountUpdateObject)
    const receipt = await caver.klay.sendTransaction(tx)
    expect(receipt.from).to.equals(tx.from)
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
  it('CAVERJS-UNIT-TX-214 : If transaction object has roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-214 : If transaction object has roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleFeePayerKey and multisig.
  it('CAVERJS-UNIT-TX-215 : If transaction object has roleFeePayerKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-215 : If transaction object has roleFeePayerKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleFeePayerKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-216 : If transaction object has roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-216 : If transaction object has roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleFeePayerKey, roleTransactionKey and publicKey.
  it('CAVERJS-UNIT-TX-217 : If transaction object has roleFeePayerKey, roleTransactionKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-217 : If transaction object has roleFeePayerKey, roleTransactionKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleFeePayerKey, roleTransactionKey and multisig.
  it('CAVERJS-UNIT-TX-218 : If transaction object has roleFeePayerKey, roleTransactionKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-218 : If transaction object has roleFeePayerKey, roleTransactionKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleFeePayerKey, roleTransactionKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-219 : If transaction object has roleFeePayerKey, roleTransactionKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-219 : If transaction object has roleFeePayerKey, roleTransactionKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)
  
  // Update with roleFeePayerKey, roleAccountUpdateKey and publicKey.
  it('CAVERJS-UNIT-TX-220 : If transaction object has roleFeePayerKey, roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-220 : If transaction object has roleFeePayerKey, roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleFeePayerKey, roleAccountUpdateKey and multisig.
  it('CAVERJS-UNIT-TX-221 : If transaction object has roleFeePayerKey, roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-221 : If transaction object has roleFeePayerKey, roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleFeePayerKey, roleAccountUpdateKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-222 : If transaction object has roleFeePayerKey, roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-222 : If transaction object has roleFeePayerKey, roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)
  
  // Update with roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and publicKey.
  it('CAVERJS-UNIT-TX-223 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-223 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and multisig.
  it('CAVERJS-UNIT-TX-224 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-224 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-225 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-225 : If transaction object has roleFeePayerKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)
  
  // Update with failKey.
  it('CAVERJS-UNIT-TX-226 : If transaction object has failKey, update account with failKey', async () => {
    const tx = Object.assign({failKey: true}, accountUpdateObject)
    const receipt = await caver.klay.sendTransaction(tx)
    expect(receipt.from).to.equals(tx.from)

    const key = await caver.klay.getAccountKey(receipt.from)
    expect(key.keyType).to.equals(3)

    await createTestAccount()
  }).timeout(200000)

  // Update with failKey and publicKey.
  it('CAVERJS-UNIT-TX-227 : If transaction object has failKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-227 : If transaction object has failKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey and multisig.
  it('CAVERJS-UNIT-TX-228 : If transaction object has failKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-228 : If transaction object has failKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-229 : If transaction object has failKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, publicKey, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-229 : If transaction object has failKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, publicKey, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey and roleTransactionKey.
  it('CAVERJS-UNIT-TX-230 : If transaction object has failKey and roleTransactionKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-230 : If transaction object has failKey and roleTransactionKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleTransactionKey and publicKey.
  it('CAVERJS-UNIT-TX-231 : If transaction object has failKey, roleTransactionKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-231 : If transaction object has failKey, roleTransactionKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleTransactionKey and multisig.
  it('CAVERJS-UNIT-TX-232 : If transaction object has failKey, roleTransactionKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-232 : If transaction object has failKey, roleTransactionKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-233 : If transaction object has failKey, roleTransactionKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-233 : If transaction object has failKey, roleTransactionKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey and roleAccountUpdateKey.
  it('CAVERJS-UNIT-TX-234 : If transaction object has failKey and roleAccountUpdateKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-234 : If transaction object has failKey and roleAccountUpdateKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleAccountUpdateKey and publicKey.
  it('CAVERJS-UNIT-TX-235 : If transaction object has failKey, roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-235 : If transaction object has failKey, roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleAccountUpdateKey and multisig.
  it('CAVERJS-UNIT-TX-236 : If transaction object has failKey, roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-236 : If transaction object has failKey, roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleAccountUpdateKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-237 : If transaction object has failKey, roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-237 : If transaction object has failKey, roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey and roleFeePayerKey.
  it('CAVERJS-UNIT-TX-238 : If transaction object has failKey and roleFeePayerKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleFeePayerKey: {publicKey}}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-238 : If transaction object has failKey and roleFeePayerKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleFeePayerKey: {publicKey}}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleFeePayerKey and publicKey.
  it('CAVERJS-UNIT-TX-239 : If transaction object has failKey, roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-239 : If transaction object has failKey, roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleFeePayerKey and multisig.
  it('CAVERJS-UNIT-TX-240 : If transaction object has failKey, roleFeePayerKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-240 : If transaction object has failKey, roleFeePayerKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleFeePayerKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-241 : If transaction object has failKey, roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-241 : If transaction object has failKey, roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleAccountUpdateKey and publicKey.
  it('CAVERJS-UNIT-TX-242 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-242 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleAccountUpdateKey and multisig.
  it('CAVERJS-UNIT-TX-243 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-243 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-244 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-244 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleFeePayerKey and publicKey.
  it('CAVERJS-UNIT-TX-245 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-245 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleFeePayerKey and multisig.
  it('CAVERJS-UNIT-TX-246 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-246 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleFeePayerKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-247 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-247 : If transaction object has failKey, roleTransactionKey, roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleAccountUpdateKey, roleFeePayerKey and publicKey.
  it('CAVERJS-UNIT-TX-248 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-248 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleAccountUpdateKey, roleFeePayerKey and multisig.
  it('CAVERJS-UNIT-TX-249 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-249 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-250 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-250 : If transaction object has failKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and publicKey.
  it('CAVERJS-UNIT-TX-251 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-251 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and multisig.
  it('CAVERJS-UNIT-TX-252 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-252 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update with failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig.
  it('CAVERJS-UNIT-TX-253 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-253 : If transaction object has failKey, roleTransactionKey, roleAccountUpdateKey, roleFeePayerKey, publicKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({failKey: true, roleTransactionKey: {publicKey}, roleAccountUpdateKey: {publicKey}, roleFeePayerKey: {publicKey}, publicKey, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // UnnecessaryData
  it('CAVERJS-UNIT-TX-254 : If transaction object has data, signTransaction should throw error', async () => {
    const tx = Object.assign({data: '0x68656c6c6f', publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-254 : If transaction object has data, sendTransaction should throw error', () => {
    const tx = Object.assign({data: '0x68656c6c6f', publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // UnnecessaryFeePayer
  it('CAVERJS-UNIT-TX-255 : If transaction object has feePayer, signTransaction should throw error', async () => {
    const tx = Object.assign({feePayer: caver.klay.accounts.create().address, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-255 : If transaction object has feePayer, sendTransaction should throw error', () => {
    const tx = Object.assign({feePayer: caver.klay.accounts.create().address, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // UnnecessaryFeeRatio
  it('CAVERJS-UNIT-TX-256 : If transaction object has feeRatio, signTransaction should throw error', async () => {
    const tx = Object.assign({feeRatio: 20, publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-256 : If transaction object has feeRatio, sendTransaction should throw error', () => {
    const tx = Object.assign({feeRatio: 20, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // UnnecessaryCodeFormat
  it('CAVERJS-UNIT-TX-257 : If transaction object has codeFormat, signTransaction should throw error', async () => {
    const tx = Object.assign({codeFormat: 'EVM', publicKey}, accountUpdateObject)

    var result
    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>result = false)
      .catch(()=>result = true)

    expect(result).to.be.true
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-257 : If transaction object has codeFormat, sendTransaction should throw error', () => {
    const tx = Object.assign({codeFormat: 'EVM', publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws()
  }).timeout(200000)

  // Update account with legacyKey
  it('CAVERJS-UNIT-TX-258 : If transaction object has only legacyKey, update account with legacyKey', async () => {
    const tx = Object.assign({legacyKey: true}, accountUpdateObject)

    const receipt = await caver.klay.sendTransaction(tx)
    expect(receipt.from).to.equals(tx.from)

    const key = await caver.klay.getAccountKey(receipt.from)
    expect(key.keyType).to.equals(1)
  }).timeout(200000)

  // LegacyKey with publicKey
  it('CAVERJS-UNIT-TX-259 : If transaction object has legacyKey and publicKey, signTransaction should throw error', async () => {
    const tx = Object.assign({legacyKey: true, publicKey}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>{
        expect(err.message).to.equals('The key parameter to be used for ACCOUNT_UPDATE is duplicated.')
      })
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-259 : If transaction object has legacyKey and publicKey, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true, publicKey}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for ACCOUNT_UPDATE is duplicated.')
  }).timeout(200000)

  // LegacyKey with multisig
  it('CAVERJS-UNIT-TX-260 : If transaction object has legacyKey and multisig, signTransaction should throw error', async () => {
    const tx = Object.assign({legacyKey: true, multisig}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>{
        expect(err.message).to.equals('The key parameter to be used for ACCOUNT_UPDATE is duplicated.')
      })
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-260 : If transaction object has legacyKey and multisig, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true, multisig}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for ACCOUNT_UPDATE is duplicated.')
  }).timeout(200000)

  // LegacyKey with failKey
  it('CAVERJS-UNIT-TX-261 : If transaction object has legacyKey and failKey, signTransaction should throw error', async () => {
    const tx = Object.assign({legacyKey: true, failKey: true}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>{
        expect(err.message).to.equals('The key parameter to be used for ACCOUNT_UPDATE is duplicated.')
      })
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-261 : If transaction object has legacyKey and failKey, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true, failKey: true}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for ACCOUNT_UPDATE is duplicated.')
  }).timeout(200000)

  // LegacyKey with roleTransactionKey
  it('CAVERJS-UNIT-TX-262 : If transaction object has legacyKey and roleTransactionKey, signTransaction should throw error', async () => {
    const tx = Object.assign({legacyKey: true, roleTransactionKey: {publicKey}}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>{
        expect(err.message).to.equals('The key parameter to be used for ACCOUNT_UPDATE is duplicated.')
      })
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-262 : If transaction object has legacyKey and roleTransactionKey, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true, roleTransactionKey: {publicKey}}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for ACCOUNT_UPDATE is duplicated.')
  }).timeout(200000)

  // LegacyKey with roleAccountUpdateKey
  it('CAVERJS-UNIT-TX-263 : If transaction object has legacyKey and roleAccountUpdateKey, signTransaction should throw error', async () => {
    const tx = Object.assign({legacyKey: true, roleAccountUpdateKey: {publicKey}}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>{
        expect(err.message).to.equals('The key parameter to be used for ACCOUNT_UPDATE is duplicated.')
      })
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-263 : If transaction object has legacyKey and roleAccountUpdateKey, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true, roleAccountUpdateKey: {publicKey}}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for ACCOUNT_UPDATE is duplicated.')
  }).timeout(200000)

  // LegacyKey with roleFeePayerKey
  it('CAVERJS-UNIT-TX-264 : If transaction object has legacyKey and roleFeePayerKey, signTransaction should throw error', async () => {
    const tx = Object.assign({legacyKey: true, roleFeePayerKey: {publicKey}}, accountUpdateObject)

    await caver.klay.accounts.signTransaction(tx, testAccount.privateKey)
      .then(()=>assert(false))
      .catch((err)=>{
        expect(err.message).to.equals('The key parameter to be used for ACCOUNT_UPDATE is duplicated.')
      })
  }).timeout(200000)

  it('CAVERJS-UNIT-TX-264 : If transaction object has legacyKey and roleFeePayerKey, sendTransaction should throw error', () => {
    const tx = Object.assign({legacyKey: true, roleFeePayerKey: {publicKey}}, accountUpdateObject)

    // Throw error from formatter validation
    expect(()=> caver.klay.sendTransaction(tx)).to.throws('The key parameter to be used for ACCOUNT_UPDATE is duplicated.')
  }).timeout(200000)
})