import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook Allpes está funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}

export async function POST() {
  return NextResponse.json({
    status: 'ok',
    message: 'POST recebido com sucesso!',
    timestamp: new Date().toISOString()
  });
}