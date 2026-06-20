export type UserRole = 'super_admin' | 'admin' | 'dispatcher' | 'driver' | 'client' | 'partner' | 'pilot';
export type UserStatus = 'active' | 'inactive';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  companyId?: string; // Associated company
  createdAt: Date | any;
  updatedAt: Date | any;
}


export type VehicleType = 'motorcycle' | 'car' | 'pickup';
export type DriverStatus = 'offline' | 'idle' | 'busy';

export interface DriverProfile {
  uid: string;
  vehicleType: VehicleType;
  licensePlate: string;
  status: DriverStatus;
  currentLocation?: {
    latitude: number;
    longitude: number;
    geohash?: string;
    updatedAt: Date | any;
  };
  walletBalance: number;
  payoutBalance: number;
  rating: number;
  activeOrderId: string | null;
}

export type ClientType = 'hotel' | 'airbnb' | 'restaurant' | 'individual';
export type PricingTier = 'standard' | 'premium_partner';

export interface ClientProfile {
  uid: string;
  companyName: string;
  clientType: ClientType;
  nit: string;
  address: string;
  billingEmail: string;
  pricingTier: PricingTier;
  createdAt: Date | any;
}

export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'assigned'
  | 'picking_up'
  | 'arrived_origin'
  | 'in_transit'
  | 'arrived_destination'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cash_on_delivery' | 'prepaid_corporate' | 'card_on_delivery';

export interface LocationCoordinates {
  address: string;
  latitude: number;
  longitude: number;
}

export interface CargoDetails {
  description: string;
  weightKg?: number;
  requiresRefrigeration?: boolean;
}

export interface PaymentDetails {
  method: PaymentMethod;
  codAmount: number; // Amount to collect at destination (GTQ)
  deliveryPrice: number; // Cost of courier service (GTQ)
  driverCommission: number; // Commission paid to driver (GTQ)
  currency: 'GTQ' | 'USD';
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: Date | any;
  userId: string;
}

export interface ProofOfDelivery {
  signatureUrl?: string;
  photoUrl?: string;
  recipientName: string;
  timestamp: Date | any;
}

export interface Order {
  orderId: string;
  clientId: string;
  driverId: string | null;
  status: OrderStatus;
  origin: LocationCoordinates;
  destination: LocationCoordinates;
  cargo: CargoDetails;
  payment: PaymentDetails;
  timeline: OrderTimelineEvent[];
  trackingTrace?: { latitude: number; longitude: number; timestamp: Date | any }[];
  proofOfDelivery?: ProofOfDelivery;
  createdAt: Date | any;
  completedAt?: Date | any | null;
}

export type TransactionType =
  | 'delivery_earning'
  | 'cash_collected'
  | 'company_payout'
  | 'cash_settlement';

export type TransactionStatus = 'pending' | 'completed';

export interface LedgerTransaction {
  transactionId: string;
  driverId: string;
  orderId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  referenceNotes?: string;
  performedBy: string;
  timestamp: Date | any;
}

export interface Company {
  companyId: string;
  name: string;
  nit: string;
  address: string;
  billingEmail: string;
  pricingTier: 'standard' | 'premium_partner';
  createdAt: string;
}

