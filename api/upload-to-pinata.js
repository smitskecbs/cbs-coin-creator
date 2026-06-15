const ALLOWED_ORIGINS = [
  "https://token-builder.cbs-coin.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

function setCorsHeaders(req, res) {
  const origin =
    req.headers.origin;

  if (
    origin &&
    ALLOWED_ORIGINS.includes(origin)
  ) {
    res.setHeader(
      "Access-Control-Allow-Origin",
      origin
    );
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  console.log(
    "upload-to-pinata request",
    {
      method: req.method,
      origin:
        req.headers.origin ??
        "(none)",
      allowedOrigins:
        ALLOWED_ORIGINS,
    }
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      allowedOrigins:
        ALLOWED_ORIGINS,
    });
  }

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
