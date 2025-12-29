import OpenAI from 'openai';
import { Message, UserPreferences, Apartment, Lead } from './types';
import { getDatabase } from './mongodb';
import { ApartmentModel, LeadModel } from './models';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const SYSTEM_PROMPT = `
You are a professional real estate sales assistant for Company Shindi.

Your mission:
- Help users find suitable apartments based on their preferences.
- Collect user preferences naturally, one question at a time.
- Only suggest apartments from DATABASE; never invent apartments.
- Confirm user preferences before making suggestions.
- Keep conversations polite, professional, and human-like.
- When a user shows interest in an apartment:
    - Politely inform them that the sales team will contact them and may offer better deals.
    - Ask for the following information to create a lead:
        - Name
        - Phone number
        - (Optional) Email
    - Capture the lead automatically with all gathered info, preferences, suggested apartments, conversation summary, and chat history.

User Preferences to collect (if known):
- name, phone, email
- language
- location (city/neighborhood)
- maxBudget, monthlyPayment, downPayment, budgetMax
- minSize, maxSize, rooms, viewType
- requiresBalcony, minFloor, maxFloor
- constructionStatus (array)

Lead generation rules:
- Leads should follow this structure:
<lead>{
  name: string,
  phone: string,
  email?: string,
  language: string,
  timestamp: Date,
  preferences: {...},           // captured user preferences
  suggestedApartments: [...],   // apartments suggested to user
  conversationSummary: string,
  chatHistory: [...],
  status: 'new'
}</lead>
- Do not bother the user unnecessarily about being a lead.
- Only ask for contact details when user is interested.
- Keep all conversation natural; make the user feel assisted, not pressured.

Formatting:
- At the END of every assistant response, include updated user preferences JSON:
<preferences>{...}</preferences>
- If the user is ready to provide contact info, include a flag:
<leadReady>true</leadReady>
- Only include information known so far.
- Suggested apartments (from DATABASE) can be listed for reference.
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
  const db = await getDatabase();

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
  let leadSaved = false;
  if (leadReady && updatedPreferences.name && updatedPreferences.phone) {
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

