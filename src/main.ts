import './polyfills';

import './style.css';

import {
  getWalletProvider,
} from './solana/wallets';

import {
  uploadFileToPinata,
  uploadMetadataToPinata,
} from './uploadToPinata';

import {
  ENABLE_MAINNET,
} from './solana/config';

import {
  createUmiToken,
} from './solana/umiTokenCreator';

import {
  revokeAuthorities,
} from './solana/revokeAuthorities';

import {
  mintSupply,
} from './solana/mintSupply';

import {
  getTokenInfo,
} from './solana/getTokenInfo';

import {
  updateV1,
} from '@metaplex-foundation/mpl-token-metadata';

import {
  createUmi,
} from '@metaplex-foundation/umi-bundle-defaults';

import {
  publicKey,
} from '@metaplex-foundation/umi';

import {
  walletAdapterIdentity,
} from '@metaplex-foundation/umi-signer-wallet-adapters';

console.log(
  'updateV1:',
  updateV1
);

const RPC_ENDPOINT =
  'https://api.devnet.solana.com';

const umi =
  createUmi(
    RPC_ENDPOINT
  );

type WalletProvider = {
  connect: () => Promise<{
    publicKey: {
      toString(): string;
    };
  }>;

  signTransaction?: (
    transaction: unknown
  ) => Promise<unknown>;

  signAndSendTransaction?: (
    transaction: unknown
  ) => Promise<{
    signature: string;
  }>;
};

let connectedWallet:
  WalletProvider | null = null;

let connectedWalletAddress =
  '';

declare global {
  interface Window {
    phantom?: {
      solana?: WalletProvider;
    };

    solflare?: WalletProvider;

    backpack?: {
      solana?: WalletProvider;
    };

    jupiter?: {
      solana?: WalletProvider;
    };
  }
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="app-shell">
    <section class="hero-card">
      <p class="eyebrow">CBS TOOLKIT</p>

      <h1>CBS Coin Creator</h1>

      <p class="hero-text">
        Create your own Solana token for free.
        No platform fees.
      </p>

      <div class="network-panel">
        <label for="networkSelect">Network</label>

        <select id="networkSelect">
          <option value="devnet">Devnet</option>
          <option value="mainnet">Mainnet</option>
        </select>
      </div>

      <div class="wallet-panel">
        <label for="walletSelect">Choose wallet</label>

        <select id="walletSelect">
          <option value="phantom">Phantom</option>
          <option value="solflare">Solflare</option>
          <option value="backpack">Backpack</option>
          <option value="jupiter">Jupiter Wallet</option>
        </select>

        <button id="connectWallet" class="primary-btn">
          Connect Wallet
        </button>
      </div>

      <a
        class="vanity-link"
        href="https://wallet.cbs-coin.com"
        target="_blank"
      >
        Tip: make a vanity wallet first with your token name
      </a>

      <div id="walletBox" class="wallet-box">
        No wallet connected
      </div>

      <form id="tokenForm" class="token-form">
        <h2>Create your token</h2>

        <label>
          Token name
          <input
            id="tokenName"
            type="text"
            placeholder="Example: CBS Coin"
            required
          />
        </label>

        <label>
          Symbol
          <input
            id="tokenSymbol"
            type="text"
            placeholder="CBS"
            maxlength="10"
            required
          />
        </label>
        <label>
  Description
  <textarea
    id="tokenDescription"
    placeholder="Describe your token..."
    rows="4"
  ></textarea>
</label>
<label>
  Website
  <input
    id="tokenWebsite"
    type="text"
    placeholder="https://yourwebsite.com"
  />
</label>

<label>
  Telegram
  <input
    id="tokenTelegram"
    type="text"
    placeholder="https://t.me/yourgroup"
  />
</label>

<label>
  Discord
  <input
    id="tokenDiscord"
    type="text"
    placeholder="https://discord.gg/yourserver"
  />
</label>

<label>
  X / Twitter
  <input
    id="tokenTwitter"
    type="text"
    placeholder="https://x.com/yourproject"
  />
</label>

<label>
  Facebook
  <input
    id="tokenFacebook"
    type="text"
    placeholder="https://facebook.com/yourproject"
  />
</label>
        <div class="form-group">
  <label for="tokenLogo">
    Token logo
  </label>

  <input
    id="tokenLogo"
    type="file"
    accept="image/png,image/jpeg,image/webp"
  />

  <img
    id="tokenLogoPreview"
    style="
      width:96px;
      height:96px;
      object-fit:cover;
      border-radius:16px;
      margin-top:12px;
      display:none;
    "
  />
</div>

        <label>
          Decimals
          <input
            id="tokenDecimals"
            type="number"
            value="9"
            min="0"
            max="9"
          />
        </label>

        <label>
          Initial supply
          <input
            id="tokenSupply"
            type="number"
            value="1000000"
            min="1"
          />
        </label>

        <label class="checkbox-row">
          <input
            id="revokeMintAuthority"
            type="checkbox"
            checked
          />
          Revoke mint authority after creation
        </label>

        <label class="checkbox-row">
          <input
            id="revokeFreezeAuthority"
            type="checkbox"
          />
          Revoke freeze authority after creation
        </label>

        <button type="submit" class="primary-btn">
          Create Token
        </button>
      </form>

      <div id="tokenStatus" class="wallet-box">
        Token status will appear here
      </div>
      <div class="token-form">
  <h2>Manage existing token</h2>

  <label>
    Mint address
    <input
      id="manageMintAddress"
      type="text"
      placeholder="Paste token mint address"
    />
  </label>
<div id="tokenInfoBox" class="wallet-box">
  Token info will appear here
</div>
  <label class="checkbox-row">
    <input
      id="manageRevokeMintAuthority"
      type="checkbox"
    />
    Revoke mint authority
  </label>

  <label class="checkbox-row">
    <input
      id="manageRevokeFreezeAuthority"
      type="checkbox"
    />
    Revoke freeze authority
  </label>

  <button
    id="manageTokenButton"
    type="button"
    class="primary-btn"
  >
    Apply Token Tools
  </button>

  <div id="manageTokenStatus" class="wallet-box">
    Token tool status will appear here
  </div>
  <hr />

<h2>Update token metadata</h2>

<label>
  New description
  <textarea
    id="updateDescription"
    placeholder="New token description..."
    rows="4"
  ></textarea>
</label>

<label>
  New website
  <input
    id="updateWebsite"
    type="text"
    placeholder="https://yourwebsite.com"
  />
</label>

<label>
  New Telegram
  <input
    id="updateTelegram"
    type="text"
    placeholder="https://t.me/yourgroup"
  />
</label>

<label>
  New Discord
  <input
    id="updateDiscord"
    type="text"
    placeholder="https://discord.gg/yourserver"
  />
</label>

<label>
  New X / Twitter
  <input
    id="updateTwitter"
    type="text"
    placeholder="https://x.com/yourproject"
  />
</label>

<button
  id="updateMetadataButton"
  type="button"
  class="primary-btn"
>
  Upload New Metadata
</button>

<div id="updateMetadataStatus" class="wallet-box">
  Metadata update status will appear here
</div>
</div>
    </section>
  </main>
`;

const networkSelect =
  document.getElementById('networkSelect') as HTMLSelectElement;

const walletSelect =
  document.getElementById('walletSelect') as HTMLSelectElement;

const connectButton =
  document.getElementById('connectWallet') as HTMLButtonElement;


const walletBox =
  document.getElementById('walletBox') as HTMLDivElement;

const tokenForm =
  document.getElementById('tokenForm') as HTMLFormElement;
const manageTokenButton =
  document.getElementById(
    'manageTokenButton'
  ) as HTMLButtonElement;

const manageTokenStatus =
  document.getElementById(
    'manageTokenStatus'
  ) as HTMLDivElement;

const tokenInfoBox =
  document.getElementById(
    'tokenInfoBox'
  ) as HTMLDivElement;
  const updateMetadataButton =
  document.getElementById(
    'updateMetadataButton'
  ) as HTMLButtonElement;

const updateMetadataStatus =
  document.getElementById(
    'updateMetadataStatus'
  ) as HTMLDivElement;
const manageMintAddressInput =
  document.getElementById(
    'manageMintAddress'
  ) as HTMLInputElement;
  const tokenLogoInput =
  document.getElementById('tokenLogo') as HTMLInputElement | null;

const tokenLogoPreview =
  document.getElementById('tokenLogoPreview') as HTMLImageElement | null;

if (tokenLogoInput && tokenLogoPreview) {
  tokenLogoInput.addEventListener('change', () => {

    const file =
      tokenLogoInput.files?.[0];

    if (!file) {
      return;
    }

    const imageUrl =
      URL.createObjectURL(file);

    tokenLogoPreview.src =
      imageUrl;

    tokenLogoPreview.style.display =
      'block';
  });
}
connectButton.addEventListener('click', async () => {
  try {
    const provider =
      getWalletProvider(walletSelect.value);

    if (!provider) {
      alert('Wallet not found');
      return;
    }

    const response =
      await provider.connect();

    connectedWallet =
      provider;

    connectedWalletAddress =
      response.publicKey.toString();
      localStorage.setItem(
  'preferredWallet',
  walletSelect.value
);

localStorage.setItem(
  'walletConnected',
  'true'
);
    console.log(
  'Connected wallet provider:',
  connectedWallet
);

console.log(
  'Can sign transaction:',
  typeof connectedWallet.signTransaction
);

console.log(
  'Can sign and send transaction:',
  typeof connectedWallet.signAndSendTransaction
);

    walletBox.innerHTML = `
      <strong>Connected wallet:</strong>
      <br><br>
      ${connectedWalletAddress}
    `;

    connectButton.textContent =
      'Wallet Connected';

  } catch (error) {
    console.error(error);

    alert('Wallet connection failed');
  }
});


tokenForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!connectedWallet) {
    alert('Connect wallet first');
    return;
  }
  if (
  networkSelect.value === 'mainnet' &&
  !ENABLE_MAINNET
) {
  alert(
    'Mainnet minting is locked for now. Test on devnet first.'
  );

  return;
}
  const tokenName =
    (document.getElementById('tokenName') as HTMLInputElement).value;

  const symbol =
    (document.getElementById('tokenSymbol') as HTMLInputElement).value;
 
  const tokenDescription =
  (document.getElementById('tokenDescription') as HTMLTextAreaElement).value;
  const decimals =
    Number(
      (document.getElementById('tokenDecimals') as HTMLInputElement).value
    );
  
    const tokenWebsite =
  (document.getElementById('tokenWebsite') as HTMLInputElement).value;

const tokenTelegram =
  (document.getElementById('tokenTelegram') as HTMLInputElement).value;

const tokenDiscord =
  (document.getElementById('tokenDiscord') as HTMLInputElement).value;

const tokenTwitter =
  (document.getElementById('tokenTwitter') as HTMLInputElement).value;

const tokenFacebook =
  (document.getElementById('tokenFacebook') as HTMLInputElement).value;
  const supply =
    Number(
      (document.getElementById('tokenSupply') as HTMLInputElement).value
    );

    const tokenLogoFile =
  tokenLogoInput?.files?.[0];

console.log(
  'Selected logo file:',
  tokenLogoFile
);

if (tokenLogoFile) {

  const uploadedLogo =
    await uploadFileToPinata(
      tokenLogoFile
    );

  console.log(
    'Uploaded logo:',
    uploadedLogo
  );
  console.log('Social fields:', {
  tokenWebsite,
  tokenTelegram,
  tokenDiscord,
  tokenTwitter,
  tokenFacebook,
});
  const uploadedMetadata =
    await uploadMetadataToPinata({
      name:
        tokenName,

      symbol:
        symbol,

      description:
  tokenDescription,

      image:
        uploadedLogo.imageUrl,

        extensions: {
  website:
    tokenWebsite,

  telegram:
    tokenTelegram,

  discord:
    tokenDiscord,

  twitter:
    tokenTwitter,

  facebook:
    tokenFacebook,
},
    });

  console.log(
    'Uploaded metadata:',
    uploadedMetadata
  );
  
  console.log(
  'Calling Umi test now...'
);
const umiResult =
  await createUmiToken({
    walletProvider:
      connectedWallet,

    metadataUri:
      uploadedMetadata.metadataUrl,

    tokenName:
      tokenName,

    symbol:
      symbol,

    decimals:
      decimals,

    supply:
      supply,
  });
await mintSupply({
  walletProvider:
    connectedWallet,

  walletAddress:
    connectedWalletAddress,

  mintAddress:
    umiResult.mintAddress,

  decimals:
    decimals,

  supply:
    supply,
});

await revokeAuthorities({
  walletProvider:
    connectedWallet,

  walletAddress:
    connectedWalletAddress,

  mintAddress:
    umiResult.mintAddress,

  revokeMintAuthority:
    (document.getElementById('revokeMintAuthority') as HTMLInputElement).checked,

  revokeFreezeAuthority:
    (document.getElementById('revokeFreezeAuthority') as HTMLInputElement).checked,
});

console.log(
  'Umi result:',
  umiResult
);

const tokenStatus =
  document.getElementById(
    'tokenStatus'
  ) as HTMLDivElement | null;

if (tokenStatus) {
  tokenStatus.innerHTML = `
    <strong>
      Umi token created
    </strong>

    <br><br>

    <strong>
      Mint address:
    </strong><br>
    ${umiResult.mintAddress}

    <br><br>

    <strong>
      Metadata:
    </strong><br>
    ${uploadedMetadata.metadataUrl}
  `;
}
 
 //await createToken({
     // network:
      //  networkSelect.value as 'devnet' | 'mainnet',

      //walletAddress:
      //  connectedWalletAddress,

      //walletProvider:
      //  connectedWallet,

      //tokenName:
      //  tokenName,

      //symbol:
      //  symbol,

      //decimals:
      //  decimals,

      //supply:
       // supply,

      //revokeMintAuthority,

      //revokeFreezeAuthority,
   // });

  console.log(
  'On-chain metadata creation is temporarily disabled.'
);

console.log(
  'Metadata URI ready:',
  uploadedMetadata.metadataUrl
);
}
});
manageMintAddressInput.addEventListener(
  'input',
  async () => {
    const mintAddress =
      manageMintAddressInput.value.trim();

    if (
      mintAddress.length < 32
    ) {
      tokenInfoBox.innerHTML =
        'Token info will appear here';

      return;
    }

    try {
      const tokenInfo =
        await getTokenInfo(
          mintAddress
        );

      tokenInfoBox.innerHTML = `
        <strong>Supply:</strong><br>
        ${tokenInfo.formattedSupply}

        <br><br>

        <strong>Decimals:</strong><br>
        ${tokenInfo.decimals}

        <br><br>

        <strong>Mint Authority:</strong><br>
        ${
          tokenInfo.mintAuthority
            ?? 'Revoked'
        }

        <br><br>

        <strong>Freeze Authority:</strong><br>
        ${
          tokenInfo.freezeAuthority
            ?? 'Revoked'
        }
      `;
    } catch {
      tokenInfoBox.innerHTML =
        'Token not found';
    }
  }
);
manageTokenButton.addEventListener(
  'click',
  async () => {
    console.log(
      'Apply Token Tools clicked'
    );

    if (!connectedWallet) {
      alert('Connect wallet first');
      return;
    }

    const mintAddress =
      (document.getElementById('manageMintAddress') as HTMLInputElement).value;

    if (!mintAddress) {
      alert('Enter a mint address');
      return;
    }

    const tokenInfo =
      await getTokenInfo(
        mintAddress
      );

    tokenInfoBox.innerHTML = `
      <strong>Supply:</strong><br>
      ${tokenInfo.formattedSupply}

      <br><br>

      <strong>Decimals:</strong><br>
      ${tokenInfo.decimals}

      <br><br>

      <strong>Mint Authority:</strong><br>
      ${
        tokenInfo.mintAuthority
          ?? 'Revoked'
      }

      <br><br>

      <strong>Freeze Authority:</strong><br>
      ${
        tokenInfo.freezeAuthority
          ?? 'Revoked'
      }
    `;

    manageTokenStatus.innerHTML =
      'Applying token tools...';

    await revokeAuthorities({
      walletProvider:
        connectedWallet,

      walletAddress:
        connectedWalletAddress,

      mintAddress:
        mintAddress,

      revokeMintAuthority:
        (document.getElementById('manageRevokeMintAuthority') as HTMLInputElement).checked,

      revokeFreezeAuthority:
        (document.getElementById('manageRevokeFreezeAuthority') as HTMLInputElement).checked,
    });

    manageTokenStatus.innerHTML =
      'Token tools applied. Check Explorer.';
  }
);

updateMetadataButton.addEventListener(
  'click',
  async () => {
    try {
      const mintAddress =
        (document.getElementById('manageMintAddress') as HTMLInputElement).value;

      if (!mintAddress) {
        alert('Enter mint address first');
        return;
      }

      const updateDescription =
        (document.getElementById('updateDescription') as HTMLTextAreaElement).value;

      const updateWebsite =
        (document.getElementById('updateWebsite') as HTMLInputElement).value;

      const updateTelegram =
        (document.getElementById('updateTelegram') as HTMLInputElement).value;

      const updateDiscord =
        (document.getElementById('updateDiscord') as HTMLInputElement).value;

      const updateTwitter =
        (document.getElementById('updateTwitter') as HTMLInputElement).value;

      updateMetadataStatus.innerHTML =
        'Uploading new metadata...';
      
        umi.use(
  walletAdapterIdentity(
  connectedWallet as any
)
);

      const uploadedMetadata =
        await uploadMetadataToPinata({
          name:
            'Updated Metadata',

          symbol:
            'UPDATED',

          description:
            updateDescription,

          image:
            '',

          extensions: {
            website:
              updateWebsite,

            telegram:
              updateTelegram,

            discord:
              updateDiscord,

            twitter:
              updateTwitter,
          },
        });

      console.log(
        'Updated metadata uploaded:',
        uploadedMetadata
      );

      updateMetadataStatus.innerHTML = `
        Metadata uploaded.<br><br>
        ${uploadedMetadata.metadataUrl}
      `;
    } catch (error) {
      console.error(error);

      updateMetadataStatus.innerHTML =
        'Metadata update failed';
    }
  }
);
 

window.addEventListener(
  'load',
  async () => {
    const wasConnected =
      localStorage.getItem(
        'walletConnected'
      );

    const preferredWallet =
      localStorage.getItem(
        'preferredWallet'
      );

    if (
      wasConnected !== 'true' ||
      !preferredWallet
    ) {
      return;
    }

    try {
      walletSelect.value =
        preferredWallet;

      const provider =
        getWalletProvider(
          preferredWallet
        );

      if (!provider) {
        return;
      }

      const response =
       await provider.connect();

      connectedWallet =
        provider;

      connectedWalletAddress =
        response.publicKey.toString();

      console.log(
        'Auto reconnected wallet:',
        connectedWalletAddress
      );

    } catch (error) {
      console.log(
        'Auto reconnect skipped.'
      );
    }
  }
);