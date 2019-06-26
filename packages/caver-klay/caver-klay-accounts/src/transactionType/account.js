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
var Bytes = require("eth-lib/lib/bytes")
var utils = require('../../../../caver-utils')
var helpers = require('../../../../caver-core-helpers')
const {
  ACCOUNT_UPDATE_TYPE_TAG,

  ACCOUNT_KEY_NIL_TAG,
  ACCOUNT_KEY_LEGACY_TAG,
  ACCOUNT_KEY_PUBLIC_TAG,
  ACCOUNT_KEY_FAIL_TAG,
  ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG,
  ACCOUNT_KEY_ROLE_BASED_TAG,

  FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO_TYPE_TAG,
  FEE_DELEGATED_ACCOUNT_UPDATE_TYPE_TAG,
  FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO_TYPE_TAG,
} = helpers.constants

function rlpEncodeForAccountUpdate(transaction) {
  let accountKey = resolveRawKeyToAccountKey(transaction)

  return RLP.encode([
      RLP.encode([
        ACCOUNT_UPDATE_TYPE_TAG,
        Bytes.fromNat(transaction.nonce),
        Bytes.fromNat(transaction.gasPrice),
        Bytes.fromNat(transaction.gas),
        transaction.from.toLowerCase(),
        accountKey,
      ]),
      Bytes.fromNat(transaction.chainId || "0x1"),
      "0x",
      "0x",
    ])
}

function rlpEncodeForFeeDelegatedAccountUpdate(transaction) {
  
  if (transaction.feePayer) {
    const typeDetacehdRawTransaction = '0x' + transaction.senderRawTransaction.slice(4)

    const [ nonce, gasPrice, gas, from, accountKey, [ [ v, r, s ] ] ] = utils.rlpDecode(typeDetacehdRawTransaction)

    return RLP.encode([
      RLP.encode([
        FEE_DELEGATED_ACCOUNT_UPDATE_TYPE_TAG,
        Bytes.fromNat(nonce),
        Bytes.fromNat(gasPrice),
        Bytes.fromNat(gas),
        from.toLowerCase(),
        accountKey,
      ]),
      transaction.feePayer.toLowerCase(),
      Bytes.fromNat(transaction.chainId || "0x1"),
      "0x",
      "0x"
    ])
    
  } else {
    let accountKey = resolveRawKeyToAccountKey(transaction)

    return RLP.encode([
        RLP.encode([
          FEE_DELEGATED_ACCOUNT_UPDATE_TYPE_TAG,
          Bytes.fromNat(transaction.nonce),
          Bytes.fromNat(transaction.gasPrice),
          Bytes.fromNat(transaction.gas),
          transaction.from.toLowerCase(),
          accountKey,
        ]),
        Bytes.fromNat(transaction.chainId || "0x1"),
        "0x",
        "0x",
      ])
  }
}

function rlpEncodeForFeeDelegatedAccountUpdateWithRatio(transaction) {
  
  if (transaction.feePayer) {
    const typeDetacehdRawTransaction = '0x' + transaction.senderRawTransaction.slice(4)

    const [ nonce, gasPrice, gas, from, accountKey, feeRatio, [ [ v, r, s ] ] ] = utils.rlpDecode(typeDetacehdRawTransaction)

    return RLP.encode([
      RLP.encode([
        FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO_TYPE_TAG,
        Bytes.fromNat(nonce),
        Bytes.fromNat(gasPrice),
        Bytes.fromNat(gas),
        from.toLowerCase(),
        accountKey,
        Bytes.fromNat(feeRatio),
      ]),
      transaction.feePayer.toLowerCase(),
      Bytes.fromNat(transaction.chainId || "0x1"),
      "0x",
      "0x"
    ])
    
  } else {
    let accountKey = resolveRawKeyToAccountKey(transaction)

    return RLP.encode([
        RLP.encode([
          FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO_TYPE_TAG,
          Bytes.fromNat(transaction.nonce),
          Bytes.fromNat(transaction.gasPrice),
          Bytes.fromNat(transaction.gas),
          transaction.from.toLowerCase(),
          accountKey,
          Bytes.fromNat(transaction.feeRatio),
        ]),
        Bytes.fromNat(transaction.chainId || "0x1"),
        "0x",
        "0x",
      ])
  }
}

function resolveRawKeyToAccountKey(transaction) {
  if (!!transaction.legacyKey) return ACCOUNT_KEY_LEGACY_TAG
  if (!!transaction.failKey) return ACCOUNT_KEY_FAIL_TAG
  
  if (transaction.multisig) {
    const { threshold, keys } = transaction.multisig
    
    const encodedMultisigPublicKeys = keys.map(({ weight, publicKey }) => {
      if (!weight) throw new Error('weight should be specified for multisig account')
      if (!publicKey) throw new Error('publicKey should be specified for multisig account')

      const compressedPublicKey = utils.compressPublicKey(publicKey)
        
      return [Bytes.fromNat(utils.numberToHex(weight)), compressedPublicKey]
    })
    
    return ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG + RLP.encode([
      Bytes.fromNat(utils.numberToHex(threshold)),
      encodedMultisigPublicKeys,
    ]).slice(2)
  }
  
  if (transaction.publicKey) {
    
    const compressedPublicKey = utils.compressPublicKey(transaction.publicKey)

    return ACCOUNT_KEY_PUBLIC_TAG + RLP.encode(compressedPublicKey).slice(2)
  }
  
  if (transaction.roleTransactionKey || transaction.roleAccountUpdateKey || transaction.roleFeePayerKey) {
    transaction.roleTransactionKey = transaction.roleTransactionKey
      ? resolveRawKeyToAccountKey(transaction.roleTransactionKey) 
      : ACCOUNT_KEY_NIL_TAG
    transaction.roleAccountUpdateKey = transaction.roleAccountUpdateKey 
      ? resolveRawKeyToAccountKey(transaction.roleAccountUpdateKey)
      : ACCOUNT_KEY_NIL_TAG
    transaction.roleFeePayerKey = transaction.roleFeePayerKey 
      ? resolveRawKeyToAccountKey(transaction.roleFeePayerKey) 
      : ACCOUNT_KEY_NIL_TAG
    
    var keys = [transaction.roleTransactionKey, transaction.roleAccountUpdateKey, transaction.roleFeePayerKey]
    return ACCOUNT_KEY_ROLE_BASED_TAG + RLP.encode(keys).slice(2)
  }
  
  return ACCOUNT_KEY_NIL_TAG
}

function parseAccountKey (transaction) {
  const key = transaction.accountKey
  delete transaction.accountKey

  if (key.startsWith(ACCOUNT_KEY_LEGACY_TAG)) {
    transaction.legacyKey = true
  } else if (key.startsWith(ACCOUNT_KEY_FAIL_TAG)) {
    transaction.failKey = true
  } else if (key.startsWith(ACCOUNT_KEY_PUBLIC_TAG)) {
    transaction.publicKey = RLP.decode('0x' + key.slice(ACCOUNT_KEY_PUBLIC_TAG.length))
  } else if (key.startsWith(ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG)) {
    var [threshold, keys] = RLP.decode('0x' + key.slice(ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG.length))
    keys = keys.map((key) => {return {weight: utils.hexToNumber(key[0]), publicKey: key[1]}})
    transaction.multisig = {threshold: utils.hexToNumber(threshold), keys}
  } else if (key.startsWith(ACCOUNT_KEY_ROLE_BASED_TAG)) {
    var keys = RLP.decode('0x' + key.slice(ACCOUNT_KEY_ROLE_BASED_TAG.length))
    keys.map((key)=>{if (key.startsWith(ACCOUNT_KEY_ROLE_BASED_TAG)) throw new Error('Nested role based key.')})

    if (keys.length > 0 && !keys[0].startsWith(ACCOUNT_KEY_NIL_TAG)) transaction.roleTransactionKey = parseAccountKey({accountKey: keys[0]})
    if (keys.length > 1 && !keys[1].startsWith(ACCOUNT_KEY_NIL_TAG)) transaction.roleAccountUpdateKey = parseAccountKey({accountKey: keys[1]})
    if (keys.length > 2 && !keys[2].startsWith(ACCOUNT_KEY_NIL_TAG)) transaction.roleFeePayerKey = parseAccountKey({accountKey: keys[2]})
  }

  return transaction
}

module.exports = {
  rlpEncodeForAccountUpdate,
  rlpEncodeForFeeDelegatedAccountUpdate,
  rlpEncodeForFeeDelegatedAccountUpdateWithRatio,
  parseAccountKey,
}