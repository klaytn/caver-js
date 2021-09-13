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
 * @hideconstructor
 */
const Governance = function Governance(...args) {
    const _this = this

    core.packageInit(this, args)

    const govMethods = [
        /**
         * Submits a new vote. If the node has the right to vote based on the governance mode, the vote can be submitted. If not, an error will occur and the vote will be ignored.
         *
         * @memberof Governance
         * @method vote
         * @instance
         *
         * @example
         * const result = await caver.rpc.governance.vote('governance.governancemode', 'ballot')
         *
         * @param {string} key Name of the configuration setting to be changed. Key has the form "domain.field".
         * @param {string|number|boolean} value Various types of value for each key.
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<string>} Result of vote submission.
         */
        new Method({
            name: 'vote',
            call: 'governance_vote',
            params: 2,
        }),
        /**
         * An object defines the vote's value and the approval rate in percentage.
         *
         * @typedef {object} Governance.TallyItem
         * @property {string} Key - The name of the vote.
         * @property {*} Value - The value of the vote.
         * @property {number} ApprovalPercentage - The approval rate in percentage.
         */
        /**
         * Submits a new vote. If the node has the right to vote based on the governance mode, the vote can be submitted. If not, an error will occur and the vote will be ignored.
         *
         * @memberof Governance
         * @method showTally
         * @instance
         *
         * @example
         * const result = await caver.rpc.governance.showTally()
         *
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<Array.<Governance.TallyItem>>} An array containing the vote's value and the approval rate in percentage.
         */
        new Method({
            name: 'showTally',
            call: 'governance_showTally',
            params: 0,
        }),
        /**
         * Provides the sum of all voting power that CNs have. Each CN has 1.0 ~ 2.0 voting power.
         * In the "none" and "single" governance modes, totalVotingPower doesn't provide any information.
         *
         * @memberof Governance
         * @method getTotalVotingPower
         * @instance
         *
         * @example
         * const result = await caver.rpc.governance.getTotalVotingPower()
         *
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<number>} Total Voting Power.
         */
        new Method({
            name: 'getTotalVotingPower',
            call: 'governance_totalVotingPower',
            outputFormatter: formatters.outputVotingPowerFormatter,
            params: 0,
        }),
        /**
         * Provides the voting power of the node. The voting power can be anywhere between 1.0 ~ 2.0.
         * In the "none" and "single" governance modes, totalVotingPower doesn't provide any information.
         *
         * @memberof Governance
         * @method getMyVotingPower
         * @instance
         *
         * @example
         * const result = await caver.rpc.governance.getMyVotingPower()
         *
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<number>} Node's Voting Power.
         */
        new Method({
            name: 'getMyVotingPower',
            call: 'governance_myVotingPower',
            outputFormatter: formatters.outputVotingPowerFormatter,
            params: 0,
        }),
        /**
         * An object defines the vote's value and the approval rate in percentage for my votes.
         *
         * @typedef {object} Governance.MyVote
         * @property {string} Key - The name of the vote.
         * @property {*} Value - The value of the vote.
         * @property {boolean} Casted - If this vote is stored in a block or not
         * @property {number} BlockNum - The block number that this vote is stored
         */
        /**
         * Provides my vote information in the epoch.
         * Each vote is stored in a block when the user's node generates a new block.
         * After current epoch ends, this information is cleared.
         *
         * @memberof Governance
         * @method getMyVotes
         * @instance
         *
         * @example
         * const result = await caver.rpc.governance.getMyVotes()
         *
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<Array.<MyVote>>} Node's Voting status in the epoch
         */
        new Method({
            name: 'getMyVotes',
            call: 'governance_myVotes',
            params: 0,
        }),
        /**
         * Provides the initial chain configuration.
         * Because it just stores the initial configuration, if there were changes in the governance made by voting, the result of chainConfig will differ from the current states.
         * To see the current information, please use {@link itemsAt}.
         *
         * @memberof Governance
         * @method getChainConfig
         * @instance
         *
         * @example
         * const result = await caver.rpc.governance.getChainConfig()
         *
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<object>} The initial chain configuration
         */
        new Method({
            name: 'getChainConfig',
            call: 'governance_chainConfig',
            params: 0,
        }),
        /**
         * Provides the address of the node that a user is using.
         * It is derived from the nodekey and used to sign consensus messages.
         * And the value of "governingnode" has to be one of validator's node address.
         *
         * @memberof Governance
         * @method getNodeAddress
         * @instance
         *
         * @example
         * const result = await caver.rpc.governance.getNodeAddress()
         *
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<string>} The address of a node
         */
        new Method({
            name: 'getNodeAddress',
            call: 'governance_nodeAddress',
            params: 0,
        }),
        /**
         * Returns governance items at a specific block.
         * It is the result of previous voting of the block and used as configuration for chain at the given block number.
         *
         * @memberof Governance
         * @method getItemsAt
         * @instance
         *
         * @example
         * const result = await caver.rpc.governance.getItemsAt()
         *
         * @param {string|number} [blockNumberOrTag] A block number, or the string `latest` or `earliest`. If omitted, `latest` will be used.
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<object>} The governance items.
         */
        new Method({
            name: 'getItemsAt',
            call: 'governance_itemsAt',
            params: 1,
            inputFormatter: [formatters.inputDefaultBlockNumberFormatter],
        }),
        /**
         * Returns the list of items that have received enough number of votes but not yet finalized.
         * At the end of the current epoch, these changes will be finalized and the result will be in effect from the epoch after next epoch.
         *
         * @memberof Governance
         * @method getPendingChanges
         * @instance
         *
         * @example
         * const result = await caver.rpc.governance.getPendingChanges()
         *
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<object>} Currently pending changes composed of keys and values.
         */
        new Method({
            name: 'getPendingChanges',
            call: 'governance_pendingChanges',
            params: 0,
        }),
        /**
         * An object defines the vote's value and the approval rate in percentage.
         *
         * @typedef {object} Governance.Vote
         * @property {string} key - The name of the vote.
         * @property {*} value - The value of the vote.
         * @property {string} validator - The node address.
         */
        /**
         * Returns the votes from all nodes in the epoch. These votes are gathered from the header of each block.
         *
         * @memberof Governance
         * @method getVotes
         * @instance
         *
         * @example
         * const result = await caver.rpc.governance.getVotes()
         *
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<Array.<Governance.Vote>>} Current votes composed of keys, values and node addresses.
         */
        new Method({
            name: 'getVotes',
            call: 'governance_votes',
            params: 0,
        }),
        /**
         * Returns an array of current idxCache in the memory cache.
         * idxCache contains the block numbers where governance change happened. The cache can have up to 1000 block numbers in memory by default.
         *
         * @memberof Governance
         * @method getIdxCache
         * @instance
         *
         * @example
         * const result = await caver.rpc.governance.getIdxCache()
         *
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<Array.<number>>} Block numbers where governance change happened.
         */
        new Method({
            name: 'getIdxCache',
            call: 'governance_idxCache',
            params: 0,
        }),
        /**
         * Returns an array that contains all block numbers at which any governance changes ever took place.
         * The result of `idxCacheFromDb` is the same or longer than that of {@link idxCache}.
         *
         * @memberof Governance
         * @method getIdxCacheFromDb
         * @instance
         *
         * @example
         * const result = await caver.rpc.governance.getIdxCacheFromDb()
         *
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<Array.<number>>} Block numbers where governance change happened.
         */
        new Method({
            name: 'getIdxCacheFromDb',
            call: 'governance_idxCacheFromDb',
            params: 0,
        }),
        /**
         * Returns the governance information stored on the given block.
         * If no changes are stored on the given block, the function returns `null`.
         *
         * @memberof Governance
         * @method getIdxCacheFromDb
         * @instance
         *
         * @example
         * const result = await caver.rpc.governance.getIdxCacheFromDb()
         *
         * @param {number|string} blockNumber A block number, or the hex number string to query the governance change made on the block.
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<object>} Stored governance information at a given block.
         */
        new Method({
            name: 'getItemCacheFromDb',
            call: 'governance_itemCacheFromDb',
            params: 1,
            inputFormatter: [utils.numberToHex],
        }),
        /**
         * Returns the staking information at a specific block.
         *
         * @memberof Governance
         * @method getStakingInfo
         * @instance
         *
         * @example
         * const result = await caver.rpc.governance.getStakingInfo()
         *
         * @param {string|number} [blockNumberOrTag] A block number, or the string `latest` or `earliest`. If omitted, `latest` will be used.
         * @param {function} [callback] Optional callback, returns an error object as the first parameter and the result as the second.
         * @return {Promise<object>} Stored governance information at a given block.
         */
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

module.exports = Governance
