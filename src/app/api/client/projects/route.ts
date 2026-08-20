import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedClient } from '@/lib/services/client-auth';

export async function GET(request: NextRequest) {
  try {
    const { admin, client } = await getAuthenticatedClient(request);

    const { data: projects, error } = await admin
      .from('projects')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      client,
      projects: projects ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unexpected server error.',
      },
      {
        status:
          error instanceof Error &&
          (error.message === 'Unauthorized.' ||
            error.message === 'Client profile not found.')
            ? 401
            : 500,
      }
    );
  }
}