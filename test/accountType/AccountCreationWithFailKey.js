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

// @TODO: Too nested transaction.
describe('Account Creation with ACCOUNT_KEY_FAIL_TAG', () => {
  it('Should fail to send a "VALUE TRANSFER" transaction from the account used AccountKeyFail key', (done) => {
  
    caver.klay.accounts.wallet.add(reservoirAccountPrivateKey)
  
    const { address: anonymousAddress, privateKey: anonymousPrivateKey } = caver.klay.accounts.create()
    
    caver.klay.accounts.wallet.add(anonymousPrivateKey)
    const transaction3 = {
      type: 'ACCOUNT_CREATION',
      from: reservoirAccountAddress,
      to: anonymousAddress,
      failKey: true,
      gas: '300000',
      value: caver.utils.toPeb(5, 'KLAY'),
    }
    
    caver.klay.sendTransaction(transaction3)
      .on('transactionHash', console.log)
      .on('receipt', async (receipt) => {
        
        const transactionFromAnonymous = {
          type: 'VALUE_TRANSFER',
          from: anonymousAddress,
          to: reservoirAccountAddress,
          gas: '300000',
          value: caver.utils.toPeb(1, 'KLAY'),
        }
  
        caver.klay.sendTransaction(transactionFromAnonymous)
          .on('transactionHash', console.log)
          .on('error', (err) => {
            expect(err).to.exist
            done()
          })
      })
      .on('error', console.log)
  }).timeout(200000)
})
