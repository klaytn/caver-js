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

import BN from 'bn.js'
import { TransactionObject } from '../../caver-rtm/src'
import SignatureData from '../../caver-wallet/src/keyring/signatureData'

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

export default interface Utils {
    isBN(object: object): boolean
    isBigNumber(num: object): boolean
    toBN(number: number | string | BN): BN
    isAddress(address: string): boolean
    isBloom(bloom: string): boolean
    isTopic(topic: string): boolean
    checkAddressChecksum(address: string): boolean
    utf8ToHex(str: string): string
    hexToUtf8(hex: string): string
    hexToNumber(value: string | number | BN): string
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
    isContractDeployment(txObject: TransactionObject): boolean
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
}

export function isBN(object: object): boolean
export function isBigNumber(num: object): boolean
export function toBN(number: number | string | BN): BN
export function isAddress(address: string): boolean
export function isBloom(bloom: string): boolean
export function isTopic(topic: string): boolean
export function checkAddressChecksum(address: string): boolean
export function utf8ToHex(str: string): string
export function hexToUtf8(hex: string): string
export function hexToNumber(value: string | number | BN): string
export function hexToNumberString(value: string | number | BN): string
export function numberToHex(value: string | number | BN): string
export function toHex(value: string | number | BN | object, returnType: boolean): string
export function bufferToHex(buf: Buffer | unknown[] | string | number | BN | object): Buffer
export function toBuffer(input: Buffer | unknown[] | string | number | BN | object): Buffer
export function numberToBuffer(num: number | string | BN): Buffer
export function hexToBytes(hex: string): number[]
export function bytesToHex(bytes: number[]): string
export function isHex(hex: string): boolean
export function isHexStrict(hex: string): boolean
export function leftPad(string: string, chars: number, sign?: string): string
export function rightPad(string: string, chars: number, sign?: string): string
export function toTwosComplement(number: number | string | BN): string
export function sha3(value: string | BN): string | null
export function parsePredefinedBlockNumber(blockNumber: string): string
export function isPredefinedBlockNumber(blockNumber: string): boolean
export function isValidBlockNumberCandidate(blockNumber: string | number): boolean
export function isValidPrivateKey(privateKey: string): boolean
export function isValidNSHSN(value: string | number): boolean
export function parsePrivateKey(
    privateKey: string
): {
    privateKey: string
    address: string
    isHumanReadable: boolean
}
export function parseKlaytnWalletKey(key: string): string[]
export function isKlaytnWalletKey(privateKey: string): boolean
export function isContractDeployment(txObject: TransactionObject): boolean
export function rlpEncode(data: EncodeInput): string
export function rlpDecode(encodedData: string): string | string[]
export function xyPointFromPublicKey(pub: string): [string, string]
export function resolveSignature(signature: string | string[] | object): string[]
export function transformSignaturesToObject(signatures: string | string[] | SignatureObject): SignatureObject
export function transformSignaturesToObject(signatures: string[][] | SignatureObject[]): SignatureObject[]
export function getTxTypeStringFromRawTransaction(rawTransaction: string): string
export function trimLeadingZero(hex: string): string
export function makeEven(hex: string): string
export const txTypeToString: string
export function isValidPublicKey(publicKey: string): boolean
export function isCompressedPublicKey(publicKey: string): boolean
export function compressPublicKey(uncompressedPublicKey: string): string
export function decompressPublicKey(compressedPublicKey: string): string
/** @deprecated */
export function isTxHash(txHash: string): boolean
/** @deprecated */
export function isTxHashStrict(txHash: string): boolean
export function isValidHash(hash: string): boolean
export function isValidHashStrict(hash: string): boolean
export function isValidRole(role: Role): boolean
export function isEmptySig(sig: string | string[] | string[][] | object | SignatureData | SignatureData[]): boolean
export function hashMessage(data: string): string
export function recover(message: string, signature: SignatureData | string[] | object, isHashed?: boolean): string
export function recoverPublicKey(message: string, signature: SignatureData | string[] | object, isHashed?: boolean): string
export function publicKeyToAddress(publicKey: string): string
