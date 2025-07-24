import { findPartByNumber } from './mockCatalog';

export interface InstallationGuide {
  partNumber: string;
  partName: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  estimatedTime: string;
  toolsRequired: string[];
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    warning?: string;
  }[];
  tips: string[];
}

export class InstallationGuideService {
  getInstallationGuide(partNumber: string): InstallationGuide | null {
    const part = findPartByNumber(partNumber);
    if (!part) return null;

    // Specific installation guides for each part
    switch (partNumber.toUpperCase()) {
      case 'PS11752778':
        return {
          partNumber: 'PS11752778',
          partName: 'Refrigerator Door Shelf Bin',
          difficulty: 'Easy',
          estimatedTime: 'Under 5 minutes',
          toolsRequired: ['None - snap-in replacement'],
          steps: [
            {
              stepNumber: 1,
              title: 'Remove Old Bin',
              description: 'Lift the damaged bin straight up and out of the door brackets. It should come out easily.'
            },
            {
              stepNumber: 2,
              title: 'Clean the Area',
              description: 'Wipe down the door brackets where the bin sits to remove any debris or spills.'
            },
            {
              stepNumber: 3,
              title: 'Install New Bin',
              description: 'Align the new bin with the door brackets and press down firmly until it clicks securely into place.'
            },
            {
              stepNumber: 4,
              title: 'Test Installation',
              description: 'Gently pull on the bin to ensure it\'s properly seated and won\'t fall out.'
            }
          ],
          tips: [
            'This is a genuine OEM part ensuring proper fit',
            'No tools required - simple snap-in replacement',
            'Make sure door is fully open for easy access'
          ]
        };

      case 'PS11756692':
        return {
          partNumber: 'PS11756692',
          partName: 'Dishwasher Pump and Motor Assembly',
          difficulty: 'Moderate',
          estimatedTime: '30-60 minutes',
          toolsRequired: ['Phillips screwdriver', 'Small flathead screwdriver', 'Pliers for hose clamps'],
          steps: [
            {
              stepNumber: 1,
              title: 'Safety First',
              description: 'Turn off power to dishwasher at breaker and shut off water supply.',
              warning: 'Always disconnect power before servicing appliances'
            },
            {
              stepNumber: 2,
              title: 'Access the Pump',
              description: 'Remove the bottom dish rack and unscrew the spray arm. Remove the filter assembly to access the sump.'
            },
            {
              stepNumber: 3,
              title: 'Document Connections',
              description: 'Take photos of all wire connections and hose attachments before removal.'
            },
            {
              stepNumber: 4,
              title: 'Remove Old Pump',
              description: 'Disconnect electrical connections and hose clamps. Lift out the old pump assembly.'
            },
            {
              stepNumber: 5,
              title: 'Install New Pump',
              description: 'Position new pump, reconnect hoses with new clamps, and attach electrical connections.'
            },
            {
              stepNumber: 6,
              title: 'Test Operation',
              description: 'Restore power and water. Run a test cycle to verify proper operation.'
            }
          ],
          tips: [
            'Lubricate gasket with rinse aid for easier fitting',
            'May require two people for final seating',
            'Keep photos handy for reference during reassembly'
          ]
        };

      case 'PS12584610':
        return {
          partNumber: 'PS12584610',
          partName: 'Refrigerator Ice Maker Assembly',
          difficulty: 'Moderate',
          estimatedTime: '25-45 minutes',
          toolsRequired: ['Phillips screwdriver', 'Nut driver set'],
          steps: [
            {
              stepNumber: 1,
              title: 'Safety Preparation',
              description: 'Unplug refrigerator and turn off water supply to ice maker.',
              warning: 'Always disconnect power before servicing'
            },
            {
              stepNumber: 2,
              title: 'Remove Ice Bin',
              description: 'Pull out the ice storage bin and set aside.'
            },
            {
              stepNumber: 3,
              title: 'Disconnect Old Ice Maker',
              description: 'Unplug wire harness and disconnect water line. Remove mounting screws.'
            },
            {
              stepNumber: 4,
              title: 'Install New Assembly',
              description: 'Mount new ice maker with screws, reconnect water line and wire harness.'
            },
            {
              stepNumber: 5,
              title: 'Test Installation',
              description: 'Restore power and water. Allow 24 hours for first ice production.'
            }
          ],
          tips: [
            'Wire harness from original unit may need to be reused',
            'Allow 24 hours for first ice cycle',
            'Check for water leaks after installation'
          ]
        };

      default:
        return {
          partNumber: partNumber,
          partName: part.name,
          difficulty: 'Moderate',
          estimatedTime: '30-60 minutes',
          toolsRequired: ['Basic hand tools'],
          steps: [
            {
              stepNumber: 1,
              title: 'Safety First',
              description: 'Disconnect power and water supply before beginning work.'
            },
            {
              stepNumber: 2,
              title: 'Access the Component',
              description: 'Remove necessary panels or components to access the part.'
            },
            {
              stepNumber: 3,
              title: 'Remove Old Part',
              description: 'Carefully disconnect all connections and remove the old part.'
            },
            {
              stepNumber: 4,
              title: 'Install New Part',
              description: 'Install the new part following reverse of removal procedure.'
            },
            {
              stepNumber: 5,
              title: 'Test Operation',
              description: 'Restore power and test to ensure proper operation.'
            }
          ],
          tips: [
            'Take photos before disassembly for reference',
            'Check warranty status before starting repairs'
          ]
        };
    }
  }
}

export const installationGuide = new InstallationGuideService();