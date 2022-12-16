/*
    Copyright 2022 The caver-js Authors
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

const { expect } = require('chai')

const Caver = require('../index')
const testRPCURL = require('./testrpc')

const { kip7JsonInterface, kip7ByteCode } = require('../packages/caver-kct/src/kctHelper')

const caver = new Caver(testRPCURL)

let sender
let feePayer
let password

before(() => {
    const senderPrvKey =
        process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
            ? `0x${process.env.privateKey}`
            : process.env.privateKey
    const feePayerPrvKey =
        process.env.privateKey2 && String(process.env.privateKey2).indexOf('0x') === -1
            ? `0x${process.env.privateKey2}`
            : process.env.privateKey2

    // Add keyrings to `caver.wallet` (common architecture)
    sender = caver.wallet.add(caver.wallet.keyring.createFromPrivateKey(senderPrvKey))
    feePayer = caver.wallet.add(caver.wallet.keyring.createFromPrivateKey(feePayerPrvKey))

    // Add accounts to `caver.klay.accounts.wallet` (before common architecture)
    caver.klay.accounts.wallet.add(senderPrvKey)
    caver.klay.accounts.wallet.add(feePayerPrvKey)

    password = process.env.password ? process.env.password : 'password'
})

async function fillKlay(amount) {
    const filled = caver.wallet.keyring.generate()

    const tx = caver.transaction.valueTransfer.create({
        from: sender.address,
        to: filled.address,
        gas: 10000000,
        value: caver.utils.convertToPeb(amount, 'KLAY'),
    })
    await caver.wallet.sign(sender.address, tx)
    await caver.rpc.klay.sendRawTransaction(tx)

    return filled
}

async function generateTxsBomb(generator, num = 2000) {
    const input =
        '0x608060405234801561001057600080fd5b506101de806100206000396000f3006080604052600436106100615763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416631a39d8ef81146100805780636353586b146100a757806370a08231146100ca578063fd6b7ef8146100f8575b3360009081526001602052604081208054349081019091558154019055005b34801561008c57600080fd5b5061009561010d565b60408051918252519081900360200190f35b6100c873ffffffffffffffffffffffffffffffffffffffff60043516610113565b005b3480156100d657600080fd5b5061009573ffffffffffffffffffffffffffffffffffffffff60043516610147565b34801561010457600080fd5b506100c8610159565b60005481565b73ffffffffffffffffffffffffffffffffffffffff1660009081526001602052604081208054349081019091558154019055565b60016020526000908152604090205481565b336000908152600160205260408120805490829055908111156101af57604051339082156108fc029083906000818181858888f193505050501561019c576101af565b3360009081526001602052604090208190555b505600a165627a7a72305820627ca46bb09478a015762806cc00c431230501118c7c26c30ac58c4e09e51c4f0029'

    caver.wallet.add(generator)

    let senderNonce = caver.utils.hexToNumber(await caver.rpc.klay.getTransactionCount(generator.address, 'pending'))
    for (let i = 0; i < num; i++) {
        const tx = caver.transaction.smartContractDeploy.create({
            from: generator.address,
            input,
            gas: 10000000,
            nonce: senderNonce,
        })
        await caver.wallet.sign(generator.address, tx)
        caver.rpc.klay.sendRawTransaction(tx)
        senderNonce++
    }
}

async function validateGasFeeWithReceipt(receipt) {
    const gasPriceInReceipt = caver.utils.hexToNumber(receipt.gasPrice)
    const gasPriceAtReceiptBlock = await caver.rpc.klay.getGasPriceAt(receipt.blockNumber) // Klaytn will return baseFee
    // console.log(`gasPriceInReceipt: ${gasPriceInReceipt} / gasPriceAtReceiptBlock: ${caver.utils.hexToNumber(gasPriceAtReceiptBlock)}`)

    // To process a transaction, the gasPrice of the tx should be equal or bigger than baseFee(effectiveGasPrice)
    if (caver.utils.hexToNumber(receipt.effectiveGasPrice) > gasPriceInReceipt) {
        // console.log(`caver.utils.hexToNumber(receipt.effectiveGasPrice)(${caver.utils.hexToNumber(receipt.effectiveGasPrice)}) > gasPriceInReceipt(${gasPriceInReceipt})`)
        return false
    }

    // effectiveGasPrice should be defined by baseFee used gas price when tx is processed
    if (receipt.effectiveGasPrice !== gasPriceAtReceiptBlock) {
        // console.log(`receipt.effectiveGasPrice(${receipt.effectiveGasPrice}) !== gasPriceAtReceiptBlock(${gasPriceAtReceiptBlock})`)
        return false
    }

    // Set gasPrice with `baseFee * 2`, so should be bigger than gas price of the block
    if (caver.utils.hexToNumber(gasPriceAtReceiptBlock) > gasPriceInReceipt) {
        // console.log(`gasPriceAtReceiptBlock(${caver.utils.hexToNumber(gasPriceAtReceiptBlock)}) < gasPriceInReceipt(${gasPriceInReceipt})`)
        return false
    }
    return true
}

async function validateDynamicFeeTxWithReceipt(receipt) {
    const maxFeePerGas = caver.utils.hexToNumber(receipt.maxFeePerGas)
    const gasPriceAtReceiptBlock = await caver.rpc.klay.getGasPriceAt(receipt.blockNumber) // Klaytn will return baseFee
    // console.log(`maxFeePerGas: ${maxFeePerGas} / gasPriceAtReceiptBlock: ${caver.utils.hexToNumber(gasPriceAtReceiptBlock)}`)

    // To process a transaction, the maxFeePerGas of the tx should be equal or bigger than baseFee(effectiveGasPrice)
    if (caver.utils.hexToNumber(receipt.effectiveGasPrice) > maxFeePerGas) return false

    // Set gasPrice with `baseFee * 2`
    if (caver.utils.hexToNumber(gasPriceAtReceiptBlock) > maxFeePerGas) return false
    return true
}

async function validateGasPrice(tx) {
    // Klaytn will return baseFee
    const baseFeeAtCurrentBlock = caver.utils.hexToNumber((await caver.rpc.klay.getHeader()).baseFeePerGas)

    // If transaction type is TxTypeEthereumDynamicFee,
    // validate `maxPriorityFeePerGas` and `maxFeePerGas`.
    if (tx.type.includes('DynamicFee')) {
        const maxPriorityFeePerGas = await caver.rpc.klay.getMaxPriorityFeePerGas()
        if (tx.maxPriorityFeePerGas !== maxPriorityFeePerGas) return false
        // maxFeePerGas will be set with `baseFee * 2`, so maxFeePerGas cannnot be smaller than current base fee
        if (caver.utils.hexToNumber(tx.maxFeePerGas) < baseFeeAtCurrentBlock) return false
        return true
    }

    // gasPrice will be set with `baseFee * 2`, so gasPrice cannnot be smaller than current base fee
    if (caver.utils.hexToNumber(tx.gasPrice) < baseFeeAtCurrentBlock) return false
    return true
}

describe('Have to set correct value optional fields named gasPrice, maxFeePerGas or maxPriorityFeePerGas', () => {
    it('CAVERJS-UNIT-ETC-405: caver.contract operates with optional gasPrice value', async () => {
        // Generate many txs to increase baseFee
        generateTxsBomb(await fillKlay(100))

        // Deploy a contract without optional gasPrice field
        const contract = caver.contract.create(kip7JsonInterface)
        const receipt = await contract.deploy(
            {
                from: sender.address,
                gas: 50000000,
                contractDeployFormatter: r => {
                    return r
                },
            },
            kip7ByteCode,
            'Jamie',
            'JME',
            18,
            '10000000000000000'
        )
        expect(receipt).not.to.be.undefined
        expect(receipt.status).to.equal(true)
        expect(receipt.contractAddress).not.to.be.undefined
        let isValid = await validateGasFeeWithReceipt(receipt)
        expect(isValid).to.be.true

        // Generate many txs to increase baseFee
        generateTxsBomb(await fillKlay(100))

        // Execute a contract without optional gasPrice field
        contract.options.address = receipt.contractAddress
        const minterAddedReceipt = await contract.send(
            { from: sender.address, gas: 50000000 },
            'addMinter',
            caver.wallet.keyring.generate().address
        )
        expect(minterAddedReceipt).not.to.be.undefined
        expect(minterAddedReceipt.status).to.equal(true)
        expect(minterAddedReceipt.to.toLowerCase()).to.equal(receipt.contractAddress.toLowerCase())
        isValid = await validateGasFeeWithReceipt(minterAddedReceipt)
        expect(isValid).to.be.true

        // Sign a transaction to execute the smart contract without optional gasPrice field (basic tx)
        let signedTx = await contract.sign({ from: sender.address, gas: 50000000 }, 'addMinter', caver.wallet.keyring.generate().address)
        expect(signedTx.type).to.equal('TxTypeSmartContractExecution')
        expect(caver.utils.isEmptySig(signedTx.signatures)).to.be.false
        isValid = await validateGasPrice(signedTx)
        expect(isValid).to.be.true

        // Sign a transaction to execute the smart contract without optional gasPrice field (fd tx)
        signedTx = await contract.sign(
            { from: sender.address, gas: 50000000, feeDelegation: true },
            'addMinter',
            caver.wallet.keyring.generate().address
        )
        expect(signedTx.type).to.equal('TxTypeFeeDelegatedSmartContractExecution')
        expect(caver.utils.isEmptySig(signedTx.signatures)).to.be.false
        isValid = await validateGasPrice(signedTx)
        expect(isValid).to.be.true

        // Sign a transaction to execute the smart contract without optional gasPrice field (fdr tx)
        signedTx = await contract.sign(
            { from: sender.address, gas: 50000000, feeDelegation: true, feeRatio: 30 },
            'addMinter',
            caver.wallet.keyring.generate().address
        )
        expect(signedTx.type).to.equal('TxTypeFeeDelegatedSmartContractExecutionWithRatio')
        expect(caver.utils.isEmptySig(signedTx.signatures)).to.be.false
        isValid = await validateGasPrice(signedTx)
        expect(isValid).to.be.true

        // Sign a transaction as a fee payer to execute the smart contract without optional gasPrice field (fd tx)
        signedTx = await contract.signAsFeePayer(
            { from: sender.address, gas: 50000000, feeDelegation: true, feePayer: feePayer.address },
            'addMinter',
            caver.wallet.keyring.generate().address
        )
        expect(signedTx.type).to.equal('TxTypeFeeDelegatedSmartContractExecution')
        expect(caver.utils.isEmptySig(signedTx.feePayerSignatures)).to.be.false
        isValid = await validateGasPrice(signedTx)
        expect(isValid).to.be.true

        // Sign a transaction as a fee payer to execute the smart contract without optional gasPrice field (fdr tx)
        signedTx = await contract.signAsFeePayer(
            { from: sender.address, gas: 50000000, feeDelegation: true, feePayer: feePayer.address, feeRatio: 30 },
            'addMinter',
            caver.wallet.keyring.generate().address
        )
        expect(signedTx.type).to.equal('TxTypeFeeDelegatedSmartContractExecutionWithRatio')
        expect(caver.utils.isEmptySig(signedTx.feePayerSignatures)).to.be.false
        isValid = await validateGasPrice(signedTx)
        expect(isValid).to.be.true
    }).timeout(100000)

    it('CAVERJS-UNIT-ETC-406: caver.klay.Contract operates with optional gasPrice value', async () => {
        // Generate many txs to increase baseFee
        generateTxsBomb(await fillKlay(100))

        // Deploy a contract without optional gasPrice field
        const contract = new caver.klay.Contract(kip7JsonInterface)
        const receipt = await contract
            .deploy({
                data: kip7ByteCode,
                arguments: ['Jamie', 'JME', 18, '10000000000000000'],
            })
            .send({
                from: sender.address,
                gas: 50000000,
                value: 0,
                contractDeployFormatter: r => {
                    return r
                },
            })
        expect(receipt).not.to.be.undefined
        expect(receipt.status).to.equal(true)
        expect(receipt.contractAddress).not.to.be.undefined
        let isValid = await validateGasFeeWithReceipt(receipt)
        expect(isValid).to.be.true

        // Generate many txs to increase baseFee
        generateTxsBomb(await fillKlay(100))

        // Execute a contract without optional gasPrice field
        contract.options.address = receipt.contractAddress
        const minterAddedReceipt = await contract.methods
            .addMinter(caver.wallet.keyring.generate().address)
            .send({ from: sender.address, gas: 50000000 })
        expect(minterAddedReceipt).not.to.be.undefined
        expect(minterAddedReceipt.status).to.equal(true)
        expect(minterAddedReceipt.to.toLowerCase()).to.equal(receipt.contractAddress.toLowerCase())
        isValid = await validateGasFeeWithReceipt(minterAddedReceipt)
        expect(isValid).to.be.true
    }).timeout(100000)

    it('CAVERJS-UNIT-TRANSACTION-556: caver.transaction sign and signAsFeePayer signs with optional gasPrice value', async () => {
        // Generate many txs to increase baseFee
        generateTxsBomb(await fillKlay(100))

        // Test transaction.sign with basic tx
        let tx = caver.transaction.valueTransfer.create({
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 2500000,
        })
        await tx.sign(sender)
        let isValid = await validateGasPrice(tx)
        expect(isValid).to.be.true
        let receipt = await caver.rpc.klay.sendRawTransaction(tx)
        isValid = await validateGasFeeWithReceipt(receipt)
        expect(isValid).to.be.true

        // Test transaction.signAsFeePayer with fee delegation tx
        tx = caver.transaction.feeDelegatedValueTransfer.create({
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 2500000,
            feePayer: feePayer.address,
        })
        await tx.signAsFeePayer(feePayer)
        await tx.sign(sender)
        isValid = await validateGasPrice(tx)
        expect(isValid).to.be.true
        receipt = await caver.rpc.klay.sendRawTransaction(tx)
        isValid = await validateGasFeeWithReceipt(receipt)
        expect(isValid).to.be.true

        // Test transaction.sign with ethereum dynamic fee tx
        tx = caver.transaction.ethereumDynamicFee.create({
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 900000,
            accessList: [],
        })
        await tx.sign(sender)
        isValid = await validateGasPrice(tx)
        expect(isValid).to.be.true
        receipt = await caver.rpc.klay.sendRawTransaction(tx)
        isValid = await validateDynamicFeeTxWithReceipt(receipt)
        expect(isValid).to.be.true
    }).timeout(100000)

    it('CAVERJS-UNIT-WALLET-431: caver.wallet sign and signAsFeePayer signs with optional gasPrice value', async () => {
        // Generate many txs to increase baseFee
        generateTxsBomb(await fillKlay(100))

        // Test caver.wallet.sign with basic tx
        let tx = caver.transaction.valueTransfer.create({
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 2500000,
        })
        await caver.wallet.sign(sender.address, tx)
        let isValid = await validateGasPrice(tx)
        expect(isValid).to.be.true
        let receipt = await caver.rpc.klay.sendRawTransaction(tx)
        isValid = await validateGasFeeWithReceipt(receipt)
        expect(isValid).to.be.true

        // Test caver.wallet.signAsFeePayer with fee delegation tx
        tx = caver.transaction.feeDelegatedValueTransfer.create({
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 2500000,
            feePayer: feePayer.address,
        })
        await caver.wallet.signAsFeePayer(feePayer.address, tx)
        await caver.wallet.sign(sender.address, tx)
        isValid = await validateGasPrice(tx)
        expect(isValid).to.be.true
        receipt = await caver.rpc.klay.sendRawTransaction(tx)
        isValid = await validateGasFeeWithReceipt(receipt)
        expect(isValid).to.be.true

        // Test caver.wallet.sign with ethereum dynamic fee tx
        tx = caver.transaction.ethereumDynamicFee.create({
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 900000,
            accessList: [],
        })
        await caver.wallet.sign(sender.address, tx)
        isValid = await validateGasPrice(tx)
        expect(isValid).to.be.true
        receipt = await caver.rpc.klay.sendRawTransaction(tx)
        isValid = await validateDynamicFeeTxWithReceipt(receipt)
        expect(isValid).to.be.true
    }).timeout(100000)

    it('CAVERJS-UNIT-RPC-030: caver.rpc.klay.sendTransaction sends a tx with optional gasPrice value (use keystore in Klaytn Node)', async () => {
        // Generate many txs to increase baseFee
        generateTxsBomb(await fillKlay(100))

        try {
            // If an account's keystore already exists in the Klaytn Node, an error is returned, so it must be wrapped in a try-catch statement.
            await caver.klay.personal.importRawKey(sender.key.privateKey, password)
        } catch (e) {}
        const isUnlock = await caver.klay.personal.unlockAccount(sender.address, password)
        expect(isUnlock).to.be.true

        let tx = caver.transaction.valueTransfer.create({
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 2500000,
        })
        let receipt = await caver.rpc.klay.sendTransaction(tx)
        let isValid = await validateGasFeeWithReceipt(receipt)
        expect(isValid).to.be.true

        tx = caver.transaction.ethereumDynamicFee.create({
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 900000,
            accessList: [],
        })
        receipt = await caver.rpc.klay.sendTransaction(tx)
        isValid = await validateDynamicFeeTxWithReceipt(receipt)
        expect(isValid).to.be.true
    }).timeout(100000)

    it('CAVERJS-UNIT-RPC-031: caver.rpc.klay.sendTransactionAsFeepayer sends a fee delegation tx with optional gasPrice value (use keystore in Klaytn Node)', async () => {
        // Generate many txs to increase baseFee
        generateTxsBomb(await fillKlay(100))

        try {
            // If an account's keystore already exists in the Klaytn Node, an error is returned, so it must be wrapped in a try-catch statement.
            await caver.klay.personal.importRawKey(feePayer.key.privateKey, password)
        } catch (e) {}
        const isUnlock = await caver.klay.personal.unlockAccount(feePayer.address, password)
        expect(isUnlock).to.be.true

        const tx = caver.transaction.feeDelegatedValueTransfer.create({
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 2500000,
            feePayer: feePayer.address,
        })
        await caver.wallet.sign(sender.address, tx)
        const receipt = await caver.rpc.klay.sendTransactionAsFeePayer(tx)
        const isValid = await validateGasFeeWithReceipt(receipt)
        expect(isValid).to.be.true
    }).timeout(100000)

    it('CAVERJS-UNIT-RPC-032: caver.rpc.klay.signTransaction signs a tx with optional gasPrice value (use keystore in Klaytn Node)', async () => {
        // Generate many txs to increase baseFee
        generateTxsBomb(await fillKlay(100))

        try {
            // If an account's keystore already exists in the Klaytn Node, an error is returned, so it must be wrapped in a try-catch statement.
            await caver.klay.personal.importRawKey(sender.key.privateKey, password)
        } catch (e) {}
        const isUnlock = await caver.klay.personal.unlockAccount(sender.address, password)
        expect(isUnlock).to.be.true

        let tx = caver.transaction.valueTransfer.create({
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 2500000,
        })
        let signed = await caver.rpc.klay.signTransaction(tx)
        let decodedTx = caver.transaction.decode(signed.raw)
        let isValid = await validateGasPrice(decodedTx)
        expect(isValid).to.be.true

        tx = caver.transaction.ethereumDynamicFee.create({
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 900000,
            accessList: [],
        })
        signed = await caver.rpc.klay.signTransaction(tx)
        decodedTx = caver.transaction.decode(signed.raw)
        isValid = await validateGasPrice(decodedTx)
        expect(isValid).to.be.true
    }).timeout(100000)

    it('CAVERJS-UNIT-RPC-033: caver.rpc.klay.signTransactionAsFeepayer signs a fee delegation tx with optional gasPrice value (use keystore in Klaytn Node)', async () => {
        // Generate many txs to increase baseFee
        generateTxsBomb(await fillKlay(100))

        try {
            // If an account's keystore already exists in the Klaytn Node, an error is returned, so it must be wrapped in a try-catch statement.
            await caver.klay.personal.importRawKey(feePayer.key.privateKey, password)
        } catch (e) {}
        const isUnlock = await caver.klay.personal.unlockAccount(feePayer.address, password)
        expect(isUnlock).to.be.true

        const tx = caver.transaction.feeDelegatedValueTransfer.create({
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 2500000,
            feePayer: feePayer.address,
        })
        const signed = await caver.rpc.klay.signTransactionAsFeePayer(tx)
        const decodedTx = caver.transaction.decode(signed.raw)
        const isValid = await validateGasPrice(decodedTx)
        expect(isValid).to.be.true
    }).timeout(100000)

    it('CAVERJS-UNIT-WALLET-432: caver.klay.accounts.signTransaction signs with optional gasPrice value', async () => {
        // Generate many txs to increase baseFee
        generateTxsBomb(await fillKlay(100))

        const tx = {
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 2500000,
        }
        const senderAccount = caver.klay.accounts.wallet[sender.address]
        const signed = await caver.klay.accounts.signTransaction(tx, senderAccount.privateKey)
        const decodedTx = caver.transaction.decode(signed.rawTransaction)
        let isValid = await validateGasPrice(decodedTx)
        expect(isValid).to.be.true
        const receipt = await caver.rpc.klay.sendRawTransaction(signed.rawTransaction)
        isValid = await validateGasFeeWithReceipt(receipt)
        expect(isValid).to.be.true
    }).timeout(100000)

    it('CAVERJS-UNIT-WALLET-433: caver.klay.accounts.feePayerSignTransaction signs as fee payer with optional gasPrice value', async () => {
        // Generate many txs to increase baseFee
        generateTxsBomb(await fillKlay(100))

        const tx = {
            type: 'FEE_DELEGATED_VALUE_TRANSFER',
            from: sender.address,
            feePayer: feePayer.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 2500000,
        }
        const feePayerAccount = caver.klay.accounts.wallet[feePayer.address]
        const signed = await caver.klay.accounts.feePayerSignTransaction(tx, feePayer.address, feePayerAccount.privateKey)
        const decodedTx = caver.transaction.decode(signed.rawTransaction)
        const isValid = await validateGasPrice(decodedTx)
        expect(isValid).to.be.true
    }).timeout(100000)

    it('CAVERJS-UNIT-ETC-407: caver.klay.personal.sendTransaction sends a tx with optional gasPrice value (use keystore in Klaytn Node)', async () => {
        // Generate many txs to increase baseFee
        generateTxsBomb(await fillKlay(100))

        let tx = caver.transaction.valueTransfer.create({
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 2500000,
        })
        let receipt = await caver.klay.personal.sendTransaction(tx, password)
        let isValid = await validateGasFeeWithReceipt(receipt)
        expect(isValid).to.be.true

        tx = caver.transaction.ethereumDynamicFee.create({
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 2500000,
            accessList: [],
        })
        receipt = await caver.klay.personal.sendTransaction(tx, password)
        isValid = await validateDynamicFeeTxWithReceipt(receipt)
        expect(isValid).to.be.true
    }).timeout(100000)

    it('CAVERJS-UNIT-ETC-408: caver.klay.personal.sendValueTransfer sends a value transfer tx with optional gasPrice value (use keystore in Klaytn Node)', async () => {
        // Generate many txs to increase baseFee
        generateTxsBomb(await fillKlay(100))

        const receipt = await caver.klay.personal.sendValueTransfer(
            {
                from: sender.address,
                to: caver.wallet.keyring.generate().address,
                value: 1,
                gas: 2500000,
            },
            password
        )
        const isValid = await validateGasFeeWithReceipt(receipt)
        expect(isValid).to.be.true
    }).timeout(100000)

    it('CAVERJS-UNIT-ETC-409: caver.klay.personal.sendAccountUpdate sends a value transfer tx with optional gasPrice value (use keystore in Klaytn Node)', async () => {
        // Generate many txs to increase baseFee
        generateTxsBomb(await fillKlay(100))

        const receipt = await caver.klay.personal.sendAccountUpdate(
            {
                from: sender.address,
                gas: 2500000,
                key: '0x01c0',
            },
            password
        )
        const isValid = await validateGasFeeWithReceipt(receipt)
        expect(isValid).to.be.true
    }).timeout(100000)

    it('CAVERJS-UNIT-RPC-034: caver.klay.sendTransaction sends a tx with optional gasPrice value (use keystore in Klaytn Node)', async () => {
        // Generate many txs to increase baseFee
        generateTxsBomb(await fillKlay(100))

        // Sign a tx with an account in the in-memory wallet and send to network.
        let tx = {
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 2500000,
        }
        let receipt = await caver.klay.sendTransaction(tx)
        let isValid = await validateGasFeeWithReceipt(receipt)
        expect(isValid).to.be.true

        // Remove an account from in-memory wallet to send tx with keystore in the Node.
        caver.klay.accounts.wallet.remove(sender.address)
        const isUnlock = await caver.klay.personal.unlockAccount(sender.address, password)
        expect(isUnlock).to.be.true
        tx = {
            from: sender.address,
            to: caver.wallet.keyring.generate().address,
            value: 1,
            gas: 2500000,
        }
        receipt = await caver.klay.sendTransaction(tx)
        isValid = await validateGasFeeWithReceipt(receipt)
        expect(isValid).to.be.true
    }).timeout(100000)
})
