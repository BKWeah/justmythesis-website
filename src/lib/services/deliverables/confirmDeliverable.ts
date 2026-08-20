import type { SupabaseClient } from '@supabase/supabase-js';

export async function confirmDeliverable(
  supabase: SupabaseClient,
  deliverableId: string,
  projectId: string,
  confirmedBy: string
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
    throw new Error('Deliverable must be released before confirmation.');
  }

  if (deliverable.client_confirmed) {
    throw new Error('Deliverable has already been confirmed.');
  }

  const { data, error } = await supabase
    .from('deliverables')
    .update({
      client_confirmed: true,
      client_confirmed_at: new Date().toISOString(),
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
    action: 'deliverable_confirmed',
    description: `Deliverable Version ${deliverable.version_number} confirmed by client.`,
    project_id: projectId,
    entity_type: 'deliverables',
    entity_id: deliverableId,
    performed_by: confirmedBy,
  });

  return data;
}