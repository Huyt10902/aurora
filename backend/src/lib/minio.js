import { createHash, createHmac, randomUUID } from "crypto";
import { readFile } from "fs/promises";

const DEFAULT_REGION = "us-east-1";

let bucketReadyPromise;

const getConfig = () => {
  const endpoint =
    process.env.STORAGE_ENDPOINT ||
    process.env.MINIO_ENDPOINT ||
    "http://localhost:9000";
  const accessKey =
    process.env.STORAGE_ACCESS_KEY ||
    process.env.MINIO_ACCESS_KEY ||
    "minioadmin";
  const secretKey =
    process.env.STORAGE_SECRET_KEY ||
    process.env.MINIO_SECRET_KEY ||
    "minioadmin";
  const bucket = process.env.STORAGE_BUCKET || process.env.MINIO_BUCKET || "aurora";
  const region =
    process.env.STORAGE_REGION ||
    process.env.MINIO_REGION ||
    DEFAULT_REGION;
  const publicUrl =
    process.env.STORAGE_PUBLIC_URL ||
    process.env.MINIO_PUBLIC_URL ||
    endpoint;
  const provider =
    process.env.STORAGE_PROVIDER ||
    (endpoint.includes("supabase.co") ? "supabase" : "minio");

  return {
    accessKey,
    bucket,
    ensureBucket:
      process.env.STORAGE_ENSURE_BUCKET !== "false" &&
      process.env.MINIO_ENSURE_BUCKET !== "false",
    endpoint: endpoint.replace(/\/+$/g, ""),
    provider,
    publicRead:
      (process.env.STORAGE_PUBLIC_READ ?? process.env.MINIO_PUBLIC_READ) !==
      "false",
    publicUrl: publicUrl.replace(/\/+$/g, ""),
    region,
    secretKey,
  };
};

const readUploadBuffer = async (file) => {
  if (file.data?.length) {
    return Buffer.from(file.data);
  }

  if (file.tempFilePath) {
    return await readFile(file.tempFilePath);
  }

  throw new Error("Uploaded file data is empty");
};

const getAppResourceType = (mimeType = "") => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("video/")) return "video";
  return "other";
};

const sanitizeFileName = (name = "upload") =>
  name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_.]/g, "")
    .replace(/^-+|-+$/g, "") || "upload";

const createObjectKey = (folder, fileName) => {
  const safeFolder = String(folder || "media")
    .split("/")
    .map((part) => sanitizeFileName(part))
    .filter(Boolean)
    .join("/");
  return `${safeFolder}/${Date.now()}-${randomUUID()}-${sanitizeFileName(fileName)}`;
};

const encodePath = (...parts) =>
  `/${parts
    .flatMap((part) => String(part).split("/"))
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/")}`;

const joinPath = (...parts) => {
  const normalized = parts
    .map((part) => String(part || "").replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
  return `/${normalized}`;
};

const hashHex = (value) => createHash("sha256").update(value).digest("hex");

const hmac = (key, value, encoding) =>
  createHmac("sha256", key).update(value).digest(encoding);

const getSigningKey = ({ dateStamp, region, secretKey }) => {
  const dateKey = hmac(`AWS4${secretKey}`, dateStamp);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, "s3");
  return hmac(serviceKey, "aws4_request");
};

const getAmzDate = () => {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return { amzDate, dateStamp: amzDate.slice(0, 8) };
};

const signedFetch = async ({
  body = Buffer.alloc(0),
  contentType,
  method,
  path,
  query = "",
}) => {
  const config = getConfig();
  const url = new URL(config.endpoint);
  const signedPath = joinPath(url.pathname, path);
  url.pathname = signedPath;
  url.search = query;

  const payloadHash = hashHex(body);
  const { amzDate, dateStamp } = getAmzDate();
  const headers = {
    host: url.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };

  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map((key) => `${key}:${headers[key]}\n`)
    .join("");
  const canonicalRequest = [
    method,
    signedPath,
    query ? query.replace(/^\?/, "") : "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hashHex(canonicalRequest),
  ].join("\n");
  const signature = hmac(
    getSigningKey({ dateStamp, region: config.region, secretKey: config.secretKey }),
    stringToSign,
    "hex",
  );

  const requestHeaders = {
    ...headers,
    Authorization: `AWS4-HMAC-SHA256 Credential=${config.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
  if (contentType) {
    requestHeaders["content-type"] = contentType;
  }

  return await fetch(url, {
    body: method === "HEAD" ? undefined : body,
    headers: requestHeaders,
    method,
  });
};

const putBucketPolicy = async (bucket) => {
  const policy = JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  });

  const response = await signedFetch({
    body: Buffer.from(policy),
    contentType: "application/json",
    method: "PUT",
    path: encodePath(bucket),
    query: "policy=",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cannot set MinIO public policy: ${text || response.status}`);
  }
};

const ensureBucket = async () => {
  const { bucket, ensureBucket: shouldEnsureBucket, publicRead } = getConfig();

  if (!shouldEnsureBucket) return;

  const headResponse = await signedFetch({
    method: "HEAD",
    path: encodePath(bucket),
  });

  if (headResponse.status === 404) {
    const createResponse = await signedFetch({
      method: "PUT",
      path: encodePath(bucket),
    });

    if (!createResponse.ok) {
      const text = await createResponse.text();
      throw new Error(`Cannot create MinIO bucket: ${text || createResponse.status}`);
    }
  } else if (!headResponse.ok) {
    const text = await headResponse.text();
    throw new Error(`Cannot access MinIO bucket: ${text || headResponse.status}`);
  }

  if (publicRead) {
    await putBucketPolicy(bucket);
  }
};

const ensureBucketOnce = async () => {
  if (!bucketReadyPromise) {
    bucketReadyPromise = ensureBucket();
  }

  return await bucketReadyPromise;
};

export const uploadToStorage = async (file, folder) => {
  try {
    const config = getConfig();
    const fileBuffer = await readUploadBuffer(file);
    const key = createObjectKey(folder, file.name);

    await ensureBucketOnce();

    const response = await signedFetch({
      body: fileBuffer,
      contentType: file.mimetype || "application/octet-stream",
      method: "PUT",
      path: encodePath(config.bucket, key),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `MinIO upload failed with ${response.status}`);
    }

    return {
      provider: config.provider,
      publicId: `${config.bucket}/${key}`,
      resourceType: getAppResourceType(file.mimetype),
      url: `${config.publicUrl}/${encodeURIComponent(config.bucket)}/${key
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`,
      metadata: {
        bucket: config.bucket,
        endpoint: config.endpoint,
        key,
      },
    };
  } catch (error) {
    console.error("Error uploading to MinIO:", error);
    const uploadError = new Error(
      `Error uploading file to storage: ${error.message}`,
    );
    uploadError.status = 502;
    throw uploadError;
  }
};

export const deleteFromStorage = async ({ publicId }) => {
  try {
    const config = getConfig();
    const [, ...keyParts] = String(publicId || "").split("/");
    const key = keyParts.join("/");
    if (!key) return false;

    const response = await signedFetch({
      method: "DELETE",
      path: encodePath(config.bucket, key),
    });

    return response.ok || response.status === 404;
  } catch (error) {
    console.error("Error deleting from MinIO:", error);
    return false;
  }
};
