'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRequestDetail } from '@/hooks/useRequestDetail';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { 
  ArrowLeft, 
  User, 
  FileText, 
  Clock, 
  MessageSquare, 
  Activity,
  Upload,
  Download,
  Save,
  Send,
  Bot,
  AlertCircle,
  CheckCircle,
  X,
  Calendar,
  Mail,
  Phone,
  Building,
  GraduationCap
} from 'lucide-react';
import { formatDistanceToNow, formatDate } from '@/lib/utils/date';

const STATUS_OPTIONS = [
  { value: 'New Request', label: 'New Request' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'Waiting for Documents', label: 'Waiting for Documents' },
  { value: 'Ready for Assessment', label: 'Ready for Assessment' },
  { value: 'Assessment Complete', label: 'Assessment Complete' },
  { value: 'Recommendation Sent', label: 'Recommendation Sent' },
  { value: 'Waiting for Client Decision', label: 'Waiting for Client Decision' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Declined', label: 'Declined' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const COMPLEXITY_OPTIONS = [
  { value: '', label: 'Select complexity' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

const RISK_OPTIONS = [
  { value: '', label: 'Select risk level' },
  { value: 'Low', label: 'Low Risk' },
  { value: 'Medium', label: 'Medium Risk' },
  { value: 'High', label: 'High Risk' },
];

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    'New Request': 'info',
    'Under Review': 'warning',
    'Waiting for Documents': 'warning',
    'Ready for Assessment': 'info',
    'Assessment Complete': 'success',
    'Recommendation Sent': 'info',
    'Waiting for Client Decision': 'warning',
    'Approved': 'success',
    'Declined': 'error',
    'Cancelled': 'error',
    'Project Activated': 'info',
  };

  return (
    <Badge variant={variants[status] || 'default'}>
      {status}
    </Badge>
  );
}

function SectionCard({ 
  title, 
  icon: Icon, 
  children, 
  actions 
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  actions?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-green/10 rounded-lg text-brand-green">
            {Icon}
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, error, updateStatus, assignStaff, saveAssessment, updateAssessment, saveRecommendation, updateRecommendation, addNote, convertToProject } = useRequestDetail(id);

  const [activeTab, setActiveTab] = useState<'overview' | 'client' | 'documents' | 'assessment' | 'recommendation' | 'notes' | 'activity'>('overview');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assessment form state
  const [assessmentForm, setAssessmentForm] = useState({
    complexity: '',
    risk_level: '',
    strengths: '',
    weaknesses: '',
    missing_requirements: '',
    assessment_summary: '',
  });

  // Recommendation form state
  const [recommendationForm, setRecommendationForm] = useState({
    recommended_service: '',
    timeline: '',
    estimated_cost: '',
    payment_structure: '',
    summary: '',
  });

  // Convert to project form
  const [projectForm, setProjectForm] = useState({
    project_title: '',
    start_date: '',
    deadline: '',
    service_package: '',
    payment_structure: '',
    estimated_cost: '',
  });

  // Update forms when data loads
  useState(() => {
    if (data?.assessment) {
      setAssessmentForm({
        complexity: data.assessment.complexity || '',
        risk_level: data.assessment.risk_level || '',
        strengths: data.assessment.strengths || '',
        weaknesses: data.assessment.weaknesses || '',
        missing_requirements: data.assessment.missing_requirements || '',
        assessment_summary: data.assessment.assessment_summary || '',
      });
    }
    if (data?.recommendation) {
      setRecommendationForm({
        recommended_service: data.recommendation.recommended_service || '',
        timeline: data.recommendation.timeline || '',
        estimated_cost: data.recommendation.estimated_cost?.toString() || '',
        payment_structure: data.recommendation.payment_structure || '',
        summary: data.recommendation.summary || '',
      });
    }
    if (data?.working_title) {
      setProjectForm(prev => ({ ...prev, project_title: data.working_title || '' }));
    }
  });

  const handleStatusChange = async (status: string) => {
    setIsSubmitting(true);
    try {
      await updateStatus(status);
      setShowStatusModal(false);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAssessment = async () => {
    setIsSubmitting(true);
    try {
      if (data?.assessment) {
        await updateAssessment(assessmentForm);
      } else {
        await saveAssessment(assessmentForm);
      }
    } catch (err) {
      console.error('Failed to save assessment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRecommendation = async (isDraft: boolean) => {
    setIsSubmitting(true);
    try {
      const recData = {
        ...recommendationForm,
        estimated_cost: parseFloat(recommendationForm.estimated_cost) || null,
      };
      if (data?.recommendation) {
        await updateRecommendation(recData, isDraft);
      } else {
        await saveRecommendation(recData, isDraft);
      }
    } catch (err) {
      console.error('Failed to save recommendation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    try {
      await addNote(newNote);
      setNewNote('');
      setShowNoteModal(false);
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToProject = async () => {
    setIsSubmitting(true);
    try {
      const result = await convertToProject({
        project_title: projectForm.project_title,
        start_date: projectForm.start_date || new Date().toISOString().split('T')[0],
        deadline: projectForm.deadline,
        service_package: projectForm.service_package || data?.requested_service || '',
        payment_structure: projectForm.payment_structure,
        estimated_cost: parseFloat(projectForm.estimated_cost) || 0,
      });
      if (result.project?.id) {
        router.push(`/workspace/projects/${result.project.id}`);
      }
    } catch (err) {
      console.error('Failed to convert to project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Link href="/workspace/requests">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
        </Link>
        <EmptyState
          icon={<AlertCircle className="h-8 w-8 text-red-500" />}
          title="Error Loading Request"
          description={error || 'Request not found'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/workspace/requests">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {data.request_reference}
              </h1>
              <StatusBadge status={data.status} />
            </div>
            <p className="text-gray-500 mt-1">
              {data.working_title || 'Untitled Request'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setShowAssignModal(true)}>
            Assign Staff
          </Button>
          <Button variant="secondary" onClick={() => setShowStatusModal(true)}>
            Change Status
          </Button>
          <Button onClick={() => setShowConvertModal(true)}>
            Convert to Project
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: <FileText className="h-4 w-4" /> },
            { id: 'client', label: 'Client', icon: <User className="h-4 w-4" /> },
            { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
            { id: 'assessment', label: 'Assessment', icon: <CheckCircle className="h-4 w-4" /> },
            { id: 'recommendation', label: 'Recommendation', icon: <Send className="h-4 w-4" /> },
            { id: 'notes', label: 'Notes', icon: <MessageSquare className="h-4 w-4" /> },
            { id: 'activity', label: 'Activity Log', icon: <Activity className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-green text-brand-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Request Details" icon={<FileText className="h-5 w-5" />}>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-gray-500">Request Reference</dt>
                  <dd className="font-mono font-medium text-brand-green">{data.request_reference}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Priority</dt>
                  <dd><Badge variant={data.priority === 'Urgent' ? 'error' : data.priority === 'High' ? 'warning' : 'default'}>{data.priority}</Badge></dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Requested Service</dt>
                  <dd className="font-medium">{data.requested_service}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Submission Date</dt>
                  <dd>{formatDate(data.created_at)}</dd>
                </div>
                {data.submission_deadline && (
                  <div>
                    <dt className="text-sm text-gray-500">Deadline</dt>
                    <dd>{formatDate(data.submission_deadline)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-500">Assigned To</dt>
                  <dd>{data.staff?.full_name || 'Unassigned'}</dd>
                </div>
              </dl>
            </SectionCard>

            <SectionCard title="Operations GPT" icon={<Bot className="h-5 w-5" />}>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-4 bg-brand-green/10 rounded-full mb-4">
                  <Bot className="h-8 w-8 text-brand-green" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">✨ Analyze Request</h3>
                <p className="text-sm text-gray-500 mb-4 max-w-sm">
                  Use AI to analyze this request, extract key information, and get suggestions for next steps.
                </p>
                <Button disabled>
                  Coming Soon
                </Button>
              </div>
            </SectionCard>
          </div>
        )}

        {/* Client Tab */}
        {activeTab === 'client' && data.clients && (
          <SectionCard title="Client Information" icon={<User className="h-5 w-5" />}>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <User className="h-4 w-4" /> Full Name
                </dt>
                <dd className="font-medium">{data.clients.full_name}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Mail className="h-4 w-4" /> Email
                </dt>
                <dd>{data.clients.email}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Phone className="h-4 w-4" /> Phone
                </dt>
                <dd>{data.clients.phone || '-'}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Building className="h-4 w-4" /> Institution
                </dt>
                <dd>{data.clients.institution || '-'}</dd>
              </div>
              {data.clients.programme && (
                <div>
                  <dt className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <GraduationCap className="h-4 w-4" /> Programme
                  </dt>
                  <dd>{data.clients.programme}</dd>
                </div>
              )}
              {data.clients.academic_level && (
                <div>
                  <dt className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <GraduationCap className="h-4 w-4" /> Academic Level
                  </dt>
                  <dd>{data.clients.academic_level}</dd>
                </div>
              )}
            </dl>
          </SectionCard>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <SectionCard 
            title="Documents" 
            icon={<FileText className="h-5 w-5" />}
            actions={
              <Button size="sm" variant="secondary">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            }
          >
            {data.documents && data.documents.length > 0 ? (
              <div className="space-y-3">
                {data.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.file_name}</p>
                        <p className="text-sm text-gray-500">{doc.category} • {(doc.file_size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No documents uploaded</p>
              </div>
            )}
          </SectionCard>
        )}

        {/* Assessment Tab */}
        {activeTab === 'assessment' && (
          <SectionCard title="Assessment" icon={<CheckCircle className="h-5 w-5" />}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Complexity"
                  value={assessmentForm.complexity}
                  onChange={(e) => setAssessmentForm(prev => ({ ...prev, complexity: e.target.value }))}
                  options={COMPLEXITY_OPTIONS}
                />
                <Select
                  label="Risk Level"
                  value={assessmentForm.risk_level}
                  onChange={(e) => setAssessmentForm(prev => ({ ...prev, risk_level: e.target.value }))}
                  options={RISK_OPTIONS}
                />
              </div>
              <Textarea
                label="Strengths"
                value={assessmentForm.strengths}
                onChange={(e) => setAssessmentForm(prev => ({ ...prev, strengths: e.target.value }))}
                placeholder="Identify the strengths of this request..."
                rows={3}
              />
              <Textarea
                label="Weaknesses"
                value={assessmentForm.weaknesses}
                onChange={(e) => setAssessmentForm(prev => ({ ...prev, weaknesses: e.target.value }))}
                placeholder="Identify the weaknesses or concerns..."
                rows={3}
              />
              <Textarea
                label="Missing Requirements"
                value={assessmentForm.missing_requirements}
                onChange={(e) => setAssessmentForm(prev => ({ ...prev, missing_requirements: e.target.value }))}
                placeholder="List any missing information or requirements..."
                rows={3}
              />
              <Textarea
                label="Assessment Summary"
                value={assessmentForm.assessment_summary}
                onChange={(e) => setAssessmentForm(prev => ({ ...prev, assessment_summary: e.target.value }))}
                placeholder="Overall assessment of the request..."
                rows={4}
              />
              <div className="flex justify-end">
                <Button onClick={handleSaveAssessment} disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Assessment
                </Button>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Recommendation Tab */}
        {activeTab === 'recommendation' && (
          <SectionCard title="Recommendation" icon={<Send className="h-5 w-5" />}>
            <div className="space-y-6">
              <Input
                label="Recommended Service"
                value={recommendationForm.recommended_service}
                onChange={(e) => setRecommendationForm(prev => ({ ...prev, recommended_service: e.target.value }))}
                placeholder="e.g., Package C: Complete Thesis Development"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Timeline"
                  value={recommendationForm.timeline}
                  onChange={(e) => setRecommendationForm(prev => ({ ...prev, timeline: e.target.value }))}
                  placeholder="e.g., 3-4 months"
                />
                <Input
                  label="Estimated Cost"
                  type="number"
                  value={recommendationForm.estimated_cost}
                  onChange={(e) => setRecommendationForm(prev => ({ ...prev, estimated_cost: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <Input
                label="Payment Structure"
                value={recommendationForm.payment_structure}
                onChange={(e) => setRecommendationForm(prev => ({ ...prev, payment_structure: e.target.value }))}
                placeholder="e.g., 50% upfront, 50% on completion"
              />
              <Textarea
                label="Recommendation Summary"
                value={recommendationForm.summary}
                onChange={(e) => setRecommendationForm(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Detailed recommendation summary for the client..."
                rows={5}
              />
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => handleSaveRecommendation(true)} disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={() => handleSaveRecommendation(false)} disabled={isSubmitting}>
                  <Send className="h-4 w-4 mr-2" />
                  Send to Client
                </Button>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <SectionCard 
            title="Internal Notes" 
            icon={<MessageSquare className="h-5 w-5" />}
            actions={
              <Button size="sm" variant="secondary" onClick={() => setShowNoteModal(true)}>
                Add Note
              </Button>
            }
          >
            {data.notes && data.notes.length > 0 ? (
              <div className="space-y-4">
                {data.notes.map((note) => (
                  <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{note.author_name}</span>
                      <span className="text-sm text-gray-500">{formatDistanceToNow(note.created_at)}</span>
                    </div>
                    <p className="text-gray-600">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No internal notes yet</p>
              </div>
            )}
          </SectionCard>
        )}

        {/* Activity Log Tab */}
        {activeTab === 'activity' && (
          <SectionCard title="Activity Log" icon={<Activity className="h-5 w-5" />}>
            {data.activities && data.activities.length > 0 ? (
              <div className="space-y-4">
                {data.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-brand-green flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-900">{activity.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span>{activity.performer_name}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(activity.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No activity recorded</p>
              </div>
            )}
          </SectionCard>
        )}
      </div>

      {/* Status Change Modal */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Change Status">
        <Select
          label="New Status"
          options={STATUS_OPTIONS}
          onChange={(e) => {}}
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
          <Button onClick={() => handleStatusChange('Under Review')}>Update Status</Button>
        </div>
      </Modal>

      {/* Assign Staff Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Staff Member">
        <p className="text-gray-500 mb-4">Select a staff member to assign to this request.</p>
        <Select
          label="Staff Member"
          options={[{ value: '', label: 'Select staff member' }]}
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
          <Button onClick={() => setShowAssignModal(false)}>Assign</Button>
        </div>
      </Modal>

      {/* Convert to Project Modal */}
      <Modal isOpen={showConvertModal} onClose={() => setShowConvertModal(false)} title="Convert to Project" size="lg">
        <p className="text-gray-500 mb-4">Create a new project from this support request.</p>
        <div className="space-y-4">
          <Input
            label="Project Title"
            value={projectForm.project_title}
            onChange={(e) => setProjectForm(prev => ({ ...prev, project_title: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={projectForm.start_date}
              onChange={(e) => setProjectForm(prev => ({ ...prev, start_date: e.target.value }))}
            />
            <Input
              label="Deadline"
              type="date"
              value={projectForm.deadline}
              onChange={(e) => setProjectForm(prev => ({ ...prev, deadline: e.target.value }))}
            />
          </div>
          <Input
            label="Service Package"
            value={projectForm.service_package}
            onChange={(e) => setProjectForm(prev => ({ ...prev, service_package: e.target.value }))}
          />
          <Input
            label="Payment Structure"
            value={projectForm.payment_structure}
            onChange={(e) => setProjectForm(prev => ({ ...prev, payment_structure: e.target.value }))}
            placeholder="e.g., 50% upfront, 50% on completion"
          />
          <Input
            label="Estimated Cost"
            type="number"
            value={projectForm.estimated_cost}
            onChange={(e) => setProjectForm(prev => ({ ...prev, estimated_cost: e.target.value }))}
            placeholder="0.00"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowConvertModal(false)}>Cancel</Button>
          <Button onClick={handleConvertToProject} disabled={isSubmitting}>Create Project</Button>
        </div>
      </Modal>

      {/* Add Note Modal */}
      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Add Internal Note">
        <Textarea
          label="Note"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Enter your note..."
          rows={5}
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowNoteModal(false)}>Cancel</Button>
          <Button onClick={handleAddNote} disabled={isSubmitting || !newNote.trim()}>Add Note</Button>
        </div>
      </Modal>
    </div>
  );
}