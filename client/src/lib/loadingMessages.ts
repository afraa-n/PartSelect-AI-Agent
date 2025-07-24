// Context-specific loading messages instead of generic "Searching parts database..."
export const getLoadingMessage = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  // Ice maker related
  if (message.includes('ice') || message.includes('icemaker')) {
    return "Checking ice maker components...";
  }
  
  // Drain issues
  if (message.includes('drain') || message.includes('not draining') || message.includes('water standing')) {
    return "Analyzing drainage system...";
  }
  
  // Door seals/gaskets
  if (message.includes('seal') || message.includes('gasket') || message.includes('leak')) {
    return "Inspecting door seals...";
  }
  
  // Water filter
  if (message.includes('filter') || message.includes('water taste') || message.includes('water quality')) {
    return "Checking filter status...";
  }
  
  // Motor/pump issues
  if (message.includes('motor') || message.includes('pump') || message.includes('noise') || message.includes('sound')) {
    return "Diagnosing motor components...";
  }
  
  // Installation questions
  if (message.includes('install') || message.includes('replace') || message.includes('how to')) {
    return "Looking up installation steps...";
  }
  
  // Compatibility checks
  if (message.includes('compatible') || message.includes('fit') || message.includes('work with')) {
    return "Checking compatibility...";
  }
  
  // Part number specific
  if (message.match(/ps\d+/i)) {
    return "Looking up part details...";
  }
  
  // Order related
  if (message.includes('order') || message.includes('tracking') || message.includes('shipping')) {
    return "Checking order status...";
  }
  
  // Temperature issues
  if (message.includes('not cool') || message.includes('warm') || message.includes('temperature')) {
    return "Analyzing cooling system...";
  }
  
  // General appliance issues
  if (message.includes('dishwasher')) {
    return "Evaluating dishwasher issue...";
  }
  
  if (message.includes('refrigerator') || message.includes('fridge')) {
    return "Evaluating refrigerator issue...";
  }
  
  // Default fallback
  return "Analyzing your request...";
};