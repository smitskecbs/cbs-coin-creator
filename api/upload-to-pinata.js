const ALLOWED_ORIGINS = [
  "https://token-builder.cbs-coin.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_AUTH_AGE_SECONDS = 300;
const MAX_FUTURE_SKEW_SECONDS = 60;

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/json",
]);

const ALLOWED_REQUEST_HEADERS =
  "content-type, x-wallet-address, x-upload-message, x-upload-signature";

export const config = {
  api: {
    bodyParser: false,
  },
};

function normalizeOrigin(origin) {
  if (typeof origin !== "string") {
    return null;
  }

  const trimmed = origin.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/+$/, "");
}

function isAllowedOrigin(origin) {
  const normalized = normalizeOrigin(origin);

  if (!normalized) {
    return false;
  }

  return ALLOWED_ORIGINS.includes(normalized);
}

function getRequestOrigin(req) {
  const origin = req.headers?.origin;

  return normalizeOrigin(origin);
}

function setCorsHeaders(req, res) {
  const origin = getRequestOrigin(req);

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader(
    "Access-Control-Allow-Headers",
    ALLOWED_REQUEST_HEADERS
  );
  res.setHeader("Access-Control-Max-Age", "86400");
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function handleOptionsPreflight(req, res) {
  setCorsHeaders(req, res);
  res.statusCode = 204;
  res.end();
}

function handleCorsDebugGet(req, res) {
  setCorsHeaders(req, res);

  const origin = getRequestOrigin(req);

  sendJson(res, 200, {
    ok: true,
    allowedOrigins: ALLOWED_ORIGINS,
    receivedOrigin: origin ?? "(none)",
    originAllowed: origin ? isAllowedOrigin(origin) : false,
  });
}

function parseUploadAuthMessage(message) {
  if (typeof message !== "string" || !message.trim()) {
    return { ok: false, reason: "missing message" };
  }

  if (!message.includes("App: CBS Token Builder")) {
    return { ok: false, reason: "invalid app name" };
  }

  if (!message.includes("Purpose: Pinata upload")) {
    return { ok: false, reason: "invalid purpose" };
  }

  const walletMatch = message.match(/^Wallet:\s*(.+)$/m);
  const issuedMatch = message.match(/^Issued at \(unix\):\s*(\d+)$/m);
  const expiresMatch = message.match(/^Expires at \(unix\):\s*(\d+)$/m);

  if (!walletMatch || !issuedMatch || !expiresMatch) {
    return { ok: false, reason: "invalid message format" };
  }

  const walletAddress = walletMatch[1].trim();
  const issuedAt = Number(issuedMatch[1]);
  const expiresAt = Number(expiresMatch[1]);

  if (!Number.isInteger(issuedAt) || !Number.isInteger(expiresAt)) {
    return { ok: false, reason: "invalid timestamp" };
  }

  if (expiresAt <= issuedAt) {
    return { ok: false, reason: "invalid expiry" };
  }

  if (expiresAt - issuedAt > MAX_AUTH_AGE_SECONDS) {
    return { ok: false, reason: "expiry window too long" };
  }

  const now = Math.floor(Date.now() / 1000);

  if (issuedAt > now + MAX_FUTURE_SKEW_SECONDS) {
    return { ok: false, reason: "timestamp too far in future" };
  }

  if (now > expiresAt) {
    return { ok: false, reason: "authorization expired" };
  }

  if (now - issuedAt > MAX_AUTH_AGE_SECONDS) {
    return { ok: false, reason: "authorization too old" };
  }

  return {
    ok: true,
    walletAddress,
    issuedAt,
    expiresAt,
  };
}

function decodeUploadAuthMessageHeader(encodedMessage) {
  if (typeof encodedMessage !== "string") {
    return null;
  }

  try {
    return Buffer.from(encodedMessage, "base64").toString("utf8");
  } catch (error) {
    console.warn("Upload auth message decode failed:", error);
    return null;
  }
}

async function verifyUploadAuthorization(req) {
  const { PublicKey } = await import("@solana/web3.js");
  const bs58Module = await import("bs58");
  const naclModule = await import("tweetnacl");
  const bs58 = bs58Module.default ?? bs58Module;
  const nacl = naclModule.default ?? naclModule;

  const walletAddress = req.headers["x-wallet-address"];
  const encodedMessage = req.headers["x-upload-message"];
  const signature = req.headers["x-upload-signature"];

  if (!walletAddress || !encodedMessage || !signature) {
    return { ok: false, status: 401, error: "Upload authorization required." };
  }

  const message = decodeUploadAuthMessageHeader(encodedMessage);

  if (!message) {
    return { ok: false, status: 401, error: "Invalid upload authorization." };
  }

  let publicKey;

  try {
    publicKey = new PublicKey(walletAddress);
  } catch {
    return { ok: false, status: 401, error: "Invalid wallet address." };
  }

  const parsedMessage = parseUploadAuthMessage(message);

  if (!parsedMessage.ok) {
    console.warn("Upload auth message rejected:", parsedMessage.reason);
    return { ok: false, status: 401, error: "Invalid upload authorization." };
  }

  if (parsedMessage.walletAddress !== walletAddress) {
    return { ok: false, status: 401, error: "Upload authorization wallet mismatch." };
  }

  let signatureBytes;

  try {
    signatureBytes = bs58.decode(signature);
  } catch (error) {
    console.warn("Upload auth signature decode failed:", error);
    return { ok: false, status: 401, error: "Invalid upload signature." };
  }

  const messageBytes = new TextEncoder().encode(message);
  const publicKeyBytes = publicKey.toBytes();
  const valid = nacl.sign.detached.verify(
    messageBytes,
    signatureBytes,
    publicKeyBytes
  );

  if (!valid) {
    return { ok: false, status: 401, error: "Invalid upload signature." };
  }

  return { ok: true };
}

async function readBodyWithLimit(req, maxBytes) {
  const chunks = [];
  let total = 0;

  for await (const chunk of req) {
    total += chunk.length;

    if (total > maxBytes) {
      const error = new Error("BODY_TOO_LARGE");
      error.code = "BODY_TOO_LARGE";
      throw error;
    }

    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

function validateMultipartMime(bodyBuffer) {
  const bodyText = bodyBuffer.toString("latin1");
  const mimeTypes = [];
  const regex = /Content-Type:\s*([^\r\n]+)/gi;
  let match;

  while ((match = regex.exec(bodyText)) !== null) {
    const mime = match[1].trim().toLowerCase().split(";")[0].trim();

    if (mime === "multipart/form-data") {
      continue;
    }

    mimeTypes.push(mime);
  }

  if (mimeTypes.length === 0) {
    return { ok: false, reason: "missing file content type" };
  }

  for (const mime of mimeTypes) {
    if (!ALLOWED_MIME_TYPES.has(mime)) {
      return { ok: false, reason: `disallowed content type: ${mime}` };
    }
  }

  return { ok: true };
}

async function handleUploadPost(req, res) {
  const authResult = await verifyUploadAuthorization(req);

  if (!authResult.ok) {
    sendJson(res, authResult.status, { error: authResult.error });
    return;
  }

  const pinataJwt = process.env.PINATA_JWT;

  if (!pinataJwt) {
    console.error("Missing PINATA_JWT on server");
    sendJson(res, 500, { error: "Upload service unavailable." });
    return;
  }

  const contentType = req.headers["content-type"];

  if (!contentType || !contentType.toLowerCase().startsWith("multipart/form-data")) {
    sendJson(res, 400, { error: "Invalid upload content type." });
    return;
  }

  const bodyBuffer = await readBodyWithLimit(req, MAX_BODY_BYTES);
  const mimeCheck = validateMultipartMime(bodyBuffer);

  if (!mimeCheck.ok) {
    console.warn("Upload MIME rejected:", mimeCheck.reason);
    sendJson(res, 400, { error: "Unsupported upload file type." });
    return;
  }

  const pinataResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
      "Content-Type": contentType,
    },
    body: bodyBuffer,
  });

  const data = await pinataResponse.json();

  if (!pinataResponse.ok) {
    console.error("Pinata upload failed:", {
      status: pinataResponse.status,
      data,
    });
    sendJson(res, 502, { error: "Pinata upload failed." });
    return;
  }

  sendJson(res, 200, {
    IpfsHash: data.IpfsHash,
    PinSize: data.PinSize,
    Timestamp: data.Timestamp,
  });
}

export default async function handler(req, res) {
  const method = req.method ?? "GET";

  try {
    if (method === "OPTIONS") {
      return handleOptionsPreflight(req, res);
    }

    setCorsHeaders(req, res);

    if (method === "GET") {
      return handleCorsDebugGet(req, res);
    }

    if (method !== "POST") {
      return sendJson(res, 405, { error: "Method not allowed" });
    }

    await handleUploadPost(req, res);
  } catch (error) {
    setCorsHeaders(req, res);
    console.error("upload-to-pinata handler error:", error);

    if (error?.code === "BODY_TOO_LARGE") {
      return sendJson(res, 413, { error: "Upload exceeds the 2 MB limit." });
    }

    return sendJson(res, 500, { error: "Pinata upload failed." });
  }
}
