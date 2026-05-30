import {
  Connection,
  PublicKey,
} from '@solana/web3.js';

import {
  getMint,
} from '@solana/spl-token';

import {
  getRpc,
  type SolanaNetwork,
} from './config';

export async function getTokenInfo(
  mintAddress: string,
  network: SolanaNetwork
) {
  const connection =
    new Connection(
      getRpc(network),
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