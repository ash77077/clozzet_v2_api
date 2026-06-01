import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { AnalyzeCustomerDto } from './dto/analyze-customer.dto';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class AiService {
  private readonly client: Anthropic;
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async analyzeCustomer(dto: AnalyzeCustomerDto): Promise<Record<string, any>> {
    const { customer, reply_language } = dto;

    const systemPrompt = `You are an expert CRM sales assistant for a fashion/clothing business in Armenia.
Analyze customer notes written in Armenian, English, or mixed Armenian-English.
You understand Armenian business culture and seasonal buying patterns.
Return ONLY valid JSON, no other text, no markdown code blocks.
JSON structure:
{
  "status": "hot lead"|"warm lead"|"cold lead"|"loyal customer"|"new contact"|"at risk",
  "urgency": <number 1-10>,
  "sentiment": "positive"|"neutral"|"hesitant"|"negative",
  "detected_language": "Armenian"|"English"|"Mixed",
  "summary": "<2-3 sentences in ${reply_language}>",
  "tags": ["<tag1>","<tag2>","<tag3>"],
  "next_action": "<specific recommended action in ${reply_language}>",
  "action_type": "call"|"nurture"|"close"|"alert"
}`;

    const userMessage = `Customer: ${customer.name}
Notes: ${customer.notes || 'No notes'}
Last contact: ${customer.last_contact_date || 'Never'}
Order history: ${JSON.stringify(customer.order_history)}
Tags: ${customer.tags.join(', ') || 'None'}`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const result = JSON.parse(text);
      result.analyzed_at = new Date().toISOString();
      return result;
    } catch (error) {
      this.logger.error('analyzeCustomer failed', (error as any)?.message ?? error);
      throw new InternalServerErrorException((error as any)?.message ?? 'AI analysis failed');
    }
  }

  async chat(dto: ChatDto): Promise<{ reply: string }> {
    const systemPrompt = `You are an expert CRM sales assistant for a fashion/clothing business in Armenia called Clozzet.
You help sales teams manage customers, plan follow-ups, identify opportunities, and increase orders.
You understand Armenian and English perfectly. Reply in the same language the user writes in.
You know about Armenian holidays and seasons that affect fashion buying:
- New Year / Christmas (Dec 25 - Jan 14): highest buying season
- Spring collection season (March-April)
- Vardavar, Navasard, and other Armenian cultural dates
When you have customer context, use it to give specific advice.
Keep answers concise, practical, and actionable.
When drafting messages for Armenian customers, write naturally in Armenian.${
      dto.customer_context
        ? `\n\nCurrent customer context:\n${JSON.stringify(dto.customer_context, null, 2)}`
        : ''
    }`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages: dto.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const reply =
        response.content[0].type === 'text' ? response.content[0].text : '';
      return { reply };
    } catch (error) {
      this.logger.error('chat failed', (error as any)?.message ?? error);
      throw new InternalServerErrorException((error as any)?.message ?? 'AI chat failed');
    }
  }
}
