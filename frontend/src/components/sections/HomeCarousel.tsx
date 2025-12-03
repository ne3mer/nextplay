'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { HomeCarouselSlide } from '@/data/homeContent';

type Props = {
  slides?: HomeCarouselSlide[];
};

const accentBackground: Record<string, string> = {
  emerald: 'from-emerald-600 via-emerald-500 to-emerald-400',
  indigo: 'from-indigo-700 via-indigo-600 to-slate-900',
  rose: 'from-rose-600 via-pink-500 to-orange-400',
  slate: 'from-slate-900 via-slate-800 to-slate-700'
};

const accentBorder: Record<string, string> = {
  emerald: 'border-emerald-200/30',
  indigo: 'border-slate-100/30',
  rose: 'border-orange-100/30',
  slate: 'border-slate-100/30'
};

export const HomeCarousel = ({ slides = [] }: Props) => {
  const items = useMemo(
    () => slides.filter((slide) => slide?.id && slide?.title && slide?.imageUrl),
    [slides]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) {
    return null;
  }

  const currentIndex = ((activeIndex % items.length) + items.length) % items.length;
  const slide = items[currentIndex];
  const background = accentBackground[slide.accent] ?? accentBackground.slate;
  const border = accentBorder[slide.accent] ?? accentBorder.slate;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <section className={`overflow-hidden rounded-[40px] border ${border} bg-gradient-to-br ${background} p-8 text-white shadow-2xl`}>
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-4">
          <span className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
            {slide.badge}
          </span>
          <div className="space-y-3">
            <p className="text-sm text-white/70">{slide.subtitle}</p>
            <h2 className="text-3xl font-black md:text-4xl">{slide.title}</h2>
            <p className="text-sm leading-relaxed text-white/80">{slide.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={slide.ctaHref}
              className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-lg"
            >
              {slide.ctaLabel}
            </Link>
            <Link
              href="/games"
              className="rounded-2xl border border-white/40 px-6 py-3 text-sm font-bold text-white/90"
            >
              همه بازی‌ها
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <div className="relative mx-auto h-64 max-w-md overflow-hidden rounded-[32px] bg-white/5 p-4 backdrop-blur">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/10 to-transparent" />
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              sizes="(max-width: 768px) 90vw, 400px"
              className="object-contain"
            />
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all ${index === currentIndex ? 'w-10 bg-white' : 'w-4 bg-white/40'}`}
              aria-label={`نمایش ${item.title}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrev}
            className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            قبلی
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            بعدی
          </button>
        </div>
      </div>
    </section>
  );
};
