'use client';

interface NavigationControlsProps {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onBack: () => void;
}

export default function NavigationControls({
  currentPage,
  totalPages,
  onNext,
  onBack
}: NavigationControlsProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="flex-shrink-0 bg-white/95 backdrop-blur-md border-t border-gold/10 shadow-[0_-4px_30px_rgba(26,39,68,0.15)]">
      {/* Progress Bar */}
      <div className="h-1 bg-navy/5">
        <div 
          className="h-full bg-gradient-to-r from-gold via-gold-light to-gold transition-all duration-500 ease-out"
          style={{ width: `${(currentPage / totalPages) * 100}%` }}
        />
      </div>

      {/* Navigation */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Back Button */}
          <button
            onClick={onBack}
            disabled={isFirstPage}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
              isFirstPage 
                ? 'opacity-0 cursor-not-allowed' 
                : 'bg-navy text-white hover:bg-navy-light shadow-md hover:shadow-lg active:scale-95'
            }`}
            aria-label="Go to previous page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* Page Indicator with Elegant Dots */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-bold text-navy">
              <span className="text-gold">{currentPage}</span>
              <span className="text-navy/30 mx-1">/</span>
              <span className="text-navy/50">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const diff = i + 1 - currentPage;
                    if (diff > 0) {
                      for (let j = 0; j < diff; j++) onNext();
                    } else {
                      for (let j = 0; j < Math.abs(diff); j++) onBack();
                    }
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    i + 1 === currentPage 
                      ? 'w-6 h-2 bg-gradient-to-r from-gold to-gold-light shadow-md' 
                      : i + 1 < currentPage 
                        ? 'w-2 h-2 bg-gold/40 hover:bg-gold/60' 
                        : 'w-2 h-2 bg-navy/20 hover:bg-navy/30'
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Next / WhatsApp CTA Button */}
          {isLastPage ? (
            <a
              href="https://wa.me/231776732989?text=Hello%20JUSTmyTHESIS%2C%20I%20would%20like%20a%20FREE%20Project%20Assessment."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95"
              aria-label="Contact via WhatsApp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          ) : (
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-navy font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
              aria-label="Go to next page"
            >
              <span className="hidden sm:inline">Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Keyboard Hint - Hidden on mobile */}
      <div className="hidden lg:flex items-center justify-center gap-8 pb-3 text-xs text-navy/30">
        <span className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-navy/5 rounded-lg border border-navy/10 font-mono">←</kbd>
          <span className="text-navy/50">Previous</span>
        </span>
        <span className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-navy/5 rounded-lg border border-navy/10 font-mono">→</kbd>
          <span className="text-navy/50">Next</span>
        </span>
      </div>
    </div>
  );
}
