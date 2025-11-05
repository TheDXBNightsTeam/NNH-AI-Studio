// claudeClient.js
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeCodeWithClaude(prompt) {
  try {
    const response = await client.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4096,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = response.content[0]?.text || "";
    return { success: true, text };
  } catch (error) {
    console.error("Claude API Error:", error);
    return { success: false, error: error.message };
  }
}