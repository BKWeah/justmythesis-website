import type { SupabaseClient } from '@supabase/supabase-js';

export async function deleteDeliverable(
  supabase: SupabaseClient,
  deliverableId: string,
  projectId: string,
  deletedBy: string
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

  if (deliverable.delivered_at) {
    throw new Error('Released deliverables cannot be deleted.');
  }

  const publicMarker = '/storage/v1/object/public/deliverables/';
  const url = new URL(deliverable.file_url);
  const filePath = decodeURIComponent(
    url.pathname.split(publicMarker)[1] || ''
  );

  const { error: deleteError } = await supabase
    .from('deliverables')
    .delete()
    .eq('id', deliverableId)
    .eq('project_id', projectId);

  if (deleteError) {
    throw deleteError;
  }

  if (filePath) {
    await supabase.storage
      .from('deliverables')
      .remove([filePath]);
  }

  await supabase.from('activity_logs').insert({
    category: 'Project',
    action: 'deliverable_deleted',
    description: `Deliverable Version ${deliverable.version_number} deleted.`,
    project_id: projectId,
    entity_type: 'deliverables',
    entity_id: deliverableId,
    performed_by: deletedBy,
  });

  return { success: true };
}