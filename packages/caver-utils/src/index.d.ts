import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import _ from 'lodash'
import SignatureData from '../../caver-wallet/src/keyring/signatureData'
import BaseUtils from './utils'
import Iban from '../iban'
    
export type Unit =
    | 'peb'
    | 'kpeb'
    | 'Mpeb'
    | 'Gpeb'
    | 'Ston'
    | 'ston'
    | 'uKLAY'
    | 'mKLAY'
    | 'KLAY'
    | 'kKLAY'
    | 'MKLAY'
    | 'GKLAY'
    | 'TKLAY'

export interface KlayUnit {
    peb: { unit: 'peb', pebFactor: 0 }
    kpeb: { unit: 'kpeb', pebFactor: 3 }
    Mpeb: { unit: 'Mpeb', pebFactor: 6 }
    Gpeb: { unit: 'Gpeb', pebFactor: 9 }
    ston: { unit: 'ston', pebFactor: 9 }
    uKLAY: { unit: 'uKLAY', pebFactor: 12 }
    mKLAY: { unit: 'mKLAY', pebFactor: 15 }
    KLAY: { unit: 'KLAY', pebFactor: 18 }
    kKLAY: { unit: 'kKLAY', pebFactor: 21 }
    MKLAY: { unit: 'MKLAY', pebFactor: 24 }
    GKLAY: { unit: 'GKLAY', pebFactor: 27 }
    TKLAY: { unit: 'TKLAY', pebFactor: 30 }
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

export interface PromiEvent {
    resolve: (value: unknown) => void
    reject: (reason?: any) => void;
    eventEmitter: Promise<any> | object
}

export default class Utils {
    static _fireError(error: object, emitter: object, reject: Function, callback: Function): object
    static _jsonInterfaceMethodToString(abiItem: AbiItem): string
    static _flattenTypes(includeTuple: boolean, puts: object): string[]
    static randomHex(bytesSize: number): string
    static soliditySha3(...val: Mixed[]): string | null
    static toChecksumAddress(address: string): string
    static hexToAscii(hex: string): string
    static toAscii(hex: string): string
    static asciiToHex(str: string): string
    static fromAscii(str: string): string
    static unitMap: UnitMap
    static klayUnit: KlayUnit
    static toWei(number: BN, unit?: Unit): BN
    static toWei(number: string, unit?: Unit): string
    static fromWei(number: BN, unit?: Unit): BN
    static fromWei(number: string, unit?: Unit): string
    static unitKlayMap: UnitMap
    static toPeb(number: BN, unit?: Unit): BN
    static toPeb(number: number | string, unit?: Unit): string
    static fromPeb(number: number | string, unit?: Unit): string
    static convertFromPeb(number: number | string | BN | BigNumber, unitString: string | KlayUnit): string
    static convertToPeb(number: number | string | BN | BigNumber, unitString: string | KlayUnit): string | BN
    static isBN: BaseUtils['isBN']
    static isBigNumber: BaseUtils['isBigNumber']
    static isHex: BaseUtils['isHex']
    static isHexStrict: BaseUtils['isHexStrict']
    static sha3: BaseUtils['sha3']
    static keccak256: BaseUtils['sha3']
    static isAddress: BaseUtils['isAddress']
    static checkAddressChecksum: BaseUtils['checkAddressChecksum']
    static toHex: BaseUtils['toHex']
    static toBN: BaseUtils['toBN']
    static toBuffer: BaseUtils['toBuffer']
    static numberToBuffer: BaseUtils['numberToBuffer']
    static bufferToHex: BaseUtils['bufferToHex']
    static bytesToHex: BaseUtils['bytesToHex']
    static hexToBytes: BaseUtils['hexToBytes']
    static hexToNumberString: BaseUtils['hexToNumberString']
    static hexToNumber: BaseUtils['hexToNumber']
    static toDecimal: BaseUtils['hexToNumber']
    static numberToHex: BaseUtils['numberToHex']
    static fromDecimal: BaseUtils['numberToHex']
    static hexToUtf8: BaseUtils['hexToUtf8']
    static hexToString: BaseUtils['hexToUtf8']
    static toUtf8: BaseUtils['hexToUtf8']
    static utf8ToHex: BaseUtils['utf8ToHex']
    static stringToHex: BaseUtils['utf8ToHex']
    static fromUtf8: BaseUtils['utf8ToHex']
    static padLeft: BaseUtils['leftPad']
    static leftPad: BaseUtils['leftPad']
    static padRight: BaseUtils['rightPad']
    static rightPad: BaseUtils['rightPad']
    static toTwosComplement: BaseUtils['toTwosComplement']
    /** @deprecated */
    static isTxHash: BaseUtils['isTxHash']
    /** @deprecated */
    static isTxHashStrict: BaseUtils['isTxHashStrict']
    static isValidHash: BaseUtils['isValidHash']
    static isValidHashStrict: BaseUtils['isValidHashStrict']
    static promiEvent(promiseOnly: boolean): PromiEvent
    static Iban: Iban
    static isHexParameter(a: unknown): boolean
    static isHexPrefixed(str: string | object): boolean
    static addHexPrefix(str: string | object): string
    static stripHexPrefix(str: string | object): string
    static parsePredefinedBlockNumber: BaseUtils['parsePredefinedBlockNumber']
    static isPredefinedBlockNumber: BaseUtils['isPredefinedBlockNumber']
    static isValidBlockNumberCandidate: BaseUtils['isValidBlockNumberCandidate']
    static isValidPrivateKey: BaseUtils['isValidPrivateKey']
    static isValidNSHSN: BaseUtils['isValidNSHSN']
    static parsePrivateKey: BaseUtils['parsePrivateKey']
    static parseKlaytnWalletKey: BaseUtils['parseKlaytnWalletKey']
    static isKlaytnWalletKey: BaseUtils['isKlaytnWalletKey']
    static isContractDeployment: BaseUtils['isContractDeployment']
    static rlpEncode: BaseUtils['rlpEncode']
    static rlpDecode: BaseUtils['rlpDecode']
    static xyPointFromPublicKey: BaseUtils['xyPointFromPublicKey']
    static resolveSignature: BaseUtils['resolveSignature']
    static transformSignaturesToObject: BaseUtils['transformSignaturesToObject']
    static getTxTypeStringFromRawTransaction: BaseUtils['getTxTypeStringFromRawTransaction']
    static txTypeToString: BaseUtils['txTypeToString']
    static trimLeadingZero: BaseUtils['trimLeadingZero']
    static makeEven: BaseUtils['makeEven']
    static isValidPublicKey: BaseUtils['isValidPublicKey']
    static isCompressedPublicKey: BaseUtils['isCompressedPublicKey']
    static compressPublicKey: BaseUtils['compressPublicKey']
    static decompressPublicKey: BaseUtils['decompressPublicKey']
    static isValidRole: BaseUtils['isValidRole']
    static isEmptySig: BaseUtils['isEmptySig']
    static hashMessage: BaseUtils['hashMessage']
    static recover: BaseUtils['recover']
    static recoverPublicKey: BaseUtils['recoverPublicKey']
    static publicKeyToAddress: BaseUtils['publicKeyToAddress']
    static decodeSignature(signature: string): SignatureData
}