import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const isVercel = !!process.env.VERCEL;
const PARTIDA_PATH = isVercel
  ? '/tmp/partida.json'
  : path.resolve(process.cwd(), 'src/data/partida.json');

export async function GET() {
  try {
    let data;
    try {
      data = await fs.readFile(PARTIDA_PATH, 'utf-8');
    } catch {
      // Se não existe, inicializa vazio
      await fs.writeFile(PARTIDA_PATH, JSON.stringify({}, null, 2));
      data = '{}';
    }
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: 'Could not read partida.json' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await fs.writeFile(PARTIDA_PATH, JSON.stringify(body, null, 2));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not write partida.json' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    await fs.writeFile(PARTIDA_PATH, JSON.stringify(body, null, 2));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not update partida.json' }, { status: 500 });
  }
} 