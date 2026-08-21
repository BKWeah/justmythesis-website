'use client';
import DeliverablesTab from '@/components/projects/DeliverablesTab';
import QualityAssuranceTab from '@/components/projects/QualityAssuranceTab';
import PaymentsTab from '@/components/projects/PaymentsTab';
import StaffProjectMessages from '@/components/projects/StaffProjectMessages';
import ProjectDocumentsTab from '@/components/projects/ProjectDocumentsTab';
import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  MessageSquareText,
  Plus,
  Save,
  Check,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow, formatDate } from '@/lib/utils/date';

const PROJECT_STATUSES = [
  'Project Activated',
  'Development',
  'Quality Review',
  'Ready for Delivery',
  'Delivered',
  'Completed'
];

const STAGE_COLORS: Record<string, string> = {
  'Project Activated': 'bg-blue-100 text-blue-800 border-blue-200',
  'Development': 'bg-purple-100 text-purple-800 border-purple-200',
  'Quality Review': 'bg-teal-100 text-teal-800 border-teal-200',
  'Ready for Delivery': 'bg-green-100 text-green-800 border-green-200',
  'Delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Completed': 'bg-gray-100 text-gray-800 border-gray-200',
};

const PROJECT_ROLE_OPTIONS = [
  { value: '', label: 'Select project role' },
  { value: 'Operations Manager', label: 'Operations Manager' },
  { value: 'Academic Consultant', label: 'Academic Consultant' },
  { value: 'QA Specialist', label: 'QA Specialist' },
  { value: 'Client Success Officer', label: 'Client Success Officer' },
];

interface StaffOption {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

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

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { 
    data, isLoading, error, refetch, 
    updateProject, completeProject,
    addMilestone, completeMilestone,
    assignTeamMember, removeTeamMember, updateTeamRole
  } = useProjectDetail(id);

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'milestones' | 'team' | 'documents' | 'payments' | 'qa' | 'deliverables' | 'messages' | 'activity'>('overview');
  const [showProjectUpdateModal, setShowProjectUpdateModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [projectUpdateError, setProjectUpdateError] = useState<string | null>(null);

  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', due_date: '' });
  const [teamForm, setTeamForm] = useState({ staffId: '', role: '' });
  const [projectUpdateForm, setProjectUpdateForm] = useState({
    status: 'Project Activated',
    completionPercentage: 0,
    expectedDeliveryDate: '',
    notes: '',
  });

  useEffect(() => {
    if (!data) return;

    setProjectUpdateForm({
      status: data.status,
      completionPercentage: data.completion_percentage ?? 0,
      expectedDeliveryDate: data.expected_delivery_date ?? '',
      notes: data.notes ?? '',
    });
  }, [data]);

  const handleUpdateProject = async () => {
    setIsSubmitting(true);
    setProjectUpdateError(null);

    try {
      await updateProject({
        status: projectUpdateForm.status,
        completionPercentage: projectUpdateForm.completionPercentage,
        expectedDeliveryDate: projectUpdateForm.expectedDeliveryDate || null,
        notes: projectUpdateForm.notes,
      });
      setShowProjectUpdateModal(false);
    } catch (err) {
      setProjectUpdateError(
        err instanceof Error ? err.message : 'Failed to update project'
      );
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

  useEffect(() => {
    if (!showTeamModal || staffOptions.length > 0) return;

    const loadStaff = async () => {
      try {
        setIsLoadingStaff(true);
        setTeamError(null);

        const response = await fetch('/api/staff', { cache: 'no-store' });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || 'Failed to load staff members');
        }

        setStaffOptions(result.staff || []);
      } catch (err) {
        setTeamError(
          err instanceof Error ? err.message : 'Failed to load staff members'
        );
      } finally {
        setIsLoadingStaff(false);
      }
    };

    void loadStaff();
  }, [showTeamModal, staffOptions.length]);

  const handleAssignTeamMember = async () => {
    if (!teamForm.staffId || !teamForm.role) return;

    try {
      setIsSubmitting(true);
      setTeamError(null);
      await assignTeamMember(teamForm.staffId, teamForm.role);
      setTeamForm({ staffId: '', role: '' });
      setShowTeamModal(false);
    } catch (err) {
      setTeamError(
        err instanceof Error ? err.message : 'Failed to assign team member'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTeamMember = async (memberId: string) => {
    const confirmed = window.confirm('Remove this staff member from the project team?');
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      await removeTeamMember(memberId);
    } catch (err) {
      console.error('Failed to remove team member:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTeamRole = async (memberId: string, role: string) => {
    try {
      setIsSubmitting(true);
      await updateTeamRole(memberId, role);
    } catch (err) {
      console.error('Failed to update team role:', err);
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
    return <div className="space-y-6"><LoadingState /></div>;
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/workspace/projects">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{data.project_reference}</h1>
              <Badge variant={isCompleted ? 'success' : 'info'}>{data.status}</Badge>
            </div>
            <p className="text-gray-500 mt-1">{data.project_title || 'Untitled Project'}</p>
          </div>
        </div>
        {!isCompleted && (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setShowTeamModal(true)}>
              <Users className="h-4 w-4 mr-2" />Assign Team
            </Button>
            <Button variant="secondary" onClick={() => setShowProjectUpdateModal(true)}>
              <Target className="h-4 w-4 mr-2" />Update Project
            </Button>
            <Button onClick={() => setShowCompleteModal(true)}>
              <Check className="h-4 w-4 mr-2" />Mark Completed
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between overflow-x-auto gap-2">
            {PROJECT_STATUSES.map((stage, index) => {
              const isCurrentStage = data.status === stage;
              const isPastStage = PROJECT_STATUSES.indexOf(data.status) > index;
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
                  {index < PROJECT_STATUSES.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${isPastStage ? 'bg-brand-green' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
            { id: 'messages', label: 'Messages', icon: <MessageSquareText className="h-4 w-4" /> },
            { id: 'activity', label: 'Activity Log', icon: <Activity className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-green text-brand-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Project Details" icon={<FolderKanban className="h-5 w-5" />}>
              <dl className="space-y-4">
                <div><dt className="text-sm text-gray-500">Project Reference</dt><dd className="font-mono font-medium text-brand-green">{data.project_reference}</dd></div>
                <div><dt className="text-sm text-gray-500">Status</dt><dd><StageBadge stage={data.status} /></dd></div>
                <div><dt className="text-sm text-gray-500">Progress</dt><dd className="font-medium">{data.completion_percentage}%</dd></div>
                <div><dt className="text-sm text-gray-500">Start Date</dt><dd>{data.start_date ? formatDate(data.start_date) : '-'}</dd></div>
                <div><dt className="text-sm text-gray-500">Target Completion</dt><dd>{data.expected_delivery_date ? formatDate(data.expected_delivery_date) : '-'}</dd></div>
              </dl>
            </SectionCard>

            <SectionCard title="Linked Request" icon={<FileText className="h-5 w-5" />}>
              {data.linked_request ? (
                <div>
                  <p className="font-mono font-medium text-brand-green">{data.linked_request.request_reference}</p>
                  <p className="text-sm text-gray-500 mt-1">{data.linked_request.working_title}</p>
                  <p className="text-xs text-gray-400 mt-1">Status: {data.linked_request.status}</p>
                </div>
              ) : <p className="text-gray-500">No linked request</p>}
            </SectionCard>

            <SectionCard title="Client" icon={<Users className="h-5 w-5" />}>
              {data.clients && (
                <dl className="space-y-2">
                  <div className="flex items-center gap-2"><span className="text-sm text-gray-500 w-24">Name:</span><span className="font-medium">{data.clients.full_name}</span></div>
                  <div className="flex items-center gap-2"><span className="text-sm text-gray-500 w-24">Email:</span><span>{data.clients.email}</span></div>
                  <div className="flex items-center gap-2"><span className="text-sm text-gray-500 w-24">Institution:</span><span>{data.clients.institution || '-'}</span></div>
                </dl>
              )}
            </SectionCard>

            <SectionCard title="Team" icon={<Users className="h-5 w-5" />}>
              {data.team && data.team.length > 0 ? (
                <div className="space-y-2">
                  {data.team.map((member) => (
                    <div key={member.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div><p className="font-medium">{member.staff_name}</p><p className="text-sm text-gray-500">{member.role}</p></div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500">No team members assigned</p>}
            </SectionCard>
          </div>
        )}

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
                        <span>{activity.performer_name}</span><span>•</span><span>{formatDistanceToNow(activity.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 text-center py-8">No timeline events yet</p>}
          </SectionCard>
        )}

        {activeTab === 'milestones' && (
          <SectionCard 
            title="Project Milestones" 
            icon={<Target className="h-5 w-5" />}
            actions={!isCompleted && (
              <Button size="sm" variant="secondary" onClick={() => setShowMilestoneModal(true)}>
                <Plus className="h-4 w-4 mr-2" />Add Milestone
              </Button>
            )}
          >
            {data.milestones && data.milestones.length > 0 ? (
              <div className="space-y-4">
                {data.milestones.map((milestone) => (
                  <div key={milestone.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <Badge variant={milestone.status === 'Completed' ? 'success' : milestone.status === 'In Progress' ? 'warning' : 'default'}>{milestone.status}</Badge>
                        </div>
                        {milestone.description && <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>}
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                          <span>Due: {formatDate(milestone.due_date)}</span>
                          {milestone.completed_date && <span>Completed: {formatDate(milestone.completed_date)}</span>}
                        </div>
                      </div>
                      {milestone.status !== 'Completed' && !isCompleted && (
                        <Button size="sm" variant="secondary" onClick={() => void handleCompleteMilestone(milestone.id)}>
                          <Check className="h-4 w-4 mr-1" />Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 text-center py-8">No milestones created yet</p>}
          </SectionCard>
        )}

        {activeTab === 'team' && (
          <SectionCard 
            title="Project Oversight Team" 
            icon={<Users className="h-5 w-5" />}
            actions={!isCompleted && (
              <Button size="sm" variant="secondary" onClick={() => setShowTeamModal(true)}>
                <Plus className="h-4 w-4 mr-2" />Assign
              </Button>
            )}
          >
            {data.team && data.team.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Staff Name</th>
                      <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Project Role</th>
                      <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase">Assigned Date</th>
                      <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.team.map((member) => (
                      <tr key={member.id} className="border-b last:border-0">
                        <td className="py-3 font-medium">{member.staff_name}</td>
                        <td className="py-3 pr-4 min-w-[210px]">
                          <Select
                            value={member.role}
                            onChange={(event) => void handleUpdateTeamRole(member.id, event.target.value)}
                            options={PROJECT_ROLE_OPTIONS.filter((option) => option.value)}
                            disabled={isSubmitting || isCompleted}
                          />
                        </td>
                        <td className="py-3 text-gray-500">{member.staff_email}</td>
                        <td className="py-3 text-gray-500">{formatDate(member.assigned_date)}</td>
                        <td className="py-3 text-right">
                          {!isCompleted && (
                            <Button size="sm" variant="ghost" onClick={() => void handleRemoveTeamMember(member.id)} disabled={isSubmitting}>Remove</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-gray-500 text-center py-8">No team members assigned</p>}
          </SectionCard>
        )}

        {activeTab === 'documents' && (
          <SectionCard title="Project Documents" icon={<FileText className="h-5 w-5" />}>
            <ProjectDocumentsTab
              projectId={id}
              documents={data.documents || []}
              isCompleted={isCompleted}
              onChanged={refetch}
            />
          </SectionCard>
        )}

        {activeTab === 'payments' && (
          <SectionCard title="Payment Information" icon={<CreditCard className="h-5 w-5" />}>
            <PaymentsTab projectId={id} isCompleted={isCompleted} />
          </SectionCard>
        )}

        {activeTab === 'qa' && (
          <SectionCard title="Quality Assurance Review" icon={<Shield className="h-5 w-5" />}>
            <QualityAssuranceTab projectId={id} isCompleted={isCompleted} />
          </SectionCard>
        )}

        {activeTab === 'deliverables' && <DeliverablesTab projectId={id} isCompleted={isCompleted} />}
        {activeTab === 'messages' && <StaffProjectMessages projectId={id} />}

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
                        <span>{activity.performer_name}</span><span>•</span><span>{formatDistanceToNow(activity.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 text-center py-8">No activity recorded</p>}
          </SectionCard>
        )}
      </div>

      <Modal
        isOpen={showProjectUpdateModal}
        onClose={() => {
          setShowProjectUpdateModal(false);
          setProjectUpdateError(null);
        }}
        title="Update Project"
      >
        <div className="space-y-4">
          {projectUpdateError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{projectUpdateError}</div>
          )}

          <Select
            label="Project Status"
            value={projectUpdateForm.status}
            onChange={(event) => setProjectUpdateForm((previous) => ({ ...previous, status: event.target.value }))}
            options={PROJECT_STATUSES.map((status) => ({ value: status, label: status }))}
            disabled={isSubmitting}
          />

          <Input
            label="Progress Percentage"
            type="number"
            min={0}
            max={100}
            step={1}
            value={projectUpdateForm.completionPercentage}
            onChange={(event) => setProjectUpdateForm((previous) => ({ ...previous, completionPercentage: Number(event.target.value) }))}
            disabled={isSubmitting}
          />

          <Input
            label="Target Deadline"
            type="date"
            value={projectUpdateForm.expectedDeliveryDate}
            onChange={(event) => setProjectUpdateForm((previous) => ({ ...previous, expectedDeliveryDate: event.target.value }))}
            disabled={isSubmitting}
          />

          <Textarea
            label="Internal Notes"
            value={projectUpdateForm.notes}
            onChange={(event) => setProjectUpdateForm((previous) => ({ ...previous, notes: event.target.value }))}
            placeholder="Add internal project notes..."
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setShowProjectUpdateModal(false); setProjectUpdateError(null); }} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={() => void handleUpdateProject()} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />{isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showMilestoneModal} onClose={() => setShowMilestoneModal(false)} title="Add Milestone">
        <div className="space-y-4">
          <Input label="Title" value={milestoneForm.title} onChange={(event) => setMilestoneForm((previous) => ({ ...previous, title: event.target.value }))} placeholder="Milestone title" />
          <Textarea label="Description" value={milestoneForm.description} onChange={(event) => setMilestoneForm((previous) => ({ ...previous, description: event.target.value }))} placeholder="Milestone description" rows={3} />
          <Input label="Due Date" type="date" value={milestoneForm.due_date} onChange={(event) => setMilestoneForm((previous) => ({ ...previous, due_date: event.target.value }))} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowMilestoneModal(false)}>Cancel</Button>
          <Button onClick={() => void handleAddMilestone()} disabled={isSubmitting || !milestoneForm.title || !milestoneForm.due_date}>Add Milestone</Button>
        </div>
      </Modal>

      <Modal
        isOpen={showTeamModal}
        onClose={() => { setShowTeamModal(false); setTeamError(null); }}
        title="Assign Team Member"
      >
        <div className="space-y-4">
          <p className="text-gray-500">Select a staff member and assign a role for this project.</p>
          {teamError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{teamError}</div>}
          <Select
            label="Staff Member"
            value={teamForm.staffId}
            onChange={(event) => setTeamForm((previous) => ({ ...previous, staffId: event.target.value }))}
            options={[
              { value: '', label: isLoadingStaff ? 'Loading staff members...' : 'Select staff member' },
              ...staffOptions.map((staff) => ({ value: staff.id, label: `${staff.full_name} — ${staff.email}` })),
            ]}
            disabled={isLoadingStaff || isSubmitting}
          />
          <Select
            label="Project Role"
            value={teamForm.role}
            onChange={(event) => setTeamForm((previous) => ({ ...previous, role: event.target.value }))}
            options={PROJECT_ROLE_OPTIONS}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => { setShowTeamModal(false); setTeamError(null); }} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={() => void handleAssignTeamMember()} disabled={isSubmitting || isLoadingStaff || !teamForm.staffId || !teamForm.role}>
            {isSubmitting ? 'Assigning...' : 'Assign'}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showCompleteModal} onClose={() => setShowCompleteModal(false)} title="Complete Project">
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to mark this project as completed? This action cannot be undone.</p>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800"><strong>Note:</strong> Once completed, the project will become read-only.</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>Cancel</Button>
          <Button onClick={() => void handleCompleteProject()} disabled={isSubmitting}>
            <Check className="h-4 w-4 mr-2" />Confirm Completion
          </Button>
        </div>
      </Modal>
    </div>
  );
}
