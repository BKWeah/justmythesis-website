import type { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

import { getAuthenticatedClient } from '@/lib/services/client-auth';

interface ProjectRecord {
  id: string;
  project_reference: string;
}

interface MessageRecord {
  id: string;
  project_id: string;
  sender_type: string;
  sender_staff_id: string | null;
  sender_client_id: string | null;
  message: string;
  read_by_client_at: string | null;
  read_by_staff_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientProjectMessage {
  id: string;
  projectId: string;
  senderType: 'client' | 'staff';
  senderName: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const MESSAGE_FIELDS = `
  id,
  project_id,
  sender_type,
  sender_staff_id,
  sender_client_id,
  message,
  read_by_client_at,
  read_by_staff_at,
  created_at,
  updated_at
`;

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

async function getOwnedProject(
  admin: SupabaseClient,
  clientId: string,
  identifier: string
): Promise<ProjectRecord> {
  const baseQuery = admin
    .from('projects')
    .select('id, project_reference')
    .eq('client_id', clientId)
    .is('archived_at', null);

  const { data, error } = isUuid(identifier)
    ? await baseQuery.eq('id', identifier).maybeSingle()
    : await baseQuery
        .eq('project_reference', identifier)
        .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Project not found.');
  }

  return data as ProjectRecord;
}

function mapMessage(
  record: MessageRecord
): ClientProjectMessage {
  const senderType: 'client' | 'staff' =
    record.sender_type === 'client' ? 'client' : 'staff';

  return {
    id: record.id,
    projectId: record.project_id,
    senderType,
    senderName:
      senderType === 'client'
        ? 'You'
        : 'JUSTmyTHESIS Team',
    message: record.message,
    isRead:
      senderType === 'client'
        ? record.read_by_staff_at !== null
        : record.read_by_client_at !== null,
    createdAt: record.created_at,
  };
}

export async function getClientProjectMessages(
  request: NextRequest,
  identifier: string
) {
  const { admin, client } =
    await getAuthenticatedClient(request);

  const project = await getOwnedProject(
    admin,
    client.id,
    identifier
  );

  const { data, error } = await admin
    .from('project_messages')
    .select(MESSAGE_FIELDS)
    .eq('project_id', project.id)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return {
    projectId: project.id,
    messages: ((data ?? []) as MessageRecord[]).map(
      mapMessage
    ),
  };
}

export async function sendClientProjectMessage(
  request: NextRequest,
  identifier: string,
  message: string
): Promise<ClientProjectMessage> {
  const normalizedMessage = message.trim();

  if (!normalizedMessage) {
    throw new Error('Message is required.');
  }

  if (normalizedMessage.length > 5000) {
    throw new Error(
      'Message must not exceed 5000 characters.'
    );
  }

  const { admin, client } =
    await getAuthenticatedClient(request);

  const project = await getOwnedProject(
    admin,
    client.id,
    identifier
  );

  const now = new Date().toISOString();

  const { data, error } = await admin
    .from('project_messages')
    .insert({
      project_id: project.id,
      sender_type: 'client',
      sender_staff_id: null,
      sender_client_id: client.id,
      message: normalizedMessage,
      read_by_client_at: now,
    })
    .select(MESSAGE_FIELDS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapMessage(data as MessageRecord);
}

export async function markClientProjectMessagesRead(
  request: NextRequest,
  identifier: string
) {
  const { admin, client } =
    await getAuthenticatedClient(request);

  const project = await getOwnedProject(
    admin,
    client.id,
    identifier
  );

  const now = new Date().toISOString();

  const { error } = await admin
    .from('project_messages')
    .update({
      read_by_client_at: now,
      updated_at: now,
    })
    .eq('project_id', project.id)
    .eq('sender_type', 'staff')
    .is('read_by_client_at', null);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}