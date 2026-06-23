'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [currentSection, setCurrentSection] = useState(0);
  
  const sections = [
    { id: 'hero', name: 'Hero' },
    { id: 'struggling', name: 'Struggling With' },
    { id: 'about', name: 'Who We Are' },
    { id: 'services', name: 'Service Packages' },
    { id: 'additional', name: 'Additional Learning' },
    { id: 'process', name: 'Service Process' },
    { id: 'fees', name: 'Service Fees' },
    { id: 'why-us', name: 'Why Students Choose Us' },
    { id: 'team', name: 'Meet Our Team' },
    { id: 'testimonials', name: 'What Students Are Saying' },
    { id: 'notice', name: 'Important Notice' },
    { id: 'contact', name: 'Get Started' }
  ];

  const strugglingItems = [
    'Proposal Development',
    'Literature Review',
    'Research Methodology',
    'Formatting Requirements',
    'Citations & References',
    'Supervisor Corrections',
    'Dissertation Development',
    'Thesis Defense Preparation',
    'Final Submission Requirements'
  ];

  const services = [
    {
      package: 'A',
      name: 'Proposal Development',
      bestFor: ['Topic Approved', 'Proposal Development'],
      deliverables: [
        'Background of the Study',
        'Statement of the Problem',
        'Research Objectives',
        'Research Questions',
        'Significance of the Study',
        'Scope of the Study',
        'Preliminary Methodology',
        'Proposal References'
      ],
      outcome: 'A proposal ready for supervisor review.'
    },
    {
      package: 'B',
      name: 'Foundation Thesis',
      bestFor: ['Proposal Approved', 'Literature Review', 'Methodology Development'],
      deliverables: [
        'Institution-required introductory sections',
        'Literature Review Components',
        'Methodology Components',
        'Research Instruments',
        'Initial References'
      ],
      outcome: 'A foundation thesis draft ready for supervisor review and data collection.'
    },
    {
      package: 'C',
      name: 'Complete Thesis Development',
      bestFor: ['Data Collection', 'Data Analysis & Presentation', 'Thesis Development'],
      deliverables: [
        'Proposal Review',
        'Institution-required Thesis Sections',
        'Data Presentation Support',
        'Findings Discussion Support',
        'References',
        'Appendices',
        'Formatting Review',
        'Quality Assurance Review'
      ],
      outcome: 'A submission-ready thesis.'
    },
    {
      package: 'D',
      name: 'Thesis Rescue',
      bestFor: ['Supervisor Corrections', 'Delayed Projects', 'Rejected Projects', 'Weak Drafts'],
      deliverables: [
        'Project Assessment',
        'Gap Identification',
        'Structural Review',
        'Redevelopment Support',
        'Compliance Review'
      ],
      outcome: 'A recovered and strengthened thesis draft.'
    },
    {
      package: 'E',
      name: 'Formatting & Compliance',
      bestFor: ['Formatting Review', 'Citation & Reference Review', 'Final Submission Preparation'],
      deliverables: [
        'Formatting Review',
        'Citation Review',
        'Pagination Review',
        'Cover Page Preparation',
        'Compliance Verification'
      ],
      outcome: 'An institution-compliant submission copy.'
    },
    {
      package: 'G',
      name: 'Defense Presentation',
      bestFor: ['Defense Preparation'],
      deliverables: [
        'Defense Presentation Slides',
        'Speaker Notes',
        'Defense Preparation Guide',
        'Question Preparation Support'
      ],
      outcome: 'A defense-ready presentation package.'
    }
  ];

  const teamMembers = [
    {
      name: 'Emily Nookes',
      position: 'Research & Academic Advisor',
      experienceSince: 2010,
      discipline: 'Research, Academia & Academic Support',
      image: '/images/team/emily-nookes.jpg'
    },
    {
      name: 'B. K. Weah',
      position: 'Marketing & Service Executive',
      experienceSince: 2016,
      discipline: 'Technology Entrepreneurship, Marketing & Service Development',
      image: '/images/team/bk-weah.jpg'
    },
    {
      name: 'Georgina Horace',
      position: 'Project Development & Information Technology Advisor',
      experienceSince: 2012,
      discipline: 'Project Development, Information Technology & Documentation Systems',
      image: '/images/team/georgina-horace.jpg'
    }
  ];

  const testimonials = [
    {
      quote: "The proposal package helped me organize my ideas properly and submit a stronger proposal to my supervisor.",
      author: 'M. Johnson',
      role: 'Undergraduate Student'
    },
    {
      quote: "I was struggling with my literature review until I received guidance that helped me understand what was actually required.",
      author: 'R. Cooper',
      role: 'Undergraduate Student'
    },
    {
      quote: "The formatting review saved me a lot of time before submission and helped me avoid unnecessary corrections.",
      author: 'T. Diggs',
      role: 'Undergraduate Student'
    },
    {
      quote: "Their structured process made the entire thesis journey less stressful and more manageable.",
      author: 'P. Williams',
      role: "Master's Student"
    },
    {
      quote: "The support I received helped me address my supervisor's comments more confidently.",
      author: 'K. Doe',
      role: 'Research Student'
    },
    {
      quote: "I appreciated the professionalism and prompt communication throughout my project.",
      author: 'S. Reeves',
      role: 'Undergraduate Student'
    },
    {
      quote: "The defense preparation session helped me feel more prepared and organized before presenting.",
      author: 'J. Brown',
      role: 'Undergraduate Student'
    },
    {
      quote: "The team helped me identify weaknesses in my draft and improve the overall structure of my work.",
      author: 'A. Walker',
      role: 'Research Student'
    },
    {
      quote: "From proposal development to final review, the support was clear, practical, and easy to follow.",
      author: 'C. Roberts',
      role: "Master's Student"
    }
  ];

  const pricing = {
    undergraduate: [
      { name: 'Proposal Package', price: 'USD $49' },
      { name: 'Foundation Thesis', price: 'USD $149' },
      { name: 'Complete Thesis', price: 'USD $299' },
      { name: 'Formatting & Compliance', price: 'USD $39' }
    ],
    masters: [
      { name: 'Proposal Package', price: 'USD $99' },
      { name: 'Foundation Thesis', price: 'USD $249' },
      { name: 'Complete Thesis', price: 'USD $499' },
      { name: 'Formatting & Compliance', price: 'USD $79' }
    ]
  };

  const whyChooseUs = [
    'Personalized Academic Support',
    'Institution-Focused Approach',
    'Structured Service Process',
    'Professional Formatting',
    'Quality Review Procedures',
    'Supervisor Feedback Integration',
    'Confidential Handling of Projects',
    'Responsive Client Support',
    'Research Coaching & Skills Development',
    'Nearly Four Decades of Combined Experience'
  ];

  const steps = [
    {
      title: 'Project Stage Identification',
      description: 'Contact us by Phone or WhatsApp and tell us where you currently are in your research or thesis journey.'
    },
    {
      title: 'Document & Requirement Submission',
      description: 'Based on your selected stage, we request the relevant information and documents required for review.'
    },
    {
      title: 'Project Assessment & Eligibility Review',
      description: 'Our team reviews the submitted information to determine current project status, scope of support, readiness, recommended package, and timeline.'
    },
    {
      title: 'Package Recommendation & Onboarding',
      description: 'You receive the recommended package, project roadmap, expected timeline, service fee, and service agreement.'
    },
    {
      title: 'Service Delivery & Quality Review',
      description: 'Our team delivers the agreed support package and reviews quality, structure, formatting, compliance, consistency, and presentation.'
    },
    {
      title: 'Final Delivery & Continued Support',
      description: 'Receive your completed deliverables with recommendations and next steps.'
    }
  ];

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Section navigation component
  const SectionNav = ({ sectionIndex }: { sectionIndex: number }) => {
    const isFirst = sectionIndex === 0;
    const isLast = sectionIndex === sections.length - 1;
    const prevSection = sections[sectionIndex - 1];
    const nextSection = sections[sectionIndex + 1];

    return (
      <div className="flex items-center justify-between mt-12 pt-6 border-t border-navy/10">
        {!isFirst && prevSection && (
          <button
            onClick={() => scrollToSection(prevSection.id)}
            className="section-nav-btn section-nav-btn-dark"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-semibold">Previous</span>
          </button>
        )}
        {isFirst && <div />}
        
        {!isLast && nextSection && (
          <button
            onClick={() => scrollToSection(nextSection.id)}
            className="section-nav-btn section-nav-btn-dark ml-auto"
          >
            <span className="font-semibold">Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        {isLast && (
          <a
            href="https://wa.me/231776732989?text=Hello%20JUSTmyTHESIS%2C%20I%20would%20like%20a%20FREE%20Project%20Assessment."
            target="_blank"
            rel="noopener noreferrer"
            className="section-nav-btn bg-green-500 text-white hover:bg-green-600 ml-auto"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="font-semibold">Start on WhatsApp</span>
          </a>
        )}
      </div>
    );
  };

  // Track current section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => document.getElementById(s.id)).filter(Boolean);
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      sectionElements.forEach((element, index) => {
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setCurrentSection(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-3">
                <img 
                  src="/images/logo/justmythesis-logo.png" 
                  alt="JUSTmyTHESIS™ Logo"
                  className="h-10 md:h-12 w-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="hidden">
                  <h1 className="text-brand-green font-bold text-lg leading-tight">JUSTmyTHESIS™</h1>
                  <p className="text-dark/50 text-xs">Academic Research & Thesis Support</p>
                </div>
              </a>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <a
                href="tel:+231776732989"
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-brand-green text-white rounded-xl hover:bg-brand-green-light transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="hidden sm:inline">Call Now</span>
              </a>
              <a
                href="https://wa.me/231776732989?text=Hello%20JUSTmyTHESIS%2C%20I%20would%20like%20a%20FREE%20Project%20Assessment."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-brand-green text-white rounded-xl hover:bg-brand-green-light transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero-bg text-white py-16 md:py-24 lg:py-32 relative overflow-hidden min-h-screen flex flex-col">
        <div className="container-custom relative z-10 flex-grow flex flex-col justify-center">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="heading-xl mb-6 leading-tight">
              Focus on Your Research.<br />
              <span className="text-gradient">We'll Handle the Thesis.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto">
              Academic Research & Thesis Support for undergraduate and master's students, researchers, and professionals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/231776732989?text=Hello%20JUSTmyTHESIS%2C%20I%20would%20like%20a%20FREE%20Project%20Assessment."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp text-lg px-8 py-4"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Request FREE Project Assessment
              </a>
              <a
                href="tel:+231776732989"
                className="btn bg-white text-brand-green hover:bg-gray-100 text-lg px-8 py-4"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Call Now
              </a>
            </div>
          </div>
        </div>
        <div className="container-custom relative z-10">
          <SectionNav sectionIndex={0} />
        </div>
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      </section>

      {/* Struggling With Section */}
      <section id="struggling" className="section min-h-screen flex flex-col">
        <div className="container-custom flex-grow">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-brand-green mb-4">Struggling With?</h2>
            <div className="divider-gold max-w-xs mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {strugglingItems.map((item, idx) => (
              <div key={idx} className="card p-4 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gold flex-shrink-0" />
                <span className="text-dark font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="container-custom">
          <SectionNav sectionIndex={1} />
        </div>
      </section>

      {/* Who We Are Section */}
      <section id="about" className="section bg-cream min-h-screen flex flex-col">
        <div className="container-custom flex-grow">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-brand-green mb-4">Who We Are</h2>
            <div className="divider-gold max-w-xs mx-auto" />
          </div>
          <div className="max-w-4xl mx-auto space-y-6 text-dark/80 leading-relaxed">
            <p>
              JUSTmyTHESIS™ is a dedicated academic support team committed to helping students successfully complete research projects, theses, and dissertations. We understand the challenges students face throughout the research and thesis development process and provide structured support, guidance, review, and development services that help students move from uncertainty to successful completion.
            </p>
            <p>
              Our team brings together individuals from diverse academic and professional backgrounds with experience spanning education, research, business, information technology, academic writing, project development, and professional consulting. Collectively, our team members bring nearly four decades of practical experience supporting learning, research, writing, documentation, training, project development, and professional advancement.
            </p>
            <p className="font-semibold text-brand-green">
              Our mission is to help students produce professionally structured, institution-compliant, and submission-ready academic projects with greater confidence, clarity, and organization.
            </p>
          </div>
        </div>
        <div className="container-custom">
          <SectionNav sectionIndex={2} />
        </div>
      </section>

      {/* Service Packages Section */}
      <section id="services" className="section min-h-screen flex flex-col">
        <div className="container-custom flex-grow">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-brand-green mb-4">Our Service Packages</h2>
            <div className="divider-gold max-w-xs mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="service-card">
                <div className="service-card-header">
                  <span className="text-white text-sm font-bold">Package {service.package}</span>
                  <h3 className="text-lg font-bold mt-1 text-white">{service.name}</h3>
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <span className="text-sm font-semibold text-dark/60">Best For:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {service.bestFor.map((item, i) => (
                        <span key={i} className="pill text-xs">{item}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-dark/60">Deliverables:</span>
                    <ul className="mt-2 space-y-1">
                      {service.deliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-dark/70">
                          <svg className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-gold/20">
                    <span className="text-sm font-semibold text-dark/60">Outcome: </span>
                    <span className="text-sm text-dark font-medium">{service.outcome}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="container-custom">
          <SectionNav sectionIndex={3} />
        </div>
      </section>

      {/* Additional Learning Opportunities */}
      <section id="additional" className="section min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/sections/additional-learning.jpg" 
            alt="Additional Learning"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-brand-green/90" />
        </div>
        <div className="container-custom flex-grow relative z-10">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-white mb-4">Additional Learning Opportunities</h2>
            <div className="divider-gold max-w-xs mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3a1 1 0 011-1h3a1 1 0 001-1v-0.5z" />
                  </svg>
                </div>
                <h3 className="font-bold text-dark text-lg">Research Coaching</h3>
              </div>
              <p className="text-dark/70 text-sm">
                Personalized coaching designed to strengthen research skills, project planning, and understanding of the research process.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <h3 className="font-bold text-dark text-lg">Thesis Writing Training</h3>
              </div>
              <p className="text-dark/70 text-sm">
                Practical training that teaches students how to structure, organize, and write academic theses and dissertations according to accepted standards.
              </p>
            </div>
          </div>
        </div>
        <div className="container-custom">
          <SectionNav sectionIndex={4} />
        </div>
      </section>

      {/* How Our Service Process Works */}
      <section id="process" className="section min-h-screen flex flex-col">
        <div className="container-custom flex-grow">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-brand-green mb-4">How Our Service Process Works</h2>
            <div className="divider-gold max-w-xs mx-auto" />
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {steps.map((step, idx) => (
              <div key={idx} className="card p-6 flex gap-5 items-start">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-green to-brand-green-light flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-dark text-lg mb-2">{step.title}</h3>
                  <p className="text-dark/70 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="container-custom">
          <SectionNav sectionIndex={5} />
        </div>
      </section>

      {/* Service Fees Section */}
      <section id="fees" className="section bg-cream min-h-screen flex flex-col">
        <div className="container-custom flex-grow">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-brand-green mb-4">Service Fees</h2>
            <div className="divider-gold max-w-xs mx-auto" />
          </div>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-dark/80 leading-relaxed">
              JUSTmyTHESIS™ provides structured academic support packages with transparent service fees based on the scope and complexity of each package.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="pricing-card">
              <h3 className="text-xl font-bold text-dark mb-4">Undergraduate</h3>
              <ul className="space-y-3 mb-6">
                {pricing.undergraduate.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-dark/70">{item.name}</span>
                    <span className="font-semibold text-gold">{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pricing-card featured">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gold text-white text-xs font-bold px-3 py-1 rounded-full">Popular</span>
              </div>
              <h3 className="text-xl font-bold text-dark mb-4">Master's</h3>
              <ul className="space-y-3 mb-6">
                {pricing.masters.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-dark/70">{item.name}</span>
                    <span className="font-semibold text-gold">{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="container-custom">
          <SectionNav sectionIndex={6} />
        </div>
      </section>

      {/* Why Students Choose Us */}
      <section id="why-us" className="section min-h-screen flex flex-col">
        <div className="container-custom flex-grow">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-brand-green mb-4">Why Students Choose Us</h2>
            <div className="divider-gold max-w-xs mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {whyChooseUs.map((item, idx) => (
              <div key={idx} className="card p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-brand-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-dark font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="container-custom">
          <SectionNav sectionIndex={7} />
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section id="team" className="section bg-cream min-h-screen flex flex-col">
        <div className="container-custom flex-grow">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-brand-green mb-4">Meet Our Core Academic Support Team</h2>
            <div className="divider-gold max-w-xs mx-auto" />
          </div>
          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="text-dark/80 leading-relaxed mb-4">
              JUSTmyTHESIS™ is supported by a multidisciplinary network of professionals with experience across research, academia, business development, technology, project development, marketing, and professional services.
            </p>
            <p className="text-dark/80 leading-relaxed mb-4">
              The individuals below represent some of the core team members who contribute to the planning, coordination, delivery, and quality review of our academic support services.
            </p>
            <p className="text-dark/80 leading-relaxed">
              Collectively, our team members bring nearly four decades of practical experience supporting learning, research, writing, documentation, training, project development, and professional advancement.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="card p-6 text-center">
                <div className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] rounded-full overflow-hidden mx-auto mb-6 shadow-lg ring-4 ring-gold/30">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-brand-green to-brand-green-light flex items-center justify-center"><span class="text-white font-bold text-3xl sm:text-4xl lg:text-5xl">${member.name.split(' ').map(n => n[0]).join('')}</span></div>`;
                      }
                    }}
                  />
                </div>
                <h3 className="font-bold text-dark text-xl mb-2">{member.name}</h3>
                <p className="text-gold text-sm font-semibold mb-3">{member.position}</p>
                <p className="text-dark/70 text-sm mb-4 leading-relaxed">{member.discipline}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/10 rounded-full">
                  <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-dark">Experience Since {member.experienceSince}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="container-custom">
          <SectionNav sectionIndex={8} />
        </div>
      </section>

      {/* Student Testimonials Section */}
      <section id="testimonials" className="section min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/sections/success-stories.jpg" 
            alt="Success Stories"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-brand-green/90" />
        </div>
        <div className="container-custom flex-grow relative z-10">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-white mb-4">What Students Are Saying</h2>
            <div className="divider-gold max-w-xs mx-auto" />
          </div>
          <div className="max-w-4xl mx-auto text-center mb-12">
            <p className="text-white/80 leading-relaxed">
              Students from different academic backgrounds have trusted JUSTmyTHESIS™ to help them navigate the research and thesis process with greater clarity, structure, and confidence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-lg">
                <svg className="w-8 h-8 text-gold/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-dark/80 mb-4 italic">"{testimonial.quote}"</p>
                <div className="border-t border-gold/20 pt-4">
                  <p className="font-semibold text-dark">{testimonial.author}</p>
                  <p className="text-sm text-dark/60">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-white/60 text-sm mt-8 max-w-3xl mx-auto">
            Names and identifying details may be abbreviated or modified to protect client privacy.
          </p>
        </div>
        <div className="container-custom">
          <SectionNav sectionIndex={9} />
        </div>
      </section>

      {/* Important Notice */}
      <section id="notice" className="section bg-cream min-h-screen flex flex-col">
        <div className="container-custom flex-grow">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-brand-green mb-4">Notice to Students</h2>
            <div className="divider-gold max-w-xs mx-auto" />
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="bg-amber-50 rounded-2xl p-6 md:p-8 border border-amber-200">
              <h3 className="heading-sm text-amber-800 mb-4">Students remain responsible for:</h3>
              <div className="space-y-4">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Conducting Surveys', 'Conducting Interviews', 'Data Collection', 'Research Activities', 'Academic Approvals', 'Thesis Defense', 'Final Submission'].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-amber-800/80 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-amber-800/80 text-sm pt-3 border-t border-amber-200">
                  JUSTmyTHESIS™ does not fabricate research findings, survey responses, interview results, citations, references, or academic data.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="container-custom">
          <SectionNav sectionIndex={10} />
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="contact" className="section cta-bg text-white min-h-screen flex flex-col">
        <div className="container-custom flex-grow flex flex-col justify-center">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="heading-lg mb-4">Ready to Get Started?</h2>
            <p className="text-white/80 text-lg mb-8">Request your FREE Project Assessment today.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a
                href="https://wa.me/231776732989?text=Hello%20JUSTmyTHESIS%2C%20I%20would%20like%20a%20FREE%20Project%20Assessment."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp text-lg px-8 py-4"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </a>
              <a
                href="tel:+231776732989"
                className="btn bg-white text-brand-green hover:bg-gray-100 text-lg px-8 py-4"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Call Now
              </a>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/70">
              <a href="tel:+231776732989" className="flex items-center gap-2 hover:text-white transition-colors">
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                +231776732989
              </a>
              <span className="hidden sm:block text-gold">•</span>
              <a href="mailto:team@justmythesis.org" className="flex items-center gap-2 hover:text-white transition-colors">
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                team@justmythesis.org
              </a>
              <span className="hidden sm:block text-gold">•</span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                GSA Road, Paynesville, Liberia
              </span>
            </div>
          </div>
        </div>
        <div className="container-custom">
          <SectionNav sectionIndex={11} />
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer py-12">
        <div className="container-custom">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <img 
                src="/images/logo/justmythesis-logo.png" 
                alt="JUSTmyTHESIS™ Logo"
                className="h-16 w-auto mx-auto mb-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <p className="text-dark/60 text-sm mb-2">Academic Research & Thesis Support</p>
              <p className="text-dark/80 font-medium">Focus on Your Research. We'll Handle the Thesis.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-dark/60 mb-6">
              <a href="/terms" className="hover:text-gold transition-colors">Terms of Service</a>
              <span className="hidden sm:block text-gold">•</span>
              <a href="/privacy" className="hover:text-gold transition-colors">Privacy Policy</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gold/20 text-center text-dark/40 text-sm">
            © {new Date().getFullYear()} JUSTmyTHESIS™. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
