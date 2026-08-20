import type {
  SupabaseClient,
} from '@supabase/supabase-js';

interface DeliverableRecord {
  id: string;
  project_id: string;
  version_number: number;
  is_final: boolean | null;
  delivered_at: string | null;
}

interface QAReviewStatus {
  status:
    | 'Pending'
    | 'Passed'
    | 'Needs Correction';
  is_passed: boolean | null;
  review_round: number;
}

export async function releaseDeliverable(
  supabase: SupabaseClient,
  deliverableId: string,
  projectId: string,
  releasedBy: string
) {
  const {
    data: deliverableData,
    error: lookupError,
  } = await supabase
    .from('deliverables')
    .select(`
      id,
      project_id,
      version_number,
      is_final,
      delivered_at
    `)
    .eq('id', deliverableId)
    .eq('project_id', projectId)
    .maybeSingle();

  if (lookupError) {
    console.error(
      'Deliverable lookup failed:',
      lookupError
    );

    throw new Error(
      'Unable to verify the deliverable.'
    );
  }

  if (!deliverableData) {
    throw new Error(
      'Deliverable not found.'
    );
  }

  const deliverable =
    deliverableData as DeliverableRecord;

  if (deliverable.delivered_at) {
    throw new Error(
      'Deliverable has already been released.'
    );
  }

  if (deliverable.is_final) {
    const {
      data: qaReviewData,
      error: qaReviewError,
    } = await supabase
      .from('qa_reviews')
      .select(`
        status,
        is_passed,
        review_round
      `)
      .eq('project_id', projectId)
      .order('review_round', {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (qaReviewError) {
      console.error(
        'Final deliverable QA verification failed:',
        qaReviewError
      );

      throw new Error(
        'Unable to verify the project QA review.'
      );
    }

    if (!qaReviewData) {
      throw new Error(
        'A QA review must be completed before the final deliverable can be released.'
      );
    }

    const qaReview =
      qaReviewData as QAReviewStatus;

    if (
      qaReview.status !== 'Passed' ||
      qaReview.is_passed !== true
    ) {
      throw new Error(
        'The final deliverable cannot be released until the QA review has passed.'
      );
    }
  }

  const releasedAt =
    new Date().toISOString();

  const {
    data: releasedDeliverable,
    error: releaseError,
  } = await supabase
    .from('deliverables')
    .update({
      delivered_at: releasedAt,
      released_by: releasedBy,
    })
    .eq('id', deliverableId)
    .eq('project_id', projectId)
    .is('delivered_at', null)
    .select()
    .single();

  if (releaseError) {
    console.error(
      'Deliverable release failed:',
      releaseError
    );

    throw new Error(
      'Unable to release the deliverable.'
    );
  }

  const {
    error: activityError,
  } = await supabase
    .from('activity_logs')
    .insert({
      category: 'Project',
      action: 'deliverable_released',
      description:
        `Released Deliverable Version ${deliverable.version_number} to client.`,
      project_id: projectId,
      entity_type: 'deliverables',
      entity_id: deliverableId,
      performed_by: releasedBy,
    });

  if (activityError) {
    console.error(
      'Deliverable release activity log failed:',
      activityError
    );
  }

  return releasedDeliverable;
}