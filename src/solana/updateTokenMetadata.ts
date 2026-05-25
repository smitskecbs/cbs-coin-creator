import {
  createUmi,
} from '@metaplex-foundation/umi-bundle-defaults';

import {
  publicKey,
  some,
  none,
} from '@metaplex-foundation/umi';

import {
  walletAdapterIdentity,
} from '@metaplex-foundation/umi-signer-wallet-adapters';

import {
  updateV1,
  fetchMetadataFromSeeds,
} from '@metaplex-foundation/mpl-token-metadata';

type UpdateTokenMetadataParams = {
  walletProvider: any;
  mintAddress: string;
  metadataUri: string;
};

export async function updateTokenMetadata(
  params: UpdateTokenMetadataParams
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

  const mint =
    publicKey(
      params.mintAddress
    );

  const currentMetadata =
    await fetchMetadataFromSeeds(
      umi,
      {
        mint,
      }
    );

  const tx =
    await updateV1(
      umi,
      {
        mint,

        authority:
          umi.identity,

        payer:
          umi.identity,

        data:
          some({
            name:
              currentMetadata.name,

            symbol:
              currentMetadata.symbol,

            uri:
              params.metadataUri,

            sellerFeeBasisPoints:
              currentMetadata.sellerFeeBasisPoints,

            creators:
              currentMetadata.creators,

            collection:
              currentMetadata.collection,

            uses:
              currentMetadata.uses,
          }),

        isMutable:
          some(true),
      }
    ).sendAndConfirm(
      umi
    );

  console.log(
    'On-chain metadata update tx:',
    tx
  );

  return {
    success:
      true,
  };
}
export async function lockTokenMetadata(
  walletProvider: any,
  mintAddress: string
) {
  const umi =
    createUmi(
      'https://api.devnet.solana.com'
    );

  umi.use(
    walletAdapterIdentity(
      walletProvider
    )
  );

  const mint =
    publicKey(
      mintAddress
    );

  const tx =
    await updateV1(
      umi,
      {
        mint,

        authority:
          umi.identity,

        payer:
          umi.identity,

        newUpdateAuthority:
          none(),

        isMutable:
          some(false),
      }
    ).sendAndConfirm(
      umi
    );

  console.log(
    'Metadata permanently locked:',
    tx
  );

  return {
    success:
      true,
  };
}