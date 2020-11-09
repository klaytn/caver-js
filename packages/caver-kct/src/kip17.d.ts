import BigNumber from 'bignumber.js'

import Contract from '../../caver-contract'

export interface KIP17 extends Contract {
    /**
     * deploy deploys a KIP-17 token contract to Klaytn network.
     * `const deployedContract = await caver.klay.KIP17.deploy({
     *      name: 'TokenName',
     *      symbol: 'TKN',
     *  }, '0x{address in hex}')`
     *
     * @method deploy
     * @param {Object} tokenInfo The object that defines the name and symbol of the token to deploy.
     * @param {String} deployer The address of the account to deploy the KIP-17 token contract.
     * @return {Object}
     */
    deploy(tokenInfo: object, deployer: string): object

    new (tokenAddress?: string): KIP17
}

export default class KIP17 extends Contract {
    /**
     * deploy deploys a KIP-17 token contract to Klaytn network.
     * `const deployedContract = await caver.klay.KIP17.deploy({
     *      name: 'TokenName',
     *      symbol: 'TKN',
     *  }, '0x{address in hex}')`
     *
     * @method deploy
     * @param {Object} tokenInfo The object that defines the name and symbol of the token to deploy.
     * @param {String} deployer The address of the account to deploy the KIP-17 token contract.
     * @return {Object}
     */
    static deploy(tokenInfo: object, deployer: string): object

    constructor(tokenAddress?: string)

    clone(tokenAddress = this.options.address)

    async supportsInterface(interfaceId)

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
     * tokenURI returns the uri of the token.
     *
     * @method tokenURI
     * @param {BigNumber|String|Number} tokenId The id of the token.
     * @return {String}
     */
    async tokenURI(tokenId: BigNumber | string | number): string

    /**
     * totalSupply returns the total amount of tokens stored by the contract.
     *
     * @method totalSupply
     * @return {BigNumber}
     */
    async totalSupply(): BigNumber
    /**
     * tokenOfOwnerByIndex returns the token id at a given index of the tokens list of the requested owner.
     *
     * @method tokenOfOwnerByIndex
     * @param {String} owner The address of the account whose token you want to query.
     * @param {BigNumber|String|Number} index The index of the token to be searched among the tokens owned by a owner account.
     * @return {BigNumber}
     */
    async tokenOfOwnerByIndex(owner: string, index: BigNumber | string | number): BigNumber

    /**
     * tokenByIndex returns the token id at a given index of all the tokens in this contract.
     *
     * @method tokenByIndex
     * @param {BigNumber|String|Number} index The index of the token to query.
     * @return {BigNumber}
     */
    async tokenByIndex(index: BigNumber | string | number): BigNumber

    /**
     * balanceOf returns the balance of the specified address.
     * The balance of an account in KIP-17 means that the total number of NFT(Non Fungible Token) owned by the account.
     *
     * @method balanceOf
     * @param {String} account The address of the account whose number of tokens you want to see.
     * @return {BigNumber}
     */
    async balanceOf(account: string): BigNumber

    /**
     * ownerOf returns the owner of the specified token id.
     *
     * @method ownerOf
     * @param {BigNumber|String|Number} tokenId The id of the token.
     * @return {BigNumber}
     */
    async ownerOf(tokenId: BigNumber | string | number): BigNumber

    /**
     * getApproved returns the approved address for a token id, or zero if no address set.
     *
     * @method getApproved
     * @param {BigNumber|String|Number} tokenId The id of the token.
     * @return {Boolean}
     */
    async getApproved(tokenId: BigNumber | string | number): boolean

    /**
     * isApprovedForAll returns true if an operator is approved by a given owner.
     *
     * @method isApprovedForAll
     * @param {String} owner The id of the token.
     * @param {String} operator The id of the token.
     * @return {Boolean}
     */
    async isApprovedForAll(owner: string, operator: string): boolean

    /**
     * isMinter returns whether the account is minter or not.
     *
     * @method isMinter
     * @param {String} account The address of the account you want to check minter or not.
     * @return {Boolean}
     */
    async isMinter(account: string): boolean

    /**
     * paused returns whether or not the token contract's transaction is paused.
     *
     * @method paused
     * @return {Boolean}
     */
    async paused(): boolean

    /**
     * isPauser returns whether the account is pauser or not.
     *
     * @method isPauser
     * @param {String} account The address of the account you want to check pauser or not.
     * @return {Boolean}
     */
    async isPauser(account: string): boolean

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
    async approve(to: string, tokenId: BigNumber | string | number, sendParam: object = {}): object
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
    async setApprovalForAll(to: string, approved: boolean, sendParam: object = {}): object

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
    async transferFrom(from: string, to: string, tokenId: BigNumber | string | number, sendParam: object = {}): object
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
    async safeTransferFrom(
        from: string,
        to: string,
        tokenId: BigNumber | string | number,
        data: Buffer | string | number,
        sendParam?: object = {}
    ): object

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
    async addMinter(account: string, sendParam: object = {}): object

    /**
     * renounceMinter renounces privilege of MinterRole.
     * The account sending transaction to execute the renounceMinter must be a Minter with a MinterRole.
     *
     * @method renounceMinter
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async renounceMinter(sendParam: object = {}): object

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
    async mint(to: string, tokenId: BigNumber | string | number, sendParam: object = {}): object

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
    async mintWithTokenURI(to: string, tokenId: BigNumber | string | number, tokenURI: string, sendParam?: object): object

    /**
     * burn destroys a specific KIP-17 token.
     *
     * @method burn
     * @param {BigNumber|String|Number} tokenId The id of token to destroy.
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async burn(tokenId: BigNumber | string | number, sendParam: object = {}): object

    /**
     * pause triggers stopped state that stops sending tokens in emergency situation.
     * The account sending transaction to execute the pause must be a Pauser with a PauserRole.
     *
     * @method pause
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
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
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async unpause(sendParam: object = {}): object

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
    async addPauser(account: string, sendParam: object = {}): object

    /**
     * renouncePauser renounces privilege of PauserRole.
     * The account sending transaction to execute the renouncePauser must be a Pauser with a PauserRole.
     *
     * @method renouncePauser
     * @param {Object} sendParam An object with defined parameters for sending a transaction.
     * @return {Object} A receipt containing the execution result of the transaction for executing the KIP-17 token contract.
     *                  In this receipt, instead of the logs property, there is an events property parsed by KIP-17 abi.
     */
    async renouncePauser(sendParam: object = {}): object
}
