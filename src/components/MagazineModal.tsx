import { useEffect, useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';
import type { Magazine } from '../types';
import FlipBookViewer, { type FlipBookRef } from './FlipBookViewer';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useReducedMotion } from '../hooks/useReducedMotion';
import ToggleButton from 'react-toggle-button';
import { assetUrl } from '../utils/assets';

interface MagazineModalProps {
  magazine: Magazine | null;
  isOpen: boolean;
  onClose: () => void;
}

const PADDING = 8;
const ARROW_WIDTH = 48;
const HEADER_HEIGHT = 52;
const FILMSTRIP_HEIGHT = 88;
const BOTTOM_BAR_HEIGHT = 56;

function getModalDimensions(
  magazine: Magazine,
  isMobile: boolean,
  singlePage: boolean,
  viewportWidth: number,
  viewportHeight: number,
  isFullscreen: boolean
) {
  const pageAspect = magazine.page.width / magazine.page.height;
  const spreadAspect = isMobile || singlePage ? pageAspect : pageAspect * 2;

  const horizontalReserve = isFullscreen
    ? PADDING * 2
    : PADDING * 4 + (isMobile ? 0 : ARROW_WIDTH * 2);
  const verticalReserve = isFullscreen
    ? HEADER_HEIGHT + FILMSTRIP_HEIGHT + BOTTOM_BAR_HEIGHT + PADDING * 2
    : HEADER_HEIGHT + FILMSTRIP_HEIGHT + BOTTOM_BAR_HEIGHT + PADDING * 4;

  const availW = viewportWidth - horizontalReserve;
  const availH = viewportHeight - verticalReserve;

  let width = availW;
  let height = width / spreadAspect;

  if (height > availH) {
    height = availH;
    width = height * spreadAspect;
  }

  return { width: Math.round(width), height: Math.round(height) };
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
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
      const timeout = setTimeout(() => setSinglePage(magazine.page.spread === 'single'), 0);
      return () => clearTimeout(timeout);
    }
  }, [magazine]);

  useEffect(() => {
    if (!isOpen || !magazine) return;

    const timeout = setTimeout(() => {
      setFlipRef(null);
      setViewerReady(false);
      setCurrentPage(0);
      setIsFullscreen(false);
    }, 0);
    return () => clearTimeout(timeout);
  }, [isOpen, isMobile, magazine, singlePage]);

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

  useEffect(() => {
    const activeThumb = thumbnailRefs.current[currentPage];
    activeThumb?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [currentPage, prefersReducedMotion]);

  const handleBookReady = useCallback((ref: FlipBookRef) => {
    setFlipRef(ref);
    const pageIndex = ref.pageFlip().getCurrentPageIndex();
    setCurrentPage(pageIndex);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleThumbnailClick = (index: number) => {
    flipRef?.pageFlip()?.turnToPage(index);
    setCurrentPage(index);
  };

  if (!magazine) return null;

  const effectiveSinglePage = isMobile ? true : singlePage;

  const { width, height } = getModalDimensions(
    magazine,
    isMobile,
    singlePage,
    viewport.width,
    viewport.height,
    isFullscreen
  );

  const totalWidth = isFullscreen
    ? viewport.width
    : isMobile
      ? Math.min(width, viewport.width - PADDING * 2)
      : width + ARROW_WIDTH * 2;

  const totalHeight = isFullscreen
    ? viewport.height
    : height + HEADER_HEIGHT + FILMSTRIP_HEIGHT + BOTTOM_BAR_HEIGHT;

  const totalPages = magazine.images.length;
  const displayPage = Math.min(currentPage + 1, totalPages);
  const progress = totalPages > 0 ? (displayPage / totalPages) * 100 : 0;

  const pageAspect = magazine.page.width / magazine.page.height;
  const skeletonPageWidth = isMobile
    ? Math.min(width, viewport.width - PADDING * 4)
    : Math.round((height - 16) * pageAspect);
  const skeletonPageHeight = height - 16;

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
            className={`relative overflow-hidden bg-mebel-surface-raised shadow-mebel-md ${
              isFullscreen
                ? 'fixed inset-0 h-screen w-screen rounded-none'
                : 'rounded-lg'
            }`}
            style={isFullscreen ? undefined : { width: totalWidth, height: totalHeight }}
            initial={prefersReducedMotion ? instant : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? instant : { opacity: 0, scale: 0.96, y: 8 }}
            transition={panelSpring}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — page progress */}
            <div className="relative z-20 border-b border-mebel-border bg-mebel-surface-raised px-4 pt-3 pb-2">
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
              className="relative flex items-center justify-center px-2"
              style={{ height: height + 8 }}
            >
              <FlipBookViewer
                key={`${width}x${height}-${effectiveSinglePage}-${isFullscreen}`}
                images={magazine.images}
                orientation={magazine.orientation}
                pageDimensions={magazine.page}
                displayHeight={height - 8}
                singlePage={effectiveSinglePage}
                onBookReady={handleBookReady}
                onReadyChange={setViewerReady}
                onPageChange={handlePageChange}
              />

              <AnimatePresence>
                {!viewerReady && (
                  <motion.div
                    className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-mebel-surface-raised/80 px-4"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className="animate-pulse rounded-lg border border-mebel-border bg-mebel-skeleton"
                      style={{ width: skeletonPageWidth, height: skeletonPageHeight }}
                    />
                    {!isMobile && !effectiveSinglePage && (
                      <div
                        className="animate-pulse rounded-lg border border-mebel-border bg-mebel-skeleton"
                        style={{ width: skeletonPageWidth, height: skeletonPageHeight }}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Thumbnail filmstrip */}
            <div
              className="border-t border-mebel-border bg-mebel-cream px-3 py-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ height: FILMSTRIP_HEIGHT }}
            >
              <div className="flex gap-2 min-w-min">
                {magazine.images.map((image, index) => (
                  <button
                    key={index}
                    ref={(el) => {
                      thumbnailRefs.current[index] = el;
                    }}
                    type="button"
                    onClick={() => handleThumbnailClick(index)}
                    className={`shrink-0 overflow-hidden rounded-lg border border-mebel-border transition-shadow ${
                      currentPage === index ? 'ring-2 ring-mebel-tan' : ''
                    }`}
                    aria-label={`Перейти до сторінки ${index + 1}`}
                    aria-current={currentPage === index ? 'true' : undefined}
                  >
                    <img
                      src={assetUrl(image)}
                      alt={`Мініатюра сторінки ${index + 1}`}
                      width={52}
                      height={72}
                      className="h-[72px] w-[52px] object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom overlay bar — prev/next + toggle */}
            <div
              className="flex items-center justify-between border-t border-mebel-border bg-mebel-surface-raised px-4 z-20"
              style={{ height: BOTTOM_BAR_HEIGHT }}
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
