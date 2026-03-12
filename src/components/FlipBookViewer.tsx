import { useRef, useState, useEffect, useCallback, forwardRef } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import HTMLFlipBook from 'react-pageflip';
import { useSearchParams } from 'react-router-dom';
import type { PageDimensions } from '../types';

interface FlipBookRef {
  pageFlip(): {
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
  displayHeight?: number;
}

const DEFAULT_DISPLAY_HEIGHT = 600;

function getPageSlotDimensions(pageDimensions: PageDimensions, displayHeight: number) {
  const scale = displayHeight / pageDimensions.height;
  return {
    width: Math.round(pageDimensions.width * scale),
    height: displayHeight,
  };
}

interface PageProps {
  src: string;
  alt: string;
  orientation: 'portrait' | 'landscape';
}

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

const FlipBookViewer = ({ images, orientation, pageDimensions, displayHeight }: FlipBookViewerProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get('page') || '0')
  );
  const [ready, setReady] = useState(false);

  const bookRef = useRef<FlipBookRef | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const resolvedHeight = displayHeight ?? DEFAULT_DISPLAY_HEIGHT;
  const { width: pageWidth, height: pageHeight } = getPageSlotDimensions(pageDimensions, resolvedHeight);

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
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timeout = setTimeout(() => {
      const pageFlip = bookRef.current?.pageFlip();
      if (pageFlip && currentPage > 0) {
        pageFlip.turnToPage(currentPage);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [ready]);

  const handleNext = () => bookRef.current?.pageFlip()?.flipNext();
  const handlePrev = () => bookRef.current?.pageFlip()?.flipPrev();

  if (!ready) {
    return (
      <div
        className="relative w-full h-full"
        style={{ minHeight: pageHeight }}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      <HTMLFlipBook
        ref={bookRef}
        key={isMobile ? 'mobile' : 'desktop'}
        width={pageWidth}
        height={pageHeight}
        size="stretch"
        minWidth={Math.round(pageWidth * 0.4)}
        maxWidth={Math.round(pageWidth * 1.5)}
        minHeight={Math.round(pageHeight * 0.4)}
        maxHeight={Math.round(pageHeight * 1.5)}
        showCover={false}
        mobileScrollSupport={false}
        onFlip={handleFlip}
        className="flip-book"
        usePortrait={isMobile}
        startPage={0}
        drawShadow={true}
        flippingTime={1000}
        startZIndex={0}
        autoSize={true}
        maxShadowOpacity={1}
        clickEventForward={true}
        useMouseEvents={true}
        swipeDistance={30}
        showPageCorners={false}
        disableFlipByClick={false}
        style={{}}
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
