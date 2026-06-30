// Database types for JUSTmyTHESIS Workspace
// Based on approved migration schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          auth_uid: string
          email: string
          full_name: string
          phone: string | null
          institution: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_uid?: string
          email: string
          full_name: string
          phone?: string | null
          institution?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_uid?: string
          email?: string
          full_name?: string
          phone?: string | null
          institution?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      staff_users: {
        Row: {
          id: string
          auth_uid: string
          email: string
          full_name: string
          role: 'super_admin' | 'operations_admin' | 'reviewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_uid: string
          email: string
          full_name: string
          role: 'super_admin' | 'operations_admin' | 'reviewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_uid?: string
          email?: string
          full_name?: string
          role?: 'super_admin' | 'operations_admin' | 'reviewer'
          created_at?: string
          updated_at?: string
        }
      }
      support_requests: {
        Row: {
          id: string
          request_reference: string
          client_id: string
          requested_service: string | null
          current_stage: string | null
          working_title: string | null
          academic_level: string | null
          submission_deadline: string | null
          support_description: string | null
          status: 'New Request' | 'Under Review' | 'Waiting for Documents' | 'Ready for Assessment' | 'Assessment Complete' | 'Recommendation Sent' | 'Waiting for Client Decision' | 'Approved' | 'Declined' | 'Cancelled'
          priority: 'Low' | 'Normal' | 'High' | 'Urgent'
          source: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          request_reference?: string
          client_id: string
          requested_service?: string | null
          current_stage?: string | null
          working_title?: string | null
          academic_level?: string | null
          submission_deadline?: string | null
          support_description?: string | null
          status?: 'New Request' | 'Under Review' | 'Waiting for Documents' | 'Ready for Assessment' | 'Assessment Complete' | 'Recommendation Sent' | 'Waiting for Client Decision' | 'Approved' | 'Declined' | 'Cancelled'
          priority?: 'Low' | 'Normal' | 'High' | 'Urgent'
          source?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          request_reference?: string
          client_id?: string
          requested_service?: string | null
          current_stage?: string | null
          working_title?: string | null
          academic_level?: string | null
          submission_deadline?: string | null
          support_description?: string | null
          status?: 'New Request' | 'Under Review' | 'Waiting for Documents' | 'Ready for Assessment' | 'Assessment Complete' | 'Recommendation Sent' | 'Waiting for Client Decision' | 'Approved' | 'Declined' | 'Cancelled'
          priority?: 'Low' | 'Normal' | 'High' | 'Urgent'
          source?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          client_id: string
          support_request_id: string | null
          project_id: string | null
          file_name: string
          file_url: string
          file_type: string
          file_size_bytes: number | null
          category: 'Thesis Guide' | 'Proposal' | 'Draft Chapter' | 'Supervisor Comment' | 'Data' | 'Payment Proof' | 'Agreement' | 'Final Deliverable' | 'Other'
          uploaded_by: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          support_request_id?: string | null
          project_id?: string | null
          file_name: string
          file_url: string
          file_type: string
          file_size_bytes?: number | null
          category: 'Thesis Guide' | 'Proposal' | 'Draft Chapter' | 'Supervisor Comment' | 'Data' | 'Payment Proof' | 'Agreement' | 'Final Deliverable' | 'Other'
          uploaded_by?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          support_request_id?: string | null
          project_id?: string | null
          file_name?: string
          file_url?: string
          file_type?: string
          file_size_bytes?: number | null
          category?: 'Thesis Guide' | 'Proposal' | 'Draft Chapter' | 'Supervisor Comment' | 'Data' | 'Payment Proof' | 'Agreement' | 'Final Deliverable' | 'Other'
          uploaded_by?: string | null
          description?: string | null
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          category: string
          action: string
          description: string
          client_id: string | null
          support_request_id: string | null
          project_id: string | null
          entity_type: string | null
          entity_id: string | null
          performed_by: string | null
          ip_address: string | null
          user_agent: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          action: string
          description: string
          client_id?: string | null
          support_request_id?: string | null
          project_id?: string | null
          entity_type?: string | null
          entity_id?: string | null
          performed_by?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          action?: string
          description?: string
          client_id?: string | null
          support_request_id?: string | null
          project_id?: string | null
          entity_type?: string | null
          entity_id?: string | null
          performed_by?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience types
export type Client = Tables<'clients'>
export type SupportRequest = Tables<'support_requests'>
export type Document = Tables<'documents'>
export type ActivityLog = Tables<'activity_logs'>

// Enums
export type SupportRequestStatus = SupportRequest['status']
export type DocumentCategory = Document['category']
export type AcademicLevel = 'Undergraduate' | 'Masters' | 'Doctoral'
export type PriorityLevel = 'Low' | 'Normal' | 'High' | 'Urgent'

// Service packages
export type ServicePackage = 
  | 'A - Proposal Development'
  | 'B - Foundation Thesis'
  | 'C - Complete Thesis Development'
  | 'D - Thesis Rescue'
  | 'E - Formatting & Compliance'
  | 'F - Defense Presentation'

// Current project stages
export const PROJECT_STAGES = [
  'Topic Selection',
  'Proposal Development',
  'Literature Review',
  'Methodology',
  'Data Collection',
  'Data Analysis',
  'Writing/Development',
  'Supervisor Review',
  'Formatting',
  'Defense Preparation',
  'Other'
] as const

// Academic levels
export const ACADEMIC_LEVELS = [
  'Undergraduate',
  'Masters',
  'Doctoral'
] as const

// Priority levels
export const PRIORITY_LEVELS = [
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'High (Deadline approaching)' },
  { value: 'Urgent', label: 'Urgent (Immediate attention needed)' },
  { value: 'Low', label: 'Low (No time pressure)' }
];

// Document categories for upload
export const DOCUMENT_CATEGORIES = [
  { value: 'Thesis Guide', label: 'Thesis Guide / Manual' },
  { value: 'Proposal', label: 'Proposal Document' },
  { value: 'Draft Chapter', label: 'Draft Chapter' },
  { value: 'Supervisor Comment', label: 'Supervisor Comment' },
  { value: 'Data', label: 'Research Data' },
  { value: 'Other', label: 'Other Document' }
];