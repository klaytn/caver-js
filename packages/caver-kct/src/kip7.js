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
    interfaceIds,
} = require('./kctHelper')
const { isAddress, toBuffer, isHexStrict, toHex } = require('../../caver-utils')
const KIP13 = require('./kip13')

/**
 * The KIP7 class that helps you easily handle a smart contract that implements KIP-7 as a JavaScript object on the Klaytn blockchain platform (Klaytn).
 * @hideconstructor
 * @class
 */
class KIP7 extends Contract {
    /**
     * Deploys a KIP-7 token contract to Klaytn network.
     *
     * By default, it returns a KIP7 instance when the deployment is finished.
     * If you define a custom function in the `contractDeployFormatter` field in {@link Contract.SendOptions|SendOptions}, you can control return type.
     *
     * @example
     * const tokenInfo = { name: 'TokenName', symbol: 'TKN', decimals: 18, initialSupply: new BigNumber(1000000000000000000) }
     *
     * // Below example will use `caver.wallet`.
     * const deployed = await caver.kct.kip7.deploy(tokenInfo, '0x{deployer address}')
     *
     * // Use sendOptions instead of deployer address.
     * const sendOptions = { from: '0x{deployer address}', feeDelegation: true, feePayer: '0x{fee payer address}' }
     * const deployed = await caver.kct.kip7.deploy(tokenInfo, sendOptions)
     *
     * // If you want to use your own wallet that implements the 'IWallet' interface, pass it into the last parameter.
     * const deployed = await caver.kct.kip7.deploy(tokenInfo, '0x{deployer address}', wallet)
     *
     * @ignore
     * @param {KIP7.KIP7DeployParams} tokenInfo The object that defines the name, symbol, decimals, and initialSupply of the token to deploy.
     * @param {Contract.SendOptions|string} sendOptions The address of the account to deploy the KIP-7 token contract or an object holding parameters that are required for sending a transaction.
     * @return {Promise<*>}
     */
    static deploy(tokenInfo, sendOptions) {
        validateDeployParameterForKIP7(tokenInfo)

        const { name, symbol, decimals, initialSupply } = tokenInfo
        const kip7 = new KIP7()

        // If sendOptions is string type, sendOptions means deployer's address
        if (_.isString(sendOptions)) sendOptions = { from: sendOptions, gas: 4000000, value: 0 }
        sendOptions.gas = sendOptions.gas !== undefined ? sendOptions.gas : 4000000

        return kip7
            .deploy({
                data: kip7ByteCode,
                arguments: [name, symbol, decimals, initialSupply],
            })
            .send(sendOptions)
    }

    /**
     * An object that defines the parameters required to deploy the KIP-7 contract.
     *
     * @typedef {object} KIP7.KIP7DetectedObject
     * @property {boolean} IKIP7 - Whether to implement `IKIP7` interface.
     * @property {boolean} IKIP7Metadata - Whether to implement `IKIP7Metadata` interface.
     * @property {boolean} IKIP7Mintable - Whether to implement `IKIP7Mintable` interface.
     * @property {boolean} IKIP7Burnable - Whether to implement `IKIP7Burnable` interface.
     * @property {boolean} IKIP7Pausable - Whether to implement `IKIP7Pausable` interface.
     */
    /**
     * Returns the information of the interface implemented by the token contract.
     *
     * @example
     * const detected = await caver.kct.kip7.detectInterface('0x{address in hex}')
     *
     * @param {string} contractAddress The address of the KIP-7 token contract to detect.
     * @return {Promise<KIP7.KIP7DetectedObject>}
     */
    static detectInterface(contractAddress) {
        const kip7 = new KIP7(contractAddress)
        return kip7.detectInterface()
    }

    /**
     * KIP7 class represents the KIP-7 token contract.
     *
     * @constructor
     * @param {string} tokenAddress - The KIP-7 token contract address.
     * @param {Array} [abi] - The Contract Application Binary Interface (ABI) of the KIP-7.
     */
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
     * Clones the current KIP7 instance.
     *
     * @example
     * const cloned = kip7.clone()
     * const cloned = kip7.clone('0x{new kip7 address}')
     *
     * @param {string} [tokenAddress] The address of the token contract.
     * @return {KIP7}
     */
    clone(tokenAddress = this.options.address) {
        const cloned = new this.constructor(tokenAddress, this.options.jsonInterface)
        cloned.setWallet(this._wallet)
        return cloned
    }

    /**
     * Returns the information of the interface implemented by the token contract.
     *
     * @example
     * const detected = await kip7.detectInterface()
     *
     * @return {Promise<KIP7.KIP7DetectedObject>}
     */
    async detectInterface() {
        const detected = {
            IKIP7: false,
            IKIP7Metadata: false,
            IKIP7Mintable: false,
            IKIP7Burnable: false,
            IKIP7Pausable: false,
        }

        const notSupportedMsg = `This contract does not support KIP-13.`
        const contractAddress = this._address

        try {
            const isSupported = await KIP13.isImplementedKIP13Interface(contractAddress)
            if (isSupported !== true) throw new Error(notSupportedMsg)

            // Since there is an extension that has the same interface id even though it is a different KCT,
            // it must be checked first whether the contract is a KIP-7 contract.
            detected.IKIP7 = await this.supportsInterface(interfaceIds.kip7.IKIP7)
            if (detected.IKIP7 === false) return detected

            await Promise.all(
                Object.keys(interfaceIds.kip7).map(async interfaceName => {
                    if (interfaceIds.kip7[interfaceName] !== interfaceIds.kip7.IKIP7)
                        detected[interfaceName] = await this.supportsInterface(interfaceIds.kip7[interfaceName])
                })
            )
            return detected
        } catch (e) {
            throw new Error(notSupportedMsg)
        }
    }

    /**
     * Returns `true` if this contract implements the interface defined by `interfaceId`.
     *
     * @example
     * const supported = await kip7.supportsInterface('0x65787371')
     *
     * @param {string} interfaceId The interface id to be checked.
     * @return {Promise<boolean>}
     */
    async supportsInterface(interfaceId) {
        const supported = await this.methods.supportsInterface(interfaceId).call()
        return supported
    }

    /**
     * Returns the name of the token.
     *
     * @example
     * const name = await kip7.name()
     *
     * @return {Promise<string>}
     */
    async name() {
        const name = await this.methods.name().call()
        return name
    }

    /**
     * Returns the symbol of the token.
     *
     * @example
     * const symbol = await kip7.symbol()
     *
     * @return {Promise<string>}
     */
    async symbol() {
        const symbol = await this.methods.symbol().call()
        return symbol
    }

    /**
     * Returns the decimals of the token.
     *
     * @example
     * const decimals = await kip7.decimals()
     *
     * @return {Promise<number>}
     */
    async decimals() {
        const decimals = await this.methods.decimals().call()
        return Number(decimals)
    }

    /**
     * Returns the total supply of the token.
     *
     * @example
     * const totalSupply = await kip7.totalSupply()
     *
     * @return {Promise<BigNumber>}
     */
    async totalSupply() {
        const totalSupply = await this.methods.totalSupply().call()
        return new BigNumber(totalSupply)
    }

    /**
     * Returns the balance of the given account address.
     *
     * @example
     * const balance = await kip7.balanceOf('0x{address in hex}')
     *
     * @param {string} account The address of the account to be checked for its balance.
     * @return {Promise<BigNumber>}
     */
    async balanceOf(account) {
        const balance = await this.methods.balanceOf(account).call()
        return new BigNumber(balance)
    }

    /**
     * Returns the amount of token that `spender` is allowed to withdraw from `owner`.
     *
     * @example
     * const allowance = await kip7.allowance('0x{address in hex}', '0x{spender address}')
     *
     * @param {string} owner The address of the token owner's account.
     * @param {string} spender The address of the account that spends tokens in place of the owner.
     * @return {Promise<BigNumber>}
     */
    async allowance(owner, spender) {
        const allowance = await this.methods.allowance(owner, spender).call()
        return new BigNumber(allowance)
    }

    /**
     * Returns `true` if the given account is a minter who can issue new KIP7 tokens.
     *
     * @example
     * const isMinter = await kip7.isMinter('0x{address in hex}')
     *
     * @param {string} account The address of the account to be checked for having the minting right.
     * @return {Promise<boolean>}
     */
    async isMinter(account) {
        const isMinter = await this.methods.isMinter(account).call()
        return isMinter
    }

    /**
     * Returns `true` if the given account is a pauser who can suspend transferring tokens.
     *
     * @example
     * const isPauser = await kip7.isPauser('0x{address in hex}')
     *
     * @param {string} account The address of the account to be checked for having the right to suspend transferring tokens.
     * @return {Promise<boolean>}
     */
    async isPauser(account) {
        const isPauser = await this.methods.isPauser(account).call()
        return isPauser
    }

    /**
     * Returns `true` if the contract is paused, and `false` otherwise.
     *
     * @example
     * const isPaused = await kip7.paused()
     *
     * @method paused
     * @return {Promise<boolean>}
     */
    async paused() {
        const isPaused = await this.methods.paused().call()
        return isPaused
    }

    /**
     * Sets the amount of the tokens of the token owner to be spent by the spender.
     *
     * @example
     * const receipt = await kip7.approve('0x{spender address}', 10, { from: '0x{address in hex}' })
     *
     * @param {string} spender The address of the account who spends tokens in place of the owner.
     * @param {BigNumber|string|number} amount The amount of token the spender is allowed to use.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async approve(spender, amount, sendParam = {}) {
        const executableObj = this.methods.approve(spender, formatParamForUint256(amount))
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Transfers the given amount of the token from the token owner's balance to the recipient.
     *
     * The token owner should execute this token transfer with its own hands.
     * Thus, the token owner should be the sender of this transaction whose address must be given at `sendParam.from` or `kip7.options.from`.
     * Without `sendParam.from` nor `kip7.options.from` being provided, an error would occur.
     *
     * @example
     * const receipt = await kip7.transfer('0x{address in hex}', 10, { from: '0x{address in hex}' })
     *
     * @param {string} recipient The address of the account to receive the token.
     * @param {BigNumber|string|number} amount The amount of tokens you want to transfer.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async transfer(recipient, amount, sendParam = {}) {
        const executableObj = this.methods.transfer(recipient, formatParamForUint256(amount))
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Transfers the given amount of the token from the token owner's balance to the recipient.
     *
     * The address who was approved to send the token owner's tokens is expected to execute this token transferring transaction.
     * Thus, the approved one should be the sender of this transaction whose address must be given at `sendParam.from` or `kip7.options.from`.
     * Without `sendParam.from` nor `kip7.options.from` being provided, an error would occur.
     *
     * @example
     * const receipt = await kip7.transferFrom('0x{address in hex}', '0x{address in hex}', 10000, { from: '0x{address in hex}' })
     *
     * @param {string} owner The address of the account that owns the token to be sent with allowance mechanism.
     * @param {string} recipient The address of the account to receive the token.
     * @param {BigNumber|string|number} amount The amount of tokens you want to transfer.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async transferFrom(owner, recipient, amount, sendParam = {}) {
        const executableObj = this.methods.transferFrom(owner, recipient, formatParamForUint256(amount))
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Safely transfers the given amount of the token from the token owner's balance to the recipient.
     *
     * The token owner should execute this token transfer with its own hands.
     * Thus, the token owner should be the sender of this transaction whose address must be given at `sendParam.from` or `kip7.options.from`.
     * Without `sendParam.from` nor `kip7.options.from` being provided, an error would occur.
     *
     * @example
     * const receipt = await kip7.safeTransfer('0x{address in hex}', 10, { from: '0x{address in hex}' })
     *
     * @param {string} recipient The address of the account to receive the token.
     * @param {BigNumber|string|number} amount The amount of tokens you want to transfer.
     * @param {Buffer|string|number} [data] The optional data to send along with the call.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
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

        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Safely transfers the given amount of the token from the token owner's balance to the recipient.
     *
     * The address who was approved to send the token owner's tokens is expected to execute this token transferring transaction.
     * Thus, the approved one should be the sender of this transaction whose address must be given at `sendParam.from` or `kip7.options.from`.
     * Without `sendParam.from` nor `kip7.options.from` being provided, an error would occur.
     *
     * @example
     * const receipt = await kip7.safeTransferFrom('0x{address in hex}', '0x{address in hex}', 10000, { from: '0x{address in hex}' })
     *
     * @param {string} owner The address of the account that owns the token to be sent with allowance mechanism.
     * @param {string} recipient The address of the account to receive the token.
     * @param {BigNumber|string|number} amount The amount of tokens you want to transfer.
     * @param {Buffer|string|number} [data] The optional data to send along with the call.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async safeTransferFrom(owner, recipient, amount, data, sendParam = {}) {
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
            ? this.methods.safeTransferFrom(owner, recipient, formatParamForUint256(amount), data)
            : this.methods.safeTransferFrom(owner, recipient, formatParamForUint256(amount))

        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Creates the `amount` of token and issues it to the `account`, increasing the total supply of token.
     * The account sending transaction to execute the mint must be a Minter with a MinterRole.
     *
     * @example
     * const receipt = await kip7.mint('0x{address in hex}', 10000, { from: '0x{minter address}' })
     *
     * @param {string} account The address of the account to which the minted token will be allocated.
     * @param {BigNumber|string|number} amount The amount of tokens to mint.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async mint(account, amount, sendParam = {}) {
        const executableObj = this.methods.mint(account, formatParamForUint256(amount))
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Adds an account as a minter, who are permitted to mint tokens.
     * The account sending transaction to execute the addMinter must be a Minter with a MinterRole.
     *
     * @example
     * const receipt = await kip7.addMinter('0x{address in hex}', { from: '0x{minter address}' })
     *
     * @param {string} account The address of account to add as minter.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async addMinter(account, sendParam = {}) {
        const executableObj = this.methods.addMinter(account)
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Renounces the right to mint tokens. Only a minter address can renounce the minting right.
     * The account sending transaction to execute the renounceMinter must be a Minter with a MinterRole.
     *
     * @example
     * const receipt = await kip7.renounceMinter({ from: '0x{minter address}' })
     *
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async renounceMinter(sendParam = {}) {
        const executableObj = this.methods.renounceMinter()
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Destroys the `amount` of tokens in the sender's balance.
     * Without `sendParam.from` nor `kip7.options.from` being provided, an error would occur.
     *
     * @example
     * const receipt = await kip7.burn(1000, { from: '0x{address in hex}' })
     *
     * @param {BigNumber|string|number} amount The amount of tokens to destroy.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async burn(amount, sendParam = {}) {
        const executableObj = this.methods.burn(formatParamForUint256(amount))
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Destroys the given number of tokens from `account`.
     * The allowance of the sender specified in `sendParam.from` or `kip7.options.from` is reduced alongside the balance of account.
     *
     * @example
     * const receipt = await kip7.burnFrom('0x{address in hex}', 1000, { from: '0x{address in hex}' })
     *
     * @param {string} account The address of the account that owns the token to be burned with allowance mechanism.
     * @param {BigNumber|string|number} amount The amount of tokens to destroy.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async burnFrom(account, amount, sendParam = {}) {
        const executableObj = this.methods.burnFrom(account, formatParamForUint256(amount))
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Adds an account as a pauser that has the right to suspend the contract.
     * The account sending transaction to execute the addPauser must be a Pauser with a PauserRole.
     *
     * @example
     * const receipt = await kip7.addPauser('0x{address in hex}', { from: '0x{address in hex}' })
     *
     * @param {string} account The address of account to add as pauser.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async addPauser(account, sendParam = {}) {
        const executableObj = this.methods.addPauser(account)
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Suspends functions related to sending tokens.
     * The account sending transaction to execute the pause must be a Pauser with a PauserRole.
     *
     * @example
     * const receipt = await kip7.pause({ from: '0x{address in hex}' })
     *
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async pause(sendParam = {}) {
        const executableObj = this.methods.pause()
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Resumes the paused contract.
     * The account sending transaction to execute the unpause must be a Pauser with a PauserRole.
     *
     * @example
     * const receipt = await kip7.unpause({ from: '0x{address in hex}' })
     *
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async unpause(sendParam = {}) {
        const executableObj = this.methods.unpause()
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Renounces the right to pause the contract. Only a pauser address can renounce the pausing right.
     * The account sending transaction to execute the renouncePauser must be a Pauser with a PauserRole.
     *
     * @example
     * const receipt = await kip7.renouncePauser({ from: '0x{address in hex}' })
     *
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async renouncePauser(sendParam = {}) {
        const executableObj = this.methods.renouncePauser()
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }
}

/**
 * The byte code of the KIP-7 token contract.
 *
 * @example
 * caver.kct.kip7.byteCode
 *
 * @static
 * @type {string}
 */
KIP7.byteCode = kip7ByteCode

/**
 * The abi of the KIP-7 token contract.
 *
 * @example
 * caver.kct.kip7.abi
 *
 * @static
 * @type {Array.<object>}
 */
KIP7.abi = kip7JsonInterface

module.exports = KIP7
