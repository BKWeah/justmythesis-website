'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProjectDetail } from '@/hooks/useProjectDetail';
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
  FolderKanban,
  Clock,
  Target,
  Users,
  FileText,
  CreditCard,
  Shield,
  Package,
  Activity,
  Plus,
  Upload,
  Download,
  Save,
  Check,
  AlertCircle,
  Calendar,
  Mail,
  Building
} from 'lucide-react';
import { formatDistanceToNow, formatDate } from '@/lib/utils/date';

const STAGES = [
  'Initiated',
  'Research',
  'Writing',
  'Review',
  'Quality Assurance',
  'Ready for Delivery',
  'Delivered',
  'Completed'
];

const STAGE_COLORS: Record<string, string> = {
  'Initiated': 'bg-blue-100 text-blue-800 border-blue-200',
  'Research': 'bg-purple-100 text-purple-800 border-purple-200',
  'Writing': 'bg-amber-100 text-amber-800 border-amber-200',
  'Review': 'bg-orange-100 text-orange-800 border-orange-200',
  'Quality Assurance': 'bg-teal-100 text-teal-800 border-teal-200',
  'Ready for Delivery': 'bg-green-100 text-green-800 border-green-200',
  'Delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Completed': 'bg-gray-100 text-gray-800 border-gray-200',
};

const QA_STATUS_OPTIONS = [
  { value: '', label: 'Select status' },
  { value: 'Pending', label: 'Pending' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Passed', label: 'Passed' },
  { value: 'Failed', label: 'Failed - Corrections Needed' },
];

function StageBadge({ stage }: { stage: string }) {
  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${STAGE_COLORS[stage] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {stage}
    </span>
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

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { 
    data, isLoading, error, refetch, 
    updateStage, completeProject, archiveProject,
    addMilestone, completeMilestone,
    assignTeamMember, removeTeamMember, updateTeamRole,
    saveQAReview,
    confirmDeliverable
  } = useProjectDetail(id);

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'milestones' | 'team' | 'documents' | 'payments' | 'qa' | 'deliverables' | 'activity'>('overview');
  const [showStageModal, setShowStageModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', due_date: '' });
  const [qaForm, setQaForm] = useState({
    structure_review: '',
    formatting_review: '',
    citation_review: '',
    compliance_review: '',
    overall_status: '',
    reviewer_notes: '',
  });

  const handleUpdateStage = async (stage: string) => {
    setIsSubmitting(true);
    try {
      await updateStage(stage);
      setShowStageModal(false);
    } catch (err) {
      console.error('Failed to update stage:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!milestoneForm.title || !milestoneForm.due_date) return;
    setIsSubmitting(true);
    try {
      await addMilestone(milestoneForm);
      setMilestoneForm({ title: '', description: '', due_date: '' });
      setShowMilestoneModal(false);
    } catch (err) {
      console.error('Failed to add milestone:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    setIsSubmitting(true);
    try {
      await completeMilestone(milestoneId);
    } catch (err) {
      console.error('Failed to complete milestone:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveQA = async () => {
    setIsSubmitting(true);
    try {
      await saveQAReview(qaForm);
    } catch (err) {
      console.error('Failed to save QA review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteProject = async () => {
    setIsSubmitting(true);
    try {
      await completeProject();
      setShowCompleteModal(false);
    } catch (err) {
      console.error('Failed to complete project:', err);
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
        <Link href="/workspace/projects">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        <EmptyState
          icon={<AlertCircle className="h-8 w-8 text-red-500" />}
          title="Error Loading Project"
          description={error || 'Project not found'}
        />
      </div>
    );
  }

  const isCompleted = data.status === 'Completed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/workspace/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {data.project_reference}
              </h1>
              <Badge variant={isCompleted ? 'success' : 'info'}>
                {data.status}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">
              {data.project_title || 'Untitled Project'}
            </p>
          </div>
        </div>
        {!isCompleted && (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setShowTeamModal(true)}>
              <Users className="h-4 w-4 mr-2" />
              Assign Team
            </Button>
            <Button variant="secondary" onClick={() => setShowStageModal(true)}>
              <Target className="h-4 w-4 mr-2" />
              Update Stage
            </Button>
            <Button onClick={() => setShowCompleteModal(true)}>
              <Check className="h-4 w-4 mr-2" />
              Mark Completed
            </Button>
          </div>
        )}
      </div>

      {/* Stage Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between overflow-x-auto gap-2">
            {STAGES.map((stage, index) => {
              const isCurrentStage = data.current_stage === stage;
              const isPastStage = STAGES.indexOf(data.current_stage) > index;
              return (
                <div key={stage} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${isPastStage ? 'bg-brand-green text-white' : ''}
                      ${isCurrentStage ? 'bg-brand-green text-white ring-4 ring-brand-green/20' : ''}
                      ${!isPastStage && !isCurrentStage ? 'bg-gray-200 text-gray-500' : ''}
                    `}>
                      {isPastStage ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    <span className={`text-xs mt-1 whitespace-nowrap ${isCurrentStage ? 'font-semibold text-brand-green' : 'text-gray-500'}`}>
                      {stage}
                    </span>
                  </div>
                  {index < STAGES.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${isPastStage ? 'bg-brand-green' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: <FolderKanban className="h-4 w-4" /> },
            { id: 'timeline', label: 'Timeline', icon: <Clock className="h-4 w-4" /> },
            { id: 'milestones', label: 'Milestones', icon: <Target className="h-4 w-4" /> },
            { id: 'team', label: 'Team', icon: <Users className="h-4 w-4" /> },
            { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
            { id: 'payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
            { id: 'qa', label: 'Quality Assurance', icon: <Shield className="h-4 w-4" /> },
            { id: 'deliverables', label: 'Deliverables', icon: <Package className="h-4 w-4" /> },
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
            <SectionCard title="Project Details" icon={<FolderKanban className="h-5 w-5" />}>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-gray-500">Project Reference</dt>
                  <dd className="font-mono font-medium text-brand-green">{data.project_reference}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Current Stage</dt>
                  <dd><StageBadge stage={data.current_stage} /></dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Start Date</dt>
                  <dd>{data.start_date ? formatDate(data.start_date) : '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Target Completion</dt>
                  <dd>{data.expected_delivery_date ? formatDate(data.expected_delivery_date) : '-'}</dd>
                </div>
              </dl>
            </SectionCard>

            <SectionCard title="Linked Request" icon={<FileText className="h-5 w-5" />}>
              {data.linked_request ? (
                <div>
                  <p className="font-mono font-medium text-brand-green">{data.linked_request.request_reference}</p>
                  <p className="text-sm text-gray-500 mt-1">{data.linked_request.working_title}</p>
                  <p className="text-xs text-gray-400 mt-1">Status: {data.linked_request.status}</p>
                </div>
              ) : (
                <p className="text-gray-500">No linked request</p>
              )}
            </SectionCard>

            <SectionCard title="Client" icon={<Users className="h-5 w-5" />}>
              {data.clients && (
                <dl className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-24">Name:</span>
                    <span className="font-medium">{data.clients.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-24">Email:</span>
                    <span>{data.clients.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-24">Institution:</span>
                    <span>{data.clients.institution || '-'}</span>
                  </div>
                </dl>
              )}
            </SectionCard>

            <SectionCard title="Team" icon={<Users className="h-5 w-5" />}>
              {data.team && data.team.length > 0 ? (
                <div className="space-y-2">
                  {data.team.map((member) => (
                    <div key={member.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{member.staff_name}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No team members assigned</p>
              )}
            </SectionCard>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <SectionCard title="Project Timeline" icon={<Clock className="h-5 w-5" />}>
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
              <p className="text-gray-500 text-center py-8">No timeline events yet</p>
            )}
          </SectionCard>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <SectionCard 
            title="Project Milestones" 
            icon={<Target className="h-5 w-5" />}
            actions={
              !isCompleted && (
                <Button size="sm" variant="secondary" onClick={() => setShowMilestoneModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
              )
            }
          >
            {data.milestones && data.milestones.length > 0 ? (
              <div className="space-y-4">
                {data.milestones.map((milestone) => (
                  <div key={milestone.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <Badge variant={milestone.status === 'Completed' ? 'success' : milestone.status === 'In Progress' ? 'warning' : 'default'}>
                            {milestone.status}
                          </Badge>
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                          <span>Due: {formatDate(milestone.due_date)}</span>
                          {milestone.completed_date && (
                            <span>Completed: {formatDate(milestone.completed_date)}</span>
                          )}
                        </div>
                      </div>
                      {milestone.status !== 'Completed' && !isCompleted && (
                        <Button size="sm" variant="secondary" onClick={() => handleCompleteMilestone(milestone.id)}>
                          <Check className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No milestones created yet</p>
            )}
          </SectionCard>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <SectionCard 
            title="Project Team" 
            icon={<Users className="h-5 w-5" />}
            actions={
              !isCompleted && (
                <Button size="sm" variant="secondary" onClick={() => setShowTeamModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Assign
                </Button>
              )
            }
          >
            {data.team && data.team.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Staff Name</th>
                      <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Assigned Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.team.map((member) => (
                      <tr key={member.id} className="border-b last:border-0">
                        <td className="py-3 font-medium">{member.staff_name}</td>
                        <td className="py-3">
                          <Badge variant="default">{member.role}</Badge>
                        </td>
                        <td className="py-3 text-gray-500">{member.staff_email}</td>
                        <td className="py-3 text-gray-500">{formatDate(member.assigned_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No team members assigned</p>
            )}
          </SectionCard>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <SectionCard 
            title="Project Documents" 
            icon={<FileText className="h-5 w-5" />}
            actions={
              !isCompleted && (
                <Button size="sm" variant="secondary">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              )
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
              <p className="text-gray-500 text-center py-8">No documents uploaded</p>
            )}
          </SectionCard>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <SectionCard title="Payment Information" icon={<CreditCard className="h-5 w-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Invoice Total</p>
                <p className="text-2xl font-bold text-gray-900">$0.00</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="text-2xl font-bold text-green-600">$0.00</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Balance</p>
                <p className="text-2xl font-bold text-amber-600">$0.00</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Payment management coming soon
            </p>
          </SectionCard>
        )}

        {/* QA Tab */}
        {activeTab === 'qa' && (
          <SectionCard title="Quality Assurance Review" icon={<Shield className="h-5 w-5" />}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Textarea
                  label="Structure Review"
                  value={qaForm.structure_review}
                  onChange={(e) => setQaForm(prev => ({ ...prev, structure_review: e.target.value }))}
                  placeholder="Review project structure..."
                  rows={3}
                  disabled={isCompleted}
                />
                <Textarea
                  label="Formatting Review"
                  value={qaForm.formatting_review}
                  onChange={(e) => setQaForm(prev => ({ ...prev, formatting_review: e.target.value }))}
                  placeholder="Review formatting..."
                  rows={3}
                  disabled={isCompleted}
                />
                <Textarea
                  label="Citation Review"
                  value={qaForm.citation_review}
                  onChange={(e) => setQaForm(prev => ({ ...prev, citation_review: e.target.value }))}
                  placeholder="Review citations..."
                  rows={3}
                  disabled={isCompleted}
                />
                <Textarea
                  label="Compliance Review"
                  value={qaForm.compliance_review}
                  onChange={(e) => setQaForm(prev => ({ ...prev, compliance_review: e.target.value }))}
                  placeholder="Review compliance..."
                  rows={3}
                  disabled={isCompleted}
                />
              </div>
              <Select
                label="Overall Status"
                value={qaForm.overall_status}
                onChange={(e) => setQaForm(prev => ({ ...prev, overall_status: e.target.value }))}
                options={QA_STATUS_OPTIONS}
                disabled={isCompleted}
              />
              <Textarea
                label="Reviewer Notes"
                value={qaForm.reviewer_notes}
                onChange={(e) => setQaForm(prev => ({ ...prev, reviewer_notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={3}
                disabled={isCompleted}
              />
              {!isCompleted && (
                <div className="flex justify-end">
                  <Button onClick={handleSaveQA} disabled={isSubmitting}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Review
                  </Button>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Deliverables Tab */}
        {activeTab === 'deliverables' && (
          <SectionCard 
            title="Project Deliverables" 
            icon={<Package className="h-5 w-5" />}
            actions={
              !isCompleted && (
                <Button size="sm" variant="secondary">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Deliverable
                </Button>
              )
            }
          >
            {data.deliverables && data.deliverables.length > 0 ? (
              <div className="space-y-3">
                {data.deliverables.map((del) => (
                  <div key={del.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Version {del.version}</h4>
                          {del.is_final && <Badge variant="success">Final</Badge>}
                          {del.client_confirmed && <Badge variant="info">Confirmed</Badge>}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{del.file_name}</p>
                        <p className="text-xs text-gray-400 mt-1">Uploaded: {formatDate(del.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No deliverables uploaded yet</p>
            )}
          </SectionCard>
        )}

        {/* Activity Tab */}
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
              <p className="text-gray-500 text-center py-8">No activity recorded</p>
            )}
          </SectionCard>
        )}
      </div>

      {/* Update Stage Modal */}
      <Modal isOpen={showStageModal} onClose={() => setShowStageModal(false)} title="Update Project Stage">
        <Select
          label="Select Stage"
          value={data.current_stage}
          onChange={(e) => {}}
          options={STAGES.map(s => ({ value: s, label: s }))}
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowStageModal(false)}>Cancel</Button>
          <Button onClick={() => handleUpdateStage(data.current_stage)} disabled={isSubmitting}>Update Stage</Button>
        </div>
      </Modal>

      {/* Add Milestone Modal */}
      <Modal isOpen={showMilestoneModal} onClose={() => setShowMilestoneModal(false)} title="Add Milestone">
        <div className="space-y-4">
          <Input
            label="Title"
            value={milestoneForm.title}
            onChange={(e) => setMilestoneForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Milestone title"
          />
          <Textarea
            label="Description"
            value={milestoneForm.description}
            onChange={(e) => setMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Milestone description"
            rows={3}
          />
          <Input
            label="Due Date"
            type="date"
            value={milestoneForm.due_date}
            onChange={(e) => setMilestoneForm(prev => ({ ...prev, due_date: e.target.value }))}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowMilestoneModal(false)}>Cancel</Button>
          <Button onClick={handleAddMilestone} disabled={isSubmitting || !milestoneForm.title || !milestoneForm.due_date}>
            Add Milestone
          </Button>
        </div>
      </Modal>

      {/* Assign Team Modal */}
      <Modal isOpen={showTeamModal} onClose={() => setShowTeamModal(false)} title="Assign Team Member">
        <p className="text-gray-500 mb-4">Select a staff member to assign to this project.</p>
        <Select
          label="Staff Member"
          options={[{ value: '', label: 'Select staff member' }]}
        />
        <Select
          label="Role"
          options={[
            { value: '', label: 'Select role' },
            { value: 'Project Lead', label: 'Project Lead' },
            { value: 'Researcher', label: 'Researcher' },
            { value: 'Writer', label: 'Writer' },
            { value: 'QA Reviewer', label: 'QA Reviewer' },
          ]}
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowTeamModal(false)}>Cancel</Button>
          <Button onClick={() => setShowTeamModal(false)}>Assign</Button>
        </div>
      </Modal>

      {/* Complete Project Modal */}
      <Modal isOpen={showCompleteModal} onClose={() => setShowCompleteModal(false)} title="Complete Project">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to mark this project as completed? This action cannot be undone.
          </p>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Once completed, the project will become read-only.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>Cancel</Button>
          <Button onClick={handleCompleteProject} disabled={isSubmitting}>
            <Check className="h-4 w-4 mr-2" />
            Confirm Completion
          </Button>
        </div>
      </Modal>
    </div>
  );
}