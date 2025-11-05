const Anthropic = require('@anthropic-ai/sdk');

class ClaudeClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('❌ ANTHROPIC_API_KEY is required in .env file!');
    }

    this.client = new Anthropic({
      apiKey: apiKey,
    });

    console.log('✅ Claude client initialized');
  }

  /**
   * Analyze code with Claude
   */
  async analyze(prompt) {
    try {
      console.log('📤 Sending to Claude...');
      console.log(`📊 Prompt length: ${prompt.length} characters`);

      const response = await this.client.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 8096,
        temperature: 0.7,
        messages: [{
          role: "user",
          content: prompt
        }]
      });

      console.log('📥 Response received from Claude');
      console.log(`📊 Tokens used: ${response.usage.input_tokens} input, ${response.usage.output_tokens} output`);

      return {
        content: response.content[0].text,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          totalCost: this.calculateCost(response.usage)
        }
      };

    } catch (error) {
      console.error('❌ Claude API Error:', error.message);

      if (error.status === 401) {
        throw new Error('Invalid API key. Check your ANTHROPIC_API_KEY in .env');
      }

      throw new Error(`Claude API failed: ${error.message}`);
    }
  }

  /**
   * Calculate API cost in USD
   */
  calculateCost(usage) {
    // Claude Sonnet 4.5 pricing (as of Jan 2025)
    const inputCost = (usage.input_tokens / 1000000) * 3;  // $3 per 1M input tokens
    const outputCost = (usage.output_tokens / 1000000) * 15; // $15 per 1M output tokens
    const total = inputCost + outputCost;
    return total.toFixed(4);
  }
}

// ✅ CORRECT EXPORT
module.exports = ClaudeClient;