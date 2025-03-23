"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NProgress from "nprogress"; // Gunakan NProgress karena `nextjs-toploader` ga bisa dipanggil manual
import "nprogress/nprogress.css";

export default function NavigationEvents() {
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => NProgress.start();
    const handleComplete = () => NProgress.done();

    router.events?.on("routeChangeStart", handleStart);
    router.events?.on("routeChangeComplete", handleComplete);
    router.events?.on("routeChangeError", handleComplete);

    return () => {
      router.events?.off("routeChangeStart", handleStart);
      router.events?.off("routeChangeComplete", handleComplete);
      router.events?.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return null;
}
