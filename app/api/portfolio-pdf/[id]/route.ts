import { NextResponse } from "next/server";
import createServerClient from "@/lib/supabaseServer";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createServerClient();

  const { data: portfolio, error } = await supabase
    .from("portfolios")
    .select("pdf_path")
    .eq("id", id)
    .single();

  if (error || !portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const { data, error: signError } = await supabase.storage
    .from("portfolios")
    .createSignedUrl(portfolio.pdf_path, 3600);

  if (signError || !data) {
    return NextResponse.json({ error: "Cannot generate URL" }, { status: 500 });
  }

  return NextResponse.json(
    { url: data.signedUrl },
    {
      headers: {
        // cache ใน browser 55 นาที (น้อยกว่า signed URL expiry 60 นาที)
        "Cache-Control": "private, max-age=3300",
      },
    },
  );
}
