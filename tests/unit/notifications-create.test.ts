import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAdminFrom = vi.fn();
const mockCreateAdminClient = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockCreateAdminClient(),
}));

function createInsertChain(result: { data?: unknown; error?: unknown | null }) {
  const chain = {
    insert: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
  };
  chain.insert.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.single.mockResolvedValue(result);
  return chain;
}

describe('createNotification insert', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  });

  it('inserts a notification via the admin client', async () => {
    const insertChain = createInsertChain({ data: { id: 'notif-1' }, error: null });
    mockAdminFrom.mockReturnValue(insertChain);
    mockCreateAdminClient.mockReturnValue({ from: mockAdminFrom });

    const { createNotification } = await import('@/lib/notifications/create');
    const result = await createNotification(
      '00000000-0000-0000-0000-000000000099',
      'offer',
      {
        action: 'received',
        offerId: '00000000-0000-0000-0000-000000000030',
        listingTitle: 'Cobalt lot',
      },
    );

    expect(result).toEqual({ id: 'notif-1' });
    expect(insertChain.insert).toHaveBeenCalledWith({
      user_id: '00000000-0000-0000-0000-000000000099',
      type: 'offer',
      payload: {
        action: 'received',
        offerId: '00000000-0000-0000-0000-000000000030',
        listingTitle: 'Cobalt lot',
      },
    });
  });
});
