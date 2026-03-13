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

function getModalDimensions(
  magazine: Magazine,
  isMobile: boolean,
  viewportWidth: number,
  viewportHeight: number
) {
  const pageAspect = magazine.page.width / magazine.page.height;
  const spreadAspect = isMobile ? pageAspect : pageAspect * 2;

  const availW = viewportWidth - PADDING * 2;
  const availH = viewportHeight - PADDING * 2;

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

  const { width, height } = getModalDimensions(
    magazine,
    isMobile,
    viewport.width,
    viewport.height
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-lg overflow-hidden"
        style={{ width, height }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-[#7C5A3A] text-white p-2 rounded-full hover:bg-[#6A4C31] transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <FlipBookViewer
          key={`${width}x${height}`}
          images={magazine.images}
          orientation={magazine.orientation}
          pageDimensions={magazine.page}
          displayHeight={height}
        />
      </div>
    </div>
  );
};

export default MagazineModal;
