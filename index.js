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
const Keyring = require('./packages/caver-wallet/src/keyring/keyringFactory')
const Transaction = require('./packages/caver-transaction')
const RPC = require('./packages/caver-rpc')
const abi = require('./packages/caver-abi')
const BaseContract = require('./packages/caver-contract')
const KCT = require('./packages/caver-kct')
const Validator = require('./packages/caver-validator')

const core = require('./packages/caver-core')
const Method = require('./packages/caver-core-method')
const middleware = require('./packages/caver-middleware')
const utils = require('./packages/caver-utils')
const formatters = require('./packages/caver-core-helpers').formatters
const helpers = require('./packages/caver-core-helpers')

const IPFS = require('./packages/caver-ipfs')

const { version } = require('./package.json')

function Caver(provider, net) {
    const _this = this

    this.use = middleware.registerMiddleware.bind(middleware)
    // sets _requestmanager etc
    packageInit(this, [provider, net])

    this.version = version
    this.utils = utils
    this.abi = abi
    this.formatters = formatters
    this.helpers = helpers
    this.Method = Method

    this.account = Account
    this.wallet = new KeyringContainer()
    this.wallet.keyring = Keyring

    this.transaction = Transaction

    // ex) call `caver.klay.property` || `caver.klay.method(...)`
    this.kct = new KCT(this)
    this.klay = new Klay(this)
    this.rpc = new RPC(this)
    this.validator = new Validator()

    this.middleware = middleware

    this.ipfs = new IPFS()

    // overwrite package setProvider
    const setProvider = this.setProvider
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

        // when caver.setProvider is called, call 'packageInit' all contract instances instantiated via this Caver instances.
        // This will update the currentProvider for the contract instances
        const _this = this // eslint-disable-line no-shadow
        const setProvider = self.setProvider // eslint-disable-line no-shadow
        self.setProvider = function() {
            setProvider.apply(self, arguments)
            core.packageInit(_this, [self])
        }
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

    this.contract = Contract
    this.contract._requestManager = this._requestManager
    this.contract.currentProvider = this._requestManager.provider
}

Caver.utils = utils
Caver.abi = abi
Caver.providers = providers

module.exports = Caver
module.exports.formatters = formatters
