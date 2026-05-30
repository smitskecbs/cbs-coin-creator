export type SolanaNetwork =
  | 'devnet'
  | 'mainnet';

const SOLSCAN_ORIGIN =
  'https://solscan.io';

export const SOLANA_NETWORKS: Record<
  SolanaNetwork,
  {
    rpc: string;
    explorer: string;
  }
> = {
  devnet: {
    rpc:
      'https://api.devnet.solana.com',

    explorer:
      SOLSCAN_ORIGIN,
  },

  mainnet: {
    rpc:
      'https://api.mainnet-beta.solana.com',

    explorer:
      SOLSCAN_ORIGIN,
  },
};

export const ENABLE_MAINNET =
  false;

export function getRpc(
  network: SolanaNetwork
): string {
  return SOLANA_NETWORKS[
    network
  ].rpc;
}

export function getExplorerTokenUrl(
  network: SolanaNetwork,
  mintAddress: string
): string {
  console.log(
    'Explorer network:',
    network
  );

  const url =
    `${SOLSCAN_ORIGIN}/token/${mintAddress}`;

  if (network === 'devnet') {
    return `${url}?cluster=devnet`;
  }

  return url;
}

export function getExplorerTxUrl(
  network: SolanaNetwork,
  signature: string
): string {
  console.log(
    'Explorer network:',
    network
  );

  const url =
    `${SOLSCAN_ORIGIN}/tx/${signature}`;

  if (network === 'devnet') {
    return `${url}?cluster=devnet`;
  }

  return url;
}
