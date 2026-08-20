'use client';

import { Clock3, CheckCircle2 } from 'lucide-react';

import { Card } from '@/components/ui';

interface TimelineEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  completed: boolean;
}

const timeline: TimelineEvent[] = [
  {
    id: 1,
    title: 'Project Created',
    description:
      'Your project has been successfully created and assigned.',
    date: '12 Jul 2026',
    completed: true,
  },
  {
    id: 2,
    title: 'Research Started',
    description:
      'Our academic team has begun working on your project.',
    date: '13 Jul 2026',
    completed: true,
  },
  {
    id: 3,
    title: 'Internal Review',
    description:
      'The project is currently undergoing internal quality review.',
    date: 'Today',
    completed: false,
  },
];

export function ProjectTimeline() {
  return (
    <Card variant="bordered" padding="lg">
      <h2 className="text-xl font-semibold">
        Project Timeline
      </h2>

      <div className="mt-8 space-y-6">
        {timeline.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-4"
          >
            <div className="mt-1">
              {item.completed ? (
                <CheckCircle2 className="h-6 w-6 text-brand-green" />
              ) : (
                <Clock3 className="h-6 w-6 text-amber-500" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                {item.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}