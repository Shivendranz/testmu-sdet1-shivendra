import { BaseAgent, AgentResponse } from './base-agent';

/**
 * Example agent that generates Playwright test steps from a natural-language scenario.
 */
export class TestGeneratorAgent extends BaseAgent {
  async run(scenario: string): Promise<AgentResponse> {
    return this.chat([
      {
        role: 'system',
        content:
          'You are a senior SDET. Generate concise Playwright TypeScript test steps for the given scenario. Output only executable step descriptions.',
      },
      { role: 'user', content: scenario },
    ]);
  }
}
