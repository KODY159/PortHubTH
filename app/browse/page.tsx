import {Button} from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import PortfolioCard from "@/components/PortfolioCard"

export default async function Browse() {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return <div>{error.message}</div>
  }

  return (
    <div className="p-6">
        <p>Feature this week</p>

      <h1 className="text-2xl font-bold mb-6 text-[#2C2C2A]  border-b border-[#D3D1C7] px-6 py-6">
        Portfolio Feed
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

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
  )
}
