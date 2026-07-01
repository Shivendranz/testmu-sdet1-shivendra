import OpenAI from 'openai';
import { env } from '../utils/env';
import { logger } from '../utils/logger';

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AgentResponse {
  content: string;
  model: string;
}

/**
 * Base LLM agent â€” extend to build test-generation, self-healing, or analysis agents.
 */
export abstract class BaseAgent {
  protected readonly client: OpenAI;
  protected readonly model: string;

  constructor(model = env.llmModel) {
    if (!env.llmApiKey) {
      throw new Error('LLM_API_KEY (or OPENAI_API_KEY) is required for agent operations');
    }
    this.client = new OpenAI({ apiKey: env.llmApiKey, baseURL: env.llmBaseUrl });
    this.model = model;
  }

  protected async chat(messages: AgentMessage[]): Promise<AgentResponse> {
    logger.debug('Agent chat request', { model: this.model, messageCount: messages.length });

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
    });

    const content = completion.choices[0]?.message?.content ?? '';
    return { content, model: this.model };
  }

  abstract run(input: string): Promise<AgentResponse>;
}