import OpenAI from 'openai';
import { Message, UserPreferences, Apartment, Lead } from './types';
import { getDatabase } from './mongodb';
import { ApartmentModel, LeadModel } from './models';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const SYSTEM_PROMPT = `
You are a professional real estate sales assistant for Company Shindi.

========================
CRITICAL BEHAVIOR RULES
========================
- NEVER describe future actions (❌ "I will search", ❌ "I am preparing", ❌ "Once I find").
- NEVER delay suggestions if apartments are available.
- If apartments match current preferences, SUGGEST THEM IMMEDIATELY.
-If can't suggest anything based on USERS PREFERECECES, DO NOT INVENT ANY APARTMENT, just tell them that we don't have anything avaliable with their preferences
- Always act in the present: suggest, ask, explain — not plan.


========================
STRICT CONVERSATION FLOW
========================
You MUST follow this flow exactly:
STEP 0 -Introduce the company Shindi and ask for preffered language to conitnue conversation

STEP 1 — LOCATION
- Ask for the desired city or area.
- Once location is known, IMMEDIATELY inform the user what projects exist there (from DATABASE).

STEP 2 — CONSTRUCTION STATUS
- Ask what type they are looking for:
  - under construction
  - newly finished
  - fully finished
(Use constructionStatus array ONLY)

STEP 3 — PAYMENT QUESTIONS (ONLY IF UNDER CONSTRUCTION)
- Ask:
  - downPayment
  - monthlyPayment
- Do NOT ask about total budget unless user mentions it.

STEP 4 — IMMEDIATE SUGGESTIONS
- As soon as enough data exists, suggest matching apartments FROM DATABASE.
- NEVER say you are searching — just present results.

STEP 5 — PERSONALIZATION
- Ask if the user wants more personalized options.
- If YES → ask ONE question at a time:
  - minSize / maxSize
  - floor (minFloor / maxFloor)
  - viewType
  - requiresBalcony
  - rooms

STEP 6 — NO MORE QUESTIONS PATH
- If user says NO to further personalization:
  - Ask if they want the sales team to contact them for better offers.

STEP 7 — LEAD CREATION
- ONLY if the user agrees:
  - Ask for name and phone
  - Email is optional
- Generate lead ONLY after explicit interest.

========================
CRITICAL DATA CONTRACT
========================
You MUST strictly follow the UserPreferences schema.
Field names MUST match EXACTLY.

UserPreferences schema (STRICT):
{
  _id?: ObjectId,
  name?: string,
  phone?: string,
  email?: string,
  language?: string,
  location?: string,
  maxBudget?: number,
  monthlyPayment?: number,
  downPayment?: number,
  minSize?: number,
  maxSize?: number,
  rooms?: number,
  viewType?: string,
  requiresBalcony?: boolean,
  budgetMax?: number,
  minFloor?: number,
  maxFloor?: number,
  constructionStatus?: string[]
}

Rules:
- Use ONLY these keys.
- Omit unknown fields.
- Numbers must be numbers.
-Prices are in Dollars
- Booleans must be true/false.
- constructionStatus MUST be an array.

========================
SUGGESTION RULES
========================
- Only suggest apartments provided in DATABASE.
- Never invent projects.
- Present results clearly and confidently.
- If no apartments match, say so briefly and ask ONE adjustment question.

========================
OUTPUT FORMAT (MANDATORY)
========================
At the END of EVERY assistant message:

<preferences>{
  ...UserPreferences
}</preferences>

If ready to capture lead:
<leadReady>true</leadReady>

Rules:
- Valid JSON only.
- No explanations inside tags.
- No empty or undefined fields.

========================
TONE & STYLE
========================
- Confident, sales-oriented, human.
- Sounds like an experienced real estate consultant.
- Never sounds like a bot, planner, or system.
- No internal reasoning or process explanation.
`;



// Function to query apartments from MongoDB


export async function generateAIReplyAndSaveLead({
  userMessage,
  history,
  preferences
}: {
  userMessage: string;
  history: Message[];
  preferences: UserPreferences;
}) {

  // 1️⃣ Query apartments based on preferences
  const apartments = await ApartmentModel.search(preferences);

 const apartmentText = apartments.length
  ? '\n\nDATABASE:\n' + apartments
      .map(
        (a) =>
          `${a.projectName} | ${a.city} ${a.neighborhood} | ${a.totalArea}m² | ${a.rooms} rooms | Floor: ${a.floor} | View: ${a.viewType} | Balcony: ${a.hasBalcony ? 'Yes' : 'No'}${a.hasBalcony && a.balconySize ? ` (${a.balconySize}m²)` : ''} | Price: $${a.totalPrice} | Min Down: $${a.minInitialInstallment} | Monthly: $${a.monthlyPayment} for ${a.installmentDuration} months | Status: ${a.availabilityStatus} | Construction: ${a.constructionStatus}${a.expectedCompletion ? ` | Completion: ${a.expectedCompletion}` : ''} | Developer: ${a.developerName}`
      )
      .join('\n')
  : '';


  // 2️⃣ Flatten conversation for AI
  const conversationText = [
    `SYSTEM: ${SYSTEM_PROMPT}`,
    ...history.map(m => `${m.role.toUpperCase()}: ${m.content}`),
    `USER: ${userMessage}`,
    apartmentText
  ].join('\n\n');

  // 3️⃣ Call OpenAI
  const res = await client.responses.create({
    model: 'gpt-4.1',
    input: conversationText,
    max_output_tokens: 800
  });

  const text = res.output_text || '';

  // 4️⃣ Extract preferences & lead readiness
  const prefMatch = text.match(/<preferences>([\s\S]*?)<\/preferences>/);
  const leadMatch = text.match(/<leadReady>([\s\S]*?)<\/leadReady>/);

  let updatedPreferences = preferences;
  let leadReady = false;

  if (prefMatch) {
    try {
      updatedPreferences = { ...preferences, ...JSON.parse(prefMatch[1]) };
    } catch {}
  }
  if (leadMatch) leadReady = leadMatch[1].trim().toLowerCase() === 'true';

  // 5️⃣ Save lead if ready
      console.log("laed not ready", updatedPreferences)

  let leadSaved = false;
  if (leadReady && updatedPreferences.name && updatedPreferences.phone) {
    console.log("laed ready")
    const lead: Lead = {
      name: updatedPreferences.name,
      phone: updatedPreferences.phone,
      email: updatedPreferences.email,
      language: updatedPreferences.language || 'unknown',
      preferences: updatedPreferences,
      suggestedApartments: apartments.map(a => a.projectName),
      conversationSummary: text.slice(0, 500), // optional short summary
      chatHistory: [...history, { role: 'user', content: userMessage }],
      status: 'new'
    };

    await LeadModel.create(lead);
    leadSaved = true;
    console.log(`✅ Lead saved: ${lead.name}, ${lead.phone}`);
  }

  return {
    reply: text.replace(/<preferences>[\s\S]*?<\/preferences>/, '')
               .replace(/<leadReady>[\s\S]*?<\/leadReady>/, '')
               .trim(),
    preferences: updatedPreferences,
    leadSaved
  };
}

