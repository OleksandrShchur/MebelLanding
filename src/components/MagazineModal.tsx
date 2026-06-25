import { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';
import type { Magazine } from '../types';
import FlipBookViewer, { type FlipBookRef } from './FlipBookViewer';
import LoadingSpinner from './LoadingSpinner';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useReducedMotion } from '../hooks/useReducedMotion';
import ToggleButton from 'react-toggle-button';

interface MagazineModalProps {
  magazine: Magazine | null;
  isOpen: boolean;
  onClose: () => void;
}

const PADDING = 8;
const HEADER_FALLBACK = 72;
const FOOTER_FALLBACK = 80;
const BOOK_HORIZONTAL_PADDING = 16;

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
  const availH = viewportHeight - verticalInset - headerHeight - footerHeight;

  return fitBookSize(magazine, isMobile, singlePage, availW, availH);
}

const MagazineModal = ({ magazine, isOpen, onClose }: MagazineModalProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const prefersReducedMotion = useReducedMotion();
  const [singlePage, setSinglePage] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));
  const [flipRef, setFlipRef] = useState<FlipBookRef | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
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
      setSinglePage(magazine.page.spread === 'single');
    }
  }, [magazine]);

  useEffect(() => {
    if (!isOpen) {
      setViewerReady(false);
      setFlipRef(null);
      setCurrentPage(0);
      setIsFullscreen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !magazine) return;
    setFlipRef(null);
    setCurrentPage(0);
  }, [isOpen, magazine]);

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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isFullscreen, onClose]);

  const handleBookReady = useCallback((ref: FlipBookRef) => {
    setFlipRef(ref);
    const pageIndex = ref.pageFlip().getCurrentPageIndex();
    setCurrentPage(pageIndex);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  if (!magazine) return null;

  const effectiveSinglePage = isMobile ? true : singlePage;

  const headerHeight = chromeHeights.header || HEADER_FALLBACK;
  const footerHeight = chromeHeights.footer || FOOTER_FALLBACK;

  const bookSize =
    getAvailableBookArea(
      magazine,
      isMobile,
      singlePage,
      viewport.width,
      viewport.height,
      isFullscreen,
      headerHeight,
      footerHeight
    ) ?? { width: 0, height: 0 };

  const modalWidth = isFullscreen
    ? viewport.width
    : Math.min(bookSize.width + BOOK_HORIZONTAL_PADDING, viewport.width - PADDING * 2);

  const totalPages = magazine.images.length;
  const displayPage = Math.min(currentPage + 1, totalPages);
  const progress = totalPages > 0 ? (displayPage / totalPages) * 100 : 0;

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
            {/* Header — page progress */}
            <div
              ref={headerRef}
              className="relative z-20 shrink-0 border-b border-mebel-border bg-mebel-surface-raised px-4 pt-3 pb-2"
            >
              <div className="flex items-center justify-center min-h-[28px]">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={displayPage}
                    className="text-sm font-medium text-mebel-text-subtle"
                    initial={prefersReducedMotion ? instant : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReducedMotion ? instant : { opacity: 0, y: -6 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    Сторінка {displayPage} / {totalPages}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-mebel-border-muted">
                <motion.div
                  className="h-full rounded-full bg-mebel-tan"
                  style={{ width: `${progress}%` }}
                  transition={progressSpring}
                />
              </div>
            </div>

            {/* Top-right controls */}
            <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5">
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
                    key={`${bookSize.width}x${bookSize.height}-${effectiveSinglePage}-${isFullscreen}`}
                    images={magazine.images}
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

            {/* Bottom bar — prev/next + toggle */}
            <div
              ref={footerRef}
              className="z-20 flex shrink-0 items-center justify-between border-t border-mebel-border bg-mebel-surface-raised px-4 py-3"
            >
              <button
                type="button"
                onClick={() => flipRef?.pageFlip()?.flipPrev()}
                className={`bg-mebel-olive text-white rounded-full hover:bg-mebel-olive-dark transition-all shadow-md ${isMobile ? 'p-2' : 'p-3'}`}
                aria-label="Попередня сторінка"
              >
                <svg className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {!isMobile && (
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
                onClick={() => flipRef?.pageFlip()?.flipNext()}
                className={`bg-mebel-olive text-white rounded-full hover:bg-mebel-olive-dark transition-all shadow-md ${isMobile ? 'p-2' : 'p-3'}`}
                aria-label="Наступна сторінка"
              >
                <svg className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MagazineModal;
