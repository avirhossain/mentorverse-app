import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Session } from '@/lib/types';

const dataFilePath = path.join(process.cwd(), 'data', 'sessions.json');

async function readData(): Promise<Session[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeData(data: Session[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const sessions = await readData();
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  try {
    const newSession: Session = await request.json();
    const sessions = await readData();
    
    if (!newSession.title || !newSession.mentorName) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    sessions.push(newSession);
    await writeData(sessions);
    
    return NextResponse.json({ message: 'Session added successfully', session: newSession }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 500 });
  }
}
