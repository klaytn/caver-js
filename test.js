const Caver = require('./index')
// console.log(flatten(Caver))

// const provider = new Caver.providers.HttpProvider('https://internal.baobab.klaytn.net:8651', { timeout: 2000 })
const providerwoTimeout = new Caver.providers.HttpProvider('https://internal.baobab.klaytn.net:8651')
const caver = new Caver(providerwoTimeout)

async function test() {
    const keyring = caver.wallet.keyring.createFromPrivateKey('0x0c66be6f6a0c539be9e99d883e897cdc10cb016a958c9a61485ae57cace5d7bf')
    caver.wallet.add(keyring)

    // const kip7 = await caver.kct.kip7.deploy({
    // 	name: 'Jasmine',
    // 	symbol: 'JAS',
    // 	decimals: 18,
    // 	initialSupply: '100000000'
    // }, keyring.address)

    // console.log(kip7)

    // const kip7 = caver.kct.kip7.create('0xf0c398035a88c0dffe23a71bc991a247a24da4d5')
    // const receipt = await kip7.transfer(keyring.address, 1000, { from: keyring.address })
    // console.log(receipt)
    // console.log(receipt.events.Transfer)

    // const tx = caver.transaction.valueTransfer.create({
    //     from: keyring.address,
    //     to: keyring.address,
    //     value: 1,
    //     gas: 250000,
    // })
    // await caver.wallet.sign(keyring.address, tx)
    // console.log(tx)

    // caver.setProvider(provider)

    // caver.rpc.klay.sendRawTransaction(tx).on('transactionHash', (hash) => {
    //     console.log(hash)
    // })

    console.log(
        caver.abi.decodeLog(
            [
                { indexed: true, name: 'from', type: 'address' },
                { indexed: true, name: 'to', type: 'address' },
                { indexed: false, name: 'value', type: 'uint256' },
            ],
            '0x00000000000000000000000000000000000000000000000000000000000003e8',
            [
                '0x00000000000000000000000060498fefbf1705a3db8d7bb5c80d5238956343e5',
                '0x00000000000000000000000060498fefbf1705a3db8d7bb5c80d5238956343e5',
            ]
        )
    )
}

test()

// const caver = new Caver(`http://141.164.51.33:8551`)
// //// ABI & ByteCode
// const abi = require('./packages/caver-kct/src/kctHelper').kip7JsonInterface // 컨트랙트 ABI
// const byteCode = require(`./packages/caver-kct/src/kctHelper`).kip7ByteCode // 컨트랙트 bytecode
// //// GLOBAL
// let keyring = undefined
// let nonce = undefined
// let curNonce = undefined
// let txMap = {}

// /**
//  * ms 단위로 딜레이를 준다.
//  * @param {*} ms 딜레이 타임 (ms)
//  */
// let delay = function(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms))
// }

// /**
//  * @notice deploy tx 생성함수
//  * @param keyring address keyring 정보
//  * @param nonce address 논스값
//  * @param index 호출 인덱스
//  * @author jhhong
//  */
// let makeTxDeploy = async function(keyring, nonce, index) {
//     try {
//         let name = 'My ERC20 Token'
//         let symbol = 'MET'
//         let decimals = 18
//         let totalSupply = '100000000000000000000000000'
//         let myErc20 = caver.contract.create(abi)
//         let data = await myErc20.deploy({ data: byteCode, arguments: [name, symbol, decimals, totalSupply] }).encodeABI()
//         let gas = 2000000
//         let rawTx = { from: keyring.address, gas: gas, nonce: nonce, data: data }
//         const tx = caver.transaction.smartContractDeploy.create(rawTx)
//         await caver.wallet.sign(keyring.address, tx)
//         console.log(`트랜잭션 생성 Idx:[${index}], nonce:[${nonce}]`)
//         let obj = new Object()
//         obj.contents = tx
//         obj.created = true
//         obj.index = index
//         txMap[nonce] = obj
//     } catch (error) {
//         console.log(error)
//         return false
//     }
// }

// /**
//  * @notice sendKlay transaction 전송함수
//  * @param nonce 트랜젝션 논스
//  * @param obj 서명된 트랜젝션이 포함된 구조체
//  * @author jhhong
//  */
// let sendTxDeploy = function(nonce, obj) {
//     console.log(`트랜잭션 전송 Idx:[${obj.index}], nonce:[${nonce}]`)
//     caver.rpc.klay
//         .sendRawTransaction(obj.contents)
//         .on('transactionHash', function(txHash) {
//             console.log(`[transactionHash] Idx:[${obj.index}], Deploy TX:['${txHash}']`)
//         })
//         .on('receipt', function(receipt) {
//             console.log(
//                 'DEBUG',
//                 `[receipt] Idx:[${obj.index}], Deploy TX:['${receipt.transactionHash}'], BlockNumber:[${parseInt(receipt.blockNumber)}]`
//             )
//             delete obj
//         })
// }

// process.on('deploy-event', function(index) {
//     console.log(`Receive deploy-event! index:[%s]`, index)
//     if (nonce == undefined) {
//         console.log(`nonce does not initialized`)
//         return
//     }
//     let param = nonce++
//     process.emit('proc-deploy', index, param)
// })

// /**
//  * @notice 테스트 함수
//  * @author jhhong
//  */
// let RunProc = async function() {
//     try {
//         keyring = await caver.wallet.keyring.createFromPrivateKey('3614732543faf2726ffff58b3243ac8f653e047963edaa6b46b15bcbc6dcd9c4')
//         nonce = await caver.rpc.klay.getTransactionCount(keyring.address)
//         curNonce = parseInt(nonce)
//         await caver.wallet.add(keyring)

//         /**
//          * @notice proce-deploy 이벤트 처리함수
//          * @param idx 인덱스 번호
//          * @param nonce keyring address 논스값
//          * @author jhhong
//          */
//         process.on('proc-deploy', async function(idx, nonce) {
//             try {
//                 console.log(`start proc-deploy :[${idx}], nonce:[${nonce}]`)
//                 await makeTxDeploy(keyring, nonce, idx)
//                 console.log(`nonce:[${nonce}], curNonce:[${curNonce}]`)
//                 if (nonce == curNonce) {
//                     while (txMap[curNonce]) {
//                         sendTxDeploy(curNonce, txMap[curNonce])
//                         curNonce++
//                     }
//                 }
//             } catch (error) {
//                 console.log('ERROR', `${error}`)
//                 process.exit(1)
//             }
//         })

//         for (let i = 0; i < 2000; i++) {
//             process.emit('deploy-event', i)
//         }
//         await delay(100000)
//     } catch (error) {
//         console.log('ERROR', `${error}`)
//         process.exit(1)
//     }
// }
// RunProc()
