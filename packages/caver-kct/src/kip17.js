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
    validateDeployParameterForKIP17,
    kip17JsonInterface,
    kip17ByteCode,
    determineSendParams,
    formatParamForUint256,
    interfaceIds,
} = require('./kctHelper')
const { toBuffer, isHexStrict, toHex } = require('../../caver-utils/src')
const { isAddress } = require('../../caver-utils/src')
const KIP13 = require('./kip13')

/**
 * The KIP17 class that helps you easily handle a smart contract that implements KIP-17 as a JavaScript object on the Klaytn blockchain platform (Klaytn).
 * @hideconstructor
 * @class
 */
class KIP17 extends Contract {
    /**
     * Deploys a KIP-17 token contract to Klaytn network.
     *
     * By default, it returns a KIP17 instance when the deployment is finished.
     * If you define a custom function in the `contractDeployFormatter` field in {@link Contract.SendOptions|SendOptions}, you can control return type.
     *
     * @example
     * const tokenInfo = { name: 'TokenName', symbol: 'TKN' }
     *
     * // Below example will use `caver.wallet`.
     * const deployed = await caver.kct.kip17.deploy(tokenInfo, '0x{deployer address}')
     *
     * // Use sendOptions instead of deployer address.
     * const sendOptions = { from: '0x{deployer address}', feeDelegation: true, feePayer: '0x{fee payer address}' }
     * const deployed = await caver.kct.kip17.deploy(tokenInfo, sendOptions)
     *
     * // If you want to use your own wallet that implements the 'IWallet' interface, pass it into the last parameter.
     * const deployed = await caver.kct.kip17.deploy(tokenInfo, '0x{deployer address}', wallet)
     *
     * @ignore
     * @param {KIP17.KIP17DeployParams} tokenInfo The object that defines the name and symbol of the token to deploy.
     * @param {Contract.SendOptions|string} sendOptions The address of the account to deploy the KIP-17 token contract or an object holding parameters that are required for sending a transaction.
     * @return {Promise<*>}
     */
    static deploy(tokenInfo, sendOptions) {
        validateDeployParameterForKIP17(tokenInfo)

        const { name, symbol } = tokenInfo
        const kip17 = new KIP17()

        // If sendOptions is string type, sendOptions means deployer's address
        if (_.isString(sendOptions)) sendOptions = { from: sendOptions, gas: 6600000, value: 0 }
        sendOptions.gas = sendOptions.gas !== undefined ? sendOptions.gas : 6600000

        return kip17
            .deploy({
                data: kip17ByteCode,
                arguments: [name, symbol],
            })
            .send(sendOptions)
    }

    /**
     * An object that defines the parameters required to deploy the KIP-17 contract.
     *
     * @typedef {object} KIP17.KIP17DetectedObject
     * @property {boolean} IKIP17 - Whether to implement `IKIP17` interface.
     * @property {boolean} IKIP17Metadata - Whether to implement `IKIP17Metadata` interface.
     * @property {boolean} IKIP17Enumerable - Whether to implement `IKIP17Enumerable` interface.
     * @property {boolean} IKIP17Mintable - Whether to implement `IKIP17Mintable` interface.
     * @property {boolean} IKIP17MetadataMintable - Whether to implement `IKIP17MetadataMintable` interface.
     * @property {boolean} IKIP17Burnable - Whether to implement `IKIP17Burnable` interface.
     * @property {boolean} IKIP17Pausable - Whether to implement `IKIP17Pausable` interface.
     */
    /**
     * Returns the information of the interface implemented by the token contract.
     *
     * @example
     * const detected = await caver.kct.kip17.detectInterface('0x{address in hex}')
     *
     * @param {string} contractAddress The address of the KIP-17 token contract to detect.
     * @return {Promise<KIP17.KIP17DetectedObject>}
     */
    static detectInterface(contractAddress) {
        const kip17 = new KIP17(contractAddress)
        return kip17.detectInterface()
    }

    /**
     * KIP17 class represents the KIP-17 token contract.
     *
     * @constructor
     * @param {string} tokenAddress - The KIP-17 token contract address.
     * @param {Array} [abi] - The Contract Application Binary Interface (ABI) of the KIP-17.
     */
    constructor(tokenAddress, abi = kip17JsonInterface) {
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
     * Clones the current KIP17 instance.
     *
     * @example
     * const cloned = kip17.clone()
     * const cloned = kip17.clone('0x{new kip17 address}')
     *
     * @param {string} [tokenAddress] The address of the token contract.
     * @return {KIP17}
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
     * const detected = await kip17.detectInterface()
     *
     * @return {Promise<KIP17.KIP17DetectedObject>}
     */
    async detectInterface() {
        const detected = {
            IKIP17: false,
            IKIP17Metadata: false,
            IKIP17Enumerable: false,
            IKIP17Mintable: false,
            IKIP17MetadataMintable: false,
            IKIP17Burnable: false,
            IKIP17Pausable: false,
        }

        const notSupportedMsg = `This contract does not support KIP-13.`
        const contractAddress = this._address

        try {
            const isSupported = await KIP13.isImplementedKIP13Interface(contractAddress)
            if (isSupported !== true) throw new Error(notSupportedMsg)

            // Since there is an extension that has the same interface id even though it is a different KCT,
            // it must be checked first whether the contract is a KIP-17 contract.
            detected.IKIP17 = await this.supportsInterface(interfaceIds.kip17.IKIP17)
            if (detected.IKIP17 === false) return detected

            await Promise.all(
                Object.keys(interfaceIds.kip17).map(async interfaceName => {
                    if (interfaceIds.kip17[interfaceName] !== interfaceIds.kip17.IKIP17)
                        detected[interfaceName] = await this.supportsInterface(interfaceIds.kip17[interfaceName])
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
     * const supported = await kip17.supportsInterface('0x80ac58cd')
     *
     * @param {string} interfaceId The interface id to check.
     * @return {Promise<boolean>}
     */
    async supportsInterface(interfaceId) {
        const isSupported = await this.methods.supportsInterface(interfaceId).call()
        return isSupported
    }

    /**
     * Returns the name of the token.
     *
     * @example
     * const name = await kip17.name()
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
     * const symbol = await kip17.symbol()
     *
     * @return {Promise<string>}
     */
    async symbol() {
        const symbol = await this.methods.symbol().call()
        return symbol
    }

    /**
     * Returns the URI for a given token id.
     *
     * @example
     * const tokenURI = await kip17.tokenURI(0)
     *
     * @param {BigNumber|string|number} tokenId The id of the token.
     * @return {Promise<string>}
     */
    async tokenURI(tokenId) {
        const tokenURI = await this.methods.tokenURI(formatParamForUint256(tokenId)).call()
        return tokenURI
    }

    /**
     * Returns the total number of tokens minted by the contract.
     *
     * @example
     * const totalSupply = await kip17.totalSupply()
     *
     * @return {Promise<BigNumber>}
     */
    async totalSupply() {
        const totalSupply = await this.methods.totalSupply().call()
        return new BigNumber(totalSupply)
    }

    /**
     * Searches the `owner`'s token list for the given index, and returns the token id of a token positioned at the matched index in the list if there is a match.
     *
     * @example
     * const token = await kip17.tokenOfOwnerByIndex('0x{address in hex}', 5)
     *
     * @param {string} owner The address of the account who owns tokens.
     * @param {BigNumber|string|number} index The index of a token in owner's token list.
     * @return {Promise<BigNumber>}
     */
    async tokenOfOwnerByIndex(owner, index) {
        const token = await this.methods.tokenOfOwnerByIndex(owner, formatParamForUint256(index)).call()
        return new BigNumber(token)
    }

    /**
     * Searches the list of all tokens in this contract for the given index, and returns the token id of a token positioned at the matched index in the list if there is a match.
     * It reverts if the index is greater or equal to the total number of tokens.
     *
     * @example
     * const token = await kip17.tokenByIndex(1)
     *
     * @param {BigNumber|string|number} index The index of the token to query.
     * @return {Promise<BigNumber>}
     */
    async tokenByIndex(index) {
        const token = await this.methods.tokenByIndex(formatParamForUint256(index)).call()
        return new BigNumber(token)
    }

    /**
     * Returns the balance of the given account address.
     * The balance of an account in KIP-17 is the total number of NFTs (Non-Fungible Tokens) owned by the account.
     *
     * @example
     * const balance = await kip17.balanceOf('0x{address in hex}')
     *
     * @param {string} account The address of the account to be checked for its balance.
     * @return {Promise<BigNumber>}
     */
    async balanceOf(account) {
        const balance = await this.methods.balanceOf(account).call()
        return new BigNumber(balance)
    }

    /**
     * Returns the address of the owner of the specified token id.
     *
     * @example
     * const owner = await kip17.ownerOf(8)
     *
     * @param {BigNumber|string|number} tokenId The id of the token.
     * @return {Promise<string>}
     */
    async ownerOf(tokenId) {
        const owner = await this.methods.ownerOf(formatParamForUint256(tokenId)).call()
        return owner
    }

    /**
     * Returns the address who was permitted to transfer this token, or 'zero' address, if no address was approved.
     * It reverts if the given token id does not exist.
     *
     * @example
     * const approvedAddress = await kip17.getApproved(10)
     *
     * @param {BigNumber|string|number} tokenId The id of the token.
     * @return {Promise<string>}
     */
    async getApproved(tokenId) {
        const isApproved = await this.methods.getApproved(formatParamForUint256(tokenId)).call()
        return isApproved
    }

    /**
     * Returns `true` if an `operator` is approved to transfer all tokens that belong to the `owner`.
     *
     * @example
     * const isApprovedForAll = await kip17.isApprovedForAll('0x{address in hex}', '0x{address in hex}')
     *
     * @param {string} owner The id of the token.
     * @param {string} operator The id of the token.
     * @return {Promise<boolean>}
     */
    async isApprovedForAll(owner, operator) {
        const isApprovedForAll = await this.methods.isApprovedForAll(owner, operator).call()
        return isApprovedForAll
    }

    /**
     * Returns true if the given account is a minter who can issue new tokens in the current contract conforming to KIP-17.
     *
     * @example
     * const isMinter = await kip17.isMinter('0x{address in hex}')
     *
     * @param {string} account The address of the account to be checked for having the minting right.
     * @return {Promise<boolean>}
     */
    async isMinter(account) {
        const isMinter = await this.methods.isMinter(account).call()
        return isMinter
    }

    /**
     * Returns true if the contract is paused, and false otherwise.
     *
     * @example
     * const isPaused = await kip17.paused()
     *
     * @return {Promise<boolean>}
     */
    async paused() {
        const isPaused = await this.methods.paused().call()
        return isPaused
    }

    /**
     * Returns `true` if the given account is a pauser who can suspend transferring tokens.
     *
     * @example
     * const isPauser = await kip17.isPauser('0x{address in hex}')
     *
     * @param {string} account The address of the account you want to check pauser or not.
     * @return {Promise<boolean>}
     */
    async isPauser(account) {
        const isPauser = await this.methods.isPauser(account).call()
        return isPauser
    }

    /**
     * Approves another address to transfer a token of the given token id.
     * The zero address indicates there is no approved address.
     * There can only be one approved address per token.
     * This method is allowed to call only by the token owner or an approved operator.
     *
     * @example
     * const receipt = await kip17.approve('0x{address in hex}', 10, { from: '0x{address in hex}' })
     *
     * @param {string} to The address of the account who spends tokens in place of the owner.
     * @param {BigNumber|string|number} tokenId The id of the token the spender is allowed to use.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async approve(to, tokenId, sendParam = {}) {
        const executableObj = this.methods.approve(to, formatParamForUint256(tokenId))
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Approves the given operator `to`, or disallow the given operator, to transfer all tokens of the `owner`.
     *
     * @example
     * const receipt = await kip17.setApprovalForAll('0x{address in hex}', false, { from: '0x{address in hex}' })
     *
     * @param {string} to The address of an account to be approved/prohibited to transfer the owner's all tokens.
     * @param {boolean} approved This operator will be approved if `true`. The operator will be disallowed if `false`.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async setApprovalForAll(to, approved, sendParam = {}) {
        const executableObj = this.methods.setApprovalForAll(to, approved)
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Transfers the token of the given token id `tokenId` from the token `owner`'s balance to another address.
     *
     * The address who was approved to send the token owner's token (the `operator`) or the token `owner` itself is expected to execute this token transferring transaction.
     * Thus, the approved one or the token owner should be the sender of this transaction whose address must be given at `sendParam.from` or `kip17Instance.options.from`.
     * Without `sendParam.from` nor `kip17Instance.options.from` being provided, an error would occur.
     *
     * It is recommended to use {@link safeTransferFrom} whenever possible instead of this method.
     *
     * @example
     * const receipt = await kip17.transferFrom('0x{address in hex}', '0x{address in hex}', 2, { from: '0x{address in hex}' })
     *
     * @param {string} from The address of the owner or approved of the given token.
     * @param {string} to The address of the account to receive the token.
     * @param {BigNumber|string|number} tokenId The id of token you want to transfer.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async transferFrom(from, to, tokenId, sendParam = {}) {
        const executableObj = this.methods.transferFrom(from, to, formatParamForUint256(tokenId))
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Safely transfers the token of the given token id `tokenId` from the token `owner`'s balance to another address.
     *
     * The address who was approved to send the token owner's token (the `operator`) or the token `owner` itself is expected to execute this token transferring transaction.
     * Thus, the approved one or the token owner should be the sender of this transaction whose address must be given at `sendParam.from` or `kip17Instance.options.from`.
     * Without `sendParam.from` nor `kip17Instance.options.from` being provided, an error would occur.
     *
     * @example
     * const receipt = await kip17.safeTransferFrom('0x{address in hex}', '0x{address in hex}', 9, { from: '0x{address in hex}' })
     *
     * @param {string} from The address of the owner or approved of the given token.
     * @param {string} to The address of the account to receive the token.
     * @param {BigNumber|string|number} tokenId The id of token you want to transfer.
     * @param {Buffer|string|number} [data] The optional data to send along with the call.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async safeTransferFrom(from, to, tokenId, data, sendParam = {}) {
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
            ? this.methods.safeTransferFrom(from, to, formatParamForUint256(tokenId), data)
            : this.methods.safeTransferFrom(from, to, formatParamForUint256(tokenId))

        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Adds an account as a minter, who are permitted to mint tokens.
     * If `sendParam.from` or `kip17.options.from` were given, it should be a minter with MinterRole.
     *
     * @example
     * const receipt = await kip17.addMinter('0x{address in hex}', { from: '0x{address in hex}' })
     *
     * @param {string} account The address of account to add as minter.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async addMinter(account, sendParam = {}) {
        const executableObj = this.methods.addMinter(account)
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Renounces the right to mint tokens. Only a minter address can renounce the minting right.
     * If `sendParam.from` or `kip17.options.from` were given, it should be a minter with MinterRole.
     *
     * @example
     * const receipt = await kip17.renounceMinter({ from: '0x{address in hex}' })
     *
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async renounceMinter(sendParam = {}) {
        const executableObj = this.methods.renounceMinter()
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Creates token and assigns them to account, increasing the total supply.
     * If `sendParam.from` or `kip17.options.from` were given, it should be a minter with MinterRole.
     *
     * @example
     * const receipt = await kip17.mint('0x{address in hex}', 20, { from: '0x{address in hex}' })
     *
     * @param {string} to The address of the account to which the minted token will be allocated.
     * @param {BigNumber|string|number} tokenId The id of token to mint.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async mint(to, tokenId, sendParam = {}) {
        const executableObj = this.methods.mint(to, formatParamForUint256(tokenId))
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Creates a token with the given uri and assigns them to the given account.
     * This method increases the total supply of this token.
     * If `sendParam.from` or `kip17.options.from` were given, it should be a minter with MinterRole.
     *
     * @example
     * const receipt = await kip17.mintWithTokenURI('0x{address in hex}', 18, tokenURI, { from: '0x{address in hex}' })
     *
     * @param {string} to The address of the account to which the minted token will be allocated.
     * @param {BigNumber|string|number} tokenId The id of token to mint.
     * @param {string} tokenURI The uri of token to mint.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async mintWithTokenURI(to, tokenId, tokenURI, sendParam = {}) {
        const executableObj = this.methods.mintWithTokenURI(to, formatParamForUint256(tokenId), tokenURI)
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Destroys the token of the given token id.
     * Without `sendParam.from` nor `kip17.options.from` being provided, an error would occur.
     *
     * @example
     * const receipt = await kip17.burn(14, { from: '0x{address in hex}' })
     *
     * @param {BigNumber|string|number} tokenId The id of token to destroy.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async burn(tokenId, sendParam = {}) {
        const executableObj = this.methods.burn(formatParamForUint256(tokenId))
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Suspends functions related to sending tokens.
     * If `sendParam.from` or `kip17.options.from` were given, it should be a pauser with PauserRole.
     *
     * @example
     * const receipt = await kip17.pause({ from: '0x{address in hex}' })
     *
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async pause(sendParam = {}) {
        const executableObj = this.methods.pause()
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Resumes the paused contract.
     * If `sendParam.from` or `kip17.options.from` were given, it should be a pauser with PauserRole.
     *
     * @example
     * const receipt = await kip17.unpause({ from: '0x{address in hex}' })
     *
     * @param {string} spender The address of the account to use on behalf of owner for the amount to be set in allowance.
     * @param {BigNumber|string|number} amount The amount of tokens the spender allows to use on behalf of the owner.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async unpause(sendParam = {}) {
        const executableObj = this.methods.unpause()
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Adds an account as a pauser that has the right to suspend the contract.
     * If `sendParam.from` or `kip17.options.from` were given, it should be a pauser with PauserRole.
     *
     * @example
     * const receipt = await kip17.addPauser('0x{address in hex}', { from: '0x{address in hex}' })
     *
     * @param {string} account The address of account to add as pauser.
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async addPauser(account, sendParam = {}) {
        const executableObj = this.methods.addPauser(account)
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Renounces the right to pause the contract. Only a pauser address can renounce its own pausing right.
     * If `sendParam.from` or `kip17.options.from` were given, it should be a pauser with PauserRole.
     *
     * @example
     * const receipt = await kip17.renouncePauser({ from: '0x{address in hex}' })
     *
     * @param {Contract.SendOptions} [sendParam] An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async renouncePauser(sendParam = {}) {
        const executableObj = this.methods.renouncePauser()
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }
}

/**
 * The byte code of the KIP-17 token contract.
 *
 * @example
 * caver.kct.kip17.byteCode
 *
 * @static
 * @type {string}
 */
KIP17.byteCode = kip17ByteCode

/**
 * The abi of the KIP-17 token contract.
 *
 * @example
 * caver.kct.kip17.abi
 *
 * @static
 * @type {Array.<object>}
 */
KIP17.abi = kip17JsonInterface

module.exports = KIP17
