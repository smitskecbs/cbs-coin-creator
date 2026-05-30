const PINATA_UPLOAD_API =
  'https://cbs-coin-creator.vercel.app/api/upload-to-pinata';

async function uploadFormDataToPinata(
  formData: FormData
): Promise<{
  IpfsHash: string;
}> {
  const response =
    await fetch(
      PINATA_UPLOAD_API,
      {
        method: 'POST',
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

  if (
    !data.IpfsHash
  ) {
    throw new Error(
      'Pinata upload failed'
    );
  }

  return data;
}

export async function uploadFileToPinata(
  file: File
) {
  const formData =
    new FormData();

  formData.append(
    'file',
    file
  );

  const data =
    await uploadFormDataToPinata(
      formData
    );

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

  category?: string;

  tags?: string[];

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
  const metadataJson = {
    name:
      metadata.name,

    symbol:
      metadata.symbol,

    description:
      metadata.description,

    image:
      metadata.image,

    category:
      metadata.category,

    tags:
      metadata.tags,

    extensions:
      metadata.extensions,
  };

  console.log(
    'Metadata JSON:',
    metadataJson
  );

  const metadataFile =
    new File(
      [
        JSON.stringify(
          metadataJson
        ),
      ],
      'metadata.json',
      {
        type:
          'application/json',
      }
    );

  const formData =
    new FormData();

  formData.append(
    'file',
    metadataFile
  );

  const data =
    await uploadFormDataToPinata(
      formData
    );

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
