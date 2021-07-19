import IConstants from './constants'
import IErrors from './errors'
import IFormatters from './formatters'
import IPayloadTransformer from './payloadTransformer'
import IValidateFunction from './validateFunction'

export default interface IHelpers {
    errors: IErrors
    formatters: IFormatters
    payloadTransformer: IPayloadTransformer
    constants: IConstants
    validateFunction: IValidateFunction
}