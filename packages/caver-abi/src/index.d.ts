import { AbiInput, AbiItem } from '../../caver-utils/src'

export interface Result {
    [k: string]: string | number
    __length__: number
}

export default class ABI {
    decodeFunctionCall(abi: AbiItem, functionCall: string): Result
    decodeLog(inputs: AbiInput[], data: string, topics: string[]): Result
    decodeParameter(type: string, bytes: string): string
    decodeParameters(outputs: string[], bytes: string): Result
    decodeParametersWith(outputs: string[], bytes: string, loose: boolean): Result
    encodeContractDeploy(jsonInterface: AbiItem[], bytecode: string, args: any[]): string
    encodeEventSignature(functionName: AbiItem | string): string
    encodeFunctionCall(jsonInterface: AbiItem, params: any[]): string
    encodeFunctionSignature(functionName: AbiItem | string): string
    encodeParameter(type: string, param: any): string
    encodeParameters(types: string[], params: any[]): string
    formatParam(type: string, param: any): string | string[]
    isSimplifiedStructFormat(type: string | object): boolean
    mapStructNameAndType(structName: string): AbiItem
    mapStructToCoderFormat(struct: AbiItem): AbiItem
    mapTypes(types: AbiItem[]): AbiItem[]
}
