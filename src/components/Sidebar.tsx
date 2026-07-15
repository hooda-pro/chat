"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import type { Conversation } from "@/types";
import { cn, formatTimestamp, truncateText } from "@/lib/utils";

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onClose: () => void;
  isOpen: boolean;
  onLogout: () => void;
  userName: string;
}

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  onClose,
  isOpen,
  onLogout,
  userName,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRename = (id: string) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const startEditing = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title === "محادثة جديدة" ? "" : conv.title);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed top-0 right-0 z-40 h-full w-[300px]",
              "bg-surface-950/95 backdrop-blur-xl border-l border-surface-800/50",
              "flex flex-col"
            )}
            dir="rtl"
          >
            {/* Header */}
            <div className="p-4 border-b border-surface-800/50">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-surface-400">
                  {userName}
                </span>
              </div>

              <button
                onClick={onNew}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-l from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-primary-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>محادثة جديدة</span>
              </button>

              {/* Search */}
              <div className="relative mt-3">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في المحادثات..."
                  className="w-full pr-10 pl-4 py-2 bg-surface-900/80 border border-surface-700/50 rounded-xl text-surface-200 text-sm placeholder-surface-500 focus:outline-none focus:border-primary-500/50 transition-colors"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredConversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  layout
                >
                  {editingId === conv.id ? (
                    <div className="flex items-center gap-1 px-3 py-2">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRename(conv.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="flex-1 px-3 py-1.5 bg-surface-800 border border-primary-500/50 rounded-lg text-surface-200 text-sm focus:outline-none"
                        dir="rtl"
                        placeholder="اسم المحادثة"
                      />
                      <button
                        onClick={() => handleRename(conv.id)}
                        className="p-1.5 hover:bg-surface-800 rounded-lg text-green-500 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 hover:bg-surface-800 rounded-lg text-surface-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelect(conv.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-right group",
                        conv.id === currentConversationId
                          ? "bg-primary-500/10 border border-primary-500/20"
                          : "hover:bg-surface-800/50 border border-transparent"
                      )}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0 text-surface-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-surface-200 truncate">
                          {conv.title}
                        </p>
                        <p className="text-xs text-surface-500 mt-0.5">
                          {formatTimestamp(conv.updatedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(conv);
                          }}
                          className="p-1.5 hover:bg-surface-800 rounded-lg text-surface-500 hover:text-surface-300 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(conv.id);
                          }}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-surface-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  )}
                </motion.div>
              ))}

              {filteredConversations.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-surface-500 text-sm">
                    {searchQuery
                      ? "لا توجد محادثات مطابقة"
                      : "لا توجد محادثات بعد"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-surface-800/50">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-surface-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
