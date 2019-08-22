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

// Instruction
// $ git clone git@github.com:klaytn/klaytn-integration-tests.git test/klaytn-integration-tests
// $ cp test/klaytn-integration-tests/env.template.json test/klaytn-integration-tests/env.json
// $ mocha test/intTest.js
// 
// To execute a specific test,
// $ mocha --grep INT-LEGACY/012 test/intTest.js
require('it-each')({ testPerIteration: true })
const { expect } = require('./extendedChai')
var RLP = require("eth-lib/lib/rlp")
var Bytes = require("eth-lib/lib/bytes")
const assert = require('assert')
var Hash = require("eth-lib/lib/hash")

const BigNumber = require('bignumber.js')

const testEnv = require('./klaytn-integration-tests/env.json')
const Caver = require('../index.js')

var elliptic = require('elliptic')
var secp256k1 = new (elliptic.ec)('secp256k1')

const util = require('util')
const exec = util.promisify(require('child_process').exec)

const {overwriteSignature, getSenderTxHash} = require('../packages/caver-klay/caver-klay-accounts/src/makeRawTransaction')

var deployedContractAddr = {}

let caver

function makePublicKey(x, y) {
  const keyPair = secp256k1.keyPair({
    pub: {
      x: x.replace('0x', ''),
      y: y.replace('0x', '')
    },
    pubEnc: 'hex',
  })
  return '0x' + keyPair.getPublic(false, 'hex').slice(2)
}

function isJsonable(v) {
  try{
      return JSON.stringify(v) === JSON.stringify(JSON.parse(JSON.stringify(v)));
   } catch(e){
      /*console.error("not a dict",e);*/
      return false;
  }
}

function isDict(v) {
  return !!v && typeof v==='object' && v!==null && !(v instanceof Array) && !(v instanceof Date) && isJsonable(v);
}

function replaceWithEnv(data) {
  function replaceElemWithEnv(elem) {

    if (deployedContractAddr[elem] !== undefined)
      return deployedContractAddr[elem].address

    if (elem === undefined)
      return elem
    if ( elem === "env.sender" )
      return testEnv.sender.address
    if (typeof elem !== "string")
      return elem
    if (elem === "blockHash") {
      if (testEnv.blockHash === '' && testEnv.receipt !== {}) {
        return testEnv.receipt.blockHash
      }
      return testEnv.blockHash
    }
    if (elem === "filterId") return testEnv.filterId
    if (elem === "senderTxHash") return testEnv.receipt.senderTxHash
    if (elem === "transactionIndex") return caver.utils.toHex(testEnv.receipt.transactionIndex)
    if (elem === "blockNumber") return caver.utils.toHex(testEnv.receipt.blockNumber)
    if (elem === "transactionHash") return testEnv.receipt.transactionHash
    if (elem === "rawTransaction") return testEnv.rawTransaction
      
    const getRandomAccount = (id) => {
      if (testEnv.random == undefined) 
        testEnv.random = {}
      if (testEnv.random[id] == undefined) {
        acc = caver.klay.accounts.create()
        caver.klay.accounts.wallet.add(acc.privateKey)
        testEnv.random[id] = acc
      }
      return testEnv.random[id]
    }

    if (elem.endsWith(".privateKey")) {
      return getRandomAccount(elem.replace(".privateKey", "")).privateKey
    }
    if (elem.startsWith("random")) {
      return getRandomAccount(elem).address
    }

    if (elem.startsWith("contract")) {
      return testEnv.contracts[elem]
    }

    if (elem.startsWith("env.accounts")) {
      k = elem.replace("env.accounts.","")
      return testEnv.accounts[k].address
    }

    return elem
  }


  if (isDict(data)) {
    for(var k in data) {
      data[k] = replaceWithEnv(data[k])
    }
    return data;
  }

  if (Array.isArray(data)) {
    data.forEach(function(p, idx) {
      data[idx] = replaceElemWithEnv(replaceWithEnv(p))
    })
    return data 
  }

  return replaceElemWithEnv(data)
}

function resetRandomAccounts() {
  testEnv.random = {}
  testEnv.contracts = {}
  testEnv.blockHash = ''
  testEnv.receipt = {}
  testEnv.rawTransaction = ''
  testEnv.filterId = ''
}

function makeMultisigKey(multisig) {
  ret = {
    threshold: multisig.threshold,
    keys: []
  }
  if (Array.isArray(multisig.keys)) {
    multisig.keys.forEach(function(k) {
      ret.keys.push({
        weight: k.weight,
        publicKey: makePublicKey(k.key.x, k.key.y)
      })
    })
  }

  return ret
}

function makeKey(key) {
  ret = {}
  switch(key.keyType) {
    case 0:
      // Nil key. DO NOTHING.
      break;

    case 1:
      ret.legacyKey = true
      break;

    case 2:
      ret.publicKey = makePublicKey(key.key.x, key.key.y)
      break;

    case 3:
      ret.failKey = true
      break;
    
    case 4:
      ret = {multisig: makeMultisigKey(key.key)}
      break;

    case 5:
      if (key.key.length > 0) {
        ret = Object.assign(ret, {roleTransactionKey: makeKey(key.key[0])})
      }
      if (key.key.length > 1) {
        ret = Object.assign(ret, {roleAccountUpdateKey: makeKey(key.key[1])})
      }
      if (key.key.length > 2) {
        ret = Object.assign(ret, {roleFeePayerKey: makeKey(key.key[2])})
      }
      break;

    default:
      throw new Error(`not implemented keytype ${key.keyType}`)
  }

  return ret
}

function processAccountKey(tx) {
  if(tx.accountKey === undefined)
    return tx
  
  k = makeKey(tx.accountKey)

  tx = Object.assign(tx, k)

  return tx
}

async function processCall(t) {
  contractAddr = deployedContractAddr[t.call.to].address
  abi = deployedContractAddr[t.call.to].abi
  contract = new caver.klay.Contract(abi, contractAddr)

  from = replaceWithEnv(t.call.from)
  params = replaceWithEnv(t.call.params)

  value = await contract.methods[t.call.method](...params).call({from:from})
  expect(value).to.equal(replaceWithEnv(t.expected.returns))
}

async function processSend(t) {
  contractAddr = deployedContractAddr[t.send.to].address
  abi = deployedContractAddr[t.send.to].abi
  contract = new caver.klay.Contract(abi, contractAddr)

  from = replaceWithEnv(t.send.from)
  params = replaceWithEnv(t.send.params)

  var actual = true
  var receipt = undefined

  try {
    receipt = await contract.methods[t.send.method](...params).send({from:from, gas:t.send.gas})
  } catch(err) {
      // console.log(err)
      receiptRaw = String(err).slice(String(err).indexOf("\n"))
      try {
        receipt = JSON.parse(receiptRaw)
      } catch(err) {
        actual = false
        receipt = undefined
      }
  }
  expect(actual).to.equal(t.expected.status)

  // console.log(receipt)
  if(t.expected.receipt) {
    expect(receipt).to.not.undefined
    if(t.expected.receipt.status)
      expect(receipt.status).to.equal(t.expected.receipt.status)
    if(t.expected.receipt.txError)
      expect(receipt.txError).to.equal(t.expected.receipt.txError)
  }

  if(t.expected.rawEvents) {
    for(var idx in t.expected.rawEvents) {
      expect(receipt.events[idx].raw.topics).to.deep.equal(t.expected.rawEvents[idx].topics)
      if(t.expected.rawEvents[idx].data.encodeParameters) {
        params = replaceWithEnv(t.expected.rawEvents[idx].data.encodeParameters)
        data = caver.klay.abi.encodeParameters(...params)
        expect(receipt.events[idx].raw.data).to.equal(data)
      }
    }
  }

  if (t.expected.events) {
    for(var e in t.expected.events) {
      expect(receipt.events[e]).to.not.undefined
      for(var k in t.expected.events[e]) {
        expected = t.expected.events[e][k]
        expected = replaceWithEnv(expected)
        if(typeof receipt.events[e].returnValues[k] === "string") {
          expect(String(receipt.events[e].returnValues[k]).toLowerCase()).to.equal(expected.toLowerCase())
        } else {
          expect(receipt.events[e].returnValues[k]).to.equal(expected)
        }
      }
    }
  }
}

const getSignedRawTransaction = async (t) => {
  if (t.rawTx !== undefined) {
    return t.rawTx
  } 

  var feePayer = t.tx.feePayer
  delete t.tx.feePayer

  t.tx.from = replaceWithEnv(t.tx.from)
  if (t.tx.from === undefined) {
    t.tx.from = testEnv.sender.address
  }
  t.tx.to = replaceWithEnv(t.tx.to)
  t.tx.privateKey = replaceWithEnv(t.tx.privateKey)
  privateKey = testEnv.sender.privateKey
  if (t.tx.privateKey !== undefined) {
    privateKey = t.tx.privateKey
  }
  t.tx = processAccountKey(t.tx)

  const signedRawTx = await caver.klay.accounts.signTransaction(t.tx, privateKey)
  rawTransaction = signedRawTx.rawTransaction

  if (t.tx.v !== undefined || t.tx.r !== undefined || t.tx.s !== undefined) {
    const txObj = await caver.klay.decodeTransaction(rawTransaction, t.tx.type)
    if (t.tx.v !== undefined) { txObj.v = t.tx.v }
    if (t.tx.r !== undefined) { txObj.r = t.tx.r }
    if (t.tx.s !== undefined) { txObj.s = t.tx.s }
    rawTransaction = overwriteSignature(rawTransaction, txObj, [txObj.v, txObj.r, txObj.s])
  }

  // if transaction is fee delegated, sign with feePayer
  if (t.tx.type.includes('FEE_DELEGATED_')) {
    feePayer = replaceWithEnv(feePayer)
    if (feePayer === undefined) {
      feePayer = testEnv.feePayer.address
    }

    t.tx.feePayerPrivateKey = replaceWithEnv(t.tx.feePayerPrivateKey)
    feePayerPrivateKey = testEnv.feePayer.privateKey
    if (t.tx.feePayerPrivateKey !== undefined) {
      feePayerPrivateKey = t.tx.feePayerPrivateKey
    }

    const feePayerTx = {
      feePayer,
      senderRawTransaction: rawTransaction,
    }

    const signedFeePayerRawTx = await caver.klay.accounts.signTransaction(feePayerTx, feePayerPrivateKey)
    rawTransaction = signedFeePayerRawTx.rawTransaction

    // If v or r or s value is set in test case, overwrite with that.
    if (t.tx.payerV !== undefined || t.tx.payerR !== undefined || t.tx.payerS !== undefined) {
      const txObj = await caver.klay.decodeTransaction(rawTransaction, t.tx.type)
      if (t.tx.payerV !== undefined) { txObj.payerV = t.tx.payerV }
      if (t.tx.payerR !== undefined) { txObj.payerR = t.tx.payerR }
      if (t.tx.payerS !== undefined) { txObj.payerS = t.tx.payerS }
      rawTransaction = overwriteSignature(rawTransaction, txObj, undefined, [t.tx.payerV, t.tx.payerR, t.tx.payerS])
    }
  }

  return rawTransaction
}

async function processTransaction(t) {
  const rawTransaction = await getSignedRawTransaction(t)

  var actual = undefined
  var receipt = undefined

  await caver.klay.sendSignedTransaction(rawTransaction)
    .then((r) => {
      receipt = r
      // console.log(r)
      if (t.expected.receipt) {
        if (t.expected.receipt.checkContractAddress) {
          addrHash = caver.utils.keccak256(
            RLP.encode([
              t.tx.from.toLowerCase(),
              Bytes.fromNat(t.tx.nonce)]
            )
          )
          address = caver.utils.toChecksumAddress("0x" + addrHash.slice(-40));
          expect(r.contractAddress).to.equal(address)
        }
        
        if (t.expected.receipt.codeFormat) expect(r.codeFormat).to.equal(t.expected.receipt.codeFormat)
        
        if (t.expected.receipt.checkSenderTxHash) {
          expect(r.senderTxHash).to.equal(getSenderTxHash(rawTransaction))
        }
      }
      actual = true
    }, (err) => {
      // console.log(err)
      receiptRaw = String(err).slice(String(err).indexOf("\n"))
      actual = true 
      try {
        receipt = JSON.parse(receiptRaw)
      } catch(err) {
        receipt = undefined
        actual = false
      }
      if (t.expected.errorString !== undefined) {
        expect(String(err)).to.include(t.expected.errorString)
      }
    })

  if (receipt !== undefined) {
    if (t.deployedAddress && receipt.contractAddress) {
      testEnv.contracts[t.deployedAddress] = receipt.contractAddress
    }
    if (t.expected.receipt && t.expected.receipt.status) {
      expect(receipt.status).to.equal(t.expected.receipt.status)
    }
    if (t.expected.receipt && t.expected.receipt.txError) {
      expect(receipt.txError).to.equal(t.expected.receipt.txError)
    }
  }

  expect(actual).to.equal(t.expected.status)
}

async function processApi(t) {
  if (t.api.pre !== undefined) {
    const rawTransaction = await getSignedRawTransaction(t.api.pre)
    testEnv.receipt = await caver.klay.sendSignedTransaction(rawTransaction)
  }
  if (t.api.preSigned !== undefined) {
    testEnv.rawTransaction = await getSignedRawTransaction(t.api.preSigned)
  }
  await new Promise((resolve, reject)=>{
    caver.klay._requestManager.send({
      method: t.api.method,
      params: replaceWithEnv(t.api.params)
    }, (err, result) => {
      if (err)
        reject(err)
      else
        resolve(result)
    })
  }).then((result)=>{
    expect(result).not.to.null

    if (t.api.method === 'klay_newFilter' || t.api.method === 'klay_newBlockFilter' || t.api.method === 'klay_newPendingTransactionFilter') {
      testEnv.filterId = result
    }
    if (t.api.method === 'klay_getBlockByNumber') testEnv.blockHash = result.hash

    if (t.expected) {
      if(t.expected.accType === 2) {
        expect(result.accType).to.be.deep.equal(t.expected.accType)
      } else {
        expect(result).to.be.deep.equal(t.expected)  
      }
    }
  }, (err) => { 
    if (t.errorString) {
      expect(String(err)).to.include(t.errorString)
    } else {
      expect(err).to.be.null
    }
  })
}

before(() => {
  caver = new Caver(testEnv.URL)
  caver.klay.accounts.wallet.add(testEnv.sender.privateKey)
  if(testEnv.accounts) {
    for(var acc in testEnv.accounts) {
      caver.klay.accounts.wallet.add(testEnv.accounts[acc].privateKey)
    }
  }
})

it('solc check', async()=>{
    const {stdout, stderr} = await exec("solc --version")
    var regex = /Version: ([0-9]+.[0-9]+.[0-9]+)/;
    found = stdout.match(regex)
    expect(found).to.not.null

    version = found[1]
    expect(version).to.equal("0.5.0")
})

describe('Integration tests', () => {
  const path = require('path')
  const fs = require('fs')
  const directoryPath = path.join(__dirname, "klaytn-integration-tests")
  var intFiles = fs.readdirSync(directoryPath, {withFileTypes:true})
  intFiles.forEach(function(intf) {
    if(intf.isDirectory() == false)
      return
    describe(`testing ${intf.name}`, () => {
      const directoryPath = path.join(__dirname, "klaytn-integration-tests/", intf.name)
      var files = fs.readdirSync(directoryPath)
      files.forEach(function(file){
        if(file.endsWith(".json") == false) return

        filename = path.join(directoryPath, file)
        describe('fileName: ' + filename, () => {
          var tc = JSON.parse(fs.readFileSync(filename))
          if (tc.skipJs) {
            console.log(`Skip ${tc.tcID} / ${tc.tcName}`)
            return
          }

          it('Resetting random accounts', ()=>{
            resetRandomAccounts()
          })

          it('make abi and bin', async() => {
            for( var k in tc.deploy ) {
              const {stdout,stderr} = await exec('solc --abi --bin --allow-paths . '+ path.join(directoryPath, tc.deploy[k].file))
              var regex = `\n======= .*${tc.deploy[k].file}:${k} =======\nBinary: \n(.*)\nContract JSON ABI \n(.*)`
              found = stdout.match(regex)
              expect(found).to.not.null

              bin = found[1]
              abi = JSON.parse(found[2])

              fromAddress = testEnv.sender.address
              gas = 100000000

              params = replaceWithEnv(tc.deploy[k].constructorParams)
              contractInstance = new caver.klay.Contract(abi)
              const newContractInstance = await contractInstance.deploy({
                data: '0x' + bin,
                arguments: params,
              }).send({
                from: fromAddress,
                gas: gas,
                value:0,
              })

              expect(newContractInstance).to.not.null
              deployedContractAddr[k] = {"address":newContractInstance.options.address, "abi": abi}
            }
          }).timeout(10000)

          tc.test.forEach(function(t, idx) {
            it('testName:' + tc.tcName +'['+idx+']', async () => {

              try {
                if (t.api !== undefined) {
                  await processApi(t)
                } else if (t.tx !== undefined || t.rawTx !== undefined) {
                  await processTransaction(t)
                } else if (t.call !== undefined) {
                  await processCall(t)
                } else if (t.send !== undefined) {
                  await processSend(t)
                }
              } catch (err) {
                if (String(err).includes('AssertionError: expected')) throw err
                
                if (t.expected.status != false) {
                  console.log(err)
                }
                expect(t.expected.status).to.be.false
                if (t.expected) {
                  if (t.expected.errorStringJs)
                    expect(String(err)).to.include(t.expected.errorStringJs)
                  else if (t.expected.errorString)
                    expect(String(err)).to.include(t.expected.errorString)
                } else {
                  console.log("catched err", err)
                  assert(false)
                }
              }

            }).timeout(50000)
          })
        })
      })
    })
  })
})
