const Caver = require('./index')

const caver = new Caver('https://api.baobab.klaytn.net:8651')

// How to run definix.js
// - Replace `0x{private key}` to your private key string
// - Check the provider url (If you want to run script on the Cypress network, modify url above)
// - Run `node ./definix.js`

const factoryABI = [
    {
        constant: true,
        inputs: [{ name: '', type: 'address' }, { name: '', type: 'address' }],
        name: 'getPair',
        outputs: [{ name: '', type: 'address' }],
        payable: false,
        stateMutability: 'view',
        type: 'function',
    },
]
const routerABI = [
    {
        constant: false,
        inputs: [
            { name: 'token', type: 'address' },
            { name: 'amountTokenDesired', type: 'uint256' },
            { name: 'amountTokenMin', type: 'uint256' },
            { name: 'amountKLAYMin', type: 'uint256' },
            { name: 'to', type: 'address' },
            { name: 'deadline', type: 'uint256' },
        ],
        name: 'addLiquidityETH',
        outputs: [
            { name: 'amountToken', type: 'uint256' },
            { name: 'amountKLAY', type: 'uint256' },
            { name: 'liquidity', type: 'uint256' },
        ],
        payable: true,
        stateMutability: 'payable',
        type: 'function',
    },
]

createLiquidityPoolKLAYKCT()
async function createLiquidityPoolKLAYKCT() {
    const keyring = caver.wallet.add(caver.wallet.keyring.createFromPrivateKey('0x{private key}'))

    // Deploy KCT Token
    const jamieToken = await caver.kct.kip7.deploy(
        {
            name: 'Jamie',
            symbol: 'JMET',
            decimals: 18,
            initialSupply: '1000000000000000000000000000',
        },
        keyring.address
    )
    console.log(`KCT Token address: ${jamieToken.options.address}\n`)

    // Below addresses are in Baobab network
    // const routerAddress = '0x4e61743278ed45975e3038bedcaa537816b66b5b' // in Cypress
    // const factoryAddress = '0xdee3df2560bceb55d3d7ef12f76dcb01785e6b29' // in Cypress
    // const wKLAYAddress = '0x5819b6af194a78511c79c85ea68d2377a7e9335f' // in Cypress
    const routerAddress = '0xEf76E6934ddc4dF938989dE0aC78B987B280dd5F'
    const factoryAddress = '0x0Fb6cB86348Ca60Dd7F9ecd25d7Da6De0C445A8e'
    const wKLAYAddress = '0xf223E26B018AE1917E84DD73b515620e36a75596'

    // Add liquidity and mint LP tokens
    const router = caver.contract.create(routerABI, routerAddress)
    const desiredTokenAmount = caver.utils.convertToPeb(1, 'KLAY')
    const desiredKLAYAmount = caver.utils.convertToPeb(1, 'KLAY')
    // Before adding liquidity KLAY-KCT, approve token to ClaimSwap Router contract
    const approved = await jamieToken.approve(router.options.address, desiredTokenAmount, { from: keyring.address })
    console.log(`Approved KCT Token to Definix Router(${router.options.addresss}) Status: ${Boolean(approved.status)}`)
    const sendOptions = { from: keyring.address, gas: 10000000, value: desiredKLAYAmount }
    const addedLiquidityKLAY = await router.send(
        sendOptions,
        'addLiquidityETH',
        jamieToken.options.address,
        desiredTokenAmount,
        1, // amountTokenMin: Must be <= desiredTokenAmount
        1, // amountKLAYMin: Must be <= desiredKLAYAmount
        keyring.address, // to: Recipient of the liquidity tokens.
        Date.now() + 5000 // deadline: Unix timestamp after which the transaction will revert.
    )
    console.log(`Added Liquidity KLAY Status: ${Boolean(addedLiquidityKLAY.status)}`)

    // Create a WKLAY-KCT pair
    const factory = caver.contract.create(factoryABI, factoryAddress)
    const pairAddress = await factory.call({}, 'getPair', wKLAYAddress, jamieToken.options.address)
    const pairContract = caver.kct.kip7.create(pairAddress)
    const wKLAYContract = caver.kct.kip7.create(wKLAYAddress)
    console.log(
        `WKLAY(${wKLAYAddress})-KCT(${jamieToken.options.address}) Pair Total Supply: ${caver.utils.convertFromPeb(
            await pairContract.totalSupply(),
            'KLAY'
        )}`
    )
    console.log(
        `KLAY Balance of the Pair Contract(${pairAddress}): ${caver.utils.convertFromPeb(
            await wKLAYContract.balanceOf(pairAddress),
            'KLAY'
        )} wKLAY`
    )
    console.log(
        `KCT Balance of the Pair Contract(${pairAddress}): ${caver.utils.convertFromPeb(
            await jamieToken.balanceOf(pairAddress),
            'KLAY'
        )} KCT`
    )
}
