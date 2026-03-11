import { useRef, useState, useEffect, useCallback, forwardRef } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import HTMLFlipBook from 'react-pageflip';
import { useSearchParams } from 'react-router-dom';
import type { PageDimensions } from '../types';

interface FlipBookRef {
  getPageFlip(): {
    flipNext(): void;
    flipPrev(): void;
    turnToPage(page: number): void;
    getCurrentPageIndex(): number;
  };
}

interface FlipBookViewerProps {
  images: string[];
  orientation: 'portrait' | 'landscape';
  pageDimensions: PageDimensions;
}

const DISPLAY_HEIGHT = 600;

function getPageSlotDimensions(pageDimensions: PageDimensions) {
  const scale = DISPLAY_HEIGHT / pageDimensions.height;
  return {
    width: Math.round(pageDimensions.width * scale),
    height: DISPLAY_HEIGHT,
  };
}

interface PageProps {
  src: string;
  alt: string;
  orientation: 'portrait' | 'landscape';
}

// Passing src/alt directly into Page avoids needing children manipulation
const Page = forwardRef<HTMLDivElement, PageProps>(({ src, alt, orientation }, ref) => (
  <div ref={ref} className="page bg-white flex items-center justify-center overflow-hidden">
    <img
      src={src}
      alt={alt}
      loading="lazy"
      style={{ aspectRatio: orientation === 'portrait' ? '3 / 4' : '4 / 3' }}
      className="max-w-full max-h-full object-contain"
    />
  </div>
));

const FlipBookViewer = ({ images, orientation, pageDimensions }: FlipBookViewerProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get('page') || '0')
  );

  const bookRef = useRef<FlipBookRef | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // spread is the sole layout driver; mobile overrides to single as a UX fallback
  const isSinglePage = isMobile || pageDimensions.spread === 'single';

  const { width: pageWidth, height: pageHeight } = getPageSlotDimensions(pageDimensions);

  const handleFlip = useCallback(
    (e: any) => {
      const newPage = Number(e.data);
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
        setSearchParams({ page: newPage.toString() }, { replace: true });
      }
    },
    [currentPage, setSearchParams]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      const pageFlip = bookRef.current?.getPageFlip();
      if (pageFlip && currentPage > 0) {
        pageFlip.turnToPage(currentPage);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleNext = () => bookRef.current?.getPageFlip()?.flipNext();
  const handlePrev = () => bookRef.current?.getPageFlip()?.flipPrev();

  return (
    <div className="relative w-full h-full">
      <HTMLFlipBook
        ref={bookRef}
        width={pageWidth}
        height={pageHeight}
        size="stretch"
        minWidth={Math.round(pageWidth * 0.4)}
        maxWidth={Math.round(pageWidth * 1.5)}
        minHeight={Math.round(pageHeight * 0.4)}
        maxHeight={Math.round(pageHeight * 1.5)}
        showCover={true}
        mobileScrollSupport={true}
        onFlip={handleFlip}
        className="flip-book"
      >
        {images.map((image, index) => (
          <Page
            key={index}
            src={`${import.meta.env.BASE_URL}${image}`}
            alt={`Page ${index + 1}`}
            orientation={orientation}
          />
        ))}
      </HTMLFlipBook>

      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#7C5A3A] text-white p-3 rounded-full hover:bg-[#6A4C31] transition-all z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#7C5A3A] text-white p-3 rounded-full hover:bg-[#6A4C31] transition-all z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default FlipBookViewer;
