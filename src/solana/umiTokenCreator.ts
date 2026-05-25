import {
  createFungible,
} from '@metaplex-foundation/mpl-token-metadata';

import {
  generateSigner,
  percentAmount,
} from '@metaplex-foundation/umi';

import {
  createUmi,
} from '@metaplex-foundation/umi-bundle-defaults';

import {
  walletAdapterIdentity,
} from '@metaplex-foundation/umi-signer-wallet-adapters';

import {
  mplToolbox,
} from '@metaplex-foundation/mpl-toolbox';

import {
  findVanityMint,
} from './findVanityMint';

type CreateUmiTokenParams = {
  walletProvider: any;
  metadataUri: string;
  tokenName: string;
  symbol: string;
  decimals: number;
  supply: number;
  vanityPattern?: string;
vanityPosition?: 'prefix' | 'suffix' | 'contains' | 'both' | 'bothEnds';
vanityIgnoreCase?: boolean;
vanityEndPattern?: string;
};

export async function createUmiToken(
  params: CreateUmiTokenParams
) {
  const umi =
    createUmi(
      'https://api.devnet.solana.com'
    );
  umi.use(
  mplToolbox()
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

let mint =
  generateSigner(umi);

if (
  params.vanityPattern &&
  params.vanityPattern.trim().length > 0
) {
  console.log(
    'Searching vanity mint:',
    params.vanityPattern
  );

  const vanityResult =
    await findVanityMint({
      umi,
      pattern:
        params.vanityPattern.trim(),
        
        endPattern:
  params.vanityEndPattern?.trim() ?? '',

      position:
        params.vanityPosition ?? 'prefix',

      ignoreCase:
        params.vanityIgnoreCase ?? true,

      maxAttempts:
        100000,
    });

  mint =
    vanityResult.mint;

  console.log(
    'Vanity mint found:',
    vanityResult.address,
    'attempts:',
    vanityResult.attempts
  );
}

const tx =
  await createFungible(
    umi,
    {
      mint,

      name:
        params.tokenName,

      symbol:
        params.symbol,

      uri:
        params.metadataUri,

      sellerFeeBasisPoints:
        percentAmount(0),

      decimals:
        params.decimals,
    }
  ).sendAndConfirm(
    umi
  );
  /*
 await mintV1(
  umi,
  {
    mint:
      mint.publicKey,

    authority:
      umi.identity,

    amount:
      BigInt(
        params.supply *
        10 ** params.decimals
      ),

    tokenOwner:
      publicKey(
        umi.identity.publicKey
      ),

    tokenStandard:
      TokenStandard.Fungible,
  }
).sendAndConfirm(
  umi
);
*/
console.log(
  'Umi fungible token created:',
  mint.publicKey
);

console.log(
  'Umi tx:',
  tx
);

return {
  mintAddress:
    mint.publicKey.toString(),

  signature:
    Buffer.from(
      tx.signature
    ).toString(
      'base64'
    ),
};
}