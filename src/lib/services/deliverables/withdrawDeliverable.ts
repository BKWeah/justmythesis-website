import type { SupabaseClient } from '@supabase/supabase-js';

export async function withdrawDeliverable(
  supabase: SupabaseClient,
  deliverableId: string,
  projectId: string,
  withdrawnBy: string
) {
  const { data: deliverable, error: lookupError } = await supabase
    .from('deliverables')
    .select('*')
    .eq('id', deliverableId)
    .eq('project_id', projectId)
    .single();

  if (lookupError || !deliverable) {
    throw new Error('Deliverable not found.');
  }

  if (!deliverable.delivered_at) {
    throw new Error('Deliverable has not been released.');
  }

  if (deliverable.client_confirmed) {
    throw new Error('A client-confirmed deliverable cannot be withdrawn.');
  }

  const { data, error } = await supabase
    .from('deliverables')
    .update({
      delivered_at: null,
      released_by: null,
    })
    .eq('id', deliverableId)
    .eq('project_id', projectId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await supabase.from('activity_logs').insert({
    category: 'Project',
    action: 'deliverable_withdrawn',
    description: `Withdrew Deliverable Version ${deliverable.version_number} from client access.`,
    project_id: projectId,
    entity_type: 'deliverables',
    entity_id: deliverableId,
    performed_by: withdrawnBy,
  });

  return data;
}