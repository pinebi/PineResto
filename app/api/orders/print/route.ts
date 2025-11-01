import { NextResponse } from 'next/server';
import { printOrder } from '@/lib/printer';

export async function POST(request: Request) {
  try {
    const order = await request.json();
    await printOrder(order);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order print API error:', error);
    return NextResponse.json({ error: 'Failed to print order' }, { status: 500 });
  }
}











