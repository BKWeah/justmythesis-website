'use client';

import {
  Clock3,
  Download,
  FileText,
} from 'lucide-react';

import { Badge, Button, Card } from '@/components/ui';

interface Deliverable {
  id: number;
  title: string;
  version: string;
  releasedOn?: string;
  releasedBy?: string;
  status: 'Released' | 'Pending';
}

const deliverables: Deliverable[] = [
  {
    id: 1,
    title: 'Research Proposal.pdf',
    version: 'v2.1',
    releasedOn: '20 Jul 2026',
    releasedBy: 'Research Team',
    status: 'Released',
  },
  {
    id: 2,
    title: 'Literature Review.docx',
    version: 'v1.0',
    status: 'Pending',
  },
];

export function ProjectDeliverables() {
  return (
    <Card variant="bordered" padding="lg">
      <div className="flex items-center gap-3">
        <FileText
          className="h-5 w-5 text-brand-green"
          aria-hidden="true"
        />

        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Deliverables
          </h2>

          <p className="text-sm text-muted-foreground">
            Files released for this project.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {deliverables.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-gray-200 p-5"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Version: {item.version}
                </p>

                {item.status === 'Released' ? (
                  <>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Released: {item.releasedOn}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Released By: {item.releasedBy}
                    </p>
                  </>
                ) : (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 className="h-4 w-4" />
                    Waiting for release
                  </div>
                )}
              </div>

              <div className="flex flex-col items-start gap-3 md:items-end">
                <Badge>
                  {item.status}
                </Badge>

                {item.status === 'Released' && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                  >
                    <Download
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    Download
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}