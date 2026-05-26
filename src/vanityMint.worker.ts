import {
  generateSigner,
  createSignerFromKeypair,
} from '@metaplex-foundation/umi';

import {
  createUmi,
} from '@metaplex-foundation/umi-bundle-defaults';

type VanityPosition =
  | 'prefix'
  | 'suffix'
  | 'contains'
  | 'both'
  | 'bothEnds';

function matches(
  address: string,
  pattern: string,
  endPattern: string,
  position: VanityPosition,
  ignoreCase: boolean
) {
  const a =
    ignoreCase ? address.toLowerCase() : address;

  const p =
    ignoreCase ? pattern.toLowerCase() : pattern;

  const e =
    ignoreCase ? endPattern.toLowerCase() : endPattern;

  if (position === 'prefix') return a.startsWith(p);
  if (position === 'suffix') return a.endsWith(p);
  if (position === 'contains') return a.includes(p);
  if (position === 'both') return a.startsWith(p) || a.endsWith(p);
  if (position === 'bothEnds') return a.startsWith(p) && a.endsWith(e);

  return false;
}

self.onmessage = async (event) => {
  const {
    pattern,
    endPattern,
    position,
    ignoreCase,
    maxAttempts,
  } = event.data;

  const umi =
    createUmi(
      'https://api.devnet.solana.com'
    );

  let attempts = 0;

  while (
    maxAttempts === 0 ||
    attempts < maxAttempts
  ) {
    attempts += 1;

    const mint =
      generateSigner(
        umi
      );

    const address =
      mint.publicKey.toString();

    if (attempts % 1000 === 0) {
      self.postMessage({
        type: 'progress',
        attempts,
      });
    }

    if (
      matches(
        address,
        pattern,
        endPattern || '',
        position,
        ignoreCase
      )
    ) {
      self.postMessage({
        type: 'found',
        attempts,
        address,
        secretKey:
          Array.from(
            mint.secretKey
          ),
      });

      return;
    }
  }

  self.postMessage({
    type: 'notFound',
    attempts,
  });
};