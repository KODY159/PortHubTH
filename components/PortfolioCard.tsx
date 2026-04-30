import Image from "next/image"
import Link from "next/link"

export default function PortfolioCard({ id, title, cover_url }: any) {
  return (
    <div className="border border-[#D3D1C7] rounded-lg overflow-hidden flex flex-col h-full bg-[#FFFFFF]">
      {cover_url ? (
        <div className="relative w-full aspect-[1/1.414] mb-3">
          <Image
            src={cover_url}
            alt="cover"
            fill
            className="object-cover"
          />
        </div>
        ) : (
        <div className="w-full aspect-[1/1.414] mb-3 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
          No Cover
        </div>
      )}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h2 className="font-semibold text-lg line-clamp-2">{title}</h2>
        <p className="font-medium text-[#888780] text-sm">Details</p>
        <Link
          href={`/portfolio/${id}`}
          className="mt-auto text-sm text-[#534AB7] hover:underline"
        >
          View →
        </Link>
      </div>
    </div>
  )
}