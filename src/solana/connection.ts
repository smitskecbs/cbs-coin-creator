import {
  createSolanaRpc,
} from '@solana/kit';

import {
  SOLANA_NETWORKS,
} from './config';

export function getRpc(
  network: 'devnet' | 'mainnet'
) {

  return createSolanaRpc(
    SOLANA_NETWORKS[network].rpc
  );

}