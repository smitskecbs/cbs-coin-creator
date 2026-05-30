export type SolanaNetwork =
  | 'devnet'
  | 'mainnet';

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
      'https://explorer.solana.com/?cluster=devnet',
  },

  mainnet: {
    rpc:
      'https://api.mainnet-beta.solana.com',

    explorer:
      'https://explorer.solana.com',
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
  return `${SOLANA_NETWORKS[network].explorer}/address/${mintAddress}`;
}

export function getExplorerTxUrl(
  network: SolanaNetwork,
  signature: string
): string {
  return `${SOLANA_NETWORKS[network].explorer}/tx/${signature}`;
}
