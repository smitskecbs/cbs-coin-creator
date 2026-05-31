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
  WALLET_UNSUPPORTED_SIGNING_MESSAGE,
} from './wallets';

import {
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

type WalletProvider = any;

type MintSupplyParams = {
  network: SolanaNetwork;
  walletProvider: WalletProvider;
  walletAddress: string;
  mintAddress: string;
  decimals: number;
  supply: number;
};

export async function mintSupply(
  params: MintSupplyParams
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

  const mint =
    new PublicKey(
      params.mintAddress
    );

  const tokenAccount =
    getAssociatedTokenAddressSync(
      mint,
      payer
    );

  const rawSupply =
    BigInt(params.supply) *
    BigInt(
      10 ** params.decimals
    );

  const transaction =
    new Transaction();

  const tokenAccountInfo =
    await connection.getAccountInfo(
      tokenAccount
    );

  if (!tokenAccountInfo) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer,
        tokenAccount,
        payer,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  transaction.add(
    createMintToInstruction(
      mint,
      tokenAccount,
      payer,
      rawSupply
    )
  );

  const latestBlockhash =
    await connection.getLatestBlockhash();

  transaction.feePayer =
    payer;

  transaction.recentBlockhash =
    latestBlockhash.blockhash;

  if (!params.walletProvider.signTransaction) {
    throw new Error(
      WALLET_UNSUPPORTED_SIGNING_MESSAGE
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
    'Mint supply signature:',
    signature
  );

  console.log(
    'Minted supply to token account:',
    tokenAccount.toString()
  );

  console.log(
    'Mint address used for supply:',
    mint.toString()
  );

  return {
    signature,
    tokenAccount:
      tokenAccount.toString(),
  };
}