import { NextRequest, NextResponse } from 'next/server';

import { getClientDashboard } from '@/lib/services/client-dashboard';

export async function GET(request: NextRequest) {
  try {
    const dashboard = await getClientDashboard(request);

    return NextResponse.json(dashboard);
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