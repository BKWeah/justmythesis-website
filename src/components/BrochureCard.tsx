'use client';

import { BrochurePage } from '@/data/brochurePages';

interface BrochureCardProps {
  page: BrochurePage;
  isActive: boolean;
}

export default function BrochureCard({ page, isActive }: BrochureCardProps) {
  const isPage1 = page.id === 1;
  const isPage6 = page.id === 6;

  return (
    <div
      className={`w-full h-full flex flex-col transition-all duration-500 ease-out ${
        isActive ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'
      }`}
    >
      {/* Only render content for active page or when card is being shown */}
      <div className="flex-1 overflow-y-auto scrollable-content bg-white">
        {/* Page Title Header - visible on all pages */}
        <div className="sticky top-0 z-10 bg-white border-b border-gold/10 px-4 sm:px-6 py-4">
          <h2 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">
            {page.title}
          </h2>
          {page.tagline && (
            <p className="mt-1 text-gold font-medium text-base sm:text-lg whitespace-pre-line">
              {page.tagline}
            </p>
          )}
        </div>

        {/* Page 1 Special Design */}
        {isPage1 && (
          <div className="px-4 sm:px-6 py-6 space-y-6">
            {/* Welcome Message */}
            <div className="bg-gradient-to-br from-navy/5 via-gold/5 to-navy/5 rounded-2xl p-5 border border-gold/20">
              <p className="text-navy font-semibold text-lg leading-relaxed">
                Whether you are just starting your research journey or preparing for final submission,{' '}
                <span className="text-gold font-bold">JUSTmyTHESIS™</span> is here to support you every step of the way.
              </p>
            </div>

            {/* Struggling With Section - Pill Cards */}
            <div className="space-y-4">
              <h3 className="text-sm uppercase tracking-wider text-navy/60 font-semibold flex items-center gap-2">
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Struggling With?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {page.sections?.[0]?.items?.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-navy/10 shadow-sm hover:shadow-md hover:border-gold/30 transition-all duration-200"
                  >
                    <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                    <span className="text-navy/80 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-2">
              <a
                href={page.cta?.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Request FREE Project Assessment
              </a>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`tel:${page.contact?.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-navy text-white font-semibold rounded-xl hover:bg-navy-light transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Call Now
                </a>
                <a
                  href={`mailto:${page.contact?.email}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white text-navy border border-navy/20 font-semibold rounded-xl hover:bg-navy/5 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Email Us
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Page 2 - Who We Are */}
        {page.id === 2 && (
          <div className="px-4 sm:px-6 py-6 space-y-6">
            {page.sections?.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-sm uppercase tracking-wider text-gold font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {section.title}
                </h3>
                
                {section.highlight && (
                  <p className="text-navy/80 leading-relaxed text-base">
                    {section.highlight}
                  </p>
                )}
                
                {section.items && (
                  <div className="grid gap-2">
                    {section.items.map((item, itemIdx) => (
                      <div 
                        key={itemIdx}
                        className="flex items-start gap-3 p-3 bg-gradient-to-r from-navy/5 to-transparent rounded-lg border-l-2 border-gold"
                      >
                        <svg className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-navy/80 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pages 3 & 4 - Service Packages */}
        {(page.id === 3 || page.id === 4) && (
          <div className="px-4 sm:px-6 py-6 space-y-6">
            {page.sections?.map((section, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-navy/10 shadow-sm overflow-hidden"
              >
                <div className="bg-gradient-to-r from-navy to-navy-light px-4 py-3">
                  <h3 className="text-white font-bold text-base sm:text-lg">
                    {section.title}
                  </h3>
                </div>
                
                {section.highlight && (
                  <div className="px-4 py-3 bg-gold/10 border-b border-gold/20">
                    <p className="text-navy/80 text-sm italic">{section.highlight}</p>
                  </div>
                )}
                
                {section.items && (
                  <div className="p-4 space-y-2">
                    {section.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                        <span className={`text-sm ${item.startsWith('Best For:') || item.startsWith('Deliverables:') || item.startsWith('Outcome:') ? 'font-semibold text-navy' : 'text-navy/70'}`}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Page 5 - Service Process */}
        {page.id === 5 && (
          <div className="px-4 sm:px-6 py-6 space-y-4">
            {page.sections?.map((section, idx) => (
              <div 
                key={idx}
                className="relative pl-8 sm:pl-10"
              >
                {/* Step number and line */}
                <div className="absolute left-0 top-0 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-white font-bold text-sm shadow-md z-10">
                    {idx + 1}
                  </div>
                  {idx < (page.sections?.length || 0) - 1 && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-gold to-gold/30 mt-1" style={{ minHeight: '40px' }} />
                  )}
                </div>
                
                <div className="pb-6">
                  <h3 className="text-navy font-bold text-base mb-2">
                    {section.title}
                  </h3>
                  {section.highlight && (
                    <p className="text-navy/70 text-sm leading-relaxed">
                      {section.highlight}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Page 6 - Pricing & Contact */}
        {isPage6 && (
          <div className="px-4 sm:px-6 py-6 space-y-6">
            {/* Intro */}
            <div className="bg-gradient-to-br from-navy/5 via-gold/5 to-navy/5 rounded-2xl p-5 border border-gold/20">
              <p className="text-navy/80 leading-relaxed text-sm">
                {page.sections?.[0]?.highlight}
              </p>
            </div>

            {/* Pricing Guide */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                {page.sections?.[1]?.title}
              </h3>
              
              <div className="grid gap-3">
                {['Undergraduate:', "Master's:", 'Doctoral:'].map((category, catIdx) => {
                  const items = page.sections?.[1]?.items?.filter(item => 
                    item.includes('•') && (
                      (catIdx === 0 && item.includes('USD $4')) ||
                      (catIdx === 1 && item.includes('USD $9')) ||
                      (catIdx === 2 && item.includes('Custom'))
                    )
                  );
                  return (
                    <div key={catIdx} className="bg-white rounded-xl border border-navy/10 p-4">
                      <h4 className="font-bold text-navy mb-2">{category}</h4>
                      <div className="space-y-1 text-sm text-navy/70">
                        {category === 'Undergraduate:' && (
                          <>
                            <p>Proposal Package: <span className="font-semibold text-navy">USD $49</span></p>
                            <p>Foundation Thesis: <span className="font-semibold text-navy">USD $149</span></p>
                            <p>Complete Thesis: <span className="font-semibold text-navy">USD $299</span></p>
                            <p>Formatting: <span className="font-semibold text-navy">USD $39</span></p>
                          </>
                        )}
                        {category === "Master's:" && (
                          <>
                            <p>Proposal Package: <span className="font-semibold text-navy">USD $99</span></p>
                            <p>Foundation Thesis: <span className="font-semibold text-navy">USD $249</span></p>
                            <p>Complete Thesis: <span className="font-semibold text-navy">USD $499</span></p>
                            <p>Formatting: <span className="font-semibold text-navy">USD $79</span></p>
                          </>
                        )}
                        {category === 'Doctoral:' && (
                          <>
                            <p>Proposal: <span className="font-semibold text-navy">Custom Quote</span></p>
                            <p>Foundation Thesis: <span className="font-semibold text-navy">Custom Quote</span></p>
                            <p>Complete Thesis: <span className="font-semibold text-navy">Starting from USD $799+</span></p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Why Students Choose JUSTmyTHESIS™
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {page.sections?.[2]?.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-navy/10">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-navy/80 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h3 className="text-amber-800 font-bold text-sm mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {page.sections?.[3]?.title}
              </h3>
              <p className="text-amber-800/80 text-xs leading-relaxed">
                {page.sections?.[3]?.highlight}
              </p>
            </div>

            {/* CTA */}
            <div className="space-y-3 pt-2">
              <a
                href={page.cta?.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Start on WhatsApp
              </a>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-navy/70">
                <a href={`tel:${page.contact?.phone}`} className="flex items-center gap-2 hover:text-navy transition-colors">
                  <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {page.contact?.phone}
                </a>
                <span className="hidden sm:block text-gold">•</span>
                <a href={`mailto:${page.contact?.email}`} className="flex items-center gap-2 hover:text-navy transition-colors">
                  <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {page.contact?.email}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
