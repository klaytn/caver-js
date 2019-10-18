caver-js
=================

caver-js is a JavaScript API library that allows developers to interact with a
Klaytn node using a HTTP or Websocket connection. 

Table of contents
=================
   * [Requirements](#requirements)
   * [Installation](#installation)
   * [Getting Started](#getting-started)
      * [Check the Connection](#check-the-connection)
      * [Using caver-js account/wallet](#using-caver-js-account/wallet)
      * [Submitting a Transaction](#submitting-a-transaction)
      * [Units for KLAY](#units-for-klay)
   * [Documentation](#documentation)
   * [API Specification](#api-specification)
   * [Web3.js Similarity](#web3.js-similarity)
   * [Error Code Improvement](#error-code-improvement)
   * [Sample Projects](#sample-projects)
   * [Github Repository](#github-repository)
   * [Related Projects](#related-projects)

Requirements
=================
The following packages are required to use the caver-js library.
- [Node.js](https://nodejs.org/en/download/)
- [npm](https://www.npmjs.com/get-npm)
- [gcc-c++](https://gcc.gnu.org/)

Testing in caver-js is implemented using the mocha testing framework. If you want to run unit tests in caver-js, you need to install mocha first.
- [mocha](https://mochajs.org/#installation)

**Note** caver-js can run on Node.js versions 8 and 10, and the recommended versions are:
- lts/carbon ([8.16.0](https://nodejs.org/dist/latest-v8.x/))
- lts/dubnium ([10.16.0](https://nodejs.org/dist/latest-v10.x/))

If you are already using a different version of the node(for example, node v12), use the Node Version Manager([NVM](https://github.com/nvm-sh/nvm)) to install and use the version supported by caver-js.


Installation
=================
To try it out, install caver-js with npm like following command:

```
$ npm install caver-js
```

**Note** `package.json` file should exist on the same install path.  If it
does not exist, `package.json` should be generated via `npm init`.

To install a specific version of caver-js, try the following command:
```
$ npm install caver-js@X.X.X
```

Getting Started
=================
If you want to run your own EN (Endpoint Node), see [EN Operation Guide](https://docs.klaytn.com/node/endpoint-node) to set up. You can also use Klaytn Public EN like below:
```
$ node
> const Caver = require('caver-js')
> const caver = new Caver('https://api.baobab.klaytn.net:8651/')
```
**Note** The above example should be executed from the location where caver-js is installed, and the example is explained using [Node.js REPL](https://nodejs.org/api/repl.html#repl_the_node_js_repl).

## Check the Connection
You can now use caver-js. You can send a basic request to the node as shown below and check the results.
```
> caver.klay.getNodeInfo().then(console.log)
Klaytn/vX.X.X/linux-amd64/goX.X.X
```

## Using caver-js account/wallet
You can easily manage your account by using the account / wallet packages provided by caver-js.
[caver.klay.accounts](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.klay.accounts) package provides functions related to accounts, such as create, signTransaction, and privateKeyToAccount.
[caver.klay.accounts.wallet](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.klay.accounts#wallet) provides the **in-memory wallet** for easy account management in caver-js.

**Note** Functions associated with wallet and account provided by caver-js have no effect on the actual Klaytn network.

Let's create a random account as shown in the example below:
```
> const account = caver.klay.accounts.create()

> account
{ address: '0xF5b66670135666F273F6b5a2eA706A5aCf38D8D5',
  privateKey: '0x{private key}',
  ... }
```

You can add to the wallet instance of caver-js using the account object created in the above example, or you can add an account using a specific private key. If the address is not specified separately, the address derived from the private key is set. If the private key is decoupled from the address, pass the address as a second parameter separately shown below.
```
// Adding an account object
> caver.klay.accounts.wallet.add(account)

// Adding a private key
> caver.klay.accounts.wallet.add('0x{private key}')

// Adding a private key with an address
> caver.klay.accounts.wallet.add('0x{private key}', '0x6b6bb1221c5c27cbc87768aae849b97d01a073a9')
```

caver-js supports two types of private key formats.
One is a raw private key format of a 32-byte string type and the other is the [KlaytnWalletKey](https://docs.klaytn.com/klaytn/design/accounts#klaytn-wallet-key-format).

You can also add your account using the KlaytnWalletKey format as shown below:
```
// Adding a Klaytn wallet key
> caver.klay.accounts.wallet.add('0x{private key}0x000x{address in hex}')
```

Once added to a wallet, it can be accessed via an index or an address.
```
> caver.klay.accounts.wallet[0]
> caver.klay.accounts.wallet['0xF5b66670135666F273F6b5a2eA706A5aCf38D8D5']
```

The private key that matches a specific account stored in the wallet instance can be updated as follows:
```
> caver.klay.accounts.wallet.updatePrivateKey('0x{new private key}', '0x{address in hex}')
```

## Submitting a Transaction
You can use caver-js to submit various types of transactions to a node. Please refer to the [caver.klay.sendTransaction](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.klay/transaction#sendtransaction) to see how to send a transaction of each type.

You can submit the transaction as shown below, and the result can be confirmed by the returned receipt:
```
// using the promise
> caver.klay.sendTransaction({
    type: 'VALUE_TRANSFER',
    from: '0x76d1cc1cdb081de8627cab2c074f02ebc7bce0d0',
    to: '0x80c2c57dad6cb16488b4c70c17d77152c74f8ade',
    gas: '300000',
    value: caver.utils.toPeb('1', 'KLAY'),
  }).then(console.log)
{ 
  blockHash: '0x0a78b5c5b95456b2d6b6a9ba25fd2afd0000d16bcf03a8ae58a6557a59319a67',
  blockNumber: 8021,
  contractAddress: null,
  from: '0x76d1cc1cdb081de8627cab2c074f02ebc7bce0d0',
  ...
  type: 'TxTypeValueTransfer',
  typeInt: 8,
  value: '0xde0b6b3a7640000' 
}

// using the event emitter
> caver.klay.sendTransaction({
    type: 'VALUE_TRANSFER',
    from: '0x76d1cc1cdb081de8627cab2c074f02ebc7bce0d0',
    to: '0x80c2c57dad6cb16488b4c70c17d77152c74f8ade',
    gas: '300000',
    value: caver.utils.toPeb('1', 'KLAY'),
  }).on('transactionHash', function(hash){
    ...
  }).on('receipt', function(receipt){
    ...
  })
```
The sendTransaction function will sign if the account corresponding to `from` is in the wallet and send it to the node; otherwise, send the transaction unsigned.

If you want to get a raw signed transaction, do the following with an appropriate private key:
```
> caver.klay.accounts.signTransaction({
    type: 'VALUE_TRANSFER',
    from: '0x76d1cc1cdb081de8627cab2c074f02ebc7bce0d0',
    to: '0x80c2c57dad6cb16488b4c70c17d77152c74f8ade',
    gas: '300000',
    value: caver.utils.toPeb('1', 'KLAY'),
  }, '{private key}').then((signed)=>console.log(signed.rawTransaction))
```
The raw transaction can be transferred to the Klaytn node using caver.klay.sendSignedTransaction:
```
> caver.klay.sendSignedTransaction(rawTransaction).then(console.log)
```

## Units for KLAY
Units of KLAY is shown as below, and `peb` is the smallest currency unit.
`peb` is the default unit unless the unit conversion is used.

| Name | Unit |
| --- | ---: |
| peb | 1 |
| kpeb | 1,000 |
| Mpeb | 1,000,000 |
| Gpeb | 1,000,000,000 |
| Ston | 1,000,000,000 |
| uKLAY | 1,000,000,000,000 |
| mKLAY | 1,000,000,000,000,000 |
| KLAY | 1,000,000,000,000,000,000 |
| kKLAY | 1,000,000,000,000,000,000,000 |
| MKLAY | 1,000,000,000,000,000,000,000,000 |
| GKLAY | 1,000,000,000,000,000,000,000,000,000 |

caver-js provides the caver.utils.toPeb function for unit conversion. Please refer to the usage below.
```
> caver.utils.toPeb(1, 'peb')
'1'

> caver.utils.toPeb(1, 'Gpeb')
'1000000000'

> caver.utils.toPeb(1, 'KLAY')
'1000000000000000000'
```

Documentation
=================

Documentation can be found at [Klaytn Docs-caver-js](https://docs.klaytn.com/bapp/sdk/caver-js).

API Specification
=================

The API lists of caver-js are described in folloinwg links:

* [caver.klay](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.klay)
* [caver.klay.accounts](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.klay.accounts)
* [caver.klay.contract](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.klay.contract)
* [caver.klay.net](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.klay.net)
* [caver.klay.abi](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.klay.abi)
* [caver.utils](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.utils)


Web3.js Similarity
=================
Since caver-js has been evolved from web3.js, usage pattern of caver-js is very similar to that of web3.js.
This means a software developed using web3.js can be easily converted to caver-js.
The following examples are code patterns used in web3.js and caver-js, respectively.
```
const Web3 = require('web3');
const web3 = new Web3(new web3.providers.HttpProvider('http://localhost:8545'));

web3.eth.getBalance('0x407d73d8a49eeb85d32cf465507dd71d507100c1').then(console.log)
```
```
const Caver = require('caver-js');
const caver = new Caver(new Caver.providers.HttpProvider('http://localhost:8545'));

caver.klay.getBalance('0x407d73d8a49eeb85d32cf465507dd71d507100c1').then(console.log)
```

Error Code Improvement
=================

Klaytn improves reporting transaction failure via txError in the receipt.
caver-js further improves the report by presenting the error string that corresponds to txError.

The below is an example of a receipt containing txError.

```
Error: VM error occurs while running smart contract
 {
  "blockHash": "0xe7ec35c9fff1178d52cee1d46d40627d19f828c4b06ad1a5c3807698b99acb20",
  ...
  "txError": "0x2",
  ...
}
```

The meaning of error code can be found below:

| Error Code | Description |
|---|---|
|0x02|VM error occurs while running smart contract|
|0x03|max call depth exceeded|
|0x04|contract address collision|
|0x05|contract creation code storage out of gas|
|0x06|evm: max code size exceeded|
|0x07|out of gas|
|0x08|evm: write protection|
|0x09|evm: execution reverted|
|0x0a|reached the opcode computation cost limit (100000000) for tx|
|0x0b|account already exists|
|0x0c|not a program account (e.g., an account having code and storage)|
|0x0d|Human-readable address is not supported now|
|0x0e|fee ratio is out of range [1, 99]|
|0x0f|AccountKeyFail is not updatable|
|0x10|different account key type|
|0x11|AccountKeyNil cannot be initialized to an account|
|0x12|public key is not on curve|
|0x13|key weight is zero|
|0x14|key is not serializable|
|0x15|duplicated key|
|0x16|weighted sum overflow|
|0x17|unsatisfiable threshold. Weighted sum of keys is less than the threshold.|
|0x18|length is zero|
|0x19|length too long|
|0x1a|nested composite type|
|0x1b|a legacy transaction must be with a legacy account key|
|0x1c|deprecated feature|
|0x1d|not supported|
|0x1e|smart contract code format is invalid|

Sample Projects
=================

The BApp (Blockchain Application) Development sample projects using caver-js are the following:

* [Count BApp](https://docs.klaytn.com/bapp/tutorials/count-bapp)
* [Klaystagram](https://docs.klaytn.com/bapp/tutorials/klaystagram)

Github Repository
=================

* [caver-js](https://github.com/klaytn/caver-js)

Related Projects
=================
[caver-java](https://github.com/klaytn/caver-java) for Java
