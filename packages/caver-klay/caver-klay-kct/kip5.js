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

const Contract = require('../caver-klay-contract/src')
const { validateTokenInfoForDeploy, determineSendParams, kip5JsonInterface, kip5ByteCode } = require('./kctHelper')

class KIP5 extends Contract {
    static deploy(tokenInfo, deployer) {
        validateTokenInfoForDeploy(tokenInfo)

        const { name, symbol, decimals, initialSupply } = tokenInfo
        const erc20 = new KIP5()

        return erc20
            .deploy({
                data: kip5ByteCode,
                arguments: [name, symbol, decimals, initialSupply],
            })
            .send({ from: deployer, gas: 3500000, value: 0 })
    }

    constructor(tokenAddress, abi = kip5JsonInterface) {
        super(abi, tokenAddress)
    }

    clone(tokenAddress) {
        return new this.constructor(tokenAddress)
    }

    name() {
        return this.methods.name().call()
    }

    symbol() {
        return this.methods.symbol().call()
    }

    decimals() {
        return this.methods.decimals().call()
    }

    totalSupply() {
        return this.methods.totalSupply().call()
    }

    balanceOf(account) {
        return this.methods.balanceOf(account).call()
    }

    allowance(owner, spender) {
        return this.methods.allowance(owner, spender).call()
    }

    async approve(spender, amount, sendParam = {}) {
        const executableObj = this.methods.approve(spender, amount)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async transfer(to, amount, sendParam = {}) {
        const executableObj = this.methods.transfer(to, amount)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }

    async transferFrom(from, to, amount, sendParam = {}) {
        const executableObj = this.methods.transferFrom(from, to, amount)
        sendParam = await determineSendParams(executableObj, sendParam, this.options.from)

        return executableObj.send(sendParam)
    }
}

module.exports = KIP5
