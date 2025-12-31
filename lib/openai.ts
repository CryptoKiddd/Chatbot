import OpenAI from 'openai';
import { Message, UserPreferences, LeadBase } from './types';
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
  - You may ONLY recommend apartments listed under SUGGESTED_APARTMENTS.
- You may reference FULL_DATABASE ONLY to explain availability or mismatches.
- NEVER recommend or describe apartments from FULL_DATABASE.


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
- city
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
function filterApartments(apartments: any[], prefs: UserPreferences) {
  return apartments.filter(a => {
    if (prefs.city && a.city !== prefs.city) return false;

    if (prefs.downPayment && a.minInitialInstallment > prefs.downPayment)
      return false;

    if (prefs.maxBudget && a.totalPrice > prefs.maxBudget)
      return false;

    if (prefs.minSize && a.totalArea < prefs.minSize)
      return false;

    if (prefs.maxSize && a.totalArea > prefs.maxSize)
      return false;

    if (prefs.rooms && a.rooms !== prefs.rooms)
      return false;

    return true;
  });
}


export async function generateAIReplyAndSaveLead({
  userMessage,
  history,
  preferences
}: {
  userMessage: string;
  history: Message[];
  preferences: UserPreferences;
}) {

  // 1️⃣ LOAD FULL DATABASE (SOURCE OF TRUTH)
  const allApartments = await ApartmentModel.findAll();

  // 2️⃣ BACKEND FILTERING (SUGGESTIONS ONLY)
  const suggestedApartments =filterApartments(allApartments, preferences)
  console.log("Preferences", preferences)

  // 3️⃣ FORMAT FULL DATABASE (FOR REASONING ONLY)
  const fullDatabaseText = allApartments.length
    ? `FULL_DATABASE:\n` + allApartments.map(a =>
        `${a.projectName} | ${a.city} ${a.neighborhood} | ${a.totalArea}m² | Floor ${a.floor} | View ${a.viewType} | Balcony ${a.balconySize ? a.balconySize : 'No'} | Price $${a.totalPrice} | Construction ${a.constructionStatus}`
      ).join('\n')
    : `FULL_DATABASE:\nEMPTY`;

  // 4️⃣ FORMAT SUGGESTED APARTMENTS (ONLY THESE MAY BE RECOMMENDED)
  const suggestedText = suggestedApartments.length
    ? `SUGGESTED_APARTMENTS:\n` + suggestedApartments.map(a =>
        `${a.projectName} | ${a.city} ${a.neighborhood} | ${a.totalArea}m² | Floor ${a.floor} | View ${a.viewType} | Balcony ${a.balconySize ? a.balconySize : 'No'}} | Price $${a.totalPrice} | Construction ${a.constructionStatus}`
      ).join('\n')
    : `SUGGESTED_APARTMENTS:\nNONE`;

  // 5️⃣ BUILD MESSAGES
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: fullDatabaseText },
    { role: "system", content: suggestedText },

    ...history.map((m):ChatCompletionMessageParam => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content
    })),

    { role: "user", content: userMessage }
  ];

  // 6️⃣ CALL OPENAI
  const res = await client.chat.completions.create({
    model: 'gpt-4.1',
    temperature: 0,
    messages
  });

  const text = res.choices[0]?.message?.content || '';

  // 7️⃣ EXTRACT PREFERENCES & LEAD FLAG
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

  // 8️⃣ SAVE LEAD
  let leadSaved = false;

  if (leadReady && updatedPreferences.name && updatedPreferences.phone) {
    const lead: LeadBase = {
      name: updatedPreferences.name,
      phone: updatedPreferences.phone,
      language: updatedPreferences.language || 'KA',
      preferences: updatedPreferences,

      // 🔒 ONLY SUGGESTED APARTMENTS
      suggestedApartments,
      chatHistory: [...history, { role: 'user', content: userMessage }],
      status: 'new'
    };

    await LeadModel.create(lead);
    leadSaved = true;
  }

  // 9️⃣ CLEAN USER RESPONSE
  const cleanReply = text
    .replace(/<preferences>[\s\S]*?<\/preferences>/, '')
    .replace(/<leadReady>[\s\S]*?<\/leadReady>/, '')
    .trim();

  // 🔟 RETURN UI-SAFE DATA
  return {
    reply: cleanReply,
    preferences: updatedPreferences,
    leadSaved,
  };
}

