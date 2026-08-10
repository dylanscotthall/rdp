import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { requireAdmin } from "@/app/lib/auth";
import { NextResponse } from "next/server";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") ?? "photos/web/";

  const command = new ListObjectsV2Command({
    Bucket: process.env.R2_BUCKET_NAME!,
    Prefix: folder,
  });

  const response = await client.send(command);

  const files = (response.Contents ?? [])
    .map((obj) => obj.Key!)
    .filter((key) => !key.endsWith("/"))
    .map((key) => `${process.env.NEXT_R2_PUBLIC_URL}/${key}`);

  return NextResponse.json({ files });
}
