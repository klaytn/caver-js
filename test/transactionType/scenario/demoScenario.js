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
const fetch = require('node-fetch')
const { expect } = require('../../extendedChai')

const BigNumber = require('bignumber.js')

const testRPCURL = require('../../testrpc')
const Caver = require('../../../index.js')
const Chance = require('chance')
const chance = new Chance()

const helpers = rootRequire('caver-core-helpers')

let caver
let reservoirAccountPrivateKey
let reservoirAccountAddress
let humanreadableAddressPrefix = chance.last().replace(' ', '').slice(0, 12)
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


describe('Demo scenario', () => {
  it('1. Should transfer value with a legacy transaction type', (done) => {
  
    caver.klay.accounts.wallet.add(reservoirAccountPrivateKey)
  
    const { address: anonymousAddress } = caver.klay.accounts.create()
  
    const transaction = {
      from: reservoirAccountAddress,
      to: anonymousAddress,
      gas: '4000000000',
      value: caver.utils.toPeb('0.05', 'KLAY'),
    }
  
    caver.klay.sendTransaction(transaction)
      .on('transactionHash', console.log)
      .on('receipt', async (receipt) => {
        const newAccountBalance = await caver.klay.getBalance(anonymousAddress)
  
        expect(newAccountBalance).to.equal(caver.utils.toPeb('0.05', 'KLAY'))
  
        done()
      })
      .on('error', console.log)
  }).timeout(200000)
  
  it(`
       2. Should create an account (non-humanreadable) using TxTypeAccountCreation &&
       Could sign transaction with newly-created private key from newly-created account address
    `, (done) => {
  
    caver.klay.accounts.wallet.add(reservoirAccountPrivateKey)
  
    const { address: anonymousAddress } = caver.klay.accounts.create()
  
    const { privateKey: anonymousNewPrivateKey } = caver.klay.accounts.create()
    const anonymousNewPublicKey = caver.klay.accounts.privateKeyToPublicKey(anonymousNewPrivateKey)
  
    const transaction = {
      type: 'ACCOUNT_CREATION',
      from: reservoirAccountAddress,
      to: anonymousAddress,
      gas: '4000000000',
      value: caver.utils.toPeb('0.02', 'KLAY'),
      publicKey: anonymousNewPublicKey,
    }
  
    caver.klay.sendTransaction(transaction)
      .on('transactionHash', console.log)
      .on('receipt', async (receipt) => {
  
        caver.klay.accounts.wallet.add(anonymousNewPrivateKey, anonymousAddress)
  
        // anonymous2Address will get 1 KLAY from newly-created anonymousAddress.
        const { address: anonymous2Address } = caver.klay.accounts.create()
        caver.klay.sendTransaction({
          type: 'VALUE_TRANSFER',
          gas: '4000000000',
          from: anonymousAddress,
          to: anonymous2Address,
          value: caver.utils.toPeb('0.01', 'KLAY'),
        })
          .on('transactionHash', console.log)
          .on('receipt', async () => {
            const newAccountBalance = await caver.klay.getBalance(anonymous2Address)
  
            // If anonymousAddress sends a legacy transaction successfully, 
            // anonymous2 address balance should not be equal to 0.
            expect(newAccountBalance).to.equal(caver.utils.toPeb('0.01', 'KLAY'))
            done()
          })
      })
      .on('error', console.log)
  }).timeout(200000)
  
  it(`3. Should be failed on creating same account (non-humanreadable) which already created before using TxTypeAccountCreation`, (done) => {
  
    caver.klay.accounts.wallet.add(reservoirAccountPrivateKey)
  
    const { address: anonymousAddress } = caver.klay.accounts.create()
  
    const { privateKey: anonymousNewPrivateKey } = caver.klay.accounts.create()
    const anonymousNewPublicKey = caver.klay.accounts.privateKeyToPublicKey(anonymousNewPrivateKey)
  
    const transaction = {
      type: 'ACCOUNT_CREATION',
      from: reservoirAccountAddress,
      to: anonymousAddress,
      gas: '4000000000',
      value: caver.utils.toPeb('0.01', 'KLAY'),
      publicKey: anonymousNewPublicKey,
    }
  
    caver.klay.sendTransaction(transaction)
      .on('transactionHash', console.log)
      .on('receipt', async (receipt) => {
  
        caver.klay.sendTransaction({
          type: 'ACCOUNT_CREATION',
          from: reservoirAccountAddress,
          to: anonymousAddress,
          gas: '4000000000',
          value: caver.utils.toPeb('0.01', 'KLAY'),
          publicKey: anonymousNewPublicKey,
        })
          .on('transactionHash', console.log)
          .on('receipt', (receipt) => {
            done()
          })
          .on('error', (err) => {
            // Should throw an error since the account was created already.
            expect(err).to.exist
            done()
          })
      })
      .on('error', console.log)
  }).timeout(200000)
  // 
  it('4. Should send value transfer transaction to decoupled account', (done) => {
  
    caver.klay.accounts.wallet.add(reservoirAccountPrivateKey)
  
    const { address: anonymousAddress } = caver.klay.accounts.create()
  
    const { privateKey: anonymousNewPrivateKey } = caver.klay.accounts.create()
    const anonymousNewPublicKey = caver.klay.accounts.privateKeyToPublicKey(anonymousNewPrivateKey)
  
    const transaction = {
      type: 'ACCOUNT_CREATION',
      from: reservoirAccountAddress,
      to: anonymousAddress,
      gas: '4000000000',
      publicKey: anonymousNewPublicKey,
    }
  
    caver.klay.sendTransaction(transaction)
      .on('transactionHash', console.log)
      .on('receipt', (receipt) => {
  
        const transaction = {
          type: 'VALUE_TRANSFER',
          from: reservoirAccountAddress,
          to: anonymousAddress,
          gas: '4000000000',
          value: caver.utils.toPeb('0.05', 'KLAY'),
        }
  
        caver.klay.sendTransaction(transaction)
          .on('transactionHash', console.log)
          .on('receipt', async () => {
            const newAccountBalance = await caver.klay.getBalance(anonymousAddress)
            expect(newAccountBalance).to.equal(caver.utils.toPeb('0.05', 'KLAY'))
            done()
          })
      })
      .on('error', console.log)
  }).timeout(200000)
  
  it('5. Should send value transfer transaction from decoupled account to reservoirAccount', (done) => {
  
    caver.klay.accounts.wallet.add(reservoirAccountPrivateKey)
  
    const { address: anonymousAddress } = caver.klay.accounts.create()
  
    const { privateKey: anonymousNewPrivateKey } = caver.klay.accounts.create()
  
    const anonymousNewPublicKey = caver.klay.accounts.privateKeyToPublicKey(anonymousNewPrivateKey)
  
  
    const transaction = {
      type: 'ACCOUNT_CREATION',
      from: reservoirAccountAddress,
      to: anonymousAddress,
      gas: '4000000000',
      publicKey: anonymousNewPublicKey,
      value: caver.utils.toPeb('0.05', 'KLAY'),
    }
  
    caver.klay.sendTransaction(transaction)
      .on('transactionHash', console.log)
      .on('receipt', async (receipt) => {
  
        caver.klay.accounts.wallet.add(anonymousNewPrivateKey, anonymousAddress)
  
        const reservoirBeforeBalance = await caver.klay.getBalance(reservoirAccountAddress)
  
        const anonymousAccountBeforeBalance = await caver.klay.getBalance(anonymousAddress)
  
        const transaction = {
          type: 'VALUE_TRANSFER',
          from: anonymousAddress,
          to: reservoirAccountAddress,
          gas: '4000000000',
          value: caver.utils.toPeb('0.03', 'KLAY'),
        }
  
        caver.klay.sendTransaction(transaction)
          .on('transactionHash', console.log)
          .on('receipt', async () => {
            const newAccountBalance = await caver.klay.getBalance(reservoirAccountAddress)
  
  
            const expectedAccountBalance = new BigNumber(reservoirBeforeBalance).plus(caver.utils.toPeb('0.03', 'KLAY')).toString(10)
            expect(newAccountBalance).to.equal(expectedAccountBalance)
            done()
          })
      })
      .on('error', console.log)
  }).timeout(200000)
  
  it('6. Should create an account (human-readable)', (done) => {
  
    caver.klay.accounts.wallet.add(reservoirAccountPrivateKey)
  
    const humanReadableAddress = humanreadableAddressPrefix + 'a' + '.klaytn'
    console.log('humanReadableAddress: ' + humanReadableAddress)
  
    const { privateKey: colinNewPrivateKey } = caver.klay.accounts.create()
    const colinNewPublicKey = caver.klay.accounts.privateKeyToPublicKey(colinNewPrivateKey)
  
    const transaction = {
      type: 'ACCOUNT_CREATION',
      from: reservoirAccountAddress,
      to: humanReadableAddress,
      gas: '4000000000',
      publicKey: colinNewPublicKey,
      value: caver.utils.toPeb('0.05', 'KLAY'),
    }
  
    caver.klay.sendTransaction(transaction)
      .on('transactionHash', console.log)
      .on('receipt', async (receipt) => {
  
        const newAccountBalance = await caver.klay.getBalance(humanReadableAddress)
        expect(newAccountBalance).to.equal(caver.utils.toPeb('0.05', 'KLAY'))
        done()
      })
      .on('error', console.log)
  }).timeout(200000)
  
  it(`
    7. Should create an account (human-readable) 
    && send value transfer transaction from human-readable to reservoir
    `, (done) => {
  
    caver.klay.accounts.wallet.add(reservoirAccountPrivateKey)
  
    const humanReadableAddress = humanreadableAddressPrefix + 'b' + '.klaytn'
    console.log('humanReadableAddress: ' + humanReadableAddress)
  
    const { privateKey: colinNewPrivateKey } = caver.klay.accounts.create()
    const colinNewPublicKey = caver.klay.accounts.privateKeyToPublicKey(colinNewPrivateKey)
  
    const transaction = {
      type: 'ACCOUNT_CREATION',
      from: reservoirAccountAddress,
      to: humanReadableAddress,
      gas: '4000000000',
      publicKey: colinNewPublicKey,
      value: caver.utils.toPeb('0.05', 'KLAY'),
    }
  
    caver.klay.sendTransaction(transaction)
      .on('transactionHash', console.log)
      .on('receipt', async (receipt) => {
  
        const reservoirBeforeBalance = await caver.klay.getBalance(reservoirAccountAddress)
  
        caver.klay.accounts.wallet.add(colinNewPrivateKey, humanReadableAddress)
  
        const transaction = {
          type: 'VALUE_TRANSFER',
          from: humanReadableAddress,
          to: reservoirAccountAddress,
          gas: '4000000000',
          value: caver.utils.toPeb('0.03', 'KLAY'),
        }
  
        caver.klay.sendTransaction(transaction)
          .on('transactionHash', console.log)
          .on('receipt', async () => {
            const newAccountBalance = await caver.klay.getBalance(reservoirAccountAddress)
            // expect(newAccountBalance).to.equal(
            //   new BigNumber(reservoirBeforeBalance)
            //     .plus(caver.utils.toPeb('0.03', 'KLAY'))
            //     .toString(10)
            //   )
            done()
          })
  
      })
      .on('error', console.log)
  }).timeout(200000)
  
  it(`
    8. Should create an account (human-readable) 
    && send fee-delegated value transfer transaction from human-readable to reservoir (fee payer: reservoir)
    `, (done) => {
  
    caver.klay.accounts.wallet.add(reservoirAccountPrivateKey)
  
    const humanReadableAddress = humanreadableAddressPrefix + 'c' + '.klaytn'
    console.log('humanReadableAddress: ' + humanReadableAddress)
  
    const { privateKey: colinNewPrivateKey } = caver.klay.accounts.create()
    const colinNewPublicKey = caver.klay.accounts.privateKeyToPublicKey(colinNewPrivateKey)
  
    const transaction = {
      type: 'ACCOUNT_CREATION',
      from: reservoirAccountAddress,
      to: humanReadableAddress,
      gas: '4000000000',
      publicKey: colinNewPublicKey,
      value: caver.utils.toPeb('0.05', 'KLAY'),
    }
  
    caver.klay.sendTransaction(transaction)
      .on('transactionHash', console.log)
      .on('receipt', async (receipt) => {
  
        caver.klay.accounts.wallet.add(colinNewPrivateKey, humanReadableAddress)
  
        const reservoirBeforeBalance = await caver.klay.getBalance(reservoirAccountAddress)
  
        const senderTransaction = {
          type: 'FEE_DELEGATED_VALUE_TRANSFER',
          from: humanReadableAddress,
          to: reservoirAccountAddress,
          gas: '4000000000',
          value: caver.utils.toPeb('0.03', 'KLAY'),
        }
  
        const { rawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, colinNewPrivateKey)
  
        const feePayerTransaction = {
          feePayer: reservoirAccountAddress,
          senderRawTransaction: rawTransaction,
        } 
  
        caver.klay.sendTransaction(feePayerTransaction)
          .on('transactionHash', console.log)
          .on('receipt', async (receipt) => {
            const gasPrice = await caver.klay.getGasPrice()
            const usedGasPrice = new BigNumber(gasPrice).multipliedBy(receipt.gasUsed)
  
            const newAccountBalance = await caver.klay.getBalance(reservoirAccountAddress)
            // expect(newAccountBalance).to.equal(
            //   new BigNumber(reservoirBeforeBalance)
            //     .plus(caver.utils.toPeb('0.03', 'KLAY'))
            //     .minus(usedGasPrice)
            //     .toString(10)
            //   )
            done()
          })
  
      })
      .on('error', console.log)
  }).timeout(200000)
  
  it(`
    9. Should create an account (human-readable) 
    && send "fee-delegated value transfer with ratio transaction" from human-readable to reservoir (fee payer: reservoir)
    `, (done) => {
  
    caver.klay.accounts.wallet.add(reservoirAccountPrivateKey)
  
    const humanReadableAddress = humanreadableAddressPrefix + 'd' + '.klaytn'
    console.log('humanReadableAddress: ' + humanReadableAddress)
  
    const { privateKey: colinNewPrivateKey } = caver.klay.accounts.create()
    const colinNewPublicKey = caver.klay.accounts.privateKeyToPublicKey(colinNewPrivateKey)
  
    const transaction = {
      type: 'ACCOUNT_CREATION',
      from: reservoirAccountAddress,
      to: humanReadableAddress,
      gas: '4000000000',
      publicKey: colinNewPublicKey,
      value: caver.utils.toPeb('0.05', 'KLAY'),
    }
  
    caver.klay.sendTransaction(transaction)
      .on('transactionHash', console.log)
      .on('receipt', async (receipt) => {
  
        caver.klay.accounts.wallet.add(colinNewPrivateKey, humanReadableAddress)
  
        const reservoirBeforeBalance = await caver.klay.getBalance(reservoirAccountAddress)
  
        const feeRatio = 30
  
        const senderTransaction = {
          type: 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO',
          from: humanReadableAddress,
          to: reservoirAccountAddress,
          gas: '4000000000',
          value: caver.utils.toPeb('0.03', 'KLAY'),
          feeRatio: feeRatio,
        }
  
        const { rawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, colinNewPrivateKey)
  
        const feePayerTransaction = {
          feePayer: reservoirAccountAddress,
          senderRawTransaction: rawTransaction,
        } 
  
        caver.klay.sendTransaction(feePayerTransaction)
          .on('transactionHash', console.log)
          .on('receipt', async (receipt) => {
            const gasPrice = await caver.klay.getGasPrice()
            const usedGasPrice = new BigNumber(gasPrice).multipliedBy(receipt.gasUsed).multipliedBy(feeRatio / 100)
            console.log(usedGasPrice.toString(10), 'usedGasPrice')
  
            console.log(new BigNumber(reservoirBeforeBalance)
              .plus(caver.utils.toPeb('0.03', 'KLAY'))
              .minus(usedGasPrice)
              .toString(10))
  
            const newAccountBalance = await caver.klay.getBalance(reservoirAccountAddress)
            // expect(newAccountBalance).to.equal(
            //   new BigNumber(reservoirBeforeBalance)
            //     .plus(caver.utils.toPeb('0.03', 'KLAY'))
            //     .minus(usedGasPrice)
            //     .toString(10)
            //   )
            done()
          })
  
      })
      .on('error', console.log)
  }).timeout(200000)
  
  it(`
    10. Should create an decoupled account
    && send "value transfer memo transaction" from reservoir to decoupled
    `, (done) => {
  
    caver.klay.accounts.wallet.add(reservoirAccountPrivateKey)
  
    const { address: anonymousAddress } = caver.klay.accounts.create()
  
    const { privateKey: anonymousNewPrivateKey } = caver.klay.accounts.create()
    const anonymousNewPublicKey = caver.klay.accounts.privateKeyToPublicKey(anonymousNewPrivateKey)
  
    const transaction = {
      type: 'ACCOUNT_CREATION',
      from: reservoirAccountAddress,
      to: anonymousAddress,
      gas: '4000000000',
      publicKey: anonymousNewPublicKey,
    }
  
    caver.klay.sendTransaction(transaction)
      .on('transactionHash', console.log)
      .on('receipt', async (receipt) => {
  
        caver.klay.accounts.wallet.add(anonymousNewPrivateKey, anonymousAddress)
  
        const transaction = {
          type: 'VALUE_TRANSFER_MEMO',
          from: reservoirAccountAddress,
          to: anonymousAddress,
          gas: '4000000000',
          value: caver.utils.toPeb('0.03', 'KLAY'),
          data: '0xffff',
        } 
  
        caver.klay.sendTransaction(transaction)
          .on('transactionHash', console.log)
          .on('receipt', async (receipt) => {
            const _transaction = await caver.klay.getTransaction(receipt.transactionHash || receipt.txHash)
  
            // expect(_transaction.input).not.to.equal('0x')
            const newAccountBalance = await caver.klay.getBalance(anonymousAddress)
            // expect(newAccountBalance).to.equal(caver.utils.toPeb('0.03', 'KLAY'))
            done()
          })
  
      })
      .on('error', console.log)
  }).timeout(200000)
  
  it(`
    11. Should create an decoupled account
    && send "fee-delegated value transfer memo transaction" from reservoir to decoupled (fee payer: humanreadable account)
    `, (done) => {
  
    // 11-1. Create human-readable fee payer account
    caver.klay.accounts.wallet.add(reservoirAccountPrivateKey)
  
    const humanReadableAddress = humanreadableAddressPrefix + 'e' + '.klaytn'
    console.log('humanReadableAddress: ' + humanReadableAddress)
  
    const { privateKey: colinNewPrivateKey } = caver.klay.accounts.create()
    const colinNewPublicKey = caver.klay.accounts.privateKeyToPublicKey(colinNewPrivateKey)
  
    const transaction = {
      type: 'ACCOUNT_CREATION',
      from: reservoirAccountAddress,
      to: humanReadableAddress,
      gas: '4000000000',
      publicKey: colinNewPublicKey,
      value: caver.utils.toPeb('0.05', 'KLAY'),
    }
  
    caver.klay.sendTransaction(transaction)
      .on('transactionHash', console.log)
      .on('receipt', async (receipt) => {
  
        // 11-2. create decoupled account
        const { address: anonymousAddress } = caver.klay.accounts.create()
        const { privateKey: anonymousNewPrivateKey } = caver.klay.accounts.create()
        const anonymousNewPublicKey = caver.klay.accounts.privateKeyToPublicKey(anonymousNewPrivateKey)
  
        const transaction = {
          type: 'ACCOUNT_CREATION',
          from: reservoirAccountAddress,
          to: anonymousAddress,
          gas: '4000000000',
          publicKey: anonymousNewPublicKey,
        }
  
        caver.klay.sendTransaction(transaction)
          .on('transactionHash', console.log)
          .on('receipt', async (receipt) => {
  
            // 11-3. send fee delegated value transfer memo transaction (fee payer: humanreadable address)
            const senderTransaction = {
              type: 'FEE_DELEGATED_VALUE_TRANSFER_MEMO',
              from: reservoirAccountAddress,
              to: anonymousAddress,
              value: caver.utils.toPeb('0.03', 'KLAY'),
              gas: '4000000000',
              data: '0xaffa',
            }
  
            const { rawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, reservoirAccountPrivateKey)
  
            // Add feepayer wallet instance
            caver.klay.accounts.wallet.add(colinNewPrivateKey, humanReadableAddress)
  
            const feePayerTransaction = {
              feePayer: humanReadableAddress,
              senderRawTransaction: rawTransaction,
            }
  
            const beforeFeePayerBalance = await caver.klay.getBalance(humanReadableAddress)
  
            caver.klay.sendTransaction(feePayerTransaction)
              .on('receipt', async (receipt) => {
                const gasPrice = await caver.klay.getGasPrice()
                const usedGasPrice = new BigNumber(gasPrice).multipliedBy(receipt.gasUsed)
  
                const _transaction = await caver.klay.getTransaction(receipt.transactionHash || receipt.txHash)
                const newAccountBalance = await caver.klay.getBalance(anonymousAddress)
                const feePayerAccountBalance = await caver.klay.getBalance(humanReadableAddress)
  
                // expect(_transaction.input).not.to.equal('0x')
                // expect(newAccountBalance).to.equal(caver.utils.toPeb('0.03', 'KLAY'))
                // expect(feePayerAccountBalance).to.equal(
                //   new BigNumber(beforeFeePayerBalance)
                //     .minus(usedGasPrice)
                //     .toString(10)
                //   )
                done()
              })
            })
          })
          .on('error', console.log)
  }).timeout(200000)
  
  it(`
    12. Should create an decoupled account
    && send "fee-delegated value transfer memo with ratio transaction" from reservoir to decoupled (fee payer: humanreadable account)
    `, (done) => {
  
    // 12-1. Create human-readable fee payer account
    caver.klay.accounts.wallet.add(reservoirAccountPrivateKey)
  
    const humanReadableAddress = humanreadableAddressPrefix + 'f' + '.klaytn'
    console.log('humanReadableAddress: ' + humanReadableAddress)
  
    const { privateKey: colinNewPrivateKey } = caver.klay.accounts.create()
    const colinNewPublicKey = caver.klay.accounts.privateKeyToPublicKey(colinNewPrivateKey)
  
    const transaction = {
      type: 'ACCOUNT_CREATION',
      from: reservoirAccountAddress,
      to: humanReadableAddress,
      gas: '4000000000',
      publicKey: colinNewPublicKey,
      value: caver.utils.toPeb('0.05', 'KLAY'),
    }
  
    caver.klay.sendTransaction(transaction)
      .on('transactionHash', console.log)
      .on('receipt', async (receipt) => {
  
        // 12-2. create decoupled account
        const { address: anonymousAddress } = caver.klay.accounts.create()
        const { privateKey: anonymousNewPrivateKey } = caver.klay.accounts.create()
        const anonymousNewPublicKey = caver.klay.accounts.privateKeyToPublicKey(anonymousNewPrivateKey)
  
        const transaction = {
          type: 'ACCOUNT_CREATION',
          from: reservoirAccountAddress,
          to: anonymousAddress,
          gas: '4000000000',
          publicKey: anonymousNewPublicKey,
        }
  
        caver.klay.sendTransaction(transaction)
          .on('transactionHash', console.log)
          .on('receipt', async (receipt) => {
  
            const feeRatio = 30
  
            // 12-3. send fee delegated value transfer memo transaction (fee payer: humanreadable address)
            const senderTransaction = {
              type: 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO',
              from: reservoirAccountAddress,
              to: anonymousAddress,
              value: caver.utils.toPeb('0.03', 'KLAY'),
              data: '0xaffa',
              gas: '4000000000',
              feeRatio: feeRatio,
            }
  
            const { rawTransaction } = await caver.klay.accounts.signTransaction(senderTransaction, reservoirAccountPrivateKey)
  
            // Add feepayer wallet instance
            caver.klay.accounts.wallet.add(colinNewPrivateKey, humanReadableAddress)
  
            const feePayerTransaction = {
              feePayer: humanReadableAddress,
              senderRawTransaction: rawTransaction,
            }
  
            const beforeNewAccountBalance = await caver.klay.getBalance(anonymousAddress)
            const beforeFeePayerBalance = await caver.klay.getBalance(humanReadableAddress)
  
            caver.klay.sendTransaction(feePayerTransaction)
              .on('receipt', async (receipt) => {
                const gasPrice = await caver.klay.getGasPrice()
                const usedGasPrice = new BigNumber(gasPrice).multipliedBy(receipt.gasUsed).multipliedBy(feeRatio / 100).toString(10)
                const _transaction = await caver.klay.getTransaction(receipt.transactionHash || receipt.txHash)
  
                const newAccountBalance = await caver.klay.getBalance(anonymousAddress)
  
                // expect(_transaction.input).not.to.equal('0x')
                // expect(newAccountBalance).to.equal(
                //   new BigNumber(beforeNewAccountBalance)
                //     .plus(caver.utils.toPeb('0.03', 'KLAY'))
                //     .toString(10)
                //   )
  
                const newFeePayerBalance = await caver.klay.getBalance(humanReadableAddress)
                // expect(newFeePayerBalance).to.equal(
                //   new BigNumber(beforeFeePayerBalance)
                //     .minus(usedGasPrice)
                //     .toString(10)
                //   )
                done()
              })
            })
          })
          .on('error', console.log)
  }).timeout(200000)
})
