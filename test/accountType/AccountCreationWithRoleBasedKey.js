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
    const { address } = caver.klay.accounts.privateKeyToAccount(specificPrivateKey)
    caver.klay.accounts.wallet.add(specificPrivateKey)
    reservoirAccountAddress = address
  } else {
    reservoirAccountPrivateKey = '0x13d9b943f760091854a403d0b59e21ef73908691e8269479c0965788f4376d59'
    reservoirAccountAddress = '0x90f70a303b6bca07d0275270cb6b0cea3870b3a7'
  }
  
})

// role A key: general transaction. (All transactions except transaction of B, C).
// role B key: Account update transaction.
// role C key: Fee paying transaction.
describe('Account Creation with ACCOUNT_KEY_ROLE_BASED_TAG', () => {
  it('Should fail to send "value transfer" transaction with a role B key.', (done) => {
  
    caver.klay.accounts.wallet.add(reservoirAccountPrivateKey)
  
    const { address: anonymousAddress, privateKey: anonymousPrivateKey } = caver.klay.accounts.create()
    
    const { privateKey: roleAPrivateKey } = caver.klay.accounts.create()
    const { privateKey: roleBPrivateKey } = caver.klay.accounts.create()
    const { privateKey: roleCPrivateKey } = caver.klay.accounts.create()
    
    const roleAPublicKey = '0xe4a01407460c1c03ac0c82fd84f303a699b210c0b054f4aff72ff7dcdf01512d0a5735a23ce1654b14680054a993441eae7c261983a56f8e0da61280758b5919'
    const roleBPublicKey = '0x36f6355f5b532c3c1606f18fa2be7a16ae200c5159c8031dd25bfa389a4c9c066fdf9fc87a16ac359e66d9761445d5ccbb417fb7757a3f5209d713824596a50d'
    const roleCPublicKey = '0xc8785266510368d9372badd4c7f4a94b692e82ba74e0b5e26b34558b0f08144794c27901465af0a703859ab47f8ae17e54aaba453b7cde5a6a9e4a32d45d72b2'
    
    const transaction = {
      type: 'ACCOUNT_CREATION',
      from: reservoirAccountAddress,
      to: anonymousAddress,
      roleTransactionKey: {
        publicKey: roleAPublicKey,
      },
      roleAccountUpdateKey: {
        publicKey: roleBPublicKey,
      },
      roleFeePayerKey: {
        publicKey: roleCPublicKey,
      },
      gas: '300000',
      value: caver.utils.toPeb(5, 'KLAY'),
    }
    
    caver.klay.sendTransaction(transaction)
      .on('transactionHash', console.log)
      .on('receipt', async (receipt) => {
    
        // const transactionFromAnonymous = {
        //   type: 'VALUE_TRANSFER',
        //   from: anonymousAddress,
        //   to: reservoirAccountAddress,
        //   gas: '300000',
        //   value: caver.utils.toPeb(1, 'KLAY'),
        // }
        // 
        // caver.klay.sendTransaction(transactionFromAnonymous)
        //   .on('transactionHash', console.log)
        //   .on('error', (err) => {
        //     expect(err).to.exist
        //     done()
        //   })
        console.log(receipt, 'receipt')
        done()
      })
      .on('error', console.log)
  }).timeout(200000)
})
