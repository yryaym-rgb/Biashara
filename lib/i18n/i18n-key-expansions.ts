import { DRC_MINING_HUBS } from '@/lib/constants/drc-map';
import { MINING_EVENT_CATEGORIES } from '@/lib/constants/mining-events';
import { WAITLIST_COUNTRY_CODES } from '@/lib/validators/waitlist';
import { RESOURCE_ARTICLE_SLUGS } from '@/lib/resources/articles';
import { CUSTODY_STAGE_ORDER } from '@/lib/platform/custody-stages';
import { EXPORT_READINESS_ITEM_KEYS } from '@/lib/constants/export-readiness';
import { REGISTER_STEPS } from '@/lib/auth/register-step';
import type { AdminLiveActivityKind } from '@/lib/admin/dashboard-activity.logic';
import type { AdminAlertType } from '@/lib/admin/alerts.logic';
import type { VolumeGranularity } from '@/lib/admin/reports.logic';
import type { AdminDashboardKpiKey } from '@/lib/admin/dashboard-kpis';
import type { DashboardStatKey } from '@/lib/platform/dashboard';

const VOLUME_GRANULARITIES: VolumeGranularity[] = ['daily', 'weekly'];

const ADMIN_DASHBOARD_KPI_KEYS: AdminDashboardKpiKey[] = [
  'users',
  'activeListings',
  'pendingKyc',
  'purchaseRequests',
];

const ADMIN_NAV_GROUP_KEYS = [
  'pilotage',
  'utilisateurs',
  'marche',
  'intelligence',
  'securite',
] as const;

const ADMIN_KYC_FUNNEL_KEYS = ['pending', 'needsReview', 'verified', 'rejected'] as const;

const ADMIN_LIVE_ACTIVITY_EVENT_KINDS: AdminLiveActivityKind[] = [
  'account_verified',
  'kyc_submitted',
  'listing_published',
  'listing_submitted',
  'rfp_created',
  'offer_accepted',
  'order_disputed',
];

const ADMIN_ALERT_TYPES: AdminAlertType[] = [
  'aging_listing',
  'aging_kyc',
  'unresolved_dispute',
  'high_dispute_rate_user',
];

const ADMIN_EXPORT_TYPES = ['users', 'listings', 'orders', 'audit-log'] as const;

const LISTINGS_MODERATION_TABS = ['pending_review', 'active', 'rejected'] as const;

const KYC_REVIEW_TABS = ['pending', 'approved', 'rejected'] as const;

const AUDIT_LOG_ENTITIES = ['listings', 'orders', 'profiles', 'kyc_documents'] as const;
const AUDIT_LOG_ACTIONS = ['insert', 'update', 'delete'] as const;

const PLATFORM_DASHBOARD_STAT_KEYS: DashboardStatKey[] = [
  'activeListings',
  'pendingOffersReceived',
  'ordersInProgress',
  'monthlyRevenue',
  'pendingOffersSent',
  'activePurchaseRequests',
  'lots',
  'offers',
  'openPurchaseRequests',
];

const PLATFORM_NAV_SECTIONS = ['main', 'supplyChain', 'company'] as const;

const DASHBOARD_GREETING_PERIODS = ['morning', 'afternoon', 'evening'] as const;

const RFP_STATUSES = ['open', 'awarded', 'cancelled'] as const;
const RFP_BID_STATUSES = ['pending', 'selected', 'rejected'] as const;

const CREDIBILITY_PROBLEM_KEYS = ['opacity', 'access', 'trust'] as const;
const CREDIBILITY_ITEM_KEYS = ['traceability', 'pricing', 'marketplace', 'compliance'] as const;
const HOW_IT_WORKS_STEPS = ['discover', 'negotiate', 'settle'] as const;
const TRUST_CHECK_KEYS = ['kyc', 'contracts', 'audit'] as const;
const LOGISTICS_STATUS_KEYS = ['tracking', 'documents', 'delivery'] as const;
const MARKET_DATA_HIGHLIGHT_KEYS = ['live', 'history', 'alerts'] as const;
const SOLUTION_AUDIENCES = ['buyers', 'sellers', 'cooperatives', 'institutions'] as const;
const SOLUTION_CAPABILITY_KEYS = ['marketplace', 'pricing', 'compliance', 'logistics'] as const;
const AFRICAN_NETWORK_ERROR_KEYS = ['invalidEmail', 'rateLimited', 'unknown'] as const;
const DASHBOARD_TRUST_SIGNAL_KEYS = ['kyc', 'listings', 'orders', 'responseTime'] as const;
const ACTION_CENTER_ALERT_KEYS = [
  'pendingOffers',
  'disputedOrders',
  'rejectedKyc',
  'rejectedListings',
] as const;

/** Namespace-agnostic template expansions (same keys in every namespace). */
export const TEMPLATE_KEY_EXPANSIONS: Record<string, readonly string[]> = {
  'hubs.': DRC_MINING_HUBS.map((hub) => `hubs.${hub.id}`),
  'categories.': MINING_EVENT_CATEGORIES.map((category) => `categories.${category}`),
  'granularity.': VOLUME_GRANULARITIES.map((granularity) => `granularity.${granularity}`),
  'timeframes.': ['1W', '1M', '3M', '1Y', 'ALL'].map((timeframe) => `timeframes.${timeframe}`),
  'steps.': REGISTER_STEPS.map((step) => `steps.${step}`),
  'countries.': WAITLIST_COUNTRY_CODES.map((code) => `countries.${code}`),
  'articles.': RESOURCE_ARTICLE_SLUGS.flatMap((slug) => [
    `articles.${slug}.title`,
    `articles.${slug}.excerpt`,
  ]),
  'stages.': CUSTODY_STAGE_ORDER.map((stage) => `stages.${stage}`),
  'roles.': ['cooperative', 'seller', 'buyer', 'institution'].map((role) => `roles.${role}`),
  'systems.': ['api', 'database', 'auth', 'storage'].map((system) => `systems.${system}`),
  'funnel.': ADMIN_KYC_FUNNEL_KEYS.map((key) => `funnel.${key}`),
  'events.': ADMIN_LIVE_ACTIVITY_EVENT_KINDS.map((event) => `events.${event}`),
  'entities.': AUDIT_LOG_ENTITIES.map((entity) => `entities.${entity}`),
  'actions.': AUDIT_LOG_ACTIONS.map((action) => `actions.${action}`),
  'status.': RFP_STATUSES.map((status) => `status.${status}`),
  'bidStatus.': RFP_BID_STATUSES.map((status) => `bidStatus.${status}`),
  'greeting.': DASHBOARD_GREETING_PERIODS.map((period) => `greeting.${period}`),
  'problems.': CREDIBILITY_PROBLEM_KEYS.flatMap((problemKey) => [
    `problems.${problemKey}.number`,
    `problems.${problemKey}.tag`,
    `problems.${problemKey}.statement`,
  ]),
  'checks.': TRUST_CHECK_KEYS.map((checkKey) => `checks.${checkKey}`),
  'statuses.': LOGISTICS_STATUS_KEYS.map((statusKey) => `statuses.${statusKey}`),
  'highlights.': MARKET_DATA_HIGHLIGHT_KEYS.flatMap((key) => [
    `highlights.${key}.title`,
    `highlights.${key}.description`,
  ]),
  'audiences.': SOLUTION_AUDIENCES.flatMap((audienceKey) => [
    `audiences.${audienceKey}.title`,
    `audiences.${audienceKey}.forWhom`,
    ...SOLUTION_CAPABILITY_KEYS.map((capKey) => `audiences.${audienceKey}.${capKey}.label`),
  ]),
  'errors.': AFRICAN_NETWORK_ERROR_KEYS.map((errorKey) => `errors.${errorKey}`),
  'signals.': DASHBOARD_TRUST_SIGNAL_KEYS.flatMap((signalKey) => [
    `signals.${signalKey}.label`,
    `signals.${signalKey}.yes`,
    `signals.${signalKey}.no`,
    `signals.${signalKey}.value`,
  ]),
};

/** Namespace-specific template expansions for ambiguous prefixes like `stats.`. */
export const NAMESPACE_TEMPLATE_EXPANSIONS: Record<string, Record<string, readonly string[]>> = {
  'admin.dashboard': {
    'stats.': ADMIN_DASHBOARD_KPI_KEYS.map((key) => `stats.${key}`),
  },
  'admin.nav': {
    'groups.': ADMIN_NAV_GROUP_KEYS.map((group) => `groups.${group}`),
  },
  'admin.reports.exports': {
    'csv.': ADMIN_EXPORT_TYPES.map((type) => `csv.${type}`),
  },
  'admin.reports.alerts': {
    'items.': ADMIN_ALERT_TYPES.map((type) => `items.${type}`),
  },
  'admin.listingsModeration': {
    'tabs.': LISTINGS_MODERATION_TABS.map((tab) => `tabs.${tab}`),
    'empty.pending_review.': ['title', 'description'].map((part) => `empty.pending_review.${part}`),
    'empty.active.': ['title', 'description'].map((part) => `empty.active.${part}`),
    'empty.rejected.': ['title', 'description'].map((part) => `empty.rejected.${part}`),
  },
  'admin.kycReview': {
    'tabs.': KYC_REVIEW_TABS.map((tab) => `tabs.${tab}`),
    'empty.pending.': ['title', 'description'].map((part) => `empty.pending.${part}`),
    'empty.approved.': ['title', 'description'].map((part) => `empty.approved.${part}`),
    'empty.rejected.': ['title', 'description'].map((part) => `empty.rejected.${part}`),
  },
  'platform.dashboard': {
    'stats.': PLATFORM_DASHBOARD_STAT_KEYS.map((key) => `stats.${key}`),
    'stats.zero.': PLATFORM_DASHBOARD_STAT_KEYS.map((key) => `stats.zero.${key}`),
  },
  'platform.dashboard.actionCenter': {
    'summary.': ACTION_CENTER_ALERT_KEYS.map((key) => `summary.${key}`),
  },
  'platform.nav': {
    'sections.': PLATFORM_NAV_SECTIONS.map((section) => `sections.${section}`),
  },
  'platform.settings.exportReadiness': {
    'items.': EXPORT_READINESS_ITEM_KEYS.flatMap((itemKey) => [
      `items.${itemKey}.title`,
      `items.${itemKey}.description`,
    ]),
  },
  'marketing.landing.credibility': {
    'items.': CREDIBILITY_ITEM_KEYS.flatMap((itemKey) => [
      `items.${itemKey}.title`,
      `items.${itemKey}.description`,
    ]),
  },
  'marketing.landing.howItWorks': {
    'steps.': HOW_IT_WORKS_STEPS.flatMap((stepKey) => [
      `steps.${stepKey}.title`,
      `steps.${stepKey}.description`,
    ]),
  },
  'marketing.solutions': {
    'panels.': SOLUTION_AUDIENCES.flatMap((audienceKey) => [`panels.${audienceKey}.cta`]),
  },
};
