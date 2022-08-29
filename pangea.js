const Caver = require('./index')
const caver = new Caver('https://api.baobab.klaytn.net:8651')

const masterDeployerABI = [
    {
        inputs: [
            {
                name: '_factory',
                type: 'address',
            },
            {
                name: '_deployData',
                type: 'bytes',
            },
        ],
        name: 'deployPool',
        outputs: [
            {
                name: 'pool',
                type: 'address',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
]
const factoryABI = [
    {
        inputs: [{ name: 'data', type: 'bytes32' }],
        name: 'configAddress',
        outputs: [{ name: 'pool', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
]

createLP_KLAYKCT()
async function createLP_KLAYKCT() {
    const keyring = caver.wallet.add(caver.wallet.keyring.createFromPrivateKey('0x{private key}'))

    // Deploy KCT Token
    const jamieToken = await caver.kct.kip7.deploy(
        {
            name: 'Jamie',
            symbol: 'JAMIE',
            decimals: 18,
            initialSupply: '1000000000000000000000000000',
        },
        keyring.address
    )
    console.log(`KCT Token address: ${jamieToken.options.address}\n`)

    // Below addresses are in Baobab network
    // const ConcentratedLiquidityPoolFactory = '0x3d94b5E3b83CbD52B9616930D33515613ADfAd67' // in Cypress
    // const MasterDeployer = '0xEB4B1CE03bb947Ce23ABd1403dF7C9B86004178d' // in Cypress
    // const WETH10 = '0xFF3e7cf0C007f919807b32b30a4a9E7Bd7Bc4121' // in Cypress
    const ConcentratedLiquidityPoolFactory = '0x2be2C91cCA2df52b41a9e42723c46fD029359c95'
    const MasterDeployer = '0x899d8Ff3d3BD16DBE4eFF245BdA27EF96C01044B'
    const WETH10 = '0x0339d5Eb6D195Ba90B13ed1BCeAa97EbD198b106'

    const desiredTokenAmount = caver.utils.convertToPeb(1, 'KLAY')
    const desiredKLAYAmount = caver.utils.convertToPeb(1, 'KLAY')
    let token0Address
    let token1Address
    let amount0
    let amount1
    if (caver.utils.toBN(WETH10).cmp(caver.utils.toBN(jamieToken.options.address)) > 0) {
        token1Address = WETH10
        token0Address = jamieToken.options.address
        amount0 = caver.utils.toBN(desiredKLAYAmount)
        amount1 = caver.utils.toBN(desiredTokenAmount)
    } else if (caver.utils.toBN(WETH10).cmp(caver.utils.toBN(jamieToken.options.address)) < 0) {
        token1Address = jamieToken.options.address
        token0Address = WETH10
        amount0 = caver.utils.toBN(desiredTokenAmount)
        amount1 = caver.utils.toBN(desiredKLAYAmount)
    } else {
        throw new Error(`Same address`)
    }

    // [1] Price 계산하기
    // 풀 형성 시 두 토큰의 상대 가격을 지정해야 합니다.
    // 풀에서의 price는 `√(token1/token0*2^192)`의 형태로 관리됩니다.
    const price = sqrtValue(
        caver.utils
            .toBN(2)
            .pow(caver.utils.toBN(192))
            .mul(amount1)
            .div(amount0)
    )

    // Create a LP
    // swapFee:number,       /// 스왑 수수료 (단위 : 1000 = 0.1%)
    // tickSpacing:number,   /// 틱의 간격
    // 현재 가능한 스왑 수수료와 틱 간격의 조합은 (10_000, 100) / (2_000, 20) / (600, 6) / (100, 1)
    const swapFee = 100
    const tickSpacing = 1
    const masterDeployer = caver.contract.create(masterDeployerABI, MasterDeployer)
    // Before adding liquidity KLAY-KCT, approve token to masterDeployer contract
    const approved = await jamieToken.approve(masterDeployer.options.address, desiredTokenAmount, { from: keyring.address })
    console.log(`Approved KCT Token to Master Deployer(${masterDeployer.options.address}) Status: ${Boolean(approved.status)}`)
    let encoded = caver.abi.encodeParameters(
        ['address', 'address', 'uint24', 'uint160', 'uint24'],
        [token0Address, token1Address, swapFee, price, tickSpacing]
    )
    const createPool = await masterDeployer.send(
        { from: keyring.address, gas: 10000000 },
        'deployPool',
        ConcentratedLiquidityPoolFactory,
        encoded
    )
    console.log(`Created Liquidity Pool Status: ${Boolean(createPool.status)}`)

    // Check the pool address
    const factory = caver.contract.create(factoryABI, '0x2be2C91cCA2df52b41a9e42723c46fD029359c95')
    encoded = caver.abi.encodeParameters(['address', 'address', 'uint24', 'uint24'], [token0Address, token1Address, swapFee, tickSpacing])
    encoded = caver.utils.sha3(encoded)
    const poolAddress = await factory.call({ from: keyring.address }, 'configAddress', encoded)
    console.log(`Created pool address: ${poolAddress}`)
}

/**
 * 제곱근 계산
 */
function sqrtValue(value) {
    const ONE = caver.utils.toBN(1)
    const TWO = caver.utils.toBN(2)

    const x = caver.utils.toBN(value)
    let z = x.add(ONE).div(TWO)
    let y = x
    while (z.sub(y).negative == 1) {
        y = z
        z = x
            .div(z)
            .add(z)
            .div(TWO)
    }
    return y
}
