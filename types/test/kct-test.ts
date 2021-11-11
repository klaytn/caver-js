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

import Caver, { KCT, KIP7, KIP13, KIP17, KIP37 } from 'caver-js'
import { KeyringContainer } from 'packages/caver-wallet/src'
import BigNumber from 'bignumber.js'

const caver = new Caver()

// $ExpectType KCT
caver.kct

// $ExpectType KCT
const kct = new KCT()

// $ExpectType typeof KIP7
kct.kip7
// $ExpectType string
kct.kip7.byteCode
// $ExpectType AbiItem[]
kct.kip7.abi

// $ExpectType typeof KIP17
kct.kip17
// $ExpectType string
kct.kip17.byteCode
// $ExpectType AbiItem[]
kct.kip17.abi

// $ExpectType typeof KIP37
kct.kip37
// $ExpectType string
kct.kip37.byteCode
// $ExpectType AbiItem[]
kct.kip37.abi
// $ExpectType IWallet
kct.kip37.wallet

// $ExpectType typeof KIP13
kct.kip13

// $ExpectType KIP7
KIP7.create()
// $ExpectType KIP7
KIP7.create('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')
// $ExpectType KIP7
KIP7.create(KIP7.abi)
// $ExpectType KIP7
KIP7.create('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43', KIP7.abi)

// $ExpectType KIP17
KIP17.create()
// $ExpectType KIP17
KIP17.create('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')
// $ExpectType KIP17
KIP17.create(KIP17.abi)
// $ExpectType KIP17
KIP17.create('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43', KIP17.abi)

// $ExpectType KIP37
KIP37.create()
// $ExpectType KIP37
KIP37.create('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')
// $ExpectType KIP37
KIP37.create(KIP37.abi)
// $ExpectType KIP37
KIP37.create('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43', KIP37.abi)

// $ExpectType KIP7
new KIP7()
// $ExpectType KIP7
new KIP7('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')
// $ExpectType KIP7
new KIP7(KIP7.abi)
// $ExpectType KIP7
new KIP7('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43', KIP7.abi)

// $ExpectType KIP17
new KIP17()
// $ExpectType KIP17
new KIP17('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')
// $ExpectType KIP17
new KIP17(KIP17.abi)
// $ExpectType KIP17
new KIP17('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43', KIP17.abi)

// $ExpectType KIP37
new KIP37()
// $ExpectType KIP37
new KIP37('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')
// $ExpectType KIP37
new KIP37(KIP37.abi)
// $ExpectType KIP37
new KIP37('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43', KIP37.abi)

const sendOptions = { from: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4' }
const sendOptionsWithFormatter = { contractDeployFormatter: () => {}, from: '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4' }
const keyringContainer = new KeyringContainer()

const kip7TokenInfo = {
    name: 'Jasmine',
    symbol: 'JAS',
    decimals: 18,
    initialSupply: '1000000000000000000',
}

// $ExpectType Promise<KIP7>
KIP7.deploy(kip7TokenInfo, sendOptions.from)
// $ExpectType Promise<KIP7>
KIP7.deploy(kip7TokenInfo, sendOptions)
// $ExpectType Promise<any>
KIP7.deploy(kip7TokenInfo, sendOptionsWithFormatter)
// $ExpectType Promise<KIP7>
KIP7.deploy(kip7TokenInfo, sendOptions.from, keyringContainer)
// $ExpectType Promise<KIP7>
KIP7.deploy(kip7TokenInfo, sendOptions, keyringContainer)
// $ExpectType Promise<any>
KIP7.deploy(kip7TokenInfo, sendOptionsWithFormatter, keyringContainer)

const kip17TokenInfo = {
    name: 'Jasmine',
    symbol: 'JAS',
}

// $ExpectType Promise<KIP17>
KIP17.deploy(kip17TokenInfo, sendOptions.from)
// $ExpectType Promise<KIP17>
KIP17.deploy(kip17TokenInfo, sendOptions)
// $ExpectType Promise<any>
KIP17.deploy(kip17TokenInfo, sendOptionsWithFormatter)
// $ExpectType Promise<KIP17>
KIP17.deploy(kip17TokenInfo, sendOptions.from, keyringContainer)
// $ExpectType Promise<KIP17>
KIP17.deploy(kip17TokenInfo, sendOptions, keyringContainer)
// $ExpectType Promise<any>
KIP17.deploy(kip17TokenInfo, sendOptionsWithFormatter, keyringContainer)

const kip37TokenInfo = { uri: 'uri string' }

// $ExpectType Promise<KIP37>
KIP37.deploy(kip37TokenInfo, sendOptions.from)
// $ExpectType Promise<KIP37>
KIP37.deploy(kip37TokenInfo, sendOptions)
// $ExpectType Promise<any>
KIP37.deploy(kip37TokenInfo, sendOptionsWithFormatter)
// $ExpectType Promise<KIP37>
KIP37.deploy(kip37TokenInfo, sendOptions.from, keyringContainer)
// $ExpectType Promise<KIP37>
KIP37.deploy(kip37TokenInfo, sendOptions, keyringContainer)
// $ExpectType Promise<any>
KIP37.deploy(kip37TokenInfo, sendOptionsWithFormatter, keyringContainer)

// $ExpectType Promise<KIP7DetectedObject>
KIP7.detectInterface('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')

// $ExpectType Promise<KIP17DetectedObject>
KIP17.detectInterface('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')

// $ExpectType Promise<KIP37DetectedObject>
KIP37.detectInterface('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')

const kip7 = KIP7.create()

// $ExpectType KIP7
kip7.clone()
// $ExpectType KIP7
kip7.clone('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')

// $ExpectType Promise<KIP7DetectedObject>
kip7.detectInterface()

// $ExpectType Promise<boolean>
kip7.supportsInterface('interface id')

// $ExpectType Promise<string>
kip7.name()

// $ExpectType Promise<string>
kip7.symbol()

// $ExpectType Promise<number>
kip7.decimals()

// $ExpectType Promise<BigNumber>
kip7.totalSupply()

// $ExpectType Promise<BigNumber>
kip7.balanceOf('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')

// $ExpectType Promise<BigNumber>
kip7.allowance('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43', '0x475a6cdd92cb0c7d61c46d9ad1f80958cd2ad0c4')

// $ExpectType Promise<boolean>
kip7.isMinter('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')

// $ExpectType Promise<boolean>
kip7.isPauser('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')

// $ExpectType Promise<boolean>
kip7.paused()

// $ExpectType Promise<TransactionReceipt>
kip7.approve('spender', 'amount')
// $ExpectType Promise<TransactionReceipt>
kip7.approve('spender', 10)
// $ExpectType Promise<TransactionReceipt>
kip7.approve('spender', new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip7.approve('spender', 'amount', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.approve('spender', 10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.approve('spender', new BigNumber(10), sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip7.transfer('recipient', 'amount')
// $ExpectType Promise<TransactionReceipt>
kip7.transfer('recipient', 10)
// $ExpectType Promise<TransactionReceipt>
kip7.transfer('recipient', new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip7.transfer('recipient', 'amount', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.transfer('recipient', 10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.transfer('recipient', new BigNumber(10), sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip7.transferFrom('sender', 'recipient', 'amount')
// $ExpectType Promise<TransactionReceipt>
kip7.transferFrom('sender', 'recipient', 10)
// $ExpectType Promise<TransactionReceipt>
kip7.transferFrom('sender', 'recipient', new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip7.transferFrom('sender', 'recipient', 'amount', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.transferFrom('sender', 'recipient', 10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.transferFrom('sender', 'recipient', new BigNumber(10), sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip7.safeTransfer('recipient', 'amount')
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransfer('recipient', 10)
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransfer('recipient', new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransfer('recipient', 'amount', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransfer('recipient', 10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransfer('recipient', new BigNumber(10), sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransfer('recipient', 'amount', 'data')
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransfer('recipient', 10, 'data')
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransfer('recipient', new BigNumber(10), 'data')
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransfer('recipient', 'amount', 'data', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransfer('recipient', 10, 'data', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransfer('recipient', new BigNumber(10), 'data', sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip7.safeTransferFrom('sender', 'recipient', 'amount')
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransferFrom('sender', 'recipient', 10)
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransferFrom('sender', 'recipient', new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransferFrom('sender', 'recipient', 'amount', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransferFrom('sender', 'recipient', 10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransferFrom('sender', 'recipient', new BigNumber(10), sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransferFrom('sender', 'recipient', 'amount', 'data')
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransferFrom('sender', 'recipient', 10, 'data')
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransferFrom('sender', 'recipient', new BigNumber(10), 'data')
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransferFrom('sender', 'recipient', 'amount', 'data', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransferFrom('sender', 'recipient', 10, 'data', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.safeTransferFrom('sender', 'recipient', new BigNumber(10), 'data', sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip7.mint('account', 'amount')
// $ExpectType Promise<TransactionReceipt>
kip7.mint('account', 10)
// $ExpectType Promise<TransactionReceipt>
kip7.mint('account', new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip7.mint('account', 'amount', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.mint('account', 10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.mint('account', new BigNumber(10), sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip7.addMinter('account')
// $ExpectType Promise<TransactionReceipt>
kip7.addMinter('account', sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip7.renounceMinter()
// $ExpectType Promise<TransactionReceipt>
kip7.renounceMinter(sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip7.burn('amount')
// $ExpectType Promise<TransactionReceipt>
kip7.burn(10)
// $ExpectType Promise<TransactionReceipt>
kip7.burn(new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip7.burn('amount', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.burn(10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.burn(new BigNumber(10), sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip7.burnFrom('account', 'amount')
// $ExpectType Promise<TransactionReceipt>
kip7.burnFrom('account', 10)
// $ExpectType Promise<TransactionReceipt>
kip7.burnFrom('account', new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip7.burnFrom('account', 'amount', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.burnFrom('account', 10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip7.burnFrom('account', new BigNumber(10), sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip7.pause()
// $ExpectType Promise<TransactionReceipt>
kip7.pause(sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip7.unpause()
// $ExpectType Promise<TransactionReceipt>
kip7.unpause(sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip7.addPauser('account')
// $ExpectType Promise<TransactionReceipt>
kip7.addPauser('account', sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip7.renouncePauser()
// $ExpectType Promise<TransactionReceipt>
kip7.renouncePauser(sendOptions)

const kip17 = KIP17.create()

// $ExpectType KIP17
kip17.clone()
// $ExpectType KIP17
kip17.clone('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')

// $ExpectType Promise<KIP17DetectedObject>
kip17.detectInterface()

// $ExpectType Promise<boolean>
kip17.supportsInterface('interface id')

// $ExpectType Promise<string>
kip17.name()

// $ExpectType Promise<string>
kip17.symbol()

// $ExpectType Promise<string>
kip17.tokenURI('id')
// $ExpectType Promise<string>
kip17.tokenURI(0)
// $ExpectType Promise<string>
kip17.tokenURI(new BigNumber(0))

// $ExpectType Promise<BigNumber>
kip17.totalSupply()

// $ExpectType Promise<BigNumber>
kip17.tokenOfOwnerByIndex('address', '0')
// $ExpectType Promise<BigNumber>
kip17.tokenOfOwnerByIndex('address', 0)
// $ExpectType Promise<BigNumber>
kip17.tokenOfOwnerByIndex('address', new BigNumber(0))

// $ExpectType Promise<BigNumber>
kip17.tokenByIndex('0')
// $ExpectType Promise<BigNumber>
kip17.tokenByIndex(0)
// $ExpectType Promise<BigNumber>
kip17.tokenByIndex(new BigNumber(0))

// $ExpectType Promise<BigNumber>
kip17.balanceOf('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')

// $ExpectType Promise<string>
kip17.ownerOf('0')
// $ExpectType Promise<string>
kip17.ownerOf(0)
// $ExpectType Promise<string>
kip17.ownerOf(new BigNumber(0))

// $ExpectType Promise<string>
kip17.getApproved('0')
// $ExpectType Promise<string>
kip17.getApproved(0)
// $ExpectType Promise<string>
kip17.getApproved(new BigNumber(0))

// $ExpectType Promise<boolean>
kip17.isApprovedForAll('owner', 'operator')

// $ExpectType Promise<boolean>
kip17.isMinter('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')

// $ExpectType Promise<boolean>
kip17.isPauser('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')

// $ExpectType Promise<boolean>
kip17.paused()

// $ExpectType Promise<TransactionReceipt>
kip17.approve('spender', 'tokenId')
// $ExpectType Promise<TransactionReceipt>
kip17.approve('spender', 10)
// $ExpectType Promise<TransactionReceipt>
kip17.approve('spender', new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip17.approve('spender', 'tokenId', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip17.approve('spender', 10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip17.approve('spender', new BigNumber(10), sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip17.setApprovalForAll('to', true)
// $ExpectType Promise<TransactionReceipt>
kip17.setApprovalForAll('to', true, sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip17.transferFrom('sender', 'recipient', 'tokenId')
// $ExpectType Promise<TransactionReceipt>
kip17.transferFrom('sender', 'recipient', 10)
// $ExpectType Promise<TransactionReceipt>
kip17.transferFrom('sender', 'recipient', new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip17.transferFrom('sender', 'recipient', 'tokenId', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip17.transferFrom('sender', 'recipient', 10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip17.transferFrom('sender', 'recipient', new BigNumber(10), sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip17.safeTransferFrom('sender', 'recipient', 'tokenId')
// $ExpectType Promise<TransactionReceipt>
kip17.safeTransferFrom('sender', 'recipient', 10)
// $ExpectType Promise<TransactionReceipt>
kip17.safeTransferFrom('sender', 'recipient', new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip17.safeTransferFrom('sender', 'recipient', 'tokenId', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip17.safeTransferFrom('sender', 'recipient', 10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip17.safeTransferFrom('sender', 'recipient', new BigNumber(10), sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip17.safeTransferFrom('sender', 'recipient', 'tokenId', 'data')
// $ExpectType Promise<TransactionReceipt>
kip17.safeTransferFrom('sender', 'recipient', 10, 'data')
// $ExpectType Promise<TransactionReceipt>
kip17.safeTransferFrom('sender', 'recipient', new BigNumber(10), 'data')
// $ExpectType Promise<TransactionReceipt>
kip17.safeTransferFrom('sender', 'recipient', 'tokenId', 'data', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip17.safeTransferFrom('sender', 'recipient', 10, 'data', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip17.safeTransferFrom('sender', 'recipient', new BigNumber(10), 'data', sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip17.addMinter('account')
// $ExpectType Promise<TransactionReceipt>
kip17.addMinter('account', sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip17.renounceMinter()
// $ExpectType Promise<TransactionReceipt>
kip17.renounceMinter(sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip17.mint('account', 'tokenId')
// $ExpectType Promise<TransactionReceipt>
kip17.mint('account', 10)
// $ExpectType Promise<TransactionReceipt>
kip17.mint('account', new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip17.mint('account', 'tokenId', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip17.mint('account', 10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip17.mint('account', new BigNumber(10), sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip17.mintWithTokenURI('account', 'tokenId', 'uri')
// $ExpectType Promise<TransactionReceipt>
kip17.mintWithTokenURI('account', 10, 'uri')
// $ExpectType Promise<TransactionReceipt>
kip17.mintWithTokenURI('account', new BigNumber(10), 'uri')
// $ExpectType Promise<TransactionReceipt>
kip17.mintWithTokenURI('account', 'tokenId', 'uri', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip17.mintWithTokenURI('account', 10, 'uri', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip17.mintWithTokenURI('account', new BigNumber(10), 'uri', sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip17.burn('tokenId')
// $ExpectType Promise<TransactionReceipt>
kip17.burn(10)
// $ExpectType Promise<TransactionReceipt>
kip17.burn(new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip17.burn('tokenId', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip17.burn(10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip17.burn(new BigNumber(10), sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip17.pause()
// $ExpectType Promise<TransactionReceipt>
kip17.pause(sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip17.unpause()
// $ExpectType Promise<TransactionReceipt>
kip17.unpause(sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip17.addPauser('account')
// $ExpectType Promise<TransactionReceipt>
kip17.addPauser('account', sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip17.renouncePauser()
// $ExpectType Promise<TransactionReceipt>
kip17.renouncePauser(sendOptions)

const kip37 = KIP37.create()

// $ExpectType KIP37
kip37.clone()
// $ExpectType KIP37
kip37.clone('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')

// $ExpectType Promise<KIP37DetectedObject>
kip37.detectInterface()

// $ExpectType Promise<boolean>
kip37.supportsInterface('interface id')

// $ExpectType Promise<string>
kip37.uri('id')
// $ExpectType Promise<string>
kip37.uri(0)
// $ExpectType Promise<string>
kip37.uri(new BigNumber(0))

// $ExpectType Promise<BigNumber>
kip37.totalSupply('id')
// $ExpectType Promise<BigNumber>
kip37.totalSupply(0)
// $ExpectType Promise<BigNumber>
kip37.totalSupply(new BigNumber(0))

// $ExpectType Promise<BigNumber>
kip37.balanceOf('address', 'id')
// $ExpectType Promise<BigNumber>
kip37.balanceOf('address', 0)
// $ExpectType Promise<BigNumber>
kip37.balanceOf('address', new BigNumber(0))

// $ExpectType Promise<BigNumber[]>
kip37.balanceOfBatch(['address'], ['id'])
// $ExpectType Promise<BigNumber[]>
kip37.balanceOfBatch(['address'], [0])
// $ExpectType Promise<BigNumber[]>
kip37.balanceOfBatch(['address'], [new BigNumber(0)])

// $ExpectType Promise<boolean>
kip37.isApprovedForAll('address', 'operator')

// $ExpectType Promise<boolean>
kip37.paused('id')
// $ExpectType Promise<boolean>
kip37.paused(0)
// $ExpectType Promise<boolean>
kip37.paused(new BigNumber(0))

// $ExpectType Promise<boolean>
kip37.isMinter('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')

// $ExpectType Promise<boolean>
kip37.isPauser('0x7cb3e499bcfae0804d31c2757aadba0cdefd3d43')

// $ExpectType Promise<TransactionReceipt>
kip37.create('tokenId', '10')
// $ExpectType Promise<TransactionReceipt>
kip37.create(10, 10)
// $ExpectType Promise<TransactionReceipt>
kip37.create(new BigNumber(10), new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip37.create('tokenId', '10', 'uri')
// $ExpectType Promise<TransactionReceipt>
kip37.create(10, 10, 'uri')
// $ExpectType Promise<TransactionReceipt>
kip37.create(new BigNumber(10), new BigNumber(10), 'uri')
// $ExpectType Promise<TransactionReceipt>
kip37.create('tokenId', '10', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.create(10, 10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.create(new BigNumber(10), new BigNumber(10), sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.create('tokenId', '10', 'uri', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.create(10, 10, 'uri', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.create(new BigNumber(10), new BigNumber(10), 'uri', sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip37.setApprovalForAll('to', true)
// $ExpectType Promise<TransactionReceipt>
kip37.setApprovalForAll('to', true, sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip37.safeTransferFrom('sender', 'recipient', 'tokenId', 'amount')
// $ExpectType Promise<TransactionReceipt>
kip37.safeTransferFrom('sender', 'recipient', 10, 10)
// $ExpectType Promise<TransactionReceipt>
kip37.safeTransferFrom('sender', 'recipient', new BigNumber(10), new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip37.safeTransferFrom('sender', 'recipient', 'tokenId', 'amount', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.safeTransferFrom('sender', 'recipient', 10, 10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.safeTransferFrom('sender', 'recipient', new BigNumber(10), new BigNumber(10), sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.safeTransferFrom('sender', 'recipient', 'tokenId', 'amount', 'data')
// $ExpectType Promise<TransactionReceipt>
kip37.safeTransferFrom('sender', 'recipient', 10, 10, 'data')
// $ExpectType Promise<TransactionReceipt>
kip37.safeTransferFrom('sender', 'recipient', new BigNumber(10), new BigNumber(10), 'data')
// $ExpectType Promise<TransactionReceipt>
kip37.safeTransferFrom('sender', 'recipient', 'tokenId', 'amount', 'data', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.safeTransferFrom('sender', 'recipient', 10, 10, 'data', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.safeTransferFrom('sender', 'recipient', new BigNumber(10), new BigNumber(10), 'data', sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip37.safeBatchTransferFrom('sender', 'recipient', ['tokenId'], ['amount'])
// $ExpectType Promise<TransactionReceipt>
kip37.safeBatchTransferFrom('sender', 'recipient', [10], [10])
// $ExpectType Promise<TransactionReceipt>
kip37.safeBatchTransferFrom('sender', 'recipient', [new BigNumber(10)], [new BigNumber(10)])
// $ExpectType Promise<TransactionReceipt>
kip37.safeBatchTransferFrom('sender', 'recipient', ['tokenId'], ['amount'], sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.safeBatchTransferFrom('sender', 'recipient', [10], [10], sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.safeBatchTransferFrom('sender', 'recipient', [new BigNumber(10)], [new BigNumber(10)], sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.safeBatchTransferFrom('sender', 'recipient', ['tokenId'], ['amount'], 'data')
// $ExpectType Promise<TransactionReceipt>
kip37.safeBatchTransferFrom('sender', 'recipient', [10], [10], 'data')
// $ExpectType Promise<TransactionReceipt>
kip37.safeBatchTransferFrom('sender', 'recipient', [new BigNumber(10)], [new BigNumber(10)], 'data')
// $ExpectType Promise<TransactionReceipt>
kip37.safeBatchTransferFrom('sender', 'recipient', ['tokenId'], ['amount'], 'data', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.safeBatchTransferFrom('sender', 'recipient', [10], [10], 'data', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.safeBatchTransferFrom('sender', 'recipient', [new BigNumber(10)], [new BigNumber(10)], 'data', sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip37.mint('account', 'tokenId', 'amount')
// $ExpectType Promise<TransactionReceipt>
kip37.mint('account', 10, 10)
// $ExpectType Promise<TransactionReceipt>
kip37.mint('account', new BigNumber(10), new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip37.mint('account', 'tokenId', 'amount', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.mint('account', 10, 10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.mint('account', new BigNumber(10), new BigNumber(10), sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.mint(['account'], 'tokenId', 'amount')
// $ExpectType Promise<TransactionReceipt>
kip37.mint(['account'], 10, 10)
// $ExpectType Promise<TransactionReceipt>
kip37.mint(['account'], new BigNumber(10), new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip37.mint(['account'], 'tokenId', 'amount', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.mint(['account'], 10, 10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.mint(['account'], new BigNumber(10), new BigNumber(10), sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.mint('account', 'tokenId', ['amount'])
// $ExpectType Promise<TransactionReceipt>
kip37.mint('account', 10, [10])
// $ExpectType Promise<TransactionReceipt>
kip37.mint('account', new BigNumber(10), [new BigNumber(10)])
// $ExpectType Promise<TransactionReceipt>
kip37.mint('account', 'tokenId', ['amount'], sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.mint('account', 10, [10], sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.mint('account', new BigNumber(10), [new BigNumber(10)], sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.mint(['account'], 'tokenId', ['amount'])
// $ExpectType Promise<TransactionReceipt>
kip37.mint(['account'], 10, [10])
// $ExpectType Promise<TransactionReceipt>
kip37.mint(['account'], new BigNumber(10), [new BigNumber(10)])
// $ExpectType Promise<TransactionReceipt>
kip37.mint(['account'], 'tokenId', ['amount'], sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.mint(['account'], 10, [10], sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.mint(['account'], new BigNumber(10), [new BigNumber(10)], sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip37.mintBatch('account', ['tokenId'], ['amount'])
// $ExpectType Promise<TransactionReceipt>
kip37.mintBatch('account', [10], [10])
// $ExpectType Promise<TransactionReceipt>
kip37.mintBatch('account', [new BigNumber(10)], [new BigNumber(10)])
// $ExpectType Promise<TransactionReceipt>
kip37.mintBatch('account', ['tokenId'], ['amount'], sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.mintBatch('account', [10], [10], sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.mintBatch('account', [new BigNumber(10)], [new BigNumber(10)], sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip37.addMinter('account')
// $ExpectType Promise<TransactionReceipt>
kip37.addMinter('account', sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip37.renounceMinter()
// $ExpectType Promise<TransactionReceipt>
kip37.renounceMinter(sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip37.burn('account', 'tokenId', 'amount')
// $ExpectType Promise<TransactionReceipt>
kip37.burn('account', 10, 10)
// $ExpectType Promise<TransactionReceipt>
kip37.burn('account', new BigNumber(10), new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip37.burn('account', 'tokenId', 'amount', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.burn('account', 10, 10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.burn('account', new BigNumber(10), new BigNumber(10), sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip37.burnBatch('account', ['tokenId'], ['amount'])
// $ExpectType Promise<TransactionReceipt>
kip37.burnBatch('account', [10], [10])
// $ExpectType Promise<TransactionReceipt>
kip37.burnBatch('account', [new BigNumber(10)], [new BigNumber(10)])
// $ExpectType Promise<TransactionReceipt>
kip37.burnBatch('account', ['tokenId'], ['amount'], sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.burnBatch('account', [10], [10], sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.burnBatch('account', [new BigNumber(10)], [new BigNumber(10)], sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip37.pause()
// $ExpectType Promise<TransactionReceipt>
kip37.pause(sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.pause('tokenId')
// $ExpectType Promise<TransactionReceipt>
kip37.pause(10)
// $ExpectType Promise<TransactionReceipt>
kip37.pause(new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip37.pause('tokenId', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.pause(10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.pause(new BigNumber(10), sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip37.unpause()
// $ExpectType Promise<TransactionReceipt>
kip37.unpause(sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.unpause('tokenId')
// $ExpectType Promise<TransactionReceipt>
kip37.unpause(10)
// $ExpectType Promise<TransactionReceipt>
kip37.unpause(new BigNumber(10))
// $ExpectType Promise<TransactionReceipt>
kip37.unpause('tokenId', sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.unpause(10, sendOptions)
// $ExpectType Promise<TransactionReceipt>
kip37.unpause(new BigNumber(10), sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip37.addPauser('account')
// $ExpectType Promise<TransactionReceipt>
kip37.addPauser('account', sendOptions)

// $ExpectType Promise<TransactionReceipt>
kip37.renouncePauser()
// $ExpectType Promise<TransactionReceipt>
kip37.renouncePauser(sendOptions)
