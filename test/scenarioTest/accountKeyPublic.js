/*
    Copyright 2019 The caver-js Authors
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

require('it-each')({ testPerIteration: true })
const { expect } = require('../extendedChai')

const testRPCURL = require('../testrpc')
const Caver = require('../../index.js')

let caver
let sender
let payer
let account
let contractAddress
let legacyKey

describe('Scenario test with AccountWithAccountKeyPublic', () => {
    before(() => {
        caver = new Caver(testRPCURL)

        const senderPrvKey =
            process.env.privateKey && String(process.env.privateKey).indexOf('0x') === -1
                ? `0x${process.env.privateKey}`
                : process.env.privateKey

        sender = caver.klay.accounts.wallet.add(senderPrvKey)
    })

    context('1. Prepare for testing', () => {
        it('Create test accounts', async () => {
            // Send KLAY to test account
            // Send KLAY to test account
            account = caver.klay.accounts.create()
            legacyKey = account.privateKey
            let txObject = {
                from: sender.address,
                to: account.address,
                value: caver.utils.toPeb(10, 'KLAY'),
                gas: 900000,
            }
            await caver.klay.sendTransaction(txObject)

            payer = caver.klay.accounts.wallet.add(caver.klay.accounts.create())
            txObject = {
                from: sender.address,
                to: payer.address,
                value: caver.utils.toPeb(10, 'KLAY'),
                gas: 900000,
            }
            await caver.klay.sendTransaction(txObject)

            // New private key to update
            const newPrivateKey = caver.klay.accounts.create().privateKey
            // Create an AccountKeyPublic instance that contains one private key string.
            const newAccountKeyPublic = caver.klay.accounts.createAccountKeyPublic(newPrivateKey)
            // Get all internal key through the 'keys' property on an instance of AccountKey.
            const newPublicKey = caver.klay.accounts.privateKeyToPublicKey(newAccountKeyPublic.keys)

            // Create an AccountForUpdate containing about the address of account and key to update
            let updator = caver.klay.accounts.createAccountForUpdate(account.address, newAccountKeyPublic)

            // Set AccountForUpdate instance to 'key'
            let updateTx = {
                type: 'ACCOUNT_UPDATE',
                from: account.address,
                gas: 90000,
                key: updator,
            }

            // If the account's accountKey is AccountKeyPublic, the privateKey, transactionKey, updateKey and feePayerKey are the same.
            // If the account does not exist inside the in-memory wallet, you must pass the privateKey parameter to signTransaction.
            const signed = await caver.klay.accounts.signTransaction(updateTx, account.updateKey)
            let receipt = await caver.klay.sendSignedTransaction(signed)
            expect(receipt.status).to.be.true

            // Check result of account update
            const accountKey = await caver.klay.getAccountKey(account.address)
            const xyPoint = caver.utils.xyPointFromPublicKey(newPublicKey)
            expect(accountKey.keyType).to.equals(2)
            expect(accountKey.key.x).to.equals(xyPoint[0])
            expect(accountKey.key.y).to.equals(xyPoint[1])

            // Add account to in-memory wallet
            account = caver.klay.accounts.createWithAccountKey(account.address, newAccountKeyPublic)
            expect(caver.klay.accounts.isDecoupled(account.keys, account.address)).to.be.true
            caver.klay.accounts.wallet.add(account)

            // Get account from in-memory wallet
            const fromWallet = caver.klay.accounts.wallet.getAccount(account.address)
            expect(fromWallet).not.to.undefined

            expect(fromWallet.address).to.equals(account.address)
            expect(fromWallet.accountKeyType).to.equals('AccountKeyPublic')

            expect(fromWallet.privateKey).to.equals(account.privateKey)
            expect(fromWallet.keys).to.equals(account.keys)
            expect(fromWallet.transactionKey).to.equals(account.transactionKey)
            expect(fromWallet.updateKey).to.equals(account.updateKey)
            expect(fromWallet.feePayerKey).to.equals(account.feePayerKey)

            // Update payer account to AccountKeyPublic
            updator = caver.klay.accounts.createAccountForUpdate(payer.address, newAccountKeyPublic)
            updateTx = {
                type: 'ACCOUNT_UPDATE',
                from: payer.address,
                gas: 90000,
                key: updator,
            }
            receipt = await caver.klay.sendTransaction(updateTx)
            expect(receipt.status).to.be.true
            payer = caver.klay.accounts.wallet.updateAccountKey(payer.address, newAccountKeyPublic)
        }).timeout(200000)
    })

    context('2. Send VALUE_TRANSFER transaction with AccountWithAccountKeyPublic', () => {
        it('VALUE_TRANSFER testing', async () => {
            // Send KLAY to test account
            let txObject = {
                type: 'VALUE_TRANSFER',
                from: account.address,
                to: caver.klay.accounts.create().address,
                value: 1,
                gas: 90000,
            }
            // If the account exists inside the in-memory wallet, you do not need to pass the privateKey parameter to signTransaction.
            // The transactionKey of account will be used
            let senderSigned = await caver.klay.accounts.signTransaction(txObject)
            expect(senderSigned.signatures.length).to.equals(1)

            let receipt = await caver.klay.sendSignedTransaction(senderSigned)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(1)

            txObject = {
                type: 'FEE_DELEGATED_VALUE_TRANSFER',
                from: account.address,
                to: caver.klay.accounts.create().address,
                value: 1,
                gas: 90000,
            }
            senderSigned = await caver.klay.accounts.signTransaction(txObject)
            expect(senderSigned.signatures.length).to.equals(1)

            let feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(senderSigned.rawTransaction, payer.address)
            expect(feePayerSigned.feePayerSignatures.length).to.equals(1)

            receipt = await caver.klay.sendSignedTransaction(feePayerSigned)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(1)
            expect(receipt.feePayerSignatures.length).to.equals(1)

            txObject = {
                type: 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO',
                from: account.address,
                to: caver.klay.accounts.create().address,
                value: 1,
                gas: 90000,
                feeRatio: 50,
            }
            senderSigned = await caver.klay.accounts.signTransaction(txObject)
            expect(senderSigned.signatures.length).to.equals(1)

            feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(txObject, payer.address)
            expect(feePayerSigned.feePayerSignatures.length).to.equals(1)

            const combined = await caver.klay.accounts.combineSignatures([senderSigned.rawTransaction, feePayerSigned.rawTransaction])
            expect(combined.signatures.length).to.equals(1)
            expect(combined.feePayerSignatures.length).to.equals(1)

            receipt = await caver.klay.sendSignedTransaction(combined)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(1)
            expect(receipt.feePayerSignatures.length).to.equals(1)
        }).timeout(200000)
    })

    context('3. Send VALUE_TRANSFER_MEMO transaction with AccountWithAccountKeyPublic', () => {
        it('VALUE_TRANSFER_MEMO testing', async () => {
            // Send KLAY to test account
            let txObject = {
                type: 'VALUE_TRANSFER_MEMO',
                from: account.address,
                to: caver.klay.accounts.create().address,
                value: 1,
                data: 'fee delegated value transfer memo',
                gas: 90000,
            }
            let senderSigned = await caver.klay.accounts.signTransaction(txObject, account.transactionKey)
            expect(senderSigned.signatures.length).to.equals(1)

            let receipt = await caver.klay.sendSignedTransaction(senderSigned)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(1)

            txObject = {
                type: 'FEE_DELEGATED_VALUE_TRANSFER_MEMO',
                from: account.address,
                to: caver.klay.accounts.create().address,
                value: 1,
                data: 'fee delegated value transfer memo',
                gas: 90000,
            }
            // Sign transaction with sender (The transactionKey of account will be used)
            senderSigned = await caver.klay.accounts.signTransaction(txObject)
            expect(senderSigned.signatures.length).to.equals(1)

            // Sign transaction with fee payer (The feePayerKey of account will be used)
            let feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(senderSigned.rawTransaction, payer.address)
            expect(feePayerSigned.feePayerSignatures.length).to.equals(1)

            receipt = await caver.klay.sendSignedTransaction(feePayerSigned)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(1)
            expect(receipt.feePayerSignatures.length).to.equals(1)

            txObject = {
                type: 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO',
                from: account.address,
                to: caver.klay.accounts.create().address,
                value: 1,
                data: 'fee delegated value transfer memo',
                gas: 90000,
                feeRatio: 10,
            }
            senderSigned = await caver.klay.accounts.signTransaction(txObject)
            expect(senderSigned.signatures.length).to.equals(1)

            feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(txObject, payer.address, payer.feePayerKey)
            expect(feePayerSigned.feePayerSignatures.length).to.equals(1)

            txObject.signatures = senderSigned.signatures
            txObject.feePayer = payer.address
            txObject.feePayerSignatures = feePayerSigned.feePayerSignatures

            receipt = await caver.klay.sendSignedTransaction(txObject)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(1)
            expect(receipt.feePayerSignatures.length).to.equals(1)
        }).timeout(200000)
    })

    context('4. Send ACCOUNT_UPDATE transaction with AccountWithAccountKeyPublic', () => {
        it('ACCOUNT_UPDATE testing', async () => {
            // Send KLAY to test account
            // Update AccountKeyPublic -> AccountKeyMultiSig
            let newKey = [
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
                caver.klay.accounts.create().privateKey,
            ]
            let options = { threshold: 2, weight: [1, 2, 1] }
            let updator = caver.klay.accounts.createAccountForUpdate(account.address, newKey, options)

            let txObject = {
                type: 'ACCOUNT_UPDATE',
                from: account.address,
                key: updator,
                gas: 900000,
            }
            let senderSigned = await caver.klay.accounts.signTransaction(txObject, account.transactionKey)
            expect(senderSigned.signatures.length).to.equals(1)

            txObject.signatures = senderSigned.signatures

            let receipt = await caver.klay.sendSignedTransaction(txObject)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(1)

            // Update accountKey in wallet
            account = caver.klay.accounts.wallet.updateAccountKey(account.address, newKey)

            // Update AccountKeyMultiSig -> AccountKeyRoleBased
            newKey = {
                transactionKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
                updateKey: [
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                    caver.klay.accounts.create().privateKey,
                ],
                feePayerKey: [caver.klay.accounts.create().privateKey, caver.klay.accounts.create().privateKey],
            }
            options = {
                transactionKey: { threshold: 1, weight: [1, 1] },
                updateKey: { threshold: 6, weight: [1, 2, 3] },
                feePayerKey: { threshold: 1, weight: [1, 1] },
            }
            updator = caver.klay.accounts.createAccountForUpdate(account.address, newKey, options)

            txObject = {
                type: 'FEE_DELEGATED_ACCOUNT_UPDATE',
                from: account.address,
                key: updator,
                gas: 900000,
            }
            senderSigned = await caver.klay.accounts.signTransaction(txObject)
            expect(senderSigned.signatures.length).to.equals(3)

            let feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(senderSigned.rawTransaction, payer.address)
            expect(feePayerSigned.feePayerSignatures.length).to.equals(1)

            receipt = await caver.klay.sendSignedTransaction(feePayerSigned)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(3)
            expect(receipt.feePayerSignatures.length).to.equals(1)

            // Update accountKey in wallet
            account = caver.klay.accounts.wallet.updateAccountKey(account.address, newKey)

            // Update AccountKeyRoleBased -> AccountKeyPublic
            newKey = caver.klay.accounts.create().privateKey
            const newPublicKey = caver.klay.accounts.privateKeyToPublicKey(newKey)
            updator = caver.klay.accounts.createAccountForUpdateWithPublicKey(account.address, newPublicKey)

            txObject = {
                type: 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO',
                from: account.address,
                key: updator,
                gas: 900000,
                feeRatio: 30,
            }
            senderSigned = await caver.klay.accounts.signTransaction(txObject, account.updateKey)
            expect(senderSigned.signatures.length).to.equals(3)

            feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(txObject, payer.address, payer.feePayerKey)
            expect(feePayerSigned.feePayerSignatures.length).to.equals(1)

            txObject.signatures = senderSigned.signatures
            txObject.feePayer = payer.address
            txObject.feePayerSignatures = feePayerSigned.feePayerSignatures

            const rawTransaction = await caver.klay.accounts.getRawTransactionWithSignatures(txObject)

            receipt = await caver.klay.sendSignedTransaction(rawTransaction)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(3)
            expect(receipt.feePayerSignatures.length).to.equals(1)

            // Update accountKey in wallet
            account = caver.klay.accounts.wallet.updateAccountKey(account.address, newKey)
        }).timeout(200000)
    })

    context('5. Send SMART_CONTRACT_DEPLOY transaction with AccountWithAccountKeyPublic', () => {
        it('SMART_CONTRACT_DEPLOY testing', async () => {
            // Send KLAY to test account
            let txObject = {
                type: 'SMART_CONTRACT_DEPLOY',
                from: account.address,
                data:
                    '0x60806040526000805534801561001457600080fd5b5060405161016f38038061016f8339810180604052810190808051906020019092919080518201929190505050816000819055505050610116806100596000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a723058206d2bc553736581b6387f9a0410856ca490fcdc7045a8991ad63a1fd71b651c3a00290000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000013200000000000000000000000000000000000000000000000000000000000000',
                gas: 900000,
                value: 0,
            }
            let senderSigned = await caver.klay.accounts.signTransaction(txObject, account.transactionKey)
            expect(senderSigned.signatures.length).to.equals(1)

            let receipt = await caver.klay.sendSignedTransaction(senderSigned)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(1)

            txObject = {
                type: 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY',
                from: account.address,
                data:
                    '0x60806040526000805534801561001457600080fd5b5060405161016f38038061016f8339810180604052810190808051906020019092919080518201929190505050816000819055505050610116806100596000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a723058206d2bc553736581b6387f9a0410856ca490fcdc7045a8991ad63a1fd71b651c3a00290000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000013200000000000000000000000000000000000000000000000000000000000000',
                gas: 900000,
                value: 0,
            }
            senderSigned = await caver.klay.accounts.signTransaction(txObject)
            expect(senderSigned.signatures.length).to.equals(1)

            let feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(txObject, payer.address)
            expect(feePayerSigned.feePayerSignatures.length).to.equals(1)

            txObject.signatures = senderSigned.signatures
            txObject.feePayer = payer.address
            txObject.feePayerSignatures = feePayerSigned.feePayerSignatures

            receipt = await caver.klay.sendSignedTransaction(txObject)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(1)
            expect(receipt.feePayerSignatures.length).to.equals(1)

            txObject = {
                type: 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO',
                from: account.address,
                data:
                    '0x60806040526000805534801561001457600080fd5b5060405161016f38038061016f8339810180604052810190808051906020019092919080518201929190505050816000819055505050610116806100596000396000f3006080604052600436106053576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306661abd14605857806342cbb15c146080578063d14e62b81460a8575b600080fd5b348015606357600080fd5b50606a60d2565b6040518082815260200191505060405180910390f35b348015608b57600080fd5b50609260d8565b6040518082815260200191505060405180910390f35b34801560b357600080fd5b5060d06004803603810190808035906020019092919050505060e0565b005b60005481565b600043905090565b80600081905550505600a165627a7a723058206d2bc553736581b6387f9a0410856ca490fcdc7045a8991ad63a1fd71b651c3a00290000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000013200000000000000000000000000000000000000000000000000000000000000',
                gas: 900000,
                value: 0,
                feeRatio: 20,
            }
            senderSigned = await caver.klay.accounts.signTransaction(txObject, account.transactionKey)
            expect(senderSigned.signatures.length).to.equals(1)

            feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(txObject, payer.address)
            expect(feePayerSigned.feePayerSignatures.length).to.equals(1)

            const combined = await caver.klay.accounts.combineSignatures([senderSigned.rawTransaction, feePayerSigned.rawTransaction])
            expect(combined.signatures.length).to.equals(1)
            expect(combined.feePayerSignatures.length).to.equals(1)

            receipt = await caver.klay.sendSignedTransaction(combined.rawTransaction)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(1)
            expect(receipt.feePayerSignatures.length).to.equals(1)
            contractAddress = receipt.contractAddress
        }).timeout(200000)
    })

    context('6. Send SMART_CONTRACT_EXECUTION transaction with AccountWithAccountKeyPublic', () => {
        it('SMART_CONTRACT_EXECUTION testing', async () => {
            // Send KLAY to test account
            let txObject = {
                type: 'SMART_CONTRACT_EXECUTION',
                from: account.address,
                to: contractAddress,
                data: '0xd14e62b80000000000000000000000000000000000000000000000000000000000000005',
                gas: 90000,
            }
            let receipt = await caver.klay.sendTransaction(txObject)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(1)

            txObject = {
                type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
                from: account.address,
                to: contractAddress,
                data: '0xd14e62b80000000000000000000000000000000000000000000000000000000000000005',
                gas: 90000,
            }
            let senderSigned = await caver.klay.accounts.signTransaction(txObject, account.transactionKey)
            expect(senderSigned.signatures.length).to.equals(1)

            receipt = await caver.klay.sendTransaction({
                senderRawTransaction: senderSigned.rawTransaction,
                feePayer: payer.address,
            })
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(1)
            expect(receipt.feePayerSignatures.length).to.equals(1)

            txObject = {
                type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO',
                from: account.address,
                to: contractAddress,
                data: '0xd14e62b80000000000000000000000000000000000000000000000000000000000000005',
                gas: 90000,
                feeRatio: 50,
            }
            senderSigned = await caver.klay.accounts.signTransaction(txObject)
            expect(senderSigned.signatures.length).to.equals(1)

            txObject.signatures = senderSigned.signatures

            const feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(txObject, payer.address, payer.feePayerKey)
            expect(feePayerSigned.feePayerSignatures.length).to.equals(1)

            receipt = await caver.klay.sendSignedTransaction(feePayerSigned)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(1)
            expect(receipt.feePayerSignatures.length).to.equals(1)
        }).timeout(200000)
    })

    context('7. Send CANCEL transaction with AccountWithAccountKeyPublic', () => {
        it('CANCEL testing', async () => {
            // Send KLAY to test account
            let txObject = {
                type: 'CANCEL',
                from: account.address,
                gas: 90000,
            }
            let senderSigned = await caver.klay.accounts.signTransaction(txObject, account.transactionKey)
            expect(senderSigned.signatures.length).to.equals(1)

            let receipt = await caver.klay.sendSignedTransaction(senderSigned.rawTransaction)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(1)

            txObject = {
                type: 'FEE_DELEGATED_CANCEL',
                from: account.address,
                gas: 90000,
            }
            senderSigned = await caver.klay.accounts.signTransaction(txObject)
            expect(senderSigned.signatures.length).to.equals(1)

            txObject.signatures = senderSigned.signatures

            let feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(txObject, payer.address)
            expect(feePayerSigned.feePayerSignatures.length).to.equals(1)

            txObject.feePayer = payer.address
            txObject.feePayerSignatures = feePayerSigned.feePayerSignatures

            const rawTransaction = await caver.klay.accounts.getRawTransactionWithSignatures(txObject)

            receipt = await caver.klay.sendSignedTransaction(rawTransaction.rawTransaction)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(1)
            expect(receipt.feePayerSignatures.length).to.equals(1)

            txObject = {
                type: 'FEE_DELEGATED_CANCEL_WITH_RATIO',
                from: account.address,
                gas: 90000,
                feeRatio: 80,
            }
            senderSigned = await caver.klay.accounts.signTransaction(txObject)
            expect(senderSigned.signatures.length).to.equals(1)

            txObject.signatures = senderSigned.signatures

            feePayerSigned = await caver.klay.accounts.feePayerSignTransaction(txObject, payer.address, payer.feePayerKey)
            expect(feePayerSigned.feePayerSignatures.length).to.equals(1)

            receipt = await caver.klay.sendSignedTransaction(feePayerSigned)
            expect(receipt.status).to.be.true
            expect(receipt.signatures.length).to.equals(1)
            expect(receipt.feePayerSignatures.length).to.equals(1)
        }).timeout(200000)
    })

    context('8. Account update with LegacyKey', () => {
        it('Account update with legacy key testing', async () => {
            // Send KLAY to test account
            const updator = caver.klay.accounts.createAccountForUpdateWithLegacyKey(account.address)

            const txObject = {
                type: 'ACCOUNT_UPDATE',
                from: account.address,
                key: updator,
                gas: 90000,
            }
            // The updateKey in Account is used when signing.
            const receipt = await caver.klay.sendTransaction(txObject)
            expect(receipt.status).to.be.true

            // Check result of account update
            const accountKey = await caver.klay.getAccountKey(account.address)
            expect(accountKey.keyType).to.equals(1)

            account = caver.klay.accounts.wallet.updateAccountKey(account.address, legacyKey)
            expect(account.privateKey).to.equals(legacyKey)
        }).timeout(200000)
    })

    context('9. Account update with FailKey', () => {
        it('Account update with fail key testing', async () => {
            // Send KLAY to test account
            const updator = caver.klay.accounts.createAccountForUpdateWithFailKey(account.address)

            const txObject = {
                type: 'ACCOUNT_UPDATE',
                from: account.address,
                key: updator,
                gas: 90000,
            }
            // The updateKey in Account is used when signing.
            const receipt = await caver.klay.sendTransaction(txObject)
            expect(receipt.status).to.be.true

            // Check result of account update
            const accountKey = await caver.klay.getAccountKey(account.address)
            expect(accountKey.keyType).to.equals(3)
        }).timeout(200000)
    })
})
