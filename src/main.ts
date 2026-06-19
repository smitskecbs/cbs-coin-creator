import './polyfills';

import './style.css';

import logoUrl from './assets/logo.png';
import tokenBuilderBannerUrl from './assets/tokenbuilder.png';

import {
  connectAndNormalizeWalletPublicKey,
  detectAvailableWallets,
  getDetectedWallet,
  getWalletProvider,
  getWalletPublicKeyDebugInfo,
  logWalletDebug,
  readWalletPublicKey,
  setWalletNetworkResolver,
  subscribeToWalletChanges,
  walletSupportsTokenCreation,
  WALLET_PUBLIC_KEY_READ_ERROR,
  WALLET_UNSUPPORTED_SIGNING_MESSAGE,
  type SolanaWalletProvider,
} from './solana/wallets';

import {
  uploadFileToPinata,
  uploadMetadataToPinata,
} from './uploadToPinata';

import {
  ENABLE_MAINNET,
  getExplorerTokenUrl,
  getRpc,
  isMainnetRpcConfigured,
  MAINNET_RPC_NOT_CONFIGURED_MESSAGE,
  type SolanaNetwork,
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
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';

console.log(
  'updateV1:',
  updateV1
);

type WalletProvider =
  SolanaWalletProvider;

let connectedWallet:
  WalletProvider | null = null;

let connectedWalletAddress =
  '';

let selectedWalletId =
  '';

const TAG_PILL_OPTIONS = [
  { value: 'meme', label: 'Meme' },
  { value: 'defi', label: 'DeFi' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'utility', label: 'Utility' },
  { value: 'ai', label: 'AI' },
  { value: 'community', label: 'Community' },
  { value: 'finance', label: 'Finance' },
  { value: 'nft', label: 'NFT' },
  { value: 'social', label: 'Social' },
  { value: 'payments', label: 'Payments' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'dao', label: 'DAO' },
  { value: 'metaverse', label: 'Metaverse' },
  { value: 'rwa', label: 'RWA' },
  { value: 'privacy', label: 'Privacy' },
  { value: 'exchange', label: 'Exchange' },
  { value: 'launchpad', label: 'Launchpad' },
  { value: 'stablecoin', label: 'Stablecoin' },
  { value: 'education', label: 'Education' },
  { value: 'music', label: 'Music' },
  { value: 'charity', label: 'Charity' },
  { value: 'tools', label: 'Tools' },
  { value: 'trading', label: 'Trading' },
  { value: 'yield', label: 'Yield' },
  { value: 'staking', label: 'Staking' },
  { value: 'other', label: 'Other' },
] as const;

const DONATION_WALLET_ADDRESS =
  'ManGofryUWC5VWk7t4ATP32qJtGVBBNoVi2AQ9HyR9J';

const DONATION_WALLET_SHORT =
  'ManGofry...HyR9J';

function renderTagPillsMarkup(): string {
  return TAG_PILL_OPTIONS.map(
    ({ value, label }) =>
      `<button type="button" class="tag-pill" data-value="${value}">${label}</button>`
  ).join('');
}

function setSiteFavicon() {
  let link =
    document.querySelector<HTMLLinkElement>(
      'link[rel="icon"]'
    );

  if (!link) {
    link =
      document.createElement(
        'link'
      );
    link.rel =
      'icon';
    document.head.appendChild(
      link
    );
  }

  link.type =
    'image/png';
  link.href =
    logoUrl;
}

setSiteFavicon();

const isDevelopment =
  window.location.hostname ===
  'localhost';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <main class="app-shell">
    <header class="site-hero">
      <img
        class="site-banner"
        src="${tokenBuilderBannerUrl}"
        alt="CBS Token Builder"
      />

      <p class="site-hero-subtitle">
        Create or manage Solana
        <img
          class="solana-logomark"
          src="/assets/solana-logomark.svg"
          alt=""
          width="16"
          height="12"
          loading="lazy"
        />
        tokens with simple, community-built tools.
      </p>

      <div
        class="community-message"
        aria-labelledby="community-message-heading"
      >
        <div class="community-message-panel">
          <h3
            class="community-message-title"
            id="community-message-heading"
          >
            <svg
              class="community-message-heart"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="currentColor"
              />
            </svg>
            Built for the Solana Community
          </h3>
          <div class="community-message-copy">
            <p class="community-message-lead">
              The CBS Token Builder is
              <strong class="community-message-emphasis">free to use</strong>.
            </p>
            <p class="community-message-note">
              CBS does not charge platform fees.
            </p>
            <p class="community-message-note">
              You only pay Solana network fees and optional third-party service fees when using external services.
            </p>
          </div>
        </div>
      </div>
    </header>

    <section class="cbs-overview-card page-section">
      <h2 class="cbs-overview-title">
        What can you do here?
      </h2>
      <p class="cbs-overview-text">
        Use the CBS Token Builder to create SPL tokens, configure token details, add metadata and prepare your project for launch.
      </p>
      <ul class="cbs-overview-list">
        <li>Create a Solana token</li>
        <li>Add name, symbol, supply and decimals</li>
        <li>Add or manage metadata where supported</li>
        <li>Prepare your token for launch and community use</li>
      </ul>
    </section>

    <section class="hero-card page-section">
      <div class="network-panel">
        <label
          class="network-panel-label"
          for="networkSelect"
        >
          Network
        </label>

        <select
          id="networkSelect"
          class="network-select"
        >
          <option value="devnet">Devnet</option>
          <option value="mainnet" selected>Mainnet</option>
        </select>
      </div>

      <div
        id="mainnetNetworkWarning"
        class="warning-box"
        style="display: none;"
      ></div>

      <div class="wallet-panel">
        <label
          id="walletSelectLabel"
          for="walletSelect"
        >
          Choose wallet
        </label>

        <p
          id="walletDetectedHint"
          class="wallet-detected-hint"
          style="display: none;"
        ></p>

        <select id="walletSelect"></select>

        <div class="wallet-panel-actions">
          <button id="connectWallet" class="primary-btn">
            Connect Wallet
          </button>

          ${
            isDevelopment
              ? `
          <button
            id="testWallet"
            type="button"
            class="secondary-btn wallet-test-btn"
          >
            Test Wallet
          </button>
          `
              : ''
          }
        </div>
      </div>

      ${
        isDevelopment
          ? `
      <div
        id="walletTestResults"
        class="wallet-box wallet-test-results"
        style="display: none;"
      ></div>
      `
          : ''
      }

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

      <div
        id="pendingVanityMintBox"
        class="wallet-box pending-vanity-box"
        style="display: none;"
      >
        <strong>Pending vanity mint found</strong>
        <p class="helper-text pending-vanity-warning">
          Vanity mint keys are kept only in this browser session and are not saved after refresh.
        </p>
        <p>
          <strong>Status:</strong>
          Pending vanity mint
        </p>
        <p>
          <strong>Address:</strong>
          <span id="pendingVanityMintAddress"></span>
        </p>
        <p>
          <strong>Network:</strong>
          <span id="pendingVanityMintNetwork"></span>
        </p>
        <p
          id="pendingVanityNetworkMismatch"
          class="helper-text"
          style="display: none;"
        ></p>
        <div class="pending-vanity-actions">
          <button
            id="continuePendingVanityMint"
            type="button"
            class="primary-btn"
          >
            Continue Mint
          </button>
          <button
            id="deletePendingVanityMint"
            type="button"
            class="secondary-btn"
          >
            Delete Pending Mint
          </button>
        </div>
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
  Longer patterns may take much longer. For mainnet, confirm the wallet transaction promptly after the mint is found.
</p>

<p class="helper-text vanity-authenticity-warning">
  Vanity mint addresses do not prove authenticity.
</p>

<p class="helper-text vanity-session-warning">
  Vanity mint keys are kept only in this browser session and are not saved after refresh.
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
<label class="tag-field">
  Category / tags
  <div id="tokenTags" class="tag-pills" role="group" aria-label="Category and tags">
    ${renderTagPillsMarkup()}
  </div>
  <div id="selectedTagsPreview" class="wallet-box selected-tags-preview">
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

        <div class="warning-box anti-scam-safety-box">
          <p>
            Always verify the official mint address. Name, symbol, logo and vanity address can be faked.
          </p>
        </div>

        <div
          id="knownTokenWarning"
          class="warning-box known-token-warning"
          style="display: none;"
        ></div>

        <label class="checkbox-row">
          <input
            id="impersonationConfirm"
            type="checkbox"
          />
          I confirm this token does not impersonate an existing project.
        </label>

        <button
          id="createTokenButton"
          type="submit"
          class="primary-btn"
          disabled
        >
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

            <div id="manageMetadataStatus" class="wallet-box metadata-status-box">
              Metadata status will appear here
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

            <div id="updateMetadataMutabilityStatus" class="wallet-box metadata-status-box">
              Metadata status will appear here
            </div>

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

            <label class="tag-field">
              New category / tags
              <p class="helper-text">
                Leave unselected to keep the token&apos;s existing category and tags.
              </p>
              <div id="updateTokenTags" class="tag-pills" role="group" aria-label="Update category and tags">
                ${renderTagPillsMarkup()}
              </div>
              <div id="updateSelectedTagsPreview" class="wallet-box selected-tags-preview">
                Selected update tags will appear here
              </div>
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

    <section class="cbs-support-block support-section">
      <h2 class="cbs-support-title">
        Support CBS Ecosystem
      </h2>
      <p class="cbs-support-text">
        Optional donations help fund development and infrastructure.
      </p>
      <div class="cbs-support-wallet">
        <code
          id="donationWalletDisplay"
          class="support-footer-address"
          title="${DONATION_WALLET_ADDRESS}"
        >${DONATION_WALLET_SHORT}</code>
        <button
          id="copyDonationAddress"
          type="button"
          class="support-footer-copy"
        >
          Copy address
        </button>
      </div>
    </section>

    <footer class="cbs-site-footer site-footer">
      <div class="cbs-footer-inner">
        <nav
          class="cbs-footer-links"
          aria-label="CBS ecosystem links"
        >
          <a
            href="https://tools.cbs-coin.com"
            target="_blank"
            rel="noopener noreferrer"
          >CBS Tools</a>
          <a
            href="https://cbs-coin.com"
            target="_blank"
            rel="noopener noreferrer"
          >CBS Coin</a>
          <a
            href="https://github.com/smitskecbs"
            target="_blank"
            rel="noopener noreferrer"
          >GitHub</a>
        </nav>

        <div class="cbs-footer-open">
          <h3 class="cbs-footer-open-title">
            Built in the Open
          </h3>
          <p class="cbs-footer-open-text">
            CBS Tools is developed publicly and transparently.
            Source code, improvements and community contributions can be followed on GitHub.
          </p>
        </div>

        <p class="cbs-footer-badges">
          Open Source • Community Driven • Built on Solana
        </p>

        <p class="cbs-footer-tagline">
          Community-built tools for Solana builders.
        </p>
      </div>
    </footer>

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
    <div
      id="actionPopupIndicator"
      class="action-popup-indicator action-popup-indicator--hidden"
      aria-hidden="true"
    ></div>

    <h3 id="actionPopupTitle">
  Working...
</h3>

   <p id="actionPopupText">
  Preparing...
</p>

    <div
      id="actionPopupVanityExtras"
      class="action-popup-vanity-extras"
      style="display: none;"
    >
      <p class="action-popup-vanity-label">
        Address
      </p>
      <p class="action-popup-vanity-address">
        <code
          id="actionPopupVanityAddressDisplay"
          title=""
        ></code>
      </p>
      <button
        id="actionPopupCopyAddress"
        type="button"
        class="secondary-btn action-popup-copy-btn"
      >
        Copy Address
      </button>
    </div>

    <button
      id="stopVanitySearch"
      class="primary-btn"
    >
      Stop Search
    </button>

    <div
      id="actionPopupActions"
      class="action-popup-actions"
      style="display: none;"
    >
      <button
        id="actionPopupTryAgain"
        type="button"
        class="primary-btn"
      >
        Try again
      </button>
      <button
        id="actionPopupCancel"
        type="button"
        class="secondary-btn"
      >
        Cancel
      </button>
    </div>
  </div>
</div>
  </main>
`;

document.body.insertAdjacentHTML(
  'beforeend',
  `
    <div
      id="lowSolBalanceModal"
      class="low-sol-modal-overlay"
      style="display: none;"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lowSolBalanceModalTitle"
    >
      <div class="low-sol-modal-card">
        <span
          class="action-popup-icon action-popup-icon--error"
          aria-hidden="true"
        >!</span>

        <h3 id="lowSolBalanceModalTitle">
          Low SOL Balance
        </h3>

        <div class="low-sol-modal-body">
          <p>
            Your wallet currently has less than 0.6 SOL.
          </p>
          <p>
            Phantom may block token creation because it keeps a safety reserve in your wallet.
          </p>
          <p>
            <strong>This is NOT a CBS fee.</strong>
          </p>
          <p>
            Only Solana network fees and Metaplex account rent are spent during token creation.
          </p>
        </div>

        <div class="low-sol-modal-info-box">
          <p class="low-sol-modal-info-title">
            Recommended balance:
          </p>
          <ul class="low-sol-modal-info-list">
            <li>Devnet: 0.6 SOL</li>
            <li>Mainnet: 0.6 SOL</li>
          </ul>
        </div>

        <div class="action-popup-actions low-sol-modal-actions">
          <button
            id="lowSolUnderstandButton"
            type="button"
            class="primary-btn"
          >
            I Understand
          </button>
          <button
            id="lowSolCancelButton"
            type="button"
            class="secondary-btn"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  `
);

const networkSelect =
  document.getElementById('networkSelect') as HTMLSelectElement;

function getSelectedNetwork(): SolanaNetwork {
  return networkSelect.value ===
    'mainnet'
    ? 'mainnet'
    : 'devnet';
}

function isMainnetWriteBlocked(): boolean {
  if (
    getSelectedNetwork() !==
    'mainnet'
  ) {
    return false;
  }

  if (
    !isMainnetRpcConfigured()
  ) {
    return true;
  }

  return !ENABLE_MAINNET;
}

function getMainnetWriteBlockedMessage(): string {
  if (
    getSelectedNetwork() ===
      'mainnet' &&
    !isMainnetRpcConfigured()
  ) {
    return MAINNET_RPC_NOT_CONFIGURED_MESSAGE;
  }

  return 'Mainnet is locked for now. Test on devnet first.';
}

function showMainnetBlockedMessage() {
  const message =
    getMainnetWriteBlockedMessage();

  showUserError(message);
  showActionPopup(
    getSelectedNetwork() ===
      'mainnet' &&
      !isMainnetRpcConfigured()
      ? 'Mainnet RPC missing'
      : 'Mainnet locked',
    message,
    {
      showStopButton: false,
      state: 'error',
    }
  );
  hideActionPopup(
    POPUP_READ_MS
  );
}

function ensureWriteNetworkAllowed(): boolean {
  if (
    isMainnetWriteBlocked()
  ) {
    showMainnetBlockedMessage();
    return false;
  }

  return true;
}

function updateMainnetNetworkWarning() {
  const warning =
    document.getElementById(
      'mainnetNetworkWarning'
    );

  if (!warning) {
    return;
  }

  if (
    getSelectedNetwork() ===
    'mainnet'
  ) {
    warning.style.display =
      'block';
    warning.innerHTML =
      '<strong>Mainnet selected.</strong> Real SOL is used for every transaction. Make sure your wallet is on mainnet before confirming.';
  } else {
    warning.style.display =
      'none';
  }
}

networkSelect.addEventListener(
  'change',
  () => {
    updateMainnetNetworkWarning();
    renderPendingVanityMintUI();
  }
);
updateMainnetNetworkWarning();

const walletSelect =
  document.getElementById('walletSelect') as HTMLSelectElement;

const walletSelectLabel =
  document.getElementById(
    'walletSelectLabel'
  ) as HTMLLabelElement;

const walletDetectedHint =
  document.getElementById(
    'walletDetectedHint'
  ) as HTMLParagraphElement;

const connectButton =
  document.getElementById('connectWallet') as HTMLButtonElement;

const testWalletButton =
  document.getElementById(
    'testWallet'
  ) as HTMLButtonElement | null;

const walletTestResults =
  document.getElementById(
    'walletTestResults'
  ) as HTMLDivElement | null;


const walletBox =
  document.getElementById('walletBox') as HTMLDivElement;

const copyDonationAddressButton =
  document.getElementById(
    'copyDonationAddress'
  ) as HTMLButtonElement;

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

const actionPopupIndicator =
  document.getElementById(
    'actionPopupIndicator'
  ) as HTMLDivElement;

const actionPopupVanityExtras =
  document.getElementById(
    'actionPopupVanityExtras'
  ) as HTMLDivElement;

const actionPopupVanityAddressDisplay =
  document.getElementById(
    'actionPopupVanityAddressDisplay'
  ) as HTMLElement;

const actionPopupCopyAddressButton =
  document.getElementById(
    'actionPopupCopyAddress'
  ) as HTMLButtonElement;

let actionPopupCopyAddressFull =
  '';

const tokenTagsContainer =
  document.getElementById(
    'tokenTags'
  ) as HTMLDivElement;

const selectedTagsPreview =
  document.getElementById(
    'selectedTagsPreview'
  ) as HTMLDivElement;

function getSelectedTagsFromContainer(
  container: HTMLElement
): string[] {
  return Array.from(
    container.querySelectorAll(
      '.tag-pill.is-selected'
    )
  )
    .map(
      pill =>
        (pill as HTMLButtonElement).dataset.value || ''
    )
    .filter(Boolean);
}

function bindTagPills(
  container: HTMLElement,
  preview: HTMLElement,
  emptyText: string
) {
  const refreshPreview = () => {
    const labels =
      Array.from(
        container.querySelectorAll(
          '.tag-pill.is-selected'
        )
      )
        .map(
          pill =>
            pill.textContent?.trim() || ''
        )
        .filter(Boolean);

    preview.innerHTML =
      labels.length > 0
        ? labels.join(', ')
        : emptyText;
  };

  container.addEventListener(
    'click',
    (event) => {
      const pill =
        (event.target as HTMLElement).closest(
          '.tag-pill'
        ) as HTMLButtonElement | null;

      if (!pill) {
        return;
      }

      pill.classList.toggle('is-selected');
      refreshPreview();
    }
  );
}

function getSelectedTokenTags(): string[] {
  return getSelectedTagsFromContainer(
    tokenTagsContainer
  );
}

const updateTokenTagsContainer =
  document.getElementById(
    'updateTokenTags'
  ) as HTMLDivElement;

const updateSelectedTagsPreview =
  document.getElementById(
    'updateSelectedTagsPreview'
  ) as HTMLDivElement;

function getSelectedUpdateTokenTags(): string[] {
  return getSelectedTagsFromContainer(
    updateTokenTagsContainer
  );
}

bindTagPills(
  tokenTagsContainer,
  selectedTagsPreview,
  'Selected tags will appear here'
);

bindTagPills(
  updateTokenTagsContainer,
  updateSelectedTagsPreview,
  'Selected update tags will appear here'
);
  
  document.getElementById(
    'actionPopupText'
  ) as HTMLParagraphElement;

const stopVanitySearchButton =
  document.getElementById(
    'stopVanitySearch'
  ) as HTMLButtonElement;

const actionPopupActions =
  document.getElementById(
    'actionPopupActions'
  ) as HTMLDivElement;

const actionPopupTryAgainButton =
  document.getElementById(
    'actionPopupTryAgain'
  ) as HTMLButtonElement;

const actionPopupCancelButton =
  document.getElementById(
    'actionPopupCancel'
  ) as HTMLButtonElement;

const lowSolBalanceModal =
  document.getElementById(
    'lowSolBalanceModal'
  ) as HTMLDivElement;

const lowSolUnderstandButton =
  document.getElementById(
    'lowSolUnderstandButton'
  ) as HTMLButtonElement;

const lowSolCancelButton =
  document.getElementById(
    'lowSolCancelButton'
  ) as HTMLButtonElement;

setWalletNetworkResolver(
  getSelectedNetwork
);

function refreshWalletSelector() {
  const wallets =
    detectAvailableWallets();

  const preferredWallet =
    localStorage.getItem(
      'preferredWallet'
    );

  walletSelect.innerHTML =
    '';

  if (
    wallets.length ===
    0
  ) {
    walletSelect.style.display =
      'none';
    walletSelectLabel.style.display =
      'none';
    walletDetectedHint.style.display =
      'block';
    walletDetectedHint.textContent =
      'No Solana wallet detected. Install Phantom, Solflare, Backpack, Glow, or MetaMask with Solana support enabled.';
    connectButton.disabled =
      true;

    if (
      testWalletButton
    ) {
      testWalletButton.disabled =
        true;
    }

    return;
  }

  connectButton.disabled =
    false;

  if (
    testWalletButton
  ) {
    testWalletButton.disabled =
      false;
  }

  for (const wallet of wallets) {
    const option =
      document.createElement(
        'option'
      );

    option.value =
      wallet.id;
    option.textContent =
      wallet.name;
    walletSelect.appendChild(
      option
    );
  }

  const preferredExists =
    preferredWallet &&
    wallets.some(
      (
        wallet
      ) =>
        wallet.id ===
        preferredWallet
    );

  selectedWalletId =
    preferredExists
      ? preferredWallet!
      : wallets[0]!.id;

  walletSelect.value =
    selectedWalletId;

  const showSelector =
    wallets.length >
    1;

  walletSelect.style.display =
    showSelector
      ? ''
      : 'none';
  walletSelectLabel.style.display =
    showSelector
      ? ''
      : 'none';
  walletDetectedHint.style.display =
    showSelector
      ? 'none'
      : 'block';
  walletDetectedHint.textContent =
    `Wallet: ${wallets[0]!.name}`;
}

refreshWalletSelector();

subscribeToWalletChanges(
  refreshWalletSelector
);

console.log(
  'Vanity popup elements:',
  vanitySearchPopup,
  actionPopupText,
  stopVanitySearchButton
);
let stopVanitySearch =
  false;

let isVanitySearching =
  false;

let vanitySearchAttempts =
  0;

let actionPopupHideTimeoutId:
  | ReturnType<
      typeof setTimeout
    >
  | null = null;

let vanityFoundAwaitingContinue =
  false;
  let vanityWorker:
   Worker | null = null;
let vanityWorkerReject:
  | ((
      reason?: unknown
    ) => void)
  | null = null;

type PendingVanityMint = {
  address: string;
  secretKey: number[];
  attempts: number;
};

type CreateTokenMetadataInput = {
  tokenName: string;
  symbol: string;
  tokenDescription: string;
  tokenTags: string[];
  tokenWebsite: string;
  tokenTelegram: string;
  tokenDiscord: string;
  tokenTwitter: string;
  tokenFacebook: string;
};

type TokenCreateFinishContext = {
  network: SolanaNetwork;
  writeWallet: WalletProvider;
  writeWalletAddress: string;
  metadataInput: CreateTokenMetadataInput;
  uploadedMetadata?: {
    metadataUrl: string;
  };
  decimals: number;
  supply: number;
  revokeMintAfterCreate: boolean;
  revokeFreezeAfterCreate: boolean;
};

type PendingVanityTokenCreate =
  TokenCreateFinishContext & {
    vanity: PendingVanityMint;
    tokenName: string;
    symbol: string;
    vanityFields: {
      pattern: string;
      endPattern: string;
      position: string;
      ignoreCase: boolean;
      maxAttempts: number;
    };
  };

let pendingVanityTokenCreate:
  PendingVanityTokenCreate | null =
  null;

let walletConfirmTimeoutId:
  | ReturnType<
      typeof setTimeout
    >
  | null = null;

const WALLET_CONFIRM_TIMEOUT_MS =
  90000;

const PENDING_VANITY_MINT_STORAGE_KEY =
  'cbs_pending_vanity_mint';

const VANITY_SESSION_EXPIRED_MESSAGE =
  'Vanity mint session expired. Please start a new vanity search.';

function purgeLegacyPendingVanityMintStorage(): boolean {
  const hadLegacy =
    localStorage.getItem(
      PENDING_VANITY_MINT_STORAGE_KEY
    ) !== null;

  localStorage.removeItem(
    PENDING_VANITY_MINT_STORAGE_KEY
  );

  return hadLegacy;
}

function validatePendingVanityNetwork(
  pending: PendingVanityTokenCreate
): boolean {
  const pendingNetwork =
    pending.network;
  const selectedNetwork =
    getSelectedNetwork();

  if (
    pendingNetwork !==
    selectedNetwork
  ) {
    showUserError(
      `Pending vanity mint is for ${pendingNetwork}. Switch to ${pendingNetwork} or delete the pending mint.`
    );
    return false;
  }

  return true;
}

function renderPendingVanityMintUI() {
  const box =
    document.getElementById(
      'pendingVanityMintBox'
    ) as HTMLDivElement | null;
  const addressEl =
    document.getElementById(
      'pendingVanityMintAddress'
    ) as HTMLSpanElement | null;
  const networkEl =
    document.getElementById(
      'pendingVanityMintNetwork'
    ) as HTMLSpanElement | null;
  const mismatchEl =
    document.getElementById(
      'pendingVanityNetworkMismatch'
    ) as HTMLParagraphElement | null;

  if (
    !box ||
    !addressEl
  ) {
    return;
  }

  const pending =
    pendingVanityTokenCreate;

  if (!pending) {
    box.style.display =
      'none';
    addressEl.textContent =
      '';
    if (networkEl) {
      networkEl.textContent =
        '';
    }
    if (mismatchEl) {
      mismatchEl.style.display =
        'none';
      mismatchEl.textContent =
        '';
    }
    return;
  }

  const pendingNetwork =
    pending.network;
  const selectedNetwork =
    getSelectedNetwork();
  const networkMismatch =
    pendingNetwork !==
    selectedNetwork;

  box.style.display =
    'block';
  addressEl.textContent =
    pending.vanity.address;

  if (networkEl) {
    networkEl.textContent =
      pendingNetwork;
  }

  if (mismatchEl) {
    if (networkMismatch) {
      mismatchEl.style.display =
        'block';
      mismatchEl.textContent =
        `Network mismatch: pending mint is for ${pendingNetwork}, but ${selectedNetwork} is selected. Switch network or delete the pending mint.`;
    } else {
      mismatchEl.style.display =
        'none';
      mismatchEl.textContent =
        '';
    }
  }
}

function clearAllPendingVanityState() {
  pendingVanityTokenCreate =
    null;
  purgeLegacyPendingVanityMintStorage();
  renderPendingVanityMintUI();
}

function clearPendingVanityTokenCreate() {
  pendingVanityTokenCreate =
    null;
  purgeLegacyPendingVanityMintStorage();
}

async function uploadCreateTokenMetadata(
  metadataInput: CreateTokenMetadataInput,
  tokenLogoFile: File
): Promise<{
  metadataUrl: string;
}> {
  progressStatus.innerHTML =
    'Uploading logo...';
  showActionPopup(
    'Uploading logo...',
    'Uploading your logo to IPFS...',
    {
      showStopButton: false,
      state: 'loading',
    }
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
    {
      showStopButton: false,
      state: 'loading',
    }
  );

  console.log('Social fields:', {
    tokenWebsite:
      metadataInput.tokenWebsite,
    tokenTelegram:
      metadataInput.tokenTelegram,
    tokenDiscord:
      metadataInput.tokenDiscord,
    tokenTwitter:
      metadataInput.tokenTwitter,
    tokenFacebook:
      metadataInput.tokenFacebook,
  });

  const uploadedMetadata =
    await uploadMetadataToPinata({
      name:
        metadataInput.tokenName,

      symbol:
        metadataInput.symbol,

      description:
        metadataInput.tokenDescription,

      image:
        uploadedLogo.imageUrl,

      category:
        metadataInput.tokenTags[0] ||
        '',

      tags:
        metadataInput.tokenTags,

      extensions: {
        website:
          metadataInput.tokenWebsite,

        telegram:
          metadataInput.tokenTelegram,

        discord:
          metadataInput.tokenDiscord,

        twitter:
          metadataInput.tokenTwitter,

        facebook:
          metadataInput.tokenFacebook,
      },
    });

  console.log(
    'Uploaded metadata:',
    uploadedMetadata
  );

  return uploadedMetadata;
}

function resolveTokenLogoFile(
  tokenLogoFile?: File
): File | null {
  return (
    tokenLogoFile ??
    tokenLogoInput?.files?.[0] ??
    null
  );
}

async function ensurePendingVanityMetadataUploaded(
  pending: PendingVanityTokenCreate,
  tokenLogoFile?: File
): Promise<{
  metadataUrl: string;
}> {
  if (
    !ensureWriteNetworkAllowed()
  ) {
    throw new Error(
      'Mainnet writes are blocked.'
    );
  }

  if (
    pending.uploadedMetadata
  ) {
    return pending.uploadedMetadata;
  }

  const logoFile =
    resolveTokenLogoFile(
      tokenLogoFile
    );

  if (!logoFile) {
    showUserError(
      'Please select a token logo before continuing.'
    );
    showActionPopup(
      'Logo required',
      'Please select a token logo before continuing.',
      {
        showStopButton: false,
        state: 'error',
      }
    );
    hideActionPopup(
      POPUP_READ_MS
    );
    throw new Error(
      'Logo required'
    );
  }

  const uploadedMetadata =
    await uploadCreateTokenMetadata(
      pending.metadataInput,
      logoFile
    );

  pending.uploadedMetadata =
    uploadedMetadata;

  return uploadedMetadata;
}

async function executePendingVanityMintFlow(
  pending: PendingVanityTokenCreate,
  tokenLogoFile?: File
) {
  if (
    !ensureWriteNetworkAllowed()
  ) {
    return;
  }

  pendingVanityTokenCreate =
    pending;

  if (
    !(await ensureWalletBalanceForTokenCreation(
      pending.network,
      pending.writeWalletAddress
    ))
  ) {
    return;
  }

  const uploadedMetadata =
    await ensurePendingVanityMetadataUploaded(
      pending,
      tokenLogoFile
    );

  let umiResult;

  try {
    umiResult =
      await createUmiTokenFromPendingVanity(
        pending
      );
  } catch (error) {
    if (
      isWalletConfirmationFailure(
        error
      )
    ) {
      showVanityWalletConfirmFailedPopup();
      progressStatus.innerHTML =
        'Wallet confirmation failed. Try again or cancel.';
      renderPendingVanityMintUI();
    }

    throw error;
  }

  await finishTokenCreationAfterUmi(
    umiResult,
    pending,
    uploadedMetadata
  );
}

async function continueStoredPendingVanityMint() {
  const pending =
    pendingVanityTokenCreate;

  if (!pending) {
    renderPendingVanityMintUI();
    progressStatus.innerHTML =
      VANITY_SESSION_EXPIRED_MESSAGE;
    return;
  }

  if (
    !ensureWriteNetworkAllowed()
  ) {
    return;
  }

  if (
    !validatePendingVanityNetwork(
      pending
    )
  ) {
    return;
  }

  if (
    !beginAction(
      'continue-vanity-mint'
    )
  ) {
    return;
  }

  try {
    progressStatus.innerHTML =
      'Continuing pending vanity mint...';

    const walletSession =
      await resolveConnectedWallet(
        'continue-vanity-mint'
      );

    if (!walletSession) {
      showActionPopup(
        'Wallet required',
        'Connect your wallet before continuing the pending vanity mint.',
        {
          showStopButton: false,
          state: 'error',
        }
      );
      hideActionPopup(
        POPUP_READ_MS
      );
      return;
    }

    pending.writeWallet =
      walletSession.provider;
    pending.writeWalletAddress =
      walletSession.address;

    await executePendingVanityMintFlow(
      pending
    );
  } catch (error) {
    console.error(error);

    if (
      isWalletConfirmationFailure(
        error
      )
    ) {
      showVanityWalletConfirmFailedPopup();
      progressStatus.innerHTML =
        'Wallet confirmation failed. Try again or cancel.';
      return;
    }

    progressStatus.innerHTML =
      'Token creation failed';
    showActionPopup(
      'Failed',
      'Token creation failed. Check your wallet and try again.',
      {
        showStopButton: false,
        state: 'error',
      }
    );
    hideActionPopup(
      POPUP_READ_MS
    );
  } finally {
    endAction();
  }
}

function clearWalletConfirmTimeout() {
  if (
    walletConfirmTimeoutId !==
    null
  ) {
    clearTimeout(
      walletConfirmTimeoutId
    );
    walletConfirmTimeoutId =
      null;
  }
}

function showActionPopupActions(
  show: boolean
) {
  actionPopupActions.style.display =
    show
      ? 'flex'
      : 'none';
}

async function withWalletConfirmTimeout<T>(
  operation: () => Promise<T>
): Promise<T> {
  clearWalletConfirmTimeout();

  return new Promise(
    (resolve, reject) => {
      walletConfirmTimeoutId =
        setTimeout(() => {
          walletConfirmTimeoutId =
            null;
          reject(
            new Error(
              'Wallet confirmation timed out.'
            )
          );
        },
        WALLET_CONFIRM_TIMEOUT_MS
      );

      operation()
        .then((result) => {
          clearWalletConfirmTimeout();
          resolve(result);
        })
        .catch((error) => {
          clearWalletConfirmTimeout();
          reject(error);
        });
    }
  );
}

function buildCreateUmiTokenParams(
  pending: PendingVanityTokenCreate
) {
  return {
    network:
      pending.network,

    walletProvider:
      pending.writeWallet,

    metadataUri:
      pending.uploadedMetadata!
        .metadataUrl,

    tokenName:
      pending.tokenName,

    symbol:
      pending.symbol,

    decimals:
      pending.decimals,

    supply:
      pending.supply,

    vanityPattern:
      pending.vanityFields
        .pattern,

    vanityEndPattern:
      pending.vanityFields
        .endPattern,

    vanityPosition:
      pending.vanityFields
        .position as
        | 'prefix'
        | 'suffix'
        | 'contains'
        | 'both'
        | 'bothEnds',

    vanityIgnoreCase:
      pending.vanityFields
        .ignoreCase,

    vanityMaxAttempts:
      pending.vanityFields
        .maxAttempts,

    shouldStop:
      () =>
        stopVanitySearch,

    vanitySecretKey:
      pending.vanity
        .secretKey,
  };
}

const PHANTOM_PREFLIGHT_MIN_LAMPORTS =
  600_000_000;

let lowSolBalanceModalResolver:
  | ((
      proceed: boolean
    ) => void)
  | null = null;

function hideLowSolBalanceModal() {
  lowSolBalanceModal.style.display =
    'none';
  document.body.classList.remove(
    'low-sol-modal-open'
  );
}

function resolveLowSolBalanceModal(
  proceed: boolean
) {
  hideLowSolBalanceModal();

  const resolver =
    lowSolBalanceModalResolver;

  lowSolBalanceModalResolver =
    null;
  resolver?.(proceed);
}

function showLowSolBalanceModal(
  balanceSol: number
): Promise<boolean> {
  if (
    lowSolBalanceModalResolver
  ) {
    resolveLowSolBalanceModal(
      false
    );
  }

  progressStatus.className =
    'wallet-box preflight-balance-warning';
  progressStatus.innerHTML =
    `Your wallet has ${balanceSol.toFixed(4)} SOL. Recommended balance is 0.6 SOL.`;

  document.body.classList.add(
    'low-sol-modal-open'
  );
  lowSolBalanceModal.style.display =
    'flex';

  return new Promise(
    (resolve) => {
      lowSolBalanceModalResolver =
        resolve;
    }
  );
}

async function ensureWalletBalanceForTokenCreation(
  network: SolanaNetwork,
  walletAddress: string
): Promise<boolean> {
  const connection =
    new Connection(
      getRpc(network),
      'confirmed'
    );

  const balance =
    await connection.getBalance(
      new PublicKey(
        walletAddress
      )
    );

  if (
    balance >=
    PHANTOM_PREFLIGHT_MIN_LAMPORTS
  ) {
    return true;
  }

  return showLowSolBalanceModal(
    balance /
      LAMPORTS_PER_SOL
  );
}

async function createUmiTokenFromPendingVanity(
  pending: PendingVanityTokenCreate
) {
  if (
    !(await ensureWalletBalanceForTokenCreation(
      pending.network,
      pending.writeWalletAddress
    ))
  ) {
    throw new Error(
      'Insufficient wallet balance for token creation.'
    );
  }

  showVanityWalletConfirmPopup(
    'Creating token...'
  );

  console.log(
    '[vanity] retry/create with mint:',
    pending.vanity.address
  );

  return withWalletConfirmTimeout(
    () =>
      createUmiToken(
        buildCreateUmiTokenParams(
          pending
        )
      )
  );
}

async function finishTokenCreationAfterUmi(
  umiResult: {
    mintAddress: string;
  },
  ctx: TokenCreateFinishContext,
  uploadedMetadata: {
    metadataUrl: string;
  }
) {
  progressStatus.innerHTML =
    'Minting supply...';
  progressStatus.innerHTML =
    'Creating token account...';
  showWalletConfirmPopup(
    'Minting supply...'
  );

  await mintSupply({
    network:
      ctx.network,

    walletProvider:
      ctx.writeWallet,

    walletAddress:
      ctx.writeWalletAddress,

    mintAddress:
      umiResult.mintAddress,

    decimals:
      ctx.decimals,

    supply:
      ctx.supply,
  });

  progressStatus.innerHTML =
    'Revoking authorities...';

  if (
    ctx.revokeMintAfterCreate &&
    ctx.revokeFreezeAfterCreate
  ) {
    showWalletConfirmPopup(
      'Revoking authorities...'
    );
  } else if (
    ctx.revokeMintAfterCreate
  ) {
    showWalletConfirmPopup(
      'Revoking mint authority...'
    );
  } else if (
    ctx.revokeFreezeAfterCreate
  ) {
    showWalletConfirmPopup(
      'Revoking freeze authority...'
    );
  } else {
    showActionPopup(
      'Revoking authorities...',
      'No revoke actions selected. Skipping...',
      {
        showStopButton: false,
        state: 'loading',
      }
    );
  }

  await revokeAuthorities({
    network:
      ctx.network,

    walletProvider:
      ctx.writeWallet,

    walletAddress:
      ctx.writeWalletAddress,

    mintAddress:
      umiResult.mintAddress,

    revokeMintAuthority:
      ctx.revokeMintAfterCreate,

    revokeFreezeAuthority:
      ctx.revokeFreezeAfterCreate,
  });

  progressStatus.innerHTML =
    'Done';
  showActionPopup(
    'Done',
    'Token created successfully.',
    {
      showStopButton: false,
      state: 'success',
    }
  );
  hideActionPopup(
    POPUP_READ_MS
  );

  console.log(
    'Umi result:',
    umiResult
  );

  const tokenStatus =
    document.getElementById(
      'tokenStatus'
    ) as HTMLDivElement | null;

  if (tokenStatus) {
    const explorerUrl =
      getExplorerTokenUrl(
        ctx.network,
        umiResult.mintAddress
      );

    tokenStatus.innerHTML = `
      <strong>
        Umi token created
      </strong>

      <br><br>

      <strong>
        Active mint:
      </strong><br>
      <a
        href="${explorerUrl}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${umiResult.mintAddress}
      </a>

      <br><br>

      <strong>
        Metadata:
      </strong><br>
      ${uploadedMetadata.metadataUrl}
    `;
  }

  await setActiveMint(
    umiResult.mintAddress,
    {
      reloadInfo: true,
    }
  );

  console.log(
    'On-chain metadata creation is temporarily disabled.'
  );

  console.log(
    'Metadata URI ready:',
    uploadedMetadata.metadataUrl
  );

  clearAllPendingVanityState();
}

function showVanityWalletConfirmFailedPopup() {
  clearWalletConfirmTimeout();
  vanityFoundAwaitingContinue =
    false;
  actionPopupTryAgainButton.textContent =
    'Try again';
  showActionPopup(
    'Wallet confirmation failed',
    'Wallet confirmation was cancelled or expired.',
    {
      showStopButton: false,
      state: 'error',
    }
  );
  showActionPopupActions(
    true
  );
}

function setActionPopupIndicator(
  state:
    | 'loading'
    | 'success'
    | 'error'
    | 'hidden'
) {
  actionPopupIndicator.className =
    `action-popup-indicator action-popup-indicator--${state}`;
  actionPopupIndicator.setAttribute(
    'aria-hidden',
    state === 'hidden'
      ? 'true'
      : 'false'
  );

  if (state === 'loading') {
    actionPopupIndicator.innerHTML =
      '<span class="action-popup-spinner" role="status" aria-label="Loading"></span>';
    return;
  }

  if (state === 'success') {
    actionPopupIndicator.innerHTML =
      '<span class="action-popup-icon action-popup-icon--success" aria-hidden="true">✓</span>';
    return;
  }

  if (state === 'error') {
    actionPopupIndicator.innerHTML =
      '<span class="action-popup-icon action-popup-icon--error" aria-hidden="true">!</span>';
    return;
  }

  actionPopupIndicator.innerHTML =
    '';
}

function formatActionPopupText(
  text: string,
  _state:
    | 'loading'
    | 'success'
    | 'error'
) {
  return text;
}

function setActionPopupMessage(
  text: string
) {
  actionPopupText.innerHTML =
    formatActionPopupText(
      text,
      'loading'
    );
  setActionPopupIndicator(
    'loading'
  );
}

function shortenMintAddress(
  address: string
): string {
  if (
    address.length <=
    19
  ) {
    return address;
  }

  return `${address.slice(
    0,
    8
  )}...${address.slice(
    -7
  )}`;
}

function hideActionPopupVanityExtras() {
  actionPopupVanityExtras.style.display =
    'none';
  actionPopupCopyAddressFull =
    '';
  actionPopupVanityAddressDisplay.textContent =
    '';
  actionPopupVanityAddressDisplay.title =
    '';
  actionPopupCopyAddressButton.textContent =
    'Copy Address';
}

async function copyTextToClipboard(
  text: string
): Promise<boolean> {
  try {
    if (
      navigator.clipboard
        ?.writeText
    ) {
      await navigator.clipboard.writeText(
        text
      );
      return true;
    }
  } catch {
    // fall through to legacy copy
  }

  try {
    const textarea =
      document.createElement(
        'textarea'
      );
    textarea.value =
      text;
    textarea.setAttribute(
      'readonly',
      'true'
    );
    textarea.style.position =
      'fixed';
    textarea.style.left =
      '-9999px';
    document.body.appendChild(
      textarea
    );
    textarea.select();
    const copied =
      document.execCommand(
        'copy'
      );
    document.body.removeChild(
      textarea
    );
    return copied;
  } catch {
    return false;
  }
}

function showActionPopupVanityAddress(
  mintAddress: string
) {
  actionPopupCopyAddressFull =
    mintAddress;
  actionPopupVanityAddressDisplay.textContent =
    shortenMintAddress(
      mintAddress
    );
  actionPopupVanityAddressDisplay.title =
    mintAddress;
  actionPopupVanityExtras.style.display =
    'block';
}

function showActionPopup(
  title: string,
  text: string,
  options?: {
    showStopButton?: boolean;
    state?:
      | 'loading'
      | 'success'
      | 'error';
  }
) {
  hideActionPopupVanityExtras();

  const state =
    options?.state ??
    'loading';

  vanitySearchPopup.style.display =
    'flex';
  actionPopupTitle.innerHTML =
    title;
  actionPopupText.innerHTML =
    formatActionPopupText(
      text,
      state
    );
  setActionPopupIndicator(
    state
  );
  stopVanitySearchButton.style.display =
    options?.showStopButton
      ? 'inline-flex'
      : 'none';
  showActionPopupActions(
    false
  );
}

function clearActionPopupHideTimeout() {
  if (
    actionPopupHideTimeoutId !==
    null
  ) {
    clearTimeout(
      actionPopupHideTimeoutId
    );
    actionPopupHideTimeoutId =
      null;
  }
}

function startVanitySearchUI() {
  isVanitySearching =
    true;
  vanitySearchAttempts =
    0;
  stopVanitySearch =
    false;
  clearActionPopupHideTimeout();
  showVanitySearchPopup(
    0
  );
}

function endVanitySearchUI() {
  isVanitySearching =
    false;
  clearActionPopupHideTimeout();
}

function ensureVanitySearchPopupVisible() {
  if (
    !isVanitySearching
  ) {
    return;
  }

  if (
    vanitySearchPopup.style
      .display !==
    'flex'
  ) {
    showVanitySearchPopup(
      vanitySearchAttempts
    );
  }
}

function hideActionPopup(
  delayMs = 0,
  options?: {
    force?: boolean;
  }
) {
  const force =
    options?.force ??
    false;

  if (
    isVanitySearching &&
    !force
  ) {
    return;
  }

  const doHide = () => {
    if (
      isVanitySearching &&
      !force
    ) {
      return;
    }

    actionPopupHideTimeoutId =
      null;
    clearWalletConfirmTimeout();
    vanitySearchPopup.style.display =
      'none';
    stopVanitySearchButton.style.display =
      'none';
    showActionPopupActions(
      false
    );
    setActionPopupIndicator(
      'hidden'
    );
    hideActionPopupVanityExtras();
    vanityFoundAwaitingContinue =
      false;
    actionPopupTryAgainButton.textContent =
      'Try again';
  };

  clearActionPopupHideTimeout();

  if (delayMs > 0) {
    actionPopupHideTimeoutId =
      setTimeout(
        doHide,
        delayMs
      );
    return;
  }

  doHide();
}

const POPUP_READ_MS = 2800;

const WALLET_CONFIRM_LINES =
  'Waiting for wallet confirmation...<br><br>Confirm the transaction in your wallet.';

const VANITY_SEARCH_INTRO =
  'This can take time depending on the pattern.';

const VANITY_WALLET_CONFIRM_LINES =
  'Waiting for wallet confirmation...<br><br>Confirm in your wallet to continue.';

function showVanitySearchPopup(
  attempts = 0
) {
  vanitySearchAttempts =
    attempts;

  showActionPopup(
    'Searching vanity mint...',
    `${VANITY_SEARCH_INTRO}<br><br>Attempts: ${attempts}`,
    {
      showStopButton: true,
      state: 'loading',
    }
  );
}

function setVanitySearchAttempts(
  attempts: number
) {
  vanitySearchAttempts =
    attempts;

  ensureVanitySearchPopupVisible();

  actionPopupText.innerHTML =
    formatActionPopupText(
      `${VANITY_SEARCH_INTRO}<br><br>Attempts: ${attempts}`,
      'loading'
    );
  setActionPopupIndicator(
    'loading'
  );
  stopVanitySearchButton.style.display =
    'inline-flex';
}

function showVanityFoundContinuePopup(
  mintAddress: string
) {
  vanityFoundAwaitingContinue =
    true;
  actionPopupTryAgainButton.textContent =
    'Continue Mint';

  showActionPopup(
    'Vanity mint found',
    'Continue when ready.',
    {
      showStopButton: false,
      state: 'success',
    }
  );
  showActionPopupVanityAddress(
    mintAddress
  );
  showActionPopupActions(
    true
  );
}

function showCreateTokenWalletFailedPopup() {
  clearWalletConfirmTimeout();
  showActionPopup(
    'Wallet confirmation failed',
    'Wallet confirmation was cancelled or expired. Your token was not created.',
    {
      showStopButton: false,
      state: 'error',
    }
  );
  hideActionPopup(
    POPUP_READ_MS
  );
}

function showWalletConfirmPopup(
  stepTitle: string
) {
  showActionPopup(
    stepTitle,
    WALLET_CONFIRM_LINES,
    {
      showStopButton: false,
      state: 'loading',
    }
  );
}

function showVanityWalletConfirmPopup(
  stepTitle: string
) {
  showActionPopup(
    stepTitle,
    VANITY_WALLET_CONFIRM_LINES,
    {
      showStopButton: false,
      state: 'loading',
    }
  );
}

function isTransactionExpiredError(
  error: unknown
): boolean {
  const message =
    error instanceof Error
      ? error.message
      : String(error);
  const lower =
    message.toLowerCase();

  return (
    lower.includes(
      'blockhash not found'
    ) ||
    lower.includes(
      'block height exceeded'
    ) ||
    lower.includes(
      'transaction expired'
    ) ||
    (
      lower.includes(
        'expired'
      ) &&
      lower.includes(
        'transaction'
      )
    )
  );
}

function isWalletConfirmationFailure(
  error: unknown
): boolean {
  if (
    isTransactionExpiredError(
      error
    )
  ) {
    return true;
  }

  const message =
    error instanceof Error
      ? error.message
      : String(error);
  const lower =
    message.toLowerCase();

  return (
    lower.includes(
      'wallet confirmation timed out'
    ) ||
    lower.includes(
      'user rejected'
    ) ||
    lower.includes(
      'user declined'
    ) ||
    lower.includes(
      'rejected the request'
    ) ||
    lower.includes(
      'request rejected'
    ) ||
    lower.includes(
      'cancelled'
    ) ||
    lower.includes(
      'canceled'
    ) ||
    lower.includes(
      '4001'
    )
  );
}

function terminateVanityWorker() {
  if (vanityWorker) {
    vanityWorker.terminate();

    vanityWorker =
      null;
  }
}

   function stopVanityWorker() {
  terminateVanityWorker();

  stopVanitySearch =
    true;
  endVanitySearchUI();

  if (vanityWorkerReject) {
    vanityWorkerReject(
      new Error(
        'Vanity search stopped by user.'
      )
    );
    vanityWorkerReject =
      null;
  }

  actionPopupText.innerHTML =
    'Search stopped';
  setActionPopupIndicator(
    'error'
  );
  hideActionPopup(
    1800,
    { force: true }
  );
}

stopVanitySearchButton.addEventListener(
  'click',
  () => {
    setActionPopupMessage(
      'Stopping search...'
    );

    stopVanityWorker();
  }
);

actionPopupCopyAddressButton.addEventListener(
  'click',
  async () => {
    if (
      !actionPopupCopyAddressFull
    ) {
      return;
    }

    const copied =
      await copyTextToClipboard(
        actionPopupCopyAddressFull
      );

    actionPopupCopyAddressButton.textContent =
      copied
        ? 'Copied!'
        : 'Copy failed';

    window.setTimeout(
      () => {
        if (
          actionPopupCopyAddressFull
        ) {
          actionPopupCopyAddressButton.textContent =
            'Copy Address';
        }
      },
      1600
    );
  }
);

actionPopupTryAgainButton.addEventListener(
  'click',
  async () => {
    if (
      !beginAction(
        vanityFoundAwaitingContinue
          ? 'continue-vanity-mint'
          : 'create-token-retry'
      )
    ) {
      return;
    }

    vanityFoundAwaitingContinue =
      false;
    actionPopupTryAgainButton.textContent =
      'Try again';

    if (
      !ensureWriteNetworkAllowed()
    ) {
      endAction();
      return;
    }

    let pending =
      pendingVanityTokenCreate;

    if (
      !pending
    ) {
      progressStatus.innerHTML =
        VANITY_SESSION_EXPIRED_MESSAGE;
      showActionPopup(
        'Session expired',
        VANITY_SESSION_EXPIRED_MESSAGE,
        {
          showStopButton: false,
          state: 'error',
        }
      );
      hideActionPopup(
        POPUP_READ_MS
      );
      endAction();
      return;
    }

    if (
      !validatePendingVanityNetwork(
        pending
      )
    ) {
      endAction();
      return;
    }

    const walletSession =
      await resolveConnectedWallet(
        'create-token-retry'
      );

    if (
      !walletSession
    ) {
      showActionPopup(
        'Wallet required',
        'Connect your wallet before retrying.',
        {
          showStopButton: false,
          state: 'error',
        }
      );
      hideActionPopup(
        POPUP_READ_MS
      );
      endAction();
      return;
    }

    pending.writeWallet =
      walletSession.provider;
    pending.writeWalletAddress =
      walletSession.address;

    showActionPopupActions(
      false
    );
    progressStatus.innerHTML =
      'Retrying token creation...';

    try {
      await executePendingVanityMintFlow(
        pending
      );
    } catch (error) {
      console.error(error);

      if (
        isWalletConfirmationFailure(
          error
        )
      ) {
        showVanityWalletConfirmFailedPopup();
        progressStatus.innerHTML =
          'Wallet confirmation failed. Try again or cancel.';
        return;
      }

      clearPendingVanityTokenCreate();
      progressStatus.innerHTML =
        'Token creation failed';
      showActionPopup(
        'Failed',
        'Token creation failed. Check your wallet and try again.',
        {
          showStopButton: false,
          state: 'error',
        }
      );
      hideActionPopup(
        POPUP_READ_MS
      );
    } finally {
      endAction();
    }
  }
);

actionPopupCancelButton.addEventListener(
  'click',
  () => {
    if (
      vanityFoundAwaitingContinue
    ) {
      vanityFoundAwaitingContinue =
        false;
      clearAllPendingVanityState();
      progressStatus.innerHTML =
        'Vanity mint cancelled.';
    } else {
      progressStatus.innerHTML =
        'Token creation cancelled. You can continue the pending vanity mint when ready.';
      renderPendingVanityMintUI();
    }

    clearWalletConfirmTimeout();
    hideActionPopup();
    endAction();
  }
);

lowSolUnderstandButton.addEventListener(
  'click',
  () => {
    resolveLowSolBalanceModal(
      false
    );
  }
);

lowSolCancelButton.addEventListener(
  'click',
  () => {
    progressStatus.innerHTML =
      'Token creation cancelled.';
    resolveLowSolBalanceModal(
      false
    );
  }
);

const continuePendingVanityMintButton =
  document.getElementById(
    'continuePendingVanityMint'
  ) as HTMLButtonElement;

const deletePendingVanityMintButton =
  document.getElementById(
    'deletePendingVanityMint'
  ) as HTMLButtonElement;

continuePendingVanityMintButton.addEventListener(
  'click',
  () => {
    void continueStoredPendingVanityMint();
  }
);

deletePendingVanityMintButton.addEventListener(
  'click',
  () => {
    clearAllPendingVanityState();
    progressStatus.innerHTML =
      'Pending vanity mint deleted.';
  }
);

if (
  purgeLegacyPendingVanityMintStorage()
) {
  progressStatus.innerHTML =
    VANITY_SESSION_EXPIRED_MESSAGE;
}

renderPendingVanityMintUI();

const tokenForm =
  document.getElementById('tokenForm') as HTMLFormElement;

const createTokenButton =
  document.getElementById(
    'createTokenButton'
  ) as HTMLButtonElement;

const tokenNameInput =
  document.getElementById(
    'tokenName'
  ) as HTMLInputElement;

const tokenSymbolInput =
  document.getElementById(
    'tokenSymbol'
  ) as HTMLInputElement;

const impersonationConfirmInput =
  document.getElementById(
    'impersonationConfirm'
  ) as HTMLInputElement;

const knownTokenWarningBox =
  document.getElementById(
    'knownTokenWarning'
  ) as HTMLDivElement;

const KNOWN_TOKEN_PROJECTS = [
  {
    name: 'Bonk',
    symbols: ['BONK'],
  },
  {
    name: 'USD Coin',
    symbols: ['USDC'],
  },
  {
    name: 'Tether',
    symbols: ['USDT'],
  },
  {
    name: 'Solana',
    symbols: ['SOL'],
  },
  {
    name: 'Jupiter',
    symbols: ['JUP', 'JLP'],
  },
  {
    name: 'Raydium',
    symbols: ['RAY'],
  },
  {
    name: 'dogwifhat',
    symbols: ['WIF'],
  },
  {
    name: 'Orca',
    symbols: ['ORCA'],
  },
  {
    name: 'Pyth Network',
    symbols: ['PYTH'],
  },
  {
    name: 'Jito',
    symbols: ['JTO'],
  },
  {
    name: 'Render',
    symbols: ['RENDER', 'RNDR'],
  },
  {
    name: 'Marinade Staked SOL',
    symbols: ['MSOL'],
  },
  {
    name: 'Mango',
    symbols: ['MNGO'],
  },
  {
    name: 'Samoyedcoin',
    symbols: ['SAMO'],
  },
  {
    name: 'Popcat',
    symbols: ['POPCAT'],
  },
  {
    name: 'cat in a dogs world',
    symbols: ['MEW'],
  },
  {
    name: 'BOOK OF MEME',
    symbols: ['BOME'],
  },
  {
    name: 'Wen',
    symbols: ['WEN'],
  },
] as const;

function findKnownTokenMatch(
  name: string,
  symbol: string
): {
  project: (typeof KNOWN_TOKEN_PROJECTS)[number];
  reason: 'name' | 'symbol';
} | null {
  const normalizedSymbol =
    symbol.trim().toUpperCase();
  const normalizedName =
    name.trim().toLowerCase();

  for (const project of KNOWN_TOKEN_PROJECTS) {
    if (
      normalizedSymbol &&
      project.symbols.includes(
        normalizedSymbol as never
      )
    ) {
      return {
        project,
        reason: 'symbol',
      };
    }

    const projectName =
      project.name.toLowerCase();

    if (
      normalizedName &&
      (
        normalizedName ===
          projectName ||
        normalizedName.includes(
          projectName
        )
      )
    ) {
      return {
        project,
        reason: 'name',
      };
    }
  }

  return null;
}

function renderKnownTokenWarning(
  match: ReturnType<
    typeof findKnownTokenMatch
  >
) {
  if (!match) {
    knownTokenWarningBox.style.display =
      'none';
    knownTokenWarningBox.innerHTML =
      '';
    return;
  }

  const reasonText =
    match.reason === 'symbol'
      ? `symbol "${tokenSymbolInput.value.trim().toUpperCase()}"`
      : `name "${tokenNameInput.value.trim()}"`;

  knownTokenWarningBox.style.display =
    'block';
  knownTokenWarningBox.innerHTML = `
    <strong>Known project warning</strong>
    <br><br>
    This token ${reasonText} matches the well-known project
    <strong>${match.project.name}</strong>
    (${match.project.symbols.join(', ')}).
    <br><br>
    Creating a look-alike token may mislead users. Verify the official mint address before buying or sharing any token.
  `;
}

function updateCreateTokenButtonState() {
  const match =
    findKnownTokenMatch(
      tokenNameInput.value,
      tokenSymbolInput.value
    );

  renderKnownTokenWarning(
    match
  );

  createTokenButton.disabled =
    !impersonationConfirmInput.checked;
}

tokenNameInput.addEventListener(
  'input',
  updateCreateTokenButtonState
);
tokenSymbolInput.addEventListener(
  'input',
  updateCreateTokenButtonState
);
impersonationConfirmInput.addEventListener(
  'change',
  updateCreateTokenButtonState
);
updateCreateTokenButtonState();

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

const manageMetadataStatus =
  document.getElementById(
    'manageMetadataStatus'
  ) as HTMLDivElement;

const updateMetadataMutabilityStatus =
  document.getElementById(
    'updateMetadataMutabilityStatus'
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
  lockMetadataConfirm.addEventListener(
    'change',
    () => {
      updateActionButtonStates();
    }
  );
}

const manageMintAddressInput =
  document.getElementById(
    'manageMintAddress'
  ) as HTMLInputElement;

const updateMintAddressInput =
  document.getElementById(
    'updateMintAddress'
  ) as HTMLInputElement;

let activeMintAddress = '';
let pendingAction: string | null = null;

type MetadataMutabilityState =
  | 'idle'
  | 'loading'
  | 'editable'
  | 'locked'
  | 'error';

let metadataMutabilityState:
  MetadataMutabilityState =
  'idle';

function renderMetadataStatusMarkup(): string {
  switch (
    metadataMutabilityState
  ) {
    case 'loading':
      return 'Checking metadata status...';
    case 'editable':
      return '<strong>Metadata status:</strong> Editable';
    case 'locked':
      return `
        <strong>Metadata status:</strong> Locked permanently
        <br><br>
        Logo, description, socials and tags can no longer be changed.
      `;
    case 'error':
      return 'Could not load metadata status. Check the mint address.';
    default:
      return 'Metadata status will appear here';
  }
}

function updateMetadataStatusDisplays() {
  const markup =
    renderMetadataStatusMarkup();
  const className =
    metadataMutabilityState ===
    'locked'
      ? 'wallet-box metadata-status-box metadata-status-locked'
      : metadataMutabilityState ===
          'editable'
        ? 'wallet-box metadata-status-box metadata-status-editable'
        : 'wallet-box metadata-status-box';

  manageMetadataStatus.className =
    className;
  manageMetadataStatus.innerHTML =
    markup;
  updateMetadataMutabilityStatus.className =
    className;
  updateMetadataMutabilityStatus.innerHTML =
    markup;
}

function resetMetadataMutabilityState() {
  metadataMutabilityState =
    'idle';
  updateMetadataStatusDisplays();
}

function isValidMintAddress(
  address: string
): boolean {
  const trimmed =
    address.trim();

  if (
    trimmed.length < 32
  ) {
    return false;
  }

  try {
    new PublicKey(trimmed);
    return true;
  } catch {
    return false;
  }
}

function logActionState(
  action: string
) {
  console.log(
    '[action]',
    action
  );
  console.log(
    '[state] active mint:',
    activeMintAddress || '(none)'
  );
  console.log(
    '[state] connected wallet:',
    connectedWalletAddress || '(none)'
  );
}

function showUserError(
  message: string
) {
  alert(message);
}

function clearStaleWalletConnection() {
  connectedWallet =
    null;
  connectedWalletAddress =
    '';
  connectButton.textContent =
    'Connect Wallet';
  walletBox.innerHTML =
    'No wallet connected';
}

function logSelectedWalletDebug(
  provider: WalletProvider,
  address: string,
  phase: string
) {
  const detectedWallet =
    getDetectedWallet(
      getSelectedWalletId()
    );
  const debugInfo =
    getWalletPublicKeyDebugInfo(
      provider
    );

  logWalletDebug(
    phase,
    {
      selectedWalletProviderName:
        detectedWallet?.name ??
        'Unknown wallet',
      providerSource:
        detectedWallet?.source ??
        'unknown',
      rawPublicKeyType:
        debugInfo.rawPublicKeyType,
      normalizedPublicKey:
        debugInfo.normalizedPublicKey,
      connectedWalletAddressUsed:
        address,
    }
  );
}

async function resolveWalletAddressFromProvider(
  provider: WalletProvider,
  options?: {
    onlyIfTrusted?: boolean;
    forceReconnect?: boolean;
  }
): Promise<string> {
  let address =
    readWalletPublicKey(
      provider
    );

  if (
    connectedWalletAddress &&
    address &&
    connectedWalletAddress !==
      address
  ) {
    logWalletDebug(
      'clearing stale wallet address before reconnect',
      {
        storedAddress:
          connectedWalletAddress,
        providerAddress:
          address,
      }
    );
    clearStaleWalletConnection();
    address =
      null;
  }

  if (
    !address ||
    options?.forceReconnect
  ) {
    try {
      address =
        await connectAndNormalizeWalletPublicKey(
          provider,
          {
            onlyIfTrusted:
              options?.onlyIfTrusted,
          }
        );
    } catch (error) {
      console.error(
        error
      );
      showUserError(
        WALLET_PUBLIC_KEY_READ_ERROR
      );
      throw error;
    }
  }

  return address;
}

function showWalletSigningUnsupported() {
  showUserError(
    WALLET_UNSUPPORTED_SIGNING_MESSAGE
  );
  showActionPopup(
    'Unsupported wallet',
    WALLET_UNSUPPORTED_SIGNING_MESSAGE,
    {
      showStopButton: false,
      state: 'error',
    }
  );
  hideActionPopup(
    POPUP_READ_MS
  );
}

function ensureWalletSupportsTokenCreation(
  provider: WalletProvider
): boolean {
  if (
    !walletSupportsTokenCreation(
      provider
    )
  ) {
    showWalletSigningUnsupported();
    return false;
  }

  return true;
}

function getSelectedWalletId(): string {
  return (
    walletSelect.value ||
    selectedWalletId ||
    localStorage.getItem(
      'preferredWallet'
    ) ||
    ''
  );
}

type WalletSigningSupport = {
  signTransaction: boolean;
  signAndSendTransaction: boolean;
  signAllTransactions: boolean;
};

function getWalletSigningSupport(
  provider: WalletProvider
): WalletSigningSupport {
  return {
    signTransaction:
      typeof provider.signTransaction ===
      'function',
    signAndSendTransaction:
      typeof provider.signAndSendTransaction ===
      'function',
    signAllTransactions:
      typeof provider.signAllTransactions ===
      'function',
  };
}

function renderWalletTestStatusRow(
  label: string,
  ok: boolean
): string {
  return `
    <li class="${
      ok
        ? 'wallet-test-ok'
        : 'wallet-test-missing'
    }">
      <span>${label}</span>
      <strong>${
        ok
          ? 'Yes'
          : 'No'
      }</strong>
    </li>
  `;
}

function renderWalletCompatibilityResults(
  options: {
    walletName: string;
    network: SolanaNetwork;
    connected: boolean;
    address?: string;
    balanceSol?: number;
    balanceFetched: boolean;
    signing: WalletSigningSupport;
    compatible: boolean;
    walletStandardSupport: boolean;
    solanaProviderDetected: boolean;
    publicKeyDetected: boolean;
    errorMessage?: string;
  }
): string {
  const {
    walletName,
    network,
    connected,
    address,
    balanceSol,
    balanceFetched,
    signing,
    compatible,
    walletStandardSupport,
    solanaProviderDetected,
    publicKeyDetected,
    errorMessage,
  } = options;

  const verdictClass =
    compatible
      ? 'wallet-test-verdict-compatible'
      : 'wallet-test-verdict-incompatible';

  const verdictLabel =
    compatible
      ? 'Compatible for token creation'
      : 'Connection works but token creation may fail';

  const signingDetected =
    signing.signTransaction ||
    signing.signAndSendTransaction ||
    signing.signAllTransactions;

  return `
    <strong>Wallet compatibility test</strong>
    <p class="wallet-test-meta">
      Network: ${network}
    </p>

    ${
      errorMessage
        ? `<p class="wallet-test-error">${errorMessage}</p>`
        : ''
    }

    <p class="wallet-test-section-title">
      Wallet detection
    </p>
    <ul class="wallet-test-list">
      <li class="wallet-test-value">
        <span>Wallet name</span>
        <strong>${walletName}</strong>
      </li>
      ${renderWalletTestStatusRow(
        'Wallet Standard support detected',
        walletStandardSupport
      )}
      ${renderWalletTestStatusRow(
        'Solana provider detected',
        solanaProviderDetected
      )}
      ${renderWalletTestStatusRow(
        'Public key detected',
        publicKeyDetected
      )}
    </ul>

    <p class="wallet-test-section-title">
      Connection checks
    </p>
    <ul class="wallet-test-list">
      ${renderWalletTestStatusRow(
        'Wallet connected',
        connected
      )}
      ${renderWalletTestStatusRow(
        'Balance detected',
        balanceFetched
      )}
      ${renderWalletTestStatusRow(
        'Signing support detected',
        signingDetected
      )}
    </ul>

    <p class="wallet-test-section-title">
      Signing methods
    </p>
    <ul class="wallet-test-list">
      ${renderWalletTestStatusRow(
        'signTransaction',
        signing.signTransaction
      )}
      ${renderWalletTestStatusRow(
        'signAndSendTransaction',
        signing.signAndSendTransaction
      )}
      ${renderWalletTestStatusRow(
        'signAllTransactions',
        signing.signAllTransactions
      )}
    </ul>

    ${
      address
        ? `<p class="wallet-test-detail"><strong>Address:</strong><br>${address}</p>`
        : ''
    }

    ${
      balanceFetched &&
      balanceSol !==
        undefined
        ? `<p class="wallet-test-detail"><strong>Balance:</strong> ${balanceSol.toFixed(4)} SOL</p>`
        : ''
    }

    <p class="wallet-test-verdict ${verdictClass}">
      ${verdictLabel}
    </p>
  `;
}

async function runWalletCompatibilityTest() {
  if (
    !isDevelopment ||
    !walletTestResults ||
    !testWalletButton
  ) {
    return;
  }

  walletTestResults.style.display =
    'block';
  walletTestResults.innerHTML =
    'Testing wallet...';
  testWalletButton.disabled =
    true;

  selectedWalletId =
    getSelectedWalletId();

  const network =
    getSelectedNetwork();
  const detectedWallet =
    getDetectedWallet(
      selectedWalletId
    );
  const walletName =
    detectedWallet?.name ??
    'Unknown wallet';
  const provider =
    getWalletProvider(
      selectedWalletId
    );

  if (
    !provider ||
    typeof provider.connect !==
      'function'
  ) {
    walletTestResults.innerHTML =
      renderWalletCompatibilityResults(
        {
          walletName,
          network,
          connected: false,
          balanceFetched: false,
          signing: {
            signTransaction:
              false,
            signAndSendTransaction:
              false,
            signAllTransactions:
              false,
          },
          compatible: false,
          walletStandardSupport:
            detectedWallet?.source ===
            'wallet-standard',
          solanaProviderDetected:
            false,
          publicKeyDetected:
            false,
          errorMessage:
            'Wallet not found. Select an installed Solana wallet and try again.',
        }
      );
    testWalletButton.disabled =
      false;
    return;
  }

  try {
    const address =
      await resolveWalletAddressFromProvider(
        provider
      );

    connectedWallet =
      provider;
    connectedWalletAddress =
      address;

    walletBox.innerHTML = `
      <strong>Connected wallet:</strong>
      <br><br>
      ${connectedWalletAddress}
    `;

    connectButton.textContent =
      'Wallet Connected';

    logSelectedWalletDebug(
      provider,
      address,
      'runWalletCompatibilityTest'
    );

    const connection =
      new Connection(
        getRpc(network),
        'confirmed'
      );

    const balance =
      await connection.getBalance(
        new PublicKey(
          address
        )
      );

    const signing =
      getWalletSigningSupport(
        provider
      );
    const compatible =
      walletSupportsTokenCreation(
        provider
      );
    const publicKeyDetected =
      Boolean(
        address
      );

    walletTestResults.innerHTML =
      renderWalletCompatibilityResults(
        {
          walletName,
          network,
          connected: true,
          address,
          balanceSol:
            balance /
            LAMPORTS_PER_SOL,
          balanceFetched: true,
          signing,
          compatible,
          walletStandardSupport:
            detectedWallet?.source ===
            'wallet-standard',
          solanaProviderDetected:
            true,
          publicKeyDetected,
        }
      );
  } catch (error) {
    console.error(error);

    const signing =
      getWalletSigningSupport(
        provider
      );

    walletTestResults.innerHTML =
      renderWalletCompatibilityResults(
        {
          walletName,
          network,
          connected:
            Boolean(
              connectedWalletAddress
            ),
          address:
            connectedWalletAddress ||
            undefined,
          balanceFetched: false,
          signing,
          compatible:
            walletSupportsTokenCreation(
              provider
            ),
          walletStandardSupport:
            detectedWallet?.source ===
            'wallet-standard',
          solanaProviderDetected:
            true,
          publicKeyDetected:
            Boolean(
              connectedWalletAddress
            ),
          errorMessage:
            error instanceof
            Error
              ? error.message
              : 'Wallet test failed.',
        }
      );
  } finally {
    testWalletButton.disabled =
      false;
  }
}

async function resolveConnectedWallet(
  action: string
): Promise<{
  provider: WalletProvider;
  address: string;
} | null> {
  logActionState(action);

  selectedWalletId =
    getSelectedWalletId();

  const provider =
    getWalletProvider(
      selectedWalletId
    );

  if (
    !provider ||
    typeof provider.connect !==
      'function'
  ) {
    showUserError(
      'Wallet not found. Connect your wallet and try again.'
    );
    return null;
  }

  if (
    !ensureWalletSupportsTokenCreation(
      provider
    )
  ) {
    return null;
  }

  let address =
    readWalletPublicKey(
      provider
    );

  if (
    !address ||
    (
      connectedWalletAddress &&
      connectedWallet !==
        provider
    )
  ) {
    try {
      address =
        await resolveWalletAddressFromProvider(
          provider
        );
    } catch {
      return null;
    }
  } else if (
    connectedWalletAddress &&
    address &&
    connectedWalletAddress !==
      address
  ) {
    try {
      address =
        await resolveWalletAddressFromProvider(
          provider,
          {
            forceReconnect:
              true,
          }
        );
    } catch {
      return null;
    }
  }

  connectedWallet =
    provider;
  connectedWalletAddress =
    address;
  selectedWalletId =
    getSelectedWalletId();

  localStorage.setItem(
    'preferredWallet',
    selectedWalletId
  );
  localStorage.setItem(
    'walletConnected',
    'true'
  );

  walletBox.innerHTML = `
    <strong>Connected wallet:</strong>
    <br><br>
    ${connectedWalletAddress}
  `;

  connectButton.textContent =
    'Wallet Connected';

  logSelectedWalletDebug(
    provider,
    address,
    'resolveConnectedWallet'
  );

  console.log(
    '[state] connected wallet (fresh):',
    connectedWalletAddress
  );

  return {
    provider,
    address,
  };
}

function syncMintAddressFields(
  mintAddress: string
) {
  manageMintAddressInput.value =
    mintAddress;
  updateMintAddressInput.value =
    mintAddress;
}

function renderTokenInfoBox(
  tokenInfo: Awaited<
    ReturnType<
      typeof getTokenInfo
    >
  >,
  mintAddress: string,
  network: SolanaNetwork
) {
  const explorerUrl =
    getExplorerTokenUrl(
      network,
      mintAddress
    );

  tokenInfoBox.innerHTML = `
    <strong>Active mint:</strong><br>
    <a
      href="${explorerUrl}"
      target="_blank"
      rel="noopener noreferrer"
    >
      ${mintAddress}
    </a>

    <br><br>

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
}

async function refreshActiveTokenInfo(
  mintAddress?: string
) {
  const mint =
    (mintAddress ||
      activeMintAddress).trim();

  if (
    !isValidMintAddress(mint)
  ) {
    return;
  }

  metadataMutabilityState =
    'loading';
  updateMetadataStatusDisplays();
  updateActionButtonStates();

  try {
    const selectedNetwork =
      getSelectedNetwork();

    const tokenInfo =
      await getTokenInfo(
        mint,
        selectedNetwork
      );

    renderTokenInfoBox(
      tokenInfo,
      mint,
      selectedNetwork
    );

    console.log(
      '[state] mint authority:',
      tokenInfo.mintAuthority
        ?? 'Revoked'
    );
    console.log(
      '[state] freeze authority:',
      tokenInfo.freezeAuthority
        ?? 'Revoked'
    );

    try {
      const metadata =
        await fetchTokenMetadataJson(
          mint,
          selectedNetwork
        );

      metadataMutabilityState =
        metadata.isMutable
          ? 'editable'
          : 'locked';

      console.log(
        '[state] update authority:',
        metadata.updateAuthority
          ?? 'Unknown'
      );
      console.log(
        '[state] metadata uri:',
        metadata.onChainUri
      );
      console.log(
        '[state] metadata mutable:',
        metadata.isMutable
      );
    } catch (metadataError) {
      metadataMutabilityState =
        'error';
      console.warn(
        '[state] metadata refresh skipped:',
        metadataError
      );
    }
  } catch {
    tokenInfoBox.innerHTML =
      'Token not found. Check the mint address.';
    metadataMutabilityState =
      'error';
  }

  updateMetadataStatusDisplays();
  updateActionButtonStates();
}

async function setActiveMint(
  mintAddress: string,
  options?: {
    reloadInfo?: boolean;
  }
) {
  const trimmed =
    mintAddress.trim();

  activeMintAddress =
    trimmed;
  syncMintAddressFields(
    trimmed
  );

  console.log(
    '[state] active mint set:',
    activeMintAddress || '(cleared)'
  );

  updateActionButtonStates();

  if (
    options?.reloadInfo &&
    isValidMintAddress(trimmed)
  ) {
    await refreshActiveTokenInfo(
      trimmed
    );
  } else if (
    !isValidMintAddress(trimmed)
  ) {
    tokenInfoBox.innerHTML =
      trimmed.length > 0
        ? 'Enter a valid mint address.'
        : 'Token info will appear here';
    resetMetadataMutabilityState();
  }
}

function getMintForAction(
  source:
    | 'manage'
    | 'update'
    | 'lock'
): string | null {
  const mint =
    source === 'update'
      ? updateMintAddressInput.value.trim()
      : manageMintAddressInput.value.trim();

  if (
    !isValidMintAddress(
      mint
    )
  ) {
    showUserError(
      'Enter a valid mint address before continuing.'
    );
    return null;
  }

  if (
    mint !==
    activeMintAddress
  ) {
    setActiveMint(mint);
  }

  return mint;
}

function beginAction(
  action: string
): boolean {
  if (pendingAction) {
    showUserError(
      `Another action is already in progress (${pendingAction}). Wait for it to finish.`
    );
    return false;
  }

  pendingAction =
    action;
  updateActionButtonStates();
  logActionState(action);
  return true;
}

function endAction() {
  pendingAction =
    null;
  updateActionButtonStates();
}

function updateActionButtonStates() {
  const manageMint =
    manageMintAddressInput.value.trim();
  const updateMint =
    updateMintAddressInput.value.trim();
  const busy =
    pendingAction !== null;
  const lockConfirmed =
    lockMetadataConfirm?.checked ??
    false;
  const metadataLocked =
    metadataMutabilityState ===
    'locked';

  manageTokenButton.disabled =
    !isValidMintAddress(
      manageMint
    ) || busy;
  updateMetadataButton.disabled =
    !isValidMintAddress(
      updateMint
    ) ||
    busy ||
    metadataLocked;
  lockMetadataButton.disabled =
    !isValidMintAddress(
      manageMint
    ) ||
    busy ||
    !lockConfirmed ||
    metadataLocked;
}

function bindMintAddressInputs() {
  const handleMintAddressInput =
    (
      source:
        | 'manage'
        | 'update'
    ) =>
    async () => {
      const editedValue =
        source === 'manage'
          ? manageMintAddressInput.value.trim()
          : updateMintAddressInput.value.trim();

      if (
        !editedValue
      ) {
        activeMintAddress =
          '';
        tokenInfoBox.innerHTML =
          'Token info will appear here';
        resetMetadataMutabilityState();
        updateActionButtonStates();
        return;
      }

      activeMintAddress =
        editedValue;
      updateActionButtonStates();

      if (
        isValidMintAddress(
          editedValue
        )
      ) {
        await refreshActiveTokenInfo(
          editedValue
        );
      } else {
        tokenInfoBox.innerHTML =
          'Enter a valid mint address.';
        resetMetadataMutabilityState();
      }
    };

  manageMintAddressInput.addEventListener(
    'input',
    handleMintAddressInput(
      'manage'
    )
  );
  updateMintAddressInput.addEventListener(
    'input',
    handleMintAddressInput(
      'update'
    )
  );
}

bindMintAddressInputs();
updateActionButtonStates();
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
    selectedWalletId =
      getSelectedWalletId();

    const provider =
      getWalletProvider(
        selectedWalletId
      );

    if (
      !provider ||
      typeof provider.connect !==
        'function'
    ) {
      alert('Wallet not found');
      return;
    }

    if (
      !ensureWalletSupportsTokenCreation(
        provider
      )
    ) {
      return;
    }

    const address =
      await resolveWalletAddressFromProvider(
        provider
      );

    connectedWallet =
      provider;

    connectedWalletAddress =
      address;
      localStorage.setItem(
  'preferredWallet',
  selectedWalletId
);

localStorage.setItem(
  'walletConnected',
  'true'
);
    logSelectedWalletDebug(
      provider,
      address,
      'connectWallet'
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

walletSelect.addEventListener(
  'change',
  () => {
    const nextWalletId =
      walletSelect.value;

    if (
      nextWalletId !==
      selectedWalletId
    ) {
      clearStaleWalletConnection();
    }

    selectedWalletId =
      nextWalletId;
  }
);

testWalletButton?.addEventListener(
  'click',
  () => {
    void runWalletCompatibilityTest();
  }
);

copyDonationAddressButton.addEventListener(
  'click',
  async () => {
    const copied =
      await copyTextToClipboard(
        DONATION_WALLET_ADDRESS
      );

    copyDonationAddressButton.textContent =
      copied
        ? 'Copied'
        : 'Failed';

    window.setTimeout(
      () => {
        copyDonationAddressButton.textContent =
          'Copy address';
      },
      1600
    );
  }
);

function findVanityMintWithWorker() {
  return new Promise<{
    address: string;
    secretKey: number[];
    attempts: number;
  }>((resolve, reject) => {
    vanityWorkerReject =
      reject;
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
          setVanitySearchAttempts(
            data.attempts
          );
        }

        if (data.type === 'found') {
          terminateVanityWorker();
          endVanitySearchUI();
          stopVanitySearchButton.style.display =
            'none';
          vanityWorkerReject =
            null;

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
          terminateVanityWorker();
          stopVanitySearch =
            true;
          endVanitySearchUI();
          vanityWorkerReject =
            null;

          reject(
            new Error(
              'Vanity mint not found.'
            )
          );
        }
      };

    vanityWorker.onerror =
      () => {
        terminateVanityWorker();
        stopVanitySearch =
          true;
        endVanitySearchUI();
        vanityWorkerReject =
          null;

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

  if (
    !impersonationConfirmInput.checked
  ) {
    showUserError(
      'Confirm that this token does not impersonate an existing project before creating.'
    );
    return;
  }

  const tokenName =
    tokenNameInput.value;
  const symbol =
    tokenSymbolInput.value;

  const tokenDescription =
    (
      document.getElementById(
        'tokenDescription'
      ) as HTMLTextAreaElement
    ).value;

  const tokenTags =
    getSelectedTokenTags();

  const decimals =
    Number(
      (
        document.getElementById(
          'tokenDecimals'
        ) as HTMLInputElement
      ).value
    );

  const tokenWebsite =
    (
      document.getElementById(
        'tokenWebsite'
      ) as HTMLInputElement
    ).value;

  const tokenTelegram =
    (
      document.getElementById(
        'tokenTelegram'
      ) as HTMLInputElement
    ).value;

  const tokenDiscord =
    (
      document.getElementById(
        'tokenDiscord'
      ) as HTMLInputElement
    ).value;

  const tokenTwitter =
    (
      document.getElementById(
        'tokenTwitter'
      ) as HTMLInputElement
    ).value;

  const tokenFacebook =
    (
      document.getElementById(
        'tokenFacebook'
      ) as HTMLInputElement
    ).value;

  const supply =
    Number(
      (
        document.getElementById(
          'tokenSupply'
        ) as HTMLInputElement
      ).value
    );

  const tokenLogoFile =
    tokenLogoInput?.files?.[0];

  if (!tokenLogoFile) {
    showUserError(
      'Please select a token logo before creating.'
    );
    showActionPopup(
      'Logo required',
      'Please select a token logo before creating.',
      {
        showStopButton: false,
        state: 'error',
      }
    );
    hideActionPopup(POPUP_READ_MS);
    return;
  }

  if (
    !ensureWriteNetworkAllowed()
  ) {
    return;
  }

  const knownMatch =
    findKnownTokenMatch(
      tokenName,
      symbol
    );

  if (knownMatch) {
    showActionPopup(
      'Known project match',
      `This token matches <strong>${knownMatch.project.name}</strong> (${knownMatch.project.symbols.join(', ')}). Make sure you are not impersonating an existing project.`,
      {
        showStopButton: false,
        state: 'error',
      }
    );
  }

  if (
    !beginAction(
      'create-token'
    )
  ) {
    return;
  }

  try {
    const selectedNetwork =
      getSelectedNetwork();

    const walletSession =
      await resolveConnectedWallet(
        'create-token'
      );

    if (!walletSession) {
      showActionPopup(
        'Wallet required',
        'Connect your wallet before creating a token.',
        {
          showStopButton: false,
          state: 'error',
        }
      );
      hideActionPopup(POPUP_READ_MS);
      return;
    }

    const writeWallet =
      walletSession.provider;
    const writeWalletAddress =
      walletSession.address;

    const metadataInput: CreateTokenMetadataInput =
      {
        tokenName,
        symbol,
        tokenDescription,
        tokenTags,
        tokenWebsite,
        tokenTelegram,
        tokenDiscord,
        tokenTwitter,
        tokenFacebook,
      };

    const vanityPattern =
      (
        document.getElementById(
          'vanityMintPattern'
        ) as HTMLInputElement
      ).value.trim();

    const usedVanitySearch =
      vanityPattern.length > 0;

    const revokeMintAfterCreate =
      (
        document.getElementById(
          'revokeMintAuthority'
        ) as HTMLInputElement
      ).checked;
    const revokeFreezeAfterCreate =
      (
        document.getElementById(
          'revokeFreezeAuthority'
        ) as HTMLInputElement
      ).checked;

    const finishContext: TokenCreateFinishContext =
      {
        network:
          selectedNetwork,
        writeWallet,
        writeWalletAddress,
        metadataInput,
        decimals,
        supply,
        revokeMintAfterCreate,
        revokeFreezeAfterCreate,
      };

    if (usedVanitySearch) {
      progressStatus.innerHTML =
        'Searching vanity mint...';

      startVanitySearchUI();

      const vanityMintResult =
        await findVanityMintWithWorker();

      console.log(
        'Worker vanity result:',
        vanityMintResult
      );

      pendingVanityTokenCreate =
        {
          ...finishContext,
          vanity: {
            address:
              vanityMintResult.address,
            secretKey:
              vanityMintResult.secretKey,
            attempts:
              vanityMintResult.attempts,
          },
          tokenName,
          symbol,
          vanityFields: {
            pattern:
              vanityPattern,
            endPattern:
              (
                document.getElementById(
                  'vanityMintEndPattern'
                ) as HTMLInputElement
              ).value.trim(),
            position:
              (
                document.getElementById(
                  'vanityMintPosition'
                ) as HTMLSelectElement
              ).value,
            ignoreCase:
              (
                document.getElementById(
                  'vanityIgnoreCase'
                ) as HTMLInputElement
              ).checked,
            maxAttempts:
              Number(
                (
                  document.getElementById(
                    'vanityMaxAttempts'
                  ) as HTMLInputElement
                ).value
              ),
          },
        };

      console.log(
        '[vanity] pending mint kept in memory:',
        pendingVanityTokenCreate
          .vanity.address
      );

      renderPendingVanityMintUI();

      showVanityFoundContinuePopup(
        vanityMintResult.address
      );
      progressStatus.innerHTML =
        'Vanity mint found. Click Continue Mint when ready.';
      return;
    }

    if (
      !(await ensureWalletBalanceForTokenCreation(
        selectedNetwork,
        writeWalletAddress
      ))
    ) {
      return;
    }

    const uploadedMetadata =
      await uploadCreateTokenMetadata(
        metadataInput,
        tokenLogoFile
      );

    showWalletConfirmPopup(
      'Creating token...'
    );

    let umiResult;

    try {
      umiResult =
        await withWalletConfirmTimeout(
          () =>
            createUmiToken({
              network:
                selectedNetwork,

              walletProvider:
                writeWallet,

              metadataUri:
                uploadedMetadata.metadataUrl,

              tokenName,
              symbol,
              decimals,
              supply,

              vanityPattern:
                (
                  document.getElementById(
                    'vanityMintPattern'
                  ) as HTMLInputElement
                ).value,

              vanityEndPattern:
                (
                  document.getElementById(
                    'vanityMintEndPattern'
                  ) as HTMLInputElement
                ).value,

              vanityPosition:
                (
                  document.getElementById(
                    'vanityMintPosition'
                  ) as HTMLSelectElement
                ).value as any,

              vanityIgnoreCase:
                (
                  document.getElementById(
                    'vanityIgnoreCase'
                  ) as HTMLInputElement
                ).checked,

              vanityMaxAttempts:
                Number(
                  (
                    document.getElementById(
                      'vanityMaxAttempts'
                    ) as HTMLInputElement
                  ).value
                ),

              shouldStop:
                () =>
                  stopVanitySearch,
            })
        );
    } catch (createError) {
      if (
        isWalletConfirmationFailure(
          createError
        )
      ) {
        showCreateTokenWalletFailedPopup();
        progressStatus.innerHTML =
          'Wallet confirmation failed. You can try creating again.';
        return;
      }

      throw createError;
    }

    await finishTokenCreationAfterUmi(
      umiResult,
      finishContext,
      uploadedMetadata
    );
} catch (error) {
  console.error(error);
  progressStatus.innerHTML =
    'Token creation failed';

  if (stopVanitySearch) {
    return;
  }

  if (
    pendingVanityTokenCreate &&
    isWalletConfirmationFailure(
      error
    )
  ) {
    showVanityWalletConfirmFailedPopup();
    progressStatus.innerHTML =
      'Wallet confirmation failed. Try again or cancel.';
    renderPendingVanityMintUI();
    return;
  }

  const expired =
    isTransactionExpiredError(
      error
    );
  const vanityNotFound =
    error instanceof Error &&
    error.message.includes(
      'Vanity mint not found'
    );

  let title =
    'Failed';
  let message =
    'Token creation failed. Check your wallet and try again.';

  if (expired) {
    title =
      'Transaction expired';
    message =
      'Transaction expired. Please try again and confirm faster.';
  } else if (vanityNotFound) {
    title =
      'Vanity mint not found';
    message =
      'No vanity mint matched your pattern within the max attempts. Try a shorter pattern or increase max attempts.';
  }

  showActionPopup(
    title,
    message,
    {
      showStopButton: false,
      state: 'error',
    }
  );
  hideActionPopup(
    POPUP_READ_MS,
    { force: true }
  );
  clearPendingVanityTokenCreate();
  renderPendingVanityMintUI();
} finally {
  endAction();
}
});
manageTokenButton.addEventListener(
  'click',
  async () => {
    if (
      !beginAction(
        'revoke-authorities'
      )
    ) {
      return;
    }

    try {
      if (
        !ensureWriteNetworkAllowed()
      ) {
        endAction();
        return;
      }

      console.log(
        'Apply Token Tools clicked'
      );

      const selectedNetwork =
        getSelectedNetwork();

      const walletSession =
        await resolveConnectedWallet(
          'revoke-authorities'
        );

      if (!walletSession) {
        showActionPopup(
          'Wallet required',
          'Connect your wallet before revoking authorities.',
          {
            showStopButton: false,
            state: 'error',
          }
        );
        hideActionPopup(POPUP_READ_MS);
        return;
      }

      const mintAddress =
        getMintForAction(
          'manage'
        );

      if (!mintAddress) {
        hideActionPopup();
        return;
      }

      showActionPopup(
        'Applying token tools...',
        'Preparing authority updates...',
        {
          showStopButton: false,
          state: 'loading',
        }
      );

      const tokenInfo =
        await getTokenInfo(
          mintAddress,
          selectedNetwork
        );

      renderTokenInfoBox(
        tokenInfo,
        mintAddress,
        selectedNetwork
      );

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
      showWalletConfirmPopup(
        'Revoking authorities...'
      );
    } else if (shouldRevokeMint) {
      showWalletConfirmPopup(
        'Revoking mint authority...'
      );
    } else if (shouldRevokeFreeze) {
      showWalletConfirmPopup(
        'Revoking freeze authority...'
      );
    } else {
      showActionPopup(
        'No revoke actions needed',
        'Selected authorities are already revoked.',
        {
          showStopButton: false,
          state: 'success',
        }
      );
      manageTokenStatus.innerHTML =
        feedbackMessages.join('<br>') || 'No revoke actions selected.';
      hideActionPopup(POPUP_READ_MS);
      return;
    }

    await revokeAuthorities({
      network:
        selectedNetwork,

      walletProvider:
        walletSession.provider,

      walletAddress:
        walletSession.address,

      mintAddress:
        mintAddress,

      revokeMintAuthority:
        shouldRevokeMint,

      revokeFreezeAuthority:
        shouldRevokeFreeze,
    });

    feedbackMessages.push('Authority update successful.');
    const revokeExplorerUrl =
      getExplorerTokenUrl(
        selectedNetwork,
        mintAddress
      );
    manageTokenStatus.innerHTML = `
      ${feedbackMessages.join('<br>')}
      <br><br>
      <strong>View on Explorer:</strong><br>
      <a
        href="${revokeExplorerUrl}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${mintAddress}
      </a>
    `;
    await setActiveMint(
      mintAddress,
      {
        reloadInfo: true,
      }
    );
    showActionPopup(
      'Success',
      'Authority updates completed.',
      {
        showStopButton: false,
        state: 'success',
      }
    );
    hideActionPopup(POPUP_READ_MS);
    } catch (error) {
      console.error(error);
      manageTokenStatus.innerHTML =
        'Authority update failed.';
      showActionPopup(
        'Failed',
        'Authority update failed. Check your wallet and mint address.',
        {
          showStopButton: false,
          state: 'error',
        }
      );
      hideActionPopup(POPUP_READ_MS);
    } finally {
      endAction();
    }
  }
);

updateMetadataButton.addEventListener(
  'click',
  async () => {
    if (
      !beginAction(
        'update-metadata'
      )
    ) {
      return;
    }

    try {
      if (
        !ensureWriteNetworkAllowed()
      ) {
        endAction();
        return;
      }

      const selectedNetwork =
        getSelectedNetwork();

      showActionPopup(
        'Updating metadata...',
        'Preparing metadata update...',
        {
          showStopButton: false,
          state: 'loading',
        }
      );

      const walletSession =
        await resolveConnectedWallet(
          'update-metadata'
        );

      if (!walletSession) {
        showActionPopup(
          'Wallet required',
          'Connect your wallet before updating metadata.',
          {
            showStopButton: false,
            state: 'error',
          }
        );
        hideActionPopup(POPUP_READ_MS);
        return;
      }

      const mintAddress =
        getMintForAction(
          'update'
        );

      if (!mintAddress) {
        hideActionPopup();
        return;
      }

      if (
        metadataMutabilityState ===
        'locked'
      ) {
        updateMetadataStatus.innerHTML =
          'This token\'s metadata is locked permanently. Logo, description, socials and tags can no longer be changed.';
        showActionPopup(
          'Metadata locked',
          'This token\'s metadata is locked permanently and cannot be updated.',
          {
            showStopButton: false,
            state: 'error',
          }
        );
        hideActionPopup(POPUP_READ_MS);
        return;
      }
      
      const currentMetadata =
        await fetchTokenMetadataJson(
          mintAddress,
          selectedNetwork
        );

      console.log(
        'Current metadata:',
        currentMetadata
      );

      if (
        !currentMetadata.isMutable
      ) {
        updateMetadataStatus.innerHTML =
          'This token\'s metadata is locked permanently. Logo, description, socials and tags can no longer be changed.';
        showActionPopup(
          'Metadata locked',
          'This token\'s metadata is locked permanently and cannot be updated.',
          {
            showStopButton: false,
            state: 'error',
          }
        );
        hideActionPopup(POPUP_READ_MS);
        return;
      }

      const connectedWallet =
        walletSession.address;
      const updateAuthority =
        currentMetadata.updateAuthority;

      console.log(
        '[update-metadata] connected wallet:',
        connectedWallet
      );
      console.log(
        '[update-metadata] update authority:',
        updateAuthority
          ?? 'None'
      );

      if (
        !updateAuthority ||
        connectedWallet !==
          updateAuthority
      ) {
        updateMetadataStatus.innerHTML = `
          Connected wallet is not the update authority for this token. Switch to the update authority wallet before updating metadata.<br><br>
          <strong>Connected wallet:</strong><br>
          ${connectedWallet}<br><br>
          <strong>Update authority:</strong><br>
          ${updateAuthority ?? 'None (metadata cannot be updated)'}
        `;
        showActionPopup(
          'Wrong wallet',
          `Connected wallet is not the update authority for this token. Switch to the update authority wallet before updating metadata.<br><br><strong>Connected wallet:</strong><br>${connectedWallet}<br><br><strong>Update authority:</strong><br>${updateAuthority ?? 'None'}`,
          {
            showStopButton: false,
            state: 'error',
          }
        );
        hideActionPopup(POPUP_READ_MS);
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
     
        const updateFacebook =
  (document.getElementById('updateFacebook') as HTMLInputElement).value;

  const updateLogo =
  (document.getElementById('updateLogo') as HTMLInputElement).files?.[0];

      updateMetadataStatus.innerHTML =
        'Uploading new metadata...';

      let updatedImageUrl = '';

      if (updateLogo) {
        showActionPopup(
          'Uploading logo...',
          'Uploading your logo to IPFS...',
          {
            showStopButton: false,
            state: 'loading',
          }
        );

        const uploadedLogo =
          await uploadFileToPinata(
            updateLogo
          );

        updatedImageUrl =
          uploadedLogo.imageUrl;
      }

      showActionPopup(
        'Uploading metadata...',
        'Uploading updated metadata to IPFS...',
        {
          showStopButton: false,
          state: 'loading',
        }
      );

      const updateTags =
        getSelectedUpdateTokenTags();
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
      updateTags[0] ||
      currentMetadata.json.category ||
      '',

    tags:
      updateTags.length > 0
        ? updateTags
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

showWalletConfirmPopup(
  'Updating token metadata...'
);

await updateTokenMetadata({
  network:
    selectedNetwork,

  walletProvider:
    walletSession.provider,

  mintAddress:
    mintAddress,

  metadataUri:
    uploadedMetadata.metadataUrl,
});

updateMetadataStatus.innerHTML = `
  Metadata uploaded.<br><br>
  ${uploadedMetadata.metadataUrl}
  <br><br>
  <strong>View on Explorer:</strong><br>
  <a
    href="${getExplorerTokenUrl(selectedNetwork, mintAddress)}"
    target="_blank"
    rel="noopener noreferrer"
  >
    ${mintAddress}
  </a>
`;
await setActiveMint(
  mintAddress,
  {
    reloadInfo: true,
  }
);
showActionPopup(
  'Success',
  'Metadata updated successfully.',
  {
    showStopButton: false,
    state: 'success',
  }
);
hideActionPopup(POPUP_READ_MS);
    } catch (error) {
      console.error(error);

      updateMetadataStatus.innerHTML =
        'Metadata update failed';
      showActionPopup(
        'Failed',
        'Metadata update failed.',
        {
          showStopButton: false,
          state: 'error',
        }
      );
      hideActionPopup(POPUP_READ_MS);
    } finally {
      endAction();
    }
  }
);
 lockMetadataButton.addEventListener(
  'click',
  async () => {
    if (
      !beginAction(
        'lock-metadata'
      )
    ) {
      return;
    }

    try {
      if (
        !ensureWriteNetworkAllowed()
      ) {
        endAction();
        return;
      }

      const selectedNetwork =
        getSelectedNetwork();

      const walletSession =
        await resolveConnectedWallet(
          'lock-metadata'
        );

      if (!walletSession) {
        showActionPopup(
          'Wallet required',
          'Connect your wallet before locking metadata.',
          {
            showStopButton: false,
            state: 'error',
          }
        );
        hideActionPopup(POPUP_READ_MS);
        return;
      }

      const mintAddress =
        getMintForAction(
          'lock'
        );

      if (!mintAddress) {
        return;
      }

      if (
        metadataMutabilityState ===
        'locked'
      ) {
        manageTokenStatus.innerHTML =
          'Metadata is already locked permanently. No further action is needed.';
        showActionPopup(
          'Metadata already locked',
          'This token\'s metadata is already locked permanently.',
          {
            showStopButton: false,
            state: 'error',
          }
        );
        hideActionPopup(POPUP_READ_MS);
        return;
      }

      const confirmed =
        confirm(
          'WARNING: This permanently locks metadata updates. Continue?'
        );

      if (!confirmed) {
        return;
      }

      showWalletConfirmPopup(
        'Locking metadata permanently...'
      );

      await lockTokenMetadata(
        walletSession.provider,
        mintAddress,
        selectedNetwork
      );

      updateMetadataStatus.innerHTML = `
        Metadata permanently locked.
        <br><br>
        <strong>View on Explorer:</strong><br>
        <a
          href="${getExplorerTokenUrl(selectedNetwork, mintAddress)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${mintAddress}
        </a>
      `;
      await setActiveMint(
        mintAddress,
        {
          reloadInfo: true,
        }
      );
      showActionPopup(
        'Metadata locked permanently',
        'Metadata is now permanently locked.',
        {
          showStopButton: false,
          state: 'success',
        }
      );
      hideActionPopup(POPUP_READ_MS);
    } catch (error) {
      console.error(error);

      updateMetadataStatus.innerHTML =
        'Metadata lock failed.';
      showActionPopup(
        'Metadata lock failed',
        'Metadata lock failed.',
        {
          showStopButton: false,
          state: 'error',
        }
      );
      hideActionPopup(POPUP_READ_MS);
    } finally {
      endAction();
    }
  }
);

window.addEventListener(
  'load',
  async () => {
    refreshWalletSelector();

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
      const available =
        detectAvailableWallets();

      const walletMatch =
        available.find(
          (
            wallet
          ) =>
            wallet.id ===
            preferredWallet
        );

      if (
        !walletMatch
      ) {
        return;
      }

      selectedWalletId =
        walletMatch.id;
      walletSelect.value =
        selectedWalletId;

      const provider =
        walletMatch.provider;

      if (
        !provider.connect
      ) {
        return;
      }

      clearStaleWalletConnection();

      const address =
        await resolveWalletAddressFromProvider(
          provider,
          {
            onlyIfTrusted:
              true,
          }
        );

      connectedWallet =
        provider;

      connectedWalletAddress =
        address;

      localStorage.setItem(
        'preferredWallet',
        selectedWalletId
      );
      localStorage.setItem(
        'walletConnected',
        'true'
      );

      walletBox.innerHTML = `
        <strong>Connected wallet:</strong>
        <br><br>
        ${connectedWalletAddress}
      `;

      connectButton.textContent =
        'Wallet Connected';

      logSelectedWalletDebug(
        provider,
        address,
        'autoReconnectWallet'
      );

      console.log(
        'Auto reconnected wallet:',
        connectedWalletAddress
      );
    } catch (error) {
      clearStaleWalletConnection();
      localStorage.removeItem(
        'walletConnected'
      );
      console.log(
        'Auto reconnect skipped.'
      );
    }
  }
);