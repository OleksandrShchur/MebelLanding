import { useEffect, useState } from 'react';
import type { Magazine } from '../types';
import FlipBookViewer from './FlipBookViewer';
import { useMediaQuery } from '../hooks/useMediaQuery';
import ToggleButton from 'react-toggle-button';

interface MagazineModalProps {
  magazine: Magazine | null;
  isOpen: boolean;
  onClose: () => void;
}

const PADDING = 8;
const ARROW_WIDTH = 56;

function getModalDimensions(
  magazine: Magazine,
  isMobile: boolean,
  singlePage: boolean,
  viewportWidth: number,
  viewportHeight: number
) {
  const pageAspect = magazine.page.width / magazine.page.height;
  const spreadAspect = (isMobile || singlePage) ? pageAspect : pageAspect * 2;

  const availW = viewportWidth - PADDING * 4 - (isMobile ? 0 : ARROW_WIDTH * 2);
  const availH = viewportHeight - PADDING * 4;

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
  const [singlePage, setSinglePage] = useState(false);
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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
  }, [magazine?.id]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !magazine) return null;

  const effectiveSinglePage = isMobile ? true : singlePage;

  const { width, height } = getModalDimensions(
    magazine,
    isMobile,
    singlePage,
    viewport.width,
    viewport.height
  );

  const totalWidth = isMobile
    ? Math.min(width, viewport.width - PADDING * 2)
    : width + ARROW_WIDTH * 2;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Modal content */}
      <div
        className="relative bg-white rounded-lg overflow-hidden"
        style={{ width: totalWidth, height }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Book area */}
        <FlipBookViewer
          key={`${width}x${height}-${effectiveSinglePage}`}
          images={magazine.images}
          orientation={magazine.orientation}
          pageDimensions={magazine.page}
          displayHeight={height}
          singlePage={effectiveSinglePage}
        />

        {/* Close button — absolute top-right corner */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-[#7C5A3A] text-white p-2 rounded-full hover:bg-[#6A4C31] transition-all z-10 shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Toggle — desktop only, fixed to bottom center of screen */}
      {!isMobile && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-full px-4 py-2 z-[60]"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className={`text-sm font-medium transition-colors select-none ${singlePage ? 'text-[#7C5A3A]' : 'text-gray-400'
              }`}
          >
            Single
          </span>

          <ToggleButton
            value={!singlePage}
            onToggle={() => setSinglePage((prev) => !prev)}
            colors={{
              activeThumb: { base: '#ffffff' },
              inactiveThumb: { base: '#ffffff' },
              active: {
                base: '#7C5A3A',
                hover: '#6A4C31',
              },
              inactive: {
                base: '#d1d5db',
                hover: '#9ca3af',
              },
            }}
          />

          <span
            className={`text-sm font-medium transition-colors select-none ${!singlePage ? 'text-[#7C5A3A]' : 'text-gray-400'
              }`}
          >
            Double
          </span>
        </div>
      )}
    </div>
  );
};

export default MagazineModal;
