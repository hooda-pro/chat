import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (days === 1) {
    return "أمس " + date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (days < 7) {
    return date.toLocaleDateString("ar-SA", { weekday: "long" });
  } else {
    return date.toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
    });
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function getFileIcon(type: string): string {
  if (type.includes("pdf")) return "file-text";
  if (type.includes("word") || type.includes("doc")) return "file-text";
  if (type.includes("excel") || type.includes("sheet") || type.includes("xls")) return "file-spreadsheet";
  if (type.includes("csv")) return "file-spreadsheet";
  if (type.includes("json")) return "file-code";
  if (type.includes("zip") || type.includes("rar")) return "archive";
  if (type.includes("text") || type.includes("txt")) return "file";
  if (type.includes("image")) return "image";
  return "file";
}

export function isAllowedFileType(file: File): boolean {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "text/plain",
    "application/json",
    "application/zip",
    "application/x-zip-compressed",
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
  ];
  return allowedTypes.includes(file.type);
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export const MAX_FILE_SIZE = 20 * 1024 * 1024;
