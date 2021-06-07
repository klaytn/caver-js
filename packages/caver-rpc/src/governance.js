/*
    Copyright 2021 The caver-js Authors
    This file is part of the caver-js library.

    The caver-js library is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    The caver-js library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with the caver-js. If not, see <http://www.gnu.org/licenses/>.
*/

const core = require('../../caver-core/src')
const { formatters } = require('../../caver-core-helpers')
const Method = require('../../caver-core-method/src')

const utils = require('../../caver-utils')

/**
 * A class that can invoke Governance RPC Calls.
 * @class
 */
const GovernanceRPC = function GovernanceRPC(...args) {
    const _this = this

    core.packageInit(this, args)

    const govMethods = [
        new Method({
            name: 'vote',
            call: 'governance_vote',
            params: 2,
        }),
        new Method({
            name: 'showTally',
            call: 'governance_showTally',
            params: 0,
        }),
        new Method({
            name: 'getTotalVotingPower',
            call: 'governance_totalVotingPower',
            outputFormatter: formatters.outputVotingPowerFormatter,
            params: 0,
        }),
        new Method({
            name: 'getMyVotingPower',
            call: 'governance_myVotingPower',
            outputFormatter: formatters.outputVotingPowerFormatter,
            params: 0,
        }),
        new Method({
            name: 'getMyVotes',
            call: 'governance_myVotes',
            params: 0,
        }),
        new Method({
            name: 'getChainConfig',
            call: 'governance_chainConfig',
            params: 0,
        }),
        new Method({
            name: 'getNodeAddress',
            call: 'governance_nodeAddress',
            params: 0,
        }),
        new Method({
            name: 'getItemsAt',
            call: 'governance_itemsAt',
            params: 1,
            inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
        }),
        new Method({
            name: 'getPendingChanges',
            call: 'governance_pendingChanges',
            params: 0,
        }),
        new Method({
            name: 'getVotes',
            call: 'governance_votes',
            params: 0,
        }),
        new Method({
            name: 'getIdxCache',
            call: 'governance_idxCache',
            params: 0,
        }),
        new Method({
            name: 'getIdxCacheFromDb',
            call: 'governance_idxCacheFromDb',
            params: 0,
        }),
        new Method({
            name: 'getItemCacheFromDb',
            call: 'governance_itemCacheFromDb',
            params: 1,
            inputFormatter: [utils.numberToHex],
        }),
        new Method({
            name: 'getStakingInfo',
            call: 'governance_getStakingInfo',
            params: 1,
            inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
        }),
    ]

    govMethods.forEach(function(method) {
        method.attachToObject(_this)
        method.setRequestManager(_this._requestManager)
    })
}

module.exports = GovernanceRPC
