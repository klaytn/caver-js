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

const specificPrivateKey = process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
  ? '0x' + process.env.privateKey
  : process.env.privateKey

beforeEach(() => {
  
  caver = new Caver(testRPCURL)
  
  if (specificPrivateKey) {
    reservoirAccountPrivateKey = specificPrivateKey
    const { address } = caver.klay.accounts.privateKeyToAccount(reservoirAccountPrivateKey)
    reservoirAccountAddress = address
  } else {
    reservoirAccountPrivateKey = 'bc1e77884c989403603183a1c392fbaf0ddfa80b73f7a474b3a1565579885da7'
    reservoirAccountAddress = '0x1f0fdb7c29793308356aa25757a4aa00e4a75122'
  }
  caver.klay.accounts.wallet.add(reservoirAccountPrivateKey)
})

describe('Account Creation with ACCOUNT_KEY_PUBLIC', () => {
  it('Should not fail when creation account with public key.', async () => {
    const { privateKey: anonymousPrivateKey } = caver.klay.accounts.create()
    const anonymousNewPublicKey = caver.klay.accounts.privateKeyToPublicKey(anonymousPrivateKey)
    const humanReadableAddress = 'jasmine9231.klaytn'
    caver.klay.accounts.wallet.add(anonymousPrivateKey, humanReadableAddress)

    const creationTx = {
      type: 'ACCOUNT_CREATION',
      from: reservoirAccountAddress,
      to: humanReadableAddress,
      gas: 5000000000000000,
      gasPrice: 25000000000,
      value: 1000,
      publicKey: anonymousNewPublicKey,
    }
    
    await caver.klay.sendTransaction(creationTx)

    const isReadable = await caver.klay.isHumanReadable(humanReadableAddress)
    const isCreated = await caver.klay.accountCreated(humanReadableAddress)
    const isContractAccount = await caver.klay.isContractAccount(humanReadableAddress)
    expect(isReadable).equals(true)
    expect(isCreated).equals(true)
    expect(isContractAccount).equals(false)

  }).timeout(200000)
})
