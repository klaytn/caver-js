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
const KIP13 = require('../src/kip13')

class KIP17 extends Contract {
    /**
     * deploy deploys a KIP-17 token contract to Klaytn network.
     * `const deployedContract = await caver.kct.kip17.deploy({
     *      name: 'TokenName',
     *      symbol: 'TKN',
     *  }, '0x{address in hex}')`
     *
     * @method deploy
     * @param {Object} tokenInfo The object that defines the name and symbol of the token to deploy.
     * @param {Object|String} sendOptions The address of the account to deploy the KIP-17 token contract or an object holding parameters that are required for sending a transaction.
     * @return {Object}
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
     * detectInterface detects which interface the KIP-17 token contract supports.
     *
     * @method detectInterface
     * @param {string} contractAddress The address of the KIP-17 token contract to detect.
     * @return {object}
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

    clone(tokenAddress = this.options.address) {
        const cloned = new this.constructor(tokenAddress, this.options.jsonInterface)
        cloned.setWallet(this._wallet)
        return cloned
    }

    /**
     * detectInterface detects which interface the KIP-17 token contract supports.
     *
     * @method detectInterface
     * @return {object}
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
     * supportsInterface checks whether interface is supported or not.
     *
     * @method supportsInterface
     * @param {string} interfaceId The interface id to check.
     * @return {boolean}
     */
    async supportsInterface(interfaceId) {
        const isSupported = await this.methods.supportsInterface(interfaceId).call()
        return isSupported
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
     * tokenURI returns the uri of the token.
     *
     * @method tokenURI
     * @param {BigNumber|String|Number} tokenId The id of the token.
     * @return {String}
     */
    async tokenURI(tokenId) {
        const tokenURI = await this.methods.tokenURI(formatParamForUint256(tokenId)).call()
        return tokenURI
    }

    /**
     * totalSupply returns the total amount of tokens stored by the contract.
     *
     * @method totalSupply
     * @return {BigNumber}
     */
    async totalSupply() {
        const totalSupply = await this.methods.totalSupply().call()
        return new BigNumber(totalSupply)
    }

    /**
     * tokenOfOwnerByIndex returns the token id at a given index of the tokens list of the requested owner.
     *
     * @method tokenOfOwnerByIndex
     * @param {String} owner The address of the account whose token you want to query.
     * @param {BigNumber|String|Number} index The index of the token to be searched among the tokens owned by a owner account.
     * @return {BigNumber}
     */
    async tokenOfOwnerByIndex(owner, index) {
        const token = await this.methods.tokenOfOwnerByIndex(owner, formatParamForUint256(index)).call()
        return new BigNumber(token)
    }

    /**
     * tokenByIndex returns the token id at a given index of all the tokens in this contract.
     *
     * @method tokenByIndex
     * @param {BigNumber|String|Number} index The index of the token to query.
     * @return {BigNumber}
     */
    async tokenByIndex(index) {
        const token = await this.methods.tokenByIndex(formatParamForUint256(index)).call()
        return new BigNumber(token)
    }

    /**
     * balanceOf returns the balance of the specified address.
     * The balance of an account in KIP-17 means that the total number of NFT(Non Fungible Token) owned by the account.
     *
     * @method balanceOf
     * @param {String} account The address of the account whose number of tokens you want to see.
     * @return {BigNumber}
     */
    async balanceOf(account) {
        const balance = await this.methods.balanceOf(account).call()
        return new BigNumber(balance)
    }

    /**
     * ownerOf returns the owner of the specified token id.
     *
     * @method ownerOf
     * @param {BigNumber|String|Number} tokenId The id of the token.
     * @return {BigNumber}
     */
    async ownerOf(tokenId) {
        const owner = await this.methods.ownerOf(formatParamForUint256(tokenId)).call()
        return owner
    }

    /**
     * getApproved returns the approved address for a token id, or zero if no address set.
     *
     * @method getApproved
     * @param {BigNumber|String|Number} tokenId The id of the token.
     * @return {Boolean}
     */
    async getApproved(tokenId) {
        const isApproved = await this.methods.getApproved(formatParamForUint256(tokenId)).call()
        return isApproved
    }

    /**
     * isApprovedForAll returns true if an operator is approved by a given owner.
     *
     * @method isApprovedForAll
     * @param {String} owner The id of the token.
     * @param {String} operator The id of the token.
     * @return {Boolean}
     */
    async isApprovedForAll(owner, operator) {
        const isApprovedForAll = await this.methods.isApprovedForAll(owner, operator).call()
        return isApprovedForAll
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
     * approve sets approval with another address to transfer the given token id.
     *
     * @method approve
     * @param {String} to The address of the account to use on behalf of owner for the tokenId.
     * @param {BigNumber|String|Number} tokenId The id of token the spender allows to use on behalf of the owner.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async approve(to, tokenId, sendParam = {}) {
        const executableObj = this.methods.approve(to, formatParamForUint256(tokenId))
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * setApprovalForAll sets or unsets the approval of a given operator.
     * An operator is allowed to transfer all tokens of the sender on their behalf.
     *
     * @method setApprovalForAll
     * @param {String} to The address of an account to allow/forbid for transfer of all tokens owned by the owner on behalf of the owner.
     * @param {Boolean} approved Whether to allow sending tokens on behalf of the owner.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async setApprovalForAll(to, approved, sendParam = {}) {
        const executableObj = this.methods.setApprovalForAll(to, approved)
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * transferFrom transfers the ownership of a given token id to another address.
     *
     * @method transferFrom
     * @param {String} from The address of the owner or approved of the given token.
     * @param {String} to The address of the account to receive the token.
     * @param {BigNumber|String|Number} tokenId The id of token you want to transfer.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async transferFrom(from, to, tokenId, sendParam = {}) {
        const executableObj = this.methods.transferFrom(from, to, formatParamForUint256(tokenId))
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * safeTransferFrom safely transfers the ownership of a given token id to another address.
     *
     * @method safeTransferFrom
     * @param {String} from The address of the owner or approved of the given token.
     * @param {String} to The address of the account to receive the token.
     * @param {BigNumber|String|Number} tokenId The id of token you want to transfer.
     * @param {Buffer|String|Number} data The optional data to send along with the call.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
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
     * addMinter adds an account as a minter that has the permission of MinterRole and can mint.
     * The account sending transaction to execute the addMinter must be a Minter with a MinterRole.
     *
     * @method addMinter
     * @param {String} account The address of account to add as minter.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async addMinter(account, sendParam = {}) {
        const executableObj = this.methods.addMinter(account)
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * renounceMinter renounces privilege of MinterRole.
     * The account sending transaction to execute the renounceMinter must be a Minter with a MinterRole.
     *
     * @method renounceMinter
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async renounceMinter(sendParam = {}) {
        const executableObj = this.methods.renounceMinter()
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * mint creates token and assigns them to account, increasing the total supply.
     *
     * @method mint
     * @param {String} to The address of the account to which the minted token will be allocated.
     * @param {BigNumber|String|Number} tokenId The id of token to mint.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async mint(to, tokenId, sendParam = {}) {
        const executableObj = this.methods.mint(to, formatParamForUint256(tokenId))
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * mintWithTokenURI creates token with uri and assigns them to account, increasing the total supply.
     *
     * @method mintWithTokenURI
     * @param {String} to The address of the account to which the minted token will be allocated.
     * @param {BigNumber|String|Number} tokenId The id of token to mint.
     * @param {String} tokenURI The uri of token to mint.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async mintWithTokenURI(to, tokenId, tokenURI, sendParam = {}) {
        const executableObj = this.methods.mintWithTokenURI(to, formatParamForUint256(tokenId), tokenURI)
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * burn destroys a specific KIP-17 token.
     *
     * @method burn
     * @param {BigNumber|String|Number} tokenId The id of token to destroy.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async burn(tokenId, sendParam = {}) {
        const executableObj = this.methods.burn(formatParamForUint256(tokenId))
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * pause triggers stopped state that stops sending tokens in emergency situation.
     * The account sending transaction to execute the pause must be a Pauser with a PauserRole.
     *
     * @method pause
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async pause(sendParam = {}) {
        const executableObj = this.methods.pause()
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

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
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async unpause(sendParam = {}) {
        const executableObj = this.methods.unpause()
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * addPauser adds an account as a pauser that has the permission of PauserRole and can pause.
     * The account sending transaction to execute the addPauser must be a Pauser with a PauserRole.
     *
     * @method addPauser
     * @param {String} account The address of account to add as pauser.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async addPauser(account, sendParam = {}) {
        const executableObj = this.methods.addPauser(account)
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }

    /**
     * renouncePauser renounces privilege of PauserRole.
     * The account sending transaction to execute the renouncePauser must be a Pauser with a PauserRole.
     *
     * @method renouncePauser
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async renouncePauser(sendParam = {}) {
        const executableObj = this.methods.renouncePauser()
        sendParam = await determineSendParams(executableObj, sendParam, this.options)

        return executableObj.send(sendParam)
    }
}

KIP17.byteCode = kip17ByteCode
module.exports = KIP17
