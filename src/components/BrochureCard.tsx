'use client';

import Image from 'next/image';
import { BrochurePage } from '@/data/brochurePages';

interface BrochureCardProps {
  page: BrochurePage;
  isActive: boolean;
}

// Placeholder image configurations based on page
const placeholderConfig: Record<string, { icon: string; label: string }> = {
  '/images/hero-students.jpg': { icon: '🎓', label: 'Students' },
  '/images/academic-support.jpg': { icon: '📚', label: 'Academic Support' },
  '/images/research-workspace.jpg': { icon: '💻', label: 'Research Workspace' },
  '/images/thesis-defense.jpg': { icon: '🎯', label: 'Defense' },
  '/images/research-process.jpg': { icon: '📋', label: 'Process' },
  '/images/graduate-success.jpg': { icon: '🏆', label: 'Success' },
};

export default function BrochureCard({ page, isActive }: BrochureCardProps) {
  const isPage1 = page.id === 1;
  const isPage6 = page.id === 6;
  const placeholder = placeholderConfig[page.image] || { icon: '📖', label: 'Academic' };

  return (
    <div
      className={`absolute inset-0 flex flex-col transition-all duration-700 ease-out transform ${
        isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      }`}
    >
      {/* Hero Image with Fallback */}
      <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
        <Image
          src={page.image}
          alt={page.title}
          fill
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.style.background = 'linear-gradient(135deg, #1a2744 0%, #2a3a5c 50%, #1a2744 100%)';
              // Add placeholder content
              parent.innerHTML = `
                <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #d4a847;">
                  <div style="font-size: 4rem; margin-bottom: 0.5rem;">${placeholder.icon}</div>
                  <div style="font-family: Georgia, serif; font-size: 1.5rem; font-weight: bold;">${placeholder.label}</div>
                </div>
              `;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/30 via-transparent to-navy/80" />
        
        {/* Logo Badge */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
          <span className="text-navy font-bold text-sm tracking-wide">JUSTmyTHESIS™</span>
        </div>

        {/* Page Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-navy via-navy/90 to-transparent">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">
            {page.title}
          </h2>
          {page.tagline && (
            <p className="mt-2 text-gold font-medium text-lg md:text-xl whitespace-pre-line">
              {page.tagline}
            </p>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        {/* Intro Content for Page 1 */}
        {isPage1 && page.content && (
          <div className="p-6 bg-gradient-to-b from-gold/10 to-transparent border-b border-gold/20">
            {page.content.map((line, idx) => (
              <p key={idx} className={`text-navy ${idx === 0 ? 'text-lg font-semibold' : 'text-base text-navy/70'}`}>
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Sections */}
        <div className="p-6 space-y-6">
          {page.sections?.map((section, sectionIdx) => (
            <div key={sectionIdx} className="space-y-3">
              {section.title && (
                <h3 className={`font-bold text-navy ${
                  section.title.startsWith('Step') ? 'text-lg text-gold' : 
                  section.title.startsWith('Package') ? 'text-base' : 
                  'text-base uppercase tracking-wider text-navy/60'
                }`}>
                  {section.title}
                </h3>
              )}
              
              {section.highlight && (
                <p className={`text-navy/80 leading-relaxed ${
                  section.title?.startsWith('Step') ? 'pl-4 border-l-4 border-gold' : ''
                }`}>
                  {section.highlight}
                </p>
              )}
              
              {section.items && section.items.length > 0 && (
                <ul className={`space-y-2 ${section.title?.startsWith('WHY') || section.title?.startsWith('STRUGGLING') ? 'grid grid-cols-1 md:grid-cols-2 gap-2' : ''}`}>
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className={`flex items-start gap-3 ${
                      section.title?.startsWith('WHY') || section.title?.startsWith('STRUGGLING') ? '' : 'text-navy/70'
                    }`}>
                      {!(section.title?.startsWith('WHY') || section.title?.startsWith('STRUGGLING')) && !item.startsWith('  •') && (
                        <span className="text-gold mt-1.5">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                      <span className={`${item.startsWith('  ') ? 'pl-6 text-navy/70 text-sm' : 'text-navy/80'}`}>
                        {item.startsWith('Undergraduate:') || item.startsWith("Master's:") || item.startsWith('Doctoral:') ? (
                          <span className="font-bold text-navy">{item}</span>
                        ) : item.startsWith('Best For:') || item.startsWith('Deliverables:') || item.startsWith('Outcome:') ? (
                          <span className="font-semibold text-navy">{item}</span>
                        ) : (
                          item
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section for Page 1 and 6 */}
        {(isPage1 || isPage6) && page.cta && (
          <div className="p-6 bg-gradient-to-t from-gold/20 to-gold/5 border-t border-gold/30">
            <a
              href={page.cta.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
            >
              <span className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {page.cta.text}
              </span>
            </a>
            
            {page.contact && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-navy/70">
                <a href={`tel:${page.contact.phone}`} className="flex items-center gap-2 hover:text-navy transition-colors">
                  <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {page.contact.phone}
                </a>
                <span className="hidden sm:block text-gold">•</span>
                <a href={`mailto:${page.contact.email}`} className="flex items-center gap-2 hover:text-navy transition-colors">
                  <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {page.contact.email}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
