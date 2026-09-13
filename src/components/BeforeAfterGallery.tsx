import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, Instagram, MoveHorizontal, Check, Info } from 'lucide-react';
import { BEFORE_AFTER_DATA, COMPANY_INFO } from '../data/cleaningData';
import { BeforeAfterItem } from '../types';

interface BeforeAfterSliderProps {
  item: BeforeAfterItem;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ item }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Measure container width accurately on mount and resize
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    handleMove(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
      <div>
        {/* Slider interactive viewport */}
        <div
          ref={containerRef}
          className="relative h-72 sm:h-80 w-full overflow-hidden select-none cursor-ew-resize touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* AFTER Image (Full background) */}
          <img
            src={item.afterImage}
            alt={`${item.title} - After Cleaning`}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#00A8AD] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md pointer-events-none flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#BFEDEE]" />
            <span>AFTER (Clean)</span>
          </div>

          {/* BEFORE Image (Clipped overlay) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={item.beforeImage}
              alt={`${item.title} - Before Cleaning`}
              referrerPolicy="no-referrer"
              className="absolute inset-0 h-full object-cover pointer-events-none max-w-none"
              style={{
                width: containerWidth > 0 ? `${containerWidth}px` : '100%',
                height: '100%',
              }}
            />
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#063F4D]/90 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
              BEFORE (Dirty)
            </div>
          </div>

          {/* Divider Line & Drag Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl pointer-events-none"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-[#063F4D] shadow-lg flex items-center justify-center border-2 border-[#00A8AD]">
              <MoveHorizontal className="w-4 h-4" />
            </div>
          </div>

          {/* Slider drag tip */}
          <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
            <span className="text-[10px] font-semibold bg-black/60 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm shadow-xs">
              Drag slider left or right
            </span>
          </div>
        </div>

        {/* Info Content */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#00A8AD] uppercase tracking-wider">
              {item.category}
            </span>
            <span className="text-xs text-slate-400 font-medium">{item.tag}</span>
          </div>

          <h3 className="text-lg font-bold text-[#063F4D] leading-snug">
            {item.title}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {item.description}
          </p>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
            {item.specs.map((spec, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
              >
                <Check className="w-3 h-3 text-[#00A8AD]" />
                {spec}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const BeforeAfterGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Carpet Cleaning', 'Air Duct Cleaning', 'Window Cleaning'];

  const filteredItems = selectedCategory === 'All'
    ? BEFORE_AFTER_DATA
    : BEFORE_AFTER_DATA.filter((item) => item.category === selectedCategory);

  return (
    <section id="our-work" className="py-20 lg:py-28 bg-[#F5F8F8] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#BFEDEE]/60 text-[#063F4D] text-xs font-extrabold uppercase tracking-widest">
            GALLERY OF RESULTS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#063F4D] tracking-tight">
            See the Prime X-Press Difference
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Real cleaning. Visible results.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#063F4D] text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <BeforeAfterSlider key={item.id} item={item} />
          ))}
        </div>

        {/* Easy replacement notice for client */}
        <div className="mt-8 p-4 rounded-xl bg-white/70 border border-slate-200 text-slate-500 text-xs flex items-center justify-center gap-2 text-center">
          <Info className="w-4 h-4 text-[#00A8AD] shrink-0" />
          <span>
            Project showcase samples displayed above. Customer job photos from Winnipeg jobs are continually documented and updated directly from the field.
          </span>
        </div>

        {/* Instagram Follow Box */}
        <div className="mt-12 text-center p-8 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <Instagram className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#063F4D]">
            Follow our latest work on Instagram
          </h3>
          <p className="text-sm text-slate-600 mt-1 mb-5">
            Check out video clips, vent inspections, and live job-site before & afters across Winnipeg on {COMPANY_INFO.instagramHandle}.
          </p>
          <a
            id="gallery-instagram-btn"
            href={COMPANY_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#063F4D] hover:bg-[#00A8AD] text-white font-bold text-sm shadow-md transition-all duration-200"
          >
            <span>View Our Instagram</span>
            <Instagram className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
