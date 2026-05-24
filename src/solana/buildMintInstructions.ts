import {
  address,
} from '@solana/kit';

import {
  getCreateAccountInstruction,
} from '@solana-program/system';

import {
  getInitializeMintInstruction,
} from '@solana-program/token';

import {
  TOKEN_PROGRAM,
} from './tokenProgram';

type BuildMintInstructionsParams = {
  payerAddress: string;
  mintAddress: string;
  decimals: number;
};

export function buildMintInstructions(
  params: BuildMintInstructionsParams
) {
  const payer =
    address(params.payerAddress);

  const mint =
    address(params.mintAddress);

  const createAccountInstruction =
    getCreateAccountInstruction({
      payer:
  payer as any,

newAccount:
  mint as any,

      lamports:
        BigInt(1_000_000),

      space:
        BigInt(82),

      programAddress:
        TOKEN_PROGRAM,
    });

  const initializeMintInstruction =
    getInitializeMintInstruction({
      mint,

      decimals:
        params.decimals,

      mintAuthority:
        payer,
    });

  console.log(
    'Create account instruction:',
    createAccountInstruction
  );

  console.log(
    'Initialize mint instruction:',
    initializeMintInstruction
  );

  return {
    createAccountInstruction,
    initializeMintInstruction,
  };
}