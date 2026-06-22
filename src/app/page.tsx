'use client';

import { useState, useEffect, useCallback } from 'react';
import BrochureCard from '@/components/BrochureCard';
import NavigationControls from '@/components/NavigationControls';
import { brochurePages } from '@/data/brochurePages';

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = brochurePages.length;

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const handleBack = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handleBack]);

  // Touch/swipe support
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 50;

      if (touchStartX - touchEndX > swipeThreshold) {
        handleNext();
      } else if (touchEndX - touchStartX > swipeThreshold) {
        handleBack();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleNext, handleBack]);

  return (
    <main className="min-h-screen bg-navy flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-navy to-navy-light rounded-lg flex items-center justify-center">
              <span className="text-gold font-bold text-sm">JMT</span>
            </div>
            <div>
              <h1 className="text-navy font-bold text-lg leading-tight">JUSTmyTHESIS™</h1>
              <p className="text-navy/50 text-xs">Academic Research Support</p>
            </div>
          </div>
          <a
            href="tel:+231776732989"
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span className="hidden sm:inline">Call Now</span>
          </a>
        </div>
      </header>

      {/* Card Container */}
      <div className="flex-1 flex flex-col pb-20">
        <div className="flex-1 max-w-4xl w-full mx-auto my-4 md:my-6">
          <div className="relative h-full bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ minHeight: 'calc(100vh - 180px)' }}>
            {brochurePages.map((page) => (
              <BrochureCard
                key={page.id}
                page={page}
                isActive={page.id === currentPage}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <NavigationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onNext={handleNext}
        onBack={handleBack}
      />
    </main>
  );
}
