export interface OrderStatus {
  orderId: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: {
    partNumber: string;
    name: string;
    quantity: number;
    price: string;
  }[];
  trackingNumber?: string;
  estimatedDelivery?: string;
  orderDate: string;
}

export class OrderService {
  private mockOrders: Map<string, OrderStatus> = new Map([
    ['123456', {
      orderId: '123456',
      status: 'shipped',
      items: [
        {
          partNumber: 'PS11756692',
          name: 'Dishwasher Pump and Motor Assembly',
          quantity: 1,
          price: '$165.99'
        }
      ],
      trackingNumber: '1Z999AA1234567890',
      estimatedDelivery: 'Tomorrow',
      orderDate: '2025-01-20'
    }],
    ['789012', {
      orderId: '789012',
      status: 'processing',
      items: [
        {
          partNumber: 'PS2061451',
          name: 'Refrigerator Ice Maker Assembly',
          quantity: 1,
          price: '$124.99'
        },
        {
          partNumber: 'PS2179605',
          name: 'Refrigerator Water Filter',
          quantity: 2,
          price: '$49.99'
        }
      ],
      estimatedDelivery: '3-5 business days',
      orderDate: '2025-01-21'
    }],
    ['987654', {
      orderId: '987654',
      status: 'delivered',
      items: [
        {
          partNumber: 'PS11756692',
          name: 'Dishwasher Pump & Motor Assembly',
          quantity: 1,
          price: '$165.99'
        }
      ],
      trackingNumber: '1Z999AA5555666777',
      estimatedDelivery: 'Delivered January 20, 2025',
      orderDate: '2025-01-15'
    }],
    ['111222', {
      orderId: '111222',
      status: 'cancelled',
      items: [
        {
          partNumber: 'PS733947',
          name: 'Ice Maker Motor Kit',
          quantity: 1,
          price: '$78.50'
        }
      ],
      estimatedDelivery: 'Order cancelled',
      orderDate: '2025-01-18'
    }],
    ['345678', {
      orderId: '345678',
      status: 'delivered',
      items: [
        {
          partNumber: 'PS11739132',
          name: 'Dishwasher Door Seal',
          quantity: 1,
          price: '$65.25'
        }
      ],
      trackingNumber: '1Z999AA1234567891',
      estimatedDelivery: 'Delivered',
      orderDate: '2025-01-15'
    }]
  ]);

  getOrderStatus(orderId: string): OrderStatus | null {
    const order = this.mockOrders.get(orderId);
    return order || null;
  }

  generateRandomOrderId(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  createMockOrder(partNumbers: string[]): OrderStatus {
    const orderId = this.generateRandomOrderId();
    const mockItems = partNumbers.map(partNumber => ({
      partNumber,
      name: `Part ${partNumber}`,
      quantity: 1,
      price: '$99.99'
    }));

    const order: OrderStatus = {
      orderId,
      status: 'processing',
      items: mockItems,
      estimatedDelivery: '3-5 business days',
      orderDate: new Date().toISOString().split('T')[0]
    };

    this.mockOrders.set(orderId, order);
    return order;
  }
}

export const orderService = new OrderService();
