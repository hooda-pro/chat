"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Paperclip,
  Image,
  Menu,
  Sparkles,
  Pencil,
  X,
  StopCircle,
} from "lucide-react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { cn } from "@/lib/utils";
import type { Message, FileInfo } from "@/types";

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  streamingContent: string;
  onSend: (content: string, files?: FileInfo[], images?: string[]) => void;
  onToggleSidebar: () => void;
  onFileUploadClick: () => void;
  onImageUploadClick: () => void;
  onRegenerate: () => void;
  siteName: string;
  userName: string;
}

export default function ChatInterface({
  messages,
  isLoading,
  streamingContent,
  onSend,
  onToggleSidebar,
  onFileUploadClick,
  onImageUploadClick,
  onRegenerate,
  siteName,
  userName,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(
        inputRef.current.scrollHeight,
        200
      ) + "px";
    }
  }, [input]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (input.trim() && !isLoading) {
        onSend(input.trim());
        setInput("");
      }
    },
    [input, isLoading, onSend]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleEditMessage = (index: number) => {
    const userMessages = messages.filter((m) => m.role === "user");
    const msg = userMessages[index];
    if (msg) {
      setEditingIndex(index);
      setEditContent(msg.content);
    }
  };

  const submitEdit = () => {
    if (editContent.trim()) {
      const userMessages = messages.filter((m) => m.role === "user");
      const msg = userMessages[editingIndex!];
      onSend(editContent.trim(), msg.files, msg.images);
      setEditingIndex(null);
      setEditContent("");
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      const imageFiles: string[] = [];
      const otherFiles: FileInfo[] = [];
      let hasFiles = false;

      for (const file of files) {
        if (file.type.startsWith("image/")) {
          hasFiles = true;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const result = ev.target?.result as string;
            imageFiles.push(result.split(",")[1]);
            if (imageFiles.length + otherFiles.length === files.length) {
              // Process together - for simplicity, send with next message
            }
          };
          reader.readAsDataURL(file);
        } else if (
          file.type.includes("pdf") ||
          file.type.includes("word") ||
          file.type.includes("doc") ||
          file.type.includes("text") ||
          file.type.includes("excel") ||
          file.type.includes("sheet") ||
          file.type.includes("csv") ||
          file.type.includes("json") ||
          file.type.includes("zip")
        ) {
          hasFiles = true;
          const reader = new FileReader();
          reader.onload = (ev) => {
            otherFiles.push({
              name: file.name,
              type: file.type,
              size: file.size,
              content: ev.target?.result as string,
            });
          };
          if (file.type.includes("text") || file.type.includes("json") || file.type.includes("csv")) {
            reader.readAsText(file);
          } else {
            reader.readAsDataURL(file);
          }
        }
      }

      if (hasFiles) {
        // Store files temporarily - in a real app, we'd handle this better
        // For now, just show a simple prompt
        setInput("لقد قمت بسحب وإفلات بعض الملفات. أرسل رسالتك لتحليلها.");
        // Actually trigger upload
        if (fileInputRef.current) {
          const dt = new DataTransfer();
          files.forEach((f) => dt.items.add(f));
          fileInputRef.current.files = dt.files;
          // We'll handle the actual upload through the parent
        }
      }
    },
    []
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  // Get the actual user messages for edit indexing
  const userMessages = messages.filter((m) => m.role === "user");

  return (
    <div
      className="flex flex-col h-full relative"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-primary-500/10 backdrop-blur-sm border-2 border-dashed border-primary-500 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <Paperclip className="w-12 h-12 mx-auto mb-3 text-primary-400" />
            <p className="text-primary-300 text-lg font-medium">
              أفلت الملفات هنا
            </p>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-4">
        {messages.length === 1 && messages[0].id === "welcome" && (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center max-w-md"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 p-[2px]">
                <div className="w-full h-full rounded-2xl bg-surface-950 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-primary-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3">
                <span className="gradient-text">أهلاً بك يا {userName}</span>
              </h2>
              <p className="text-surface-400 leading-relaxed">
                أنا <strong>{siteName}</strong>، مساعدك الذكي. يمكنني مساعدتك في
                البرمجة، الدراسة، تحليل الصور والملفات، الكتابة، والإجابة عن
                مختلف الأسئلة.
              </p>
            </motion.div>
          </div>
        )}

        {messages.length > 1 && (
          <div className="space-y-1">
            {messages.map((msg, index) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onRegenerate={
                  index === messages.length - 1 && msg.role === "assistant"
                    ? onRegenerate
                    : undefined
                }
                onEdit={
                  msg.role === "user"
                    ? () => {
                        const userIdx = userMessages.indexOf(msg);
                        if (userIdx >= 0) handleEditMessage(userIdx);
                      }
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {/* Streaming content */}
        {streamingContent && (
          <MessageBubble
            message={{
              id: "streaming",
              role: "assistant",
              content: streamingContent,
              timestamp: Date.now(),
            }}
          />
        )}

        {/* Typing indicator */}
        {isLoading && !streamingContent && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Edit mode indicator */}
      {editingIndex !== null && (
        <div className="px-4 py-2 bg-primary-500/10 border-t border-primary-500/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-primary-400 flex items-center gap-1">
              <Pencil className="w-3.5 h-3.5" />
              تعديل الرسالة
            </span>
            <button
              onClick={() => setEditingIndex(null)}
              className="text-surface-400 hover:text-surface-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 pb-4 pt-2">
        <div className="glass rounded-2xl border border-surface-700/30 max-w-4xl mx-auto">
          {editingIndex !== null ? (
            <div className="p-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitEdit();
                  }
                }}
                className="w-full bg-transparent text-surface-100 placeholder-surface-500 resize-none focus:outline-none px-3 py-2 max-h-[200px] text-[15px] leading-relaxed"
                rows={3}
                dir="rtl"
              />
              <div className="flex justify-between items-center px-3 pb-2">
                <span className="text-xs text-surface-500">
                  Enter للإرسال • Shift+Enter لسطر جديد
                </span>
                <button
                  onClick={submitEdit}
                  disabled={!editContent.trim()}
                  className="px-4 py-1.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
                >
                  حفظ
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-end gap-2 p-2">
              {/* Action buttons */}
              <div className="flex items-center gap-1 pb-1">
                <button
                  type="button"
                  onClick={onFileUploadClick}
                  className="p-2 rounded-lg hover:bg-surface-800 text-surface-500 hover:text-surface-300 transition-colors"
                  title="رفع ملف"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 rounded-lg hover:bg-surface-800 text-surface-500 hover:text-surface-300 transition-colors"
                  title="رفع صورة"
                >
                  <Image className="w-5 h-5" />
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      // We'll pass this through a callback to the parent
                    }
                  }}
                />
              </div>

              {/* Text input */}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب رسالتك هنا..."
                  className="w-full bg-transparent text-surface-100 placeholder-surface-500 resize-none focus:outline-none px-3 py-2 max-h-[200px] text-[15px] leading-relaxed"
                  rows={1}
                  dir="rtl"
                  disabled={isLoading}
                />
              </div>

              {/* Send button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300 shrink-0",
                  input.trim() && !isLoading
                    ? "bg-gradient-to-l from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/20"
                    : "bg-surface-800 text-surface-500"
                )}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </form>
          )}

          {/* Footer hint */}
          <div className="px-4 pb-2 text-center">
            <p className="text-[11px] text-surface-600">
              {siteName} يمكنه ارتكاب الأخطاء. يُرجى التحقق من المعلومات المهمة.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="fixed top-4 right-4 z-20 p-2.5 glass rounded-xl lg:hidden"
      >
        <Menu className="w-5 h-5 text-surface-300" />
      </button>
    </div>
  );
}
