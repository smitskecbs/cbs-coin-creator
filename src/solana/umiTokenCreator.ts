import {
  createUmi,
} from '@metaplex-foundation/umi-bundle-defaults';

import {
  walletAdapterIdentity,
} from '@metaplex-foundation/umi-signer-wallet-adapters';

type CreateUmiTokenParams = {
  walletProvider: any;
  metadataUri: string;
  tokenName: string;
  symbol: string;
  decimals: number;
  supply: number;
};

export async function createUmiToken(
  params: CreateUmiTokenParams
) {
  const umi =
    createUmi(
      'https://api.devnet.solana.com'
    );

  umi.use(
    walletAdapterIdentity(
      params.walletProvider
    )
  );

  console.log(
    'Umi identity:',
    umi.identity.publicKey
  );

  console.log(
    'Umi token params:',
    params
  );

  return {
    ok:
      true,
  };
}