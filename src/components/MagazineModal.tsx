import { useEffect, useState } from 'react';
import type { Magazine } from '../types';
import FlipBookViewer from './FlipBookViewer';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface MagazineModalProps {
  magazine: Magazine | null;
  isOpen: boolean;
  onClose: () => void;
}

const PADDING = 8;
const SWITCH_HEIGHT = 48;
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

  const availW = viewportWidth - PADDING * 2 - (isMobile ? 0 : ARROW_WIDTH * 2);
  const availH = viewportHeight - PADDING * 2 - SWITCH_HEIGHT;

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

  const totalWidth = isMobile ? width : width + ARROW_WIDTH * 2;
  const totalHeight = height + SWITCH_HEIGHT;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg overflow-hidden flex flex-col"
        style={{ width: totalWidth, height: totalHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar — toggle + close */}
        <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-100 shrink-0" style={{ height: SWITCH_HEIGHT }}>
          {!isMobile ? (
            <>
              <div className="w-8" />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSinglePage(true)}
                  className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${singlePage
                    ? 'bg-[#7C5A3A] text-white'
                    : 'text-[#7C5A3A] hover:bg-[#f5ede6]'
                    }`}
                >
                  Single page
                </button>
                <button
                  onClick={() => setSinglePage(false)}
                  className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${!singlePage
                    ? 'bg-[#7C5A3A] text-white'
                    : 'text-[#7C5A3A] hover:bg-[#f5ede6]'
                    }`}
                >
                  Double page
                </button>
              </div>
            </>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="bg-[#7C5A3A] text-white p-2 rounded-full hover:bg-[#6A4C31] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 min-h-0">
          <FlipBookViewer
            key={`${width}x${height}-${effectiveSinglePage}`}
            images={magazine.images}
            orientation={magazine.orientation}
            pageDimensions={magazine.page}
            displayHeight={height}
            singlePage={effectiveSinglePage}
          />
        </div>
      </div>
    </div>
  );
};

export default MagazineModal;
