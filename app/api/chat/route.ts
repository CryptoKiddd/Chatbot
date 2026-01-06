import { NextRequest, NextResponse } from 'next/server';
import { generateAIReplyAndSaveLead } from '@/lib/openai';
import { SessionModel } from '@/lib/models';
import { Session } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const { message, sessionId } = await req.json();


  const id = sessionId || crypto.randomUUID();

  // 🔹 Load or create session
  let session: Session | null = await SessionModel.findById(id);

  if (!session) {
    session = {
      sessionId: id,
      preferences: {},
      conversationHistory: [],
      leadCaptured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    SessionModel.create(session)
  }

  // 🔹 Append user message
  session.conversationHistory.push({
    role: 'user',
    content: message,
    timestamp: new Date(),
  });

  // 🔹 Call AI + lead function
  const { reply, preferences, leadSaved } = await generateAIReplyAndSaveLead({
    userMessage: message,
    history: session.conversationHistory.slice(0, -1),
    preferences: session.preferences,
  });

  // 🔹 Update session
  session.preferences = { ...session.preferences, ...preferences };
  session.conversationHistory.push({
    role: 'assistant',
    content: reply,
    timestamp: new Date(),
  });

  if (leadSaved) {
    session.leadCaptured = true;
    revalidatePath("/")
  }

  session.updatedAt = new Date();

  // 🔹 Persist session
  await SessionModel.update(id, {
    preferences: session.preferences,
    conversationHistory: session.conversationHistory,
    leadCaptured: session.leadCaptured,
    updatedAt: session.updatedAt,
  });

  return NextResponse.json({
    message: reply,
    preferences: session.preferences,
    sessionId: id,
    leadCaptured: session.leadCaptured,
  });
}
