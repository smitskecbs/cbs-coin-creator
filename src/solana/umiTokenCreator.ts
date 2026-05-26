import {
  createFungible,
} from '@metaplex-foundation/mpl-token-metadata';

import {
  generateSigner,
  createSignerFromKeypair,
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
  vanityMaxAttempts?: number;
  shouldStop?: () => boolean;
  vanitySecretKey?: number[];
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

let mint: any =
  generateSigner(umi);

if (
  params.vanitySecretKey &&
  params.vanitySecretKey.length > 0
) {
  const vanityKeypair =
    umi.eddsa.createKeypairFromSecretKey(
      new Uint8Array(
        params.vanitySecretKey
      )
    );

  mint =
    createSignerFromKeypair(
      umi,
      vanityKeypair
    );
}

/*
if (
  params.vanityPattern &&
  params.vanityPattern.trim().length > 0
) {

  console.log(
    'Searching vanity mint:',
    params.vanityPattern
  );
console.log(
  'Vanity max attempts:',
  params.vanityMaxAttempts
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
     
  params.vanityMaxAttempts === 0
    ? Number.MAX_SAFE_INTEGER
    : params.vanityMaxAttempts ?? 100000,
    shouldStop:
  params.shouldStop,
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
*/
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