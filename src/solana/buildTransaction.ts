import {
  
  createTransactionMessage,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
} from '@solana/kit';

import {
  signTransactionMessageWithSigners,
} from '@solana/signers';

type BuildTransactionParams = {
  payerSigner: any;
  blockhash: string;
  instructions: unknown[];
};

export async function buildTransaction(
  params: BuildTransactionParams
) {
  let transactionMessage =
    createTransactionMessage({
      version: 0,
    });

  transactionMessage =
    setTransactionMessageFeePayerSigner(
      params.payerSigner,
      transactionMessage
    );

  transactionMessage =
    setTransactionMessageLifetimeUsingBlockhash(
      {
        blockhash:
          params.blockhash as never,

        lastValidBlockHeight:
          BigInt(0),
      },
      transactionMessage
    );

  appendTransactionMessageInstructions(
    params.instructions as never,
    transactionMessage
  );

  const signedTransaction =
    await signTransactionMessageWithSigners(
      transactionMessage as never
    );

  console.log(
    'Signed SolKit transaction:',
    signedTransaction
  );

  return signedTransaction;
}