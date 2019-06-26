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

    This file is derived from web3.js/packages/web3-eth-personal/src/index.js (2019/06/12).
    Modified and improved for the caver-js development.
*/
/**
 * @file index.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

var core = require('../../../caver-core');
var Method = require('../../../caver-core-method');
var utils = require('../../../caver-utils');
var Net = require('../../../caver-net');

var formatters = require('../../../caver-core-helpers').formatters;
const rpc = require('../../../caver-rtm').rpc

var Personal = function Personal(...args) {
    var _this = this;

    // sets _requestmanager
    core.packageInit(this, args);

    this.net = new Net(this.currentProvider);

    var defaultAccount = null;
    var defaultBlock = 'latest';

    Object.defineProperty(this, 'defaultAccount', {
        get: function () {
            return defaultAccount;
        },
        set: function (val) {
            if(val) {
              defaultAccount = utils.toChecksumAddress(formatters.inputAddressFormatter(val));
            }

            // update defaultBlock
            methods.forEach(function(method) {
                method.defaultAccount = defaultAccount;
            });

            return val;
        },
        enumerable: true
    });
    Object.defineProperty(this, 'defaultBlock', {
        get: function () {
            return defaultBlock;
        },
        set: function (val) {
          if (!utils.isValidBlockNumberCandidate(val)) {
            throw(new Error('Invalid default block number.'))
            return
          }
          defaultBlock = val;

          // update defaultBlock
          methods.forEach(function(method) {
              method.defaultBlock = defaultBlock;
          });

          return val;
        },
        enumerable: true
    });


    var methods = [
      rpc.personal.getAccounts,
      rpc.personal.newAccount,
      rpc.personal.unlockAccount,
      rpc.personal.lockAccount,
      rpc.personal.importRawKey,
      rpc.personal.sendTransaction,
      rpc.personal.signTransaction,
      rpc.personal.sign,
      rpc.personal.ecRecover,
      rpc.personal.replaceRawKey,
      rpc.personal.sendValueTransfer,
      rpc.personal.sendAccountUpdate,
    ];
    methods.forEach(function(method) {
        method.attachToObject(_this);
        method.setRequestManager(_this._requestManager);
        method.defaultBlock = _this.defaultBlock;
        method.defaultAccount = _this.defaultAccount;
    });
};

module.exports = Personal;
