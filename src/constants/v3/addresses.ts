import { ChainId, WETH } from '@uniswap/sdk';
import { Token } from '@uniswap/sdk';
import { Token as TokenV3 } from '@uniswap/sdk-core';
import { Matic } from 'v3lib/entities/matic';

export enum V2Exchanges {
  Quickswap = 'Quickswap',
  SushiSwap = 'Sushiswap',
  //Uniswap = 'Uniswap',
}

type ExchangeAddressMap = { [exchange in V2Exchanges]: AddressMap };
type AddressMap = { [chainId: number]: string };

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[];
};

const WETH_ONLY: ChainTokenList = {
  [ChainId.MUMBAI]: [WETH[ChainId.MUMBAI]],
  [ChainId.MATIC]: [WETH[ChainId.MATIC]],
  [ChainId.DOEGCHAIN_TESTNET]: [WETH[ChainId.DOEGCHAIN_TESTNET]],
  [ChainId.DOGECHAIN]: [WETH[ChainId.DOGECHAIN]],
};

export const toV3Token = (t: {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
}): TokenV3 => {
  return new TokenV3(t.chainId, t.address, t.decimals, t.symbol, t.name);
};

export const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MUMBAI]: '0xc7efb32470dee601959b15f1f923e017c6a918ca', //TODO: CHANGE THIS
  [ChainId.MATIC]: '0x02817C1e3543c2d908a590F5dB6bc97f933dB4BD',
  [ChainId.DOEGCHAIN_TESTNET]: '0x02817C1e3543c2d908a590F5dB6bc97f933dB4BD',
  [ChainId.DOGECHAIN]: '0x0110B3b142031F85a80Afdc9C7bcAA80dAfe7C63',
};

export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x411b0fAcC3489691f28ad58c47006AF5E3Ab3A28',
  [ChainId.DOGECHAIN]: '0xd2480162Aa7F02Ead7BF4C127465446150D58452',
};

export const POOL_DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x2D98E2FA9da15aa6dC9581AB097Ced7af697CB92',
  [ChainId.DOGECHAIN]: '0x56c2162254b0E4417288786eE402c2B41d4e181e',
};

export const QUOTER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0xa15F0D7377B2A0C0c10db057f641beD21028FC89',
  [ChainId.DOGECHAIN]: '0xd8E1E7009802c914b0d39B31Fc1759A865b727B1',
};

export const SWAP_ROUTER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0xf5b509bB0909a69B1c207E495f687a596C168E12',
  [ChainId.DOGECHAIN]: '0x4aE2bD0666c76C7f39311b9B3e39b53C8D7C43Ea',
};

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x8eF88E4c7CfbbaC1C163f7eddd4B578792201de6',
  [ChainId.DOGECHAIN]: '0x0b012055F770AE7BB7a8303968A7Fb6088A2296e',
};

export const MULTICALL_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x6ccb9426CeceE2903FbD97fd833fD1D31c100292',
  [ChainId.DOGECHAIN]: '0x23602819a9E2B1C8eC7605356D5b0F1FBB10ddA5',
};

export const V3_MIGRATOR_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x157B9913E00204f8c980bb00aa62E22b0dAb1a63',
  [ChainId.DOGECHAIN]: '0xB9aFAa5c407DdebA5098193F31CE23D21cFD9657',
};

export const REAL_STAKER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x32CFF674763b06B983C0D55Ef2e41B84D16855bb',
  [ChainId.DOGECHAIN]: '0x32CFF674763b06B983C0D55Ef2e41B84D16855bb',
};

export const FINITE_FARMING: AddressMap = {
  [ChainId.MATIC]: '0x9923f42a02A82dA63EE0DbbC5f8E311e3DD8A1f8',
  [ChainId.DOGECHAIN]: '0x481FcFa00Ee6b2384FF0B3c3b5b29aD911c1AAA7',
};

export const INFINITE_FARMING_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x8a26436e41d0b5fc4C6Ed36C1976fafBe173444E',
  [ChainId.DOGECHAIN]: '0xC712F63E4D57ED1684FB4b428a1DFF10e3338F25',
};

export const FARMING_CENTER: AddressMap = {
  [ChainId.MATIC]: '0x7F281A8cdF66eF5e9db8434Ec6D97acc1bc01E78',
  [ChainId.DOGECHAIN]: '0x82831E9565cb574375596eFc090da465283E22A4',
};

export const V2_FACTORY_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
};

export const EXCHANGE_FACTORY_ADDRESS_MAPS: ExchangeAddressMap = {
  [V2Exchanges.Quickswap]: {
    [ChainId.MATIC]: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
  },
  [V2Exchanges.SushiSwap]: {
    [ChainId.MATIC]: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
  },
};

export const EXCHANGE_PAIR_INIT_HASH_MAPS: ExchangeAddressMap = {
  [V2Exchanges.Quickswap]: {
    //TODO: Verify the Pair INIT hash
    [ChainId.MATIC]:
      '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
  },
  [V2Exchanges.SushiSwap]: {
    [ChainId.MATIC]:
      '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
  },
};

export const V2_ROUTER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff',
  [ChainId.MUMBAI]: '0x8954AfA98594b838bda56FE4C12a09D7739D179b',
};

export const PARASWAP_PROXY_ROUTER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x216b4b4ba9f3e719726886d34a177484278bfcae',
};

export const PARASWAP_ROUTER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
};

export const LAIR_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0xf28164a485b0b2c90639e47b0f377b4a438a16b1',
};

export const NEW_LAIR_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x958d208Cdf087843e9AD98d23823d32E17d723A1',
};

export const QUICK_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x831753DD7087CaC61aB5644b308642cc1c33Dc13',
};

export const NEW_QUICK_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0xB5C064F955D8e7F38fE0460C556a72987494eE17',
};

export const QUICK_CONVERSION: AddressMap = {
  [ChainId.MATIC]: '0x333068d06563a8dfdbf330a0e04a9d128e98bf5a',
};

export const ENS_REGISTRAR_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
};

export const SOCKS_CONTROLLER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x65770b5283117639760beA3F867b69b3697a91dd',
};

export const V2_MATIC_USDT_PAIR: AddressMap = {
  [ChainId.MATIC]: '0x604229c960e5cacf2aaeac8be68ac07ba9df81c3',
};

export const LENDING_QS_POOL_DIRECTORY: AddressMap = {
  [ChainId.MATIC]: '0xDeFf0321cD7E62Dccc6df90A3C0720E0a3449CB4',
};

export const LENDING_LENS: AddressMap = {
  [ChainId.MATIC]: '0x4B1dfA99d53FFA6E4c0123956ec4Ac2a6D9F4c75',
};

export const LENDING_QS_POOLS: { [chainId: number]: string[] } = {
  [ChainId.MATIC]: [
    '0x4514EC28a1e91b0999d803775D716DB0e597992d',
    '0x11cCE62387D144150EB9ca12D2678795f2DB4873',
    '0x4e460721539d1643938151DB9f31fd751cDb37E1',
  ],
};

export const WMATIC_EXTENDED: { [chainId: number]: TokenV3 } = {
  [ChainId.MATIC]: new TokenV3(
    ChainId.MATIC,
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    18,
    'WMATIC',
    'Wrapped Matic',
  ),
};

export const USDC: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    6,
    'USDC',
    'USDC',
  ),
};

export const USDT: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    6,
    'USDT',
    'Tether USD',
  ),
};

export const OLD_QUICK: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    QUICK_ADDRESS[ChainId.MATIC],
    18,
    'QUICK(OLD)',
    'Quickswap(OLD)',
  ),
};

export const NEW_QUICK: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    NEW_QUICK_ADDRESS[ChainId.MATIC],
    18,
    'QUICK(NEW)',
    'QuickSwap(NEW)',
  ),
};

export const OLD_DQUICK: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xf28164A485B0B2C90639E47b0f377b4a438a16B1',
    18,
    'dQUICK',
    'Dragon QUICK',
  ),
};

export const NEW_DQUICK: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x958d208Cdf087843e9AD98d23823d32E17d723A1',
    18,
    'dQUICK',
    'Dragon QUICK',
  ),
};

export const WBTC: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    8,
    'wBTC',
    'Wrapped Bitcoin',
  ),
};

export const DAI: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    18,
    'DAI',
    'Dai Stablecoin',
  ),
};

export const ETHER: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    18,
    'ETH',
    'Ether',
  ),
};

export const CXETH: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xfe4546feFe124F30788c4Cc1BB9AA6907A7987F9',
    18,
    'cxETH',
    'CelsiusX Wrapped ETH',
  ),
};

export const MI: { [chainId: number]: Token } = {
  [ChainId.MATIC]: new Token(
    ChainId.MATIC,
    '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1',
    18,
    'MAI',
    'miMATIC',
  ),
};

export const V2_BASES_TO_CHECK_TRADES_AGAINST: {
  [ChainId: number]: Token[];
} = {
  [ChainId.MATIC]: [
    ...WETH_ONLY[ChainId.MATIC],
    USDC[ChainId.MATIC],
    USDT[ChainId.MATIC],
    OLD_QUICK[ChainId.MATIC],
    NEW_QUICK[ChainId.MATIC],
    ETHER[ChainId.MATIC],
    WBTC[ChainId.MATIC],
    DAI[ChainId.MATIC],
    //GHST,
    MI[ChainId.MATIC],
  ],
};

// Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these tokens.
export const V2_CUSTOM_BASES: {
  [ChainId: number]: { [tokenAddress: string]: Token[] };
} = {};

export const V3_CUSTOM_BASES: {
  [chainId: number]: { [tokenAddress: string]: TokenV3[] };
} = {};

export const V3_BASES_TO_CHECK_TRADES_AGAINST: {
  [ChainId: number]: TokenV3[];
} = {
  [ChainId.MATIC]: [
    WMATIC_EXTENDED[ChainId.MATIC],
    toV3Token(USDC[ChainId.MATIC]),
  ],
};

export const SUGGESTED_BASES: {
  [ChainId: number]: Token[];
} = {
  [ChainId.MATIC]: [
    ...WETH_ONLY[ChainId.MATIC],
    DAI[ChainId.MATIC],
    USDC[ChainId.MATIC],
    USDT[ChainId.MATIC],
    OLD_QUICK[ChainId.MATIC],
    NEW_QUICK[ChainId.MATIC],
    ETHER[ChainId.MATIC],
    WBTC[ChainId.MATIC],
    MI[ChainId.MATIC],
  ],
};

export const V2_BASES_TO_TRACK_LIQUIDITY_FOR: {
  [ChainId: number]: Token[];
} = {
  [ChainId.MATIC]: [
    ...WETH_ONLY[ChainId.MATIC],
    DAI[ChainId.MATIC],
    USDC[ChainId.MATIC],
    USDT[ChainId.MATIC],
    OLD_QUICK[ChainId.MATIC],
    NEW_QUICK[ChainId.MATIC],
    ETHER[ChainId.MATIC],
    WBTC[ChainId.MATIC],
  ],
};

export const V3_BASES_TO_TRACK_LIQUIDITY_FOR: {
  [ChainId: number]: TokenV3[];
} = {
  [ChainId.MATIC]: [
    WMATIC_EXTENDED[ChainId.MATIC],
    toV3Token(DAI[ChainId.MATIC]),
    toV3Token(USDC[ChainId.MATIC]),
    toV3Token(USDT[ChainId.MATIC]),
    toV3Token(OLD_QUICK[ChainId.MATIC]),
    toV3Token(NEW_QUICK[ChainId.MATIC]),
    toV3Token(ETHER[ChainId.MATIC]),
    toV3Token(WBTC[ChainId.MATIC]),
  ],
};

export const V2_PINNED_PAIRS: {
  [ChainId: number]: [Token, Token][];
} = {
  [ChainId.MATIC]: [
    [USDC[ChainId.MATIC], USDT[ChainId.MATIC]],
    [USDC[ChainId.MATIC], DAI[ChainId.MATIC]],
    [ETHER[ChainId.MATIC], USDC[ChainId.MATIC]],
    [WBTC[ChainId.MATIC], ETHER[ChainId.MATIC]],
    [WETH[ChainId.MATIC], USDT[ChainId.MATIC]],
    [WETH[ChainId.MATIC], USDC[ChainId.MATIC]],
    [WETH[ChainId.MATIC], ETHER[ChainId.MATIC]],
    [ETHER[ChainId.MATIC], OLD_QUICK[ChainId.MATIC]],
  ],
};

export const V3_PINNED_PAIRS: {
  [ChainId: number]: [TokenV3, TokenV3][];
} = {
  [ChainId.MATIC]: [
    [toV3Token(USDC[ChainId.MATIC]), toV3Token(USDT[ChainId.MATIC])],
    [toV3Token(USDC[ChainId.MATIC]), toV3Token(DAI[ChainId.MATIC])],
    [toV3Token(ETHER[ChainId.MATIC]), toV3Token(USDC[ChainId.MATIC])],
    [toV3Token(WBTC[ChainId.MATIC]), toV3Token(ETHER[ChainId.MATIC])],
    [toV3Token(WETH[ChainId.MATIC]), toV3Token(USDT[ChainId.MATIC])],
    [toV3Token(WETH[ChainId.MATIC]), toV3Token(USDC[ChainId.MATIC])],
    [toV3Token(WETH[ChainId.MATIC]), toV3Token(ETHER[ChainId.MATIC])],
    [toV3Token(ETHER[ChainId.MATIC]), toV3Token(OLD_QUICK[ChainId.MATIC])],
  ],
};

export class ExtendedEther extends Matic {
  private static _cachedEther: { [chainId: number]: ExtendedEther } = {};

  public get wrapped(): TokenV3 {
    if (this.chainId in WMATIC_EXTENDED) return WMATIC_EXTENDED[this.chainId];
    throw new Error('Unsupported chain ID');
  }

  public static onChain(chainId: number): ExtendedEther {
    return (
      this._cachedEther[chainId] ??
      (this._cachedEther[chainId] = new ExtendedEther(chainId))
    );
  }
}
