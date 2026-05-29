import {
  createUmi,
} from '@metaplex-foundation/umi-bundle-defaults';

import {
  publicKey,
} from '@metaplex-foundation/umi';

import {
  fetchMetadataFromSeeds,
} from '@metaplex-foundation/mpl-token-metadata';

export async function fetchTokenMetadataJson(
  mintAddress: string
) {
  const umi =
    createUmi(
      'https://api.devnet.solana.com'
    );

  const mint =
    publicKey(
      mintAddress
    );

  const metadata =
    await fetchMetadataFromSeeds(
      umi,
      {
        mint,
      }
    );

  const response =
    await fetch(
      metadata.uri
    );

  const json =
    await response.json();

  return {
    onChainName:
      metadata.name,

    onChainSymbol:
      metadata.symbol,

    onChainUri:
      metadata.uri,

    isMutable:
      metadata.isMutable,

    updateAuthority:
      metadata.updateAuthority
        ? metadata.updateAuthority.toString()
        : null,

    json,
  };
}