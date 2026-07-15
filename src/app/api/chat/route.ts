import { NextRequest, NextResponse } from "next/server";
import { sendMessageStream } from "@/lib/groq";
import type { Message, FileInfo } from "@/types";

interface RequestFile {
  name: string;
  type: string;
  size: number;
  content: string;
}

interface RequestMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  files?: RequestFile[];
  images?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { messages, files, images, userName, siteName } =
      (await request.json()) as {
        messages: RequestMessage[];
        files?: RequestFile[];
        images?: string[];
        userName: string;
        siteName: string;
      };

    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY غير مضبوط في ملف البيئة" },
        { status: 500 }
      );
    }

    // Convert request messages to our Message type
    const typedMessages: Message[] = messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      files: m.files as FileInfo[] | undefined,
      images: m.images,
    }));

    const typedFiles: FileInfo[] = (files || []).map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
      content: f.content,
    }));

    const stream = await sendMessageStream(
      typedMessages,
      typedFiles,
      images || [],
      siteName,
      userName,
      apiKey,
      model
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "خطأ داخلي في الخادم";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
