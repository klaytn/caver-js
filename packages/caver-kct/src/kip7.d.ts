import BigNumber from 'bignumber.js'
import Contract from '../../caver-contract'

export interface KIP7_I extends Contract {
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
    deploy(tokenInfo: object, deployer: string): object

    new (tokenAddress?: string): KIP7
}

export default class KIP7 extends Contract {
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
    static deploy(tokenInfo: object, deployer: string): object

    constructor(tokenAddress?: string)

    /**
     * clone copies a KIP7 instance with the new address parameter set to the target contract address.
     *
     * @method clone
     * @param {String} tokenAddress The address of the token contract.
     * @return {Object}
     */
    clone(tokenAddress: string = this.options.address): object
    /**
     * supportsInterface checks whether interface is supported or not.
     *
     * @method supportsInterface
     * @return {Boolean}
     */
    async supportsInterface(interfaceId): boolean

    /**
     * name returns the name of the token.
     *
     * @method name
     * @return {String}
     */
    async name(): string

    /**
     * symbol returns the symbol of the token.
     *
     * @method symbol
     * @return {String}
     */
    async symbol(): string

    /**
     * decimals returns the decimals of the token.
     *
     * @method symbol
     * @return {Number}
     */
    async decimals(): number

    /**
     * totalSupply returns the total supply of the token.
     *
     * @method totalSupply
     * @return {BigNumber}
     */
    async totalSupply(): BigNumber

    /**
     * balanceOf returns the balance of the account.
     *
     * @method balanceOf
     * @param {String} account The address of the account for which you want to see balance.
     * @return {BigNumber}
     */
    async balanceOf(account: string): BigNumber

    /**
     * allowance returns the amount the spender is allowed to use on behalf of the owner.
     *
     * @method allowance
     * @param {String} owner The address of the account that set the spender to use the money on behalf of the owner.
     * @param {String} spender The address of the account that received the approve amount that can be used on behalf of the owner.
     * @return {BigNumber}
     */
    async allowance(owner: string, spender: string): BigNumber

    /**
     * isMinter returns whether the account is minter or not.
     *
     * @method isMinter
     * @param {String} account The address of the account you want to check minter or not.
     * @return {Boolean}
     */
    async isMinter(account: string): boolean

    /**
     * isPauser returns whether the account is pauser or not.
     *
     * @method isPauser
     * @param {String} account The address of the account you want to check pauser or not.
     * @return {Boolean}
     */
    async isPauser(account: string): boolean

    /**
     * paused returns whether or not the token contract's transaction is paused.
     *
     * @method paused
     * @return {Boolean}
     */
    async paused(): boolean

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
    async approve(spender: string, amount: BigNumber | string | number, sendParam: object = {}): object

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
    async transfer(recipient: string, amount: BigNumber | string | number, sendParam: object = {}): object

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
    async transferFrom(sender: string, recipient: string, amount: BigNumber | string | number, sendParam: object = {}): object

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
    async safeTransfer(
        recipient: string,
        amount: BigNumber | string | number,
        data?: Buffer | string | number,
        sendParam?: object = {}
    ): object

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
    async safeTransferFrom(
        sender: string,
        recipient: string,
        amount: BigNumber | string | number,
        data: Buffer | string | number,
        sendParam: object = {}
    ): object {
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
    async mint(account: string, amount: BigNumber | string | number, sendParam: object = {}): object {
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
    async addMinter(account: string, sendParam: object = {}): object {
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
    async renounceMinter(sendParam: object = {}): object {
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
    async burn(amount: BigNumber | string | number, sendParam: object = {}): object {
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
    async burnFrom(account: string, amount: BigNumber | string | number, sendParam: object = {}): object

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
    async addPauser(account: string, sendParam: object = {}): object

    /**
     * pause triggers stopped state that stops sending tokens in emergency situation.
     * The account sending transaction to execute the pause must be a Pauser with a PauserRole.
     *
     * @method pause
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async pause(sendParam: object = {}): object

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
    async unpause(sendParam: object = {}): object

    /**
     * renouncePauser renounces privilege of PauserRole.
     * The account sending transaction to execute the renouncePauser must be a Pauser with a PauserRole.
     *
     * @method renouncePauser
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-7 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-7 abi.
     */
    async renouncePauser(sendParam: object = {}): object
}
