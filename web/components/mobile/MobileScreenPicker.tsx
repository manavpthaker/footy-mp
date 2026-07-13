"use client";
import React from "react";
import { usePathname } from "next/navigation";

/**
 * On mobile we only show ONE thing at a time. Tab routes show the rail
 * (Today / Matches list / Tables / Following); detail routes show the
 * detail. Client-side pathname sniff is fine here — the layout still
 * server-renders both slots, we just choose which to reveal.
 */
export function MobileScreenPicker({
  rail, detail,
}: {
  rail: React.ReactNode; detail: React.ReactNode;
}) {
  const pathname = usePathname() || "/";
  const isDetail =
    /^\/matches\/\d+/.test(pathname)
    || /^\/teams\/\d+/.test(pathname)
    || /^\/players\/\d+/.test(pathname)
    || /^\/leagues\/\d+/.test(pathname)
    || /^\/countries\/\d+/.test(pathname);
  return <>{isDetail ? detail : rail}</>;
}
