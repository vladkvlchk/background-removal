import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export async function POST(req: Request) {
  try {
    fal.config({
      credentials: process.env.FAL_AI_KEY,
    });

    const body = await req.json();

    if (!body?.image_url) throw new Error("Not found 'image_url' field");

    const result = await fal.subscribe("fal-ai/birefnet/v2", {
      input: {
        image_url: body?.image_url
      },
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
