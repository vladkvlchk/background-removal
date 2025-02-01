import { NextRequest, NextResponse } from "next/server";

import { fal } from "@fal-ai/client";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file: File | null = formData.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "File is not found" }, { status: 400 });
    }

    fal.config({ credentials: process.env.FAL_AI_KEY });
    const url = await fal.storage.upload(file);

    return NextResponse.json({ url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
