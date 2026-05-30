import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

import {
  getRpc,
  type SolanaNetwork,
} from './config';

import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  AuthorityType,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

type WalletProvider = {
  publicKey?: PublicKey;

  signAndSendTransaction?: (
    transaction: Transaction
  ) => Promise<{
    signature: string;
  }>;
};

type CreateMintWithWeb3Params = {
  network: SolanaNetwork;
  walletProvider: WalletProvider;
  walletAddress: string;
  decimals: number;
  supply: number;
  revokeMintAuthority: boolean;
  revokeFreezeAuthority: boolean;
};

export async function createMintWithWeb3Bridge(
  params: CreateMintWithWeb3Params
) {
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

  const mintKeypair =
    Keypair.generate();

  const lamports =
    await getMinimumBalanceForRentExemptMint(
      connection
    );

  const tokenAccount =
    getAssociatedTokenAddressSync(
      mintKeypair.publicKey,
      payer
    );

  const rawSupply =
    BigInt(params.supply) *
    BigInt(10 ** params.decimals);

  const instructions = [
    SystemProgram.createAccount({
      fromPubkey:
        payer,

      newAccountPubkey:
        mintKeypair.publicKey,

      space:
        MINT_SIZE,

      lamports,

      programId:
        TOKEN_PROGRAM_ID,
    }),

    createInitializeMintInstruction(
      mintKeypair.publicKey,
      params.decimals,
      payer,
      payer
    ),

    createAssociatedTokenAccountInstruction(
      payer,
      tokenAccount,
      payer,
      mintKeypair.publicKey,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    ),

    createMintToInstruction(
      mintKeypair.publicKey,
      tokenAccount,
      payer,
      rawSupply
    ),
  ];

  if (params.revokeMintAuthority) {
    instructions.push(
      createSetAuthorityInstruction(
        mintKeypair.publicKey,
        payer,
        AuthorityType.MintTokens,
        null
      )
    );
  }

  if (params.revokeFreezeAuthority) {
    instructions.push(
      createSetAuthorityInstruction(
        mintKeypair.publicKey,
        payer,
        AuthorityType.FreezeAccount,
        null
      )
    );
  }

  const transaction =
    new Transaction().add(
      ...instructions
    );

  transaction.feePayer =
    payer;

  const latestBlockhash =
  await connection.getLatestBlockhash();

transaction.recentBlockhash =
  latestBlockhash.blockhash;

  transaction.partialSign(
    mintKeypair
  );

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
 await new Promise((resolve) =>
  setTimeout(resolve, 3000)
);
  return {
    signature:
      result.signature,

    mintAddress:
      mintKeypair.publicKey.toString(),

    tokenAccount:
      tokenAccount.toString(),
  };
}