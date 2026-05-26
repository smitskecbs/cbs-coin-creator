import {
  generateSigner,
} from '@metaplex-foundation/umi';

type VanityPosition =
  | 'prefix'
  | 'suffix'
  | 'contains'
  | 'both'
  | 'bothEnds';

type FindVanityMintParams = {
  umi: any;
  pattern: string;
  endPattern?: string;
  position: VanityPosition;
  ignoreCase: boolean;
  maxAttempts?: number;
  shouldStop?: () => boolean;
};

function matchesVanity(
  address: string,
  pattern: string,
  endPattern: string,
  position: VanityPosition,
  ignoreCase: boolean
) {
  const checkedAddress =
    ignoreCase
      ? address.toLowerCase()
      : address;

  const checkedPattern =
    ignoreCase
      ? pattern.toLowerCase()
      : pattern;

  const checkedEndPattern =
    ignoreCase
      ? endPattern.toLowerCase()
      : endPattern;

  if (position === 'prefix') {
    return checkedAddress.startsWith(
      checkedPattern
    );
  }

  if (position === 'suffix') {
    return checkedAddress.endsWith(
      checkedPattern
    );
  }

  if (position === 'contains') {
    return checkedAddress.includes(
      checkedPattern
    );
  }

  if (position === 'both') {
    return (
      checkedAddress.startsWith(
        checkedPattern
      ) ||
      checkedAddress.endsWith(
        checkedPattern
      )
    );
  }

  if (position === 'bothEnds') {
    return (
      checkedAddress.startsWith(
        checkedPattern
      ) &&
      checkedAddress.endsWith(
        checkedEndPattern
      )
    );
  }

  return false;
}

export async function findVanityMint(
  params: FindVanityMintParams
) {
  const maxAttempts =
    params.maxAttempts ?? 100000;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt += 1
  ) {
    if (
  params.shouldStop?.()
) {
  throw new Error(
    'Vanity search stopped by user.'
  );
}
    const mint =
      generateSigner(
        params.umi
      );

    const address =
      mint.publicKey.toString();
     
      if (attempt % 1000 === 0) {
  console.log(
    'Vanity attempts:',
    attempt
  );
}

    if (
      matchesVanity(
        address,
        params.pattern,
        params.endPattern ?? '',
        params.position,
        params.ignoreCase
      )
    ) {
      return {
        mint,
        attempts:
          attempt,
        address,
      };
    }
  }

  throw new Error(
    'Vanity mint not found within max attempts.'
  );
}