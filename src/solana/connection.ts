import {
  createSolanaRpc,
} from '@solana/kit';

import {
  NETWORKS,
} from './config';

export function getRpc(
  network: 'devnet' | 'mainnet'
) {

  return createSolanaRpc(
    NETWORKS[network]
  );

}