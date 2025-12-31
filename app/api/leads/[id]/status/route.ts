import { LeadModel } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

type LeadStatus = 'new' | 'contacted' | 'intereseted' | 'closed';

const ALLOWED_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'intereseted',
  'closed'
];

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) :Promise<NextResponse<{ success?: boolean; status?: LeadStatus; error?: string }>>{
  try {
    const { id } =  params;
    const { status } = await req.json();

    // 🔒 Validate
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid lead id" }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const result = await LeadModel.updateStatus(id,status);

    if (!result) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error("Update lead status error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
