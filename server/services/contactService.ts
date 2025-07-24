/**
 * Contact Service - Provides PartSelect contact information for customer support
 */

export interface ContactInfo {
  phone: string;
  hours: string;
  email?: string;
  website: string;
  chatSupport?: boolean;
}

export class ContactService {
  
  /**
   * Get PartSelect contact information
   */
  static getPartSelectContact(): ContactInfo {
    return {
      phone: '1-866-319-8402',
      hours: 'Monday to Saturday, 8am - 9pm EST',
      website: 'https://www.partselect.com',
      chatSupport: true
    };
  }

  /**
   * Format contact information for chat responses
   */
  static formatContactForChat(): string {
    const contact = this.getPartSelectContact();
    
    return `For direct assistance with orders, technical support, or specific compatibility questions, you can contact PartSelect directly:

📞 **${contact.phone}**
${contact.hours}

🌐 **${contact.website}**
Live chat available on their website

Their support team can help with:
• Order status and shipping
• Technical installation guidance  
• Specific model compatibility verification
• Warranty and return questions
• Complex troubleshooting beyond our scope`;
  }

  /**
   * Determine when to show contact information
   */
  static shouldShowContact(userMessage: string, aiResponse: string): boolean {
    const contactTriggers = [
      // Order-related requests
      'order', 'shipping', 'delivery', 'track', 'cancel', 'return', 'refund', 'warranty',
      
      // Complex technical issues
      'not working', 'still broken', 'doesnt work', "doesn't work", 'failed', 'error',
      'complex', 'complicated', 'difficult', 'help me install',
      
      // Specific support requests
      'speak to someone', 'call', 'phone', 'human', 'representative', 'agent',
      'escalate', 'supervisor', 'manager',
      
      // Compatibility verification
      'verify compatibility', 'double check', 'make sure', 'confirm fit',
      'specific model', 'exact model'
    ];
    
    const messageText = userMessage.toLowerCase();
    const responseText = aiResponse.toLowerCase();
    
    // Check if user is requesting human support
    const userWantsSupport = contactTriggers.some(trigger => 
      messageText.includes(trigger.toLowerCase())
    );
    
    // Check if AI response indicates limitations
    const aiIndicatesLimitation = [
      'contact partselect', 'check with partselect', 'partselect support',
      'verify with partselect', 'complex installation', 'technical support'
    ].some(phrase => responseText.includes(phrase.toLowerCase()));
    
    return userWantsSupport || aiIndicatesLimitation;
  }

  /**
   * Generate contextual contact message based on the situation
   */
  static getContextualContact(context: 'order' | 'technical' | 'compatibility' | 'general' = 'general'): string {
    const contact = this.getPartSelectContact();
    
    const contextualMessages = {
      order: `For order questions, shipping updates, or returns, contact PartSelect directly at **${contact.phone}** (${contact.hours}).`,
      
      technical: `For detailed installation guidance or complex troubleshooting, PartSelect's technical support team at **${contact.phone}** can provide step-by-step assistance.`,
      
      compatibility: `To verify exact model compatibility, PartSelect's experts at **${contact.phone}** can confirm the perfect fit for your specific appliance model.`,
      
      general: `For additional support, contact PartSelect at **${contact.phone}** (${contact.hours}) or visit ${contact.website}.`
    };
    
    return contextualMessages[context];
  }
}