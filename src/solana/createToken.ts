import {
  createMintWithWeb3Bridge,
} from './web3Bridge';

import {
  SOLANA_NETWORKS,
} from './config';

type CreateTokenParams = {
  network: 'devnet' | 'mainnet';
  walletAddress: string;
  walletProvider: unknown;
  tokenName: string;
  symbol: string;
  decimals: number;
  supply: number;
  revokeMintAuthority: boolean;
  revokeFreezeAuthority: boolean;
};

function setTokenStatus(html: string) {
  const tokenStatus =
    document.getElementById('tokenStatus') as HTMLDivElement | null;

  if (!tokenStatus) {
    return;
  }

  tokenStatus.innerHTML = html;
}

export async function createToken(
  params: CreateTokenParams
) {
  try {
    setTokenStatus(
      'Preparing token creation...'
    );

    console.log(
      'Connected to:',
      params.network
    );

    console.log(
      'Token name:',
      params.tokenName
    );

    console.log(
      'Symbol:',
      params.symbol
    );

    console.log(
      'Decimals:',
      params.decimals
    );

    console.log(
      'Supply:',
      params.supply
    );

    console.log(
      'Revoke mint authority:',
      params.revokeMintAuthority
    );

    console.log(
      'Revoke freeze authority:',
      params.revokeFreezeAuthority
    );

    const result =
      await createMintWithWeb3Bridge({
        walletProvider:
          params.walletProvider as any,

        walletAddress:
          params.walletAddress,

        decimals:
          params.decimals,

        supply:
          params.supply,

        revokeMintAuthority:
          params.revokeMintAuthority,

        revokeFreezeAuthority:
          params.revokeFreezeAuthority,
      });

    console.log(
      'Web3 bridge mint result:',
      result
    );

    const explorerBase =
      SOLANA_NETWORKS[
        params.network
      ].explorer;

    const txUrl =
      `${explorerBase}/tx/${result.signature}`;

    const mintUrl =
      `${explorerBase}/address/${result.mintAddress}`;

    setTokenStatus(`
      <strong>
        ${params.network === 'devnet'
          ? 'Devnet'
          : 'Mainnet'}
        token created
      </strong>

      <br><br>

      <strong>
        Mint address:
      </strong>
      <br>

      <a
        href="${mintUrl}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${result.mintAddress}
      </a>

      <br><br>

      <strong>
        Token account:
      </strong>
      <br>

      ${result.tokenAccount}

      <br><br>

      <strong>
        Transaction:
      </strong>
      <br>

      <a
        href="${txUrl}"
        target="_blank"
        rel="noopener noreferrer"
      >
        View on Solana Explorer
      </a>

      <br><br>

      <small>
        Initial supply minted to your wallet
        <br>

        Mint authority revoked:
        ${params.revokeMintAuthority ? 'Yes' : 'No'}

        <br>

        Freeze authority revoked:
        ${params.revokeFreezeAuthority ? 'Yes' : 'No'}

        <br>

        Cost:
        Solana network fee only

        <br>

        No platform fee
      </small>
    `);

    return result;

  } catch (error) {
    console.error(
      'Token preparation failed:',
      error
    );

    setTokenStatus(
      'Token preparation failed. Check console.'
    );

    throw error;
  }
}