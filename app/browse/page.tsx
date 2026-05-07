import createServerClient from "@/lib/supabaseServer";
import BrowseClient from "./BrowseClient";

type SavedItem = { portfolio_id: string };

const PAGE_SIZE = 20;

type SearchParams = {
  search?: string;
  result?: string;
  category?: string;
  page?: string;
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const result = params.result ?? "";
  const category = params.category ?? "";
  const page = Math.max(0, parseInt(params.page ?? "0"));

  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Build query
  let query = supabase
    .from("portfolios")
    .select(
      `
      id, title, description, category, cover_url, pdf_url,
      created_at, faculty, university, apply_year, apply_round, result,
      save_count,
      profiles ( name, avatar_url )
    `,
    )
    .order("save_count", { ascending: false }) // เรียงตาม save_count
    .order("created_at", { ascending: false }) // ถ้า save_count เท่ากัน ใช้ created_at
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  // Server-side filters
  if (result && result !== "ทั้งหมด") {
    query = query.eq("result", result);
  }
  if (category && category !== "ทั้งหมด") {
    query = query.eq("category", category);
  }
  if (search) {
    // Full-text search — ค้นหาใน title, faculty, university
    query = query.or(
      `title.ilike.%${search}%,faculty.ilike.%${search}%,university.ilike.%${search}%`,
    );
  }

  // count total for paginitiation
  let countQuery = supabase
    .from("portfolios")
    .select("*", { count: "exact", head: true });

  if (result && result !== "ทั้งหมด")
    countQuery = countQuery.eq("result", result);
  if (category && category !== "ทั้งหมด")
    countQuery = countQuery.eq("category", category);
  if (search)
    countQuery = countQuery.or(
      `title.ilike.%${search}%,faculty.ilike.%${search}%,university.ilike.%${search}%`,
    );

  // Saved IDs
  const [{ data: portfolios }, { count }, savedRes] = await Promise.all([
    query,
    countQuery,
    session?.user
      ? supabase
          .from("saved_portfolios")
          .select("portfolio_id")
          .eq("user_id", session.user.id)
      : Promise.resolve({ data: [] }),
  ]);

  const savedIds = new Set(
    savedRes.data?.map((s: SavedItem) => s.portfolio_id) ?? [],
  );

  const normalized = (portfolios ?? []).map((p) => ({
    ...p,
    profiles: Array.isArray(p.profiles)
      ? (p.profiles[0] ?? null)
      : (p.profiles ?? null),
  }));

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <BrowseClient
      initialData={normalized}
      savedIds={[...savedIds]}
      currentPage={page}
      totalPages={totalPages}
      currentSearch={search}
      currentResult={result}
      currentCategory={category}
    />
  );
}
