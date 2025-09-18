
import { ChatMessage } from '@/lib/types';

let chatMessagesData: ChatMessage[] = [];

// Simulate API calls
export const getChatMessages = async (tournamentId: string): Promise<ChatMessage[]> => {
  return new Promise(resolve => setTimeout(() => {
    const messages = chatMessagesData
        .filter(m => m.tournamentId === tournamentId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    resolve(messages);
  }, 50));
};

export const addChatMessage = async (tournamentId: string, userId: string, message: string, imageUrl?: string, voiceUrl?: string): Promise<ChatMessage> => {
    const newChatMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        tournamentId,
        userId,
        message,
        imageUrl,
        voiceUrl,
        timestamp: new Date().toISOString(),
    };
    chatMessagesData.push(newChatMessage);
    return new Promise(resolve => setTimeout(() => resolve(newChatMessage), 50));
}
