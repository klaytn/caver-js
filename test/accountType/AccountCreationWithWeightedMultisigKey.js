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

const BigNumber = require('bignumber.js')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')
const Chance = require('chance')
const chance = new Chance()

const helpers = rootRequire('caver-core-helpers')

let caver
let reservoirAccountPrivateKey
let reservoirAccountAddress
let humanreadableAddressPrefix = chance.last().replace(' ', '')
console.log('humanreadableAddressPrefix is: ', humanreadableAddressPrefix)

const specificPrivateKey = process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
  ? '0x' + process.env.privateKey
  : process.env.privateKey

beforeEach(() => {
  
  caver = new Caver(testRPCURL)
  
  if (specificPrivateKey) {
    reservoirAccountPrivateKey = specificPrivateKey
    const { address } = caver.klay.accounts.create(specificPrivateKey)
    reservoirAccountAddress = address
  }
  
  reservoirAccountPrivateKey = '0x13d9b943f760091854a403d0b59e21ef73908691e8269479c0965788f4376d59'
  reservoirAccountAddress = '0x90f70a303b6bca07d0275270cb6b0cea3870b3a7'
})

// role A key: general transaction. (All transactions except transaction of B, C).
// role B key: Account update transaction.
// role C key: Fee paying transaction.
describe('Account Creation with ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG', () => {
  it('Should fail to send "value transfer" transaction with a role B key.', (done) => {
  
    caver.klay.accounts.wallet.add(reservoirAccountPrivateKey)
  
    const { address: anonymousAddress } = caver.klay.accounts.create()
    
    const { privateKey: privateKeyA } = caver.klay.accounts.create()
    const { privateKey: privateKeyB } = caver.klay.accounts.create()
    const { privateKey: privateKeyC } = caver.klay.accounts.create()
    const { privateKey: privateKeyD } = caver.klay.accounts.create()
    
    const pubkey1 = caver.klay.accounts.privateKeyToPublicKey(privateKeyA)
    const pubkey2 = caver.klay.accounts.privateKeyToPublicKey(privateKeyB)
    const pubkey3 = caver.klay.accounts.privateKeyToPublicKey(privateKeyC)
    const pubkey4 = caver.klay.accounts.privateKeyToPublicKey(privateKeyD)
    
    const transaction = {
      type: 'ACCOUNT_CREATION',
      from: reservoirAccountAddress,
      to: anonymousAddress,
      multisig: {
        threshold: 3,
        keys: [
          { weight: 1, publicKey: pubkey1 },
          { weight: 1, publicKey: pubkey2 },
          { weight: 1, publicKey: pubkey3 },
          { weight: 1, publicKey: pubkey4 },
        ],
      },
      gas: '300000',
      chainId: 999,
      value: caver.utils.toPeb(1, 'KLAY'),
    }
    
    caver.klay.sendTransaction(transaction)
      .on('transactionHash', console.log)
      .on('receipt', async (receipt) => {
    
        const transactionFromAnonymous = {
          type: 'VALUE_TRANSFER',
          from: anonymousAddress,
          to: reservoirAccountAddress,
          gas: '300000',
          value: caver.utils.toPeb(1, 'KLAY'),
        }
        
        const { v: v1, r: r1, s: s1 } = await caver.klay.accounts.signTransaction(transactionFromAnonymous, privateKeyA)
        const { v: v2, r: r2, s: s2 } = await caver.klay.accounts.signTransaction(transactionFromAnonymous, privateKeyB)
        const { v: v3, r: r3, s: s3 } = await caver.klay.accounts.signTransaction(transactionFromAnonymous, privateKeyC)
        const { v: v4, r: r4, s: s4 } = await caver.klay.accounts.signTransaction(transactionFromAnonymous, privateKeyD)
        
        caver.klay.accounts.signTransactionWithSignature({
          ...transactionFromAnonymous,
          // signature: { v: v1, r: r1, s: s1 },
          // signature: [v1, r1, s1],
          // signature: r1 + s1.slice(2) + v1.slice(2),
          signature: [
            { v: v1, r: r1, s: s1 },
            { v: v2, r: r2, s: s2 },
            { v: v3, r: r3, s: s3 },
          ],
        })
          .then(({ rawTransaction }) => {
            caver.klay.sendSignedTransaction(rawTransaction)
              .on('receipt', console.log)
          })
      })
      .on('error', console.log)
  }).timeout(200000)
})
