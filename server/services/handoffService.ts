interface HandoffRequest {
  conversationId: string;
  userMessage: string;
  reason: string;
}

interface HandoffResponse {
  success: boolean;
  ticketId?: string;
  message: string;
}

export class HandoffService {
  private handoffHistory: Set<string> = new Set(); // Track conversations that already have tickets

  async requestHumanSupport(request: HandoffRequest): Promise<HandoffResponse> {
    // Prevent multiple tickets for the same conversation
    if (this.handoffHistory.has(request.conversationId)) {
      return {
        success: false,
        message: "A support ticket has already been created for this conversation. Is there anything else I can help you with while you wait?"
      };
    }
    // In a real implementation, this would integrate with a ticketing system
    // For now, we'll simulate the handoff process
    
    const ticketId = `TKT-${Date.now().toString().slice(-6)}`;
    
    console.log(`Human handoff requested for conversation ${request.conversationId}`);
    console.log(`Reason: ${request.reason}`);
    console.log(`Generated ticket: ${ticketId}`);
    
    // Track this conversation to prevent duplicate tickets
    this.handoffHistory.add(request.conversationId);
    
    return {
      success: true,
      ticketId,
      message: `I've created support ticket ${ticketId} for you. One of our technical specialists will reach out within 2 hours during business hours (8 AM - 9 PM EST). You can reference this ticket number if you need to follow up. Is there anything else I can help you with in the meantime?`
    };
  }

  detectHandoffTriggers(message: string, conversationHistory: string[]): boolean {
    const lowerMessage = message.toLowerCase();
    
    // Only trigger handoff for EXPLICIT requests for human help
    const explicitRequests = [
      'talk to human', 'speak to person', 'human representative', 
      'customer service', 'real person', 'live agent', 'transfer me',
      'i want to talk to someone', 'connect me to', 'human support',
      'talk to person', 'i want to talk to an agent'
    ];
    
    // Only trigger for warranty/return issues (not general troubleshooting)
    const warrantyIssues = [
      'warranty claim', 'return policy', 'refund request', 'defective part'
    ];
    
    return explicitRequests.some(request => lowerMessage.includes(request)) ||
           warrantyIssues.some(issue => lowerMessage.includes(issue));
  }
}

export const handoffService = new HandoffService();