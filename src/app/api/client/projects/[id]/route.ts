import { NextRequest, NextResponse } from 'next/server';

import { getClientProjectDetail } from '@/lib/services/client-projects';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = decodeURIComponent(params.id);
    const project = await getClientProjectDetail(
      request,
      identifier
    );

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unexpected server error.';

    const status =
      message === 'Unauthorized.' ||
      message === 'Client profile not found.'
        ? 401
        : 500;

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}