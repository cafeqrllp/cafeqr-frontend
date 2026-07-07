import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import * as S from '../CounterSale.styles';

export default function CategoryFilter({
  categories,
  activeCat,
  setActiveCat,
  theme
}) {
  const categoryScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const checkScrollLimits = useCallback(() => {
    const el = categoryScrollRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setHasOverflow(scrollWidth > clientWidth);
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollWidth - scrollLeft - clientWidth > 2);
    }
  }, []);

  useEffect(() => {
    const el = categoryScrollRef.current;
    if (el) {
      checkScrollLimits();
      const timeout = setTimeout(checkScrollLimits, 200);
      el.addEventListener('scroll', checkScrollLimits);
      window.addEventListener('resize', checkScrollLimits);

      const handleWheel = (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          return;
        }
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      };
      el.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        clearTimeout(timeout);
        el.removeEventListener('scroll', checkScrollLimits);
        window.removeEventListener('resize', checkScrollLimits);
        el.removeEventListener('wheel', handleWheel);
      };
    }
  }, [categories, activeCat, checkScrollLimits]);

  const scrollCarousel = (offset) => {
    const el = categoryScrollRef.current;
    if (el) {
      el.scrollBy({
        left: offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <S.CsCategoryCarouselWrapper>
      {hasOverflow && (
        <S.CsScrollArrowBtn
          type="button"
          disabled={!canScrollLeft}
          onClick={() => scrollCarousel(-180)}
          $themeColor={theme.main}
          $softColor={theme.soft}
          title="Scroll Left"
        >
          <FaChevronLeft size={10} />
        </S.CsScrollArrowBtn>
      )}

      <S.CsCategoryScroll ref={categoryScrollRef}>
        {categories.map(c => (
          <S.CsCatBtn 
            key={c} 
            $active={activeCat === c} 
            $themeColor={theme.main}
            onClick={() => setActiveCat(c)}
          >
            {c === 'ALL' ? 'Everything' : c}
          </S.CsCatBtn>
        ))}
      </S.CsCategoryScroll>

      {hasOverflow && (
        <S.CsScrollArrowBtn
          type="button"
          disabled={!canScrollRight}
          onClick={() => scrollCarousel(180)}
          $themeColor={theme.main}
          $softColor={theme.soft}
          title="Scroll Right"
        >
          <FaChevronRight size={10} />
        </S.CsScrollArrowBtn>
      )}
    </S.CsCategoryCarouselWrapper>
  );
}
