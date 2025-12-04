import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Mentor } from '@/lib/types';

const dataFilePath = path.join(process.cwd(), 'data', 'mentors.json');

async function readData(): Promise<Mentor[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If the file doesn't exist, return an empty array
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeData(data: Mentor[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  const mentors = await readData();
  return NextResponse.json(mentors);
}

export async function POST(request: Request) {
  try {
    const newMentor: Mentor = await request.json();
    const mentors = await readData();
    
    // Basic validation
    if (!newMentor.name || !newMentor.title) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    mentors.push(newMentor);
    await writeData(mentors);
    
    return NextResponse.json({ message: 'Mentor added successfully', mentor: newMentor }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 500 });
  }
}
