import {
  Connection,
  PublicKey,
  clusterApiUrl,
} from '@solana/web3.js';

import {
  getMint,
} from '@solana/spl-token';

export async function getTokenInfo(
  mintAddress: string
) {
  const connection =
    new Connection(
      clusterApiUrl('devnet'),
      'confirmed'
    );

  const mint =
    await getMint(
      connection,
      new PublicKey(
        mintAddress
      )
    );

  const rawSupply =
  mint.supply.toString();

const formattedSupply =
  Number(mint.supply) /
  10 ** mint.decimals;

return {
  supply:
    rawSupply,

  formattedSupply:
    formattedSupply.toLocaleString(),

  decimals:
    mint.decimals,

  mintAuthority:
    mint.mintAuthority
      ? mint.mintAuthority.toString()
      : null,

  freezeAuthority:
    mint.freezeAuthority
      ? mint.freezeAuthority.toString()
      : null,
};
}