export type PlatformAccountRole =
  | 'buyer'
  | 'seller'
  | 'cooperative-approved'
  | 'cooperative-pending';

export type E2eAccountRole = PlatformAccountRole | 'admin';

export interface E2eAccountFixture {
  role: PlatformAccountRole;
  emailEnv: string;
  passwordEnv: string;
  storageFile: string;
  profileRole: 'buyer' | 'seller' | 'cooperative' | 'admin';
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected';
}

export const E2E_ACCOUNT_FIXTURES: E2eAccountFixture[] = [
  {
    role: 'buyer',
    emailEnv: 'E2E_BUYER_EMAIL',
    passwordEnv: 'E2E_BUYER_PASSWORD',
    storageFile: 'buyer.json',
    profileRole: 'buyer',
    kycStatus: 'approved',
  },
  {
    role: 'seller',
    emailEnv: 'E2E_SELLER_EMAIL',
    passwordEnv: 'E2E_SELLER_PASSWORD',
    storageFile: 'seller.json',
    profileRole: 'seller',
    kycStatus: 'approved',
  },
  {
    role: 'cooperative-approved',
    emailEnv: 'E2E_COOP_APPROVED_EMAIL',
    passwordEnv: 'E2E_COOP_APPROVED_PASSWORD',
    storageFile: 'cooperative-approved.json',
    profileRole: 'cooperative',
    kycStatus: 'approved',
  },
  {
    role: 'cooperative-pending',
    emailEnv: 'E2E_COOP_PENDING_EMAIL',
    passwordEnv: 'E2E_COOP_PENDING_PASSWORD',
    storageFile: 'cooperative-pending.json',
    profileRole: 'cooperative',
    kycStatus: 'pending',
  },
];

export const E2E_ADMIN_FIXTURE = {
  role: 'admin' as const,
  emailEnv: 'E2E_ADMIN_EMAIL',
  passwordEnv: 'E2E_ADMIN_PASSWORD',
  storageFile: 'admin.json',
};

export const PLATFORM_ROLES: PlatformAccountRole[] = [
  'buyer',
  'seller',
  'cooperative-approved',
  'cooperative-pending',
];

export function getFixtureByRole(role: PlatformAccountRole): E2eAccountFixture | undefined {
  return E2E_ACCOUNT_FIXTURES.find((fixture) => fixture.role === role);
}
