import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     const { image } = await req.json();

//     const response = await fetch("https://api.fal.ai/your-endpoint", {
//       method: "POST",
//       headers: {
//         Authorization: `Key ${process.env.FAL_AI_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         image: image,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to process image with fal.ai");
//     }

//     const result = await response.json();

//     return NextResponse.json({ result: result.image });
//   } catch (error) {
//     console.error("Error processing image:", error);
//     return NextResponse.json(
//       { error: "Failed to process image" },
//       { status: 500 }
//     );
//   }
// }

import { fal } from "@fal-ai/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.image_url) throw new Error("Not found 'image_url' field");

    const result = await fal.subscribe("fal-ai/birefnet/v2", {
      input: {
        image_url: body?.image_url,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    // return NextResponse.json({ result: "ok" });
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
// console.log(result.data);
// console.log(result.requestId);
