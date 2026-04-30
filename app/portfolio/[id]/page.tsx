import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import { ArrowLeftFromLine, ArrowUpRight } from "lucide-react"
import PortfolioCard from "@/components/PortfolioCard"
import Image from "next/image"

export default async function Page({ params }: any) {
  const { id } = await params
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", id)
    .single()


  // dataset for more feed infocard
  const { data : moreData } = await supabase
    .from("portfolios")
    .select("*")
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(3) 

  //err hendler
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#888780]">
        Portfolio not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">

      {/* Navbar */}
      <nav className="bg-[#2C2C2A] px-6 py-3 flex items-center justify-between">
        <span className="text-[15px] font-medium text-[#F1EFE8]">{data.title}</span>
        <Link
          href="/"
          className="flex items-center gap-1 text-[13px] text-[#B4B2A9] hover:text-[#F1EFE8] transition"
        >
          <ArrowLeftFromLine size={20}></ArrowLeftFromLine> Back to feed
        </Link>
      </nav>

      {/* Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 p-5 max-w-7xl mx-auto w-full">

        {/* PDF viewer */}
        <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-xl overflow-hidden flex flex-col">
          <div className="bg-[#2C2C2A] px-4 py-2 flex items-center justify-between">
            <span className="text-[12px] text-[#B4B2A9]">{data.title}.pdf</span>
            <a
              href={data.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] bg-[#534AB7] text-[#EEEDFE] px-3 py-1 rounded-md hover:bg-[#3C3489] transition"
            >
              Open in new tab <ArrowUpRight size={13} />
            </a>
          </div>
          <iframe
            src={`${data.pdf_url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
            className="w-full flex-1"
            style={{ height: "calc(100vh - 120px)", minHeight: "85vh" }}
          />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">

          {/* Info card */}
          <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {/* user profile */}
              <div className="w-9 h-9 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[12px] font-medium text-[#3C3489] shrink-0">
                {data.title?.charAt(0).toUpperCase()}
              </div>
              <div>
                {/* upload by */}
                <div className="text-[13px] font-medium text-[#2C2C2A]">
                  {data.uploaded_by ?? "Anonymous"}
                </div>
                <div className="text-[11px] text-[#888780]">
                  {new Date(data.created_at).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-[#D3D1C7] pt-3">
              <h1 className="text-[15px] font-medium text-[#2C2C2A] mb-1">
                {data.title}
              </h1>
              {data.description && (
                <p className="text-[12px] text-[#888780] leading-relaxed mb-3 whitespace-pre-line">
                  {data.description}
                </p>
              )}
              {data.category && (
                <span className="text-[10px] bg-[#EEEDFE] text-[#3C3489] px-3 py-1 rounded-full">
                  {data.category}
                </span>
              )}
            </div>
          </div>

          {/* More from feed */}
          <div className="bg-[#FFFFFF] border border-[#D3D1C7] rounded-xl p-4">
            <div className="text-[11px] text-[#888780] uppercase tracking-wider mb-3">
              More from feed
            </div>
            <div>

              {moreData?.map((item) => (
                <Link href={`/portfolio/${item.id}`} key={item.id}>
                  <div className="flex gap-3 items-center p-2 rounded-lg hover:bg-[#F8F7F4] transition">
                    {item.cover_url ? (
                      <div className="relative w-14 h-16 shrink-0 rounded-md overflow-hidden">
                        <Image src={item.cover_url} alt="cover" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-16 shrink-0 rounded-md bg-[#F1EFE8] text-[8px] flex items-center justify-center">No Cover</div>
                    )}
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[12px] font-medium text-[#2C2C2A] truncate">{item.title}</span>
                      {item.category && (
                        <span className="text-[10px] bg-[#EEEDFE] text-[#3C3489] px-2 py-0.5 rounded-full w-fit">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}

            </div>
            <Link
              href="/"
              className="text-[12px] text-[#534AB7] hover:text-[#3C3489] transition"
            >
              ← Browse all portfolios
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}