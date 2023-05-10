import polygon from './polygon.json';
import dogechain from './dogechain.json';
import zktestnet from './zktestnet.json';
import zkmainnet from './zkmainnet.json';
import arbitrum from './arbitrum.json';
import sepolia from './sepolia.json';
import { ChainId } from '@arbistar/sdk';
const configs: any = {
  [ChainId.MATIC]: polygon,
  [ChainId.DOGECHAIN]: dogechain,
  [ChainId.ZKTESTNET]: zktestnet,
  [ChainId.ZK_EVM]: zkmainnet,
  [ChainId.ARBITRUM]: arbitrum,
  [ChainId.SEPOLIA]: sepolia,
};

export const getConfig = (network: ChainId | undefined) => {
  if (network === undefined) {
    return configs[ChainId.SEPOLIA];
  }
  const config = configs[network];
  return config;
};
