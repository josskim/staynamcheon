export interface ChatMessage {
  id: string;
  senderType: "visitor" | "admin";
  content: string;
  isRead: boolean;
  createdAt: string;
  clientMessageId?: string;
  delivery?: "sending" | "failed";
  error?: string;
}

export const clientMessageIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Existing primary-key uniqueness gives durable retry deduplication without a migration.
export function messageId(room: string, sender: string, key: string) {
  return `chat_${room}_${sender}_${key.toLowerCase()}`;
}

export function mergeMessages(previous: ChatMessage[], incoming: ChatMessage[]) {
  const merged = new Map(previous.map(message => [message.id, message]));
  for (const message of incoming) {
    const old = merged.get(message.id);
    merged.set(message.id, { ...message, isRead: message.isRead || !!old?.isRead });
  }
  return [...merged.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

export function failMessage(messages: ChatMessage[], id: string, error: string) {
  // A poll may have already confirmed a save whose POST response was lost.
  return messages.map(message => message.id === id && message.delivery
    ? { ...message, delivery: "failed" as const, error } : message);
}
