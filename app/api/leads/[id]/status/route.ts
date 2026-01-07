
export const dynamic = 'force-dynamic';
import { LeadModel } from "@/lib/models";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

type LeadStatus = 'new' | 'contacted' | 'intereseted' | 'closed';

const ALLOWED_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'intereseted',
  'closed'
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { status } = await req.json();
    const { id } =  await params;

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

     revalidatePath('/')
    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error("Update lead status error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
