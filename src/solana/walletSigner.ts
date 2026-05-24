import {
  address,
} from '@solana/kit';

type WalletProvider = {
  signTransaction?: (
    transaction: unknown
  ) => Promise<unknown>;
};

export function createWalletTransactionSigner(
  walletAddress: string,
  walletProvider: WalletProvider
) {
  return {
    address:
      address(walletAddress),

    signTransactions:
      async (
        transactions: unknown[]
      ) => {

        if (!walletProvider.signTransaction) {
          throw new Error(
            'Wallet does not support signTransaction.'
          );
        }

        const signedTransactions =
          [];

        for (const transaction of transactions) {

          console.log(
  'Wallet signer received transaction:',
  transaction
);

console.log(
  'Wallet signer transaction keys:',
  Object.keys(transaction as object)
);

const walletTransaction =
  Object.assign(
    {},
    transaction,
    {
      serialize() {
        return (transaction as any)
          .messageBytes;
      },
    }
  );

const signedTransaction =
  await walletProvider
    .signTransaction(
      walletTransaction
    );

          signedTransactions.push(
            signedTransaction
          );
        }

        return signedTransactions;
      },
  };
}