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

import BigNumber from 'bignumber.js'
import BN = require('bn.js')
import _ = require('lodash')
import { SignatureData } from '../../caver-wallet/src'
import { TransactionForRPC, PromiEvent } from '../../caver-core/src'

export type EncodeScalarInput = Buffer | string | number
export type EncodeInput = EncodeScalarInput | EncodeScalarInput[]

export interface SignatureObject {
    V?: string
    R?: string
    S?: string
    v?: string
    r?: string
    s?: string
}

export type Unit = 'peb' | 'kpeb' | 'Mpeb' | 'Gpeb' | 'Ston' | 'ston' | 'uKLAY' | 'mKLAY' | 'KLAY' | 'kKLAY' | 'MKLAY' | 'GKLAY' | 'TKLAY'

export interface UnitInfo {
    unit: string
    pebFactor: number
}

export interface KlayUnit {
    [key: string]: UnitInfo
}

export interface UnitMap {
    peb: '1'
    kpeb: '1000'
    Mpeb: '1000000'
    Gpeb: '1000000000'
    Ston: '1000000000'
    ston: '1000000000'
    uKLAY: '1000000000000'
    mKLAY: '1000000000000000'
    KLAY: '1000000000000000000'
    kKLAY: '1000000000000000000000'
    MKLAY: '1000000000000000000000000'
    GKLAY: '1000000000000000000000000000'
    TKLAY: '1000000000000000000000000000000'
}

export type Mixed =
    | string
    | number
    | BN
    | {
          type: string
          value: string
      }
    | {
          t: string
          v: string | BN | number
      }
    | boolean

export type Hex = string | number

export type StateMutabilityType = 'pure' | 'view' | 'nonpayable' | 'payable'

export interface AbiItem {
    anonymous?: boolean
    constant?: boolean
    inputs?: AbiInput[]
    name?: string
    outputs?: AbiOutput[]
    payable?: boolean
    stateMutability?: StateMutabilityType
    type: string
    gas?: number
}

export interface AbiInput {
    name: string
    type: string
    indexed?: boolean
    components?: AbiInput[]
    internalType?: string
}

export interface AbiOutput {
    name: string
    type: string
    components?: AbiOutput[]
    internalType?: string
}

export class Iban {
    toAddress(ib?: string): string
    toIban(address: string): string
    fromAddress(address: string): Iban
    fromBban(bban: string): Iban
    createIndirect(options?: object): Iban
    isValid(): boolean
    isValid(iban: string): boolean
    isDirect(): boolean
    isIndirect(): boolean
    checksum(): string
    institution(): string
    client(): string
    toString(): string
}

export interface Utils {
    randomHex(bytesSize: number): string
    soliditySha3(...val: Mixed[]): string | null
    toChecksumAddress(address: string): string
    hexToAscii(hex: string): string
    toAscii(hex: string): string
    asciiToHex(str: string): string
    fromAscii(str: string): string
    unitMap: UnitMap
    klayUnit: KlayUnit
    toWei(number: BN, unit?: Unit): BN
    toWei(number: string, unit?: Unit): string
    fromWei(number: BN, unit?: Unit): BN
    fromWei(number: string, unit?: Unit): string
    unitKlayMap: UnitMap
    toPeb(number: BN, unit?: Unit): BN
    toPeb(number: number | string, unit?: Unit): string
    fromPeb(number: number | string, unit?: Unit): string
    convertFromPeb(number: number | string | BN | BigNumber, unitString: string | UnitInfo): string
    convertToPeb(number: number | string | BN | BigNumber, unitString: string | UnitInfo): string | BN
    isBN(object: object): boolean
    isBN(object: object): boolean
    isBigNumber(num: object): boolean
    toBN(number: number | string | BN): BN
    isAddress(address: string): boolean
    isBloom(bloom: string): boolean
    isTopic(topic: string): boolean
    checkAddressChecksum(address: string): boolean
    utf8ToHex(str: string): string
    hexToUtf8(hex: string): string
    hexToNumber(value: string | number | BN): number
    hexToNumberString(value: string | number | BN): string
    numberToHex(value: string | number | BN): string
    toHex(value: string | number | BN | object, returnType?: boolean): string
    bufferToHex(buf: Buffer | unknown[] | string | number | BN | object): Buffer
    toBuffer(input: Buffer | unknown[] | string | number | BN | object): Buffer
    numberToBuffer(num: number | string | BN): Buffer
    hexToBytes(hex: string): number[]
    bytesToHex(bytes: number[]): string
    isHex(hex: string): boolean
    isHexStrict(hex: string): boolean
    leftPad(string: string, chars: number, sign?: string): string
    rightPad(string: string, chars: number, sign?: string): string
    toTwosComplement(number: number | string | BN): string
    sha3(value: string | BN): string | null
    parsePredefinedBlockNumber(blockNumber: string): string
    isPredefinedBlockNumber(blockNumber: string): boolean
    isValidBlockNumberCandidate(blockNumber: string | number): boolean
    isValidPrivateKey(privateKey: string): boolean
    isValidNSHSN(value: string | number): boolean
    parsePrivateKey(
        privateKey: string
    ): {
        privateKey: string
        address: string
        isHumanReadable: boolean
    }
    parseKlaytnWalletKey(key: string): string[]
    isKlaytnWalletKey(privateKey: string): boolean
    isContractDeployment(txObject: TransactionForRPC): boolean
    rlpEncode(data: EncodeInput): string
    rlpDecode(encodedData: string): string | string[]
    xyPointFromPublicKey(pub: string): [string, string]
    resolveSignature(signature: string | string[] | object): string[]
    transformSignaturesToObject(signatures: string | string[] | SignatureData | SignatureObject): SignatureObject
    transformSignaturesToObject(signatures: string[][] | SignatureData[] | SignatureObject[]): SignatureObject[]
    transformSignaturesToObject(
        signatures: string | string[] | string[][] | SignatureData | SignatureData[] | SignatureObject | SignatureObject[]
    ): SignatureObject | SignatureObject[]
    getTxTypeStringFromRawTransaction(rawTransaction: string): string
    trimLeadingZero(hex: string): string
    makeEven(hex: string): string
    txTypeToString: string
    isValidPublicKey(publicKey: string): boolean
    isCompressedPublicKey(publicKey: string): boolean
    compressPublicKey(uncompressedPublicKey: string): string
    decompressPublicKey(compressedPublicKey: string): string
    /** @deprecated */
    isTxHash(txHash: string): boolean
    /** @deprecated */
    isTxHashStrict(txHash: string): boolean
    isValidHash(hash: string): boolean
    isValidHashStrict(hash: string): boolean
    isValidRole(role: string): boolean
    isEmptySig(sig: string | string[] | string[][] | object | SignatureData | SignatureData[]): boolean
    hashMessage(data: string): string
    recover(message: string, signature: SignatureData | string[] | object, isHashed?: boolean): string
    recoverPublicKey(message: string, signature: SignatureData | string[] | object, isHashed?: boolean): string
    publicKeyToAddress(publicKey: string): string
    Iban: Iban
    isHexParameter(a: unknown): boolean
    isHexPrefixed(str: string | object): boolean
    addHexPrefix(str: string | object): string
    stripHexPrefix(str: string | object): string
    decodeSignature(signature: string): SignatureData
}
