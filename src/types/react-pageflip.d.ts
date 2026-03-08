import React from 'react';

declare module 'react-pageflip' {
  interface PageFlip {
    flipNext(): void;
    flipPrev(): void;
  }

  interface HTMLFlipBookProps {
    width: number;
    height: number;
    size: string;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    startPage?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    clickEventForward?: boolean;
    style?: React.CSSProperties;
    className?: string;
    onFlip?: (e: { data: number }) => void;
    onChangeOrientation?: (e: { data: string }) => void;
    onChangeState?: (e: { data: string }) => void;
    children: React.ReactNode;
  }

  class HTMLFlipBook extends React.Component<HTMLFlipBookProps> {
    pageFlip(): PageFlip;
  }

  export default HTMLFlipBook;
}
