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

    This file is derived from web3.js/packages/web3-eth/src/getNetworkType.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file getNetworkType.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

var _ = require('underscore');

var getNetworkType = function (callback) {
    var _this = this,
        id;

    return this.net.getId()
        .then(function (givenId) {

            id = givenId;

            return _this.getBlock(0);
        })
        .then(function (genesis) {
            var returnValue = 'private';

            if (genesis.hash === '0x2c4e9c507f8481b02c60e1f7b4a018c6a0b0681c61da917cde2450490ac21205' && id === 1001) {
                returnValue = 'baobab';
            }
            if (genesis.hash === '0xc72e5293c3c3ba38ed8ae910f780e4caaa9fb95e79784f7ab74c3c262ea7137e' && id === 8217) {
                returnValue = 'cypress';
            }

            if (_.isFunction(callback)) {
                callback(null, returnValue);
            }
            return returnValue;
        })
        .catch(function (err) {
            if (_.isFunction(callback)) {
                callback(err);
            } else {
                throw err;
            }
        });
};

module.exports = getNetworkType;
