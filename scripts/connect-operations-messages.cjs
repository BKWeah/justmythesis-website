const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'src', 'app', 'workspace', 'projects', '[id]', 'page.tsx');
let source = fs.readFileSync(file, 'utf8');

function replaceOnce(search, replacement, label) {
  if (!source.includes(search)) {
    if (source.includes(replacement)) return;
    throw new Error(`Patch failed: ${label} pattern not found.`);
  }
  source = source.replace(search, replacement);
}

replaceOnce(
  "import PaymentsTab from '@/components/projects/PaymentsTab';",
  "import PaymentsTab from '@/components/projects/PaymentsTab';\nimport StaffProjectMessages from '@/components/projects/StaffProjectMessages';",
  'messages component import'
);

replaceOnce(
  "  Activity,\n  Plus,",
  "  Activity,\n  MessageSquareText,\n  Plus,",
  'message icon import'
);

replaceOnce(
  "const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'milestones' | 'team' | 'documents' | 'payments' | 'qa' | 'deliverables' | 'activity'>('overview');",
  "const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'milestones' | 'team' | 'documents' | 'payments' | 'qa' | 'deliverables' | 'messages' | 'activity'>('overview');",
  'active tab type'
);

replaceOnce(
  "            { id: 'deliverables', label: 'Deliverables', icon: <Package className=\"h-4 w-4\" /> },\n            { id: 'activity', label: 'Activity Log', icon: <Activity className=\"h-4 w-4\" /> },",
  "            { id: 'deliverables', label: 'Deliverables', icon: <Package className=\"h-4 w-4\" /> },\n            { id: 'messages', label: 'Messages', icon: <MessageSquareText className=\"h-4 w-4\" /> },\n            { id: 'activity', label: 'Activity Log', icon: <Activity className=\"h-4 w-4\" /> },",
  'messages navigation tab'
);

replaceOnce(
  "        {/* Activity Tab */}\n        {activeTab === 'activity' && (",
  "        {/* Messages Tab */}\n        {activeTab === 'messages' && (\n          <StaffProjectMessages projectId={id} />\n        )}\n\n        {/* Activity Tab */}\n        {activeTab === 'activity' && (",
  'messages tab content'
);

fs.writeFileSync(file, source, 'utf8');
console.log('Operations Messages tab connected successfully.');
