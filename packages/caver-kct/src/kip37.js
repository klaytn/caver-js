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

const _ = require('lodash')
const BigNumber = require('bignumber.js')

const Contract = require('../../caver-contract')
const {
    kip37JsonInterface,
    kip37ByteCode,
    determineSendParams,
    formatParamForUint256,
    validateDeployParameterForKIP37,
} = require('./kctHelper')
const { isAddress, toBuffer, isHexStrict, toHex } = require('../../caver-utils')

class KIP37 extends Contract {
    /**
     * deploy deploys a KIP-37 token contract to Klaytn network.
     * `const deployedContract = await caver.kct.kip37.deploy({
     *      uri: ''
     *  }, '0x{address in hex}')`
     *
     * @method deploy
     * @param {Object} tokenInfo The object that defines the uri to deploy.
     * @param {string} deployer The address of the account to deploy the KIP-37 token contract.
     * @param {IWallet} [wallet] The wallet instance to sign and send a transaction.
     * @return {Object}
     */
    static deploy(tokenInfo, deployer, wallet) {
        validateDeployParameterForKIP37(tokenInfo)

        const { uri } = tokenInfo
        const kip37 = new KIP37()
        if (wallet !== undefined) kip37.setWallet(wallet)

        return kip37
            .deploy({
                data: kip37ByteCode,
                arguments: [uri],
            })
            .send({ from: deployer, gas: 7000000, value: 0 })
    }

    constructor(tokenAddress, abi = kip37JsonInterface) {
        if (tokenAddress) {
            if (_.isString(tokenAddress)) {
                if (!isAddress(tokenAddress)) throw new Error(`Invalid token address ${tokenAddress}`)
            } else {
                abi = tokenAddress
                tokenAddress = undefined
            }
        }
        super(abi, tokenAddress)
        this.setWallet(KIP37.wallet)
    }

    clone(tokenAddress = this.options.address) {
        const cloned = new this.constructor(tokenAddress, this.options.jsonInterface)
        cloned.setWallet(this._wallet)
        return cloned
    }

    async supportsInterface(interfaceId) {
        const isSupported = await this.methods.supportsInterface(interfaceId).call()
        return isSupported
    }

    /**
     * uri returns distinct Uniform Resource Identifier (URI) for a given token.
     *
     * @method uri
     * @param {BigNumber|string|number} id The token id to get uri.
     * @return {string}
     */
    async uri(id) {
        const uri = await this.methods.uri(formatParamForUint256(id)).call()
        return uri
    }

    /**
     * totalSupply returns the total supply of the specific token.
     *
     * @param {BigNumber|string|number} id The token id to see the total supply.
     * @method totalSupply
     * @return {BigNumber}
     */
    async totalSupply(id) {
        const totalSupply = await this.methods.totalSupply(formatParamForUint256(id)).call()
        return new BigNumber(totalSupply)
    }

    /**
     * balanceOf returns the balance of the account.
     *
     * @method balanceOf
     * @param {string} account The address of the account for which you want to see balance.
     * @param {BigNumber|string|number} id The token id to see balance.
     * @return {BigNumber}
     */
    async balanceOf(account, id) {
        const balance = await this.methods.balanceOf(account, formatParamForUint256(id)).call()
        return new BigNumber(balance)
    }

    /**
     * Batch returns the balance of multiple account/token pairs. `accounts` and `ids` must have the same length.
     *
     * @method balanceOfBatch
     * @param {Array.<string>} accounts The address of the accounts for which you want to see balance.
     * @param {Array.<BigNumber|string|number>} ids An array of ids of token you want to see balance.
     * @return {BigNumber}
     */
    async balanceOfBatch(accounts, ids) {
        if (ids.length !== accounts.length) throw new Error(`ids and accounts must have the same length.`)

        const formattedTokenIds = []
        for (let i = 0; i < ids.length; i++) {
            formattedTokenIds.push(formatParamForUint256(ids[i]))
        }

        const balances = await this.methods.balanceOfBatch(accounts, formattedTokenIds).call()

        const ret = []
        for (const bal of balances) {
            ret.push(new BigNumber(bal))
        }

        return ret
    }

    /**
     * isApprovedForAll returns true if an operator is approved by a given owner.
     *
     * @method isApprovedForAll
     * @param {string} owner The id of the token.
     * @param {string} operator The address of the operator.
     * @return {boolean}
     */
    async isApprovedForAll(owner, operator) {
        const isApprovedForAll = await this.methods.isApprovedForAll(owner, operator).call()
        return isApprovedForAll
    }

    /**
     * paused returns whether or not the token contract's transaction (or specific token) is paused.
     * If id is not defined, checks whether the token contract's transaction is paused.
     * If id is defined, checks whether the specific token is paused.
     *
     * @param {BigNumber|string|number} [id] The id of token to check wether paused or not.
     * @method paused
     * @return {boolean}
     */
    async paused(id) {
        const callObject = id !== undefined ? this.methods.paused(formatParamForUint256(id)) : this.methods.paused()
        const isPaused = await callObject.call()
        return isPaused
    }

    /**
     * isPauser returns whether the account is pauser or not.
     *
     * @method isPauser
     * @param {string} account The address of the account you want to check pauser or not.
     * @return {boolean}
     */
    async isPauser(account) {
        const isPauser = await this.methods.isPauser(account).call()
        return isPauser
    }

    /**
     * isMinter returns whether the account is minter or not.
     *
     * @method isMinter
     * @param {string} account The address of the account you want to check minter or not.
     * @return {boolean}
     */
    async isMinter(account) {
        const isMinter = await this.methods.isMinter(account).call()
        return isMinter
    }

    /**
     * mint creates token and assigns them to account, increasing the total supply.
     *
     * @method mint
     * @param {BigNumber|string|number} id The id of token to mint.
     * @param {BigNumber|string|number} initialSupply The amount of tokens being minted.
     * @param {string} uri The token URI of the created token.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async create(id, initialSupply, uri, sendParam = {}) {
        const executableObj = this.methods.create(formatParamForUint256(id), formatParamForUint256(initialSupply), uri)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * setApprovalForAll enables or disables approval for a third party ("operator") to manage all of the caller's tokens.
     * An operator is allowed to transfer all tokens of the sender on their behalf.
     *
     * @method setApprovalForAll
     * @param {string} operator The address to add to the set of authorized operators.
     * @param {boolean} approved True if the operator is approved, false to revoke approval.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async setApprovalForAll(operator, approved, sendParam = {}) {
        const executableObj = this.methods.setApprovalForAll(operator, approved)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * safeTransferFrom safely transfers the ownership of a given token id to another address.
     *
     * @method safeTransferFrom
     * @param {string} from The address of the owner or approved of the given token.
     * @param {string} to The address of the account to receive the token.
     * @param {BigNumber|string|number} id The id of token you want to transfer.
     * @param {BigNumber|string|number} amount The amount of tokens you want to transfer.
     * @param {Buffer|string|number} data The data to send along with the call.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async safeTransferFrom(from, to, id, amount, data, sendParam = {}) {
        if (!_.isBuffer(data)) {
            if (_.isString(data) && !isHexStrict(data)) data = toHex(data)
            data = toBuffer(data)
        }

        const executableObj = this.methods.safeTransferFrom(from, to, formatParamForUint256(id), formatParamForUint256(amount), data)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * safeBatchTransferFrom safely transfers the ownership of given token ids to another address.
     *
     * @method safeBatchTransferFrom
     * @param {string} from The address of the owner or approved of the given token.
     * @param {string} to The address of the account to receive the token.
     * @param {Array.<BigNumber|string|number>} ids An array of ids of token you want to transfer.
     * @param {Array.<BigNumber|string|number>} amounts An array of amount of tokens you want to transfer.
     * @param {Buffer|string|number} data The data to send along with the call.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async safeBatchTransferFrom(from, to, ids, amounts, data, sendParam = {}) {
        if (!_.isBuffer(data)) {
            if (_.isString(data) && !isHexStrict(data)) data = toHex(data)
            data = toBuffer(data)
        }

        if (ids.length !== amounts.length) throw new Error(`ids and amounts must have the same length.`)

        const formattedTokenIds = []
        const formattedTokenAmounts = []
        for (let i = 0; i < ids.length; i++) {
            formattedTokenIds.push(formatParamForUint256(ids[i]))
            formattedTokenAmounts.push(formatParamForUint256(amounts[i]))
        }

        const executableObj = this.methods.safeBatchTransferFrom(from, to, formattedTokenIds, formattedTokenAmounts, data)

        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * mint mints tokens of the specific token type `id` and assigns the tokens according to the variables `to` and `value`.
     *
     * @method mint
     * @param {string|Array.<string>} toList The address that will receive the minted tokens. If there are multiple to accounts, the values mapped to each to must also be an array.
     * @param {BigNumber|string|number} id The id of token to mint.
     * @param {BigNumber|string|number|Array.<BigNumber|string|number>} values The quantity of tokens being minted.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async mint(toList, id, values, sendParam = {}) {
        if (_.isArray(toList) !== _.isArray(values))
            throw new Error(`If you want to minting a specific token to multiple accounts, both toList and values both must be arrays.`)

        let executableObj
        if (_.isArray(toList)) {
            if (toList.length !== values.length) throw new Error(`toList and values must have the same length.`)

            const formattedTokenValues = []
            for (const val of values) {
                formattedTokenValues.push(formatParamForUint256(val))
            }

            executableObj = this.methods.mint(formatParamForUint256(id), toList, formattedTokenValues)
        } else {
            executableObj = this.methods.mint(formatParamForUint256(id), toList, formatParamForUint256(values))
        }

        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * mintBatch mints multiple KIP-37 tokens of the specific token types `ids` in a batch and assigns the tokens according to the variables `to` and `values`.
     *
     * @method mintBatch
     * @param {string} to The address that will receive the minted tokens.
     * @param {Array.<BigNumber|string|number>} ids The list of the token ids to mint.
     * @param {Array.<BigNumber|string|number>} values The list of the token amounts to mint.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async mintBatch(to, ids, values, sendParam = {}) {
        if (ids.length !== values.length) throw new Error(`ids and values must have the same length.`)

        const formattedTokenIds = []
        const formattedTokenValues = []
        for (let i = 0; i < ids.length; i++) {
            formattedTokenIds.push(formatParamForUint256(ids[i]))
            formattedTokenValues.push(formatParamForUint256(values[i]))
        }

        const executableObj = this.methods.mintBatch(to, formattedTokenIds, formattedTokenValues)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * addMinter adds an account as a minter that has the permission of MinterRole and can mint.
     * The account sending transaction to execute the addMinter must be a Minter with a MinterRole.
     *
     * @method addMinter
     * @param {string} account The address of account to add as minter.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async addMinter(account, sendParam = {}) {
        const executableObj = this.methods.addMinter(account)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * renounceMinter renounces privilege of MinterRole.
     * The account sending transaction to execute the renounceMinter must be a Minter with a MinterRole.
     *
     * @method renounceMinter
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async renounceMinter(sendParam = {}) {
        const executableObj = this.methods.renounceMinter()
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * burn destroys specific KIP37 tokens.
     *
     * @method burn
     * @param {string} account The account that owns tokens.
     * @param {BigNumber|string|number} id The token id to burn.
     * @param {BigNumber|string|number} value The token amount to burn.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async burn(account, id, value, sendParam = {}) {
        const executableObj = this.methods.burn(account, formatParamForUint256(id), formatParamForUint256(value))
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * burnBatch burns multiple KIP37 tokens.
     *
     * @method burnBatch
     * @param {string} account The account that owns tokens.
     * @param {Array.<BigNumber|string|number>} ids The list of the token ids to burn.
     * @param {Array.<BigNumber|string|number>} values The list of the token amounts to burn.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async burnBatch(account, ids, values, sendParam = {}) {
        if (ids.length !== values.length) throw new Error(`ids and values must have the same length.`)

        const formattedTokenIds = []
        const formattedTokenValues = []
        for (let i = 0; i < ids.length; i++) {
            formattedTokenIds.push(formatParamForUint256(ids[i]))
            formattedTokenValues.push(formatParamForUint256(values[i]))
        }

        const executableObj = this.methods.burnBatch(account, formattedTokenIds, formattedTokenValues)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * pause pauses actions related to transfer and approval.
     * If id is not defined, pauses the token contract.
     * If id is defined, pauses the specific token.
     * The account sending transaction to execute the pause must be a Pauser with a PauserRole.
     *
     * @method pause
     * @param {BigNumber|string|number} [id] The id of token to pause.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async pause(id, sendParam = {}) {
        if (Object.keys(sendParam).length === 0 && _.isObject(id)) {
            sendParam = id
            id = undefined
        }

        const executableObj = id !== undefined ? this.methods.pause(formatParamForUint256(id)) : this.methods.pause()
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * unpause resumes from the paused state.
     * If id is not defined, unpauses the token contract.
     * If id is defined, unpauses the specific token.
     * The account sending transaction to execute the unpause must be a Pauser with a PauserRole.
     *
     * @method unpause
     * @param {BigNumber|string|number} [id] The id of token to unpause.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async unpause(id, sendParam = {}) {
        if (Object.keys(sendParam).length === 0 && _.isObject(id)) {
            sendParam = id
            id = undefined
        }

        const executableObj = id !== undefined ? this.methods.unpause(formatParamForUint256(id)) : this.methods.unpause()
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * addPauser adds an account as a pauser that has the permission of PauserRole and can pause.
     * The account sending transaction to execute the addPauser must be a Pauser with a PauserRole.
     *
     * @method addPauser
     * @param {string} account The address of account to add as pauser.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async addPauser(account, sendParam = {}) {
        const executableObj = this.methods.addPauser(account)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * renouncePauser renounces privilege of PauserRole.
     * The account sending transaction to execute the renouncePauser must be a Pauser with a PauserRole.
     *
     * @method renouncePauser
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async renouncePauser(sendParam = {}) {
        const executableObj = this.methods.renouncePauser()
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }
}

module.exports = KIP37
