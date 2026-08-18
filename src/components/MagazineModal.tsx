import { useEffect, useState, useCallback, useMemo, useRef, type ChangeEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { useSearchParams } from 'react-router';
import type { Magazine } from '../types';
import FlipBookViewer, { type FlipBookRef } from './FlipBookViewer';
import LoadingSpinner from './LoadingSpinner';
import { prefetchMagazinePagesAround } from '../hooks/useCatalogPageLoader';
import { formatPriceFrom, getMagazineSrcs } from '../lib/gallery';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useReducedMotion } from '../hooks/useReducedMotion';
import ToggleButton from 'react-toggle-button';

interface MagazineModalProps {
  magazine: Magazine | null;
  categoryName?: string;
  isOpen: boolean;
  onClose: () => void;
}

const PADDING = 8;
const HEADER_FALLBACK = 48;
const FOOTER_FALLBACK = 80;
const PRICE_STRIP_HEIGHT = 44;
const BOOK_HORIZONTAL_PADDING = 16;

const navButtonClass = (isMobile: boolean) =>
  `rounded-full bg-mebel-olive text-white shadow-md transition-all hover:bg-mebel-olive-dark disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-mebel-olive ${isMobile ? 'p-2' : 'p-3'}`;

const navIconClass = (isMobile: boolean) => (isMobile ? 'h-4 w-4' : 'h-5 w-5');

function fitBookSize(
  magazine: Magazine,
  isMobile: boolean,
  singlePage: boolean,
  areaWidth: number,
  areaHeight: number
) {
  if (areaWidth < 1 || areaHeight < 1) return null;

  const pageAspect = magazine.page.width / magazine.page.height;
  const spreadAspect = isMobile || singlePage ? pageAspect : pageAspect * 2;

  let width = areaWidth;
  let height = width / spreadAspect;

  if (height > areaHeight) {
    height = areaHeight;
    width = height * spreadAspect;
  }

  return { width: Math.round(width), height: Math.round(height) };
}

function getAvailableBookArea(
  magazine: Magazine,
  isMobile: boolean,
  singlePage: boolean,
  viewportWidth: number,
  viewportHeight: number,
  isFullscreen: boolean,
  headerHeight: number,
  footerHeight: number
) {
  const horizontalInset = isFullscreen ? 0 : PADDING * 2 + BOOK_HORIZONTAL_PADDING;
  const verticalInset = isFullscreen ? 0 : PADDING * 2;

  const availW = viewportWidth - horizontalInset;
  const availH =
    viewportHeight - verticalInset - headerHeight - footerHeight - PRICE_STRIP_HEIGHT;

  return fitBookSize(magazine, isMobile, singlePage, availW, availH);
}

function getVisiblePages(
  pages: MagazinePage[],
  currentPage: number,
  singlePage: boolean
): Array<MagazinePage | undefined> {
  if (singlePage || pages.length <= 1) {
    return [pages[currentPage]];
  }

  const leftIndex = currentPage % 2 === 0 ? currentPage : currentPage - 1;
  return [pages[leftIndex], pages[leftIndex + 1]];
}

function parsePageIndex(value: string | null): number {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}

function bucketBookDimension(value: number, step = 80): number {
  return Math.max(step, Math.round(value / step) * step);
}

const MagazineModal = ({ magazine, categoryName, isOpen, onClose }: MagazineModalProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const prefersReducedMotion = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  const [singlePage, setSinglePage] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const flipRef = useRef<FlipBookRef | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageInput, setPageInput] = useState('1');
  const [isEditingPage, setIsEditingPage] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const pageInputRef = useRef<HTMLInputElement>(null);
  const [chromeHeights, setChromeHeights] = useState({ header: 0, footer: 0 });

  const instant = { opacity: 1, scale: 1, y: 0 };
  const panelSpring = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 340, damping: 30 };
  const progressSpring = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 200, damping: 25 };

  useEffect(() => {
    const handleResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (magazine) {
      const isSinglePageCatalog = magazine.pages.length <= 1;
      setSinglePage(isSinglePageCatalog || magazine.page.spread === 'single');
    }
  }, [magazine]);

  useEffect(() => {
    if (!isOpen) {
      setViewerReady(false);
      flipRef.current = null;
      setCurrentPage(0);
      setIsFullscreen(false);
    }
  }, [isOpen]);

  const magazineId = magazine?.id;
  const magazineImages = magazine?.images;

  useEffect(() => {
    if (!isOpen || !magazineId || !magazineImages) return;
    flipRef.current = null;
    const pageIndex = parsePageIndex(searchParams.get('page'));
    setCurrentPage(pageIndex);
    prefetchMagazinePagesAround(magazineImages, pageIndex);
    // Only reset when the open magazine changes — not on search-param / referential updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed by magazineId
  }, [isOpen, magazineId]);

  useEffect(() => {
    if (!isOpen) return;

    const measure = () => {
      setChromeHeights({
        header: headerRef.current?.offsetHeight ?? 0,
        footer: footerRef.current?.offsetHeight ?? 0,
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    if (headerRef.current) observer.observe(headerRef.current);
    if (footerRef.current) observer.observe(footerRef.current);

    return () => observer.disconnect();
  }, [isOpen, isFullscreen, isMobile, singlePage, magazine]);

  const handleBookReady = useCallback((ref: FlipBookRef, pageIndex: number) => {
    flipRef.current = ref;
    setCurrentPage(pageIndex);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const goToPage = useCallback(
    (targetPage: number, total: number) => {
      const pageIndex = targetPage - 1;
      if (pageIndex < 0 || pageIndex >= total) return false;

      flipRef.current?.pageFlip()?.turnToPage(pageIndex);
      setCurrentPage(pageIndex);
      setSearchParams({ page: pageIndex.toString() }, { replace: true });
      return true;
    },
    [setSearchParams]
  );

  const totalPages = magazine?.pages.length ?? 0;
  const forceSinglePage = totalPages <= 1;
  const canGoPrev = viewerReady && currentPage > 0;
  const canGoNext = viewerReady && totalPages > 0 && currentPage < totalPages - 1;

  const goToPrevPage = useCallback(() => {
    if (!viewerReady || currentPage <= 0) return;
    flipRef.current?.pageFlip()?.flipPrev();
  }, [viewerReady, currentPage]);

  const goToNextPage = useCallback(() => {
    if (!viewerReady || totalPages <= 0 || currentPage >= totalPages - 1) return;
    flipRef.current?.pageFlip()?.flipNext();
  }, [viewerReady, currentPage, totalPages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
        return;
      }

      const target = e.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevPage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextPage();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isFullscreen, onClose, goToPrevPage, goToNextPage]);

  const displayPage = totalPages > 0 ? Math.min(currentPage + 1, totalPages) : 1;
  const maxPageDigits = totalPages > 0 ? String(totalPages).length : 1;

  useEffect(() => {
    if (!isEditingPage) {
      setPageInput(String(displayPage));
    }
  }, [displayPage, isEditingPage]);

  const handlePageInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === '' || (/^\d+$/.test(value) && value.length <= maxPageDigits)) {
      setPageInput(value);
    }
  };

  const commitPageInput = () => {
    setIsEditingPage(false);

    if (pageInput === '') {
      setPageInput(String(displayPage));
      return;
    }

    const targetPage = Number.parseInt(pageInput, 10);
    if (Number.isNaN(targetPage) || targetPage < 1 || targetPage > totalPages) {
      setPageInput(String(displayPage));
      return;
    }

    if (targetPage !== displayPage) {
      goToPage(targetPage, totalPages);
    } else {
      setPageInput(String(displayPage));
    }
  };

  const handlePageInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      pageInputRef.current?.blur();
    }

    if (event.key === 'Escape') {
      setPageInput(String(displayPage));
      setIsEditingPage(false);
      pageInputRef.current?.blur();
    }
  };

  if (!magazine) return null;

  const effectiveSinglePage = isMobile || forceSinglePage || singlePage;

  const headerHeight = chromeHeights.header || HEADER_FALLBACK;
  const footerHeight = chromeHeights.footer || FOOTER_FALLBACK;

  const bookSize =
    getAvailableBookArea(
      magazine,
      isMobile,
      effectiveSinglePage,
      viewport.width,
      viewport.height,
      isFullscreen,
      headerHeight,
      footerHeight
    ) ?? { width: 0, height: 0 };

  const modalWidth = isFullscreen
    ? viewport.width
    : Math.min(bookSize.width + BOOK_HORIZONTAL_PADDING, viewport.width - PADDING * 2);

  const progress = totalPages > 0 ? (displayPage / totalPages) * 100 : 0;
  const visiblePages = getVisiblePages(magazine.pages, currentPage, effectiveSinglePage);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="magazine-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[6px]"
          initial={prefersReducedMotion ? instant : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? instant : { opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={onClose}
        >
          <motion.div
            layout
            className={`relative flex flex-col overflow-hidden bg-mebel-surface-raised shadow-mebel-md ${
              isFullscreen
                ? 'fixed inset-0 h-dvh w-screen justify-between rounded-none'
                : 'rounded-lg'
            }`}
            style={
              isFullscreen
                ? undefined
                : { width: modalWidth, maxHeight: viewport.height - PADDING * 2 }
            }
            initial={prefersReducedMotion ? instant : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? instant : { opacity: 0, scale: 0.96, y: 8 }}
            transition={panelSpring}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — single compact row */}
            <div
              ref={headerRef}
              className="relative z-20 shrink-0 border-b border-mebel-border bg-mebel-surface-raised px-3 py-2 sm:px-4"
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
                <div className="min-w-0">
                  {(categoryName || magazine.name) && (
                    <p
                      className="min-w-0 truncate text-left text-[11px] leading-tight text-mebel-text-subtle sm:text-xs"
                      title={categoryName ? `${categoryName} › ${magazine.name}` : magazine.name}
                    >
                      {categoryName ? (
                        <>
                          <span>{categoryName}</span>
                          <span className="mx-1.5 opacity-50" aria-hidden="true">
                            ›
                          </span>
                        </>
                      ) : null}
                      <span className="text-mebel-text-muted">{magazine.name}</span>
                    </p>
                  )}
                </div>

                <div
                  className="flex shrink-0 items-center gap-1 text-sm font-medium text-mebel-text-subtle"
                  title="Натисніть на номер, щоб перейти до сторінки"
                >
                  <span className="hidden sm:inline">Сторінка</span>
                  <input
                    ref={pageInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onFocus={() => setIsEditingPage(true)}
                    onBlur={commitPageInput}
                    onKeyDown={handlePageInputKeyDown}
                    aria-label={`Номер сторінки від 1 до ${totalPages}`}
                    title={`Введіть номер сторінки (1–${totalPages}) і натисніть Enter`}
                    className={`w-10 rounded-md border bg-white px-1 py-0.5 text-center text-sm font-semibold text-mebel-olive tabular-nums transition-colors focus:outline-none focus:ring-2 focus:ring-mebel-tan/60 sm:w-11 sm:px-1.5 ${
                      isEditingPage
                        ? 'border-mebel-tan shadow-sm'
                        : 'border-mebel-border hover:border-mebel-tan/70'
                    }`}
                  />
                  <span aria-hidden="true">/ {totalPages}</span>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsFullscreen((prev) => !prev)}
                    className={`bg-mebel-olive text-white rounded-full hover:bg-mebel-olive-dark transition-all shadow-md ${isMobile ? 'p-1.5' : 'p-2'}`}
                    aria-label={isFullscreen ? 'Вийти з повноекранного режиму' : 'Повноекранний режим'}
                  >
                    {isFullscreen ? (
                      <Minimize2 className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                    ) : (
                      <Maximize2 className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className={`bg-mebel-olive text-white rounded-full hover:bg-mebel-olive-dark transition-all shadow-md ${isMobile ? 'p-1.5' : 'p-2'}`}
                    aria-label="Закрити"
                  >
                    <svg className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-mebel-border-muted">
                <motion.div
                  className="h-full rounded-full bg-mebel-tan"
                  style={{ width: `${progress}%` }}
                  transition={progressSpring}
                />
              </div>
            </div>

            {/* Book area */}
            <div
              className="relative flex shrink-0 items-center justify-center overflow-hidden px-2"
              style={{ height: bookSize.height }}
            >
              {bookSize.height > 0 && (
                <div
                  className="overflow-hidden"
                  style={{ width: bookSize.width, height: bookSize.height }}
                >
                  <FlipBookViewer
                    key={`${bucketBookDimension(bookSize.width)}x${bucketBookDimension(bookSize.height)}-${effectiveSinglePage}-${isFullscreen}`}
                    images={magazineSrcs}
                    orientation={magazine.orientation}
                    pageDimensions={magazine.page}
                    displayHeight={bookSize.height}
                    singlePage={effectiveSinglePage}
                    onBookReady={handleBookReady}
                    onReadyChange={setViewerReady}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}

              <AnimatePresence>
                {!viewerReady && (
                  <motion.div
                    className="absolute inset-0 z-10"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <LoadingSpinner overlay label="Завантаження..." />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="flex shrink-0 items-center justify-center px-2"
              style={{ height: PRICE_STRIP_HEIGHT }}
              aria-live="polite"
            >
              <div className="flex items-center" style={{ width: bookSize.width }}>
                {visiblePages.map((page, index) => (
                  <div key={index} className="flex min-w-0 flex-1 items-center justify-center">
                    {page?.priceFrom != null ? (
                      <span className="font-display text-base font-semibold text-mebel-olive tabular-nums sm:text-lg">
                        {formatPriceFrom(page.priceFrom)}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom bar — prev/next + toggle */}
            <div
              ref={footerRef}
              className="z-20 flex shrink-0 items-center justify-between border-t border-mebel-border bg-mebel-surface-raised px-4 py-3"
            >
              <button
                type="button"
                onClick={goToPrevPage}
                disabled={!canGoPrev}
                className={navButtonClass(isMobile)}
                aria-label="Попередня сторінка"
              >
                <ChevronLeft className={navIconClass(isMobile)} aria-hidden="true" />
              </button>

              {!isMobile && !forceSinglePage && (
                <div
                  className="flex items-center gap-3 bg-mebel-surface-raised/90 backdrop-blur-sm border border-mebel-border shadow rounded-full px-4 py-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className={`text-sm font-medium select-none transition-colors ${singlePage ? 'text-mebel-olive' : 'text-mebel-text-subtle'}`}>
                    Одна
                  </span>
                  <ToggleButton
                    value={!singlePage}
                    onToggle={() => setSinglePage((prev) => !prev)}
                    colors={{
                      activeThumb: { base: '#ffffff' },
                      inactiveThumb: { base: '#ffffff' },
                      active: { base: '#7C5A3A', hover: '#6A4C31' },
                      inactive: { base: '#e7ded2', hover: '#ddd4c8' },
                    }}
                  />
                  <span className={`text-sm font-medium select-none transition-colors ${!singlePage ? 'text-mebel-olive' : 'text-mebel-text-subtle'}`}>
                    Розворот
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={goToNextPage}
                disabled={!canGoNext}
                className={navButtonClass(isMobile)}
                aria-label="Наступна сторінка"
              >
                <ChevronRight className={navIconClass(isMobile)} aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MagazineModal;
