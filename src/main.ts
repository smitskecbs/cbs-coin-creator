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
  updateTokenMetadata,
  lockTokenMetadata,
} from './solana/updateTokenMetadata';

import {
  fetchTokenMetadataJson,
} from './solana/fetchTokenMetadataJson';

import {
  createSignerFromKeypair,
} from '@metaplex-foundation/umi';

console.log(
  'updateV1:',
  updateV1
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

      <h1>CBS Token Builder</h1>

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
      
      <div id="progressStatus" class="wallet-box">
  Ready
</div>

      <form id="tokenForm" class="token-form">
        <h2>Create your token</h2>
      
        <div class="wallet-box">
  <details class="accordion vanity-accordion">
    <summary>
      <span>Advanced: Vanity Mint Address (experienced users)</span>
      <span class="accordion-chevron" aria-hidden="true">▾</span>
    </summary>

    <div class="accordion-content">
  Optional. For experienced users. This can take longer and use more CPU.

  <br><br>

  <label>
    Vanity pattern
    <input
      id="vanityMintPattern"
      type="text"
      class="wallet-input"
      placeholder="Example: CBS"
      maxlength="5"
    />
  </label>

<label>
  End pattern
  <input
    id="vanityMintEndPattern"
    type="text"
    class="wallet-input"
    placeholder="Example: SOL"
    maxlength="5"
  />
</label>

    <label>
  Match position

  <select id="vanityMintPosition">
    <option value="prefix">
      Starts with
    </option>

    <option value="suffix">
      Ends with
    </option>

    <option value="contains">
      Contains
    </option>

   <option value="both">
  Starts OR Ends with
</option>

<option value="bothEnds">
  Starts AND Ends with
</option>

  </select>
</label>

<br><br>

<div class="switch-row">
  <span>Ignore uppercase/lowercase</span>
  <label class="switch">
    <input
      type="checkbox"
      id="vanityIgnoreCase"
    />
    <span class="switch-slider" aria-hidden="true"></span>
  </label>
</div>

<br><br>

<label>
  Max attempts

  <input
    id="vanityMaxAttempts"
    type="number"
    class="wallet-input"
    min="0"
    step="1000"
  />
</label>

<p style="font-size: 12px; opacity: 0.8;">
  Use 0 for unlimited search.
</p>

<p style="font-size: 12px; opacity: 0.8;">
  Warning: vanity mint generation can take longer depending on the pattern.
</p>

    </div>
  </details>

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
  Category
  <select
  id="tokenTags"
  multiple
  size="8"
>
    <option value="">No category</option>
    <option value="meme">Meme</option>
<option value="defi">DeFi</option>
<option value="gaming">Gaming</option>
<option value="utility">Utility</option>
<option value="ai">AI</option>
<option value="community">Community</option>
<option value="finance">Finance</option>
<option value="nft">NFT</option>
<option value="social">Social</option>
<option value="payments">Payments</option>
<option value="infrastructure">Infrastructure</option>
<option value="dao">DAO</option>
<option value="metaverse">Metaverse</option>
<option value="rwa">RWA</option>
<option value="privacy">Privacy</option>
<option value="exchange">Exchange</option>
<option value="launchpad">Launchpad</option>
<option value="stablecoin">Stablecoin</option>
<option value="education">Education</option>
<option value="music">Music</option>
<option value="charity">Charity</option>
<option value="tools">Tools</option>
<option value="trading">Trading</option>
<option value="yield">Yield</option>
<option value="staking">Staking</option>
    <option value="other">Other</option>
  </select>
  <div id="selectedTagsPreview" class="wallet-box">
  Selected tags will appear here
</div>
</label>
<details class="accordion socials-accordion">
  <summary>
    <span>Add social links</span>
    <span class="accordion-chevron" aria-hidden="true">▾</span>
  </summary>
  <div class="accordion-content">
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
  </div>
</details>
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
      <details class="accordion revoke-lock-accordion">
        <summary>
          <span>Revoke / lock authorities</span>
          <span class="accordion-chevron" aria-hidden="true">▾</span>
        </summary>
        <div class="accordion-content">
          <div class="token-form manage-form">
            <p class="helper-text">
              Manage authorities for an existing token mint.
            </p>

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

            <div class="warning-box">
              <strong>Permanent action.</strong>
              After locking metadata, logo, description and socials can no longer be changed.
            </div>

            <label class="checkbox-row">
              <input
                id="lockMetadataConfirm"
                type="checkbox"
              />
              I understand this action is permanent and metadata can never be changed again.
            </label>

            <button
              id="lockMetadataButton"
              class="connect-button primary-btn"
              type="button"
              disabled
            >
              Lock Metadata Permanently
            </button>
          </div>
        </div>
      </details>

      <details class="accordion update-metadata-accordion">
        <summary>
          <span>Update token metadata</span>
          <span class="accordion-chevron" aria-hidden="true">▾</span>
        </summary>
        <div class="accordion-content">
          <div class="token-form">
            <p class="helper-text">
              Upload new metadata (logo/description/socials) and update the token metadata pointer.
            </p>

            <label>
              Mint address
              <input
                id="updateMintAddress"
                type="text"
                placeholder="Paste token mint address"
              />
            </label>

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

            <label>
              New Facebook
              <input
                type="text"
                id="updateFacebook"
                placeholder="https://facebook.com/..."
              />
            </label>

            <label>
              New Logo
              <input
                type="file"
                id="updateLogo"
                accept="image/*"
              />
              <img
                id="updateLogoPreview"
                class="image-preview"
                style="display:none;"
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
        </div>
      </details>
    </section>
    <div
  id="vanitySearchPopup"
  class="action-popup-overlay"
  style="
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.72);
    z-index: 9999;
    align-items: center;
    justify-content: center;
    padding: 16px;
  "
>
  <div
    class="action-popup-card"
  >
    <h3 id="actionPopupTitle">
  Working...
</h3>

   <p id="actionPopupText">
  Preparing...
</p>

    <button
      id="stopVanitySearch"
      class="primary-btn"
    >
      Stop Search
    </button>
  </div>
</div>
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

  const progressStatus =
  document.getElementById(
    'progressStatus'
  ) as HTMLDivElement;

  const vanitySearchPopup =
  document.getElementById(
    'vanitySearchPopup'
  ) as HTMLDivElement;

const actionPopupText =
  document.getElementById(
    'actionPopupText'
  ) as HTMLParagraphElement;
  const actionPopupTitle =
  document.getElementById(
    'actionPopupTitle'
  ) as HTMLHeadingElement;
  const tokenTagsInput =
  document.getElementById(
    'tokenTags'
  ) as HTMLSelectElement;

const selectedTagsPreview =
  document.getElementById(
    'selectedTagsPreview'
  ) as HTMLDivElement;

  tokenTagsInput.addEventListener(
    'change',
    () => {
      const selectedTags =
        Array.from(
          tokenTagsInput.selectedOptions
        )
          .map(
            option =>
              option.textContent
          )
          .join(', ');
  
      selectedTagsPreview.innerHTML =
        selectedTags ||
        'Selected tags will appear here';
    }
  );
  
  document.getElementById(
    'actionPopupText'
  ) as HTMLParagraphElement;

const stopVanitySearchButton =
  document.getElementById(
    'stopVanitySearch'
  ) as HTMLButtonElement;
console.log(
  'Vanity popup elements:',
  vanitySearchPopup,
  actionPopupText,
  stopVanitySearchButton
);
let stopVanitySearch =
  false;
  let vanityWorker:
   Worker | null = null;

function showActionPopup(
  title: string,
  text: string,
  options?: { showStopButton?: boolean }
) {
  vanitySearchPopup.style.display = 'flex';
  actionPopupTitle.innerHTML = title;
  actionPopupText.innerHTML = text;
  stopVanitySearchButton.style.display =
    options?.showStopButton ? 'inline-flex' : 'none';
}

function hideActionPopup(delayMs = 0) {
  const doHide = () => {
    vanitySearchPopup.style.display = 'none';
    stopVanitySearchButton.style.display = 'none';
  };

  if (delayMs > 0) {
    setTimeout(doHide, delayMs);
    return;
  }

  doHide();
}

   function stopVanityWorker() {
  if (vanityWorker) {
    vanityWorker.terminate();

    vanityWorker =
      null;
  }

  stopVanitySearch =
    true;

  actionPopupText.innerHTML =
    'Search stopped';
  hideActionPopup(1800);
}

stopVanitySearchButton.addEventListener(
  'click',
  () => {
    actionPopupText.innerHTML =
      'Stopping search...';

    stopVanityWorker();
  }
);

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

  const lockMetadataButton =
  document.getElementById(
    'lockMetadataButton'
  ) as HTMLButtonElement;

const lockMetadataConfirm =
  document.getElementById(
    'lockMetadataConfirm'
  ) as HTMLInputElement | null;

if (lockMetadataConfirm) {
  lockMetadataButton.disabled =
    !lockMetadataConfirm.checked;

  lockMetadataConfirm.addEventListener(
    'change',
    () => {
      lockMetadataButton.disabled =
        !lockMetadataConfirm.checked;
    }
  );
}

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
      progressStatus.innerHTML =
  'Uploading logo...';
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

const updateLogoInput =
  document.getElementById('updateLogo') as HTMLInputElement | null;

const updateLogoPreview =
  document.getElementById('updateLogoPreview') as HTMLImageElement | null;

if (updateLogoInput && updateLogoPreview) {
  updateLogoInput.addEventListener('change', () => {
    const file = updateLogoInput.files?.[0];
    if (!file) {
      updateLogoPreview.style.display = 'none';
      updateLogoPreview.removeAttribute('src');
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    updateLogoPreview.src = imageUrl;
    updateLogoPreview.style.display = 'block';
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
function startVanityWorker() {
  
  stopVanitySearch =
    false;

  vanityWorker =
    new Worker(
      new URL(
        './vanityMint.worker.ts',
        import.meta.url
      ),
      {
        type: 'module',
      }
    );

  vanityWorker.onmessage =
    (event) => {
      const data =
        event.data;

      if (
        data.type === 'progress'
      ) {
        actionPopupText.innerHTML =
          `Attempts: ${data.attempts}`;
      }

      if (
        data.type === 'found'
      ) {
        actionPopupText.innerHTML =
          `Found after ${data.attempts} attempts`;

        vanitySearchPopup.style.display =
          'none';

        stopVanityWorker();
      }

      if (
        data.type === 'notFound'
      ) {
        actionPopupText.innerHTML =
          'No vanity mint found';

        vanitySearchPopup.style.display =
          'none';

        stopVanityWorker();
      }
    };
}
function findVanityMintWithWorker() {
  return new Promise<{
    address: string;
    secretKey: number[];
    attempts: number;
  }>((resolve, reject) => {
    stopVanitySearch =
      false;

    vanityWorker =
      new Worker(
        new URL(
          './vanityMint.worker.ts',
          import.meta.url
        ),
        {
          type: 'module',
        }
      );

    vanityWorker.onmessage =
      (event) => {
        const data =
          event.data;

        if (data.type === 'progress') {
          actionPopupText.innerHTML =
            `Attempts: ${data.attempts}`;
        }

        if (data.type === 'found') {
          stopVanityWorker();

          resolve({
            address:
              data.address,

            secretKey:
              data.secretKey,

            attempts:
              data.attempts,
          });
        }

        if (data.type === 'notFound') {
          stopVanityWorker();

          reject(
            new Error(
              'Vanity mint not found.'
            )
          );
        }
      };

    vanityWorker.onerror =
      () => {
        stopVanityWorker();

        reject(
          new Error(
            'Vanity worker failed.'
            
          )
        );
      };
           vanityWorker.onerror =
      () => {
        stopVanityWorker();

        reject(
          new Error(
            'Vanity worker failed.'
          )
        );
      };

    vanityWorker.postMessage({
      pattern:
        (document.getElementById('vanityMintPattern') as HTMLInputElement).value.trim(),

      endPattern:
        (document.getElementById('vanityMintEndPattern') as HTMLInputElement).value.trim(),

      position:
        (document.getElementById('vanityMintPosition') as HTMLSelectElement).value,

      ignoreCase:
        (document.getElementById('vanityIgnoreCase') as HTMLInputElement).checked,

      maxAttempts:
        Number(
          (document.getElementById('vanityMaxAttempts') as HTMLInputElement).value
        ),
    });
  });
}
  


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
 
  const tokenTags =
  Array.from(
    (document.getElementById('tokenTags') as HTMLSelectElement).selectedOptions
  ).map(option => option.value);

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

  progressStatus.innerHTML =
    'Uploading logo...';
  showActionPopup(
    'Uploading logo...',
    'Uploading your logo to IPFS...',
    { showStopButton: false }
  );

  const uploadedLogo =
    await uploadFileToPinata(
      tokenLogoFile
    );

  console.log(
    'Uploaded logo:',
    uploadedLogo
  );

  progressStatus.innerHTML =
  'Uploading metadata...';
  showActionPopup(
    'Uploading metadata...',
    'Uploading token metadata to IPFS...',
    { showStopButton: false }
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
category:
  tokenTags[0] || '',

tags:
  tokenTags,

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
progressStatus.innerHTML =
  'Searching vanity mint...';
showActionPopup(
  'Creating token...',
  'Preparing transaction...',
  { showStopButton: false }
);

let vanityMintResult:
  any = null;

const vanityPattern =
  (document.getElementById('vanityMintPattern') as HTMLInputElement).value.trim();

if (vanityPattern) {
  showActionPopup(
    'Searching vanity mint...',
    'Attempts: 0',
    { showStopButton: true }
  );

  vanityMintResult =
    await findVanityMintWithWorker();

  console.log(
    'Worker vanity result:',
    vanityMintResult
  );
}

showActionPopup(
  'Creating token...',
  'Creating mint and metadata...',
  { showStopButton: false }
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

      vanityPattern:
  (document.getElementById('vanityMintPattern') as HTMLInputElement).value,
  
  vanityEndPattern:
  (document.getElementById('vanityMintEndPattern') as HTMLInputElement).value,

vanityPosition:
  (document.getElementById('vanityMintPosition') as HTMLSelectElement).value as any,

vanityIgnoreCase:
  (document.getElementById('vanityIgnoreCase') as HTMLInputElement).checked,
  vanityMaxAttempts:
  
  Number(
    (document.getElementById('vanityMaxAttempts') as HTMLInputElement).value
  ),
  shouldStop:
  () => stopVanitySearch,
  vanitySecretKey:
  vanityMintResult?.secretKey,
  });

  progressStatus.innerHTML =
  'Minting supply...';
  progressStatus.innerHTML =
  'Creating token account...';
  showActionPopup(
    'Minting supply...',
    'Creating token account and minting supply...',
    { showStopButton: false }
  );

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


progressStatus.innerHTML =
  'Revoking authorities...';
const revokeMintAfterCreate =
  (document.getElementById('revokeMintAuthority') as HTMLInputElement).checked;
const revokeFreezeAfterCreate =
  (document.getElementById('revokeFreezeAuthority') as HTMLInputElement).checked;

if (revokeMintAfterCreate && revokeFreezeAfterCreate) {
  showActionPopup(
    'Revoking authorities...',
    'Revoking mint and freeze authorities...',
    { showStopButton: false }
  );
} else if (revokeMintAfterCreate) {
  showActionPopup(
    'Revoking mint authority...',
    'Submitting mint authority revoke...',
    { showStopButton: false }
  );
} else if (revokeFreezeAfterCreate) {
  showActionPopup(
    'Revoking freeze authority...',
    'Submitting freeze authority revoke...',
    { showStopButton: false }
  );
} else {
  showActionPopup(
    'Revoking authorities...',
    'No revoke actions selected. Skipping...',
    { showStopButton: false }
  );
}

await revokeAuthorities({
  walletProvider:
    connectedWallet,

  walletAddress:
    connectedWalletAddress,

  mintAddress:
    umiResult.mintAddress,

  revokeMintAuthority:
    revokeMintAfterCreate,

  revokeFreezeAuthority:
    revokeFreezeAfterCreate,
});

progressStatus.innerHTML =
  'Done';
showActionPopup(
  'Done',
  'Token created successfully.',
  { showStopButton: false }
);
hideActionPopup(2600);

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

    const revokeMintRequested =
      (document.getElementById('manageRevokeMintAuthority') as HTMLInputElement).checked;
    const revokeFreezeRequested =
      (document.getElementById('manageRevokeFreezeAuthority') as HTMLInputElement).checked;

    const mintAlreadyRevoked =
      !tokenInfo.mintAuthority;
    const freezeAlreadyRevoked =
      !tokenInfo.freezeAuthority;

    const shouldRevokeMint =
      revokeMintRequested && !mintAlreadyRevoked;
    const shouldRevokeFreeze =
      revokeFreezeRequested && !freezeAlreadyRevoked;

    const feedbackMessages: string[] = [];
    if (revokeMintRequested && mintAlreadyRevoked) {
      feedbackMessages.push('Mint authority is already revoked.');
    }
    if (revokeFreezeRequested && freezeAlreadyRevoked) {
      feedbackMessages.push('Freeze authority is already revoked.');
    }

    manageTokenStatus.innerHTML =
      'Applying token tools...';

    if (shouldRevokeMint && shouldRevokeFreeze) {
      showActionPopup(
        'Revoking authorities...',
        'Revoking mint and freeze authorities...',
        { showStopButton: false }
      );
    } else if (shouldRevokeMint) {
      showActionPopup(
        'Revoking mint authority...',
        'Submitting mint authority revoke...',
        { showStopButton: false }
      );
    } else if (shouldRevokeFreeze) {
      showActionPopup(
        'Revoking freeze authority...',
        'Submitting freeze authority revoke...',
        { showStopButton: false }
      );
    } else {
      showActionPopup(
        'No revoke actions needed',
        'Selected authorities are already revoked.',
        { showStopButton: false }
      );
      manageTokenStatus.innerHTML =
        feedbackMessages.join('<br>') || 'No revoke actions selected.';
      hideActionPopup(2600);
      return;
    }

    await revokeAuthorities({
      walletProvider:
        connectedWallet,

      walletAddress:
        connectedWalletAddress,

      mintAddress:
        mintAddress,

      revokeMintAuthority:
        shouldRevokeMint,

      revokeFreezeAuthority:
        shouldRevokeFreeze,
    });

    feedbackMessages.push('Authority update successful.');
    manageTokenStatus.innerHTML =
      feedbackMessages.join('<br>');
    showActionPopup(
      'Success',
      'Authority updates completed.',
      { showStopButton: false }
    );
    hideActionPopup(2600);
  }
);

updateMetadataButton.addEventListener(
  'click',
  async () => {
    try {
      const updateMintInput =
        document.getElementById('updateMintAddress') as HTMLInputElement | null;

      const mintAddress =
        (updateMintInput?.value || (document.getElementById('manageMintAddress') as HTMLInputElement).value).trim();

      if (!mintAddress) {
        alert('Enter mint address first');
        return;
      }
      
      const currentMetadata =
  await fetchTokenMetadataJson(
    mintAddress
  );

console.log(
  'Current metadata:',
  currentMetadata
);

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
     
        const updateFacebook =
  (document.getElementById('updateFacebook') as HTMLInputElement).value;

  const updateLogo =
  (document.getElementById('updateLogo') as HTMLInputElement).files?.[0];

      updateMetadataStatus.innerHTML =
        'Uploading new metadata...';
      showActionPopup(
        'Uploading metadata...',
        'Uploading updated metadata to IPFS...',
        { showStopButton: false }
      );
      let updatedImageUrl = '';

if (updateLogo) {
  const uploadedLogo =
    await uploadFileToPinata(
      updateLogo
    );

  updatedImageUrl =
    uploadedLogo.imageUrl;
}
const tokenTags =
  Array.from(
    (document.getElementById('tokenTags') as HTMLSelectElement).selectedOptions
  ).map(option => option.value);
const uploadedMetadata =
  await uploadMetadataToPinata({
    name:
      currentMetadata.json.name,

    symbol:
      currentMetadata.json.symbol,

    description:
      updateDescription ||
      currentMetadata.json.description,

    image:
      updatedImageUrl ||
      currentMetadata.json.image ||
      '',

    category:
      tokenTags[0] ||
      currentMetadata.json.category ||
      '',

    tags:
      tokenTags.length > 0
        ? tokenTags
        : currentMetadata.json.tags || [],

    extensions: {
      website:
        updateWebsite ||
        currentMetadata.json.extensions?.website,

      telegram:
        updateTelegram ||
        currentMetadata.json.extensions?.telegram,

      discord:
        updateDiscord ||
        currentMetadata.json.extensions?.discord,

      twitter:
        updateTwitter ||
        currentMetadata.json.extensions?.twitter,

      facebook:
        updateFacebook ||
        currentMetadata.json.extensions?.facebook,
    },
  });

console.log(
  'Updated metadata uploaded:',
  uploadedMetadata
);

await updateTokenMetadata({
  walletProvider:
    connectedWallet,

  mintAddress:
    mintAddress,

  metadataUri:
    uploadedMetadata.metadataUrl,
});

updateMetadataStatus.innerHTML = `
  Metadata uploaded.<br><br>
  ${uploadedMetadata.metadataUrl}
`;
showActionPopup(
  'Success',
  'Metadata updated successfully.',
  { showStopButton: false }
);
hideActionPopup(2600);
    } catch (error) {
      console.error(error);

      updateMetadataStatus.innerHTML =
        'Metadata update failed';
      showActionPopup(
        'Failed',
        'Metadata update failed.',
        { showStopButton: false }
      );
      hideActionPopup(2600);
    }
  }
);
 lockMetadataButton.addEventListener(
  'click',
  async () => {
    try {
      const mintAddress =
        (document.getElementById('manageMintAddress') as HTMLInputElement).value;

      if (!mintAddress) {
        alert('Enter mint address first');
        return;
      }

      const confirmed =
        confirm(
          'WARNING: This permanently locks metadata updates. Continue?'
        );

      if (!confirmed) {
        return;
      }

      showActionPopup(
        'Locking metadata permanently...',
        'This permanent action is being confirmed on-chain...',
        { showStopButton: false }
      );

      await lockTokenMetadata(
        connectedWallet,
        mintAddress
      );

      updateMetadataStatus.innerHTML =
        'Metadata permanently locked.';
      showActionPopup(
        'Metadata locked permanently',
        'Metadata is now permanently locked.',
        { showStopButton: false }
      );
      hideActionPopup(2800);
    } catch (error) {
      console.error(error);

      updateMetadataStatus.innerHTML =
        'Metadata lock failed.';
      showActionPopup(
        'Metadata lock failed',
        'Metadata lock failed.',
        { showStopButton: false }
      );
      hideActionPopup(2800);
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