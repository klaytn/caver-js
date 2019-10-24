/*
    Copyright 2018 The caver-js Authors
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

/**
 * Should be called to check the parameters of transaction
 *
 * @method validateParams
 * @param {Object}
 * @return {Error}
 */

const utils = require('../../caver-utils')

function validateParams(tx) {
    let error

    // validate for fee payer transaction format
    if (tx.senderRawTransaction) {
        if (!tx.feePayer || tx.feePayer === '0x') {
            error = new Error(`Invalid fee payer: ${tx.feePayer}`)
        } else if (!utils.isAddress(tx.feePayer)) {
            error = new Error(`Invalid address of fee payer: ${tx.feePayer}`)
        }
        return error
    }

    const isValidateType = validateTxType(tx.type)
    if (!isValidateType) {
        return new Error(`The transaction type [${tx.type}] is not supported`)
    }

    error = validateTxObjectWithType(tx)
    if (error !== undefined) {
        return error
    }

    if (!tx.from) {
        error = new Error('"from" is missing')
    } else if (!utils.isAddress(tx.from)) {
        error = new Error(`Invalid address of from: ${tx.from}`)
    } else if (tx.gas === undefined && tx.gasLimit === undefined) {
        error = new Error('"gas" is missing')
    } else if (tx.nonce < 0 || tx.gas < 0 || tx.gasPrice < 0 || tx.chainId < 0) {
        error = new Error('gas, gasPrice, nonce or chainId is lower than 0')
    }

    // If feePayerSignatures is set in transaction object, feePayer also should be defined together.
    if (tx.feePayerSignatures && !utils.isEmptySig(tx.feePayerSignatures)) {
        if (!tx.feePayer || tx.feePayer === '0x') {
            error = new Error('"feePayer" is missing: feePayer must be defined with feePayerSignatures.')
        } else if (!utils.isAddress(tx.feePayer)) {
            error = new Error(`Invalid address of fee payer: ${tx.feePayer}`)
        }
    }

    return error
}

/**
 * Should be called to check the type of transaction
 * Transaction type has to be checked if type is set.
 *
 * @method validateTypes
 * @param {string}
 * @return {bool}
 */
function validateTxType(txType) {
    if (!txType) {
        return true
    }
    switch (txType) {
        case 'VALUE_TRANSFER':
        case 'FEE_DELEGATED_VALUE_TRANSFER':
        case 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO':
        case 'VALUE_TRANSFER_MEMO':
        case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO':
        case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO':
        case 'ACCOUNT_UPDATE':
        case 'FEE_DELEGATED_ACCOUNT_UPDATE':
        case 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO':
        case 'SMART_CONTRACT_DEPLOY':
        case 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY':
        case 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO':
        case 'SMART_CONTRACT_EXECUTION':
        case 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION':
        case 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO':
        case 'CANCEL':
        case 'FEE_DELEGATED_CANCEL':
        case 'FEE_DELEGATED_CANCEL_WITH_RATIO':
        case 'CHAIN_DATA_ANCHORING':
        case 'LEGACY':
            return true
    }
    return false
}

/**
 * Should be called to check codeFormat
 *
 * @method validateTypes
 * @param {string}
 * @return {bool}
 */
function validateCodeFormat(cf) {
    if (cf === undefined) {
        return true
    }

    switch (cf) {
        case 0:
        case 'EVM':
        case '0x':
        case '0x0':
            return true
    }
    return false
}

function validateTxObjectWithType(tx) {
    if (tx.type === undefined) {
        return validateLegacy(tx)
    }
    switch (tx.type) {
        case 'LEGACY':
            return validateLegacy(tx)
        case 'VALUE_TRANSFER':
            return validateValueTransfer(tx)
        case 'FEE_DELEGATED_VALUE_TRANSFER':
            return validateFeeDelegatedValueTransfer(tx)
        case 'FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO':
            return validateFeeDelegatedValueTransferWithRatio(tx)
        case 'VALUE_TRANSFER_MEMO':
            return validateValueTransferMemo(tx)
        case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO':
            return validateFeeDelegatedValueTransferMemo(tx)
        case 'FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO':
            return validateFeeDelegatedValueTransferMemoWithRatio(tx)
        case 'ACCOUNT_UPDATE':
            return validateAccountUpdate(tx)
        case 'FEE_DELEGATED_ACCOUNT_UPDATE':
            return validateFeeDelegatedAccountUpdate(tx)
        case 'FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO':
            return validateFeeDelegatedAccountUpdateWithRatio(tx)
        case 'SMART_CONTRACT_DEPLOY':
            return validateSmartContractDeploy(tx)
        case 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY':
            return validateFeeDelegatedSmartContractDeploy(tx)
        case 'FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO':
            return validateFeeDelegatedSmartContractDeployWithRatio(tx)
        case 'SMART_CONTRACT_EXECUTION':
            return validateSmartContractExecution(tx)
        case 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION':
            return validateFeeDelegatedSmartContractExecution(tx)
        case 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO':
            return validateFeeDelegatedSmartContractExecutionWithRatio(tx)
        case 'CANCEL':
            return validateCancel(tx)
        case 'FEE_DELEGATED_CANCEL':
            return validateFeeDelegatedCancel(tx)
        case 'FEE_DELEGATED_CANCEL_WITH_RATIO':
            return validateFeeDelegatedCancelWithRatio(tx)
    }
    return undefined
}

function validateLegacy(transaction) {
    if (transaction.to === undefined && transaction.data === undefined) {
        return new Error('contract creation without any data provided')
    }

    if (transaction.to && transaction.to !== '0x' && !utils.isAddress(transaction.to)) {
        return new Error(`Invalid address of to: ${transaction.to}`)
    }

    if (transaction.codeFormat !== undefined) {
        return new Error('"codeFormat" cannot be used with LEGACY transaction')
    }

    const error = validateNonFeeDelegated(transaction)
    if (error) return error

    return validateNotAccountTransaction(transaction)
}

function validateNonFeeDelegated(transaction) {
    const type = transaction.type ? transaction.type : 'LEGACY'
    if (transaction.feePayer !== undefined) {
        return new Error(`"feePayer" cannot be used with ${type} transaction`)
    }
    if (transaction.feeRatio !== undefined) {
        return new Error(`"feeRatio" cannot be used with ${type} transaction`)
    }
    if (transaction.feePayerSignatures !== undefined) {
        return new Error(`"feePayerSignatures" cannot be used with ${type} transaction`)
    }
}

function validateFeeDelegated(transaction) {
    if (transaction.type.includes('WITH_RATIO')) {
        if (transaction.feeRatio === undefined) {
            return new Error('"feeRatio" is missing')
        }
    } else if (transaction.feeRatio !== undefined) {
        return new Error(`"feeRatio" cannot be used with ${transaction.type} transaction`)
    }
}

function validateNotAccountTransaction(transaction) {
    const type = transaction.type ? transaction.type : 'LEGACY'
    if (transaction.key !== undefined) {
        return new Error(`"key" cannot be used with ${type} transaction`)
    }
    if (transaction.legacyKey !== undefined) {
        return new Error(`"legacyKey" cannot be used with ${type} transaction`)
    }
    if (transaction.publicKey !== undefined) {
        return new Error(`"publicKey" cannot be used with ${type} transaction`)
    }
    if (transaction.multisig !== undefined) {
        return new Error(`"multisig" cannot be used with ${type} transaction`)
    }
    if (transaction.roleTransactionKey !== undefined) {
        return new Error(`"roleTransactionKey" cannot be used with ${type} transaction`)
    }
    if (transaction.roleAccountUpdateKey !== undefined) {
        return new Error(`"roleAccountUpdateKey" cannot be used with ${type} transaction`)
    }
    if (transaction.roleFeePayerKey !== undefined) {
        return new Error(`"roleFeePayerKey" cannot be used with ${type} transaction`)
    }
    if (transaction.failKey !== undefined) {
        return new Error(`"failKey" cannot be used with ${type} transaction`)
    }
}

function checkValueTransferEssential(transaction) {
    if (transaction.to === undefined) {
        return new Error('"to" is missing')
    }
    if (!utils.isAddress(transaction.to)) {
        return new Error(`Invalid address of to: ${transaction.to}`)
    }
    if (transaction.value === undefined) {
        return new Error('"value" is missing')
    }
    if (transaction.codeFormat !== undefined) {
        return new Error(`"codeFormat" cannot be used with ${transaction.type} transaction`)
    }
    if (transaction.data !== undefined) {
        return new Error(`"data" cannot be used with ${transaction.type} transaction`)
    }
}

function validateValueTransfer(transaction) {
    let error = checkValueTransferEssential(transaction)
    if (error) return error

    error = validateNonFeeDelegated(transaction)
    if (error) return error

    return validateNotAccountTransaction(transaction)
}

function validateFeeDelegatedValueTransfer(transaction) {
    let error = checkValueTransferEssential(transaction)
    if (error) return error

    error = validateFeeDelegated(transaction)
    if (error) return error

    return validateNotAccountTransaction(transaction)
}

function validateFeeDelegatedValueTransferWithRatio(transaction) {
    return validateFeeDelegatedValueTransfer(transaction)
}

function checkValueTransferMemoEssential(transaction) {
    if (transaction.to === undefined) {
        return new Error('"to" is missing')
    }
    if (!utils.isAddress(transaction.to)) {
        return new Error(`Invalid address of to: ${transaction.to}`)
    }
    if (transaction.value === undefined) {
        return new Error('"value" is missing')
    }
    if (transaction.data === undefined) {
        return new Error('"data" is missing')
    }
    if (transaction.codeFormat !== undefined) {
        return new Error(`"codeFormat" cannot be used with ${transaction.type} transaction`)
    }
}

function validateValueTransferMemo(transaction) {
    let error = checkValueTransferMemoEssential(transaction)
    if (error) return error

    error = validateNonFeeDelegated(transaction)
    if (error) return error

    return validateNotAccountTransaction(transaction)
}

function validateFeeDelegatedValueTransferMemo(transaction) {
    let error = checkValueTransferMemoEssential(transaction)
    if (error) return error

    error = validateFeeDelegated(transaction)
    if (error) return error

    return validateNotAccountTransaction(transaction)
}

function validateFeeDelegatedValueTransferMemoWithRatio(transaction) {
    return validateFeeDelegatedValueTransferMemo(transaction)
}

function validateAccountTransaction(transaction) {
    if (transaction.data !== undefined) {
        return new Error(`"data" cannot be used with ${transaction.type} transaction`)
    }
    if (transaction.codeFormat !== undefined) {
        return new Error(`"codeFormat" cannot be used with ${transaction.type} transaction`)
    }

    if (
        !transaction.key &&
        transaction.legacyKey === undefined &&
        !transaction.publicKey &&
        !transaction.multisig &&
        !transaction.roleTransactionKey &&
        !transaction.roleAccountUpdateKey &&
        !transaction.roleFeePayerKey &&
        transaction.failKey === undefined
    ) {
        return new Error(`Missing key information with ${transaction.type} transaction`)
    }

    const duplicatedKeyInfo = `The key parameter to be used for ${transaction.type} is duplicated.`
    if (transaction.key) {
        if (
            transaction.legacyKey !== undefined ||
            transaction.publicKey ||
            transaction.multisig ||
            transaction.roleTransactionKey ||
            transaction.roleAccountUpdateKey ||
            transaction.roleFeePayerKey ||
            transaction.failKey !== undefined
        ) {
            return new Error(duplicatedKeyInfo)
        }
    } else if (transaction.legacyKey !== undefined) {
        if (
            transaction.publicKey ||
            transaction.multisig ||
            transaction.roleTransactionKey ||
            transaction.roleAccountUpdateKey ||
            transaction.roleFeePayerKey ||
            transaction.failKey !== undefined
        ) {
            return new Error(duplicatedKeyInfo)
        }
    } else if (transaction.publicKey) {
        if (
            transaction.multisig ||
            transaction.roleTransactionKey ||
            transaction.roleAccountUpdateKey ||
            transaction.roleFeePayerKey ||
            transaction.failKey !== undefined
        ) {
            return new Error(duplicatedKeyInfo)
        }
    } else if (transaction.multisig) {
        if (
            transaction.roleTransactionKey ||
            transaction.roleAccountUpdateKey ||
            transaction.roleFeePayerKey ||
            transaction.failKey !== undefined
        ) {
            return new Error(duplicatedKeyInfo)
        }
    } else if (transaction.failKey !== undefined) {
        if (transaction.roleTransactionKey || transaction.roleAccountUpdateKey || transaction.roleFeePayerKey) {
            return new Error(duplicatedKeyInfo)
        }
    }
}

function checkUpdateEssential(transaction) {
    if (transaction.to !== undefined) {
        return new Error(`"to" cannot be used with ${transaction.type} transaction`)
    }
    if (transaction.value !== undefined) {
        return new Error(`"value" cannot be used with ${transaction.type} transaction`)
    }
}

function validateAccountUpdate(transaction) {
    let error = checkUpdateEssential(transaction)
    if (error) return error

    error = validateAccountTransaction(transaction)
    if (error) return error

    return validateNonFeeDelegated(transaction)
}

function validateFeeDelegatedAccountUpdate(transaction) {
    let error = checkUpdateEssential(transaction)
    if (error) return error

    error = validateAccountTransaction(transaction)
    if (error) return error

    return validateFeeDelegated(transaction)
}

function validateFeeDelegatedAccountUpdateWithRatio(transaction) {
    return validateFeeDelegatedAccountUpdate(transaction)
}

function checkDeployEssential(transaction) {
    if (transaction.value === undefined) {
        return new Error('"value" is missing')
    }
    if (transaction.data === undefined) {
        return new Error('"data" is missing')
    }
    if (transaction.to !== undefined && transaction.to !== '0x') {
        return new Error(`"to" cannot be used with ${transaction.type} transaction`)
    }
    if (transaction.codeFormat !== undefined && !validateCodeFormat(transaction.codeFormat)) {
        return new Error(`The codeFormat(${transaction.codeFormat}) is invalid.`)
    }
}

function validateSmartContractDeploy(transaction) {
    let error = checkDeployEssential(transaction)
    if (error) return error

    error = validateNonFeeDelegated(transaction)
    if (error) return error

    return validateNotAccountTransaction(transaction)
}

function validateFeeDelegatedSmartContractDeploy(transaction) {
    let error = checkDeployEssential(transaction)
    if (error) return error

    error = validateNotAccountTransaction(transaction)
    if (error) return error

    return validateFeeDelegated(transaction)
}

function validateFeeDelegatedSmartContractDeployWithRatio(transaction) {
    return validateFeeDelegatedSmartContractDeploy(transaction)
}

function checkExecutionEssential(transaction) {
    if (transaction.to === undefined) {
        return new Error('"to" is missing')
    }
    if (!utils.isAddress(transaction.to)) {
        return new Error(`Invalid address of to: ${transaction.to}`)
    }
    if (transaction.data === undefined) {
        return new Error('"data" is missing')
    }
    if (transaction.codeFormat !== undefined) {
        return new Error(`"codeFormat" cannot be used with ${transaction.type} transaction`)
    }
}

function validateSmartContractExecution(transaction) {
    let error = checkExecutionEssential(transaction)
    if (error) return error

    error = validateNonFeeDelegated(transaction)
    if (error) return error

    return validateNotAccountTransaction(transaction)
}

function validateFeeDelegatedSmartContractExecution(transaction) {
    let error = checkExecutionEssential(transaction)
    if (error) return error

    error = validateNotAccountTransaction(transaction)
    if (error) return error

    return validateFeeDelegated(transaction)
}

function validateFeeDelegatedSmartContractExecutionWithRatio(transaction) {
    return validateFeeDelegatedSmartContractExecution(transaction)
}

function checkCacncelEssential(transaction) {
    if (transaction.to !== undefined) {
        return new Error(`"to" cannot be used with ${transaction.type} transaction`)
    }
    if (transaction.value !== undefined) {
        return new Error(`"value" cannot be used with ${transaction.type} transaction`)
    }
    if (transaction.data !== undefined) {
        return new Error(`"data" cannot be used with ${transaction.type} transaction`)
    }
    if (transaction.codeFormat !== undefined) {
        return new Error(`"codeFormat" cannot be used with ${transaction.type} transaction`)
    }
}

function validateCancel(transaction) {
    let error = checkCacncelEssential(transaction)
    if (error) return error

    error = validateNonFeeDelegated(transaction)
    if (error) return error

    return validateNotAccountTransaction(transaction)
}

function validateFeeDelegatedCancel(transaction) {
    let error = checkCacncelEssential(transaction)
    if (error) return error

    error = validateNotAccountTransaction(transaction)
    if (error) return error

    return validateFeeDelegated(transaction)
}

function validateFeeDelegatedCancelWithRatio(transaction) {
    return validateFeeDelegatedCancel(transaction)
}

module.exports = {
    validateParams,
    validateTxType,
    validateCodeFormat,
}
