import { useRef, useState, useEffect, useCallback } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import HTMLFlipBook from 'react-pageflip';
import { useSearchParams } from 'react-router-dom';

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
}

const FlipBookViewer = ({ images, orientation }: FlipBookViewerProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get('page') || '0')
  );

  const bookRef = useRef<FlipBookRef | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const pagesPerView = isMobile ? 1 : 2;
  const effectivePagesPerView = orientation === 'landscape' && !isMobile ? 1 : pagesPerView;

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

  // Jump to the page from URL when the book is ready
  useEffect(() => {
    const timeout = setTimeout(() => {
      const pageFlip = bookRef.current?.pageFlip();
      if (pageFlip && currentPage > 0) {
        pageFlip.turnToPage(currentPage);
      }
    }, 300); // small delay so the book has rendered its pages

    return () => clearTimeout(timeout);
  }, [currentPage]);

  const handleNext = () => {
    bookRef.current?.pageFlip()?.flipNext();
    // onFlip will update state + URL automatically
  };

  const handlePrev = () => {
    bookRef.current?.pageFlip()?.flipPrev();
  };

  const createPages = () => {
    const pages = [];
    if (effectivePagesPerView === 1) {
      images.forEach((image, index) => {
        pages.push(
          <div key={index} className="page bg-white flex items-center justify-center">
            <img
              src={`${import.meta.env.BASE_URL}${image}`}
              alt={`Page ${index + 1}`}
              className={`max-w-full max-h-full object-contain ${orientation === 'landscape' ? 'w-full' : 'h-full'}`}
              loading="lazy"
            />
          </div>
        );
      });
    } else {
      for (let i = 0; i < images.length; i += 2) {
        pages.push(
          <div key={i} className="page bg-white flex">
            <div className="flex-1 flex items-center justify-center p-2">
              <img
                src={`${import.meta.env.BASE_URL}${images[i]}`}
                alt={`Page ${i + 1}`}
                className="max-w-full max-h-full object-contain"
                loading="lazy"
              />
            </div>
            {images[i + 1] && (
              <div className="flex-1 flex items-center justify-center p-2">
                <img
                  src={`${import.meta.env.BASE_URL}${images[i + 1]}`}
                  alt={`Page ${i + 2}`}
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        );
      }
    }
    return pages;
  };

  return (
    <div className="relative w-full h-full">
      <HTMLFlipBook
        ref={bookRef}
        width={800}
        height={600}
        size="stretch"
        minWidth={400}
        maxWidth={1000}
        minHeight={300}
        maxHeight={800}
        showCover={true}
        mobileScrollSupport={true}
        onFlip={handleFlip}
        className="flip-book"
      >
        {createPages()}
      </HTMLFlipBook>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#7C5A3A] text-white p-3 rounded-full hover:bg-[#6A4C31] transition-all z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#7C5A3A] text-white p-3 rounded-full hover:bg-[#6A4C31] transition-all z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default FlipBookViewer;
