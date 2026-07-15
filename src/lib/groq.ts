import Groq from "groq-sdk";
import { Message, FileInfo } from "@/types";

import { ChatCompletionContentPart } from "groq-sdk/resources/chat/completions";

function buildSystemPrompt(siteName: string, userName: string): string {
  return `أنت ${siteName}، مساعد ذكاء اصطناعي متطور. اسمك ${siteName} وليس ChatGPT أو Claude أو Gemini أو أي مساعد آخر. أنت المساعد الرسمي الحصري لموقع ${siteName}.

معلومات عنك:
- اسمك: ${siteName}
- مطورك: Mahmoud Ahmed Saeed
- مهمتك: مساعدة المستخدم في البرمجة، الدراسة، تحليل الصور والملفات، الكتابة، والإجابة عن مختلف الأسئلة

شخصيتك:
- ودود ومحترم
- تستخدم اللغة العربية الفصحى بشكل أساسي
- تتحدث باسم المستخدم (${userName}) عند مخاطبته
- تقدم إجابات دقيقة ومفيدة
- تستخدم Markdown لتنسيق الإجابات
- تحلل الملفات والصور بشكل دقيق

تذكر دائماً:
- أنت ${siteName} وليس ChatGPT أو Claude أو Gemini أو أي مساعد آخر
- لا تقل أبداً أنك تابع لـ OpenAI أو Google أو أي شركة أخرى
- أنت مساعد مستقل تم تطويره بواسطة Mahmoud Ahmed Saeed`;
}

function buildUserContent(
  content: string,
  files?: FileInfo[],
  images?: string[]
): string | ChatCompletionContentPart[] {
  const parts: ChatCompletionContentPart[] = [];

  if (content) {
    parts.push({ type: "text", text: content });
  }

  if (files) {
    for (const file of files) {
      parts.push({
        type: "text",
        text: `[الملف: ${file.name} (${file.type})]\n\nمحتوى الملف:\n\`\`\`\n${file.content}\n\`\`\``,
      });
    }
  }

  if (images) {
    for (const img of images) {
      parts.push({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${img}`, detail: "high" },
      });
    }
  }

  return parts.length === 1 ? parts[0].text! : parts;
}

function buildGroqMessages(
  messages: Message[],
  siteName: string,
  userName: string,
  extraFiles?: FileInfo[],
  extraImages?: string[]
): Groq.Chat.Completions.ChatCompletionMessageParam[] {
  const groqMessages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt(siteName, userName) },
  ];

  for (const msg of messages) {
    if (msg.role === "user") {
      groqMessages.push({
        role: "user",
        content: buildUserContent(msg.content, msg.files, msg.images),
      });
    } else {
      groqMessages.push({ role: "assistant", content: msg.content });
    }
  }

  // Merge extra files/images into last user message
  if ((extraFiles && extraFiles.length > 0) || (extraImages && extraImages.length > 0)) {
    const lastMsg = groqMessages[groqMessages.length - 1];
    if (lastMsg?.role === "user") {
      const existing = lastMsg.content;
      const parts: ChatCompletionContentPart[] =
        typeof existing === "string"
          ? [{ type: "text", text: existing }]
          : [...existing];

      if (extraFiles) {
        for (const f of extraFiles) {
          parts.push({
            type: "text",
            text: `[الملف: ${f.name} (${f.type})]\n\nمحتوى الملف:\n\`\`\`\n${f.content}\n\`\`\``,
          });
        }
      }
      if (extraImages) {
        for (const img of extraImages) {
          parts.push({
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${img}`, detail: "high" },
          });
        }
      }
      lastMsg.content = parts;
    }
  }

  return groqMessages;
}

export async function sendMessage(
  messages: Message[],
  files: FileInfo[],
  images: string[],
  siteName: string,
  userName: string,
  apiKey: string,
  model: string
): Promise<string> {
  const groq = new Groq({ apiKey });

  const groqMessages = buildGroqMessages(messages, siteName, userName, files, images);

  const completion = await groq.chat.completions.create({
    model: model || "openai/gpt-oss-120b",
    messages: groqMessages,
    temperature: 0.7,
    max_tokens: 4096,
    top_p: 1,
    stream: false,
  });

  return completion.choices[0]?.message?.content || "عذراً، لم أتمكن من توليد رد.";
}

export async function sendMessageStream(
  messages: Message[],
  files: FileInfo[],
  images: string[],
  siteName: string,
  userName: string,
  apiKey: string,
  model: string
): Promise<ReadableStream> {
  const groq = new Groq({ apiKey });

  const groqMessages = buildGroqMessages(messages, siteName, userName, files, images);

  const stream = await groq.chat.completions.create({
    model: model || "openai/gpt-oss-120b",
    messages: groqMessages,
    temperature: 0.7,
    max_tokens: 4096,
    top_p: 1,
    stream: true,
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`
              )
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: "خطأ في بث الرد" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });
}
