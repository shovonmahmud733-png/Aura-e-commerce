import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-3xl bg-white dark:bg-dark-900 border border-slate-200/90 dark:border-slate-800/90 overflow-hidden shadow-sm animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-square w-full bg-slate-200 dark:bg-slate-800">
        <div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700" />
      </div>

      {/* Content Skeleton */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-16 h-3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-8 h-3 rounded bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Title */}
          <div className="w-3/4 h-4 rounded bg-slate-200 dark:bg-slate-800 mb-2" />
          
          {/* Tagline */}
          <div className="w-1/2 h-3 rounded bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="w-20 h-5 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="w-16 h-7 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

export function CatalogGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="w-48 h-4 rounded bg-slate-200 dark:bg-slate-800 mb-8" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Gallery Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>

        {/* Right: Info Skeleton */}
        <div className="space-y-6">
          <div className="w-24 h-4 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="w-3/4 h-8 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="w-32 h-6 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2 py-4">
            <div className="w-full h-4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-5/6 h-4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="w-2/3 h-4 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="w-full h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

export default CatalogGridSkeleton;
