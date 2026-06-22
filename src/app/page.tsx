'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
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

  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a2744 0%, #0f1829 50%, #1a2744 100%)' }}>
      {/* Header */}
      <header className="flex-shrink-0 bg-white/95 backdrop-blur-md shadow-lg z-20 border-b border-gold/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-navy-light flex items-center justify-center shadow-md">
              <span className="text-gold font-bold text-sm tracking-wide">JMT</span>
            </div>
            <div>
              <h1 className="text-navy font-bold text-lg leading-tight tracking-tight">JUSTmyTHESIS™</h1>
              <p className="text-navy/50 text-xs font-medium">Academic Research Support</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="tel:+231776732989"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-navy text-white rounded-xl hover:bg-navy-light transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span className="hidden xs:inline">Call</span>
            </a>
          </div>
        </div>
      </header>

      {/* Card Container - Main Scrollable Area */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-3xl lg:max-w-4xl h-full">
          <div className="card-premium h-full flex flex-col" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            {/* Card Header with Image */}
            <div className="flex-shrink-0 relative h-32 sm:h-40 md:h-48 overflow-hidden rounded-t-3xl">
              {brochurePages.map((page) => (
                <div
                  key={`header-${page.id}`}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    page.id === currentPage ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <ImageBackground page={page} />
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
              
              {/* Logo Badge */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg border border-gold/20">
                <span className="text-navy font-bold text-xs sm:text-sm tracking-wide">JUSTmyTHESIS™</span>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollable-content">
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

// Image background component
function ImageBackground({ page }: { page: typeof brochurePages[0] }) {
  return (
    <div className="w-full h-full relative">
      {/* Gradient background as default */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #1a2744 0%, #2a3a5c 50%, #1a2744 100%)'
        }}
      />
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-gold/10 blur-3xl" />
      </div>
      {/* Icon placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-2 opacity-40">
            {getPageIcon(page.id)}
          </div>
        </div>
      </div>
    </div>
  );
}

function getPageIcon(pageId: number): string {
  const icons: Record<number, string> = {
    1: '🎓',
    2: '📚',
    3: '💼',
    4: '🎯',
    5: '📋',
    6: '🏆',
  };
  return icons[pageId] || '📖';
}
