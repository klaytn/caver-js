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
      * [Using caver-js keyring/wallet](#using-caver-js-keyring/wallet)
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
- lts/carbon ([8.17.0](https://nodejs.org/dist/latest-v8.x/))
- lts/dubnium ([10.22.0](https://nodejs.org/dist/latest-v10.x/))
* lts/erbium ([12.19.0](https://nodejs.org/dist/latest-v12.x/))

If you are already using a different version of the node(for example, node v14), use the Node Version Manager([NVM](https://github.com/nvm-sh/nvm)) to install and use the version supported by caver-js.


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
> caver.rpc.klay.getClientVersion().then(console.log)
Klaytn/vX.X.X/linux-amd64/goX.X.X
```

## Using caver-js keyring/wallet

You can easily use your Klaytn account when signing a transaction or message by using the [Keyring] / [wallet].

The keyring is a new feature that contains an address and one or more private keys based on the key types ([SingleKeyring], [MultipleKeyring] or [RoleBasedKeyring]). Refer to [caver.wallet.keyring] for details.
[caver.wallet], the **in-memory wallet**, is provided to easily manage multiple keyrings.

**Note** Functions associated with `wallet` and `keyring` have no effect on the Klaytn blockchain platform. It just manipulates keyrings in the in-memory wallet.

Let's create a random keyring as shown in the example below:
```
> const keyring = caver.wallet.keyring.generate()

> keyring
SingleKeyring {
  _address: '0x64d221893cc628605314026f4c4e0879af5b75b1',
  _key: PrivateKey { _privateKey: '0x{private key}' }
}
```

You can add the keyring object created in the above example to the caver.wallet, or you can add a keyring using an address and private key(s).
```
// Add a keyring instance to caver.wallet
> caver.wallet.add(keyring)

// Add a keyring to caver.wallet with an address and a private key
> caver.wallet.newKeyring('0x{address in hex}', '0x{private key}')

// Add a keyring to caver.wallet with an address and private keys
> caver.wallet.newKeyring('0x{address in hex}', ['0x{private key1}', '0x{private key2}', ...])

// Add a keyring to caver.wallet with an address and private keys by roles
> caver.wallet.newKeyring('0x{address in hex}', [ ['0x{private key1}', ...], ['0x{private key2}', ...], ['0x{private key3}', ...] ])
```

## Submitting a Transaction
You can use caver-js to submit various types of transactions to a node. Please refer to the [caver.transaction](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.transaction/#class) to see how to create a transaction of each type.

You can sign the transaction using a keyring and send a signed transaction through `caver.rpc.klay.sendRawTransaction` as shown below, and the receipt is returned as a result.
```
// Add a keyring to caver.wallet
> const keyring = caver.wallet.newKeyring('0x{address in hex}', '0x{private key}')
> const vt = new caver.transaction.valueTransfer({
		from: keyring.address,
		to: '0x176ff0344de49c04be577a3512b6991507647f72',
		value: caver.utils.convertToPeb(1, 'KLAY'),
		gas: 25000,
	})
> caver.wallet.sign(keyring.address, vt).then(signed => {
  caver.rpc.klay.sendRawTransaction(signed).then(console.log)
})
{ 
  blockHash: '0x0a78b5c5b95456b2d6b6a9ba25fd2afd0000d16bcf03a8ae58a6557a59319a67',
  blockNumber: 8021,
  contractAddress: null,
  from: '0x09a08f2289d3eb3499868908f1c84fd9523fe11b',
  ...
  type: 'TxTypeValueTransfer',
  typeInt: 8,
  value: '0xde0b6b3a7640000' 
}
```

The above example uses `Promise` when sending a signed transaction to the Klaytn. You can also use `event emitter` like below.

```
caver.rpc.klay.sendRawTransaction(signed).on('transactionHash', function(hash){
    ...
  }).on('receipt', function(receipt){
    ...
  })
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
| ston | 1,000,000,000 |
| uKLAY | 1,000,000,000,000 |
| mKLAY | 1,000,000,000,000,000 |
| KLAY | 1,000,000,000,000,000,000 |
| kKLAY | 1,000,000,000,000,000,000,000 |
| MKLAY | 1,000,000,000,000,000,000,000,000 |
| GKLAY | 1,000,000,000,000,000,000,000,000,000 |
| TKLAY | 1,000,000,000,000,000,000,000,000,000,000 |

caver-js provides the caver.utils.convertToPeb function for unit conversion. Please refer to the usage below.
```
> caver.utils.convertToPeb(1, 'peb')
'1'

> caver.utils.convertToPeb(1, 'Gpeb')
'1000000000'

> caver.utils.convertToPeb(1, 'KLAY')
'1000000000000000000'
```

Documentation
=================

Documentation can be found at [Klaytn Docs-caver-js](https://docs.klaytn.com/bapp/sdk/caver-js).

API Specification
=================

The API lists of caver-js are described in folloinwg links:

* [caver.account](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.account)
* [caver.wallet](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.wallet)
* [caver.wallet.keyring](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.wallet/keyring)
* [caver.transaction](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.transaction)
* [caver.rpc.klay](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.rpc/klay)
* [caver.rpc.net](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.rpc/net)
* [caver.contract](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.contract)
* [caver.abi](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.abi)
* [caver.kct.kip7](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.kct/kip7)
* [caver.kct.kip17](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.kct/kip17)
* [caver.utils](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.utils)
* [caver.ipfs](https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.ipfs)

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
caver.rpc.klay.getBalance('0x407d73d8a49eeb85d32cf465507dd71d507100c1').then(console.log)	
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


[Keyring]: https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.wallet/keyring
[caver.wallet.keyring]: https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.wallet/keyring
[wallet]: https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.wallet
[caver.wallet]: https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.wallet
[SingleKeyring]: https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.wallet/keyring#singlekeyring
[MultipleKeyring]: https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.wallet/keyring#multiplekeyring
[RoleBasedKeyring]: https://docs.klaytn.com/bapp/sdk/caver-js/api-references/caver.wallet/keyring#rolebasedkeyring
