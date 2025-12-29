import { NextRequest, NextResponse } from 'next/server';
import { ApartmentModel } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    const { preferences } = await req.json();

    const apartments = await ApartmentModel.search(preferences);

    return NextResponse.json({
      apartments: apartments.map((apt: any) => ({
        ...apt,
        _id: apt._id.toString()
      }))
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
