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

module.exports = {
    VALID_GAS_PRICE: 25000000000,
    ACCOUNT_UPDATE_TYPE_TAG: '0x20',

    FEE_DELEGATED_ACCOUNT_UPDATE_TYPE_TAG: '0x21',
    FEE_DELEGATED_ACCOUNT_UPDATE_WITH_RATIO_TYPE_TAG: '0x22',

    VALUE_TRANFSER_TYPE_TAG: '0x08',
    VALUE_TRANSFER_MEMO_TYPE_TAG: '0x10',

    FEE_DELEGATED_VALUE_TRANSFER_TYPE_TAG: '0x09',
    FEE_DELEGATED_VALUE_TRANSFER_WITH_RATIO_TYPE_TAG: '0x0a',

    FEE_DELEGATED_VALUE_TRANSFER_MEMO_TYPE_TAG: '0x11',
    FEE_DELEGATED_VALUE_TRANSFER_MEMO_WITH_RATIO_TYPE_TAG: '0x12',

    SMART_CONTRACT_DEPLOY_TYPE_TAG: '0x28',
    FEE_DELEGATED_SMART_CONTRACT_DEPLOY_TYPE_TAG: '0x29',
    FEE_DELEGATED_SMART_CONTRACT_DEPLOY_WITH_RATIO_TYPE_TAG: '0x2a',
    SMART_CONTRACT_EXECUTION_TYPE_TAG: '0x30',
    FEE_DELEGATED_SMART_CONTRACT_EXECUTION_TYPE_TAG: '0x31',
    FEE_DELEGATED_SMART_CONTRACT_EXECUTION_WITH_RATIO_TYPE_TAG: '0x32',

    CANCEL_TYPE_TAG: '0x38',
    FEE_DELEGATED_CANCEL_TYPE_TAG: '0x39',
    FEE_DELEGATED_CANCEL_WITH_RATIO_TYPE_TAG: '0x3a',

    CHAIN_DATA_ANCHORING_TYPE_TAG: '0x48',

    // Account Key

    // AccountKeyNil is only used only for AccountUpdate transactions.
    ACCOUNT_KEY_NIL_TAG: '0x80',

    ACCOUNT_KEY_LEGACY_TAG: '0x01c0',
    ACCOUNT_KEY_PUBLIC_TAG: '0x02',
    ACCOUNT_KEY_FAIL_TAG: '0x03c0',
    ACCOUNT_KEY_WEIGHTED_MULTISIG_TAG: '0x04',
    ACCOUNT_KEY_ROLE_BASED_TAG: '0x05',

    CODE_FORMAT_EVM_TAG: '0x0',
}
