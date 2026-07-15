export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  files?: FileInfo[];
  images?: string[];
}

export interface FileInfo {
  name: string;
  type: string;
  size: number;
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface UserPreferences {
  name: string;
  theme: "dark" | "light";
  sidebarOpen: boolean;
}
