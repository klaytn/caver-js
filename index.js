/*
    Modifications copyright 2018 The caver-js Authors
    This file is part of the web3.js library.

    The web3.js library is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    The web3.js library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with the web3.js. If not, see <http://www.gnu.org/licenses/>.

    This file is derived from web3.js/packages/web3/src/index.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file index.js
 * @authors:
 *   Fabian Vogelsteller <fabian@ethereum.org>
 *   Gav Wood <gav@parity.io>
 *   Jeffrey Wilcke <jeffrey.wilcke@ethereum.org>
 *   Marek Kotewicz <marek@parity.io>
 *   Marian Oancea <marian@ethereum.org>
 * @date 2017
 */

global.rootRequire = name => require(`${__dirname}/packages/${name}/src/index.js`)

const { packageInit, providers } = require('./packages/caver-core')
const Klay = require('./packages/caver-klay')
const Account = require('./packages/caver-account')
const KeyringContainer = require('./packages/caver-wallet')
const Transaction = require('./packages/caver-transaction')
const RPC = require('./packages/caver-rpc')
const abi = require('./packages/caver-abi')
const BaseContract = require('./packages/caver-contract')
const KCT = require('./packages/caver-kct')
const Validator = require('./packages/caver-validator')

const core = require('./packages/caver-core')
const middleware = require('./packages/caver-middleware')
const utils = require('./packages/caver-utils')
const formatters = require('./packages/caver-core-helpers').formatters

const IPFS = require('./packages/caver-ipfs')

const { version } = require('./package.json')

/**
 * A caver class implemented to use Klaytn easily.
 *
 * @example
 * const Caver = require('caver-js')
 * const caver = new Caver('http://{your en url}:{port}')
 *
 * // If you want to create a provider, you can do like below.
 * const httpProvider = new Caver.providers.HttpProvider('http://{your en url}:{port}')
 * const caver = new Caver(httpProvider)
 *
 * // Use websocket provider with Caver.
 * const websocketProvider = new Caver.providers.WebsocketProvider('ws://{your en url}:{port}')
 * const caver = new Caver(websocketProvider)
 * caver.currentProvider.connection.close()
 *
 * @class
 * @constructor
 * @param {string|HttpProvider|WebsocketProvider|IpcProvider} [provider] - The url string of the Node to connect with. You can pass the provider instance directly.
 */
function Caver(provider, net) {
    const _this = this

    this.use = middleware.registerMiddleware.bind(middleware)
    // sets _requestmanager etc
    packageInit(this, [provider, net])

    /** @type {string} */
    this.version = version

    /** @type {module:utils} */
    this.utils = utils
    /** @type {typeof Account} */
    this.account = Account

    /** @type {ABI} */
    this.abi = abi
    /** @type {KeyringContainer} */
    this.wallet = new KeyringContainer()

    // ex) call `caver.klay.property` || `caver.klay.method(...)`
    /** @type {KCT} */
    this.kct = new KCT(this)
    this.klay = new Klay(this)
    /** @type {RPC} */
    this.rpc = new RPC(this)

    /** @type {Validator} */
    this.validator = new Validator(this.rpc.klay.klaytnCall)
    /** @type {module:Transaction} */
    this.transaction = new Transaction(this.rpc.klay.klaytnCall)

    /** @type {IPFS} */
    this.ipfs = new IPFS()

    // overwrite package setProvider
    const setProvider = this.setProvider
    /**
     * Changes the current provider of the Caver.
     * You can access the provider's constructor via `const Caver = require('caver-js'); const provider = new Caver.providers.XXXProvider('...')`.
     *
     * @example
     * const isSet = caver.setProvider('http://{your en url}:{port}')
     * const isSet = caver.setProvider(new Caver.providers.HttpProvider('http://{your en url}:{port}'))
     *
     * const isSet = caver.setProvider('ws://{your en url}:{port}')
     * const isSet = caver.setProvider(new Caver.providers.WebsocketProvider('http://{your en url}:{port}'))
     *
     * @param {string|HttpProvider|WebsocketProvider|IpcProvider} p - The url string of the Node or the provider instance.
     * @return {boolean} `true` means provider is set successfully.
     */
    this.setProvider = (p, n) => {
        setProvider.apply(this, [p, n])
        _this.klay.setRequestManager(_this._requestManager)
        _this.rpc.setRequestManager(_this._requestManager)
        _this.kct.setRequestManager(_this._requestManager)
        _this.contract._requestManager = _this._requestManager
        _this.contract.currentProvider = _this._provider
        return true
    }

    const self = this
    const Contract = function Contract() {
        BaseContract.apply(this, arguments)

        core.packageInit(this, [self])
        this.setWallet(self.wallet)
    }

    Contract.create = function() {
        // With `caver.contract`, `caver.wallet` must be set in the `contarct._wallet`,
        // so the Contract constructor defined above must be called here.
        return new Contract(...arguments)
    }

    Contract.setProvider = function() {
        BaseContract.setProvider.apply(this, arguments)
    }

    Contract.prototype = Object.create(BaseContract.prototype)
    Contract.prototype.constructor = Contract

    /** @type {typeof Contract} */
    this.contract = Contract
    this.contract._requestManager = this._requestManager
    this.contract.currentProvider = this._requestManager.provider
}

/**
 * @type {module:utils}
 *
 * @example
 * const utils = require('caver-js').utils
 * */
Caver.utils = utils

/**
 * @type {ABI}
 *
 * @example
 * const abi = require('caver-js').abi
 * */
Caver.abi = abi

/**
 * The account key types which are used in the `caver.account` package.
 *
 * @typedef {object} Caver.Providers
 * @property {typeof WebsocketProvider} WebsocketProvider - Class representing WebsocketProvider.
 * @property {typeof HttpProvider} HttpProvider - Class representing HttpProvider.
 * @property {typeof IpcProvider} IpcProvider - Class representing IpcProvider.
 */
/**
 * @type {Caver.Providers}
 *
 * @example
 * const providers = require('./index').providers
 * */
Caver.providers = providers

module.exports = Caver
module.exports.formatters = formatters
