import {
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js';

import {
  AuthorityType,
  createSetAuthorityInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

import {
  getRpc,
  type SolanaNetwork,
} from './config';

import {
  WALLET_UNSUPPORTED_SIGNING_MESSAGE,
} from './wallets';

import {
  transferMetadataUpdateAuthority,
} from './updateTokenMetadata';

type WalletProvider = any;

export type AuthorityTransferType =
  | 'mint'
  | 'freeze'
  | 'metadata';

export type AuthorityTransferStepResult =
  {
    type: AuthorityTransferType;
    success: boolean;
    signature?: string;
    error?: string;
  };

type TransferSplAuthorityParams =
  {
    network: SolanaNetwork;
    walletProvider: WalletProvider;
    walletAddress: string;
    mintAddress: string;
    authorityType:
      | AuthorityType.MintTokens
      | AuthorityType.FreezeAccount;
    newAuthorityAddress: string;
  };

async function transferSplAuthority(
  params: TransferSplAuthorityParams
): Promise<{
  signature: string;
}> {
  const connection =
    new Connection(
      getRpc(
        params.network
      ),
      'confirmed'
    );

  const currentAuthority =
    new PublicKey(
      params.walletAddress
    );

  const mint =
    new PublicKey(
      params.mintAddress
    );

  const newAuthority =
    new PublicKey(
      params.newAuthorityAddress
    );

  const transaction =
    new Transaction();

  transaction.add(
    createSetAuthorityInstruction(
      mint,
      currentAuthority,
      params.authorityType,
      newAuthority,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  const latestBlockhash =
    await connection.getLatestBlockhash();

  transaction.feePayer =
    currentAuthority;

  transaction.recentBlockhash =
    latestBlockhash.blockhash;

  if (
    !params.walletProvider
      .signTransaction
  ) {
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

  await connection.confirmTransaction(
    {
      signature,
      blockhash:
        latestBlockhash.blockhash,
      lastValidBlockHeight:
        latestBlockhash.lastValidBlockHeight,
    }
  );

  console.log(
    'Transfer SPL authority signature:',
    signature
  );

  return {
    signature,
  };
}

export type TransferTokenAuthoritiesParams =
  {
    network: SolanaNetwork;
    walletProvider: WalletProvider;
    walletAddress: string;
    mintAddress: string;
    newAuthorityAddress: string;
    transferMintAuthority: boolean;
    transferFreezeAuthority: boolean;
    transferMetadataUpdateAuthority: boolean;
  };

export async function transferTokenAuthorities(
  params: TransferTokenAuthoritiesParams
): Promise<
  AuthorityTransferStepResult[]
> {
  const results: AuthorityTransferStepResult[] =
    [];

  const steps: Array<{
    type: AuthorityTransferType;
    run: () => Promise<{
      signature: string;
    }>;
  }> = [];

  if (
    params.transferMintAuthority
  ) {
    steps.push({
      type: 'mint',
      run: () =>
        transferSplAuthority({
          network:
            params.network,
          walletProvider:
            params.walletProvider,
          walletAddress:
            params.walletAddress,
          mintAddress:
            params.mintAddress,
          authorityType:
            AuthorityType.MintTokens,
          newAuthorityAddress:
            params.newAuthorityAddress,
        }),
    });
  }

  if (
    params.transferFreezeAuthority
  ) {
    steps.push({
      type: 'freeze',
      run: () =>
        transferSplAuthority({
          network:
            params.network,
          walletProvider:
            params.walletProvider,
          walletAddress:
            params.walletAddress,
          mintAddress:
            params.mintAddress,
          authorityType:
            AuthorityType.FreezeAccount,
          newAuthorityAddress:
            params.newAuthorityAddress,
        }),
    });
  }

  if (
    params.transferMetadataUpdateAuthority
  ) {
    steps.push({
      type: 'metadata',
      run: () =>
        transferMetadataUpdateAuthority(
          {
            network:
              params.network,
            walletProvider:
              params.walletProvider,
            mintAddress:
              params.mintAddress,
            newAuthorityAddress:
              params.newAuthorityAddress,
          }
        ),
    });
  }

  for (const step of steps) {
    try {
      const result =
        await step.run();

      results.push({
        type: step.type,
        success: true,
        signature:
          result.signature,
      });
    } catch (error) {
      results.push({
        type: step.type,
        success: false,
        error:
          error instanceof
          Error
            ? error.message
            : String(error),
      });
      break;
    }
  }

  return results;
}
