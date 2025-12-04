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
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const mentors = await readData();
  const mentor = mentors.find(m => m.id.toString() === params.id);

  if (mentor) {
    return NextResponse.json(mentor);
  } else {
    return NextResponse.json({ message: 'Mentor not found' }, { status: 404 });
  }
}
