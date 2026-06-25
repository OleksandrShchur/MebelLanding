import { useRef, useState, useEffect, useCallback, forwardRef, memo } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useCatalogPageLoader } from '../hooks/useCatalogPageLoader';
import HTMLFlipBook from 'react-pageflip';
import { useSearchParams } from 'react-router-dom';
import type { PageDimensions } from '../types';

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
  onBookReady?: (ref: FlipBookRef, pageIndex: number) => void;
  onReadyChange?: (ready: boolean) => void;
  onPageChange?: (page: number) => void;
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
  shouldLoad: boolean;
  highPriority: boolean;
  onLoaded: () => void;
}

const Page = memo(
  forwardRef<HTMLDivElement, PageProps>(function Page(
    { src, alt, width, height, shouldLoad, highPriority, onLoaded },
    ref
  ) {
    const [visible, setVisible] = useState(false);
    const notifiedRef = useRef(false);

    useEffect(() => {
      notifiedRef.current = false;
      setVisible(false);
    }, [src]);

    useEffect(() => {
      if (!shouldLoad) return;
      setVisible(true);
    }, [shouldLoad]);

    const handleLoad = useCallback(() => {
      if (notifiedRef.current) return;
      notifiedRef.current = true;
      onLoaded();
    }, [onLoaded]);

    return (
      <div ref={ref} className="page flex items-center justify-center overflow-hidden bg-white">
        {visible ? (
          <img
            src={src}
            alt={alt}
            decoding="async"
            fetchPriority={highPriority ? 'high' : 'low'}
            style={{ aspectRatio: `${width} / ${height}` }}
            className="max-h-full max-w-full object-scale-down"
            onLoad={handleLoad}
          />
        ) : (
          <div
            className="h-full w-full animate-pulse bg-mebel-border-muted/40"
            style={{ aspectRatio: `${width} / ${height}` }}
            aria-hidden="true"
          />
        )}
      </div>
    );
  })
);

const FlipBookViewer = ({
  images,
  pageDimensions,
  displayHeight,
  singlePage,
  onBookReady,
  onReadyChange,
  onPageChange,
}: FlipBookViewerProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get('page') || '0', 10)
  );

  const bookRef = useRef<FlipBookRef | null>(null);
  const pointerStartX = useRef(0);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const resolvedHeight = displayHeight ?? DEFAULT_DISPLAY_HEIGHT;
  const { width: pageWidth, height: pageHeight } = getPageSlotDimensions(pageDimensions, resolvedHeight);

  const { imageUrls, shouldLoadPage, isHighPriorityPage, markPageLoaded, viewerReady } =
    useCatalogPageLoader({
      images,
      currentPage,
      enabled: true,
    });

  const bookReadyReportedRef = useRef(false);
  const initialNavigationDoneRef = useRef(false);

  useEffect(() => {
    onReadyChange?.(viewerReady);
  }, [viewerReady, onReadyChange]);

  useEffect(() => {
    bookReadyReportedRef.current = false;
    initialNavigationDoneRef.current = false;
  }, [images, pageWidth, pageHeight, singlePage, isMobile]);

  const handleFlip = useCallback(
    (e: { data: unknown }) => {
      const newPage = Number(e.data);
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
        onPageChange?.(newPage);
        setSearchParams({ page: newPage.toString() }, { replace: true });
      }
    },
    [currentPage, onPageChange, setSearchParams]
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
    if (e.pointerType === 'touch') {
      e.preventDefault();
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const delta = e.clientX - pointerStartX.current;
    const pageFlip = bookRef.current?.pageFlip();
    if (!pageFlip) return;

    if (delta > 60) {
      pageFlip.flipNext();
    } else if (delta < -60) {
      pageFlip.flipPrev();
    }
  }, []);

  useEffect(() => {
    if (!viewerReady || bookReadyReportedRef.current || !bookRef.current) return;

    const timeout = window.setTimeout(() => {
      if (!bookRef.current || bookReadyReportedRef.current) return;
      bookReadyReportedRef.current = true;
      onBookReady?.(bookRef.current, currentPage);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [viewerReady, onBookReady]);

  useEffect(() => {
    if (!viewerReady || initialNavigationDoneRef.current) return;

    const startPage = Number.parseInt(searchParams.get('page') || '0', 10);
    const timeout = window.setTimeout(() => {
      const pageFlip = bookRef.current?.pageFlip();
      if (pageFlip && startPage > 0) {
        pageFlip.turnToPage(startPage);
        setCurrentPage(startPage);
        onPageChange?.(startPage);
      }
      initialNavigationDoneRef.current = true;
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [viewerReady, searchParams, onPageChange]);

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

  const pages = imageUrls.map((src, index) => (
    <Page
      key={src}
      src={src}
      alt={`Page ${index + 1}`}
      width={pageWidth}
      height={pageHeight}
      shouldLoad={shouldLoadPage(index)}
      highPriority={isHighPriorityPage(index)}
      onLoaded={() => markPageLoaded(index)}
    />
  ));

  const bookKey = `${isMobile ? 'mobile' : 'desktop'}-${singlePage ? 'single' : 'spread'}`;

  return (
    <div
      className="flex h-full w-full touch-none items-center justify-center overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onTouchStart={(e) => e.preventDefault()}
    >
      {singlePage && !isMobile && (
        <HTMLFlipBook
          ref={bookRef}
          key={`${bookKey}-desktop-single`}
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
          key={`${bookKey}-mobile-single`}
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
          key={`${bookKey}-spread`}
          width={pageWidth}
          height={pageHeight}
          size="fixed"
          minWidth={Math.round(pageWidth * 0.4)}
          maxWidth={pageWidth}
          minHeight={Math.round(pageHeight * 0.4)}
          maxHeight={pageHeight}
          usePortrait={isMobile}
          drawShadow={true}
          autoSize={false}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
          {...commonProps}
        >
          {pages}
        </HTMLFlipBook>
      )}
    </div>
  );
};

export default FlipBookViewer;
