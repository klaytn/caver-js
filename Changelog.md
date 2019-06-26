## 0.0.1
- Declare rpc call's `inputFormatter`, `outputFormatter`, `transformPayload` as a string type.
- Move long rpc call list on `eth` to `rpc.js`(newly added)
- extends `formatters.js` module by adding `toChecksumAddress`, `numberToHex` functions from  `utils`
- extends `formatters.js` module by importing `payloadTransformer.js` file.
- Moves `promievent`, `iban` modules to `utils`
- Moves `abi`, `accounts`, `contract`, `personal` modules to `eth`
- Moves `httpProvider`, `wsProvider`, `ipcProvider` modules to `requestManager`
- Moves `index.js`(main file) to root folder.
- Remove `shh`(whisper), `bzz`(swarm) modules.
- Remove `inputFormatter: [null]` structures on rpc.js (Doesn't need to have a inputFormatter when it actually doesn't need it.)
- Additional check logic(`_.isEmpty(this.inputFormatter)`) for `formatInput` logic in `core-method`
- Add `toBoolean` function in `formatters`
- Solves `Failed to check for transaction receipt` error.

## 0.0.1h
- Change `rpc.js` to `rpc.json`.
- Add property `hexCall` for rpc call. (It can covers parameter dynamically according to parameter type.)
- Add `isHexParameter` function in `utils`
- cli list support

## 0.0.1i
- Removed `extend.js`
- Removed `givenProvider.js`
- Removed `addProviders` function in caver-core
