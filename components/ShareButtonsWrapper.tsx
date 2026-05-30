"use client";

import dynamic from "next/dynamic";

const ShareButtons = dynamic(() => import("./ShareButtons"), {
  ssr: false,
});

export default ShareButtons;
