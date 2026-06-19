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

import {
  getRpc,
  type SolanaNetwork,
} from './config';

import bs58 from 'bs58';

function formatUmiTransactionSignature(
  signature: unknown
): string {
  if (
    typeof signature ===
    'string'
  ) {
    return signature;
  }

  if (
    signature instanceof
    Uint8Array
  ) {
    return bs58.encode(
      signature
    );
  }

  if (
    Array.isArray(
      signature
    )
  ) {
    return bs58.encode(
      Uint8Array.from(
        signature
      )
    );
  }

  throw new Error(
    'Unable to format transaction signature.'
  );
}

type UpdateTokenMetadataParams = {
  network: SolanaNetwork;
  walletProvider: any;
  mintAddress: string;
  metadataUri: string;
};

export async function updateTokenMetadata(
  params: UpdateTokenMetadataParams
) {
  const umi =
    createUmi(
      getRpc(
        params.network
      )
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
  mintAddress: string,
  network: SolanaNetwork
) {
  const umi =
    createUmi(
      getRpc(network)
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

type TransferMetadataUpdateAuthorityParams =
  {
    network: SolanaNetwork;
    walletProvider: any;
    mintAddress: string;
    newAuthorityAddress: string;
  };

export async function transferMetadataUpdateAuthority(
  params: TransferMetadataUpdateAuthorityParams
): Promise<{
  signature: string;
}> {
  const umi =
    createUmi(
      getRpc(
        params.network
      )
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
          some(
            publicKey(
              params.newAuthorityAddress
            )
          ),
      }
    ).sendAndConfirm(
      umi
    );

  const signature =
    formatUmiTransactionSignature(
      tx.signature
    );

  console.log(
    'Metadata update authority transferred:',
    signature
  );

  return {
    signature,
  };
}