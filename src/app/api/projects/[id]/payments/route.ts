import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const PAYMENT_METHODS = [
  'Bank Transfer',
  'Mobile Money',
  'PayPal',
  'Western Union',
  'Cash',
  'Other',
] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number];

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Database service role not configured');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function authenticateStaff() {
  const authClient = await createServerClient();

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();

  if (userError || !user) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
      adminClient: null,
      staff: null,
    };
  }

  const adminClient = createAdminClient();

  const { data: staff, error: staffError } = await adminClient
    .from('staff_users')
    .select('id, full_name, email, role')
    .eq('auth_uid', user.id)
    .single();

  if (staffError || !staff) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      ),
      adminClient: null,
      staff: null,
    };
  }

  return {
    errorResponse: null,
    adminClient,
    staff,
  };
}

function generateReferenceNumber() {
  const year = new Date().getFullYear();
  const random = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase();

  return `PAY-${year}-${random}`;
}

async function getProject(
  adminClient: ReturnType<typeof createAdminClient>,
  projectId: string
) {
  const { data: project, error } = await adminClient
    .from('projects')
    .select(
      'id, project_reference, client_id, support_request_id'
    )
    .eq('id', projectId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return project;
}

function getErrorMessage(
  error: unknown,
  fallbackMessage: string
) {
  return error instanceof Error
    ? error.message
    : fallbackMessage;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authentication = await authenticateStaff();

    if (
      authentication.errorResponse ||
      !authentication.adminClient ||
      !authentication.staff
    ) {
      return authentication.errorResponse!;
    }

    const adminClient = authentication.adminClient;
    const projectId = params.id;

    const project = await getProject(
      adminClient,
      projectId
    );

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const { data: payments, error } = await adminClient
      .from('payments')
      .select(`
        id,
        client_id,
        support_request_id,
        project_id,
        amount,
        currency,
        payment_method,
        payment_date,
        reference_number,
        transaction_id,
        proof_url,
        status,
        verified_by,
        verified_at,
        rejection_reason,
        notes,
        created_by,
        created_at,
        updated_at
      `)
      .eq('project_id', projectId)
      .order('payment_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const staffIds = [
      ...new Set(
        (payments || [])
          .flatMap((payment) => [
            payment.created_by,
            payment.verified_by,
          ])
          .filter(
            (staffId): staffId is string =>
              typeof staffId === 'string' &&
              staffId.length > 0
          )
      ),
    ];

    let staffNames: Record<string, string> = {};

    if (staffIds.length > 0) {
      const {
        data: staffRows,
        error: staffRowsError,
      } = await adminClient
        .from('staff_users')
        .select('id, full_name')
        .in('id', staffIds);

      if (staffRowsError) {
        throw staffRowsError;
      }

      staffNames = Object.fromEntries(
        (staffRows || []).map((staffMember) => [
          staffMember.id,
          staffMember.full_name,
        ])
      );
    }

    const formattedPayments = (payments || []).map(
      (payment) => ({
        ...payment,
        created_by_name: payment.created_by
          ? staffNames[payment.created_by] || 'System'
          : 'System',
        verified_by_name: payment.verified_by
          ? staffNames[payment.verified_by] || 'Staff'
          : null,
      })
    );

    const summary = formattedPayments.reduce(
      (totals, payment) => {
        const amount = Number(payment.amount || 0);

        totals.recorded += amount;

        if (payment.status === 'Verified') {
          totals.verified += amount;
        }

        if (payment.status === 'Pending') {
          totals.pending += amount;
        }

        if (payment.status === 'Rejected') {
          totals.rejected += amount;
        }

        return totals;
      },
      {
        recorded: 0,
        verified: 0,
        pending: 0,
        rejected: 0,
      }
    );

    return NextResponse.json({
      payments: formattedPayments,
      summary,
    });
  } catch (error: unknown) {
    console.error('Payments GET API error:', error);

    return NextResponse.json(
      {
        error: getErrorMessage(
          error,
          'Failed to fetch payments'
        ),
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authentication = await authenticateStaff();

    if (
      authentication.errorResponse ||
      !authentication.adminClient ||
      !authentication.staff
    ) {
      return authentication.errorResponse!;
    }

    const adminClient = authentication.adminClient;
    const staff = authentication.staff;
    const projectId = params.id;
    const body = await request.json();

    const amount = Number(body?.amount);
    const currency = String(
      body?.currency || 'USD'
    )
      .trim()
      .toUpperCase();

    const paymentMethod =
      body?.payment_method as PaymentMethod;

    const paymentDate = body?.payment_date;

    const referenceNumber =
      String(body?.reference_number || '').trim() ||
      generateReferenceNumber();

    const transactionId =
      String(body?.transaction_id || '').trim() ||
      null;

    const proofUrl =
      String(body?.proof_url || '').trim() || null;

    const notes =
      String(body?.notes || '').trim() || null;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          error:
            'Payment amount must be greater than zero',
        },
        { status: 400 }
      );
    }

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Select a valid payment method' },
        { status: 400 }
      );
    }

    if (!paymentDate) {
      return NextResponse.json(
        { error: 'Payment date is required' },
        { status: 400 }
      );
    }

    const project = await getProject(
      adminClient,
      projectId
    );

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const {
      data: existingReference,
      error: referenceError,
    } = await adminClient
      .from('payments')
      .select('id')
      .eq('reference_number', referenceNumber)
      .maybeSingle();

    if (referenceError) {
      throw referenceError;
    }

    if (existingReference) {
      return NextResponse.json(
        {
          error:
            'That payment reference number already exists',
        },
        { status: 409 }
      );
    }

    const { data: payment, error } =
      await adminClient
        .from('payments')
        .insert({
          client_id: project.client_id,
          support_request_id:
            project.support_request_id || null,
          project_id: projectId,
          amount,
          currency,
          payment_method: paymentMethod,
          payment_date: paymentDate,
          reference_number: referenceNumber,
          transaction_id: transactionId,
          proof_url: proofUrl,
          status: 'Pending',
          notes,
          created_by: staff.id,
        })
        .select('*')
        .single();

    if (error) {
      throw error;
    }

    const { error: activityError } =
      await adminClient
        .from('activity_logs')
        .insert({
          category: 'Payment',
          action: 'payment_recorded',
          description:
            `${currency} ${amount.toFixed(2)} ` +
            'payment recorded as Pending',
          client_id: project.client_id,
          support_request_id:
            project.support_request_id || null,
          project_id: projectId,
          entity_type: 'payments',
          entity_id: payment.id,
          performed_by: staff.id,
          metadata: {
            amount,
            currency,
            payment_method: paymentMethod,
            reference_number: referenceNumber,
          },
        });

    if (activityError) {
      console.error(
        'Payment activity log failed:',
        activityError
      );
    }

    return NextResponse.json(
      {
        success: true,
        payment,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Payments POST API error:', error);

    return NextResponse.json(
      {
        error: getErrorMessage(
          error,
          'Failed to record payment'
        ),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authentication = await authenticateStaff();

    if (
      authentication.errorResponse ||
      !authentication.adminClient ||
      !authentication.staff
    ) {
      return authentication.errorResponse!;
    }

    const adminClient = authentication.adminClient;
    const staff = authentication.staff;
    const projectId = params.id;
    const body = await request.json();

    const paymentId = body?.paymentId;
    const action = body?.action;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const project = await getProject(
      adminClient,
      projectId
    );

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const {
      data: existingPayment,
      error: lookupError,
    } = await adminClient
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('project_id', projectId)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (action === 'verify') {
      const { data: payment, error } =
        await adminClient
          .from('payments')
          .update({
            status: 'Verified',
            verified_by: staff.id,
            verified_at: new Date().toISOString(),
            rejection_reason: null,
          })
          .eq('id', paymentId)
          .eq('project_id', projectId)
          .select('*')
          .single();

      if (error) {
        throw error;
      }

      const { error: activityError } =
        await adminClient
          .from('activity_logs')
          .insert({
            category: 'Payment',
            action: 'payment_verified',
            description:
              `${payment.currency} ` +
              `${Number(payment.amount).toFixed(2)} ` +
              'payment verified',
            client_id: project.client_id,
            support_request_id:
              project.support_request_id || null,
            project_id: projectId,
            entity_type: 'payments',
            entity_id: paymentId,
            performed_by: staff.id,
          });

      if (activityError) {
        console.error(
          'Payment verification activity log failed:',
          activityError
        );
      }

      return NextResponse.json({
        success: true,
        payment,
      });
    }

    if (action === 'reject') {
      const rejectionReason = String(
        body?.rejection_reason || ''
      ).trim();

      if (!rejectionReason) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        );
      }

      const { data: payment, error } =
        await adminClient
          .from('payments')
          .update({
            status: 'Rejected',
            verified_by: null,
            verified_at: null,
            rejection_reason: rejectionReason,
          })
          .eq('id', paymentId)
          .eq('project_id', projectId)
          .select('*')
          .single();

      if (error) {
        throw error;
      }

      const { error: activityError } =
        await adminClient
          .from('activity_logs')
          .insert({
            category: 'Payment',
            action: 'payment_rejected',
            description:
              `${payment.currency} ` +
              `${Number(payment.amount).toFixed(2)} ` +
              'payment rejected',
            client_id: project.client_id,
            support_request_id:
              project.support_request_id || null,
            project_id: projectId,
            entity_type: 'payments',
            entity_id: paymentId,
            performed_by: staff.id,
            metadata: {
              rejection_reason: rejectionReason,
            },
          });

      if (activityError) {
        console.error(
          'Payment rejection activity log failed:',
          activityError
        );
      }

      return NextResponse.json({
        success: true,
        payment,
      });
    }

    if (action === 'update') {
      if (existingPayment.status !== 'Pending') {
        return NextResponse.json(
          {
            error:
              'Only pending payments can be edited',
          },
          { status: 400 }
        );
      }

      const amount =
        body?.amount === undefined
          ? Number(existingPayment.amount)
          : Number(body.amount);

      const paymentMethod =
        (body?.payment_method ||
          existingPayment.payment_method) as PaymentMethod;

      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json(
          {
            error:
              'Payment amount must be greater than zero',
          },
          { status: 400 }
        );
      }

      if (!PAYMENT_METHODS.includes(paymentMethod)) {
        return NextResponse.json(
          { error: 'Select a valid payment method' },
          { status: 400 }
        );
      }

      const { data: payment, error } =
        await adminClient
          .from('payments')
          .update({
            amount,
            currency: String(
              body?.currency ||
                existingPayment.currency ||
                'USD'
            )
              .trim()
              .toUpperCase(),
            payment_method: paymentMethod,
            payment_date:
              body?.payment_date ||
              existingPayment.payment_date,
            transaction_id:
              body?.transaction_id === undefined
                ? existingPayment.transaction_id
                : String(
                    body.transaction_id || ''
                  ).trim() || null,
            proof_url:
              body?.proof_url === undefined
                ? existingPayment.proof_url
                : String(body.proof_url || '').trim() ||
                  null,
            notes:
              body?.notes === undefined
                ? existingPayment.notes
                : String(body.notes || '').trim() ||
                  null,
          })
          .eq('id', paymentId)
          .eq('project_id', projectId)
          .select('*')
          .single();

      if (error) {
        throw error;
      }

      const { error: activityError } =
        await adminClient
          .from('activity_logs')
          .insert({
            category: 'Payment',
            action: 'payment_updated',
            description:
              `Pending payment ` +
              `${payment.reference_number} updated`,
            client_id: project.client_id,
            support_request_id:
              project.support_request_id || null,
            project_id: projectId,
            entity_type: 'payments',
            entity_id: paymentId,
            performed_by: staff.id,
          });

      if (activityError) {
        console.error(
          'Payment update activity log failed:',
          activityError
        );
      }

      return NextResponse.json({
        success: true,
        payment,
      });
    }

    return NextResponse.json(
      { error: 'Invalid payment action' },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error('Payments PATCH API error:', error);

    return NextResponse.json(
      {
        error: getErrorMessage(
          error,
          'Failed to update payment'
        ),
      },
      { status: 500 }
    );
  }
}