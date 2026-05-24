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