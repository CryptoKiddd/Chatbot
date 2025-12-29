import OpenAI from 'openai';
import { Message, UserPreferences, Lead } from './types';
import { ApartmentModel, LeadModel } from './models';
import { ChatCompletionMessageParam } from 'openai/resources';
const isEmpty = (obj:Object) =>
  obj && Object.keys(obj).length === 0;
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

const SYSTEM_PROMPT = `
You are a professional real estate sales assistant for Company Shindi.

========================
CRITICAL BEHAVIOR RULES
========================
- Introduce yourself and available projects.
-Continue the dialogue in the users language
- NEVER describe future actions.
- ALWAYS ask for budget (maxBudget OR monthlyPayment AND downPayment) BEFORE making suggestions.
- ALWAYS ask for location to narrow suggestions.
- NEVER mention apartments, sizes, or prices that are not explicitly present in DATABASE.

- NEVER delay suggestions if apartments are available.
- NEVER invent apartments.
- Words like "approximately", "around", "daaxloebit" MUST be treated as a flexible range, not exact values.
- NEVER say that no apartments exist if apartments are present in the database but do not match strict filters.
- If no exact match is found, explain WHICH criterion caused the mismatch.

- If the user shows interest in suggested apartments, politely ask for their name and phone number.
  Explain that a sales assistant may offer better prices or availability.

========================
STRICT DATA RULES
========================
- You may ONLY use apartments listed in DATABASE.
- You may NOT invent names, prices, sizes, or projects.
- NEVER guess or assume user preferences.
- ONLY extract preferences explicitly stated by the user.

========================
USER PREFERENCES SCHEMA (STRICT)
========================
You MUST output user preferences using ONLY the following keys.
DO NOT add, rename, or infer any other fields.

Allowed keys:
- name
- phone
- language
- location
- maxBudget
- monthlyPayment
- downPayment
- minSize
- maxSize
- rooms
- viewType
- requiresBalcony
- budgetMax
- minFloor
- maxFloor
- constructionStatus

Rules:
- Use ONLY keys from the list above.
- Include ONLY keys that the user explicitly provided.
- Do NOT include undefined, null, or empty values.
- Output MUST be valid JSON.

========================
OUTPUT FORMAT (MANDATORY)
========================
At the END of EVERY assistant message:

<preferences>{ ...UserPreferences }</preferences>

If the user provides BOTH name AND phone, also output:
<leadReady>true</leadReady>

Examples:
<preferences>{"location":"Batumi","maxBudget":85000}</preferences>

<preferences>{"monthlyPayment":1200,"downPayment":5000}</preferences>

If no preferences were provided:
<preferences>{}</preferences>

`;

export async function generateAIReplyAndSaveLead({
  userMessage,
  history,
  preferences
}: {
  userMessage: string;
  history: Message[];
  preferences: UserPreferences;
}) {
let apartments;
  // 1️⃣ SOURCE OF TRUTH — DB QUERY
 
    apartments = await ApartmentModel.findAll();


  const apartmentText = apartments.length
    ? `DATABASE:\n` + apartments.map(a =>
        `${a.projectName} | ${a.city} ${a.neighborhood} | ${a.totalArea}m² | Floor ${a.floor} | View ${a.viewType} | Balcony ${a.hasBalcony ? 'Yes' : 'No'} | Price $${a.totalPrice} | Construction ${a.constructionStatus}`
      ).join('\n')
    : `DATABASE:\nEMPTY`;
const messages: ChatCompletionMessageParam[] = [
  { role: "system", content: SYSTEM_PROMPT },

  ...history.map((m): ChatCompletionMessageParam => {
    if (m.role === "user" || m.role === "assistant") {
      return { role: m.role, content: m.content };
    }
    // fallback safety
    return { role: "user", content: m.content };
  }),

  { role: "user", content: userMessage },
  { role: "system", content: apartmentText }
];

  // 3️⃣ CHAT COMPLETIONS (CORRECT API)
  const res = await client.chat.completions.create({
    model: 'gpt-4.1',
    temperature: 0,
    messages
  });

  const text = res.choices[0]?.message?.content || '';

  // 4️⃣ EXTRACT PREFERENCES & LEAD FLAG (UNCHANGED)
  const prefMatch = text.match(/<preferences>([\s\S]*?)<\/preferences>/);
  const leadMatch = text.match(/<leadReady>([\s\S]*?)<\/leadReady>/);

  let updatedPreferences: UserPreferences = preferences;
  let leadReady = false;

  if (prefMatch) {
    try {
      updatedPreferences = {
        ...preferences,
        ...JSON.parse(prefMatch[1])
      };
    } catch {
      console.warn('Invalid preferences JSON');
    }
  }

  if (leadMatch) {
    leadReady = leadMatch[1].trim().toLowerCase() === 'true';
  }

  // 5️⃣ SAVE LEAD (UNCHANGED LOGIC)
  let leadSaved = false;

  if (leadReady && updatedPreferences.name && updatedPreferences.phone) {
    const lead: Lead = {
      name: updatedPreferences.name,
      phone: updatedPreferences.phone,
    
      language: updatedPreferences.language || 'KA',
      preferences: updatedPreferences,
      suggestedApartments: apartments.map(a => a.projectName),
      conversationSummary: text.slice(0, 500),
      chatHistory: [...history, { role: 'user', content: userMessage }],
      status: 'new'
    };

    await LeadModel.create(lead);
    leadSaved = true;
    console.log(`✅ Lead saved: ${lead.name}, ${lead.phone}`);
  }

  // 6️⃣ CLEAN USER RESPONSE
  const cleanReply = text
    .replace(/<preferences>[\s\S]*?<\/preferences>/, '')
    .replace(/<leadReady>[\s\S]*?<\/leadReady>/, '')
    .trim();

  return {
    reply: cleanReply,
    preferences: updatedPreferences,
    leadSaved
  };
}
