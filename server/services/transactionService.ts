export interface Transaction {
  transactionId: string;
  customerId: string;
  orderNumber: string;
  items: {
    partNumber: string;
    name: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }[];
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  paymentMethod: string;
  billingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIssue {
  transactionId: string;
  issueType: 'payment_failed' | 'card_declined' | 'insufficient_funds' | 'expired_card' | 'address_mismatch';
  description: string;
  resolutionSteps: string[];
}

export interface RefundRequest {
  transactionId: string;
  orderNumber: string;
  reason: string;
  amount: string;
  status: 'pending' | 'approved' | 'processed' | 'denied';
  requestedAt: string;
}

export class TransactionService {
  private mockTransactions: Map<string, Transaction> = new Map([
    ['TXN123456', {
      transactionId: 'TXN123456',
      customerId: 'CUST001',
      orderNumber: '123456',
      items: [
        {
          partNumber: 'PS11756692',
          name: 'Dishwasher Pump and Motor Assembly',
          quantity: 1,
          unitPrice: '$165.99',
          totalPrice: '$165.99'
        }
      ],
      subtotal: '$165.99',
      tax: '$13.28',
      shipping: '$0.00',
      total: '$179.27',
      paymentMethod: 'Visa ending in 4532',
      billingAddress: {
        name: 'John Smith',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701'
      },
      shippingAddress: {
        name: 'John Smith',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701'
      },
      status: 'shipped',
      createdAt: '2025-01-20T10:30:00Z',
      updatedAt: '2025-01-21T14:45:00Z'
    }]
  ]);

  private paymentIssues: Map<string, PaymentIssue> = new Map([
    ['TXN789012', {
      transactionId: 'TXN789012',
      issueType: 'card_declined',
      description: 'Your credit card was declined during checkout.',
      resolutionSteps: [
        'Verify your card information is correct',
        'Check with your bank for any holds or restrictions',
        'Try using a different payment method',
        'Contact customer service at 1-800-PARTSELECT for assistance'
      ]
    }]
  ]);

  private refundRequests: Map<string, RefundRequest> = new Map([
    ['REF123456', {
      transactionId: 'TXN123456',
      orderNumber: '123456',
      reason: 'Part did not fit my dishwasher model',
      amount: '$179.27',
      status: 'approved',
      requestedAt: '2025-01-22T09:15:00Z'
    }]
  ]);

  getTransaction(transactionId: string): Transaction | null {
    return this.mockTransactions.get(transactionId) || null;
  }

  getTransactionByOrderNumber(orderNumber: string): Transaction | null {
    for (const [_, transaction] of this.mockTransactions) {
      if (transaction.orderNumber === orderNumber) {
        return transaction;
      }
    }
    return null;
  }

  getPaymentIssue(transactionId: string): PaymentIssue | null {
    return this.paymentIssues.get(transactionId) || null;
  }

  createRefundRequest(transactionId: string, reason: string): RefundRequest {
    const transaction = this.getTransaction(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const refundId = `REF${Date.now()}`;
    const refund: RefundRequest = {
      transactionId,
      orderNumber: transaction.orderNumber,
      reason,
      amount: transaction.total,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    this.refundRequests.set(refundId, refund);
    return refund;
  }

  getRefundStatus(orderNumber: string): RefundRequest | null {
    for (const [_, refund] of this.refundRequests) {
      if (refund.orderNumber === orderNumber) {
        return refund;
      }
    }
    return null;
  }

  updatePaymentMethod(transactionId: string, newPaymentMethod: string): boolean {
    const transaction = this.mockTransactions.get(transactionId);
    if (transaction && transaction.status === 'pending') {
      transaction.paymentMethod = newPaymentMethod;
      transaction.status = 'processing';
      transaction.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  retryPayment(transactionId: string): { success: boolean; message: string } {
    const transaction = this.mockTransactions.get(transactionId);
    if (!transaction) {
      return { success: false, message: 'Transaction not found' };
    }

    if (transaction.status !== 'pending') {
      return { success: false, message: 'Transaction cannot be retried in current status' };
    }

    // Simulate payment retry
    transaction.status = 'processing';
    transaction.updatedAt = new Date().toISOString();
    
    return { 
      success: true, 
      message: 'Payment retry initiated. You will receive a confirmation email shortly.' 
    };
  }

  cancelOrder(orderNumber: string, reason: string): { success: boolean; message: string } {
    const transaction = this.getTransactionByOrderNumber(orderNumber);
    if (!transaction) {
      return { success: false, message: 'Order not found' };
    }

    if (transaction.status === 'shipped' || transaction.status === 'delivered') {
      return { 
        success: false, 
        message: 'Order cannot be cancelled as it has already shipped. Please request a return instead.' 
      };
    }

    transaction.status = 'cancelled';
    transaction.updatedAt = new Date().toISOString();
    
    return { 
      success: true, 
      message: `Order ${orderNumber} has been cancelled. Any charges will be refunded within 3-5 business days.` 
    };
  }

  initiateReturn(orderNumber: string, partNumbers: string[], reason: string): { success: boolean; message: string; returnLabel?: string } {
    const transaction = this.getTransactionByOrderNumber(orderNumber);
    if (!transaction) {
      return { success: false, message: 'Order not found' };
    }

    if (transaction.status !== 'delivered') {
      return { 
        success: false, 
        message: 'Returns can only be initiated for delivered orders' 
      };
    }

    // Generate mock return label
    const returnLabel = `RTN${Date.now()}`;
    
    return { 
      success: true, 
      message: `Return initiated for order ${orderNumber}. Print your prepaid return label and include it with the package.`,
      returnLabel
    };
  }
}

export const transactionService = new TransactionService();