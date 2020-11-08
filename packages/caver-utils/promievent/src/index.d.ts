import EventEmitter from 'eventemitter3'

const mergeEmitterProp: (obj: any) => any

function PromiEvent(
    promiseOnly: any
): {
    resolve: (value: any) => any
    reject: any
    eventEmitter: any
}

export default PromiEvent
