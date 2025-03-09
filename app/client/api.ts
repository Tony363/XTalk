import { ZagiiApi } from "./platforms/zagii";
import { User } from "@/app/store/user";

export const ROLES = ["system", "user", "assistant"] as const;
export type MessageRole = (typeof ROLES)[number];

export interface RequestMessage {
  id: string;
  role: MessageRole;
  content: string;
  type?: number;
}

export interface LLMConfig {
  model: string;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export interface ChatOptions {
  messages: RequestMessage[];
  config: LLMConfig;
  character: Record<string, any>;
  game: Record<string, any>;
  sessionId: string;
  user: User;
  nextCharacterId?: string;
  isIntercept: boolean;
  logId: string;
  chapterId: string;
  messageId?: string;
  userVoice?: string;
  onUpdate?: (message: string, chunk: string) => void;
  onFinish: (message: string, options?: any) => void;
  onNextMessage: (message: string, options?: any) => void;
  onStopAll: (reason?: string) => void;
  onError?: (err: Error) => void;
  onController?: (controller: AbortController) => void;
  onUpdateGameState?: (params: any) => void;
  onUpdateTransactionDetails(transactionDetails: any): unknown;
}

export interface LLMUsage {
  used: number;
  total: number;
}

export interface LLMModel {
  name: string;
  available: boolean;
}

export abstract class LLMApi {
  abstract chat(options: ChatOptions): Promise<void>;
}

export class ClientApi {
  public llm: LLMApi;

  constructor() {
    this.llm = new ZagiiApi();
  }
}

export const api = new ClientApi();

export function getHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-requested-with": "XMLHttpRequest",
  };

  return headers;
}
