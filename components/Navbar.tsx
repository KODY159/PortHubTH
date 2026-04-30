"use client"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-[#2C2C2A] px-6 py-4 text-white sticky top-0 z-50">
      
      {/* Main row */}
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-medium text-[#F1EFE8]">
          ThiaUniversityPorts.io
        </span>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5">
          <Button className="text-[13px] text-[#B4B2A9] bg-transparent border-none hover:text-[#F1EFE8]">
            Browse
          </Button>
          <Button className="text-[13px] text-[#B4B2A9] border border-[#5F5E5A] bg-transparent rounded-md px-4 py-1.5 hover:border-[#B4B2A9]">
            Login
          </Button>
          <Button className="text-[13px] text-[#EEEDFE] bg-[#534AB7] border-none rounded-md px-4 py-1.5 hover:bg-[#3C3489]">
            SignUp
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-[#B4B2A9] hover:text-[#F1EFE8] transition"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden flex flex-col gap-2 mt-4 pb-2 border-t border-[#444441] pt-4">
          <Button className="w-full text-[13px] text-[#B4B2A9] bg-transparent border-none hover:text-[#F1EFE8] justify-start">
            Browse
          </Button>
          <Button className="w-full text-[13px] text-[#B4B2A9] border border-[#5F5E5A] bg-transparent rounded-md hover:border-[#B4B2A9]">
            Login
          </Button>
          <Button className="w-full text-[13px] text-[#EEEDFE] bg-[#534AB7] border-none rounded-md hover:bg-[#3C3489]">
            SignUp
          </Button>
        </div>
      )}

    </nav>
  )
}