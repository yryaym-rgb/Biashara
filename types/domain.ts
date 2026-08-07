/**
 * Domain types derived from Zod schemas — single source of truth.
 * Do not duplicate these as separate interfaces elsewhere.
 */

export type {
  ProfileUpdateInput,
  RegisterInput,
  UserRole,
} from '@/lib/validators/profile';

export type {
  KycDocumentType,
  KycUploadInput,
  KycReviewInput,
} from '@/lib/validators/kyc';

export type {
  ListingCreateInput,
  ListingUpdateInput,
} from '@/lib/validators/listing';

export type {
  OfferCreateInput,
  OfferCounterInput,
  AcceptOfferInput,
} from '@/lib/validators/offer';

export type { OrderStatusUpdateInput } from '@/lib/validators/order';

export type {
  ContractSignInput,
  ContractUploadInput,
} from '@/lib/validators/contract';

export type {
  ShipmentCreateInput,
  ShipmentCheckpointInput,
} from '@/lib/validators/shipment';

export type {
  MessageCreateInput,
  ConversationCreateInput,
} from '@/lib/validators/message';

export type { PaginationInput } from '@/lib/validators/common';

export type { MineralId, QuantityUnit } from '@/lib/constants/minerals';

export type { Profile } from '@/lib/auth/session';

export type { Tables, Enums } from '@/types/database.types';
