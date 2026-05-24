export async function uploadFileToPinata(
  file: File
) {
  const jwt =
    import.meta.env.VITE_PINATA_JWT;

  if (!jwt) {
    throw new Error(
      'Missing Pinata JWT'
    );
  }

  const formData =
    new FormData();

  formData.append(
    'file',
    file
  );

  const response =
    await fetch(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      {
        method: 'POST',

        headers: {
          Authorization:
            `Bearer ${jwt}`,
        },

        body:
          formData,
      }
    );

  if (!response.ok) {
    throw new Error(
      'Pinata upload failed'
    );
  }

  const data =
    await response.json();

  console.log(
    'Pinata upload result:',
    data
  );

  return {
    ipfsHash:
      data.IpfsHash,

    imageUrl:
      `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  };
}

type TokenMetadata = {
  name: string;

  symbol: string;

  description: string;

  image: string;

  extensions?: {
    website?: string;

    telegram?: string;

    discord?: string;

    twitter?: string;

    facebook?: string;
  };
};

export async function uploadMetadataToPinata(
  metadata: TokenMetadata
) {
  const jwt =
    import.meta.env.VITE_PINATA_JWT;

  if (!jwt) {
    throw new Error(
      'Missing Pinata JWT'
    );
  }

  const metadataJson = {
    name:
      metadata.name,

    symbol:
      metadata.symbol,

    description:
      metadata.description,

    image:
      metadata.image,

    extensions:
      metadata.extensions,
  };

  console.log(
    'Metadata JSON:',
    metadataJson
  );

  const response =
    await fetch(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        method: 'POST',

        headers: {
          Authorization:
            `Bearer ${jwt}`,

          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            pinataContent:
              metadataJson,
          }),
      }
    );

  if (!response.ok) {
    throw new Error(
      'Pinata metadata upload failed'
    );
  }

  const data =
    await response.json();

  console.log(
    'Pinata metadata result:',
    data
  );

  return {
    ipfsHash:
      data.IpfsHash,

    metadataUrl:
      `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  };
}