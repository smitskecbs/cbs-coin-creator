import {
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js';

import {
  getRpc,
  type SolanaNetwork,
} from './config';

import {
  AuthorityType,
  createSetAuthorityInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

type WalletProvider = any;

type RevokeAuthoritiesParams = {
  network: SolanaNetwork;
  walletProvider: WalletProvider;
  walletAddress: string;
  mintAddress: string;
  revokeMintAuthority: boolean;
  revokeFreezeAuthority: boolean;
};

export async function revokeAuthorities(
  params: RevokeAuthoritiesParams
) {
  if (
    !params.revokeMintAuthority &&
    !params.revokeFreezeAuthority
  ) {
    return null;
  }

  const connection =
    new Connection(
      getRpc(
        params.network
      ),
      'confirmed'
    );

  const payer =
    new PublicKey(
      params.walletAddress
    );

  const mint =
    new PublicKey(
      params.mintAddress
    );

  const transaction =
    new Transaction();

  if (params.revokeMintAuthority) {
    transaction.add(
      createSetAuthorityInstruction(
        mint,
        payer,
        AuthorityType.MintTokens,
        null,
        [],
        TOKEN_PROGRAM_ID
      )
    );
  }

  if (params.revokeFreezeAuthority) {
    transaction.add(
      createSetAuthorityInstruction(
        mint,
        payer,
        AuthorityType.FreezeAccount,
        null,
        [],
        TOKEN_PROGRAM_ID
      )
    );
  }

  const latestBlockhash =
    await connection.getLatestBlockhash();

  transaction.feePayer =
    payer;

  transaction.recentBlockhash =
    latestBlockhash.blockhash;

  if (!params.walletProvider.signTransaction) {
    throw new Error(
      'Wallet does not support signTransaction.'
    );
  }

  const signedTransaction =
    await params.walletProvider
      .signTransaction(
        transaction
      );

  const signature =
    await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

  await connection.confirmTransaction({
    signature,
    blockhash:
      latestBlockhash.blockhash,
    lastValidBlockHeight:
      latestBlockhash.lastValidBlockHeight,
  });

  console.log(
    'Revoke authorities signature:',
    signature
  );

  console.log(
    'Revoke mint address:',
    mint.toString()
  );

  return {
    signature,
  };
}