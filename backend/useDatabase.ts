// hooks/useDatabase.ts
import { useState, useEffect, useMemo } from 'react';
import {
  getDatabase,
  initializeDatabase,
  getTinitosos,
  getVotes,
  getPosts,
  getQuestionaires,
  getDocs,
} from '../backend/db';

interface Tinitosos {
  id: number;
  name: string;
  age: number;
  verified: number | null;
  p1: number | null;
  p2: number | null;
  p3: number | null;
  p4: number | null;
  p5: number | null;
  p6: number | null;
  p7: number | null;
}

interface Vote {
  id: number;
  tinitososid: number;
  postid: number;
  vote: number;
}

interface Post {
  id: number;
  tinitososid: number;
  date: string;
  title: string;
  content: string;
}

interface Questionaire {
  id: number;
  tinitososid: number;
  date: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  q7: number;
}

interface Doc {
  id: number;
  name: string;
  institution: string;
}
export async function LoadTinitosos(): Promise<Tinitosos[]> {
    const data = (await getTinitosos()) as Tinitosos[];
    return data;
}

