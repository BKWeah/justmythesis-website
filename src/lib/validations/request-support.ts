import { z } from 'zod';

// Client form validation schema
export const clientFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  institution: z
    .string()
    .max(200, 'Institution name is too long')
    .optional()
    .or(z.literal('')),
});

// Support request form validation schema
export const supportRequestSchema = z.object({
  // Client info (for display, already validated)
  email: z.string().email(),
  fullName: z.string().min(2),
  
  // Project info
  workingTitle: z
    .string()
    .min(5, 'Working title must be at least 5 characters')
    .max(300, 'Title must be less than 300 characters'),
  academicLevel: z
    .string()
    .min(1, 'Please select your academic level'),
  currentStage: z
    .string()
    .min(1, 'Please select your current project stage'),
  
  // Service info
  requestedService: z
    .string()
    .min(1, 'Please select a service package'),
  
  // Timeline
  submissionDeadline: z
    .string()
    .optional()
    .or(z.literal('')),
  priority: z
    .string()
    .min(1, 'Please select a priority level'),
  
  // Description
  supportDescription: z
    .string()
    .min(20, 'Please provide more detail about your project (at least 20 characters)')
    .max(2000, 'Description must be less than 2000 characters'),
});

// Document upload validation
export const documentUploadSchema = z.object({
  file: z
    .instanceof(File, { message: 'Please select a file' })
    .refine((file) => file.size > 0, 'File is empty')
    .refine(
      (file) => file.size <= 50 * 1024 * 1024, // 50MB
      'File size must be less than 50MB'
    )
    .refine(
      (file) =>
        [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png',
        ].includes(file.type),
      'Please upload a PDF, Word, Excel, or image file'
    ),
  category: z
    .string()
    .min(1, 'Please select a document category'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

// Type exports
export type ClientFormData = z.infer<typeof clientFormSchema>;
export type SupportRequestFormData = z.infer<typeof supportRequestSchema>;
export type DocumentUploadData = z.infer<typeof documentUploadSchema>;

// Service packages with descriptions
export const SERVICE_PACKAGES = [
  {
    value: 'A - Proposal Development',
    label: 'Package A: Proposal Development',
    description: 'For students with approved topics who need proposal development support.',
    deliverables: [
      'Background of the Study',
      'Statement of the Problem',
      'Research Objectives & Questions',
      'Significance of the Study',
      'Scope of the Study',
      'Preliminary Methodology',
      'Proposal References',
    ],
  },
  {
    value: 'B - Foundation Thesis',
    label: 'Package B: Foundation Thesis',
    description: 'For students with approved proposals who need thesis foundation support.',
    deliverables: [
      'Institution-required sections',
      'Literature Review Components',
      'Methodology Components',
      'Research Instruments',
      'Initial References',
    ],
  },
  {
    value: 'C - Complete Thesis Development',
    label: 'Package C: Complete Thesis Development',
    description: 'Comprehensive thesis support from proposal to final submission-ready draft.',
    deliverables: [
      'Proposal Review',
      'Institution-required Thesis Sections',
      'Data Presentation Support',
      'Findings Discussion Support',
      'References & Appendices',
      'Formatting Review',
      'Quality Assurance Review',
    ],
  },
  {
    value: 'D - Thesis Rescue',
    label: 'Package D: Thesis Rescue',
    description: 'For delayed, rejected, or heavily criticized projects needing recovery.',
    deliverables: [
      'Project Assessment',
      'Gap Identification',
      'Structural Review',
      'Redevelopment Support',
      'Compliance Review',
    ],
  },
  {
    value: 'E - Formatting & Compliance',
    label: 'Package E: Formatting & Compliance',
    description: 'For completed theses needing final formatting and compliance review.',
    deliverables: [
      'Formatting Review',
      'Citation Review',
      'Pagination Review',
      'Cover Page Preparation',
      'Compliance Verification',
    ],
  },
  {
    value: 'F - Defense Presentation',
    label: 'Package F: Defense Presentation',
    description: 'For students preparing for thesis defense.',
    deliverables: [
      'Defense Presentation Slides',
      'Speaker Notes',
      'Defense Preparation Guide',
      'Question Preparation Support',
    ],
  },
] as const;
