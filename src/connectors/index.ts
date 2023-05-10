import { Web3Provider } from '@ethersproject/providers';
import { initializeConnector, Web3ReactHooks } from '@web3-react/core';
import { GnosisSafe } from '@web3-react/gnosis-safe';
import { MetaMask } from '@web3-react/metamask';
import { Network } from '@web3-react/network';
import { Connector } from '@web3-react/types';
import { ChainId } from '@arbistar/sdk';
import MetamaskIcon from 'assets/images/metamask.png';
import BlockWalletIcon from 'assets/images/blockwalletIcon.svg';
import BraveWalletIcon from 'assets/images/braveWalletIcon.png';
import cypherDIcon from 'assets/images/cypherDIcon.png';
import BitKeepIcon from 'assets/images/bitkeep.png';
import CoinbaseWalletIcon from 'assets/images/coinbaseWalletIcon.svg';
import WalletConnectIcon from 'assets/images/walletConnectIcon.svg';
import PhantomIcon from 'assets/images/wallets/phantomIconPurple.svg';
import VenlyIcon from 'assets/images/venly.svg';
import UnstoppableDomainsIcon from 'assets/images/unstoppableDomains.png';
import GnosisIcon from 'assets/images/gnosis_safe.png';
import TrustIcon from 'assets/images/trust.png';
import ZengoIcon from 'assets/images/zengo.png';
import { GlobalConst } from 'constants/index';
import { RPC_PROVIDERS, rpcMap } from 'constants/providers';

const POLLING_INTERVAL = 12000;

function onError(error: Error) {
  console.debug(`web3-react error: ${error}`);
}

export enum ConnectionType {
  INJECTED = 'INJECTED',
  COINBASE_WALLET = 'COINBASE_WALLET',
  ARKANE = 'ARKANE_CONNECT',
  WALLET_CONNECT = 'WALLET_CONNECT',
  NETWORK = 'NETWORK',
  GNOSIS_SAFE = 'GNOSIS_SAFE',
}

export interface Connection {
  key: string;
  connector: Connector;
  hooks: Web3ReactHooks;
  type: ConnectionType;
  name: string;
  iconName: string;
  description: string;
  color: string;
  href?: string;
  primary?: true;
  mobile?: true;
  mobileOnly?: true;
  installLink?: string | null;
}

export interface NetworkInfo {
  rpcUrl: string;
  scanUrl: string;
}

export type NetworkInfoChainMap = Readonly<
  {
    [chainId in ChainId]: NetworkInfo;
  }
>;

export const networkInfoMap: NetworkInfoChainMap = {
  [ChainId.MATIC]: {
    rpcUrl: 'https://polygon-rpc.com/',
    scanUrl: 'https://polygonscan.com/',
  },
  [ChainId.DOGECHAIN]: {
    rpcUrl: 'https://rpc-sg.dogechain.dog/',
    scanUrl: 'https://explorer.dogechain.dog/',
  },
  [ChainId.MUMBAI]: {
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
    scanUrl: 'https://mumbai.polygonscan.com/',
  },
  [ChainId.DOGE_TESTNET]: {
    rpcUrl: 'https://rpc-testnet.dogechain.dog',
    scanUrl: 'https://explorer-testnet.dogechain.dog/',
  },
  [ChainId.ZKTESTNET]: {
    rpcUrl: 'https://rpc.public.zkevm-test.net',
    scanUrl: 'https://testnet-zkevm.polygonscan.com/',
  },
  [ChainId.ZK_EVM]: {
    rpcUrl: 'https://zkevm-rpc.com',
    scanUrl: 'https://zkevm.polygonscan.com/',
  },
  [ChainId.ARBITRUM]: {
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    scanUrl: 'https://arbiscan.io',
  },
  [ChainId.SEPOLIA]: {
    rpcUrl: 'https://rpc.sepolia.org',
    scanUrl: 'https://sepolia.etherscan.io',
  },
};

const FORMATIC_KEY = process.env.REACT_APP_FORTMATIC_KEY;

const [web3Network, web3NetworkHooks] = initializeConnector<Network>(
  (actions) =>
    new Network({ actions, urlMap: RPC_PROVIDERS, defaultChainId: 11155111 }),
);

export const networkConnection: Connection = {
  key: 'NETWORK',
  name: 'Network',
  connector: web3Network,
  hooks: web3NetworkHooks,
  type: ConnectionType.NETWORK,
  iconName: '',
  description: '',
  color: '',
};

const [web3GnosisSafe, web3GnosisSafeHooks] = initializeConnector<GnosisSafe>(
  (actions) => new GnosisSafe({ actions }),
);
export const gnosisSafeConnection: Connection = {
  key: 'SAFE_APP',
  name: GlobalConst.walletName.SAFE_APP,
  connector: web3GnosisSafe,
  hooks: web3GnosisSafeHooks,
  type: ConnectionType.GNOSIS_SAFE,
  iconName: GnosisIcon,
  color: '#4196FC',
  description: 'Login using gnosis safe app',
};

const [web3Injected, web3InjectedHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions, onError }),
);
export const injectedConnection: Connection = {
  key: 'INJECTED',
  name: GlobalConst.walletName.INJECTED,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  iconName: 'arrow-right.svg',
  color: '#010101',
  description: 'Injected web3 provider.',
};

export const metamaskConnection: Connection = {
  key: 'METAMASK',
  name: GlobalConst.walletName.METAMASK,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  iconName: MetamaskIcon,
  color: '#E8831D',
  description: 'Easy-to-use browser extension.',
};

export const blockWalletConnection: Connection = {
  key: 'BLOCKWALLET',
  name: GlobalConst.walletName.BLOCKWALLET,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  iconName: BlockWalletIcon,
  color: '#1673ff',
  description: 'BlockWallet browser extension.',
};

export const braveWalletConnection: Connection = {
  key: 'BRAVEWALLET',
  name: GlobalConst.walletName.BRAVEWALLET,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  iconName: BraveWalletIcon,
  color: '#1673ff',
  description: 'Brave browser wallet.',
  mobile: true,
};

export const bitKeepConnection: Connection = {
  key: 'BITKEEP',
  name: GlobalConst.walletName.BITKEEP,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  iconName: BitKeepIcon,
  color: '#E8831D',
  description: 'BitKeep browser extension.',
};

export const cypherDConnection: Connection = {
  key: 'CYPHERD',
  name: GlobalConst.walletName.CYPHERD,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  iconName: cypherDIcon,
  color: '#E8831D',
  description: 'CypherD browser extension.',
};

export const phantomConnection: Connection = {
  key: 'PHANTOM_WALLET',
  name: GlobalConst.walletName.PHANTOM_WALLET,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  iconName: PhantomIcon,
  color: '#E8831D',
  description: 'Phantom wallet extension.',
};

export const trustWalletConnection: Connection = {
  key: 'TRUST_WALLET',
  name: GlobalConst.walletName.TRUST_WALLET,
  connector: web3Injected,
  hooks: web3InjectedHooks,
  type: ConnectionType.INJECTED,
  iconName: TrustIcon,
  color: '#E8831D',
  description: 'Trust wallet extension.',
};

export function getConnections() {
  return [
    cypherDConnection,
    metamaskConnection,
    trustWalletConnection,
    phantomConnection,
    braveWalletConnection,
    blockWalletConnection,
    bitKeepConnection,
    injectedConnection,
    gnosisSafeConnection,
  ];
}
