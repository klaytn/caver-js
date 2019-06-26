/*
    Modifications copyright 2018 The caver-js Authors
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.

    This file is derived from web3.js/packages/web3-eth-accounts/src/index.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file accounts.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

var _ = require("underscore");
var core = require('../../../caver-core');
var Method = require('../../../caver-core-method');
var Promise = require('any-promise');
// account, hash, rlp, nat, bytes library will be used from 'eth-lib' temporarily.
var Account = require("eth-lib/lib/account");
var Hash = require("eth-lib/lib/hash");
var RLP = require("eth-lib/lib/rlp");
var Nat = require("eth-lib/lib/nat");
var Bytes = require("eth-lib/lib/bytes");
var cryp = (typeof global === 'undefined') ? require('crypto-browserify') : require('crypto');
var scryptsy = require('scrypt.js');
var uuid = require('uuid');
var utils = require('../../../caver-utils');
var helpers = require('../../../caver-core-helpers');
const { encodeRLPByTxType, makeRawTransaction, getSenderTxHash } = require('./makeRawTransaction')

var elliptic = require('elliptic')
var secp256k1 = new (elliptic.ec)('secp256k1')

const rpc = require('../../../caver-rtm').rpc

var isNot = function(value) {
    return (_.isUndefined(value) || _.isNull(value));
};

function coverInitialTxValue(tx) {
  if (typeof tx !== 'object') throw ('Invalid transaction')
  tx.to = tx.to || '0x'
  tx.data = tx.data || '0x'
  tx.chainId = utils.numberToHex(tx.chainId)
  return tx
}

var Accounts = function Accounts(...args) {
    var _this = this;

    // sets _requestmanager
    core.packageInit(this, args);

    // remove unecessary core functions
    delete this.BatchRequest;
    delete this.extend;

    var _klaytnCall = [rpc.getChainId, rpc.getGasPrice, rpc.getTransactionCount]
    // attach methods to this._klaytnCall
    this._klaytnCall = {};
    _.each(_klaytnCall, function (method) {
        method.attachToObject(_this._klaytnCall);
        method.setRequestManager(_this._requestManager);
    });


    this.wallet = new Wallet(this);
};

Accounts.prototype._addAccountFunctions = function (account) {
    var _this = this;

    // add sign functions
    account.signTransaction = function signTransaction(tx, callback) {
        return _this.signTransaction(tx, account.privateKey, callback);
    };
    account.sign = function sign(data) {
        return _this.sign(data, account.privateKey);
    };

    account.encrypt = function encrypt(password, options = {}) {
        options.address = account.address
        return _this.encrypt(account.privateKey, password, options);
    };

    account.getKlaytnWalletKey = function getKlaytnWalletKey() {
      return genKlaytnWalletKeyStringFromAccount(account)
    }


    return account;
};

Accounts.prototype.create = function create(entropy) {
    return this._addAccountFunctions(Account.create(entropy || utils.randomHex(32)));
};

Accounts.prototype.privateKeyToAccount = function privateKeyToAccount(privateKey, targetAddressRaw) {
  var { privateKey: prvKey, address, isHumanReadable } = utils.parsePrivateKey(privateKey)

  if (!utils.isValidPrivateKey(prvKey)) throw new Error('Invalid private key')

  if (prvKey.slice(0, 2) !== '0x') {
    prvKey = `0x${prvKey}`
  }

  let account = Account.fromPrivate(prvKey)

  if (targetAddressRaw) {
    if(address && address !== targetAddressRaw) {
      throw new Error('The address extracted from the private key does not match the address received as the input value.')
    }

    if(!utils.isAddress(targetAddressRaw)) {
      throw new Error('The address received as the input value is invalid.')
    }
    account.address = targetAddressRaw

  } else if (address){
    if(!utils.isAddress(address)) {
      throw new Error('The address extracted from the private key is invalid.')
    }
    // If targetAddressRaw is undefined and address which is came from private is existed, set address in account.
    account.address = address
  }

  account.address = account.address.toLowerCase()
  account.address = '0x' + account.address.replace('0x', '')

  return this._addAccountFunctions(account)
}

Accounts.prototype.signTransaction = function signTransaction(tx, privateKey, callback) {
    var _this = this,
        error = false,
        result

    callback = callback || function () {}

    const parsed = utils.parsePrivateKey(privateKey)
    privateKey = parsed.privateKey

    if (!utils.isValidPrivateKey(privateKey)) throw new Error('Invalid private key')
    privateKey = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey

    if (!tx) {
      error = new Error('No transaction object given!')

      callback(error)
      return Promise.reject(error)
    }

    function signed(tx) {

      if (!tx.senderRawTransaction) {
        error = helpers.validateFunction.validateParams(tx)
      }
      if (error) {
        callback(error);
        return Promise.reject(error);
      }

      try {
        // Guarantee all property in transaction is hex.
        tx = helpers.formatters.inputCallFormatter(tx)

        const transaction = coverInitialTxValue(tx)

        const rlpEncoded = encodeRLPByTxType(transaction)

        const messageHash = Hash.keccak256(rlpEncoded)

        const signature = Account.makeSigner(Nat.toNumber(transaction.chainId || "0x1") * 2 + 35)(messageHash, privateKey)
        const [v, r, s] = Account.decodeSignature(signature).map(sig => utils.makeEven(utils.trimLeadingZero(sig)))

        const rawTransaction = makeRawTransaction(rlpEncoded, [v, r, s], transaction)

        result = {
            messageHash: messageHash,
            v: v,
            r: r,
            s: s,
            rawTransaction: rawTransaction,
            txHash: Hash.keccak256(rawTransaction),
            senderTxHash: getSenderTxHash(rawTransaction),
        }

      } catch(e) {
        callback(e)
        return Promise.reject(e)
      }

      callback(null, result)
      return result
    }

    if (tx.nonce !== undefined && tx.chainId !== undefined && tx.gasPrice !== undefined) {
        return Promise.resolve(signed(tx));
    }


    // Otherwise, get the missing info from the Klaytn Node
    return Promise.all([
        isNot(tx.chainId) ? _this._klaytnCall.getChainId() : tx.chainId,
        isNot(tx.gasPrice) ? _this._klaytnCall.getGasPrice() : tx.gasPrice,
        isNot(tx.nonce) ? _this._klaytnCall.getTransactionCount(tx.feePayer || tx.from || _this.privateKeyToAccount(privateKey).address) : tx.nonce
    ]).then(function (args) {
        if (isNot(args[0]) || isNot(args[1]) || isNot(args[2])) {
            throw new Error('One of the values "chainId", "gasPrice", or "nonce" couldn\'t be fetched: '+ JSON.stringify(args));
        }
        return signed(_.extend(tx, {chainId: args[0], gasPrice: args[1], nonce: args[2]}));
    });
};

Accounts.prototype.signTransactionWithSignature = function signTransactionWithSignature(tx, callback) {
    var _this = this,
        error = false,
        result

    callback = callback || function () {}

    if (!tx) {
      error = new Error('No transaction object given!')

      callback(error)
      return Promise.reject(error)
    }

    if (!tx.signature) {
      error = new Error('No tx signature given!')

      callback(error)
      return Promise.reject(error)
    }

    function signed(tx) {
      if (!tx.senderRawTransaction) {
        error = helpers.validateFunction.validateParams(tx)
      }
      if (error) {
        callback(error)
        return Promise.reject(error)
      }

      try {
        // Guarantee all property in transaction is hex.
        tx = helpers.formatters.inputCallFormatter(tx)

        const transaction = coverInitialTxValue(tx)

        const rlpEncoded = encodeRLPByTxType(transaction)

        const messageHash = Hash.keccak256(rlpEncoded)

        let sig
        if (_.isArray(transaction.signature)) {
          sig = transaction.signature.map((_sig) => utils.resolveSignature(_sig))
        } else {
          sig = utils.resolveSignature(transaction.signature)
        }

        const rawTransaction = makeRawTransaction(rlpEncoded, sig, transaction)

        result = {
            messageHash: messageHash,
            signature: sig,
            rawTransaction: rawTransaction,
            txHash: Hash.keccak256(rawTransaction),
            senderTxHash: getSenderTxHash(rawTransaction),
        }
        
      } catch(e) {
        callback(e)
        return Promise.reject(e)
      }

      callback(null, result)
      return result
    }

    if (tx.nonce !== undefined && tx.chainId !== undefined && tx.gasPrice !== undefined) {
        return Promise.resolve(signed(tx));
    }


    // Otherwise, get the missing info from the Klaytn Node
    return Promise.all([
        isNot(tx.chainId) ? _this._klaytnCall.getChainId() : tx.chainId,
        isNot(tx.gasPrice) ? _this._klaytnCall.getGasPrice() : tx.gasPrice,
        isNot(tx.nonce) ? _this._klaytnCall.getTransactionCount(tx.feePayer || tx.from) : tx.nonce
    ]).then(function (args) {
        if (isNot(args[0]) || isNot(args[1]) || isNot(args[2])) {
            throw new Error('One of the values "chainId", "gasPrice", or "nonce" couldn\'t be fetched: '+ JSON.stringify(args));
        }
        return signed(_.extend(tx, {chainId: args[0], gasPrice: args[1], nonce: args[2]}));
    });
};

/**
 * cav.klay.accounts.recoverTransaction('0xf86180808401ef364594f0109fc8df283027b6285cc889f5aa624eac1f5580801ca031573280d608f75137e33fc14655f097867d691d5c4c44ebe5ae186070ac3d5ea0524410802cdc025034daefcdfa08e7d2ee3f0b9d9ae184b2001fe0aff07603d9');
 * > "0xF0109fC8DF283027b6285cc889F5aA624EaC1F55"
 */
Accounts.prototype.recoverTransaction = function recoverTransaction(rawTx) {
    var values = RLP.decode(rawTx);
    var signature = Account.encodeSignature(values.slice(6,9));
    var recovery = Bytes.toNumber(values[6]);
    var extraData = recovery < 35 ? [] : [Bytes.fromNumber((recovery - 35) >> 1), "0x", "0x"];
    var signingData = values.slice(0,6).concat(extraData);
    var signingDataHex = RLP.encode(signingData);

    return Account.recover(Hash.keccak256(signingDataHex), signature);
};

/**
 * Hashes the given message to be passed cav.klay.accounts.recover() function.
 * The data will be UTF-8 HEX decoded and enveloped as follows:
 * "\x19Klaytn Signed Message:\n" + message.length + message and hashed using keccak256.
 *
 * cav.klay.accounts.hashMessage("Hello World")
 * > "0xa1de988600a42c4b4ab089b619297c17d53cffae5d5120d82d8a92d0bb3b78f2"
 * // the below results in the same hash
 * cav.klay.accounts.hashMessage(caver.utils.utf8ToHex("Hello World"))
 * > "0xa1de988600a42c4b4ab089b619297c17d53cffae5d5120d82d8a92d0bb3b78f2"
 */
Accounts.prototype.hashMessage = function hashMessage(data) {
  const message = utils.isHexStrict(data) ? utils.hexToBytes(data) : data
  const messageBuffer = Buffer.from(message)
  const preamble = "\x19Klaytn Signed Message:\n" + message.length
  const preambleBuffer = Buffer.from(preamble)
  // klayMessage is concatenated buffer (preambleBuffer + messageBuffer)
  const klayMessage = Buffer.concat([preambleBuffer, messageBuffer])
  // Finally, run keccak256 on klayMessage.
  return Hash.keccak256(klayMessage)
};

/**
 * Signs arbitrary data.
 * This data is before UTF-8 HEX decoded and enveloped as follows:
 * "\x19Klaytn Signed Message:\n" + message.length + message.
 *
 * cav.klay.accounts.sign('Some data', '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318');
 * > {
 *     message: 'Some data',
 *     messageHash: '0x1da44b586eb0729ff70a73c326926f6ed5a25f5b056e7f47fbc6e58d86871655',
 *     v: '0x1c',
 *     r: '0xb91467e570a6466aa9e9876cbcd013baba02900b8979d43fe208a4a4f339f5fd',
 *     s: '0x6007e74cd82e037b800186422fc2da167c747ef045e5d18a5f5d4300f8e1a029',
 *     signature: '0xb91467e570a6466aa9e9876cbcd013baba02900b8979d43fe208a4a4f339f5fd6007e74cd82e037b800186422fc2da167c747ef045e5d18a5f5d4300f8e1a0291c'
 *   }
 */
Accounts.prototype.sign = function sign(data, privateKey) {
  const parsed = utils.parsePrivateKey(privateKey)
  privateKey = parsed.privateKey
  if (!utils.isValidPrivateKey(privateKey)) throw new Error('Invalid private key')

  const messageHash = this.hashMessage(data)
  const signature = Account.sign(messageHash, privateKey)
  const [v, r, s] = Account.decodeSignature(signature)
  return {
    message: data,
    messageHash,
    v,
    r,
    s,
    signature,
  }
}

/**
 * preFixed - Boolean (optional, default: false):
 * If the last parameter is true,
 * the given message will NOT automatically be prefixed with "\x19Klaytn Signed Message:\n" + message.length + message,
 * and assumed to be already prefixed.
 */
Accounts.prototype.recover = function recover(message, signature, preFixed) {
    var args = [].slice.apply(arguments);
    
    if (_.isObject(message)) {
      return this.recover(
        message.messageHash,
        Account.encodeSignature([message.v, message.r, message.s]),
        true,
      )
    }
    
    if (!preFixed) {
      message = this.hashMessage(message)
    }

    if (args.length >= 4) {
        preFixed = args.slice(-1)[0];
        preFixed = _.isBoolean(preFixed) ? !!preFixed : false;

        return this.recover(message, Account.encodeSignature(args.slice(1, 4)), preFixed); // v, r, s
    }
    /**
     * recover in Account module
     * const recover = (hash, signature) => {
     *   const vals = decodeSignature(signature);
     *   const vrs = { v: Bytes.toNumber(vals[0]), r: vals[1].slice(2), s: vals[2].slice(2) };
     *   const ecPublicKey = secp256k1.recoverPubKey(new Buffer(hash.slice(2), "hex"), vrs, vrs.v < 2 ? vrs.v : 1 - vrs.v % 2); // because odd vals mean v=0... sadly that means v=0 means v=1... I hate that
     *   const publicKey = "0x" + ecPublicKey.encode("hex", false).slice(2);
     *   const publicHash = keccak256(publicKey);
     *   const address = toChecksum("0x" + publicHash.slice(-40));
     *   return address;
     * };
     */
    return Account.recover(message, signature);
};

// Taken from https://github.com/ethereumjs/ethereumjs-wallet
Accounts.prototype.decrypt = function (v3Keystore, password, nonStrict) {
    if(!_.isString(password)) {
        throw new Error('No password given.');
    }
    
    var json = (_.isObject(v3Keystore)) ? v3Keystore : JSON.parse(nonStrict ? v3Keystore.toLowerCase() : v3Keystore);

    if (json.version !== 3) {
        console.warn('This is not a V3 wallet.')
        // throw new Error('Not a valid V3 wallet');
    }

    var derivedKey;
    var kdfparams;
    /**
     * Supported kdf modules are the following:
     * 1) pbkdf2
     * 2) scrypt
     */
    if (json.crypto.kdf === 'scrypt') {
        kdfparams = json.crypto.kdfparams;

        // FIXME: support progress reporting callback
        derivedKey = scryptsy(new Buffer(password), new Buffer(kdfparams.salt, 'hex'), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen);
    } else if (json.crypto.kdf === 'pbkdf2') {
        kdfparams = json.crypto.kdfparams;

        if (kdfparams.prf !== 'hmac-sha256') {
            throw new Error('Unsupported parameters to PBKDF2');
        }

        derivedKey = cryp.pbkdf2Sync(new Buffer(password), new Buffer(kdfparams.salt, 'hex'), kdfparams.c, kdfparams.dklen, 'sha256');
    } else {
        throw new Error('Unsupported key derivation scheme');
    }

    var ciphertext = new Buffer(json.crypto.ciphertext, 'hex');

    var mac = utils.sha3(Buffer.concat([ derivedKey.slice(16, 32), ciphertext ])).replace('0x','');
    if (mac !== json.crypto.mac) {
        throw new Error('Key derivation failed - possibly wrong password');
    }

    var decipher = cryp.createDecipheriv(json.crypto.cipher, derivedKey.slice(0, 16), new Buffer(json.crypto.cipherparams.iv, 'hex'));
    var seed = '0x'+ Buffer.concat([ decipher.update(ciphertext), decipher.final() ]).toString('hex');

    return this.privateKeyToAccount(seed, json.address);
};

/**
 * cav.klay.accounts.encrypt(privateKey, password);
 * cav.klay.accounts.encrypt('0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318', 'test!')
    > {
        version: 3,
        id: '04e9bcbb-96fa-497b-94d1-14df4cd20af6',
        address: '2c7536e3605d9c16a7a3d7b1898e529396a65c23',
        crypto: {
            ciphertext: 'a1c25da3ecde4e6a24f3697251dd15d6208520efc84ad97397e906e6df24d251',
            cipherparams: { iv: '2885df2b63f7ef247d753c82fa20038a' },
            cipher: 'aes-128-ctr',
            kdf: 'scrypt',
            kdfparams: {
                dklen: 32,
                salt: '4531b3c174cc3ff32a6a7a85d6761b410db674807b2d216d022318ceee50be10',
                n: 262144,
                r: 8,
                p: 1
            },
            mac: 'b8b010fff37f9ae5559a352a185e86f9b9c1d7f7a9f1bd4e82a5dd35468fc7f6'
        }
    }

    `dklen` is the desired length of the derived key
    `salt` - A string of characters that modifies the hash to protect against Rainbow table attacks
    `n` - CPU/memory cost parameter
    `r` - The blocksize parameter, which fine-tunes sequential memory read size and performance. 8 is commonly used.
    `p` - Parallelization parameter
    `c` - the number of iterations desired

    {
      "address":"9e1023dbce2d6304f5011a4db56a8ed7ba271650",
      "crypto":{"cipher":"aes-128-ctr",
      "ciphertext":"0f1158156a26e5135e107522639bb2b549acf159a12097c02fc2d73b97841000",
      "version":3,
      "cipherparams":{"iv":"e15c86e8797c37bffd2ebfa68a532595"},
      "kdf":"scrypt",
      "kdfparams":{
        "dklen":32,
        "n":262144,
        "p":1,
        "r":8,
        "salt":"e7c4605ad8200e0d93cd67f9d82fb9971e1a2763b22362017c2927231c2a733a"
      },
      "mac":"d2ad144ef6060ac01d711d691ff56e11d4deffc85a08de0dde27c28c23959251"},
      "id":"dfde6a32-4b0e-404f-8b9f-2b18f279fe21",
    }
 */
Accounts.prototype.encrypt = function (privateKey, password, options) {
    /**
     * options can include below
     * {
     *   salt: ...,
     *   iv: ...,
     *   kdf: ...,
     *   dklen: ...,
     *   c: ...,
     *   n: ...,
     *   r: ...,
     *   p: ...,
     *   cipher: ...,
     *   uuid: ...,
     *   cipher: ...,
     * }
     */
    options = options || {};

    var account = this.privateKeyToAccount(privateKey, options.address);

    var salt = options.salt || cryp.randomBytes(32);
    var iv = options.iv || cryp.randomBytes(16);

    var derivedKey;
    var kdf = options.kdf || 'scrypt';
    var kdfparams = {
        dklen: options.dklen || 32,
        salt: salt.toString('hex')
    };

    /**
     * Supported kdf modules are the following:
     * 1) pbkdf2
     * 2) scrypt - default
     */
    if (kdf === 'pbkdf2') {
        kdfparams.c = options.c || 262144;
        kdfparams.prf = 'hmac-sha256';
        derivedKey = cryp.pbkdf2Sync(new Buffer(password), salt, kdfparams.c, kdfparams.dklen, 'sha256');
    } else if (kdf === 'scrypt') {
        // FIXME: support progress reporting callback
        kdfparams.n = options.n || 4096; // 2048 4096 8192 16384
        kdfparams.r = options.r || 8;
        kdfparams.p = options.p || 1;
        derivedKey = scryptsy(new Buffer(password), salt, kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen);
    } else {
        throw new Error('Unsupported kdf');
    }

    var cipher = cryp.createCipheriv(options.cipher || 'aes-128-ctr', derivedKey.slice(0, 16), iv);
    if (!cipher) {
        throw new Error('Unsupported cipher');
    }

    var ciphertext = Buffer.concat([ cipher.update(new Buffer(account.privateKey.replace('0x',''), 'hex')), cipher.final() ]);

    var mac = utils.sha3(Buffer.concat([ derivedKey.slice(16, 32), new Buffer(ciphertext, 'hex') ])).replace('0x','');

    return {
        version: 3,
        id: uuid.v4({ random: options.uuid || cryp.randomBytes(16) }),
        address: account.address.toLowerCase(),
        crypto: {
            ciphertext: ciphertext.toString('hex'),
            cipherparams: {
                iv: iv.toString('hex')
            },
            cipher: options.cipher || 'aes-128-ctr',
            kdf: kdf,
            kdfparams: kdfparams,
            mac: mac.toString('hex')
        }
    };
};

Accounts.prototype.privateKeyToPublicKey = function (privateKey, compressed = false) {
  const parsed = utils.parsePrivateKey(privateKey)
  privateKey = parsed.privateKey
  privateKey = privateKey.slice(0, 2) === '0x'? privateKey.slice(2) : privateKey

  if (privateKey.length !== 64) {
    throw new Error('Received a invalid privateKey. The length of privateKey should be 64.')
  }
  const buffer = new Buffer(privateKey, "hex");
  const ecKey = secp256k1.keyFromPrivate(buffer)

  let publicKey

  if (!compressed) {
    publicKey = "0x" + ecKey.getPublic(false, 'hex').slice(2)
  } else {
    publicKey = "0x" + ecKey.getPublic(true, 'hex')
  }

  return publicKey
}

Accounts.prototype.encodeRLPByTxType = encodeRLPByTxType

Accounts.prototype.setAccounts = function(accounts) {
  this.wallet.clear()

  for (let i = 0; i < accounts.wallet.length; i++) {
    this.wallet.add(accounts.wallet[i])
  }

  return this
}


/* eslint-enable complexity */

// Note: this is trying to follow closely the specs on

/**
  > Wallet {
      0: {...}, // account by index
      "0xF0109fC8DF283027b6285cc889F5aA624EaC1F55": {...},  // same account by address
      "0xf0109fc8df283027b6285cc889f5aa624eac1f55": {...},  // same account by address lowercase
      1: {...},
      "0xD0122fC8DF283027b6285cc889F5aA624EaC1d23": {...},
      "0xd0122fc8df283027b6285cc889f5aa624eac1d23": {...},

      add: function(){},
      remove: function(){},
      save: function(){},
      load: function(){},
      clear: function(){},

      length: 2,
  }
 *
 * Contains an in memory wallet with multiple accounts.
 * These accounts can be used when using cav.klay.sendTransaction().
 */
function Wallet(accounts) {
    this._accounts = accounts
    this.length = 0
    this.defaultKeyName = "caverjs_wallet"
}

Wallet.prototype._findSafeIndex = function (pointer) {
    pointer = pointer || 0;
    if (_.has(this, pointer)) {
        return this._findSafeIndex(pointer + 1);
    } else {
        return pointer;
    }
};

Wallet.prototype._currentIndexes = function () {
    var keys = Object.keys(this);
    var indexes = keys
        .map(function(key) { return parseInt(key); })
        .filter(function(n) { return (n < 9e20); });

    return indexes;
};

Wallet.prototype.create = function (numberOfAccounts, entropy) {
    for (var i = 0; i < numberOfAccounts; ++i) {
        this.add(this._accounts.create(entropy).privateKey);
    }
    return this;
};

/**
 * Adds an account using a private key or account object to the wallet.
 *
 * cav.klay.accounts.wallet.add({
    privateKey: '0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709',
    address: '0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01'
    });
    > {
        index: 0,
        address: '0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01',
        privateKey: '0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709',
        signTransaction: function(tx){...},
        sign: function(data){...},
        encrypt: function(password){...}
    }
 */
Wallet.prototype.add = function (account, targetAddressRaw) {
    var klaytnWalletKey
    /**
     * cav.klay.accounts.wallet.add('0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318');
     * 
     * cav.klay.accounts.wallet.add({
     *   privateKey: '0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709',
     *   address: '0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01'
     * });
     */
    if (_.isString(account)) {
      account = this._accounts.privateKeyToAccount(account, targetAddressRaw);
    } else if(!_.isObject(account)) {
        throw new Error('Invalid private key')
    }

    const accountAlreadyExists = !!this[account.address]

    if (accountAlreadyExists) {
      throw new Error('Account is existed with ' + account.address)
    }

    account = this._accounts.privateKeyToAccount(account.privateKey, targetAddressRaw || account.address)

    account.index = this._findSafeIndex()
    this[account.index] = account

    this[account.address] = account
    this[account.address.toLowerCase()] = account
    this[account.address.toUpperCase()] = account
    try {
      this[utils.toChecksumAddress(account.address)] = account
    } catch (e) {}

    this.length++

    return account
}

Wallet.prototype.updatePrivateKey = function (privateKey, address) {
  if (privateKey === undefined || address === undefined) {
    throw new Error('To update the privatKey in wallet, need to set both privateKey and address.')
  }

  // If privateKey parameter is not string type, return error
  if (!_.isString(privateKey)) {
    throw new Error('The private key used for the update is not a valid string.')
  }

  // If failed to find account through address, return error
  const accountExists = !!this[address]
  if (!accountExists) throw new Error('Failed to find account with ' + address)

  const account = this[address]

  const parsed = utils.parsePrivateKey(privateKey)
  if (!utils.isValidPrivateKey(parsed.privateKey)) throw new Error('Invalid private key')
  if (parsed.address && parsed.address !== account.address) throw new Error('The address extracted from the private key does not match the address received as the input value.')

  this[account.index].privateKey = parsed.privateKey

  this[account.address].privateKey = parsed.privateKey
  this[account.address.toLowerCase()].privateKey = parsed.privateKey
  this[account.address.toUpperCase()].privateKey = parsed.privateKey
  try {
    this[utils.toChecksumAddress(account.address)].privateKey = parsed.privateKey
  } catch (e) {}

  return account
}

 Wallet.prototype.remove = function (addressOrIndex) {
   var account = this[addressOrIndex]

   if (account && account.address) {
     // address
     this[account.address].privateKey = null
     delete this[account.address]

     if (this[account.address.toLowerCase()]) {
       // address lowercase
       this[account.address.toLowerCase()].privateKey = null
       delete this[account.address.toLowerCase()]
     }

     if (this[account.address.toUpperCase()]) {
       // address uppercase
       this[account.address.toUpperCase()].privateKey = null
       delete this[account.address.toUpperCase()]
     }

     try {
       this[utils.toChecksumAddress(account.address)].privateKey = null
       delete this[utils.toChecksumAddress(account.address)]
     } catch (e) {}

     // index
     this[account.index].privateKey = null
     delete this[account.index]

     this.length--

     return true
   } else {
     return false
   }
 }

Wallet.prototype.clear = function () {
    var _this = this;
    var indexes = this._currentIndexes();

    indexes.forEach(function(index) {
        _this.remove(index);
    });

    return this;
};

/**
 * cav.klay.accounts.wallet.encrypt('test');
    > [ { version: 3,
        id: 'dcf8ab05-a314-4e37-b972-bf9b86f91372',
        address: '06f702337909c06c82b09b7a22f0a2f0855d1f68',
        crypto:
         { ciphertext: '0de804dc63940820f6b3334e5a4bfc8214e27fb30bb7e9b7b74b25cd7eb5c604',
           cipherparams: [Object],
           cipher: 'aes-128-ctr',
           kdf: 'scrypt',
           kdfparams: [Object],
           mac: 'b2aac1485bd6ee1928665642bf8eae9ddfbc039c3a673658933d320bac6952e3' } },
      { version: 3,
        id: '9e1c7d24-b919-4428-b10e-0f3ef79f7cf0',
        address: 'b5d89661b59a9af0b34f58d19138baa2de48baaf',
        crypto:
         { ciphertext: 'd705ebed2a136d9e4db7e5ae70ed1f69d6a57370d5fbe06281eb07615f404410',
           cipherparams: [Object],
           cipher: 'aes-128-ctr',
           kdf: 'scrypt',
           kdfparams: [Object],
           mac: 'af9eca5eb01b0f70e909f824f0e7cdb90c350a802f04a9f6afe056602b92272b' } }
    ]
 */
Wallet.prototype.encrypt = function (password, options) {
    var _this = this;
    var indexes = this._currentIndexes();

    var accounts = indexes.map(function(index) {
        return _this[index].encrypt(password, options);
    });

    return accounts;
};

/**
 * cav.klay.accounts.wallet.decrypt([
    { version: 3,
    id: '83191a81-aaca-451f-b63d-0c5f3b849289',
    address: '06f702337909c06c82b09b7a22f0a2f0855d1f68',
    crypto:
     { ciphertext: '7d34deae112841fba86e3e6cf08f5398dda323a8e4d29332621534e2c4069e8d',
       cipherparams: { iv: '497f4d26997a84d570778eae874b2333' },
       cipher: 'aes-128-ctr',
       kdf: 'scrypt',
       kdfparams:
        { dklen: 32,
          salt: '208dd732a27aa4803bb760228dff18515d5313fd085bbce60594a3919ae2d88d',
          n: 262144,
          r: 8,
          p: 1 },
       mac: '0062a853de302513c57bfe3108ab493733034bf3cb313326f42cf26ea2619cf9' } },
     { version: 3,
    id: '7d6b91fa-3611-407b-b16b-396efb28f97e',
    address: 'b5d89661b59a9af0b34f58d19138baa2de48baaf',
    crypto:
     { ciphertext: 'cb9712d1982ff89f571fa5dbef447f14b7e5f142232bd2a913aac833730eeb43',
       cipherparams: { iv: '8cccb91cb84e435437f7282ec2ffd2db' },
       cipher: 'aes-128-ctr',
       kdf: 'scrypt',
       kdfparams:
        { dklen: 32,
          salt: '08ba6736363c5586434cd5b895e6fe41ea7db4785bd9b901dedce77a1514e8b8',
          n: 262144,
          r: 8,
          p: 1 },
       mac: 'd2eb068b37e2df55f56fa97a2bf4f55e072bef0dd703bfd917717d9dc54510f0' } }
  ], 'test');
  > Wallet {
      0: {...},
      1: {...},
      "0xF0109fC8DF283027b6285cc889F5aA624EaC1F55": {...},
      "0xD0122fC8DF283027b6285cc889F5aA624EaC1d23": {...}
      ...
  }
 */
Wallet.prototype.decrypt = function (encryptedWallet, password) {
    var _this = this;

    encryptedWallet.forEach(function (keystore) {
        var account = _this._accounts.decrypt(keystore, password);

        if (!account) {
          throw new Error('Couldn\'t decrypt the keystore. Maybe wrong password?')
        }

        const exist = !!_this[account.address]
        if (!exist) {
            _this.add(account)
        }
    });

    return this;
};

Wallet.prototype.save = function (password, keyName) {
    localStorage.setItem(keyName || this.defaultKeyName, JSON.stringify(this.encrypt(password)));

    return true;
};

/**
 * cav.klay.accounts.wallet.load('test#!$', 'myWalletKey' || 'web3js_wallet');
    > Wallet {
        0: {...},
        1: {...},
        "0xF0109fC8DF283027b6285cc889F5aA624EaC1F55": {...},
        "0xD0122fC8DF283027b6285cc889F5aA624EaC1d23": {...}
        ...
    }
 */
Wallet.prototype.load = function (password, keyName) {
    var keystore = localStorage.getItem(keyName || this.defaultKeyName);

    if (keystore) {
        try {
            keystore = JSON.parse(keystore);
        } catch(e) {

        }
    }

    return this.decrypt(keystore || [], password);
};

if (typeof localStorage === 'undefined') {
    delete Wallet.prototype.save;
    delete Wallet.prototype.load;
}

Wallet.prototype.getKlaytnWalletKey = function (addressOrIndex) {
  const account = this[addressOrIndex]
  if (!account) throw new Error('Failed to find account')

  return genKlaytnWalletKeyStringFromAccount(account)
}

function genKlaytnWalletKeyStringFromAccount(account) {
    var addressString = account.address
    var privateKey = account.privateKey
    
    privateKey = privateKey.slice(0,2) === '0x'? privateKey: '0x'+privateKey
    addressString = addressString.slice(0,2) === '0x'? addressString: '0x'+addressString

    return privateKey + '0x00' + addressString
}

module.exports = Accounts;
