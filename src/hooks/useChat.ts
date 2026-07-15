"use client";

import { useState, useCallback } from "react";
import { Message, Conversation, FileInfo } from "@/types";
import { useLocalStorage } from "./useLocalStorage";
import { generateId } from "@/lib/utils";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "",
  timestamp: Date.now(),
};

export function useChat(userName: string, siteName: string) {
  const { value: conversations, setValue: setConversations, isLoaded } =
    useLocalStorage<Conversation[]>("novamind-conversations", []);

  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId
  );

  const createNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: generateId(),
      title: "محادثة جديدة",
      messages: [
        {
          ...WELCOME_MESSAGE,
          content: `مرحباً يا ${userName}، كيف يمكنني مساعدتك اليوم؟`,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    return newConv.id;
  }, [userName, setConversations]);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(null);
      }
    },
    [currentConversationId, setConversations]
  );

  const renameConversation = useCallback(
    (id: string, title: string) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, title, updatedAt: Date.now() } : c
        )
      );
    },
    [setConversations]
  );

  const addMessage = useCallback(
    (conversationId: string, message: Message) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            const newMessages = [...c.messages, message];
            const title =
              c.title === "محادثة جديدة" && message.role === "user"
                ? message.content.substring(0, 50) +
                  (message.content.length > 50 ? "..." : "")
                : c.title;
            return {
              ...c,
              messages: newMessages,
              title,
              updatedAt: Date.now(),
            };
          }
          return c;
        })
      );
    },
    [setConversations]
  );

  const updateLastAssistantMessage = useCallback(
    (conversationId: string, content: string) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            const messages = [...c.messages];
            const lastIndex = messages.length - 1;
            if (lastIndex >= 0 && messages[lastIndex].role === "assistant") {
              messages[lastIndex] = {
                ...messages[lastIndex],
                content,
                timestamp: Date.now(),
              };
            }
            return { ...c, messages, updatedAt: Date.now() };
          }
          return c;
        })
      );
    },
    [setConversations]
  );

  const sendMessage = useCallback(
    async (
      content: string,
      files: FileInfo[] = [],
      images: string[] = []
    ) => {
      let convId = currentConversationId;
      if (!convId) {
        convId = createNewConversation();
      }

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content,
        timestamp: Date.now(),
        files: files.length > 0 ? files : undefined,
        images: images.length > 0 ? images : undefined,
      };

      addMessage(convId, userMessage);
      setIsLoading(true);
      setStreamingContent("");

      const conv = conversations.find((c) => c.id === convId) || {
        messages: [],
      };
      const allMessages = [...conv.messages, userMessage];

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: allMessages,
            files,
            images,
            userName,
            siteName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "فشل الاتصال بالخادم");
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const delta =
                  parsed.choices?.[0]?.delta?.content || "";
                fullContent += delta;
                setStreamingContent(fullContent);
              } catch {
                fullContent += data;
                setStreamingContent(fullContent);
              }
            }
          }
        }

        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: fullContent,
          timestamp: Date.now(),
        };

        addMessage(convId, assistantMessage);
        setStreamingContent("");
      } catch (error) {
        const errorMessage: Message = {
          id: generateId(),
          role: "assistant",
          content:
            error instanceof Error
              ? `عذراً، حدث خطأ: ${error.message}`
              : "عذراً، حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.",
          timestamp: Date.now(),
        };
        addMessage(convId, errorMessage);
      } finally {
        setIsLoading(false);
        setStreamingContent("");
      }
    },
    [
      currentConversationId,
      conversations,
      createNewConversation,
      addMessage,
      userName,
      siteName,
    ]
  );

  return {
    conversations,
    currentConversation,
    currentConversationId,
    isLoading,
    streamingContent,
    sidebarOpen,
    setSidebarOpen,
    setCurrentConversationId,
    createNewConversation,
    deleteConversation,
    renameConversation,
    sendMessage,
    addMessage,
    updateLastAssistantMessage,
    isLoaded,
  };
}
