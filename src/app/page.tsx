'use client';

export default function Home() {
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
      name: 'Proposal Development Package',
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
      name: 'Foundation Thesis Package',
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
      name: 'Complete Thesis Development Package',
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
      name: 'Thesis Rescue Package',
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
      name: 'Formatting & Compliance Package',
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
      package: 'F',
      name: 'Dissertation Support Package',
      bestFor: ['Dissertation Development'],
      deliverables: [
        'Dissertation Structure Support',
        'Proposal Support',
        'Formatting Support',
        'Compliance Review',
        'Submission Preparation'
      ],
      outcome: 'A dissertation-ready draft.'
    },
    {
      package: 'G',
      name: 'Defense Presentation Package',
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

  const pricing = {
    undergraduate: [
      { name: 'Proposal Package', price: 'USD $49' },
      { name: 'Foundation Thesis', price: 'USD $149' },
      { name: 'Complete Thesis', price: 'USD $299' },
      { name: 'Formatting', price: 'USD $39' }
    ],
    masters: [
      { name: 'Proposal Package', price: 'USD $99' },
      { name: 'Foundation Thesis', price: 'USD $249' },
      { name: 'Complete Thesis', price: 'USD $499' },
      { name: 'Formatting', price: 'USD $79' }
    ],
    doctoral: [
      { name: 'Proposal', price: 'Custom Quote' },
      { name: 'Foundation Thesis', price: 'Custom Quote' },
      { name: 'Complete Thesis / Dissertation', price: 'Starting from USD $799+' }
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
    'Nearly Two Decades of Combined Experience'
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
      description: 'You receive the recommended package, project roadmap, expected timeline, suggested contribution amount, and service agreement.'
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

  return (
    <main className="min-h-screen bg-white">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy to-navy-light flex items-center justify-center shadow-md">
                <span className="text-gold font-bold text-sm tracking-wide">JMT</span>
              </div>
              <div>
                <h1 className="text-navy font-bold text-lg leading-tight">JUSTmyTHESIS™</h1>
                <p className="text-navy/50 text-xs hidden sm:block">Academic Research Support</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <a
                href="tel:+231776732989"
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-navy text-white rounded-xl hover:bg-navy-light transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
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
                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
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
      <section className="hero-bg text-white py-16 md:py-24 lg:py-32 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="heading-xl mb-6 leading-tight">
              Focus on Your Research.<br />
              <span className="text-gradient">We'll Handle the Thesis.</span>
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto">
              Academic Research, Thesis Development Support & Research Coaching for Undergraduate, Master's, and Doctoral Students.
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
                className="btn bg-white text-navy hover:bg-gray-100 text-lg px-8 py-4"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Call Now
              </a>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      </section>

      {/* Struggling With Section */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-navy mb-4">Struggling With?</h2>
            <div className="divider-gold max-w-xs mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {strugglingItems.map((item, idx) => (
              <div 
                key={idx}
                className="card p-4 flex items-center gap-3"
              >
                <div className="w-3 h-3 rounded-full bg-gold flex-shrink-0" />
                <span className="text-navy font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="section bg-gray-50/50" id="about">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-navy mb-4">Who We Are</h2>
            <div className="divider-gold max-w-xs mx-auto" />
          </div>
          <div className="max-w-4xl mx-auto space-y-6 text-navy/80 leading-relaxed">
            <p>
              JUSTmyTHESIS™ is a dedicated academic support team committed to helping students successfully complete research projects, theses, and dissertations. We understand the challenges students face throughout the research and thesis development process and provide structured support, guidance, review, and development services that help students move from uncertainty to successful completion.
            </p>
            <p>
              Our team brings together individuals from diverse academic and professional backgrounds with experience spanning education, research, business, information technology, academic writing, project development, and professional consulting. Collectively, our team members possess nearly two decades of practical experience supporting learning, research, writing, analysis, documentation, training, and professional development.
            </p>
            <p className="font-semibold text-navy">
              Our mission is to help students produce professionally structured, institution-compliant, and submission-ready academic projects with greater confidence, clarity, and organization.
            </p>
          </div>
          
          {/* Who We Serve */}
          <div className="mt-12">
            <h3 className="heading-sm text-navy mb-6 text-center">Who We Serve</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                { title: 'Undergraduate Students', desc: 'Final-year students preparing research projects and theses' },
                { title: "Master's Students", desc: 'Graduate students conducting advanced academic research' },
                { title: 'Doctoral Candidates', desc: 'Researchers working on dissertations and major research studies' },
                { title: 'Researchers & Professionals', desc: 'Individuals conducting academic, organizational, policy, and professional research' }
              ].map((item, idx) => (
                <div key={idx} className="card p-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-navy mb-1">{item.title}</h4>
                  <p className="text-sm text-navy/60">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service Packages Section */}
      <section className="section" id="services">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-navy mb-4">Our Service Packages</h2>
            <div className="divider-gold max-w-xs mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="service-card">
                <div className="service-card-header">
                  <span className="text-gold text-sm font-bold">Package {service.package}</span>
                  <h3 className="text-lg font-bold mt-1">{service.name}</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-semibold text-navy/60">Best For:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {service.bestFor.map((item, i) => (
                        <span key={i} className="pill text-xs">{item}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-navy/60">Deliverables:</span>
                    <ul className="mt-2 space-y-1">
                      {service.deliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-navy/70">
                          <svg className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-gold/20">
                    <span className="text-sm font-semibold text-navy/60">Outcome: </span>
                    <span className="text-sm text-navy font-medium">{service.outcome}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Learning Opportunities */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3a1 1 0 011-1h3a1 1 0 001-1v-0.5z" />
                  </svg>
                </div>
                <h3 className="font-bold text-navy text-lg">Research Coaching</h3>
              </div>
              <p className="text-navy/70 text-sm">
                Personalized coaching designed to strengthen research skills, project planning, and understanding of the research process.
              </p>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </div>
                <h3 className="font-bold text-navy text-lg">Thesis Writing Training</h3>
              </div>
              <p className="text-navy/70 text-sm">
                Practical training that teaches students how to structure, organize, and write academic theses and dissertations according to accepted standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Our Service Process Works */}
      <section className="section bg-gray-50/50" id="process">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-navy mb-4">How Our Service Process Works</h2>
            <div className="divider-gold max-w-xs mx-auto" />
          </div>
          <div className="max-w-3xl mx-auto">
            {steps.map((step, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot">{idx + 1}</div>
                <h3 className="font-bold text-navy text-lg mb-2">{step.title}</h3>
                <p className="text-navy/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contribution Model */}
      <section className="section" id="pricing">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-navy mb-4">Student-Friendly Contribution Model</h2>
            <div className="divider-gold max-w-xs mx-auto" />
          </div>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-navy/80 leading-relaxed">
              JUSTmyTHESIS™ is committed to making academic support accessible to students. To provide transparency while maintaining flexibility, each package has a suggested contribution amount based on the scope and complexity of support required. Students are encouraged to contribute responsibly in appreciation of the time, expertise, and effort invested in supporting their academic journey. Reasonable arrangements may be discussed where necessary.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="pricing-card">
              <h3 className="text-xl font-bold text-navy mb-4">Undergraduate</h3>
              <ul className="space-y-3 mb-6">
                {pricing.undergraduate.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-navy/70">{item.name}</span>
                    <span className="font-semibold text-gold">{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pricing-card featured">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gold text-navy text-xs font-bold px-3 py-1 rounded-full">Popular</span>
              </div>
              <h3 className="text-xl font-bold text-navy mb-4">Master's</h3>
              <ul className="space-y-3 mb-6">
                {pricing.masters.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-navy/70">{item.name}</span>
                    <span className="font-semibold text-gold">{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pricing-card">
              <h3 className="text-xl font-bold text-navy mb-4">Doctoral</h3>
              <ul className="space-y-3 mb-6">
                {pricing.doctoral.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-navy/70">{item.name}</span>
                    <span className="font-semibold text-gold">{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Students Choose Us */}
      <section className="section bg-gray-50/50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-navy mb-4">Why Students Choose Us</h2>
            <div className="divider-gold max-w-xs mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {whyChooseUs.map((item, idx) => (
              <div key={idx} className="card p-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-navy font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="bg-amber-50 rounded-2xl p-6 md:p-8 border border-amber-200">
              <h3 className="heading-sm text-amber-800 mb-4">Important Notice</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-amber-900 mb-2">Students remain responsible for:</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['Conducting Surveys', 'Conducting Interviews', 'Data Collection', 'Research Activities', 'Academic Approvals', 'Thesis Defense', 'Final Submission'].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-amber-800/80 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-amber-800/80 text-sm pt-3 border-t border-amber-200">
                  JUSTmyTHESIS™ does not fabricate research findings, survey responses, interview results, citations, references, or academic data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section cta-bg text-white" id="contact">
        <div className="container-custom">
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
                className="btn bg-white text-navy hover:bg-gray-100 text-lg px-8 py-4"
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
              <a href="mailto:kontentkingkong@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                kontentkingkong@gmail.com
              </a>
              <span className="hidden sm:block text-gold">•</span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Monrovia, Liberia
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white py-12">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="text-gold font-bold text-lg">JMT</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">JUSTmyTHESIS™</h3>
                <p className="text-white/60 text-sm">Focus on Your Research. We'll Handle the Thesis.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-white/60">
              <a href="mailto:kontentkingkong@gmail.com" className="hover:text-white transition-colors">
                kontentkingkong@gmail.com
              </a>
              <a href="tel:+231776732989" className="hover:text-white transition-colors">
                +231776732989
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
            © {new Date().getFullYear()} JUSTmyTHESIS™. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
