import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { lazy, Suspense } from 'react';

// Dynamically import the Gallery component
const Gallery = lazy(() => import('@/components/gallery/Gallery'));

export default function PhotosPage() {
  return (
    <DefaultLayout markdown="">
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Photos</h1>
          <p className="text-default-600 mt-2">A beautiful responsive image gallery with masonry layout</p>
        </div>
        <div className="w-full max-w-7xl">
          <Suspense fallback={
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            </div>
          }>
            <Gallery />
          </Suspense>
        </div>
      </section>
    </DefaultLayout>
  );
} 