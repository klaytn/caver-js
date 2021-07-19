import { TransactionObject } from '../../caver-rtm/src'

export default interface IValidateFunction {
    validateParams(tx: TransactionObject): Error
    validateTxType(txType: string): boolean
    validateCodeFormat(cf: string): boolean
}