import { fileLogger } from './fileLogger'
import { rpcFilter } from './rpcFilter'
import { timeMeasure } from './timeMeasure'

export default interface IBuiltins {
    fileLogger: typeof fileLogger,
    rpcFilter: typeof rpcFilter
    timeMeasure:  typeof timeMeasure
}
