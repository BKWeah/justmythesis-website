import type { SupabaseClient } from '@supabase/supabase-js';

export async function setFinalDeliverable(
  supabase: SupabaseClient,
  deliverableId: string,
  projectId: string,
  updatedBy: string
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

  // Remove Final flag from all deliverables
  await supabase
    .from('deliverables')
    .update({
      is_final: false,
    })
    .eq('project_id', projectId);

  // Set selected deliverable as Final
  const { data, error } = await supabase
    .from('deliverables')
    .update({
      is_final: true,
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
    action: 'deliverable_marked_final',
    description: `Deliverable Version ${deliverable.version_number} marked as Final Version.`,
    project_id: projectId,
    entity_type: 'deliverables',
    entity_id: deliverableId,
    performed_by: updatedBy,
  });

  return data;
}