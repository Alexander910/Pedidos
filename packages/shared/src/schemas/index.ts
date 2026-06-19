import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'dispatcher', 'driver', 'client']);
export const UserStatusSchema = z.enum(['active', 'inactive']);
export const VehicleTypeSchema = z.enum(['motorcycle', 'car', 'pickup']);
export const DriverStatusSchema = z.enum(['offline', 'idle', 'busy']);
export const ClientTypeSchema = z.enum(['hotel', 'airbnb', 'restaurant', 'individual']);
export const PricingTierSchema = z.enum(['standard', 'premium_partner']);
export const OrderStatusSchema = z.enum([
  'draft',
  'pending',
  'assigned',
  'picking_up',
  'arrived_origin',
  'in_transit',
  'arrived_destination',
  'delivered',
  'cancelled',
]);
export const PaymentMethodSchema = z.enum(['cash_on_delivery', 'prepaid_corporate', 'card_on_delivery']);

export const LocationCoordinatesSchema = z.object({
  address: z.string().min(5, 'Dirección debe tener al menos 5 caracteres'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const CargoDetailsSchema = z.object({
  description: z.string().min(3, 'Descripción de carga es requerida'),
  weightKg: z.number().optional(),
  requiresRefrigeration: z.boolean().optional().default(false),
});

export const CreateOrderSchema = z.object({
  origin: LocationCoordinatesSchema,
  destination: LocationCoordinatesSchema,
  cargo: CargoDetailsSchema,
  paymentMethod: PaymentMethodSchema,
  codAmount: z.number().min(0).default(0),
  currency: z.enum(['GTQ', 'USD']).default('GTQ'),
});

export const DriverProfileSchema = z.object({
  vehicleType: VehicleTypeSchema,
  licensePlate: z.string().min(5, 'Placa inválida (mínimo 5 caracteres)'),
});

export const ClientProfileSchema = z.object({
  companyName: z.string().min(2, 'Nombre de la empresa es requerido'),
  clientType: ClientTypeSchema,
  nit: z.string().min(5, 'NIT inválido'),
  address: z.string().min(5, 'Dirección fiscal requerida'),
  billingEmail: z.string().email('Email de facturación inválido'),
});
