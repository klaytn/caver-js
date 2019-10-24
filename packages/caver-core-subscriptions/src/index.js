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

    This file is derived from web3.js/packages/web3-core-subscriptions/src/index.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file index.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

const Subscription = require('./subscription.js')

function Subscriptions(options) {
    this.name = options.name
    this.type = options.type
    this.subscriptions = options.subscriptions || {}
    this.requestManager = null
}

Subscriptions.prototype.setRequestManager = function(requestManager) {
    this.requestManager = requestManager
}

Subscriptions.prototype.attachToObject = function(obj) {
    const func = this.buildCall()
    const name = this.name.split('.')
    if (name.length > 1) {
        obj[name[0]] = obj[name[0]] || {}
        obj[name[0]][name[1]] = func
    } else {
        obj[name[0]] = func
    }
}

Subscriptions.prototype.buildCall = function() {
    const _this = this

    return function() {
        if (!_this.subscriptions[arguments[0]]) {
            console.warn(`Subscription ${JSON.stringify(arguments[0])} doesn't exist. Subscribing anyway.`)
        }

        const subscription = new Subscription({
            subscription: _this.subscriptions[arguments[0]],
            requestManager: _this.requestManager,
            type: _this.type,
        })

        return subscription.subscribe.apply(subscription, arguments)
    }
}

module.exports = {
    subscriptions: Subscriptions,
    subscription: Subscription,
}
