import { NextRequest, NextResponse } from "next/server";
import { extractReport } from "@/lib/extract";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "no file" }, { status: 400 });
    }
    const kind = file.type.startsWith("image/") ? "image" : "pdf";
    return NextResponse.json(await extractReport(file.name, kind));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "could not read report" },
      { status: 500 }
    );
  }
}
