// Simple API status checker to verify Deepseek integration
export function getDeepseekStatus(): { status: string; hasApiKey: boolean; endpoint: string } {
  const hasApiKey = !!(process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY);
  
  return {
    status: hasApiKey ? 'ACTIVE - Using Deepseek API' : 'MOCK - No API key provided',
    hasApiKey,
    endpoint: 'https://api.deepseek.com/v1/chat/completions'
  };
}