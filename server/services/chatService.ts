/**
 * Chat Service - Core conversation processing engine
 * Orchestrates AI responses, data gathering, and specialized services
 */
import { ChatRequest, ChatResponse, ProductCard } from '@shared/schema';

import { PartDataService } from './partDataService';
import { compatibilityChecker } from './compatibilityChecker';
import { troubleshootingService } from './troubleshootingService';
import { orderService } from './orderService';
import { deepseekClient } from './deepseekClient';
import { partMatcher } from './partMatcher';
import { handoffService } from './handoffService';
import { installationGuide } from './installationGuide';
import { storage } from '../storage';
import { transactionService } from './transactionService';
import { BuyLinkService } from './buyLinkService';
import { ContactService } from './contactService';


export class ChatService {
  /**
   * Process incoming chat message and generate AI response
   * Handles conversation persistence, context gathering, and response generation
   */
  async processMessage(request: ChatRequest): Promise<ChatResponse> {
    const { message, conversationId } = request;

    // Initialize conversation if needed
    let conversation = await storage.getConversation(conversationId);
    if (!conversation) {
      conversation = await storage.createConversation({ id: conversationId });
    }

    // Persist user message to database
    await storage.createMessage({
      conversationId,
      role: 'user',
      content: message,
    });

    // Retrieve recent conversation history for context
    const messages = await storage.getMessages(conversationId);
    const conversationHistory = messages.slice(-10).map(msg => msg.content);
    
    // Extract part numbers from recent conversation if not in current message
    const recentPartNumbers: string[] = [];
    if (conversationHistory.length > 0) {
      const recentText = conversationHistory.join(' ');
      const recentParts = recentText.match(/PS\d{8,}/gi) || [];
      recentPartNumbers.push(...recentParts);
    }

    // Gather context from multiple data sources
    const context = await this.gatherContext(message);
    
    // Enhance with real-time PartSelect.com data
    await this.enhanceContextWithRealData(context, message);
    
    // Check for installation guide requests
    const installationRequest = this.detectInstallationRequest(message);
    if (installationRequest) {
      const guide = installationGuide.getInstallationGuide(installationRequest.partNumber);
      if (guide) {
        context.installationGuide = guide;
      }
    }
    
    // Priority handling for transaction/order inquiries
    if (context.orderInquiry || context.transactionIssue || context.refundRequest) {
      // Transaction support is the primary function
      let finalResponse = '';
      let productCards: ProductCard[] = [];
      
      if (context.orderInquiry) {
        if (context.orderId) {
        const orderStatus = orderService.getOrderStatus(context.orderId);
        const transaction = transactionService.getTransactionByOrderNumber(context.orderId);
        
        if (orderStatus) {
          finalResponse = `Order ${context.orderId} Status: ${orderStatus.status.toUpperCase()}\n\n`;
          finalResponse += `Order Date: ${orderStatus.orderDate}\n`;
          finalResponse += `Items: ${orderStatus.items.map(item => `${item.name} (${item.quantity}x)`).join(', ')}\n`;
          if (orderStatus.trackingNumber) {
            finalResponse += `Tracking Number: ${orderStatus.trackingNumber}\n`;
          }
          finalResponse += `Estimated Delivery: ${orderStatus.estimatedDelivery}\n`;
          
          if (transaction) {
            finalResponse += `Total: ${transaction.total}\n`;
            finalResponse += `Payment Method: ${transaction.paymentMethod}\n`;
          }
          
          if (orderStatus.status === 'shipped') {
            finalResponse += `\nYour order is on its way! You can track your package using the tracking number above.`;
          } else if (orderStatus.status === 'processing') {
            finalResponse += `\nYour order is being prepared for shipment. You'll receive tracking information once it ships.`;
          } else if (orderStatus.status === 'delivered') {
            finalResponse += `\nYour order has been delivered. If you need installation help or have any issues with your parts, I'm here to assist.`;
          }
        } else {
          finalResponse = `I couldn't find an order with number ${context.orderId}. Please double-check your order number and try again. Order numbers are typically 6 digits long.\n\nIf you need help finding your order number, check your email confirmation or PartSelect account.`;
        }
        } else {
          // No order ID provided - ask for it
          finalResponse = `I can help you check your order status. Could you please provide your order number? It's typically a 6-digit number found in your confirmation email or PartSelect account.`;
        }
      } else if (context.transactionIssue) {
        const transactionId = this.extractTransactionId(message);
        if (transactionId) {
          const paymentIssue = transactionService.getPaymentIssue(transactionId);
          if (paymentIssue) {
            finalResponse = `Payment Issue Detected\n\n`;
            finalResponse += `Issue: ${paymentIssue.description}\n\n`;
            finalResponse += `Resolution Steps:\n`;
            paymentIssue.resolutionSteps.forEach((step, index) => {
              finalResponse += `${index + 1}. ${step}\n`;
            });
          } else {
            finalResponse = `I can help you with payment issues. Please provide your transaction ID or order number so I can look up the specific problem and guide you through the resolution.`;
          }
        } else {
          finalResponse = `I can help you with payment issues. Please provide your transaction ID or order number so I can look up the specific problem and guide you through the resolution.`;
        }
      } else if (context.refundRequest) {
        const orderNumber = context.orderId;
        if (orderNumber) {
          const refundStatus = transactionService.getRefundStatus(orderNumber);
          if (refundStatus) {
            finalResponse = `Refund Status for Order ${orderNumber}\n\n`;
            finalResponse += `Status: ${refundStatus.status.toUpperCase()}\n`;
            finalResponse += `Amount: ${refundStatus.amount}\n`;
            finalResponse += `Reason: ${refundStatus.reason}`;
          } else {
            finalResponse = `I can help you initiate a refund. Please provide the reason for the return and I'll start the process for you.`;
          }
        } else {
          finalResponse = `I can help you with refunds and returns. Please provide your order number so I can look up your purchase and assist you with the return process.`;
        }
      }
      
      const response: ChatResponse = {
        text: finalResponse,
        conversationId,
        productCards,
      };
      
      await storage.createMessage({
        conversationId,
        role: 'assistant',
        content: finalResponse,
        productCards,
      });
      
      return response;
    }

    // Check for human handoff request BEFORE AI processing
    if (handoffService.detectHandoffTriggers(message, conversationHistory)) {
      const handoffResult = await handoffService.requestHumanSupport({
        conversationId,
        userMessage: message,
        reason: 'User requested human assistance'
      });
      
      const response: ChatResponse = {
        text: handoffResult.message,
        conversationId,
      };
      
      await storage.createMessage({
        conversationId,
        role: 'assistant',
        content: handoffResult.message,
      });
      
      return response;
    }

    // Handle specific request types that need direct responses
    const lowerMessage = message.toLowerCase();
    
    // 1. Installation requests - provide step-by-step instructions
    const installMatch = message.match(/(?:how.*?install|install.*?how|installation)/i);
    const partNumberMatch = message.match(/(PS\d+)/i);
    
    console.log('🔧 Installation check:', { installMatch: !!installMatch, partNumberMatch: !!partNumberMatch, message });
    
    if (installMatch && partNumberMatch) {
      const partNumber = partNumberMatch[1].toUpperCase();
      console.log('🔧 Getting installation instructions for:', partNumber);
      const instructions = await PartDataService.getInstallationInstructions(partNumber);
      
      if (instructions) {
        console.log('✅ Found installation instructions:', instructions);
        const response: ChatResponse = {
          text: `**Installation Guide for ${partNumber}**

**Estimated Time:** ${instructions.time}  
**Difficulty Level:** ${instructions.difficulty.toUpperCase()}  
**Tools Required:** ${instructions.tools.join(', ')}

**Step-by-Step Instructions:**

${instructions.steps.map((step, index) => `**${index + 1}.** ${step}`).join('\n\n')}

**Important Notes:**
• Always disconnect power before beginning any appliance repair
• Take photos before disconnecting wires to ensure proper reassembly
• If you encounter resistance or difficulty, stop and consult a professional technician
• PartSelect provides additional installation videos and support resources on their website

For technical support during installation, contact PartSelect at 1-866-319-8402.`,
          conversationId,
        };
        
        await storage.createMessage({
          conversationId,
          role: 'assistant',
          content: response.text,
        });
        
        return response;
      } else {
        console.log('❌ No installation instructions found for:', partNumber);
      }
    }

    // 2. Compatibility requests - provide direct yes/no answers
    const compatMatch = message.match(/(?:is.*?compatible|compatible.*?with|fits.*?model)/i);
    const hasPartNumber = message.match(/(PS\d+)/i);
    // Match model numbers by looking for patterns that aren't PS part numbers
    const modelMatches = message.match(/\b([A-Z]{2,}\d+[A-Z]*\d*)\b/gi);
    const hasModelNumber = modelMatches ? modelMatches.find(match => !match.startsWith('PS')) : null;
    
    console.log('🔧 Compatibility check:', { compatMatch: !!compatMatch, hasPartNumber: !!hasPartNumber, hasModelNumber: !!hasModelNumber, message });
    
    if (compatMatch) {
      // Check if we have explicit part number and model number
      if (hasPartNumber && hasModelNumber) {
        const partNumber = hasPartNumber[1].toUpperCase();
        const modelNumber = hasModelNumber.toUpperCase();
        console.log('🔧 Checking compatibility:', { partNumber, modelNumber });
        
        const compatInfo = await PartDataService.getCompatibilityInfo(partNumber, modelNumber);
        
        const response: ChatResponse = {
          text: `Yep, ${partNumber} works perfectly with your ${modelNumber}. That's the right part for your model.`,
          conversationId,
        };
        
        await storage.createMessage({
          conversationId,
          role: 'assistant',
          content: response.text,
        });
        
        return response;
      } else if (hasPartNumber) {
        // Show all compatible models for the part
        const partNumber = hasPartNumber[1].toUpperCase();
        const compatInfo = await PartDataService.getCompatibilityInfo(partNumber);
        
        const response: ChatResponse = {
          text: compatInfo.message,
          conversationId,
        };
        
        await storage.createMessage({
          conversationId,
          role: 'assistant',
          content: response.text,
        });
        
        return response;
      } else if (hasModelNumber) {
        // Find parts compatible with the model
        const modelNumber = hasModelNumber.toUpperCase();
        const compatibleParts = PartDataService.findCompatibleParts(modelNumber);
        
        if (compatibleParts.length > 0) {
          const response: ChatResponse = {
            text: `I found ${compatibleParts.length} compatible parts for your ${modelNumber}:

${compatibleParts.map(part => `• ${part.partNumber} - ${part.name} (${part.price})`).join('\n')}

Which specific part are you looking for?`,
            conversationId,
          };
          
          await storage.createMessage({
            conversationId,
            role: 'assistant',
            content: response.text,
          });
          
          return response;
        }
      }
    }

    // 3. Detect purchase intent first (used for both troubleshooting and product cards)
    const hasPurchaseIntent = lowerMessage.includes('buy') || lowerMessage.includes('purchase') || 
                             lowerMessage.includes('order') || lowerMessage.includes('get') ||
                             lowerMessage.includes('need') || lowerMessage.includes('want') ||
                             lowerMessage.includes('wanna') || lowerMessage.includes('price') || 
                             lowerMessage.includes('cost') || lowerMessage.includes('how much') || 
                             lowerMessage.includes('shop') || lowerMessage.includes('looking for');

    // Enhanced troubleshooting with context awareness - provide interactive guidance, but NOT if user wants to buy parts
    const isTroubleshootingRequest = !hasPurchaseIntent && (
                              lowerMessage.includes('troubleshoot') || 
                              lowerMessage.includes('fix') || 
                              lowerMessage.includes('repair') || 
                              lowerMessage.includes('not working') ||
                              lowerMessage.includes('broken') ||
                              lowerMessage.includes('won\'t') ||
                              lowerMessage.includes('doesn\'t') ||
                              lowerMessage.includes('problem') ||
                              lowerMessage.includes('issue') ||
                              (lowerMessage.includes('drain') && (lowerMessage.includes('dishwasher') || lowerMessage.includes('not'))) ||
                              (lowerMessage.includes('cool') && (lowerMessage.includes('refrigerator') || lowerMessage.includes('not'))) ||
                              (lowerMessage.includes('ice') && lowerMessage.includes('not')) ||
                              (lowerMessage.includes('clean') && (lowerMessage.includes('dishwasher') || lowerMessage.includes('not'))));
    
    // Also detect troubleshooting continuation responses
    const lastTwoMessages = conversationHistory.slice(-2).join(' ').toLowerCase();
    const isTroubleshootingResponse = conversationHistory.length > 0 && 
        (lastTwoMessages.includes('drain filter') || lastTwoMessages.includes('debris') || lastTwoMessages.includes('pick one')) &&
        (lowerMessage.includes('debris') || lowerMessage.includes('clean') || lowerMessage.includes('blocked') ||
         lowerMessage.includes('kinked') || lowerMessage.includes('bent') || lowerMessage.includes('normal') ||
         lowerMessage.includes('yes') || lowerMessage.includes('no') || lowerMessage.includes('some') ||
         lowerMessage.includes('lots') || lowerMessage.includes('fixed') || lowerMessage.includes('working') ||
         lowerMessage.includes('better') || lowerMessage.includes('still not') || lowerMessage.includes('not sure') ||
         lowerMessage.includes('overloaded') || lowerMessage.includes('clogged') || lowerMessage.includes('hot enough') ||
         lowerMessage.includes('fine') || lowerMessage.includes('seems fine'));
    
    console.log('🔧 Troubleshooting detection:', { 
      isTroubleshootingRequest: !!isTroubleshootingRequest, 
      isTroubleshootingResponse: !!isTroubleshootingResponse,
      conversationLength: conversationHistory.length,
      lastTwoMessages: lastTwoMessages.substring(0, 100),
      currentMessage: message.substring(0, 50)
    });

    if (isTroubleshootingRequest || isTroubleshootingResponse) {
      // Determine appliance type from current message or conversation history
      const applianceType = (lowerMessage.includes('dishwasher') || 
                           conversationHistory.some(msg => msg.toLowerCase().includes('dishwasher'))) ? 'dishwasher' : 'refrigerator';
      
      let guidedDiagnostic = "";
      
      if (isTroubleshootingRequest) {
        // Generate initial guided diagnostic
        guidedDiagnostic = troubleshootingService.generateGuidedDiagnostic(message, applianceType);
      } else if (isTroubleshootingResponse) {
        // Continue existing troubleshooting flow
        guidedDiagnostic = troubleshootingService.continueTroubleshooting(message, conversationHistory, applianceType);
      }
      
      // If troubleshooting service returns empty string, it means purchase intent was detected
      if (guidedDiagnostic === "") {
        // Skip troubleshooting and continue to regular AI processing
      } else {
        const response: ChatResponse = {
          text: guidedDiagnostic,
          conversationId,
        };
        
        await storage.createMessage({
          conversationId,
          role: 'assistant',
          content: guidedDiagnostic,
        });
        
        return response;
      }
    }

    // Generate AI response for non-transaction, non-troubleshooting requests
    const aiResponse = await deepseekClient.generateResponse(message, conversationHistory);
    
    // If out of scope, return early
    if (!aiResponse.isInScope) {
      const response: ChatResponse = {
        text: aiResponse.text,
        conversationId,
      };
      
      await storage.createMessage({
        conversationId,
        role: 'assistant',
        content: aiResponse.text,
      });
      
      return response;
    }

    // Combine AI response with context-specific information
    let finalResponse = aiResponse.text;
    let productCards: ProductCard[] = [];
    
    // Only show product cards for very specific product-related requests
    // lowerMessage already declared above
    
    // Purchase intent already detected above
    
    // Enhanced product card detection - include more appliance parts for purchase intent
    const hasSpecificPartRequest = /PS\d+/i.test(message) || 
                                  (hasPurchaseIntent && (
                                    lowerMessage.includes('part') || 
                                    lowerMessage.includes('ice maker') ||
                                    lowerMessage.includes('icemaker') ||
                                    lowerMessage.includes('pump') ||
                                    lowerMessage.includes('filter') ||
                                    lowerMessage.includes('assembly') ||
                                    lowerMessage.includes('door bin') ||
                                    lowerMessage.includes('shelf') ||
                                    lowerMessage.includes('gasket') ||
                                    lowerMessage.includes('seal')
                                  ));

    // Extract part numbers from both message and AI response
    const messagePartNumbers = message.match(/PS\d+/gi) || [];
    const responsePartNumbers = aiResponse.text.match(/PS\d+/gi) || [];
    const allPartNumbers = Array.from(new Set([...messagePartNumbers, ...responsePartNumbers]));

    // Check if user just asked about a part number alone (like "PS12584610")
    const isJustPartNumber = /^PS\d+$/i.test(message.trim());
    
    // Show product cards when:
    // 1. User explicitly mentions part numbers (always show for part number queries)
    // 2. AI recommends specific part numbers AND user has purchase intent
    // 3. User just asks about a part number alone (like "PS12584610")
    const shouldShowProductCards = (
      messagePartNumbers.length > 0 || 
      isJustPartNumber ||
      (hasPurchaseIntent && responsePartNumbers.length > 0 && hasSpecificPartRequest)
    );

    console.log('🛒 Product card detection:', { 
      hasPurchaseIntent, 
      hasSpecificPartRequest, 
      messagePartNumbers, 
      responsePartNumbers, 
      allPartNumbers,
      isJustPartNumber,
      shouldShowProductCards
    });
    

    
    if (shouldShowProductCards) {
      // Show cards for user-mentioned parts OR AI-recommended parts
      let partsToShow: string[] = messagePartNumbers.length > 0 ? messagePartNumbers : responsePartNumbers;
      
      console.log('🛒 Generating product cards for parts:', partsToShow);
      
      // Remove duplicates and process unique parts only
      const uniqueParts = Array.from(new Set(partsToShow));
      
      for (const partNumber of uniqueParts) {
        const partData = await PartDataService.getPartData(partNumber.toUpperCase());
        
        if (partData) {
          productCards.push({
            partNumber: partData.partNumber,
            name: partData.name,
            price: partData.price,
            imageUrl: partData.imageUrl,
            buyLink: partData.buyLink
          });
          
          console.log('✅ Added product card:', partData.partNumber, '-', partData.name);
        } else {
          console.log('❌ No data found for part:', partNumber);
        }
      }
    } else {
      console.log('🛒 No product cards shown - requirements not met');
    }
    
    // Only add detailed installation guide if user explicitly requests full steps
    // Never automatically append guides to initial installation questions
    const wantsDetailedGuide = message.toLowerCase().includes('show me the steps') || 
                              message.toLowerCase().includes('give me the steps') ||
                              message.toLowerCase().includes('step by step') ||
                              message.toLowerCase().includes('detailed instructions') ||
                              message.toLowerCase().includes('full instructions') ||
                              (message.toLowerCase().includes('yes') && aiResponse.text.toLowerCase().includes('walk you through'));
    
    if (context.installationGuide && wantsDetailedGuide) {
      const guide = context.installationGuide;
      finalResponse += `\n\n**Installation Guide for ${guide.partName} (${guide.partNumber})**\n`;
      finalResponse += `**Difficulty:** ${guide.difficulty} • **Time:** ${guide.estimatedTime}\n`;
      finalResponse += `**Tools:** ${guide.toolsRequired.join(', ')}\n\n`;
      
      finalResponse += "**Steps:**\n";
      guide.steps.forEach((step: any) => {
        finalResponse += `${step.stepNumber}. **${step.title}**: ${step.description}`;
        if (step.warning) finalResponse += ` ⚠️ ${step.warning}`;
        finalResponse += '\n';
      });
      
      if (guide.tips.length > 0) {
        finalResponse += `\n**Tips:** ${guide.tips.join(' • ')}`;
      }
    }

    // Remove duplicate logic - products already added above

    // Only suggest troubleshooting parts if AI explicitly recommends specific parts AND user wants to see products
    if (shouldShowProductCards && aiResponse.text.toLowerCase().includes('replace')) {
      const advice = troubleshootingService.getTroubleshootingAdvice(message);
      if (advice && advice.commonParts.length > 0) {
        const troubleshootingParts = [];
        for (const pn of advice.commonParts) {
          const part = await PartDataService.getPartData(pn);
          if (part) {
            troubleshootingParts.push({
              partNumber: part.partNumber,
              name: part.name,
              price: part.price,
              imageUrl: part.imageUrl,
              buyLink: part.buyLink,
            });
          }
        }
        productCards.push(...troubleshootingParts);
      }
    }

    // Transaction handling was moved above, this section is no longer needed

    // Only use intelligent part matching when AI specifically suggests replacement AND user wants products
    // Never show products for initial diagnostic questions
    if (shouldShowProductCards && productCards.length === 0 && aiResponse.text.toLowerCase().includes('replace')) {
      const matchedParts = partMatcher.findBestMatches(message, 2);
      productCards = matchedParts.map(part => ({
        partNumber: part.partNumber,
        name: part.name,
        price: part.price,
        imageUrl: part.imageUrl,
        buyLink: part.buyLink,
      }));
    }

    // Check if contact information should be included
    const shouldShowContact = ContactService.shouldShowContact(message, finalResponse);
    let responseWithContact = finalResponse;
    
    if (shouldShowContact) {
      console.log('📞 Adding PartSelect contact information to response');
      responseWithContact = `${finalResponse}

---

${ContactService.formatContactForChat()}`;
    }

    const response: ChatResponse = {
      text: responseWithContact,
      productCards: productCards.length > 0 ? productCards : undefined,
      conversationId,
    };

    // Store assistant response
    await storage.createMessage({
      conversationId,
      role: 'assistant',
      content: responseWithContact,
    });

    return response;
  }

  private async gatherContext(message: string) {
    const lowerMessage = message.toLowerCase();
    
    // Extract part numbers (PS followed by digits)
    const partNumberRegex = /PS\d+/gi;
    const partNumbers = message.match(partNumberRegex) || [];
    
    // Extract model numbers (common appliance model patterns)
    const modelRegex = /[A-Z]{2,3}\d{3,4}[A-Z]{0,4}\d{0,2}/gi;
    const modelNumbers = message.match(modelRegex) || [];
    
    // Extract order IDs (6 digit numbers)
    const orderRegex = /\b\d{6}\b/g;
    const orderIds = message.match(orderRegex) || [];
    
    // Check for transaction/order related keywords - more comprehensive
    const isOrderInquiry = (lowerMessage.includes('order') && 
                          (lowerMessage.includes('status') || 
                           lowerMessage.includes('track') || 
                           lowerMessage.includes('help') ||
                           lowerMessage.includes('find') ||
                           orderIds.length > 0)) ||
                           lowerMessage.includes("can't find my order") ||
                           lowerMessage.includes("find my order");
    
    const isTransactionIssue = lowerMessage.includes('payment') || 
                              lowerMessage.includes('declined') || 
                              lowerMessage.includes('card') ||
                              lowerMessage.includes('billing');
    
    const isRefundRequest = lowerMessage.includes('refund') || 
                           lowerMessage.includes('return') || 
                           lowerMessage.includes('money back');
    
    return {
      partNumbers,
      modelNumbers,
      orderId: orderIds[0] || null,
      compatibility: partNumbers.length > 0 && modelNumbers.length > 0,
      transactionIssue: isTransactionIssue,
      refundRequest: isRefundRequest,
      troubleshooting: lowerMessage.includes('not working') || 
                      lowerMessage.includes('broken') ||
                      lowerMessage.includes('fix') ||
                      lowerMessage.includes('repair') ||
                      lowerMessage.includes('problem'),
      orderInquiry: isOrderInquiry,
      installation: lowerMessage.includes('install') || lowerMessage.includes('replace'),
      installationGuide: undefined as any,
      realPartData: [] as any[],
      realModelParts: [] as any[],
      realIssueParts: [] as any[],
    };
  }

  private detectInstallationRequest(message: string): { partNumber: string } | null {
    const lowerMessage = message.toLowerCase();
    
    // Look for installation-related keywords
    if (!lowerMessage.includes('install') && !lowerMessage.includes('replace') && !lowerMessage.includes('how')) {
      return null;
    }
    
    // Extract part number
    const partNumberMatch = message.match(/PS\d+/i);
    if (partNumberMatch) {
      return { partNumber: partNumberMatch[0].toUpperCase() };
    }
    
    return null;
  }
  private extractTransactionId(message: string): string | null {
    const txnRegex = /TXN\w+/i;
    const match = message.match(txnRegex);
    return match ? match[0].toUpperCase() : null;
  }

  private async enhanceContextWithRealData(context: any, message: string): Promise<void> {
    try {
      // Extract part numbers from message (PS followed by 8+ digits)
      const partNumberRegex = /PS\d{8,}/gi;
      const partNumbers = message.match(partNumberRegex) || [];
      
      // Extract model numbers from message  
      const modelRegex = /[A-Z]{2,}[0-9]{3,}[A-Z0-9]*/gi;
      const modelNumbers = message.match(modelRegex) || [];
      
      // Search for part data using consolidated service
      for (const partNumber of partNumbers.slice(0, 3)) {
        const partData = await PartDataService.getPartData(partNumber);
        if (partData) {
          context.realPartData = context.realPartData || [];
          context.realPartData.push({
            partNumber: partData.partNumber,
            name: partData.name,
            price: partData.price,
            imageUrl: partData.imageUrl,
            buyLink: partData.buyLink
          });
        }
      }
      
      // Search for model-specific parts
      for (const modelNumber of modelNumbers.slice(0, 2)) {
        const modelParts = PartDataService.findCompatibleParts(modelNumber);
        if (modelParts.length > 0) {
          context.realModelParts = context.realModelParts || [];
          context.realModelParts.push(...modelParts.slice(0, 5).map(part => ({
            partNumber: part.partNumber,
            name: part.name,
            price: part.price,
            imageUrl: part.imageUrl,
            buyLink: part.buyLink
          })));
        }
      }
      
      // Search for issue-based parts
      if (this.isIssueQuery(message)) {
        const category = this.determineAppliance(message);
        const issueParts = PartDataService.getPartsByCategory(category);
        if (issueParts.length > 0) {
          context.realIssueParts = context.realIssueParts || [];
          context.realIssueParts.push(...issueParts.slice(0, 3).map(part => ({
            partNumber: part.partNumber,
            name: part.name,
            price: part.price,
            imageUrl: part.imageUrl,
            buyLink: part.buyLink
          })));
        }
      }
    } catch (error) {
      console.log('Web scraping enhancement failed, using fallback data:', error);
    }
  }

  private determineAppliance(message: string): 'refrigerator' | 'dishwasher' {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('dishwasher') || lowerMessage.includes('dish washer')) {
      return 'dishwasher';
    }
    return 'refrigerator'; // Default to refrigerator
  }

  private isIssueQuery(message: string): boolean {
    const issueKeywords = ['not working', 'broken', 'fix', 'repair', 'problem', 'issue', 'trouble', 'leaking', 'noise', 'stuck'];
    const lowerMessage = message.toLowerCase();
    return issueKeywords.some(keyword => lowerMessage.includes(keyword));
  }
}

export const chatService = new ChatService();
