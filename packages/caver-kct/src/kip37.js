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
    interfaceIds,
} = require('./kctHelper')
const { isAddress, toBuffer, isHexStrict, toHex, stripHexPrefix, leftPad } = require('../../caver-utils')
const KIP13 = require('./kip13')

/**
 * The KIP37 class that helps you easily handle a smart contract that implements KIP-37 as a JavaScript object on the Klaytn blockchain platform (Klaytn).
 * @hideconstructor
 * @class
 */
class KIP37 extends Contract {
    /**
     * Creates a new KIP37 instance with its bound methods and events.
     *
     * @example
     * const kip37 = caver.kct.kip37.create('0x{address in hex}')
     *
     * @param {string} tokenAddress - The KIP-37 token contract address.
     * @param {Array} [abi] - The Contract Application Binary Interface (ABI) of the KIP-37.
     * @return {KIP37}
     */
    static create(tokenAddress, abi) {
        return new KIP37(tokenAddress, abi)
    }

    /**
     * An object that defines the parameters required to deploy the KIP-37 contract.
     *
     * @typedef {object} KIP37.KIP37DeployParams
     * @property {string} uri - The URI for all token types, by relying on the {@link http://kips.klaytn.com/KIPs/kip-37#metadata|token type ID substitution mechanism}.
     */
    /**
     * Deploys a KIP-37 token contract to Klaytn network.
     *
     * By default, it returns a KIP37 instance when the deployment is finished.
     * If you define a custom function in the `contractDeployFormatter` field in {@link Contract.SendOptions|SendOptions}, you can control return type.
     *
     * @example
     * const tokenInfo = { uri: 'uri string' }
     *
     * // Below example will use `caver.wallet`.
     * const deployed = await caver.kct.kip37.deploy(tokenInfo, '0x{deployer address}')
     *
     * // Use sendOptions instead of deployer address.
     * const sendOptions = { from: '0x{deployer address}', feeDelegation: true, feePayer: '0x{fee payer address}' }
     * const deployed = await caver.kct.kip37.deploy(tokenInfo, sendOptions)
     *
     * // If you want to use your own wallet that implements the 'IWallet' interface, pass it into the last parameter.
     * const deployed = await caver.kct.kip37.deploy(tokenInfo, '0x{deployer address}', wallet)
     *
     * @param {KIP37.KIP37DeployParams} tokenInfo The object that defines the uri to deploy.
     * @param {Contract.SendOptions|string} sendOptions An object holding parameters that are required for sending a transaction.
     * @param {IWallet} [wallet] The wallet instance to sign and send a transaction.
     * @return {Promise<*>}
     */
    static deploy(tokenInfo, sendOptions, wallet) {
        validateDeployParameterForKIP37(tokenInfo)

        const { uri } = tokenInfo
        const kip37 = new KIP37()
        if (wallet !== undefined) kip37.setWallet(wallet)

        // If sendOptions is string type, sendOptions means deployer's address
        if (_.isString(sendOptions)) sendOptions = { from: sendOptions, gas: 7000000, value: 0 }
        sendOptions.gas = sendOptions.gas !== undefined ? sendOptions.gas : 7000000

        return kip37
            .deploy({
                data: kip37ByteCode,
                arguments: [uri],
            })
            .send(sendOptions)
    }

    /**
     * An object that defines the parameters required to deploy the KIP-37 contract.
     *
     * @typedef {object} KIP37.KIP37DetectedObject
     * @property {boolean} IKIP37 - Whether to implement `IKIP37` interface.
     * @property {boolean} IKIP37Metadata - Whether to implement `IKIP37Metadata` interface.
     * @property {boolean} IKIP37Mintable - Whether to implement `IKIP37Mintable` interface.
     * @property {boolean} IKIP37Burnable - Whether to implement `IKIP37Burnable` interface.
     * @property {boolean} IKIP37Pausable - Whether to implement `IKIP37Pausable` interface.
     */
    /**
     * Returns the information of the interface implemented by the token contract.
     *
     * @example
     * const detected = await caver.kct.kip37.detectInterface('0x{address in hex}')
     *
     * @param {string} contractAddress The address of the KIP-37 token contract to detect.
     * @return {Promise<KIP37.KIP37DetectedObject>}
     */
    static detectInterface(contractAddress) {
        const kip37 = new KIP37(contractAddress)
        return kip37.detectInterface()
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

    /**
     * Clones the current KIP37 instance.
     *
     * @example
     * const cloned = kip37.clone()
     * const cloned = kip37.clone('0x{new kip7 address}')
     *
     * @param {string} [tokenAddress] The address of the token contract.
     * @return {KIP37}
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
     * const detected = await kip37.detectInterface()
     *
     * @return {Promise<KIP37.KIP37DetectedObject>}
     */
    async detectInterface() {
        const detected = {
            IKIP37: false,
            IKIP37Metadata: false,
            IKIP37Mintable: false,
            IKIP37Burnable: false,
            IKIP37Pausable: false,
        }

        const notSupportedMsg = `This contract does not support KIP-13.`
        const contractAddress = this._address

        try {
            const isSupported = await KIP13.isImplementedKIP13Interface(contractAddress)
            if (isSupported !== true) throw new Error(notSupportedMsg)

            // Since there is an extension that has the same interface id even though it is a different KCT,
            // it must be checked first whether the contract is a KIP-37 contract.
            detected.IKIP37 = await this.supportsInterface(interfaceIds.kip37.IKIP37)
            if (detected.IKIP37 === false) return detected

            await Promise.all(
                Object.keys(interfaceIds.kip37).map(async interfaceName => {
                    if (interfaceIds.kip37[interfaceName] !== interfaceIds.kip37.IKIP37)
                        detected[interfaceName] = await this.supportsInterface(interfaceIds.kip37[interfaceName])
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
     * const supported = await kip37.supportsInterface('0x6433ca1f')
     *
     * @param {string} interfaceId The interface id to check.
     * @return {Promise<boolean>}
     */
    async supportsInterface(interfaceId) {
        const isSupported = await this.methods.supportsInterface(interfaceId).call()
        return isSupported
    }

    /**
     * Returns distinct Uniform Resource Identifier (URI) of the given token.
     * If the string {id} exists in any URI, this function will replace this with the actual token ID in hexadecimal form.
     * Please refer to {@link http://kips.klaytn.com/KIPs/kip-37#metadata|KIP-34 Metadata}.
     *
     * @example
     * const uri = await kip37.uri('0x0')
     *
     * @param {BigNumber|string|number} id The token id to get uri.
     * @return {Promise<string>}
     */
    async uri(id) {
        let uri = await this.methods.uri(formatParamForUint256(id)).call()

        // Replace {id} to token id in hexadecimal form.
        if (uri.includes('{id}')) {
            let tokenIdInHex = stripHexPrefix(toHex(id))
            tokenIdInHex = leftPad(tokenIdInHex, 64, '0')
            uri = uri.replace('{id}', tokenIdInHex)
        }
        return uri
    }

    /**
     * Returns the total token supply of the specific token.
     *
     * @example
     * const totalSupply = await kip37.totalSupply(0)
     *
     * @param {BigNumber|string|number} id The token id to see the total supply.
     * @return {Promise<BigNumber>}
     */
    async totalSupply(id) {
        const totalSupply = await this.methods.totalSupply(formatParamForUint256(id)).call()
        return new BigNumber(totalSupply)
    }

    /**
     * Returns the amount of tokens of token type `id` owned by `account`.
     *
     * @example
     * const balance = await kip37.balanceOf('0x{address in hex}', 0)
     *
     * @param {string} account The address of the account for which you want to see balance.
     * @param {BigNumber|string|number} id The token id to see balance.
     * @return {Promise<BigNumber>}
     */
    async balanceOf(account, id) {
        const balance = await this.methods.balanceOf(account, formatParamForUint256(id)).call()
        return new BigNumber(balance)
    }

    /**
     * Returns the balance of multiple account/token pairs.
     * `balanceOfBatch` is a batch operation of {@link balanceOf}, and the length of arrays with `accounts` and `ids` must be the same.
     *
     * @param {Array.<string>} accounts The address of the accounts for which you want to see balance.
     * @param {Array.<BigNumber|string|number>} ids An array of ids of token you want to see balance.
     * @return {Promise<Array.<BigNumber>>}
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
     * Queries the approval status of an operator for a given owner. Returns true if an operator is approved by a given owner.
     *
     * @example
     * const isApprovedForAll = await kip37.isApprovedForAll('0x{address in hex}', '0x{address in hex}')
     *
     * @param {string} owner The address of the owner.
     * @param {string} operator The address of the operator.
     * @return {Promise<boolean>}
     */
    async isApprovedForAll(owner, operator) {
        const isApprovedForAll = await this.methods.isApprovedForAll(owner, operator).call()
        return isApprovedForAll
    }

    /**
     * Returns whether or not the token contract's transaction (or specific token) is paused.
     *
     * If `id` parameter is not defined, return whether the token contract's transaction is paused.
     * If `id` parameter is defined, return whether the specific token is paused.
     *
     * @example
     * // without token id parameter
     * const isPaused = await kip37.paused()
     * // with token id parameter
     * const isPaused = await kip37.paused(0)
     *
     * @param {BigNumber|string|number} [id] The token id to check wether paused or not. If this parameter is omitted, the `paused` function return whether the contract is in paused state.
     * @return {Promise<boolean>}
     */
    async paused(id) {
        const callObject = id !== undefined ? this.methods.paused(formatParamForUint256(id)) : this.methods.paused()
        const isPaused = await callObject.call()
        return isPaused
    }

    /**
     * Returns `true` if the given account is a pauser who can suspend transferring tokens.
     *
     * @example
     * const isPauser = await kip37.isPauser('0x{address in hex}')
     *
     * @param {string} account The address of the account to be checked for having the right to suspend transferring tokens.
     * @return {Promise<boolean>}
     */
    async isPauser(account) {
        const isPauser = await this.methods.isPauser(account).call()
        return isPauser
    }

    /**
     * Returns `true` if the given account is a minter who can issue new KIP37 tokens.
     *
     * @example
     * const isMinter = await kip37.isMinter('0x{address in hex}')
     *
     * @param {string} account The address of the account to be checked for having the minting right.
     * @return {Promise<boolean>}
     */
    async isMinter(account) {
        const isMinter = await this.methods.isMinter(account).call()
        return isMinter
    }

    /**
     * create creates token and assigns them to account, increasing the total supply.
     *
     * @example
     * // Send via a sendParam object with the from field given
     * const receipt = await kip37.create(2, '1000000000000000000', { from: '0x{address in hex}' })
     *
     * @param {BigNumber|string|number} id The token id to create.
     * @param {BigNumber|string|number} initialSupply The amount of tokens being minted.
     * @param {string} [uri] The token URI of the created token.
     * @param {Contract.SendOptios} [sendParam] (optional) An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async create(id, initialSupply, uri, sendParam = {}) {
        if (uri && _.isObject(uri)) {
            if (uri.gas !== undefined || uri.from !== undefined) {
                if (Object.keys(sendParam).length > 0) throw new Error(`Invalid parameters`)
                sendParam = uri
                uri = ''
            }
        }

        const executableObj = this.methods.create(formatParamForUint256(id), formatParamForUint256(initialSupply), uri)
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Approves the given operator, or disallow the given operator, to transfer all tokens of the owner.
     * An operator is allowed to transfer all tokens of the sender on their behalf.
     *
     * @example
     * const receipt = await kip37.setApprovalForAll('0x{address in hex}', true, { from: '0x{address in hex}' })
     *
     * @param {string} operator The address of an account to be approved/prohibited to transfer the owner's all tokens.
     * @param {boolean} approved This operator will be approved if `true`. The operator will be disallowed if `false`.
     * @param {Contract.SendOptios} [sendParam] (optional) An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async setApprovalForAll(operator, approved, sendParam = {}) {
        const executableObj = this.methods.setApprovalForAll(operator, approved)
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Safely transfers the given `amount` tokens of specific token type `id` from `from` to the `recipient`.
     *
     * The address who was approved to send the owner's token (the operator) or the token owner itself is expected to execute this token transferring transaction.
     * Thus, the approved one or the token owner should be the sender of this transaction whose address must be given at `sendParam.from` or `kip37.options.from`.
     * Without `sendParam.from` nor `kip37.options.from` being provided, an error would occur.
     *
     * If the `recipient` was a contract address, it should implement `IKIP37Receiver.onKIP37Received`. Otherwise, the transfer is reverted.
     *
     * @example
     * const receipt = await kip37.safeTransferFrom('0x{address in hex}', '0x{address in hex}', 2, 10000, { from: '0x{address in hex}' })
     *
     * @param {string} from The address of the account that owns the token to be sent with allowance mechanism.
     * @param {string} to The address of the account to receive the token.
     * @param {BigNumber|string|number} id The token id to transfer.
     * @param {BigNumber|string|number} amount The amount of token you want to transfer.
     * @param {Buffer|string|number} [data] (optional) The data to send along with the call.
     * @param {Contract.SendOptios} [sendParam] (optional) An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async safeTransferFrom(from, to, id, amount, data, sendParam = {}) {
        if (data && _.isObject(data)) {
            if (data.gas !== undefined || data.from !== undefined) {
                if (Object.keys(sendParam).length > 0) throw new Error(`Invalid parameters`)
                sendParam = data
                data = Buffer.from('')
            }
        }

        if (data && !_.isBuffer(data)) {
            if (_.isString(data) && !isHexStrict(data)) data = toHex(data)
            data = toBuffer(data)
        }

        const executableObj = this.methods.safeTransferFrom(from, to, formatParamForUint256(id), formatParamForUint256(amount), data)
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Safely batch transfers of multiple token ids and values from `from` to the `recipient`.
     *
     * The address who was approved to send the owner's token (the operator) or the token owner itself is expected to execute this token transferring transaction.
     * Thus, the approved one or the token owner should be the sender of this transaction whose address must be given at `sendParam.from` or `kip37.options.from`.
     * Without `sendParam.from` nor `kip37.options.from` being provided, an error would occur.
     *
     * If the `recipient` was a contract address, it should implement `IKIP37Receiver.onKIP37Received`. Otherwise, the transfer is reverted.
     *
     * @example
     * const receipt = await kip37.safeBatchTransferFrom('0x{address in hex}', '0x{address in hex}', [1, 2], [10, 1000], { from: '0x{address in hex}' })
     *
     * @param {string} from The address of the account that owns the token to be sent with allowance mechanism.
     * @param {string} recipient The address of the account to receive the token.
     * @param {Array.<BigNumber|string|number>} ids An array of the token ids to transfer.
     * @param {Array.<BigNumber|string|number>} amounts An array of the token amounts you want to transfer.
     * @param {Buffer|string|number} [data] (optional) The data to send along with the call.
     * @param {Contract.SendOptios} [sendParam] (optional) An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async safeBatchTransferFrom(from, recipient, ids, amounts, data, sendParam = {}) {
        if (data && _.isObject(data)) {
            if (data.gas !== undefined || data.from !== undefined) {
                if (Object.keys(sendParam).length > 0) throw new Error(`Invalid parameters`)
                sendParam = data
                data = Buffer.from('')
            }
        }

        if (data && !_.isBuffer(data)) {
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

        const executableObj = this.methods.safeBatchTransferFrom(from, recipient, formattedTokenIds, formattedTokenAmounts, data)

        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Mints the token of the specific token type `id` and assigns the tokens according to the variables `to` and `value`.
     * The mint function allows you to mint specific token to multiple accounts at once by passing arrays `to` to and `value` as parameters.
     *
     * If `sendParam.from` or `kip37.options.from` were given, it should be a minter with MinterRole.
     *
     * @example
     * const receipt = await kip37.mint('0x{address in hex}', 2, 1000, { from: '0x{address in hex}' })
     *
     * @param {string|Array.<string>} toList An address of the account or an array of addresses to which the minted token will be issued.
     * @param {BigNumber|string|number} id The token id to mint.
     * @param {BigNumber|string|number|Array.<BigNumber|string|number>} values The amount of token to be minted. If an array containing multiple addresses is delivered to `to` parameter, the value must be delivered in the form of an array.
     * @param {Contract.SendOptios} [sendParam] (optional) An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
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

        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Mints the multiple KIP-37 tokens of the specific token types `ids` in a batch and assigns the tokens according to the variables `to` and `values`.
     *
     * If `sendParam.from` or `kip37.options.from` were given, it should be a minter with MinterRole.
     *
     * @example
     * const receipt = await kip37.mintBatch('0x{address in hex}', [1, 2], [100, 200], { from: '0x{address in hex}' })
     *
     * @param {string} to An address of the account to which the minted tokens will be issued.
     * @param {Array.<BigNumber|string|number>} ids An array of the token ids to mint.
     * @param {Array.<BigNumber|string|number>} values An array of the token amounts to mint.
     * @param {Contract.SendOptios} [sendParam] (optional) An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
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
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Adds an account as a minter, who are permitted to mint tokens.
     *
     * If `sendParam.from` or `kip37.options.from` were given, it should be a minter with MinterRole.
     *
     * @example
     * const receipt = await kip37.addMinter('0x{address in hex}', { from: '0x{address in hex}' })
     *
     * @param {string} account The address of the account to be added as a minter.
     * @param {Contract.SendOptios} [sendParam] (optional) An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async addMinter(account, sendParam = {}) {
        const executableObj = this.methods.addMinter(account)
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Renounces the right to mint tokens. Only a minter address can renounce the minting right.
     *
     * If `sendParam.from` or `kip37.options.from` were given, it should be a minter with MinterRole.
     *
     * @example
     * const receipt = await kip37.renounceMinter({ from: '0x{address in hex}' })
     *
     * @param {Contract.SendOptios} [sendParam] (optional) An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async renounceMinter(sendParam = {}) {
        const executableObj = this.methods.renounceMinter()
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Burns specific KIP-37 tokens.
     *
     * The address who was approved to operate the owner's token (the operator) or the token owner itself is expected to execute this token transferring transaction.
     * Thus, the approved one or the token owner should be the sender of this transaction whose address must be given at `sendParam.from` or `kip37.options.from`.
     * Without `sendParam.from` nor `kip37.options.from` being provided, an error would occur.
     *
     * @example
     * const receipt = await kip37.burn('0x{address in hex}', 2, 10, { from: '0x{address in hex}' })
     *
     * @param {string} account The address of the account that owns the token to be destroyed.
     * @param {BigNumber|string|number} id The id of token to be destroyed.
     * @param {BigNumber|string|number} value The amount of token to be destroyed.
     * @param {Contract.SendOptios} [sendParam] (optional) An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async burn(account, id, value, sendParam = {}) {
        const executableObj = this.methods.burn(account, formatParamForUint256(id), formatParamForUint256(value))
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Burns the multiple KIP-37 tokens.
     *
     * The address who was approved to operate the owner's token (the operator) or the token owner itself is expected to execute this token transferring transaction.
     * Thus, the approved one or the token owner should be the sender of this transaction whose address must be given at `sendParam.from` or `kip37.options.from`.
     * Without `sendParam.from` nor `kip37.options.from` being provided, an error would occur.
     *
     * @example
     * const receipt = await kip37.burnBatch('0x{address in hex}', [1, 2], [100, 200], { from: '0x{address in hex}' })
     *
     * @param {string} account The address of the account that owns the token to be destroyed.
     * @param {Array.<BigNumber|string|number>} ids An array of the token ids to burn.
     * @param {Array.<BigNumber|string|number>} values An array of the token amounts to burn.
     * @param {Contract.SendOptios} [sendParam] (optional) An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
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
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Suspends functions related to token operation.
     * If `id` parameter is defined, pause the specific token. Otherwise pause the token contract.
     *
     * If `sendParam.from` or `kip37.options.from` were given, it should be a pauser with PauserRole.
     *
     * @example
     * const receipt = await kip37.pause({ from: '0x{address in hex}' })
     *
     * @param {BigNumber|string|number} [id] The token id to pause. If this parameter is omitted, the `pause` function pause the token contract.
     * @param {Contract.SendOptios} [sendParam] (optional) An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async pause(id, sendParam = {}) {
        if (Object.keys(sendParam).length === 0 && _.isObject(id)) {
            sendParam = id
            id = undefined
        }

        const executableObj = id !== undefined ? this.methods.pause(formatParamForUint256(id)) : this.methods.pause()
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Resumes the paused contract or specific token.
     * If `id` parameter is defined, unpause the specific token. Otherwise unpause the token contract.
     *
     * If `sendParam.from` or `kip37.options.from` were given, it should be a pauser with PauserRole.
     *
     * @example
     * const receipt = await kip37.unpause({ from: '0x{address in hex}' })
     *
     * @param {BigNumber|string|number} [id] The token id to unpause. If this parameter is omitted, the `unpause` function unpause the token contract.
     * @param {Contract.SendOptios} [sendParam] (optional) An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async unpause(id, sendParam = {}) {
        if (Object.keys(sendParam).length === 0 && _.isObject(id)) {
            sendParam = id
            id = undefined
        }

        const executableObj = id !== undefined ? this.methods.unpause(formatParamForUint256(id)) : this.methods.unpause()
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Adds an account as a pauser that has the right to suspend the contract.
     *
     * If `sendParam.from` or `kip37.options.from` were given, it should be a pauser with PauserRole.
     *
     * @example
     * const receipt = await kip37.addPauser('0x{address in hex}', { from: '0x{address in hex}' })
     *
     * @param {string} account The address of the account to be a new pauser.
     * @param {Contract.SendOptios} [sendParam] (optional) An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async addPauser(account, sendParam = {}) {
        const executableObj = this.methods.addPauser(account)
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * Renounces the right to pause the contract. Only a pauser address can renounce the pausing right.
     *
     * If `sendParam.from` or `kip37.options.from` were given, it should be a pauser with PauserRole.
     *
     * @example
     * const receipt = await kip37.renouncePauser({ from: '0x{address in hex}' })
     *
     * @param {Contract.SendOptios} [sendParam] (optional) An object holding parameters that are required for sending a transaction.
     * @return {Promise<object>} A receipt containing the execution result of the transaction for executing the KIP-37 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-37 abi.
     */
    async renouncePauser(sendParam = {}) {
        const executableObj = this.methods.renouncePauser()
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }
}

/**
 * The byte code of the KIP-37 token contract.
 *
 * @example
 * caver.kct.kip37.byteCode
 *
 * @static
 * @type {string}
 */
KIP37.byteCode = kip37ByteCode

/**
 * The abi of the KIP-37 token contract.
 *
 * @example
 * caver.kct.kip37.abi
 *
 * @static
 * @type {Array.<object>}
 */
KIP37.abi = kip37JsonInterface

module.exports = KIP37
