# caver-klay-abi

This is a sub package of [caver-js][repo]

This is the abi package to be used in the `caver-klay` package.
Please read the [documentation][docs] for more.

## Installation

### Node.js

```bash
npm install caver-klay-abi
```

### In the Browser

Build running the following in the [caver-js][repo] repository:

```bash
npm run-script build-all
```

Then include `dist/caver-klay-abi.js` in your html file.
This will expose the `caverKlayAbi` object on the window object.


## Usage

```js
// in node.js
var caverKlayAbi = require('caver-klay-abi');

caverKlayAbi.encodeFunctionSignature('myMethod(uint256,string)');
> '0x24ee0097'
```
