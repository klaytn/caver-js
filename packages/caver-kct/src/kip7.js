/*
    Copyright 2020 The caver-js Authors
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
    validateDeployParameterForKIP7,
    determineSendParams,
    kip7JsonInterface,
    kip7ByteCode,
    formatParamForUint256,
} = require('./kctHelper')
const { isAddress, toBuffer, isHexStrict, toHex } = require('../../caver-utils')

class KIP7 extends Contract {
    /**
     * deploy deploys a KIP-7 token contract to Klaytn network.
     * `const deployedContract = await caver.klay.KIP7.deploy({
     *      name: 'TokenName',
     *      symbol: 'TKN',
     *      decimals: 18,
     *      initialSupply: new BigNumber(1000000000000000000),
     *  }, '0x{address in hex}')`
     *
     * @method deploy
     * @param {Object} tokenInfo The object that defines the name, symbol, decimals, and initialSupply of the token to deploy.
     * @param {String} privateKey The address of the account to deploy the KIP-7 token contract.
     * @return {Object}
     */
    static deploy(tokenInfo, deployer) {
        validateDeployParameterForKIP7(tokenInfo)

        const { name, symbol, decimals, initialSupply } = tokenInfo
        const kip7 = new KIP7()

        return kip7
            .deploy({
                data: kip7ByteCode,
                arguments: [name, symbol, decimals, initialSupply],
            })
            .send({ from: deployer, gas: 4000000, value: 0 })
    }

    constructor(tokenAddress, abi = kip7JsonInterface) {
        if (tokenAddress) {
            if (_.isString(tokenAddress)) {
                if (!isAddress(tokenAddress)) throw new Error(`Invalid token address ${tokenAddress}`)
            } else {
                abi = tokenAddress
                tokenAddress = undefined
            }
        }

        super(abi, tokenAddress)
    }

    /**
     * clone copies a KIP7 instance with the new address parameter set to the target contract address.
     *
     * @method clone
     * @param {String} tokenAddress The address of the token contract.
     * @return {Object}
     */
    clone(tokenAddress = this.options.address) {
        return new this.constructor(tokenAddress, this.options.jsonInterface)
    }

    /**
     * supportsInterface checks whether interface is supported or not.
     *
     * @method supportsInterface
     * @return {Boolean}
     */
    async supportsInterface(interfaceId) {
        const supported = await this.methods.supportsInterface(interfaceId).call()
        return supported
    }

    /**
     * name returns the name of the token.
     *
     * @method name
     * @return {String}
     */
    async name() {
        const name = await this.methods.name().call()
        return name
    }

    /**
     * symbol returns the symbol of the token.
     *
     * @method symbol
     * @return {String}
     */
    async symbol() {
        const symbol = await this.methods.symbol().call()
        return symbol
    }

    /**
     * decimals returns the decimals of the token.
     *
     * @method symbol
     * @return {Number}
     */
    async decimals() {
        const decimals = await this.methods.decimals().call()
        return Number(decimals)
    }

    /**
     * totalSupply returns the total supply of the token.
     *
     * @method totalSupply
     * @return {BigNumber}
     */
    async totalSupply() {
        const totalSupply = await this.methods.totalSupply().call()
        return new BigNumber(totalSupply)
    }

    /**
     * balanceOf returns the balance of the account.
     *
     * @method balanceOf
     * @param {String} account The address of the account for which you want to see balance.
     * @return {BigNumber}
     */
    async balanceOf(account) {
        const balance = await this.methods.balanceOf(account).call()
        return new BigNumber(balance)
    }

    /**
     * allowance returns the amount the spender is allowed to use on behalf of the owner.
     *
     * @method allowance
     * @param {String} owner The address of the account that set the spender to use the money on behalf of the owner.
     * @param {String} spender The address of the account that received the approve amount that can be used on behalf of the owner.
     * @return {BigNumber}
     */
    async allowance(owner, spender) {
        const allowance = await this.methods.allowance(owner, spender).call()
        return new BigNumber(allowance)
    }

    /**
     * isMinter returns whether the account is minter or not.
     *
     * @method isMinter
     * @param {String} account The address of the account you want to check minter or not.
     * @return {Boolean}
     */
    async isMinter(account) {
        const isMinter = await this.methods.isMinter(account).call()
        return isMinter
    }

    /**
     * isPauser returns whether the account is pauser or not.
     *
     * @method isPauser
     * @param {String} account The address of the account you want to check pauser or not.
     * @return {Boolean}
     */
    async isPauser(account) {
        const isPauser = await this.methods.isPauser(account).call()
        return isPauser
    }

    /**
     * paused returns whether or not the token contract's transaction is paused.
     *
     * @method paused
     * @return {Boolean}
     */
    async paused() {
        const isPaused = await this.methods.paused().call()
        return isPaused
    }

    /**
     * approve sets amount as the allowance of spender over the caller’s tokens.
     *
     * @method approve
     * @param {String} spender The address of the account to use on behalf of owner for the amount to be set in allowance.
     * @param {BigNumber|String|Number} amount The amount of tokens the spender allows to use on behalf of the owner.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async approve(spender, amount, sendParam = {}) {
        const executableObj = this.methods.approve(spender, formatParamForUint256(amount))
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * transfer moves amount tokens from the caller’s account to recipient.
     *
     * @method transfer
     * @param {String} recipient The address of the account to receive the token.
     * @param {BigNumber|String|Number} amount The amount of tokens you want to transfer.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async transfer(recipient, amount, sendParam = {}) {
        const executableObj = this.methods.transfer(recipient, formatParamForUint256(amount))
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * transferFrom moves amount tokens from sender to recipient using the allowance mechanism.
     * amount is then deducted from the caller’s allowance.
     *
     * @method transferFrom
     * @param {String} sender The address of the account that owns the token to be sent with allowance mechanism.
     * @param {String} recipient The address of the account to receive the token.
     * @param {BigNumber|String|Number} amount The amount of tokens you want to transfer.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async transferFrom(sender, recipient, amount, sendParam = {}) {
        const executableObj = this.methods.transferFrom(sender, recipient, formatParamForUint256(amount))
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * safeTransfer safely transfers tokens to another address.
     *
     * @method safeTransfer
     * @param {String} recipient The address of the account to receive the token.
     * @param {BigNumber|String|Number} amount The amount of tokens you want to transfer.
     * @param {Buffer|String|Number} data The optional data to send along with the call.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async safeTransfer(recipient, amount, data, sendParam = {}) {
        if (data && _.isObject(data)) {
            if (data.gas !== undefined || data.from !== undefined) {
                if (Object.keys(sendParam).length > 0) throw new Error(`Invalid parameters`)
                sendParam = data
                data = undefined
            }
        }

        if (data && !_.isBuffer(data)) {
            if (_.isString(data) && !isHexStrict(data)) data = toHex(data)
            data = toBuffer(data)
        }

        const executableObj = data
            ? this.methods.safeTransfer(recipient, formatParamForUint256(amount), data)
            : this.methods.safeTransfer(recipient, formatParamForUint256(amount))

        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * safeTransferFrom safely transfers tokens to another address.
     *
     * @method safeTransferFrom
     * @param {String} sender The address of the account that owns the token to be sent with allowance mechanism.
     * @param {String} recipient The address of the account to receive the token.
     * @param {BigNumber|String|Number} amount The amount of tokens you want to transfer.
     * @param {Buffer|String|Number} data The optional data to send along with the call.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async safeTransferFrom(sender, recipient, amount, data, sendParam = {}) {
        if (data && _.isObject(data)) {
            if (data.gas !== undefined || data.from !== undefined) {
                if (Object.keys(sendParam).length > 0) throw new Error(`Invalid parameters`)
                sendParam = data
                data = undefined
            }
        }

        if (data && !_.isBuffer(data)) {
            if (_.isString(data) && !isHexStrict(data)) data = toHex(data)
            data = toBuffer(data)
        }

        const executableObj = data
            ? this.methods.safeTransferFrom(sender, recipient, formatParamForUint256(amount), data)
            : this.methods.safeTransferFrom(sender, recipient, formatParamForUint256(amount))

        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * mint creates amount tokens and assigns them to account, increasing the total supply.
     * The account sending transaction to execute the addMinter must be a Minter with a MinterRole.
     *
     * @method mint
     * @param {String} account The address of the account to which the minted token will be allocated.
     * @param {BigNumber|String|Number} amount The amount of tokens to mint.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async mint(account, amount, sendParam = {}) {
        const executableObj = this.methods.mint(account, formatParamForUint256(amount))
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * addMinter adds an account as a minter that has the permission of MinterRole and can mint.
     * The account sending transaction to execute the addMinter must be a Minter with a MinterRole.
     *
     * @method addMinter
     * @param {String} account The address of account to add as minter.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
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
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async renounceMinter(sendParam = {}) {
        const executableObj = this.methods.renounceMinter()
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * burn destroys amount tokens from the caller.
     *
     * @method burn
     * @param {BigNumber|String|Number} amount The amount of tokens to destroy.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async burn(amount, sendParam = {}) {
        const executableObj = this.methods.burn(formatParamForUint256(amount))
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * burnFrom destroys amount tokens from account is then deducted from the caller’s allowance.
     *
     * @method burnFrom
     * @param {String} account The address of the account that owns the token to be burned with allowance mechanism.
     * @param {BigNumber|String|Number} amount The amount of tokens to destroy.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async burnFrom(account, amount, sendParam = {}) {
        const executableObj = this.methods.burnFrom(account, formatParamForUint256(amount))
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * addPauser adds an account as a pauser that has the permission of PauserRole and can pause.
     * The account sending transaction to execute the addPauser must be a Pauser with a PauserRole.
     *
     * @method addPauser
     * @param {String} account The address of account to add as pauser.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async addPauser(account, sendParam = {}) {
        const executableObj = this.methods.addPauser(account)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * pause triggers stopped state that stops sending tokens in emergency situation.
     * The account sending transaction to execute the pause must be a Pauser with a PauserRole.
     *
     * @method pause
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async pause(sendParam = {}) {
        const executableObj = this.methods.pause()
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * unpause sets amount as the allowance of spender over the caller’s tokens.
     * The account sending transaction to execute the unpause must be a Pauser with a PauserRole.
     *
     * @method unpause
     * @param {String} spender The address of the account to use on behalf of owner for the amount to be set in allowance.
     * @param {BigNumber|String|Number} amount The amount of tokens the spender allows to use on behalf of the owner.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async unpause(sendParam = {}) {
        const executableObj = this.methods.unpause()
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    /**
     * renouncePauser renounces privilege of PauserRole.
     * The account sending transaction to execute the renouncePauser must be a Pauser with a PauserRole.
     *
     * @method renouncePauser
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async renouncePauser(sendParam = {}) {
        const executableObj = this.methods.renouncePauser()
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }
}

module.exports = KIP7
