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

var RLP = require("eth-lib/lib/rlp")
var utils = require('../../../caver-utils')

var Hash = require("eth-lib/lib/hash")

const { 
  rlpEncodeForLegacyTransaction,
  rlpEncodeForValueTransfer, 
  rlpEncodeForValueTransferMemo,
  rlpEncodeForFeeDelegatedValueTransferMemoWithRatio,
  rlpEncodeForFeeDelegatedValueTransfer,
  rlpEncodeForFeeDelegatedValueTransferWithRatio,
  rlpEncodeForFeeDelegatedValueTransferMemo,
  rlpEncodeForAccountUpdate,
  rlpEncodeForContractDeploy,
  rlpEncodeForContractExecution,
  rlpEncodeForFeeDelegatedAccountUpdate,
  rlpEncodeForFeeDelegatedAccountUpdateWithRatio,
  rlpEncodeForFeeDelegatedSmartContractDeploy,
  rlpEncodeForFeeDelegatedSmartContractDeployWithRatio,
  rlpEncodeForFeeDelegatedSmartContractExecution,
  rlpEncodeForFeeDelegatedSmartContractExecutionWithRatio,
  
  rlpEncodeForCancel,
  rlpEncodeForFeeDelegatedCancel,
  rlpEncodeForFeeDelegatedCancelWithRatio,
  rlpEncodeForChainDataAnchoring,

  parseAccountKey,
} = require('./transactionType')

const creationNotSupportError = "ACCOUNT_CREATION transaction type is not supported yet."

function encodeRLPByTxType(transaction) {
  transaction.type = transaction.senderRawTransaction
    ? utils.getTxTypeStringFromRawTransaction(transaction.senderRawTransaction)
    : transaction.type
  
  
  switch (transaction.type) {
    case 'ACCOUNT_CREATION':
      throw new Error(creationNotSupportError)
    case 'ACCOUNT_UPDATE':
      return rlpEncodeForAccountUpdate(transaction)
    case 'FEE_DELEGATED_ACCOUNT_UPDATE':
      return rlpEncodeForFeeDelegatedAccountUpdate(transaction)
    case 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO':
      return rlpEncodeForFeeDelegatedAccountUpdateWithRatio(transaction)
    case 'VALUE_TRANSFER':
      return rlpEncodeForValueTransfer(transaction)
    case 'VALUE_TRANSFER_MEMO':
      return rlpEncodeForValueTransferMemo(transaction)
    case 'FEE_DELEGATED_VALUE_TRANSFER':
      return rlpEncodeForFeeDelegatedValueTransfer(transaction)
    case 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO':
      return rlpEncodeForFeeDelegatedValueTransferWithRatio(transaction)
    case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO':
      return rlpEncodeForFeeDelegatedValueTransferMemo(transaction)
    case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO':
      return rlpEncodeForFeeDelegatedValueTransferMemoWithRatio(transaction)
    case 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY':
      return rlpEncodeForFeeDelegatedSmartContractDeploy(transaction)
    case 'SMART_CONTRACT_DEPLOY':
      return rlpEncodeForContractDeploy(transaction)
    case 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO':
      return rlpEncodeForFeeDelegatedSmartContractDeployWithRatio(transaction)
    case 'SMART_CONTRACT_EXECUTION':
      return rlpEncodeForContractExecution(transaction)
    case 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION':
      return rlpEncodeForFeeDelegatedSmartContractExecution(transaction)
    case 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO':
      return rlpEncodeForFeeDelegatedSmartContractExecutionWithRatio(transaction)
    case 'CANCEL':
      return rlpEncodeForCancel(transaction)
    case 'FEE_DELEGATED_CANCEL':
      return rlpEncodeForFeeDelegatedCancel(transaction)
    case 'FEE_DELEGATED_CANCEL_WITH_RATIO':
      return rlpEncodeForFeeDelegatedCancelWithRatio(transaction)
    case 'CHAIN_DATA_ANCHROING':
      return rlpEncodeForChainDataAnchoring(transaction)
    case 'LEGACY':
    default:
      return rlpEncodeForLegacyTransaction(transaction)
  }
}

// case1) sig === [v, r, s]
// case2) sig ===
function makeRawTransaction(rlpEncoded, sig, transaction) {
  const decodedValues = RLP.decode(rlpEncoded)
  let rawTx
  
  transaction.type = transaction.senderRawTransaction
    ? utils.getTxTypeStringFromRawTransaction(transaction.senderRawTransaction)
    : transaction.type
  
  switch (transaction.type) {
    case 'ACCOUNT_CREATION':
      throw new Error(creationNotSupportError)
    case 'VALUE_TRANSFER':
    case 'VALUE_TRANSFER_MEMO':
    case 'ACCOUNT_UPDATE':
    case 'SMART_CONTRACT_DEPLOY':
    case 'SMART_CONTRACT_EXECUTION':
    case 'CANCEL':
    case 'CHAIN_DATA_ANCHROING': 
      return _combineSenderRawTransaction(rlpEncoded, sig)
    case 'FEE_DELEGATED_VALUE_TRANSFER': 
    case 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO': 
    case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO': 
    case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO': 
    case 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY': 
    case 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO': 
    case 'FEE_DELEGATED_CANCEL': 
    case 'FEE_DELEGATED_CANCEL_WITH_RATIO': 
    case 'FEE_DELEGATED_ACCOUNT_UPDATE': 
    case 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO': 
    case 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION':
    case 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO': 
    case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO': {
      if (transaction.senderRawTransaction) {
        const decoded = decodeFromRawTransaction(transaction.senderRawTransaction)
        return _combineFeePayerRawTransaction(rlpEncoded, sig, transaction, [decoded.v, decoded.r, decoded.s])
      }
      return _combineSenderRawTransaction(rlpEncoded, sig)
    }
    case 'LEGACY':
    default:
      rawTx = decodedValues.slice(0, 6).concat(sig)
      return RLP.encode(rawTx)
  }
}

function _combineSenderRawTransaction(rlpEncoded, sig) {
  const decodedValues = RLP.decode(rlpEncoded)
  
  let [data] = decodedValues
  let [txType, ...rawTx] = RLP.decode(data)

  rawTx = [...rawTx, [sig]]

  // set default feepayer's information in rawTx
  const typeString = utils.getTxTypeStringFromRawTransaction(txType)
  if (typeString !== undefined && typeString.includes('FEE_DELEGATED')) rawTx = [...rawTx, '0x', [['0x01', '0x', '0x']]]
  
  return txType + RLP.encode(rawTx).slice(2)
}

function _combineFeePayerRawTransaction(rlpEncoded, sig, transaction, [senderV, senderR, senderS]) {
  const decodedValues = RLP.decode(rlpEncoded)
  
  let [data] = decodedValues
  let [txType, ...rawTx] = RLP.decode(data)
  
  rawTx = [...rawTx, [[senderV, senderR, senderS]], transaction.feePayer.toLowerCase(), [sig]]

  return txType + RLP.encode(rawTx).slice(2)
}

function decodeFromRawTransaction (rawTransaction, type) {
  var typeString = type
  if (typeString === undefined || typeString !== 'LEGACY') {
    typeString = utils.getTxTypeStringFromRawTransaction(rawTransaction)
    if (typeString === undefined) {
      typeString = 'LEGACY'
    } else {
      rawTransaction = '0x' + rawTransaction.slice(4)
    }
  }
  
  switch(typeString) {
    case 'LEGACY': {
      const [ nonce, gasPrice, gas, to, value, data, v, r, s ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, to, value, data, v, r, s }
    }
    case 'VALUE_TRANSFER': {
      const [ nonce, gasPrice, gas, to, value, from, [ [ v, r, s ] ] ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, to, value, from, v, r, s }
    }
    case 'FEE_DELEGATED_VALUE_TRANSFER': {
      const [ nonce, gasPrice, gas, to, value, from, [ [ v, r, s ] ], feePayer, [ [ payerV, payerR, payerS ] ] ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, to, value, from, v, r, s, feePayer, payerV, payerR, payerS }
    }
    case 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO': {
      const [ nonce, gasPrice, gas, to, value, from, feeRatio, [ [ v, r, s ] ], feePayer, [ [ payerV, payerR, payerS ] ] ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, to, value, from, feeRatio, v, r, s, feePayer, payerV, payerR, payerS }
    }
    case 'VALUE_TRANSFER_MEMO': {
      const [ nonce, gasPrice, gas, to, value, from, data, [ [ v, r, s ] ] ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, to, value, from, data, v, r, s }
    }
    case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO': {
      const [ nonce, gasPrice, gas, to, value, from, data, [ [ v, r, s ] ], feePayer, [ [ payerV, payerR, payerS ] ] ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, to, value, from, data, v, r, s, feePayer, payerV, payerR, payerS }
    }
    case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO':  {
      const [ nonce, gasPrice, gas, to, value, from, data, feeRatio, [ [ v, r, s ] ], feePayer, [ [ payerV, payerR, payerS ] ] ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, to, value, from, data, feeRatio, v, r, s, feePayer, payerV, payerR, payerS }
    }
    case 'ACCOUNT_CREATION': {
      throw new Error(creationNotSupportError)
    }
    case 'ACCOUNT_UPDATE': {
      const [ nonce, gasPrice, gas, from, accountKey, [ [ v, r, s ] ] ] = RLP.decode(rawTransaction)
      return parseAccountKey({ type: typeString, nonce, gasPrice, gas, from, accountKey, v, r, s })
    }
    case 'FEE_DELEGATED_ACCOUNT_UPDATE': {
      const [ nonce, gasPrice, gas, from, accountKey, [ [ v, r, s ] ], feePayer, [ [ payerV, payerR, payerS ] ] ] = RLP.decode(rawTransaction)
      return parseAccountKey({ type: typeString, nonce, gasPrice, gas, from, accountKey, v, r, s, feePayer, payerV, payerR, payerS })
    }
    case 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO': {
      const [ nonce, gasPrice, gas, from, accountKey, feeRatio, [ [ v, r, s ] ], feePayer, [ [ payerV, payerR, payerS ] ] ] = RLP.decode(rawTransaction)
      return parseAccountKey({ type: typeString, nonce, gasPrice, gas, from, accountKey, feeRatio, v, r, s, feePayer, payerV, payerR, payerS })
    }
    case 'SMART_CONTRACT_DEPLOY': {
      const [ nonce, gasPrice, gas, to, value, from, data, humanReadable, codeFormat, [ [ v, r, s ] ] ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, to, value, from, data, humanReadable: humanReadable === '0x01'? true: false, codeFormat, v, r, s }
    }
    case 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY': {
      const [ nonce, gasPrice, gas, to, value, from, data, humanReadable, codeFormat, [ [ v, r, s ] ], feePayer, [ [ payerV, payerR, payerS ] ] ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, to, value, from, data, humanReadable: humanReadable === '0x01'? true: false, codeFormat, v, r, s, feePayer, payerV, payerR, payerS }
    }
    case 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO': {
      const [ nonce, gasPrice, gas, to, value, from, data, humanReadable, feeRatio, codeFormat, [ [ v, r, s ] ], feePayer, [ [ payerV, payerR, payerS ] ] ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, to, value, from, data, humanReadable: humanReadable === '0x01'? true: false, feeRatio, codeFormat, v, r, s, feePayer, payerV, payerR, payerS }
    }
    case 'SMART_CONTRACT_EXECUTION': {
      const [ nonce, gasPrice, gas, to, value, from, data, [ [ v, r, s ] ] ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, to, value, from, data, v, r, s }
    }
    case 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION': {
      const [ nonce, gasPrice, gas, to, value, from, data, [ [ v, r, s ] ], feePayer, [ [ payerV, payerR, payerS ] ] ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, to, value, from, data, v, r, s, feePayer, payerV, payerR, payerS }
    }
    case 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO': {
      const [ nonce, gasPrice, gas, to, value, from, data, feeRatio, [ [ v, r, s ] ], feePayer, [ [ payerV, payerR, payerS ] ] ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, to, value, from, data, feeRatio, v, r, s, feePayer, payerV, payerR, payerS }
    }
    case 'CANCEL': {
      const [ nonce, gasPrice, gas, from, [ [ v, r, s ] ] ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, from, v, r, s }
    }
    case 'FEE_DELEGATED_CANCEL': {
      const [ nonce, gasPrice, gas, from, [ [ v, r, s ] ], feePayer, [ [ payerV, payerR, payerS ] ] ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, from, v, r, s, feePayer, payerV, payerR, payerS }
    }
    case 'FEE_DELEGATED_CANCEL_WITH_RATIO': {
      const [ nonce, gasPrice, gas, from, feeRatio, [ [ v, r, s ] ], feePayer, [ [ payerV, payerR, payerS ] ] ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, from, feeRatio, v, r, s, feePayer, payerV, payerR, payerS }
    }
    case 'CHAIN_DATA_ANCHROING': {
      const [ nonce, gasPrice, gas, to, value, from, data, [ [ v, r, s ] ] ] = RLP.decode(rawTransaction)
      return { type: typeString, nonce, gasPrice, gas, to, value, from, anchoredData:data, v, r, s }
    }
  }
}

function overwriteSignature(rawTransaction, txObj, signature, feePayerSignature) {
  if (signature === undefined) {
    signature = [txObj.v, txObj.r, txObj.s]
  }
  if (txObj.type.includes('FEE_DELEGATED') && feePayerSignature === undefined) {
    feePayerSignature = [txObj.payerV, txObj.payerR, txObj.payerS]
  }

  if (txObj.type === 'LEGACY') {
    var data = RLP.decode(rawTransaction)
    data = data.slice(0, 6).concat(signature)
    return RLP.encode(data)
  }

  var type = rawTransaction.slice(0, 4)
  const typeDetached = '0x' + rawTransaction.slice(4)
  
  var data = RLP.decode(typeDetached)
  if (txObj.type.includes('FEE_DELEGATED')) {
    data[data.length-3] = [signature]
    data[data.length-1] = [feePayerSignature]
  } else {
    data[data.length-1] = [signature]
  }
  
  return type + RLP.encode(data).slice(2)
}

function getSenderTxHash(rawTransaction) {
  const typeString = utils.getTxTypeStringFromRawTransaction(rawTransaction)
  if (typeString === undefined || !typeString.includes('FEE_DELEGATED')) return Hash.keccak256(rawTransaction)

  var type = rawTransaction.slice(0, 4)
  const typeDetached = '0x' + rawTransaction.slice(4)

  var data = RLP.decode(typeDetached)

  return Hash.keccak256(type + RLP.encode(data.slice(0, data.length - 2)).slice(2))
}

module.exports = {
  encodeRLPByTxType,
  makeRawTransaction,
  decodeFromRawTransaction,
  overwriteSignature,
  getSenderTxHash,
}