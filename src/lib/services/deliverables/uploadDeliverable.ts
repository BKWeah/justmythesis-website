import type { SupabaseClient } from '@supabase/supabase-js';
import { getFileType } from '@/lib/utils/file-types';

interface UploadDeliverableData {
  projectId: string;
  uploadedBy: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string;
  description?: string;
  isFinal?: boolean;
}

export async function uploadDeliverable(
  supabase: SupabaseClient,
  data: UploadDeliverableData
) {
  const {
    projectId,
    uploadedBy,
    fileName,
    fileType,
    fileSize,
    fileData,
    description,
    isFinal,
  } = data;

  const { count } = await supabase
    .from('deliverables')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('project_id', projectId);

  const version = (count || 0) + 1;

  const shortFileType = getFileType(fileType);

  const buffer = Buffer.from(fileData, 'base64');

  const storagePath = `${projectId}/v${version}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('deliverables')
    .upload(storagePath, buffer, {
      contentType: fileType,
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: deliverable, error } = await supabase
    .from('deliverables')
    .insert({
      project_id: projectId,
      version_number: version,
      file_name: fileName,
      file_type: shortFileType,
      file_size_bytes: fileSize,
      storage_path: storagePath,
      file_url: null,
      delivery_notes: description,
      is_final: isFinal ?? false,
      uploaded_by: uploadedBy,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (isFinal) {
    await supabase
      .from('deliverables')
      .update({
        is_final: false,
      })
      .eq('project_id', projectId)
      .neq('id', deliverable.id);
  }

  await supabase.from('activity_logs').insert({
    category: 'Project',
    action: 'deliverable_uploaded',
    description: `Uploaded Version ${version}${isFinal ? ' (Final)' : ''}`,
    project_id: projectId,
    entity_type: 'deliverables',
    entity_id: deliverable.id,
    performed_by: uploadedBy,
  });

  return deliverable;
}