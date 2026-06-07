import createServerClient from "@/lib/supabaseServer";

export default async function sitemap() {
  const supabase = await createServerClient();

  const { data } = await supabase.from("portfolios").select("id, updated_at");

  const portfolios =
    data?.map((p) => ({
      url: `https://porthubth.com/portfolio/${p.id}`,
      lastModified: p.updated_at ?? new Date(), // ← fallback ถ้า null
      changeFrequency: "weekly" as const, // ← บอก Google ว่าอัปเดตบ่อยแค่ไหน
      priority: 0.8, // ← 0-1, home=1.0, portfolio=0.8
    })) ?? [];

  return [
    {
      url: "https://porthubth.com",
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: "https://porthubth.com/browse",
      lastModified: new Date(),
      changeFrequency: "hourly" as const, // ← browse อัปเดตบ่อยเพราะมีพอร์ตใหม่
      priority: 0.9,
    },
    ...portfolios,
  ];
}
