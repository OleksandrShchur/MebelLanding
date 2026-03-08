import { useEffect } from 'react';
import type { Magazine } from '../types';
import FlipBookViewer from './FlipBookViewer';

interface MagazineModalProps {
  magazine: Magazine | null;
  isOpen: boolean;
  onClose: () => void;
}

const MagazineModal = ({ magazine, isOpen, onClose }: MagazineModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
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
  }, [isOpen, onClose]);

  if (!isOpen || !magazine) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="relative w-full h-full max-w-6xl max-h-screen bg-white rounded-lg overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Magazine Info */}
        <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-90 p-4 rounded-lg">
          <h2 className="text-xl font-bold">{magazine.name}</h2>
          <p className="text-gray-600">{magazine.description}</p>
          <p className="text-lg font-semibold text-blue-600">${magazine.price}</p>
        </div>

        {/* Flip Book Viewer */}
        <FlipBookViewer images={magazine.images} orientation={magazine.orientation} />
      </div>
    </div>
  );
};

export default MagazineModal;
