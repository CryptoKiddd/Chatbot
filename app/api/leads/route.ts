import { NextRequest, NextResponse } from 'next/server';
import { LeadModel, SessionModel } from '@/lib/models';
import { Lead, LeadBase } from '@/lib/types';


const PHONE_REGEX = /^\+?[0-9\s-]{8,15}$/;


export async function POST(req: NextRequest) {
    const { name, phone, email, sessionId, language } = await req.json();


    if (!PHONE_REGEX.test(phone)) {
        return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });
    }


    const session = await SessionModel.findById(sessionId);
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    const newLead : LeadBase = {
        name,
        phone,
        email,
        preferences: session.preferences,
        suggestedApartments: [],
        chatHistory: session.conversationHistory,
        language,
        status:"new"
    }

    await LeadModel.create(newLead);


    return NextResponse.json({ success: true });
}