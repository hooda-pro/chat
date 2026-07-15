"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  RefreshCw,
  Edit3,
  User,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Message } from "@/types";
import { cn, formatTimestamp } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  onEdit?: () => void;
}

export default function MessageBubble({
  message,
  onRegenerate,
  onEdit,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isWelcome = message.id === "welcome";

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = message.content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [message.content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-start gap-3 px-4 py-3 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      dir="rtl"
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser
            ? "bg-gradient-to-br from-primary-500 to-blue-600"
            : "bg-gradient-to-br from-primary-500 to-purple-600"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "max-w-[85%] md:max-w-[75%] space-y-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 message-enter",
            isUser
              ? "bg-primary-600/20 border border-primary-500/20 rounded-bl-sm"
              : "glass rounded-br-sm",
            isWelcome && "bg-surface-900/40 border border-primary-500/10"
          )}
        >
          {isUser ? (
            <p className="text-surface-100 leading-relaxed whitespace-pre-wrap text-[15px]">
              {message.content}
            </p>
          ) : (
            <div className="prose prose-sm max-w-none text-surface-200 leading-relaxed [&_*]:text-surface-200 [&_pre]:bg-surface-900 [&_pre]:border [&_pre]:border-surface-700/50 [&_th]:bg-surface-800 [&_th]:text-surface-200 [&_td]:text-surface-300 [&_blockquote]:text-surface-400 [&_code]:bg-surface-800 [&_a]:text-primary-400">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeRaw]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const inline = !match;
                    return !inline ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: "8px",
                          fontSize: "13px",
                          background: "rgb(15, 23, 42)",
                        }}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Attached Images */}
          {message.images && message.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {message.images.map((img, i) => (
                <img
                  key={i}
                  src={`data:image/jpeg;base64,${img}`}
                  alt={`صورة ${i + 1}`}
                  className="max-w-[200px] max-h-[200px] rounded-lg object-cover border border-surface-700/50"
                />
              ))}
            </div>
          )}

          {/* Attached Files */}
          {message.files && message.files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {message.files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 bg-surface-800/80 rounded-lg border border-surface-700/30 text-sm"
                >
                  <span className="text-surface-400 truncate max-w-[120px]">
                    {file.name}
                  </span>
                  <span className="text-surface-500 text-xs">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions & Timestamp */}
        <div
          className={cn(
            "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            isUser ? "justify-start" : "justify-end"
          )}
        >
          <span className="text-[11px] text-surface-500 px-2">
            {formatTimestamp(message.timestamp)}
          </span>

          {!isUser && !isWelcome && (
            <>
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-surface-800 text-surface-500 hover:text-surface-300 transition-colors"
                title="نسخ"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1 rounded hover:bg-surface-800 text-surface-500 hover:text-surface-300 transition-colors"
                  title="إعادة توليد"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}

          {isUser && onEdit && (
            <button
              onClick={onEdit}
              className="p-1 rounded hover:bg-surface-800 text-surface-500 hover:text-surface-300 transition-colors"
              title="تعديل"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
