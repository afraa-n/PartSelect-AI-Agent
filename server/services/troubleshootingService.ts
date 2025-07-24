export interface TroubleshootingAdvice {
  problem: string;
  category: 'refrigerator' | 'dishwasher';
  solutions: {
    step: number;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
  commonParts: string[];
  warnings: string[];
}

export interface DiagnosticStep {
  stepNumber: number;
  instruction: string;
  question: string;
  possibleAnswers: string[];
  nextSteps: { [answer: string]: DiagnosticStep | string };
}

export interface TroubleshootingFlow {
  issueType: string;
  applianceType: 'refrigerator' | 'dishwasher';
  initialStep: DiagnosticStep;
  commonParts: string[];
}

export class TroubleshootingService {
  private troubleshootingDatabase: TroubleshootingAdvice[] = [
    {
      problem: "ice maker not working",
      category: "refrigerator",
      solutions: [
        {
          step: 1,
          description: "Check if the ice maker is turned on and the water supply is connected",
          difficulty: "easy"
        },
        {
          step: 2,
          description: "Inspect the water filter - replace if clogged or overdue",
          difficulty: "easy"
        },
        {
          step: 3,
          description: "Test the ice maker assembly for proper operation",
          difficulty: "medium"
        },
        {
          step: 4,
          description: "Check water inlet valve for proper water flow",
          difficulty: "hard"
        }
      ],
      commonParts: ["PS12584610", "PS733947", "PS2179605"],
      warnings: ["Always disconnect power before servicing", "Check warranty status before repairs"]
    },
    {
      problem: "dishwasher not draining",
      category: "dishwasher",
      solutions: [
        {
          step: 1,
          description: "Clear any food debris from the drain filter at the bottom of the tub",
          difficulty: "easy"
        },
        {
          step: 2,
          description: "Check the garbage disposal (if connected) for clogs",
          difficulty: "easy"
        },
        {
          step: 3,
          description: "Inspect the drain hose for kinks or blockages",
          difficulty: "medium"
        },
        {
          step: 4,
          description: "Test the wash pump motor for proper operation",
          difficulty: "hard"
        }
      ],
      commonParts: ["PS11756692", "PS11746240", "PS11753379"],
      warnings: ["Turn off power and water supply before servicing", "Wear gloves when handling drain components"]
    },
    {
      problem: "refrigerator not cooling",
      category: "refrigerator",
      solutions: [
        {
          step: 1,
          description: "Check temperature settings and ensure proper airflow around vents",
          difficulty: "easy"
        },
        {
          step: 2,
          description: "Clean condenser coils on the back or bottom of the refrigerator",
          difficulty: "easy"
        },
        {
          step: 3,
          description: "Test the evaporator fan motor for proper operation",
          difficulty: "medium"
        },
        {
          step: 4,
          description: "Check the defrost heater and defrost thermostat",
          difficulty: "hard"
        }
      ],
      commonParts: ["PS2355119", "PS2071928"],
      warnings: ["Allow 24 hours after temperature adjustments", "Unplug refrigerator before electrical work"]
    },
    {
      problem: "dishwasher not cleaning dishes",
      category: "dishwasher",
      solutions: [
        {
          step: 1,
          description: "Check spray arms for clogs and clean if necessary",
          difficulty: "easy"
        },
        {
          step: 2,
          description: "Verify proper loading technique and use appropriate detergent",
          difficulty: "easy"
        },
        {
          step: 3,
          description: "Inspect door seals for proper sealing during wash cycle",
          difficulty: "medium"
        },
        {
          step: 4,
          description: "Test wash pump motor pressure and operation",
          difficulty: "hard"
        }
      ],
      commonParts: ["PS11739132", "PS11747979"],
      warnings: ["Use only dishwasher-safe detergents", "Check water temperature (120°F recommended)"]
    }
  ];

  getTroubleshootingAdvice(problem: string): TroubleshootingAdvice | null {
    const normalizedProblem = problem.toLowerCase();
    
    const advice = this.troubleshootingDatabase.find(item =>
      normalizedProblem.includes(item.problem) ||
      item.problem.split(' ').some(keyword => normalizedProblem.includes(keyword))
    );

    return advice || null;
  }

  searchTroubleshooting(query: string): TroubleshootingAdvice[] {
    const searchTerms = query.toLowerCase().split(' ');
    
    return this.troubleshootingDatabase.filter(advice =>
      searchTerms.some(term =>
        advice.problem.includes(term) ||
        advice.solutions.some(solution => 
          solution.description.toLowerCase().includes(term)
        )
      )
    );
  }

  getCommonIssuesByCategory(category: 'refrigerator' | 'dishwasher'): TroubleshootingAdvice[] {
    return this.troubleshootingDatabase.filter(advice => advice.category === category);
  }

  /**
   * Get interactive troubleshooting flow for guided diagnostics
   */
  getTroubleshootingFlow(issue: string, applianceType: 'refrigerator' | 'dishwasher'): TroubleshootingFlow | null {
    const lowerIssue = issue.toLowerCase();
    
    if (applianceType === 'dishwasher') {
      if (lowerIssue.includes('drain') || lowerIssue.includes('water')) {
        return this.getDishwasherDrainFlow();
      } else if (lowerIssue.includes('clean') || lowerIssue.includes('wash')) {
        return this.getDishwasherCleaningFlow();
      }
    } else if (applianceType === 'refrigerator') {
      if (lowerIssue.includes('ice') || lowerIssue.includes('maker')) {
        return this.getRefrigeratorIceFlow();
      } else if (lowerIssue.includes('cool') || lowerIssue.includes('cold') || lowerIssue.includes('temperature')) {
        return this.getRefrigeratorCoolingFlow();
      }
    }
    
    return null;
  }

  /**
   * Generate guided diagnostic response with context awareness
   */
  generateGuidedDiagnostic(issue: string, applianceType: 'refrigerator' | 'dishwasher'): string {
    // Check for purchase intent - if user wants to buy something, don't provide troubleshooting
    const lowerIssue = issue.toLowerCase();
    const hasPurchaseIntent = lowerIssue.includes('buy') || lowerIssue.includes('purchase') || 
                             lowerIssue.includes('order') || lowerIssue.includes('get') ||
                             lowerIssue.includes('need') || lowerIssue.includes('want') ||
                             lowerIssue.includes('wanna') || lowerIssue.includes('price') || 
                             lowerIssue.includes('cost') || lowerIssue.includes('how much') || 
                             lowerIssue.includes('shop') || lowerIssue.includes('looking for');
    
    if (hasPurchaseIntent) {
      return ""; // Return empty string to indicate this should not use troubleshooting flow
    }
    
    const flow = this.getTroubleshootingFlow(issue, applianceType);
    
    if (flow) {
      return `Let's figure out what's going on with your ${flow.applianceType}. ${flow.initialStep.instruction}

${flow.initialStep.question}

Pick one of these:
${flow.initialStep.possibleAnswers.map(answer => `• ${answer}`).join('\n')}

This'll help me get you the right fix.`;
    }
    
    return "I can help troubleshoot this issue. Please provide more details about what's happening with your appliance.";
  }

  /**
   * Continue troubleshooting flow based on user response and conversation context
   */
  continueTroubleshooting(userResponse: string, conversationHistory: string[], applianceType: 'refrigerator' | 'dishwasher'): string {
    const lowerResponse = userResponse.toLowerCase();
    
    // Detect which troubleshooting flow we're in based on conversation history
    const lastMessage = conversationHistory[conversationHistory.length - 1] || '';
    const isInDrainFlow = lastMessage.includes('drain filter') || lastMessage.includes('debris');
    const isInCleaningFlow = lastMessage.includes('cleaning') || lastMessage.includes('detergent');
    const isInIceFlow = lastMessage.includes('ice maker') || lastMessage.includes('ice');
    const isInCoolingFlow = lastMessage.includes('cooling') || lastMessage.includes('temperature');
    
    // Handle drainage troubleshooting continuation
    if (isInDrainFlow && applianceType === 'dishwasher') {
      return this.continueDrainTroubleshooting(userResponse, conversationHistory);
    }
    
    // Handle cleaning troubleshooting continuation  
    if (isInCleaningFlow && applianceType === 'dishwasher') {
      return this.continueCleaningTroubleshooting(userResponse, conversationHistory);
    }
    
    // Handle ice maker troubleshooting continuation
    if (isInIceFlow && applianceType === 'refrigerator') {
      return this.continueIceTroubleshooting(userResponse, conversationHistory);
    }
    
    // Handle cooling troubleshooting continuation
    if (isInCoolingFlow && applianceType === 'refrigerator') {
      return this.continueCoolingTroubleshooting(userResponse, conversationHistory);
    }
    
    // If we can't determine the flow, provide general guidance
    return "Let me know more details about the issue and I'll guide you through the next steps.";
  }

  private continueDrainTroubleshooting(userResponse: string, conversationHistory: string[]): string {
    const lowerResponse = userResponse.toLowerCase();
    
    if (lowerResponse.includes('lots of debris') || lowerResponse.includes('yes')) {
      return `Clean that filter thoroughly with warm water and a soft brush. Remove all the food particles and grease buildup. Once it's clean, put it back and run a quick cycle to test. 

Did cleaning the filter fix the drainage issue?`;
    }
    
    if (lowerResponse.includes('some debris')) {
      return `Clean the filter and also check if your garbage disposal (if connected) is working properly. Run the disposal first, then test the dishwasher.

After cleaning the filter and running the disposal, is the dishwasher draining better?`;
    }
    
    if (lowerResponse.includes('no debris') || lowerResponse.includes('clean')) {
      return `Since the filter's clean, let's check the drain hose under your sink. Look for the dishwasher drain hose connection.

Is the drain hose kinked, bent, or does it look clogged where it connects?`;
    }
    
    // Handle second-level responses
    if (lowerResponse.includes('kinked') || lowerResponse.includes('bent')) {
      return `Straighten out that hose and make sure it has a smooth path. Avoid sharp bends. Test the dishwasher again.

Is it draining properly now?`;
    }
    
    if (lowerResponse.includes('clogged') || lowerResponse.includes('blocked')) {
      return `The drain hose needs cleaning or replacement. Part PS11746240 is the drain hose assembly that should fix this. You can get it from PartSelect.

Would you like to order the replacement hose, or do you want to try cleaning the existing one first?`;
    }
    
    if (lowerResponse.includes('looks normal') || lowerResponse.includes('fine')) {
      return `If the filter and hose look good, the issue is likely the wash pump motor or drain pump. Part PS11756692 is the pump motor assembly, or PS11753379 is the drain pump.

Which would you prefer - ordering the part or having a technician diagnose which pump needs replacement?`;
    }
    
    // Handle fix confirmation
    if (lowerResponse.includes('fixed') || lowerResponse.includes('working') || lowerResponse.includes('draining')) {
      return `Great! The drainage issue is fixed. To prevent this from happening again, clean the filter monthly and scrape food off dishes before loading.

Is there anything else I can help you with?`;
    }
    
    if (lowerResponse.includes('still not') || lowerResponse.includes('not working') || lowerResponse.includes('not draining')) {
      return `Since basic cleaning didn't work, we need to check the pump system. The drain pump (PS11753379) or wash pump motor (PS11756692) likely needs replacement.

Do you want to order one of these parts, or would you prefer a technician to diagnose which one exactly?`;
    }
    
    return "Tell me more about what you're seeing with the drainage issue and I'll guide you to the next step.";
  }

  private continueCleaningTroubleshooting(userResponse: string, conversationHistory: string[]): string {
    const lowerResponse = userResponse.toLowerCase();
    
    if (lowerResponse.includes('not sure') || lowerResponse.includes('detergent')) {
      return `Use only dishwasher detergent (never hand soap) and follow the amount on the package. Also add rinse aid to help with drying and spotting.

After using proper detergent and rinse aid, are the dishes coming out cleaner?`;
    }
    
    if (lowerResponse.includes('overloaded') || lowerResponse.includes('packed')) {
      return `Load dishes with space between them so water can reach all surfaces. Don't nest utensils together - separate them in the basket.

With better loading, are you getting better cleaning results?`;
    }
    
    if (lowerResponse.includes('blocked') || lowerResponse.includes('clogged')) {
      return `Remove the spray arms and rinse them under hot water. Use a toothpick to clear any holes that are blocked with food or grease.

After cleaning the spray arms, is the cleaning performance better?`;
    }
    
    if (lowerResponse.includes('not hot') || lowerResponse.includes('cold')) {
      return `Set your water heater to 120°F. Run hot water at your kitchen sink until it's steaming before starting the dishwasher.

With hotter water, are the dishes getting cleaner?`;
    }
    
    if (lowerResponse.includes('both fine') || lowerResponse.includes('seem fine')) {
      return `Let's check the wash pump motor. If it's not creating enough pressure, dishes won't get clean. Part PS11756692 is the wash pump motor assembly.

Are you hearing the wash motor running during the cycle, or is it unusually quiet?`;
    }
    
    // Handle improvement confirmations
    if (lowerResponse.includes('better') || lowerResponse.includes('cleaner') || lowerResponse.includes('working')) {
      return `Excellent! The cleaning issue is resolved. Keep using proper detergent amounts and good loading techniques for best results.

Anything else I can help you with?`;
    }
    
    if (lowerResponse.includes('still not') || lowerResponse.includes('not working') || lowerResponse.includes('not clean')) {
      return `Since the basics aren't fixing it, the wash pump motor likely needs replacement. Part PS11756692 should restore proper cleaning performance.

Would you like to order the wash pump motor, or do you have other questions about the repair?`;
    }
    
    return "Let me know what you're seeing with the cleaning performance and I'll help you with the next step.";
  }

  private continueIceTroubleshooting(userResponse: string, conversationHistory: string[]): string {
    // Implement ice maker troubleshooting continuation
    return "Let me help you continue troubleshooting the ice maker issue. What specifically is happening with it?";
  }

  private continueCoolingTroubleshooting(userResponse: string, conversationHistory: string[]): string {
    // Implement cooling troubleshooting continuation  
    return "Let me help you continue troubleshooting the cooling issue. What temperatures are you seeing?";
  }

  private getDishwasherDrainFlow(): TroubleshootingFlow {
    return {
      issueType: "dishwasher drainage",
      applianceType: "dishwasher",
      initialStep: {
        stepNumber: 1,
        instruction: "Check the drain filter at the bottom of your dishwasher tub",
        question: "Is there visible food debris or buildup in the drain filter?",
        possibleAnswers: ["Yes, lots of debris", "Some debris", "No debris visible"],
        nextSteps: {
          "Yes, lots of debris": "Clean the filter thoroughly with warm water and a soft brush. This often fixes drainage issues. Test your dishwasher after cleaning.",
          "Some debris": "Clean the filter and check if your garbage disposal (if connected) is working properly. Run the disposal before testing the dishwasher.",
          "No debris visible": {
            stepNumber: 2,
            instruction: "Check the drain hose connection under your sink",
            question: "Is the drain hose kinked, clogged, or disconnected?",
            possibleAnswers: ["Kinked/bent", "Seems clogged", "Looks normal"],
            nextSteps: {
              "Kinked/bent": "Straighten the drain hose and ensure proper routing. Test the dishwasher again.",
              "Seems clogged": "The drain hose may need professional cleaning or replacement. Part PS11746240 is the drain hose assembly.",
              "Looks normal": "The issue may be the wash pump motor (PS11756692) or drain pump (PS11753379). Professional diagnosis recommended."
            }
          }
        }
      },
      commonParts: ["PS11753379", "PS11746240", "PS11756692"]
    };
  }

  private getDishwasherCleaningFlow(): TroubleshootingFlow {
    return {
      issueType: "dishwasher cleaning performance",
      applianceType: "dishwasher",
      initialStep: {
        stepNumber: 1,
        instruction: "Check your loading technique and detergent usage",
        question: "Are you using the correct amount of detergent and loading dishes properly?",
        possibleAnswers: ["Yes, following guidelines", "Not sure about detergent", "Dishes might be overloaded"],
        nextSteps: {
          "Not sure about detergent": "Use only dishwasher detergent (not hand soap) and follow manufacturer's recommendations. Rinse aid also helps.",
          "Dishes might be overloaded": "Load dishes with space between them for proper water circulation. Don't nest utensils together.",
          "Yes, following guidelines": {
            stepNumber: 2,
            instruction: "Check water temperature and spray arms",
            question: "Are the spray arms spinning freely and is your water heater set to 120°F?",
            possibleAnswers: ["Spray arms blocked", "Water not hot enough", "Both seem fine"],
            nextSteps: {
              "Spray arms blocked": "Remove and clean spray arms thoroughly. Check for food particles in the holes.",
              "Water not hot enough": "Set water heater to 120°F and run hot water at kitchen sink before starting dishwasher.",
              "Both seem fine": "The wash pump motor may need service. Professional diagnosis recommended."
            }
          }
        }
      },
      commonParts: ["PS11739132", "PS11747979"]
    };
  }

  private getRefrigeratorIceFlow(): TroubleshootingFlow {
    return {
      issueType: "ice maker",
      applianceType: "refrigerator",
      initialStep: {
        stepNumber: 1,
        instruction: "Check the ice maker power and settings",
        question: "Is the ice maker switched ON and the wire arm in the DOWN position?",
        possibleAnswers: ["Yes, both are correct", "No, one or both are off"],
        nextSteps: {
          "No, one or both are off": "Turn on the ice maker and lower the wire arm. Wait 24 hours for ice production to begin.",
          "Yes, both are correct": {
            stepNumber: 2,
            instruction: "Check the water supply to your refrigerator",
            question: "Is water flowing to the water dispenser (if equipped)?",
            possibleAnswers: ["Yes, water flows normally", "No water or very slow", "No water dispenser"],
            nextSteps: {
              "No water or very slow": "Replace the water filter first. If problem persists, the water inlet valve may need replacement.",
              "Yes, water flows normally": "The ice maker assembly (PS12584610) may be faulty and need replacement.",
              "No water dispenser": {
                stepNumber: 3,
                instruction: "Check behind the refrigerator for water line connections",
                question: "Is the water line connected and the shut-off valve open?",
                possibleAnswers: ["Connected and open", "Not connected", "Don't know"],
                nextSteps: {
                  "Not connected": "Connect the water line and open the shut-off valve. Wait 24 hours for ice production.",
                  "Connected and open": "The ice maker assembly (PS12584610) likely needs replacement.",
                  "Don't know": "Professional installation or inspection recommended for water line connections."
                }
              }
            }
          }
        }
      },
      commonParts: ["PS12584610", "PS733947"]
    };
  }

  private getRefrigeratorCoolingFlow(): TroubleshootingFlow {
    return {
      issueType: "refrigerator cooling",
      applianceType: "refrigerator",
      initialStep: {
        stepNumber: 1,
        instruction: "Check the temperature settings and door seals",
        question: "Are the temperature settings correct (37°F fridge, 0°F freezer) and do the door seals close tightly?",
        possibleAnswers: ["Settings and seals are good", "Temperature too high", "Door seals seem loose"],
        nextSteps: {
          "Temperature too high": "Set refrigerator to 37°F and freezer to 0°F. Wait 24 hours to check temperature again.",
          "Door seals seem loose": "Clean door seals and check for damage. Replace if cracked or torn.",
          "Settings and seals are good": {
            stepNumber: 2,
            instruction: "Check air circulation and vents",
            question: "Are the air vents inside blocked by food items?",
            possibleAnswers: ["Yes, vents are blocked", "No, vents are clear"],
            nextSteps: {
              "Yes, vents are blocked": "Remove items blocking vents and ensure proper air circulation. Wait 24 hours.",
              "No, vents are clear": "The issue may be the evaporator fan motor, condenser coils, or compressor. Professional diagnosis recommended."
            }
          }
        }
      },
      commonParts: ["PS2163382", "PS2071928"]
    };
  }
}

export const troubleshootingService = new TroubleshootingService();
