export default interface IPayloadTransformer {
    reversePayload(payload: any): any
}