import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import PortfolioCard from "@/components/PortfolioCard"
import Link from "next/link"

export default async function Home() {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return <div>{error.message}</div>
  }

  return (
    <main>
      {/* top page */}
      <div className="bg-[#2C2C2A] px-6 py-12 flex flex-col items-center text-center gap-3">
        <h1 className="text-[20px] font-medium text-[#F1EFE8]">ค้นพบผลงานจากทุกสาย</h1>
        <p className="text-[13px] text-[#B4B2A9] max-w-md">รวมพอร์ตโฟลิโอจาก designer, developer, photographer และอีกมากมาย</p>
        <div className="flex gap-3 mt-2">
          <Link href="/browse">
            <Button className="text-[12px] bg-[#534AB7] text-[#EEEDFE] px-5 py-2 rounded-lg hover:bg-[#3C3489] transition">Browse portfolios</Button>
          </Link>
          <Button className="text-[12px] text-[#B4B2A9] border border-[#5F5E5A] px-5 py-2 rounded-lg hover:border-[#B4B2A9] transition">Upload yours</Button>
        </div>
      </div>

      {/* feutured port page */}
      <div>
        <p className="font-bold text-[12px] text-[#2C2C2A] my-2 px-6">Featured this week</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6">

          {data?.map((item) => (
            <PortfolioCard
              key={item.id}
              id={item.id}
              title={item.title}
              pdf_url={item.pdf_url}
              cover_url={item.cover_url}   // 🔥 เพิ่มบรรทัดนี้
            />
          ))}

        </div>
      </div>
    </main>
  )
}
