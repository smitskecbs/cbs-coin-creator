import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js';

import {
  AuthorityType,
  createSetAuthorityInstruction,
} from '@solana/spl-token';

type WalletProvider = {
  signAndSendTransaction?: (
    transaction: Transaction
  ) => Promise<{
    signature: string;
  }>;
};

type RevokeAuthoritiesParams = {
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
      clusterApiUrl('devnet'),
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
        null
      )
    );
  }

  if (params.revokeFreezeAuthority) {
    transaction.add(
      createSetAuthorityInstruction(
        mint,
        payer,
        AuthorityType.FreezeAccount,
        null
      )
    );
  }

  transaction.feePayer =
    payer;

  transaction.recentBlockhash =
    (
      await connection.getLatestBlockhash()
    ).blockhash;

  if (!params.walletProvider.signAndSendTransaction) {
    throw new Error(
      'Wallet does not support signAndSendTransaction.'
    );
  }

  const result =
    await params.walletProvider
      .signAndSendTransaction(
        transaction
      );

  console.log(
    'Revoke authorities result:',
    result
  );

  return result;
}