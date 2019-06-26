### 1. Newly created transaction type

After this PR merged, new transaction type will be supported.

Newly created transaction types are following:
1. ValueTransfer type transaction
2. AccountCreation type transaction

**1. ValueTransfer type transaction**
To send "ValueTransfer" type transaction, you should add `type: 'VALUE_TRANSFER'` key-value pair to transaction object.

```js
{
  type: 'VALUE_TRANSFER',
  from: '...',
  to: '...',
  ...
}
```

The RLP encoding for this transaction is quite different from legacy transaction.

i) Value transfer transaction RLP encoding  
```js
RLP.encode([
        VALUE_TRANFSER_TYPE_TAG, // '0x10'
        [
          Bytes.fromNat(transaction.nonce),
          Bytes.fromNat(transaction.gasPrice),
          Bytes.fromNat(transaction.gas),
          transaction.to.toLowerCase(),
          Bytes.fromNat(transaction.value),
          transaction.from.toLowerCase(),
        ],
        Bytes.fromNat(transaction.chainId || "0x1"),
        "0x",
        "0x"
      ])
```

ii) Legacy transaction RLP encoding
```js
RLP.encode([
        Bytes.fromNat(transaction.nonce),
        Bytes.fromNat(transaction.gasPrice),
        Bytes.fromNat(transaction.gas),
        transaction.to.toLowerCase(),
        Bytes.fromNat(transaction.value),
        transaction.data,
        Bytes.fromNat(transaction.chainId || "0x1"),
        "0x",
        "0x",
      ])
```

**2. AccountCreation type transaction**  
To send "AccountCreation" type transaction, you should add
```
type: 'ACCOUNT_CREATION',
to: ..., (new address which would be newly created)
publicKey: ..., (optional)
humanReadable: ..., (optional)
```
key-value pairs to transaction object.

The RLP encoding for this transaction is quite different from legacy transaction.

i) Account creation transaction RLP encoding
```js
RLP.encode([
          ACCOUNT_CREATION_TYPE_TAG,
          [
            Bytes.fromNat(transaction.nonce),
            Bytes.fromNat(transaction.gasPrice),
            Bytes.fromNat(transaction.gas),
            transaction.to.toLowerCase(),
            Bytes.fromNat(transaction.value),
            transaction.from.toLowerCase(),
          ],
          Bytes.fromNat(transaction.transaction.humanReadable === true ? '0x1' : '0x0'),
          accountKey,
          Bytes.fromNat(transaction.chainId || "0x1"),
          "0x",
          "0x",
        ])
```

`accountKey` is the value generated as following:
If there is no `publicKey` field in the transaction object, the account key type is "ACCOUNT_NIL", on the other hand, "ACCOUNT_PUBLIC".
```js
      let accountKey

      const xyPoints = transaction.publicKey && utils.xyPointFromPublicKey(transaction.publicKey)

      // 1. Check Account key type
      if (xyPoints !== undefined && xyPoints.length) { // ACCOUNT_KEY_PUBLIC_TAG
        const [pubX, pubY] = xyPoints
        accountKey = ACCOUNT_KEY_PUBLIC_TAG + RLP.encode([pubX, pubY]).slice(2)
      } else { // ACCOUNT_KEY_NIL_TAG
        accountKey = ACCOUNT_KEY_NIL_TAG
      }
```

ii) Legacy transaction RLP encoding
```js
RLP.encode([
        Bytes.fromNat(transaction.nonce),
        Bytes.fromNat(transaction.gasPrice),
        Bytes.fromNat(transaction.gas),
        transaction.to.toLowerCase(),
        Bytes.fromNat(transaction.value),
        transaction.data,
        Bytes.fromNat(transaction.chainId || "0x1"),
        "0x",
        "0x",
      ])
```

"AccountCreation" type transaction has 4 cases:

1) has publicKey, humanReadable: true
  create human readable account and connect the given public key to the account.
  The address for this account is the value of `to` in transaction object.

2) has publicKey, humanReadable: false
  create regular account and connect the given public key to the account.
  The address for this account is the value of `to` in transaction object.

// Possible, but useless cases.
3) hasn't publicKey, humanReadable: false
  create regular account without connecting public key to the account. If you don't have a private key for the account address, you can't withdraw balance from the account. However, if you have the private key for it, there is no reason to send "AccountCreation" type transaction.

4) hasn't publicKey, humanReadable: true
  create human readable account without connecting public key to the account. Maybe this transaction is useless in many cases.

### 2. Breaking changes
1. Must have `from` field in transaction  

i) There was no need to contain `from` field to a transaction since it can be recovered from `v`, `r`, `s` signatures.  
However, after account type is newly created, there is no way to find address who signed this transaction by only recovering signatures. That's the reason why we must not omit `from` field for sending transaction.

```js
const fromOmittedTxObject = _.omit(tx, 'from')
```
So above line was removed.

ii) Should apply `inputAddressFormatter` for `from` field.  

```js
if (options.from) {
  options.from = inputAddressFormatter(options.from)
}
```
So above line was created.

2. Must support human-readable string  
i) Should parse human-readable string to hex address.  

`'toshi'` utf8 string can be changed to hex string `0x746f736869`. However for the hex string to be valid address, it should be length of 20 bytes which can be generated by adding '0' padding to right. As a result, `'toshi'` can be changed to `0x746f736869000000000000000000000000000000` (20bytes).

```js
const humanReadableStringToHexAddress = (humanReadableString) => {
  const addressLength = 40 // 20 bytes
  let hex = utf8ToHex(humanReadableString)
  if (hex.length > 40 + 2) throw Error(`Invalid human readable account length! It should be less than 20 bytes: ${hex}`)
  hex = rightPad(hex, addressLength)
  return hex
}
```

So above line was created.

ii) Should be possible to add humanreadable account to `accounts.wallet` instance.  
`caver.klay.accounts.wallet.add` function can have one more argument than before. Since human-readable address can't be achieved from private key from now on. So to add human-readable address with private key, You should use the API like below:  
`caver.klay.accounts.wallet.add(privateKey, 'toshi')`  
This will map 'toshi' address with the given private key.


```js
Wallet.prototype.add = function (account, humanReadableString) {
  // ...

  if (humanReadableString) {
    // utils.humanReadableStringToHexAddress('toshi') === '0x746f736869000000000000000000000000000000'
    const humanReadableAddress = utils.humanReadableStringToHexAddress(humanReadableString)
    account.address = humanReadableAddress

    const accountAlreadyExists = !!this[humanReadableAddress]

    if (accountAlreadyExists) return this[humanReadableAddress]

    account.index = this._findSafeIndex()
    this[account.index] = account

    this[humanReadableString] = account // this['toshi']
    this[humanReadableAddress] = account // this['0x746f736869000000000000000000000000000000']
    this[humanReadableAddress.toLowerCase()] = account
    this.length++
  }

  // ...
}
```
So above line was created.

iii) Removing, clearing wallet instance should consider human-readable address.
It was possible to remove a wallet instance by index or address by calling `caver.klay.accounts.wallet.remove(index)`, `caver.klay.accounts.wallet.clear()`. There were only 3 indexes for the wallet instance: `index`, `address`, `address.toLowerCase()`. After human-readable address features added, we should have one more index `humanReadableString`.  
For example, `caver.klay.accounts.wallet.add(privateKey, 'toshi')` should make an 4 indexes:
```js
caver.klay.accounts.wallet[0]
caver.klay.accounts.wallet['0x746f736869000000000000000000000000000000']
caver.klay.accounts.wallet['0x746f736869000000000000000000000000000000'] // lowercase
caver.klay.accounts.wallet['toshi']
```
which means we should consider `humanReadableString` index for removing and clearing also.

```js
// humanreadable string
const humanReadableString = utils.hexToUtf8(account.address)
if (this[humanReadableString]) {
  this[humanReadableString].privateKey = null
  delete this[humanReadableString]
}
```

So above line was created.

iv) Validating for address should consider human-readable address.

```js
var inputAddressFormatter = function (address) {

    var iban = new utils.Iban(address);
    if (iban.isValid() && iban.isDirect()) {
        return iban.toAddress().toLowerCase();
    } else if (utils.isAddress(address)) {
        return '0x' + address.toLowerCase().replace('0x','');
    } else if (utils.isHumanReadableString(address)) { // humanreadable address
        return utils.humanReadableStringToHexAddress(address)
    }
    throw new Error('Provided address "'+ address +'" is invalid, the capitalization checksum test failed, or its an indrect IBAN address which can\'t be converted.');
};
```
So above line was created.
