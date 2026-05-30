export type SolanaNetwork =
  | 'devnet'
  | 'mainnet';

const SOLSCAN_ORIGIN =
  'https://solscan.io';

const DEVNET_RPC_FALLBACK =
  'https://api.devnet.solana.com';

function readEnvRpc(
  name: string
): string | undefined {
  const value =
    import.meta.env[name];

  if (
    typeof value !==
    'string'
  ) {
    return undefined;
  }

  const trimmed =
    value.trim();

  return trimmed ||
    undefined;
}

const HELIUS_DEVNET_RPC =
  readEnvRpc(
    'VITE_HELIUS_DEVNET_RPC'
  ) ??
  DEVNET_RPC_FALLBACK;

const HELIUS_MAINNET_RPC =
  readEnvRpc(
    'VITE_HELIUS_MAINNET_RPC'
  );

export const MAINNET_RPC_NOT_CONFIGURED_MESSAGE =
  'Mainnet RPC is not configured.';

export function isMainnetRpcConfigured(): boolean {
  return Boolean(
    HELIUS_MAINNET_RPC
  );
}

export const SOLANA_NETWORKS: Record<
  SolanaNetwork,
  {
    rpc: string;
    explorer: string;
  }
> = {
  devnet: {
    rpc:
      HELIUS_DEVNET_RPC,

    explorer:
      SOLSCAN_ORIGIN,
  },

  mainnet: {
    rpc:
      HELIUS_MAINNET_RPC ??
      '',

    explorer:
      SOLSCAN_ORIGIN,
  },
};

export const ENABLE_MAINNET =
  true;

export function getRpc(
  network: SolanaNetwork
): string {
  if (
    network ===
    'mainnet'
  ) {
    if (
      !HELIUS_MAINNET_RPC
    ) {
      throw new Error(
        MAINNET_RPC_NOT_CONFIGURED_MESSAGE
      );
    }

    return HELIUS_MAINNET_RPC;
  }

  return HELIUS_DEVNET_RPC;
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
