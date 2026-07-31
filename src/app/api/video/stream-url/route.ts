import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { fileKey } = await req.json();
    if (!fileKey) {
      return NextResponse.json({ error: 'fileKey is required' }, { status: 400 });
    }

    const projectId = process.env.ADMIN_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'skillizee-products';
    const storageBucket = process.env.ADMIN_FIREBASE_STORAGE_BUCKET
      || process.env.FIREBASE_STORAGE_BUCKET
      || `${projectId}.firebasestorage.app`;

    const bucket = storage.bucket(storageBucket);
    const file = bucket.file(fileKey);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    return NextResponse.json({ url });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[stream-url] Error:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to generate video stream URL" }, { status: 500 });
  }
}
