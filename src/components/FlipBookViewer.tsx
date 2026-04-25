import { useRef, useState, useEffect, useCallback, forwardRef } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import HTMLFlipBook from 'react-pageflip';
import { useSearchParams } from 'react-router-dom';
import type { PageDimensions } from '../types';
import { assetUrl } from '../utils/assets';
import LoadingSpinner from './LoadingSpinner';

export interface FlipBookRef {
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
  singlePage: boolean;
  onBookReady?: (ref: FlipBookRef) => void;
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
  width: number;
  height: number;
}

const Page = forwardRef<HTMLDivElement, PageProps>(({ src, alt, width, height }, ref) => (
  <div ref={ref} className="page bg-white flex items-center justify-center overflow-hidden">
    <img
      src={src}
      alt={alt}
      loading="lazy"
      style={{ aspectRatio: `${width} / ${height}` }}
      className="max-w-full max-h-full object-scale-down"
    />
  </div>
));

const FlipBookViewer = ({ images, pageDimensions, displayHeight, singlePage, onBookReady }: FlipBookViewerProps) => {
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
    (e: { data: unknown }) => {
      const newPage = Number(e.data);
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
        setSearchParams({ page: newPage.toString() }, { replace: true });
      }
    },
    [currentPage, setSearchParams]
  );

  useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const timeout = setTimeout(() => {
      const pageFlip = bookRef.current?.pageFlip();
      if (pageFlip && currentPage > 0) {
        pageFlip.turnToPage(currentPage);
      }
      if (bookRef.current) {
        onBookReady?.(bookRef.current);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [ready]);

  if (!ready) {
    return (
      <div
        className="relative w-full h-full"
        style={{ minHeight: pageHeight }}
      >
        <LoadingSpinner overlay label="Завантаження..." />
      </div>
    );
  }

  const commonProps = {
    onFlip: handleFlip,
    className: 'flip-book',
    startPage: 0,
    flippingTime: 1000,
    startZIndex: 0,
    maxShadowOpacity: 1,
    showCover: false,
    mobileScrollSupport: false,
    clickEventForward: true,
    useMouseEvents: true,
    swipeDistance: 30,
    showPageCorners: false,
    disableFlipByClick: false,
  };

  const pages = images.map((image, index) => (
    <Page
      key={index}
      src={assetUrl(image)}
      alt={`Page ${index + 1}`}
      width={pageWidth}
      height={pageHeight}
    />
  ));

  return (
    <div className="w-full h-full flex items-center justify-center">
      {singlePage && !isMobile && (
        <HTMLFlipBook
          ref={bookRef}
          key={`desktop-${pageWidth}x${pageHeight}-${singlePage}`}
          width={pageWidth - 8}
          height={pageHeight}
          size="fixed"
          minWidth={Math.round(pageWidth * 0.4)}
          maxWidth={Math.round(pageWidth * 1.5)}
          minHeight={Math.round(pageHeight * 0.4)}
          maxHeight={Math.round(pageHeight * 1.5)}
          usePortrait={true}
          drawShadow={true}
          autoSize={false}
          style={{}}
          {...commonProps}
        >
          {pages}
        </HTMLFlipBook>
      )}

      {singlePage && isMobile && (
        <HTMLFlipBook
          ref={bookRef}
          key={`mobile-${pageWidth}x${pageHeight}-${singlePage}`}
          width={pageWidth}
          height={pageHeight}
          size="fixed"
          minWidth={Math.round(pageWidth * 0.4)}
          maxWidth={pageWidth}
          minHeight={Math.round(pageHeight * 0.4)}
          maxHeight={pageHeight}
          usePortrait={true}
          drawShadow={false}
          autoSize={false}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
          {...commonProps}
        >
          {pages}
        </HTMLFlipBook>
      )}

      {!singlePage && (
        <HTMLFlipBook
          ref={bookRef}
          key={`${isMobile ? 'mobile' : 'desktop'}-${pageWidth}x${pageHeight}-${singlePage}`}
          width={pageWidth - 8}
          height={pageHeight}
          size={isMobile ? 'fixed' : 'stretch'}
          minWidth={Math.round(pageWidth * 0.4)}
          maxWidth={Math.round(pageWidth * 1.5)}
          minHeight={Math.round(pageHeight * 0.4)}
          maxHeight={Math.round(pageHeight * 1.5)}
          usePortrait={isMobile}
          drawShadow={true}
          autoSize={true}
          style={{}}
          {...commonProps}
        >
          {pages}
        </HTMLFlipBook>
      )}
    </div>
  );
};

export default FlipBookViewer;
