// "use client"
// import { useState, useEffect, useMemo } from "react"
// import { supabase } from "@/lib/supabaseClient"
// import PortfolioCard from "@/components/PortfolioCard"

// type Portfolio = {
//   id: string
//   title: string
//   description: string | null
//   category: string | null
//   cover_url: string | null
//   pdf_url: string
//   created_at: string
//   faculty: string | null
//   university: string | null
//   apply_year: number | null
//   apply_round: string | null
//   result: string | null
//   profiles: {
//     name: string | null
//     avatar_url: string | null
//   } | null
// }

// const resultOptions = ["ทั้งหมด", "ติด", "ไม่ติด", "รอผล"]

// const resultStyle: Record<string, { bg: string; text: string; border: string }> = {
//   "ติด":    { bg: "#26215C", text: "#5DCAA5", border: "#0F3D2E" },
//   "ไม่ติด": { bg: "#26215C", text: "#F09595", border: "#4A1B0C" },
//   "รอผล":  { bg: "#26215C", text: "#AFA9EC", border: "#3C3489" },
// }

// export default function Browse() {
//   const [data, setData] = useState<Portfolio[]>([])
//   const [loading, setLoading] = useState(true)
//   const [search, setSearch] = useState("")
//   const [activeCategory, setActiveCategory] = useState("ทั้งหมด")
//   const [activeResult, setActiveResult] = useState("ทั้งหมด")
//   const [activeUniversity, setActiveUniversity] = useState("ทั้งหมด")

//   useEffect(() => {
//     const fetchData = async () => {
//       const { data, error } = await supabase
//         .from("portfolios")
//         .select(`
//           *,
//           profiles (
//             name,
//             avatar_url
//           )
//         `)
//         .order("created_at", { ascending: false })

//       if (error) {
//         console.error(error)
//       } else {
//         setData(data ?? [])
//       }
//       setLoading(false)
//     }
//     fetchData()
//   }, [])

//   // filter ทั้งหมด
//   const filtered = useMemo(() => {
//     return data.filter((item) => {
//       const matchSearch =
//         search === "" ||
//         item.title.toLowerCase().includes(search.toLowerCase()) ||
//         item.description?.toLowerCase().includes(search.toLowerCase()) ||
//         item.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
//         item.faculty?.toLowerCase().includes(search.toLowerCase()) ||
//         item.university?.toLowerCase().includes(search.toLowerCase())

//       const matchCategory =
//         activeCategory === "ทั้งหมด" || item.category === activeCategory

//       const matchResult =
//         activeResult === "ทั้งหมด" || item.result === activeResult

//       const matchUniversity =
//         activeUniversity === "ทั้งหมด" || item.university === activeUniversity

//       return matchSearch && matchCategory && matchResult && matchUniversity
//     })
//   }, [data, search, activeCategory, activeResult, activeUniversity])

//   const hasFilter =
//     search !== "" ||
//     activeCategory !== "ทั้งหมด" ||
//     activeResult !== "ทั้งหมด" ||
//     activeUniversity !== "ทั้งหมด"

//   function clearAll() {
//     setSearch("")
//     setActiveCategory("ทั้งหมด")
//     setActiveResult("ทั้งหมด")
//     setActiveUniversity("ทั้งหมด")
//   }

//   return (
//     <div className="min-h-screen bg-[#0F0E0C] text-[#F1EFE8]">

//       {/* Header */}
//       <div className="bg-[#161614] border-b border-[#2C2C2A] px-6 py-5">
//         <h1 className="text-xl font-medium text-[#F1EFE8]">Portfolio Search</h1>
//         <p className="text-[11px] text-[#5F5E5A] mt-1">
//           {loading ? "กำลังโหลด..." : `${filtered.length} portfolios`}
//         </p>
//       </div>

//       {/* Search */}
//       <div className="px-5 pt-4">
//         <div className="flex items-center gap-3 bg-[#1A1917] border border-[#2C2C2A] rounded-xl px-4 py-2.5 focus-within:border-[#534AB7] transition-colors">
//           <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
//             <circle cx="6.5" cy="6.5" r="5" stroke="#444441" strokeWidth="1.5"/>
//             <path d="M10.5 10.5L14 14" stroke="#444441" strokeWidth="1.5" strokeLinecap="round"/>
//           </svg>
//           <input
//             type="text"
//             placeholder="ค้นหาชื่อ, คณะ, มหาวิทยาลัย, ชื่อผู้ใช้..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="bg-transparent text-[12px] text-[#E8E6DF] placeholder-[#444441] outline-none w-full"
//           />
//           {search && (
//             <button
//               onClick={() => setSearch("")}
//               className="text-[#444441] hover:text-[#888780] transition-colors shrink-0"
//             >
//               ✕
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="px-5 pt-3 flex flex-col gap-2">

//         {/* ผลการสมัคร */}
//         <div className="flex items-center gap-2 overflow-x-auto">
//           <span className="text-[10px] text-[#444441] shrink-0">ผล:</span>
//           {resultOptions.map((r) => (
//             <button
//               key={r}
//               onClick={() => setActiveResult(r)}
//               className="text-[10px] font-medium px-3 py-1.5 rounded-full border whitespace-nowrap transition-all"
//               style={
//                 activeResult === r
//                   ? r === "ทั้งหมด"
//                     ? { background: "#26215C", color: "#AFA9EC", borderColor: "#534AB7" }
//                     : { background: resultStyle[r].bg, color: resultStyle[r].text, borderColor: resultStyle[r].border }
//                   : { background: "#161614", color: "#888780", borderColor: "#2C2C2A" }
//               }
//             >
//               {r}
//             </button>
//           ))}
//         </div>
//         {/* Clear all */}
//         {hasFilter && (
//           <button
//             onClick={clearAll}
//             className="self-start text-[10px] text-[#534AB7] hover:text-[#7F77DD] transition-colors"
//           >
//             ล้างตัวกรองทั้งหมด ✕
//           </button>
//         )}
//       </div>

//       {/* Grid */}
//       <div className="px-5 pt-3 pb-12">

//         {/* Loading skeleton */}
//         {loading && (
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
//             {Array.from({ length: 8 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="bg-[#161614] border border-[#2C2C2A] rounded-2xl overflow-hidden animate-pulse"
//                 style={{ aspectRatio: "1/1.414" }}
//               />
//             ))}
//           </div>
//         )}

//         {/* No results */}
//         {!loading && filtered.length === 0 && (
//           <div className="flex flex-col items-center justify-center py-20 gap-3">
//             <div className="w-10 h-10 rounded-xl bg-[#161614] border border-[#2C2C2A] flex items-center justify-center">
//               <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#444441" strokeWidth="1.5" strokeLinecap="round">
//                 <circle cx="6.5" cy="6.5" r="5"/>
//                 <path d="M10.5 10.5L14 14"/>
//               </svg>
//             </div>
//             <p className="text-[12px] text-[#444441]">ไม่พบผลลัพธ์</p>
//             <button
//               onClick={clearAll}
//               className="text-[11px] text-[#534AB7] hover:text-[#7F77DD] transition-colors"
//             >
//               ล้างตัวกรอง
//             </button>
//           </div>
//         )}

//         {/* Results */}
//         {!loading && filtered.length > 0 && (
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
//             {filtered.map((item, index) => (
//               <PortfolioCard
//                 key={item.id}
//                 id={item.id}
//                 title={item.title}
//                 pdf_url={item.pdf_url}
//                 cover_url={item.cover_url}
//                 category={item.category}
//                 userProfile={item.profiles?.avatar_url}
//                 username={item.profiles?.name}
//                 faculty={item.faculty}
//                 university={item.university}
//                 result={item.result}
//                 priority={index < 4}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

import  createClient  from "@/lib/supabaseServer"
import BrowseClient from "./BrowseClient"


export default async function BrowsePage() {
  const supabaseServer = await createClient();

  const { data: { session }} = await supabaseServer.auth.getSession();

  const [{data: portfolios}, savedRes] = await Promise.all([
    supabaseServer.from("portfolios")
      .select(`
        id, title, description, category, cover_url, pdf_url,
        created_at, faculty, university, apply_year, apply_round, result,
        profiles ( name, avatar_url )
      `)
      .order("created_at", {ascending: false}),

    session?.user 
      ? supabaseServer
        .from("saved_portfolios")
        .select("portfolio_id")
        .eq("user_id", session.user.id)
      : Promise.resolve({ data: [] })
  ])

   const savedIds = new Set(
    savedRes.data?.map((s: any) => s.portfolio_id) ?? []
  )

   const normalized = (portfolios ?? []).map((p) => ({
    ...p,
    profiles: Array.isArray(p.profiles) ? (p.profiles[0] ?? null) : p.profiles,
  }))

  return (
    <BrowseClient
      initialData={normalized}
      savedIds={[...savedIds]}
    />
  )
}