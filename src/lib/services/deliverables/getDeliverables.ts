import type { SupabaseClient } from '@supabase/supabase-js';

export async function getDeliverables(
  supabase: SupabaseClient,
  projectId: string
) {
  const { data: deliverables, error } = await supabase
    .from('deliverables')
    .select(`
      id,
      project_id,
      file_name,
      storage_path,
      file_type,
      file_size_bytes,
      delivery_notes,
      version_number,
      is_final,
      delivered_at,
      client_confirmed,
      client_confirmed_at,
      uploaded_by,
      released_by,
      created_at
    `)
    .eq('project_id', projectId)
    .order('version_number', { ascending: false });

  if (error) {
    throw error;
  }

  const staffIds = [
    ...new Set(
      (deliverables || [])
        .flatMap((item) => [
          item.uploaded_by,
          item.released_by,
        ])
        .filter(Boolean)
    ),
  ] as string[];

  let staffNames: Record<string, string> = {};

  if (staffIds.length > 0) {
    const { data: staffRows, error: staffError } = await supabase
      .from('staff_users')
      .select('id, full_name')
      .in('id', staffIds);

    if (staffError) {
      throw staffError;
    }

    staffNames = Object.fromEntries(
      (staffRows || []).map((staff) => [
        staff.id,
        staff.full_name,
      ])
    );
  }

  return (deliverables || []).map((item) => ({
    ...item,
    uploaded_by_name:
      item.uploaded_by
        ? staffNames[item.uploaded_by] || 'System'
        : 'System',

    released_by_name: item.released_by
      ? staffNames[item.released_by] || 'Staff'
      : null,

    status: item.client_confirmed
      ? 'Confirmed'
      : item.delivered_at
        ? 'Released'
        : 'Draft',
  }));
}