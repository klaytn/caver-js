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

    This file is derived from web3.js/packages/web3-core/src/index.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file index.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

const { Manager, BatchManager } = require('../../caver-core-requestmanager')

module.exports = {
    packageInit: function(pkg, args) {
        if (!pkg) throw new Error('You need to instantiate using the "new" keyword.')

        // make property of pkg._provider, which can properly set providers
        Object.defineProperty(pkg, 'currentProvider', {
            get: function() {
                return pkg._requestManager.provider
            },
            set: function(value) {
                pkg.setProvider(value)
            },
            enumerable: true,
            configurable: true,
        })

        // make property of pkg._provider, which can properly set providers
        Object.defineProperty(pkg, '_provider', {
            get: function() {
                return pkg._requestManager.provider
            },
            set: function(value) {
                pkg.setProvider(value)
            },
            enumerable: true,
            configurable: true,
        })

        // inherit from parent package or create a new RequestManager
        if (args[0] && args[0]._requestManager) {
            pkg._requestManager = args[0]._requestManager
        } else {
            pkg._requestManager = new Manager(args[0], args[1])
        }

        pkg.providers = Manager.providers

        // add SETPROVIDER function (don't overwrite if already existing)
        if (!pkg.setProvider) {
            pkg.setProvider = function(provider, net) {
                pkg._requestManager.setProvider(provider, net)
                return true
            }
        }

        pkg.setRequestManager = function(manager) {
            pkg._requestManager = manager
        }

        // attach batch request creation
        pkg.BatchRequest = BatchManager.bind(null, pkg._requestManager)
    },
    providers: Manager.providers,
}
