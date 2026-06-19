import { OrderStatus } from '@envios-ya/shared';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['pending', 'cancelled'],
  pending: ['assigned', 'cancelled'],
  assigned: ['picking_up', 'cancelled'],
  picking_up: ['arrived_origin', 'cancelled'],
  arrived_origin: ['in_transit', 'cancelled'],
  in_transit: ['arrived_destination', 'cancelled'],
  arrived_destination: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

/**
 * Validates whether a state change from currentStatus to newStatus is allowed by business rules.
 */
export function isValidTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  if (currentStatus === newStatus) return true;
  const allowed = VALID_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(newStatus) : false;
}

/**
 * Returns helper context instructions for each order state to display to the driver.
 */
export function getDriverInstructionsForState(status: OrderStatus): string {
  switch (status) {
    case 'assigned':
      return 'Dirígete al punto de origen para recolectar el paquete.';
    case 'picking_up':
      return 'En ruta hacia el origen. Presiona "Llegué" al llegar.';
    case 'arrived_origin':
      return 'Carga el paquete. Solicita firma de salida o toma una foto del paquete antes de iniciar.';
    case 'in_transit':
      return 'Lleva el paquete al punto de entrega. Conduce con cuidado.';
    case 'arrived_destination':
      return 'Entrega el paquete. Recolecta la firma del receptor y toma una foto de entrega.';
    case 'delivered':
      return 'Viaje finalizado con éxito.';
    case 'cancelled':
      return 'El viaje fue cancelado. Por favor retorna a base si es necesario.';
    default:
      return 'Sin instrucciones específicas para este estado.';
  }
}
