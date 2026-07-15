"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import WelcomeScreen from "@/components/WelcomeScreen";
import ChatInterface from "@/components/ChatInterface";
import Sidebar from "@/components/Sidebar";
import FileUpload from "@/components/FileUpload";
import ThemeToggle from "@/components/ThemeToggle";
import { useChat } from "@/hooks/useChat";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";
import type { FileInfo } from "@/types";

const SITE_NAME =
  (typeof process !== "undefined" &&
    process.env?.NEXT_PUBLIC_SITE_NAME) ||
  "NovaMind AI";

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<FileInfo[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { value: userName, setValue: setUserName, isLoaded: nameLoaded } =
    useLocalStorage<string>("novamind-username", "");

  const { value: theme, setValue: setTheme, isLoaded: themeLoaded } =
    useLocalStorage<"dark" | "light">("novamind-theme", "dark");

  const {
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
    isLoaded: chatLoaded,
  } = useChat(userName, SITE_NAME);

  // Apply theme
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  const handleStart = useCallback(
    (name: string) => {
      setUserName(name);
      setShowWelcome(false);
      createNewConversation();
    },
    [setUserName, createNewConversation]
  );

  const handleLogout = useCallback(() => {
    setUserName("");
    setShowWelcome(true);
  }, [setUserName]);

  const handleSend = useCallback(
    async (content: string, files?: FileInfo[], images?: string[]) => {
      const allFiles = [...pendingFiles, ...(files || [])];
      const allImages = [...pendingImages, ...(images || [])];

      if (allFiles.length > 0 || allImages.length > 0) {
        await sendMessage(content, allFiles, allImages);
        setPendingFiles([]);
        setPendingImages([]);
      } else {
        await sendMessage(content, [], []);
      }
    },
    [sendMessage, pendingFiles, pendingImages]
  );

  const handleRegenerate = useCallback(() => {
    if (
      currentConversation &&
      currentConversation.messages.length >= 2
    ) {
      const messages = currentConversation.messages;
      const lastUserMsg = [...messages]
        .reverse()
        .find((m) => m.role === "user");
      if (lastUserMsg) {
        sendMessage(
          lastUserMsg.content,
          lastUserMsg.files || [],
          lastUserMsg.images || []
        );
      }
    }
  }, [currentConversation, sendMessage]);

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      const fileInfos: FileInfo[] = [];
      const imageBases: string[] = [];

      for (const file of files) {
        if (file.type.startsWith("image/")) {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              resolve(result.split(",")[1]);
            };
            reader.readAsDataURL(file);
          });
          imageBases.push(base64);
        } else {
          const content = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            if (
              file.type.includes("text") ||
              file.type.includes("json") ||
              file.type.includes("csv")
            ) {
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsText(file);
            } else {
              reader.onload = (e) => {
                const result = e.target?.result as string;
                resolve(result.split(",")[1] || result);
              };
              reader.readAsDataURL(file);
            }
          });
          fileInfos.push({
            name: file.name,
            type: file.type,
            size: file.size,
            content,
          });
        }
      }

      if (fileInfos.length > 0 || imageBases.length > 0) {
        if (imageBases.length > 0) {
          await sendMessage(
            `[تم رفع ${imageBases.length} صورة]`,
            fileInfos,
            imageBases
          );
        } else {
          await sendMessage(
            `[تم رفع ${fileInfos.length} ملف]`,
            fileInfos,
            []
          );
        }
      }
    },
    [sendMessage]
  );

  const handleImageSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        const imageBases: string[] = [];

        for (const file of files) {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const result = ev.target?.result as string;
              resolve(result.split(",")[1]);
            };
            reader.readAsDataURL(file);
          });
          imageBases.push(base64);
        }

        if (imageBases.length > 0) {
          await sendMessage(
            `[تم رفع ${imageBases.length} صورة للتحليل]`,
            [],
            imageBases
          );
        }
      }
    },
    [sendMessage]
  );

  // Wait for all data to load
  if (!nameLoaded || !themeLoaded || !chatLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 text-primary-500" />
        </motion.div>
      </div>
    );
  }

  if (showWelcome || !userName) {
    return (
      <WelcomeScreen
        onStart={handleStart}
        initialName={userName}
        siteName={SITE_NAME}
      />
    );
  }

  return (
    <div
      className={cn(
        "h-screen flex overflow-hidden bg-surface-950 text-surface-50 transition-colors duration-300",
        "light:bg-surface-50 light:text-surface-900"
      )}
      dir="rtl"
    >
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelect={(id) => {
          setCurrentConversationId(id);
          setSidebarOpen(false);
        }}
        onNew={() => {
          createNewConversation();
          setSidebarOpen(false);
        }}
        onDelete={deleteConversation}
        onRename={renameConversation}
        onClose={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
        onLogout={handleLogout}
        userName={userName}
      />

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          sidebarOpen ? "lg:mr-[300px]" : "mr-0"
        )}
      >
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-surface-800/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-surface-800/50 text-surface-400 hover:text-surface-200 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-surface-300">
              <span className="gradient-text">{SITE_NAME}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto">
          <ChatInterface
            messages={currentConversation?.messages || []}
            isLoading={isLoading}
            streamingContent={streamingContent}
            onSend={handleSend}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onFileUploadClick={() => setShowFileUpload(true)}
            onImageUploadClick={() => imageInputRef.current?.click()}
            onRegenerate={handleRegenerate}
            siteName={SITE_NAME}
            userName={userName}
          />
        </main>
      </div>

      {/* Hidden image input */}
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleImageSelect}
      />

      {/* File Upload Modal */}
      <FileUpload
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onFilesSelected={handleFilesSelected}
      />
    </div>
  );
}
