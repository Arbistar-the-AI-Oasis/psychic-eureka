# QuickSwap new Interface

An open source interface for QuickSwap -- a protocol for decentralized exchange on Polygon.

Enabling users to:

- Add and remove their liquidity positions on QuickSwap protocol
- Swap tokens on QuickSwap protocol
- Participate in single and dual mining programmes running on QuickSwap protocol
- Participate in Dragon's lair running on QuickSwap protocol
- Participate in Dragon's syrup running on QuickSwap protocol

Useful links:

- Website: [quickswap.exchange](https://quickswap.exchange/)
- Beta: [beta.quickswap.exchange](https://beta.quickswap.exchange/)
- Info: [info.quickswap.exchange](https://info.quickswap.exchange)
- Twitter: [@QuickswapDEX](https://twitter.com/QuickswapDEX)
- Reddit: [/r/QuickSwap](https://www.reddit.com/r/QuickSwap)
- Discord: [QuickSwap](https://discord.gg/KTgdBTnU)

## Accessing the QuickSwap Interface

To access the QuickSwap Interface, use an IPFS gateway link from the
[latest release](https://github.com/QuickSwap/interface-v2/releases/latest),
or visit [quickswap.exchange](https://quickswap.exchange).

The QuickSwap interface is hosted on IPFS in a decentralized manner. `quickswap.exchange` just holds a CNAME record to the Cloudflare IPFS gateway. You can use [any](https://ipfs.github.io/public-gateway-checker/) public or private IPFS gateway supporting origin isolation to access QuickSwap interface if for some reason the Cloudflare gateway doesn't work for you

Just go to `<your favorite public ipfs gateway>/ipns/quickswap.exchange`

⚠️ Make sure the gateway supports origin isolation to avoid possible security issues: you should be redirected to URL that looks like `https://quickswap.exchange.<your gateway>`

## License

[GNU GPL V3.0](./LICENSE)

## Credits

To all the Ethereum and Polygon community

## Config

### Chain RPC

"rpcUrl": "https://arb1.arbitrum.io/rpc",
"scanUrl": "https://arbiscan.io",

"rpcUrl": "https://rpc.sepolia.org",
"scanUrl": "https://sepolia.etherscan.io",

### Deploy Data

npm run deploy --network sepolia

> deploy
> node scripts/deployAll.js "sepolia"
>
> MulticallV3 deployed to: 0xcA11bde05977b3631167028862bE2a173976CA11
> WrapEther deployed to: 0xFA83579eEc97290773602029c8970A18cfA742b5
> WrapBitcoin deployed to: 0x980A95832D20774D32c653A71e84d8eeca621225
> OrbitrumStable deployed to: 0xD2dbC6F36Acc7d760bB845D28eA50310Cc791718
> CircleStable deployed to: 0x34d570d1546632923e82563365281c59c708D7f1
> TetherStable deployed to: 0xaA943bc5EC47773cD605af62F746990D50146322
> AlgebraPoolDeployer to: 0xaD360203ff6CE03F2747510108A077f02EeD7Ff9
> AlgebraFactory deployed to: 0x12ca0BEa5A26755946B23C3b69eB30C306cd55c4
> TickLens deployed to: 0xFD3c6BA08130A7527a191E4dCFbB5aD86F62Fcce
> Quoter deployed to: 0x790dF7c192814ef927fb24F57c026B843915fDb0
> SwapRouter deployed to: 0xc2430db974e82A37398343B117993f596596F658
> NFTDescriptor deployed to: 0x8e41b055D684B46B584B3D1fF6d684CA0dC87135
> NFTPositionDescriptor deployed to: 0x45559Cc7C79ab507D3Ea160a1AB7F3A1B1A78D02
> Proxy deployed to: 0x3A80017c716fe768885DF53bd690E0c5eeE427cE
> NFTPositionManager deployed to: 0x24939284f77845cBBCd137EE68fB345E2D09Db15
> V3Migrator deployed to: 0x56e9268A6CCE496931324450a2D5EA3035a7fD2C
> AlgebraInterfaceMulticall deployed to: 0x1f7815C9b633d813EA3f5Fce3Eee8DC0283916A4
> AlgebraLimitFarming deployed to: 0xA1fF5A6F08D7Ae18b9901388E650ca807fe40358
> AlgebraEternalFarming deployed to: 0x7Be3F6f528611b476bc70cD9fd707AB220D0A4EE
> FarmingCenterVault deployed to: 0xAE474CEf4B50C3Fe9CD646428d046980a14cB08d
> FarmingCenter deployed to: 0x0ce14071d62402013fC19010825C719C0Df9b5B0
> Updated Farming Center Address in Eternal(incentive) Farming
> Updated Incentive Maker
> Updated Farming Center Address in Farming Center Vault
> Updated Farming Center Address in Factory
