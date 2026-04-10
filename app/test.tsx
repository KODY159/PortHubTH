"use client"

export default function Test(){
    console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);

    return <p className="text-black">Hello</p>
}