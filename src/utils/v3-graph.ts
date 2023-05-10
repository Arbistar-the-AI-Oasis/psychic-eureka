import { clientV2, clientV3, farmingClient } from 'apollo/client';
import {
  ALL_PAIRS_V3,
  ALL_TOKENS_V3,
  FETCH_ETERNAL_FARM_FROM_POOL_V3,
  FETCH_TICKS,
  GLOBAL_TRANSACTIONS_V3,
  MATIC_PRICE_V3,
  PAIRS_FROM_ADDRESSES_V3,
  PAIR_FEE_CHART_V3,
  PAIR_TRANSACTIONS_v3,
  TOKENS_FROM_ADDRESSES_V3,
  TOP_POOLS_V3_TOKEN,
  TOP_POOLS_V3_TOKENS,
  TOP_TOKENS_V3,
  PRICES_BY_BLOCK_V3,
} from 'apollo/queries-v3';
import {
  get2DayPercentChange,
  getBlockFromTimestamp,
  getBlocksFromTimestamps,
  getPercentChange,
  splitQuery,
} from 'utils';
import dayjs from 'dayjs';
import { fetchEternalFarmAPR, fetchPoolsAPR } from './api';
import { Token } from '@uniswap/sdk-core';
import { TickMath, tickToPrice } from '@uniswap/v3-sdk';
import { ChainId, JSBI } from '@arbistar/sdk';
import keyBy from 'lodash.keyby';
import { GlobalConst, TxnType } from 'constants/index';
import {
  GLOBAL_DATA,
  PAIRS_BULK1,
  PAIRS_HISTORICAL_BULK,
  TOKENS_FROM_ADDRESSES_V2,
  TOKEN_DATA2,
  TOKEN_INFO,
  TOKEN_INFO_OLD,
} from 'apollo/queries';
import { getConfig } from 'config';

export const getMaticPrice: (chainId: ChainId) => Promise<number[]> = async (
  chainId: ChainId,
) => {
  const utcCurrentTime = dayjs();

  const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
  let maticPrice = 0;
  let maticPriceOneDay = 0;
  let priceChangeMatic = 0;
  const client = clientV3[chainId];

  if (client) {
    try {
      const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack, chainId);
      const result = await client.query({
        query: MATIC_PRICE_V3(),
        fetchPolicy: 'network-only',
      });
      let oneDayBackPrice = 0;
      if (oneDayBlock) {
        const resultOneDay = await client.query({
          query: MATIC_PRICE_V3(oneDayBlock),
          fetchPolicy: 'network-only',
        });
        oneDayBackPrice = Number(
          resultOneDay?.data?.bundles[0]?.maticPriceUSD ?? 0,
        );
      }
      const currentPrice = Number(result?.data?.bundles[0]?.maticPriceUSD ?? 0);

      priceChangeMatic = getPercentChange(currentPrice, oneDayBackPrice);
      maticPrice = currentPrice;
      maticPriceOneDay = oneDayBackPrice;
    } catch (e) {
      console.log(e);
    }
  }

  return [maticPrice, maticPriceOneDay, priceChangeMatic];
};

export async function getTopTokensV3(
  maticPrice: number,
  maticPrice24H: number,
  count = 500,
  chainId: ChainId,
): Promise<any> {
  const client = clientV3[chainId];
  if (!client) return;
  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();

    const [oneDayBlock] = await getBlocksFromTimestamps(
      [utcOneDayBack],
      500,
      chainId,
    );

    const topTokensIds = await client.query({
      query: TOP_TOKENS_V3(count),
      fetchPolicy: 'network-only',
    });

    const tokenAddresses: string[] = topTokensIds.data.tokens.map(
      (el: any) => el.id,
    );

    const tokensCurrent = await fetchTokensByTime(
      undefined,
      tokenAddresses,
      chainId,
    );

    let tokens24;
    if (oneDayBlock && oneDayBlock.number) {
      tokens24 = await fetchTokensByTime(
        oneDayBlock.number,
        tokenAddresses,
        chainId,
      );
    }

    const parsedTokens = parseTokensData(tokensCurrent);
    const parsedTokens24 = parseTokensData(tokens24);

    const formatted = tokenAddresses.map((address: string) => {
      const current = parsedTokens[address];
      const oneDay = parsedTokens24[address];

      const manageUntrackedVolume = current
        ? +current.volumeUSD <= 1
          ? 'untrackedVolumeUSD'
          : 'volumeUSD'
        : '';
      const manageUntrackedTVL = current
        ? +current.totalValueLockedUSD <= 1
          ? 'totalValueLockedUSDUntracked'
          : 'totalValueLockedUSD'
        : '';

      const currentVolume =
        current && current[manageUntrackedVolume]
          ? Number(current[manageUntrackedVolume])
          : 0;

      const oneDayVolume =
        oneDay && oneDay[manageUntrackedVolume]
          ? Number(oneDay[manageUntrackedVolume])
          : 0;

      let oneDayVolumeUSD = currentVolume - oneDayVolume;

      const tvlUSD = current ? parseFloat(current[manageUntrackedTVL]) : 0;
      const tvlUSDChange = getPercentChange(
        current ? current[manageUntrackedTVL] : undefined,
        oneDay ? oneDay[manageUntrackedTVL] : undefined,
      );
      const tvlToken = current ? parseFloat(current[manageUntrackedTVL]) : 0;
      let priceUSD = current
        ? parseFloat(current.derivedMatic) * maticPrice
        : 0;
      const priceUSDOneDay = oneDay
        ? parseFloat(oneDay.derivedMatic) * maticPrice24H
        : 0;

      const priceChangeUSD =
        priceUSD && priceUSDOneDay
          ? getPercentChange(
              Number(priceUSD.toString()),
              Number(priceUSDOneDay.toString()),
            )
          : 0;

      const txCount =
        current && oneDay
          ? parseFloat(current.txCount) - parseFloat(oneDay.txCount)
          : current
          ? parseFloat(current.txCount)
          : 0;
      const feesUSD =
        current && oneDay
          ? parseFloat(current.feesUSD) - parseFloat(oneDay.feesUSD)
          : current
          ? parseFloat(current.feesUSD)
          : 0;
      if (oneDayVolumeUSD < 0.0001) {
        oneDayVolumeUSD = 0;
      }
      if (priceUSD < 0.000001) {
        priceUSD = 0;
      }
      return {
        exists: !!current,
        id: address,
        name: current ? formatTokenName(address, current.name) : '',
        symbol: current ? formatTokenSymbol(address, current.symbol) : '',
        decimals: current ? current.decimals : 18,
        oneDayVolumeUSD,
        txCount,
        totalLiquidityUSD: tvlUSD,
        liquidityChangeUSD: tvlUSDChange,
        feesUSD,
        tvlToken,
        priceUSD,
        priceChangeUSD,
      };
    });

    const filtered = formatted.filter((token: any) => {
      return token !== undefined;
    });

    return filtered;
  } catch (err) {
    console.error(err);
  }
}

export const getIntervalTokenDataV3 = async (
  tokenAddress: string,
  startTime: number,
  interval = 3600,
  latestBlock: number | undefined,
  chainId: ChainId,
) => {
  const utcEndTime = dayjs.utc();
  let time = startTime;

  // create an array of hour start times until we reach current hour
  // buffer by half hour to catch case where graph isnt synced to latest block
  const timestamps = [];
  while (time < utcEndTime.unix()) {
    timestamps.push(time);
    time += interval;
  }

  const client = clientV3[chainId];
  // backout if invalid timestamp format
  if (timestamps.length === 0 || !client) {
    return [];
  }

  // once you have all the timestamps, get the blocks for each timestamp in a bulk query
  let blocks;
  try {
    blocks = await getBlocksFromTimestamps(timestamps, 100, chainId);

    // catch failing case
    if (!blocks || blocks.length === 0) {
      return [];
    }

    if (latestBlock) {
      blocks = blocks.filter((b) => {
        return Number(b.number) <= latestBlock;
      });
    }

    const result: any = await splitQuery(
      PRICES_BY_BLOCK_V3,
      client,
      [tokenAddress],
      blocks,
      50,
    );

    // format token ETH price results
    const values: any[] = [];
    for (const row in result) {
      const timestamp = row.split('t')[1];
      const derivedMatic = Number(result[row]?.derivedMatic ?? 0);
      if (timestamp) {
        values.push({
          timestamp,
          derivedMatic,
        });
      }
    }

    // go through eth usd prices and assign to original values array
    let index = 0;
    for (const brow in result) {
      const timestamp = brow.split('b')[1];
      if (timestamp) {
        values[index].priceUSD =
          result[brow].maticPriceUSD * values[index].derivedMatic;
        index += 1;
      }
    }

    const formattedHistory = [];

    // for each hour, construct the open and close price
    for (let i = 0; i < values.length - 1; i++) {
      formattedHistory.push({
        timestamp: values[i].timestamp,
        open: Number(values[i].priceUSD),
        close: Number(values[i + 1].priceUSD),
      });
    }

    return formattedHistory;
  } catch (e) {
    console.log(e);
    console.log('error fetching blocks');
    return [];
  }
};

export async function getTokenInfoV3(
  maticPrice: number,
  maticPrice24H: number,
  address: string,
  chainId: ChainId,
): Promise<any> {
  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();
    const utcOneWeekBack = utcCurrentTime.subtract(7, 'day').unix();
    const utcTwoWeekBack = utcCurrentTime.subtract(14, 'day').unix();

    const [
      oneDayBlock,
      twoDayBlock,
      oneWeekBlock,
      twoWeekBlock,
    ] = await getBlocksFromTimestamps(
      [utcOneDayBack, utcTwoDaysBack, utcOneWeekBack, utcTwoWeekBack],
      500,
      chainId,
    );

    let tokens24, tokens48, tokensOneWeek, tokensTwoWeek;
    const tokensCurrent = await fetchTokensByTime(
      undefined,
      [address],
      chainId,
    );

    if (oneDayBlock && oneDayBlock.number) {
      tokens24 = await fetchTokensByTime(
        oneDayBlock.number,
        [address],
        chainId,
      );
    }

    if (twoDayBlock && twoDayBlock.number) {
      tokens48 = await fetchTokensByTime(
        twoDayBlock.number,
        [address],
        chainId,
      );
    }

    if (oneWeekBlock && oneWeekBlock.number) {
      tokensOneWeek = await fetchTokensByTime(
        oneWeekBlock.number,
        [address],
        chainId,
      );
    }

    if (twoWeekBlock && twoWeekBlock.number) {
      tokensTwoWeek = await fetchTokensByTime(
        twoWeekBlock.number,
        [address],
        chainId,
      );
    }

    const parsedTokens = parseTokensData(tokensCurrent);
    const parsedTokens24 = parseTokensData(tokens24);
    const parsedTokens48 = parseTokensData(tokens48);
    const parsedTokensOneWeek = parseTokensData(tokensOneWeek);
    const parsedTokensTwoWeek = parseTokensData(tokensTwoWeek);

    const current = parsedTokens[address];
    const oneDay = parsedTokens24[address];
    const twoDay = parsedTokens48[address];
    const oneWeek = parsedTokensOneWeek[address];
    const twoWeek = parsedTokensTwoWeek[address];

    const manageUntrackedVolume = current
      ? +current.volumeUSD <= 1
        ? 'untrackedVolumeUSD'
        : 'volumeUSD'
      : '';
    const manageUntrackedTVL = current
      ? +current.totalValueLockedUSD <= 1
        ? 'totalValueLockedUSDUntracked'
        : 'totalValueLockedUSD'
      : '';

    let [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
      current && current[manageUntrackedVolume]
        ? Number(current[manageUntrackedVolume])
        : 0,
      oneDay && oneDay[manageUntrackedVolume]
        ? Number(oneDay[manageUntrackedVolume])
        : 0,
      twoDay && twoDay[manageUntrackedVolume]
        ? Number(twoDay[manageUntrackedVolume])
        : 0,
    );

    let [oneWeekVolumeUSD] = get2DayPercentChange(
      current && current[manageUntrackedVolume]
        ? Number(current[manageUntrackedVolume])
        : 0,
      oneWeek && oneWeek[manageUntrackedVolume]
        ? Number(oneWeek[manageUntrackedVolume])
        : 0,
      twoWeek && twoWeek[manageUntrackedVolume]
        ? Number(twoWeek[manageUntrackedVolume])
        : 0,
    );

    const tvlUSD = current ? parseFloat(current[manageUntrackedTVL]) : 0;
    const tvlUSDChange = getPercentChange(
      current && current[manageUntrackedTVL]
        ? Number(current[manageUntrackedTVL])
        : 0,
      oneDay && oneDay[manageUntrackedTVL]
        ? Number(oneDay[manageUntrackedTVL])
        : 0,
    );

    const tvlToken = current ? parseFloat(current[manageUntrackedTVL]) : 0;
    let priceUSD = current ? parseFloat(current.derivedMatic) * maticPrice : 0;
    const priceUSDOneDay = oneDay
      ? parseFloat(oneDay.derivedMatic) * maticPrice24H
      : 0;

    const priceChangeUSD =
      priceUSD && priceUSDOneDay
        ? getPercentChange(
            Number(priceUSD.toString()),
            Number(priceUSDOneDay.toString()),
          )
        : 0;

    const txCount =
      current && oneDay
        ? parseFloat(current.txCount) - parseFloat(oneDay.txCount)
        : current
        ? parseFloat(current.txCount)
        : 0;

    const feesUSD =
      current && oneDay
        ? parseFloat(current.feesUSD) - parseFloat(oneDay.feesUSD)
        : current
        ? parseFloat(current.feesUSD)
        : 0;
    if (oneDayVolumeUSD < 0.000001) {
      oneDayVolumeUSD = 0;
    }
    if (oneWeekVolumeUSD < 0.000001) {
      oneWeekVolumeUSD = 0;
    }
    if (priceUSD < 0.000001) {
      priceUSD = 0;
    }
    if (volumeChangeUSD < 0.0000001) {
      volumeChangeUSD = 0;
    }
    return current
      ? {
          id: address,
          name: current ? formatTokenName(address, current.name) : '',
          symbol: current ? formatTokenSymbol(address, current.symbol) : '',
          decimals: current ? current.decimals : 18,
          oneDayVolumeUSD,
          oneWeekVolumeUSD,
          volumeChangeUSD,
          txCount,
          tvlUSD,
          tvlUSDChange,
          feesUSD,
          tvlToken,
          priceUSD,
          priceChangeUSD,
          liquidityChangeUSD: tvlUSDChange,
          totalLiquidityUSD: tvlUSD,
        }
      : undefined;
  } catch (err) {
    console.error(err);
  }
}

export async function getAllTokensV3(chainId: ChainId) {
  const client = clientV3[chainId];
  if (!client) return;
  try {
    let allFound = false;
    let skipCount = 0;
    let tokens: any[] = [];
    while (!allFound) {
      const result = await client.query({
        query: ALL_TOKENS_V3,
        variables: {
          skip: skipCount,
        },
        fetchPolicy: 'network-only',
      });
      tokens = tokens.concat(result?.data?.tokens);
      if (result?.data?.tokens?.length < 10 || tokens.length > 10) {
        allFound = true;
      }
      skipCount = skipCount += 10;
    }
    return tokens;
  } catch (e) {
    console.log(e);
  }
}

export async function getTopPairsV3ByTokens(
  tokenAddress: string,
  tokenAddress1: string,
  chainId: ChainId,
) {
  const client = clientV3[chainId];
  if (!client) return;
  try {
    const utcCurrentTime = dayjs();

    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix();

    const [
      oneDayBlock,
      twoDayBlock,
      oneWeekBlock,
    ] = await getBlocksFromTimestamps(
      [utcOneDayBack, utcTwoDaysBack, utcOneWeekBack],
      500,
      chainId,
    );

    const topPairsIds = await client.query({
      query: TOP_POOLS_V3_TOKENS(tokenAddress, tokenAddress1),
      fetchPolicy: 'network-only',
    });

    const pairsAddresses = topPairsIds.data.pools0
      .concat(topPairsIds.data.pools1)
      .concat(topPairsIds.data.pools2)
      .concat(topPairsIds.data.pools3)
      .concat(topPairsIds.data.pools4)
      .map((el: any) => el.id);

    const pairsCurrent = await fetchPairsByTime(
      undefined,
      pairsAddresses,
      chainId,
    );

    let pairs24, pairs48, pairsWeek;

    if (oneDayBlock && oneDayBlock.number) {
      pairs24 = await fetchPairsByTime(
        oneDayBlock.number,
        pairsAddresses,
        chainId,
      );
    }

    if (twoDayBlock && twoDayBlock.number) {
      pairs48 = await fetchPairsByTime(
        twoDayBlock.number,
        pairsAddresses,
        chainId,
      );
    }

    if (oneWeekBlock && oneWeekBlock.number) {
      pairsWeek = await fetchPairsByTime(
        oneWeekBlock.number,
        pairsAddresses,
        chainId,
      );
    }

    const parsedPairs = parsePairsData(pairsCurrent);
    const parsedPairs24 = parsePairsData(pairs24);
    const parsedPairs48 = parsePairsData(pairs48);
    const parsedPairsWeek = parsePairsData(pairsWeek);

    const formatted = pairsAddresses.map((address: string) => {
      const current = parsedPairs[address];
      const oneDay = parsedPairs24[address];
      const twoDay = parsedPairs48[address];
      const week = parsedPairsWeek[address];

      if (!current) return;

      const manageUntrackedVolume =
        +current.volumeUSD <= 1 ? 'untrackedVolumeUSD' : 'volumeUSD';

      const manageUntrackedTVL =
        +current.totalValueLockedUSD <= 1
          ? 'totalValueLockedUSDUntracked'
          : 'totalValueLockedUSD';

      const [oneDayVolumeUSD, oneDayVolumeChangeUSD] =
        oneDay && twoDay
          ? get2DayPercentChange(
              current[manageUntrackedVolume],
              oneDay[manageUntrackedVolume],
              twoDay[manageUntrackedVolume],
            )
          : oneDay
          ? [
              parseFloat(current[manageUntrackedVolume]) -
                parseFloat(oneDay[manageUntrackedVolume]),
              0,
            ]
          : [parseFloat(current[manageUntrackedVolume]), 0];

      const oneWeekVolumeUSD = week
        ? parseFloat(current[manageUntrackedVolume]) -
          parseFloat(week[manageUntrackedVolume])
        : parseFloat(current[manageUntrackedVolume]);

      const tvlUSD = parseFloat(current[manageUntrackedTVL]);
      const tvlUSDChange = getPercentChange(
        current[manageUntrackedTVL],
        oneDay ? oneDay[manageUntrackedTVL] : undefined,
      );

      return {
        token0: current.token0,
        token1: current.token1,
        fee: current.fee,
        id: address,
        oneDayVolumeUSD,
        oneDayVolumeChangeUSD,
        oneWeekVolumeUSD,
        trackedReserveUSD: tvlUSD,
        tvlUSDChange,
        totalValueLockedUSD: current[manageUntrackedTVL],
      };
    });

    return formatted;
  } catch (err) {
    console.error(err);
  }
}

export async function getPairsAPR(pairAddresses: string[], chainId: ChainId) {
  const config = getConfig(chainId);
  const farmEnabled = config['farm']['available'];
  const aprs: any = await fetchPoolsAPR(chainId);
  let _farmingAprs: {
    [type: string]: number;
  } = {};

  if (farmEnabled) {
    const farmAprs: any = await fetchEternalFarmAPR(chainId);
    const farmingAprs = await fetchEternalFarmingsAPRByPool(
      pairAddresses,
      chainId,
    );

    _farmingAprs = farmingAprs.reduce(
      (acc: any, el: any) => ({
        ...acc,
        [el.pool]: farmAprs[el.id],
      }),
      {},
    );
  }

  return pairAddresses.map((address) => {
    const aprPercent = aprs[address] ? aprs[address].toFixed(2) : null;
    const farmingApr = _farmingAprs[address]
      ? Number(_farmingAprs[address].toFixed(2))
      : null;
    return {
      apr: aprPercent,
      farmingApr: farmingApr && farmingApr > 0 ? farmingApr : null,
    };
  });
}

export async function getPairInfoV3(address: string, chainId: ChainId) {
  try {
    const config = getConfig(chainId);
    const farmEnabled = config['farm']['available'];

    const utcCurrentTime = dayjs();
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix();
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix();
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix();

    const [
      oneDayBlock,
      twoDayBlock,
      oneWeekBlock,
    ] = await getBlocksFromTimestamps(
      [utcOneDayBack, utcTwoDaysBack, utcOneWeekBack],
      500,
      chainId,
    );

    const pairsCurrent = await fetchPairsByTime(undefined, [address], chainId);
    let pairs24, pairs48, pairsWeek;

    if (oneDayBlock && oneDayBlock.number) {
      pairs24 = await fetchPairsByTime(oneDayBlock.number, [address], chainId);
    }

    if (twoDayBlock && twoDayBlock.number) {
      pairs48 = await fetchPairsByTime(twoDayBlock.number, [address], chainId);
    }

    if (oneWeekBlock && oneWeekBlock.number) {
      pairsWeek = await fetchPairsByTime(
        oneWeekBlock.number,
        [address],
        chainId,
      );
    }

    const parsedPairs = parsePairsData(pairsCurrent);
    const parsedPairs24 = parsePairsData(pairs24);
    const parsedPairs48 = parsePairsData(pairs48);
    const parsedPairsWeek = parsePairsData(pairsWeek);

    const aprs: any = await fetchPoolsAPR(chainId);
    let farmingAprs: any = {};
    if (farmEnabled) {
      farmingAprs = await fetchEternalFarmAPR(chainId);
    }

    const current = parsedPairs[address];
    const oneDay = parsedPairs24[address];
    const twoDay = parsedPairs48[address];
    const week = parsedPairsWeek[address];

    const manageUntrackedVolume = current
      ? +current.volumeUSD <= 1
        ? 'untrackedVolumeUSD'
        : 'volumeUSD'
      : '';
    const manageUntrackedTVL = current
      ? +current.totalValueLockedUSD <= 1
        ? 'totalValueLockedUSDUntracked'
        : 'totalValueLockedUSD'
      : '';

    const currentVolume =
      current && current[manageUntrackedVolume]
        ? Number(current[manageUntrackedVolume])
        : 0;
    const oneDayVolume =
      oneDay && oneDay[manageUntrackedVolume]
        ? Number(oneDay[manageUntrackedVolume])
        : 0;
    const twoDayVolume =
      twoDay && twoDay[manageUntrackedVolume]
        ? Number(twoDay[manageUntrackedVolume])
        : 0;
    const oneWeekVolume =
      week && week[manageUntrackedVolume]
        ? Number(week[manageUntrackedVolume])
        : 0;

    let [oneDayVolumeUSD, oneDayVolumeChangeUSD] = get2DayPercentChange(
      currentVolume,
      oneDayVolume,
      twoDayVolume,
    );
    if (oneDayVolumeUSD < 0.000001) {
      oneDayVolumeUSD = 0;
    }
    if (oneDayVolumeChangeUSD < 0.000001) {
      oneDayVolumeChangeUSD = 0;
    }

    let oneWeekVolumeUSD = currentVolume - oneWeekVolume;
    if (oneWeekVolumeUSD < 0.000001) {
      oneWeekVolumeUSD = 0;
    }

    const currentTVL =
      current && current[manageUntrackedTVL]
        ? Number(current[manageUntrackedTVL])
        : 0;
    const oneDayTVL =
      oneDay && oneDay[manageUntrackedTVL]
        ? Number(oneDay[manageUntrackedTVL])
        : 0;
    let tvlUSD = currentTVL;
    if (tvlUSD < 0.000001) {
      tvlUSD = 0;
    }
    const tvlUSDChange = getPercentChange(currentTVL, oneDayTVL);

    const currentFees =
      current && current.feesUSD ? Number(current.feesUSD) : 0;
    const oneDayFees = oneDay && oneDay.feesUSD ? Number(oneDay.feesUSD) : 0;
    let feesUSD = currentFees;
    if (feesUSD < 0.000001) {
      feesUSD = 0;
    }
    let feesUSDOneDay = currentFees - oneDayFees;
    if (feesUSDOneDay < 0.000001) {
      feesUSDOneDay = 0;
    }
    const feesUSDChange = getPercentChange(currentFees, oneDayFees);

    const poolFeeChange = getPercentChange(
      current ? current.fee : undefined,
      oneDay ? oneDay.fee : undefined,
    );

    const token0PriceChange = getPercentChange(
      current ? current.token0Price : undefined,
      oneDay ? oneDay.token0Price : undefined,
    );

    const token1PriceChange = getPercentChange(
      current ? current.token1Price : undefined,
      oneDay ? oneDay.token1Price : undefined,
    );

    const aprPercent = aprs[address] ? aprs[address].toFixed(2) : 0;
    const farmingApr = farmingAprs[address]
      ? farmingAprs[address].toFixed(2)
      : 0;

    return [
      current
        ? {
            token0: {
              ...current.token0,
              symbol: formatTokenSymbol(
                current.token0.id,
                current.token0.symbol,
              ),
            },
            token1: {
              ...current.token1,
              symbol: formatTokenSymbol(
                current.token1.id,
                current.token1.symbol,
              ),
            },
            fee: current.fee,
            id: address,
            oneDayVolumeUSD,
            oneDayVolumeChangeUSD,
            oneWeekVolumeUSD,
            trackedReserveUSD: tvlUSD,
            tvlUSDChange,
            reserve0: current.totalValueLockedToken0,
            reserve1: current.totalValueLockedToken1,
            totalValueLockedUSD: current[manageUntrackedTVL],
            apr: aprPercent,
            farmingApr: farmingApr,
            volumeChangeUSD: oneDayVolumeChangeUSD,
            liquidityChangeUSD: tvlUSDChange,
            feesUSD,
            feesUSDOneDay,
            feesUSDChange,
            poolFeeChange,
            token0Price: Number(current.token0Price).toFixed(3),
            token0PriceChange,
            token1Price: Number(current.token1Price).toFixed(3),
            token1PriceChange,
          }
        : undefined,
    ];
  } catch (err) {
    console.error(err);
  }
}

export async function getAllPairsV3(chainId: ChainId) {
  const client = clientV3[chainId];
  if (!client) return;
  try {
    let allFound = false;
    let pairs: any[] = [];
    let skipCount = 0;
    while (!allFound) {
      const result = await client.query({
        query: ALL_PAIRS_V3,
        variables: {
          skip: skipCount,
        },
        fetchPolicy: 'network-only',
      });
      skipCount = skipCount + 10;
      pairs = pairs.concat(result?.data?.pools);
      if (result?.data?.pools.length < 10 || pairs.length > 10) {
        allFound = true;
      }
    }
    return pairs;
  } catch (e) {
    console.log(e);
  }
}

export async function getLiquidityChart(address: string, chainId: ChainId) {
  const numSurroundingTicks = 300;
  const PRICE_FIXED_DIGITS = 8;
  const client = clientV3[chainId];
  if (!client) return;

  const pool = await client.query({
    query: PAIRS_FROM_ADDRESSES_V3(undefined, [address]),
  });

  const {
    tick: poolCurrentTick,
    liquidity,
    token0: { id: token0Address, decimals: token0Decimals },
    token1: { id: token1Address, decimals: token1Decimals },
  } = pool.data.pools[0];

  const poolCurrentTickIdx = parseInt(poolCurrentTick);
  const tickSpacing = 60;

  const activeTickIdx =
    Math.floor(poolCurrentTickIdx / tickSpacing) * tickSpacing;

  const tickIdxLowerBound = activeTickIdx - numSurroundingTicks * tickSpacing;
  const tickIdxUpperBound = activeTickIdx + numSurroundingTicks * tickSpacing;

  async function fetchInitializedTicks(
    poolAddress: string,
    tickIdxLowerBound: number,
    tickIdxUpperBound: number,
  ) {
    let surroundingTicks: any = [];
    let surroundingTicksResult: any = [];

    let skip = 0;
    const v3client = clientV3[chainId];
    if (!v3client) return;
    do {
      const ticks = await v3client.query({
        query: FETCH_TICKS(),
        fetchPolicy: 'cache-first',
        variables: {
          poolAddress,
          tickIdxLowerBound,
          tickIdxUpperBound,
          skip,
        },
      });

      surroundingTicks = ticks.data.ticks;
      surroundingTicksResult = surroundingTicksResult.concat(surroundingTicks);
      skip += 1000;
    } while (surroundingTicks.length > 0);

    return { ticks: surroundingTicksResult, loading: false, error: false };
  }

  const initializedTicksResult = await fetchInitializedTicks(
    address,
    tickIdxLowerBound,
    tickIdxUpperBound,
  );
  if (!initializedTicksResult) return;
  if (initializedTicksResult.error || initializedTicksResult.loading) {
    return {
      error: initializedTicksResult.error,
      loading: initializedTicksResult.loading,
    };
  }

  const { ticks: initializedTicks } = initializedTicksResult;

  const tickIdxToInitializedTick = keyBy(initializedTicks, 'tickIdx');

  const token0 = new Token(137, token0Address, parseInt(token0Decimals));
  const token1 = new Token(137, token1Address, parseInt(token1Decimals));

  let activeTickIdxForPrice = activeTickIdx;
  if (activeTickIdxForPrice < TickMath.MIN_TICK) {
    activeTickIdxForPrice = TickMath.MIN_TICK;
  }
  if (activeTickIdxForPrice > TickMath.MAX_TICK) {
    activeTickIdxForPrice = TickMath.MAX_TICK;
  }

  const activeTickProcessed = {
    liquidityActive: JSBI.BigInt(liquidity),
    tickIdx: activeTickIdx,
    liquidityNet: JSBI.BigInt(0),
    price0: tickToPrice(token0, token1, activeTickIdxForPrice).toFixed(
      PRICE_FIXED_DIGITS,
    ),
    price1: tickToPrice(token1, token0, activeTickIdxForPrice).toFixed(
      PRICE_FIXED_DIGITS,
    ),
    liquidityGross: JSBI.BigInt(0),
  };

  const activeTick = tickIdxToInitializedTick[activeTickIdx];
  if (activeTick) {
    activeTickProcessed.liquidityGross = JSBI.BigInt(activeTick.liquidityGross);
    activeTickProcessed.liquidityNet = JSBI.BigInt(activeTick.liquidityNet);
  }

  enum Direction {
    ASC,
    DESC,
  }

  // Computes the numSurroundingTicks above or below the active tick.
  const computeSurroundingTicks = (
    activeTickProcessed: any,
    tickSpacing: number,
    numSurroundingTicks: number,
    direction: Direction,
  ) => {
    let previousTickProcessed = {
      ...activeTickProcessed,
    };

    // Iterate outwards (either up or down depending on 'Direction') from the active tick,
    // building active liquidity for every tick.
    let processedTicks = [];
    for (let i = 0; i < numSurroundingTicks; i++) {
      const currentTickIdx =
        direction == Direction.ASC
          ? previousTickProcessed.tickIdx + tickSpacing
          : previousTickProcessed.tickIdx - tickSpacing;

      if (
        currentTickIdx < TickMath.MIN_TICK ||
        currentTickIdx > TickMath.MAX_TICK
      ) {
        break;
      }

      const currentTickProcessed: any = {
        liquidityActive: previousTickProcessed.liquidityActive,
        tickIdx: currentTickIdx,
        liquidityNet: JSBI.BigInt(0),
        price0: tickToPrice(token0, token1, currentTickIdx).toFixed(
          PRICE_FIXED_DIGITS,
        ),
        price1: tickToPrice(token1, token0, currentTickIdx).toFixed(
          PRICE_FIXED_DIGITS,
        ),
        liquidityGross: JSBI.BigInt(0),
      };

      const currentInitializedTick =
        tickIdxToInitializedTick[currentTickIdx.toString()];
      if (currentInitializedTick) {
        currentTickProcessed.liquidityGross = JSBI.BigInt(
          currentInitializedTick.liquidityGross,
        );
        currentTickProcessed.liquidityNet = JSBI.BigInt(
          currentInitializedTick.liquidityNet,
        );
      }

      if (direction == Direction.ASC && currentInitializedTick) {
        currentTickProcessed.liquidityActive = JSBI.add(
          previousTickProcessed.liquidityActive,
          JSBI.BigInt(currentInitializedTick.liquidityNet),
        );
      } else if (
        direction == Direction.DESC &&
        JSBI.notEqual(previousTickProcessed.liquidityNet, JSBI.BigInt(0))
      ) {
        currentTickProcessed.liquidityActive = JSBI.subtract(
          previousTickProcessed.liquidityActive,
          previousTickProcessed.liquidityNet,
        );
      }

      processedTicks.push(currentTickProcessed);
      previousTickProcessed = currentTickProcessed;
    }

    if (direction == Direction.DESC) {
      processedTicks = processedTicks.reverse();
    }

    return processedTicks;
  };

  const subsequentTicks = computeSurroundingTicks(
    activeTickProcessed,
    tickSpacing,
    numSurroundingTicks,
    Direction.ASC,
  );

  const previousTicks = computeSurroundingTicks(
    activeTickProcessed,
    tickSpacing,
    numSurroundingTicks,
    Direction.DESC,
  );

  const ticksProcessed = previousTicks
    .concat(activeTickProcessed)
    .concat(subsequentTicks);

  return {
    ticksProcessed,
    tickSpacing,
    activeTickIdx,
    token0,
    token1,
  };
  // setTicksResult({
  //     ticksProcessed,
  //     tickSpacing,
  //     activeTickIdx,
  //     token0,
  //     token1
  // })
}

//Farming

export async function fetchEternalFarmingsAPRByPool(
  poolAddresses: string[],
  chainId: ChainId,
): Promise<any> {
  const client = farmingClient[chainId];
  if (!client) return;
  try {
    const eternalFarmings = await client.query({
      query: FETCH_ETERNAL_FARM_FROM_POOL_V3(poolAddresses),
      fetchPolicy: 'network-only',
    });

    return eternalFarmings.data.eternalFarmings;
  } catch (err) {
    throw new Error('Eternal fetch error ' + err);
  }
}

//Token Helpers

async function fetchTokensByTime(
  blockNumber: number | undefined,
  tokenAddresses: string[],
  chainId: ChainId,
): Promise<any> {
  const client = clientV3[chainId];
  if (!client) return;
  try {
    const tokens = await client.query({
      query: TOKENS_FROM_ADDRESSES_V3(blockNumber, tokenAddresses),
      fetchPolicy: 'network-only',
    });

    return tokens.data.tokens;
  } catch (err) {
    console.error('Tokens fetching by time in v3 ' + err);
    return;
  }
}

function parseTokensData(tokenData: any) {
  return tokenData
    ? tokenData.reduce((acc: { [address: string]: any }, tokenData: any) => {
        acc[tokenData.id] = tokenData;
        return acc;
      }, {})
    : {};
}

const WETH_ADDRESSES = ['0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'];

export function formatTokenSymbol(address: string, symbol: string) {
  if (WETH_ADDRESSES.includes(address)) {
    return 'MATIC';
  } else if (symbol.toLowerCase() === 'mimatic') {
    return 'MAI';
  } else if (symbol.toLowerCase() === 'amaticc') {
    return 'ankrMATIC';
  }
  return symbol;
}

export function formatTokenName(address: string, name: string) {
  if (WETH_ADDRESSES.includes(address)) {
    return 'Matic';
  }
  return name;
}

//Pair helpers

async function fetchPairsByTime(
  blockNumber: number | undefined,
  tokenAddresses: string[],
  chainId: ChainId,
): Promise<any> {
  const client = clientV3[chainId];
  if (!client) return;
  try {
    const pairs = await client.query({
      query: PAIRS_FROM_ADDRESSES_V3(blockNumber, tokenAddresses),
      fetchPolicy: 'network-only',
    });

    return pairs.data.pools;
  } catch (err) {
    console.error('Pairs by time fetching ' + err);
    return;
  }
}

function parsePairsData(pairData: any) {
  return pairData
    ? pairData.reduce((accum: { [address: string]: any }, poolData: any) => {
        accum[poolData.id] = poolData;
        return accum;
      }, {})
    : {};
}
