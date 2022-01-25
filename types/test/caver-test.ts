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

import Caver from 'caver-js'
import * as net from 'net'

// $ExpectType Utils
Caver.utils

// $ExpectType Providers
Caver.providers

// $ExpectType ABI
Caver.abi

// $ExpectType Caver
const caver_empty = new Caver()

// $ExpectType Caver
let caver = new Caver('http://localhost:8551')

// $ExpectType string
caver.version

// $ExpectType Utils
caver.utils

// $ExpectType ABI
caver.abi

// $ExpectType Formatters
caver.formatters

// $ExpectType CoreHelpers
caver.helpers

// $ExpectType KeyringContainer
caver.wallet

// $ExpectType TransactionModule
caver.transaction

// $ExpectType KCT
caver.kct

// $ExpectType DeprecatedKlayRPC
caver.klay

// $ExpectType RPC
caver.rpc

// $ExpectType Validator
caver.validator

// $ExpectType Middleware
caver.middleware

// $ExpectType IPFS
caver.ipfs

// $ExpectType typeof Method
caver.Method

// $ExpectType typeof Account
caver.account

// $ExpectType typeof Contract
caver.contract

// $ExpectType Socket
const netSocket = new net.Socket()

// $ExpectType Caver
caver = new Caver('http://localhost:8551', netSocket)
