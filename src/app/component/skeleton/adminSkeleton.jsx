import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function SearchSkeleton() {
  return (
    <div className="h-[40px] md:h-[48px] min-w-[200px] md:w-[300px] mb-2">
      <Skeleton className="w-full h-full" />
    </div>
  );
}
export function IconSkeleton() {
  return (
    <div>
      <Skeleton className="px-4 py-2 md:px-5 md:py-3 h-[40px] md:h-[48px]" />
    </div>
  );
}
export function TableSkeleton() {
  return (
    <div>
      <Skeleton className="w-full h-[280px]" />
    </div>
  );
}
