export interface BrochurePage {
  id: number;
  title: string;
  subtitle?: string;
  tagline?: string;
  content?: string[];
  image: string;
  sections?: {
    title?: string;
    items?: string[];
    highlight?: string;
  }[];
  cta?: {
    text: string;
    link: string;
    type: 'whatsapp' | 'phone' | 'email';
  };
  contact?: {
    phone: string;
    email: string;
  };
}

export const brochurePages: BrochurePage[] = [
  // PAGE 1 — FRONT COVER
  {
    id: 1,
    title: "JUSTmyTHESIS™",
    tagline: "Focus on Your Research.\nWe'll Handle the Thesis.",
    content: [
      "Academic Research, Thesis Development Support & Research Coaching",
      "Supporting Undergraduate, Master's, and Doctoral Students"
    ],
    image: "/images/hero-students.jpg",
    sections: [
      {
        title: "STRUGGLING WITH?",
        items: [
          "Proposal Development",
          "Literature Review",
          "Research Methodology",
          "Formatting Requirements",
          "Citations & References",
          "Supervisor Corrections",
          "Dissertation Development",
          "Thesis Defense Preparation",
          "Final Submission Requirements"
        ]
      },
      {
        title: "Get Professional Academic Support",
        highlight: "Whether you are just starting your research journey or preparing for final submission, JUSTmyTHESIS™ is here to support you every step of the way."
      }
    ],
    cta: {
      text: "Request a FREE Project Assessment",
      link: "https://wa.me/231776732989?text=Hello%20JUSTmyTHESIS%2C%20I%20would%20like%20a%20FREE%20Project%20Assessment.",
      type: "whatsapp"
    },
    contact: {
      phone: "+231776732989",
      email: "kontentkingkong@gmail.com"
    }
  },

  // PAGE 2 — WHO WE ARE
  {
    id: 2,
    title: "WHO WE ARE",
    image: "/images/academic-support.jpg",
    sections: [
      {
        title: "About Us",
        highlight: "JUSTmyTHESIS™ is a dedicated academic support team committed to helping students successfully complete research projects, theses, and dissertations. We understand the challenges students face throughout the research and thesis development process and provide structured support, guidance, review, and development services that help students move from uncertainty to successful completion."
      },
      {
        title: "Our Team",
        highlight: "Our team brings together individuals from diverse academic and professional backgrounds with experience spanning education, research, business, information technology, academic writing, project development, and professional consulting. Collectively, our team members possess nearly two decades of practical experience supporting learning, research, writing, analysis, documentation, training, and professional development."
      },
      {
        title: "Our Mission",
        highlight: "Our mission is to help students produce professionally structured, institution-compliant, and submission-ready academic projects with greater confidence, clarity, and organization."
      },
      {
        title: "WHO WE SERVE",
        items: [
          "Undergraduate Students: Final-year students preparing research projects and theses.",
          "Master's Students: Graduate students conducting advanced academic research.",
          "Doctoral Candidates: Researchers working on dissertations and major research studies.",
          "Researchers & Professionals: Individuals conducting academic, organizational, policy, and professional research."
        ]
      }
    ]
  },

  // PAGE 3 — SERVICE PACKAGES PART 1
  {
    id: 3,
    title: "OUR SERVICE PACKAGES",
    image: "/images/research-workspace.jpg",
    sections: [
      {
        title: "Package A — Proposal Development Package",
        highlight: "Designed for students with approved topics who require proposal development support.",
        items: [
          "Best For: Topic Approved, Proposal Development",
          "Deliverables: Background of the Study, Statement of the Problem, Research Objectives, Research Questions, Significance of the Study, Scope of the Study, Preliminary Methodology, Proposal References",
          "Outcome: A proposal ready for supervisor review."
        ]
      },
      {
        title: "Package B — Foundation Thesis Package",
        highlight: "Designed for students with approved proposals.",
        items: [
          "Best For: Proposal Approved, Literature Review, Methodology Development",
          "Deliverables: Institution-required introductory sections, Literature Review Components, Methodology Components, Research Instruments, Initial References",
          "Outcome: A foundation thesis draft ready for supervisor review and data collection."
        ]
      },
      {
        title: "Package C — Complete Thesis Development Package",
        highlight: "Our flagship package for students requiring comprehensive thesis support.",
        items: [
          "Best For: Data Collection, Data Analysis & Presentation, Thesis Development",
          "Deliverables: Proposal Review, Institution-required Thesis Sections, Data Presentation Support, Findings Discussion Support, References, Appendices, Formatting Review, Quality Assurance Review",
          "Outcome: A submission-ready thesis."
        ]
      }
    ]
  },

  // PAGE 4 — SERVICE PACKAGES PART 2
  {
    id: 4,
    title: "SERVICE PACKAGES CONTINUED",
    image: "/images/thesis-defense.jpg",
    sections: [
      {
        title: "Package D — Thesis Rescue Package",
        highlight: "Designed for delayed, rejected, abandoned, or heavily criticized projects.",
        items: [
          "Best For: Supervisor Corrections, Delayed Projects, Rejected Projects, Weak Drafts",
          "Deliverables: Project Assessment, Gap Identification, Structural Review, Redevelopment Support, Compliance Review",
          "Outcome: A recovered and strengthened thesis draft."
        ]
      },
      {
        title: "Package E — Formatting & Compliance Package",
        highlight: "Designed for students with completed theses requiring final preparation.",
        items: [
          "Best For: Formatting Review, Citation & Reference Review, Final Submission Preparation",
          "Deliverables: Formatting Review, Citation Review, Pagination Review, Cover Page Preparation, Compliance Verification",
          "Outcome: An institution-compliant submission copy."
        ]
      },
      {
        title: "Package F — Dissertation Support Package",
        highlight: "Designed for master's and doctoral candidates requiring advanced support.",
        items: [
          "Best For: Dissertation Development",
          "Deliverables: Dissertation Structure Support, Proposal Support, Formatting Support, Compliance Review, Submission Preparation",
          "Outcome: A dissertation-ready draft."
        ]
      },
      {
        title: "Package G — Defense Presentation Package",
        highlight: "Designed for students preparing for thesis defense.",
        items: [
          "Best For: Defense Preparation",
          "Deliverables: Defense Presentation Slides, Speaker Notes, Defense Preparation Guide, Question Preparation Support",
          "Outcome: A defense-ready presentation package."
        ]
      },
      {
        title: "Additional Learning Opportunities",
        highlight: "Research Coaching: Personalized coaching designed to strengthen research skills, project planning, and understanding of the research process.",
        items: [
          "Thesis Writing Training: Practical training that teaches students how to structure, organize, and write academic theses and dissertations according to accepted standards."
        ]
      }
    ]
  },

  // PAGE 5 — HOW OUR SERVICE PROCESS WORKS
  {
    id: 5,
    title: "HOW OUR SERVICE PROCESS WORKS",
    image: "/images/research-process.jpg",
    sections: [
      {
        title: "Step 1 — Project Stage Identification",
        highlight: "Contact us by Phone or WhatsApp and tell us where you currently are in your research or thesis journey."
      },
      {
        title: "Step 2 — Document & Requirement Submission",
        highlight: "Based on your selected stage, we request the relevant information and documents required for review. Examples: Institution Thesis Guide/Manual, Research Topic, Approved Proposal, Existing Draft Chapters, Supervisor Comments, Research Instruments, Data Findings, Formatting Requirements."
      },
      {
        title: "Step 3 — Project Assessment & Eligibility Review",
        highlight: "Our team reviews the submitted information to determine: Current Project Status, Scope of Support Required, Project Readiness, Recommended Package, Estimated Timeline."
      },
      {
        title: "Step 4 — Package Recommendation & Onboarding",
        highlight: "You receive: Recommended Package, Project Roadmap, Expected Timeline, Suggested Contribution Amount, Service Agreement."
      },
      {
        title: "Step 5 — Service Delivery & Quality Review",
        highlight: "Our team delivers the agreed support package according to project requirements. Every project undergoes quality review for structure, formatting, compliance, consistency, and presentation quality."
      },
      {
        title: "Step 6 — Final Delivery & Continued Support",
        highlight: "Receive your completed deliverables together with recommendations and next steps. Students may return with supervisor comments or additional support requirements as their projects progress."
      }
    ]
  },

  // PAGE 6 — CONTRIBUTION MODEL, PRICING & CONTACT
  {
    id: 6,
    title: "STUDENT-FRIENDLY CONTRIBUTION MODEL",
    image: "/images/graduate-success.jpg",
    sections: [
      {
        title: "Our Commitment",
        highlight: "JUSTmyTHESIS™ is committed to making academic support accessible to students. To provide transparency while maintaining flexibility, each package has a suggested contribution amount based on the scope and complexity of support required. Students are encouraged to contribute responsibly in appreciation of the time, expertise, and effort invested in supporting their academic journey. Reasonable arrangements may be discussed where necessary."
      },
      {
        title: "SUGGESTED CONTRIBUTION GUIDE",
        items: [
          "Undergraduate:",
          "  • Proposal Package: USD $49",
          "  • Foundation Thesis: USD $149",
          "  • Complete Thesis: USD $299",
          "  • Formatting: USD $39",
          "",
          "Master's:",
          "  • Proposal Package: USD $99",
          "  • Foundation Thesis: USD $249",
          "  • Complete Thesis: USD $499",
          "  • Formatting: USD $79",
          "",
          "Doctoral:",
          "  • Proposal: Custom Quote",
          "  • Foundation Thesis: Custom Quote",
          "  • Complete Thesis / Dissertation Support: Starting from USD $799+"
        ]
      },
      {
        title: "WHY STUDENTS CHOOSE JUSTmyTHESIS™",
        items: [
          "Personalized Academic Support",
          "Institution-Focused Approach",
          "Structured Service Process",
          "Professional Formatting",
          "Quality Review Procedures",
          "Supervisor Feedback Integration",
          "Confidential Handling of Projects",
          "Responsive Client Support",
          "Research Coaching & Skills Development",
          "Nearly Two Decades of Combined Experience"
        ]
      },
      {
        title: "IMPORTANT NOTICE",
        highlight: "Students remain responsible for: Conducting Surveys, Conducting Interviews, Data Collection, Research Activities, Academic Approvals, Thesis Defense, Final Submission. JUSTmyTHESIS™ does not fabricate research findings, survey responses, interview results, citations, references, or academic data."
      }
    ],
    cta: {
      text: "Request Your FREE Project Assessment",
      link: "https://wa.me/231776732989?text=Hello%20JUSTmyTHESIS%2C%20I%20would%20like%20a%20FREE%20Project%20Assessment.",
      type: "whatsapp"
    },
    contact: {
      phone: "+231776732989",
      email: "kontentkingkong@gmail.com"
    }
  }
];
