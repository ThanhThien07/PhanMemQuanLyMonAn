/**
 * @file ThanhCuonNgang.jsx
 * @description Component thanh cuộn ngang hỗ trợ kéo chuột (Drag-to-scroll),
 * lăn bánh xe chuột (Mouse wheel to scroll) và nút mũi tên điều hướng (Left/Right Chevrons).
 * Giải quyết triệt để lỗi người dùng không thể bấm giữ để kéo duyệt danh mục trên máy tính.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ThanhCuonNgang({
  children,
  className = '',
  containerClassName = '',
  showArrows = true,
  fadeColor = 'from-slate-100',
  scrollStep = 240,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Kiểm tra vị trí cuộn để bật/tắt nút điều hướng
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();
    const rafId = requestAnimationFrame(updateScrollState);
    const timer = setTimeout(updateScrollState, 150);

    const handleScroll = () => updateScrollState();
    el.addEventListener('scroll', handleScroll, { passive: true });

    // Tự động nhận diện khi nội dung danh mục bên trong thay đổi độ rộng
    let ro = null;
    if (typeof window !== 'undefined' && window.ResizeObserver) {
      ro = new ResizeObserver(() => updateScrollState());
      ro.observe(el);
      Array.from(el.children).forEach((child) => ro.observe(child));
    }

    const handleResize = () => updateScrollState();
    window.addEventListener('resize', handleResize);

    // Hỗ trợ cuộn ngang bằng con lăn chuột (Mouse Wheel)
    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const isScrollable = el.scrollWidth > el.clientWidth;
        if (isScrollable) {
          const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
          const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1 && e.deltaY > 0;
          if (!atStart && !atEnd) {
            e.preventDefault();
            el.scrollLeft += e.deltaY;
            updateScrollState();
          }
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      if (ro) ro.disconnect();
    };
  }, [updateScrollState, children]);

  // Bắt đầu bấm giữ chuột (Mouse Down)
  const handleMouseDown = (e) => {
    // Chỉ kích hoạt khi click chuột trái
    if (e.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;

    isDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX;
    scrollLeftStartRef.current = el.scrollLeft;

    const handleMouseMove = (moveEvent) => {
      if (!isDownRef.current || !scrollRef.current) return;
      const walk = (moveEvent.pageX - startXRef.current) * 1.35;

      if (Math.abs(walk) > 4) {
        if (!hasDraggedRef.current) {
          hasDraggedRef.current = true;
          setIsDragging(true);
          document.body.style.userSelect = 'none';
          document.body.style.cursor = 'grabbing';
        }
        scrollRef.current.scrollLeft = scrollLeftStartRef.current - walk;
        updateScrollState();
      }
    };

    const handleMouseUp = () => {
      isDownRef.current = false;
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      // Chờ một nhịp nhỏ để ngăn click nhầm vào item con khi vừa kéo xong
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 70);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Ngăn chặn sự kiện click khi người dùng vừa thực hiện kéo chuột
  const handleClickCapture = (e) => {
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleScrollBy = (distance) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: distance, behavior: 'smooth' });
    }
  };

  return (
    <div className={`relative group/scroll ${containerClassName}`}>
      {/* Nút lướt sang trái */}
      {showArrows && canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-1 flex items-center z-10 pointer-events-none">
          <div className={`h-full w-14 bg-gradient-to-r ${fadeColor} via-${fadeColor.replace('from-', '')}/80 to-transparent`} />
          <button
            type="button"
            onClick={() => handleScrollBy(-scrollStep)}
            className="absolute left-0.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-90 pointer-events-auto cursor-pointer"
            title="Cuộn sang trái"
            aria-label="Cuộn sang trái"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Vùng cuộn ngang */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onClickCapture={handleClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className={`overflow-x-auto scrollbar-none flex items-center gap-2 px-1 pb-1 select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${className}`}
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: isDragging ? 'auto' : 'smooth',
        }}
      >
        {children}
      </div>

      {/* Nút lướt sang phải */}
      {showArrows && canScrollRight && (
        <div className="absolute right-0 top-0 bottom-1 flex items-center justify-end z-10 pointer-events-none">
          <div className={`h-full w-14 bg-gradient-to-l ${fadeColor} via-${fadeColor.replace('from-', '')}/80 to-transparent`} />
          <button
            type="button"
            onClick={() => handleScrollBy(scrollStep)}
            className="absolute right-0.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm border border-slate-200 shadow-md flex items-center justify-center text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-90 pointer-events-auto cursor-pointer"
            title="Cuộn sang phải"
            aria-label="Cuộn sang phải"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
