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
const Method = require('./packages/caver-core-method')
const middleware = require('./packages/caver-middleware')
const utils = require('./packages/caver-utils')
const formatters = require('./packages/caver-core-helpers').formatters
const helpers = require('./packages/caver-core-helpers')

const { version } = require('./package.json')

function Caver(provider, net) {
    this.use = middleware.registerMiddleware.bind(middleware)
    // sets _requestmanager etc
    packageInit(this, [provider, net])

    this.version = version
    this.utils = utils
    this.formatters = formatters
    this.helpers = helpers
    this.Method = Method

    // ex) call `onit.klay.property` || `onit.klay.method(...)`
    this.klay = new Klay(this)
    this.middleware = middleware

    // overwrite package setProvider
    const setProvider = this.setProvider
    this.setProvider = (p, n) => {
        setProvider.apply(this, [p, n])
        this.klay.setProvider(p, n)
        return true
    }
}

Caver.providers = providers

module.exports = Caver
module.exports.formatters = formatters
