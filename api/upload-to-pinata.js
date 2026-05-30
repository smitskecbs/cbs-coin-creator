export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const pinataJwt = process.env.PINATA_JWT;

    if (!pinataJwt) {
      return res.status(500).json({ error: "Missing PINATA_JWT on server" });
    }

    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const bodyBuffer = Buffer.concat(chunks);

    const pinataResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
        "Content-Type": req.headers["content-type"],
      },
      body: bodyBuffer,
    });

    const data = await pinataResponse.json();

    if (!pinataResponse.ok) {
      return res.status(pinataResponse.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Pinata upload error:", error);
    return res.status(500).json({
      error: "Pinata upload failed",
      details: error.message,
    });
  }
}
