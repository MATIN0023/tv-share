import { authApiRequest } from "./authenticated";

export interface AssistantMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AssistantChatPayload {
  message: string;
  locale?: string;
  history?: AssistantMessage[];
}

export interface AssistantChatResponse {
  reply: string;
  source: "mock" | "openai" | "anthropic";
  suggestions?: string[];
}

export async function sendAssistantMessage(
  payload: AssistantChatPayload
): Promise<AssistantChatResponse> {
  return authApiRequest<AssistantChatResponse>("/api/assistant/chat", {
    method: "POST",
    body: payload,
  });
}
