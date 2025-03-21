// db/database.ts
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('app.db');
  }
  return db;
}

export async function initializeDatabase() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS Tinitosos(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      verified INTEGER,
      p1 REAL,
      p2 REAL,
      p3 REAL,
      p4 REAL,
      p5 REAL,
      p6 REAL,
      p7 REAL
    );

    CREATE TABLE IF NOT EXISTS Vote(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tinitososid INTEGER NOT NULL,
      postid INTEGER NOT NULL,
      vote INTEGER NOT NULL,
      UNIQUE(tinitososid, postid)
    );

    CREATE TABLE IF NOT EXISTS Post(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tinitososid INTEGER NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Questionaire(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tinitososid INTEGER NOT NULL,
      date TEXT NOT NULL,
      q1 INTEGER NOT NULL,
      q2 INTEGER NOT NULL,
      q3 INTEGER NOT NULL,
      q4 INTEGER NOT NULL,
      q5 INTEGER NOT NULL,
      q6 INTEGER NOT NULL,
      q7 INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Doc(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      institution TEXT NOT NULL
    );
  `);
}
// Add a new Tinitosos
export async function addTinitosos(
  name: string,
  age: number,
  verified: number | null,
  p1: number | null,
  p2: number | null,
  p3: number | null,
  p4: number | null,
  p5: number | null,
  p6: number | null,
  p7: number | null
) {
  return db.runAsync(
    `INSERT INTO Tinitosos (name, age, verified, p1, p2, p3, p4, p5, p6, p7) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, age, verified, p1, p2, p3, p4, p5, p6, p7]
  );
}

// Get all Tinitosos
export async function getTinitosos() {
  return db.getAllAsync('SELECT * FROM Tinitosos');
}

// Add a new Vote
export async function addVote(tinitososid: number, postid: number, vote: number) {
  return db.runAsync(
    `INSERT INTO Vote (tinitososid, postid, vote) VALUES (?, ?, ?)
     ON CONFLICT(tinitososid, postid) DO UPDATE SET vote = excluded.vote`,
    [tinitososid, postid, vote]
  );
}

// Get all Votes
export async function getVotes() {
  return db.getAllAsync('SELECT * FROM Vote');
}

// Add a new Post
export async function addPost(
  tinitososid: number,
  date: string,
  title: string,
  content: string
) {
  return db.runAsync(
    `INSERT INTO Post (tinitososid, date, title, content) VALUES (?, ?, ?, ?)`,
    [tinitososid, date, title, content]
  );
}

// Get all Posts
export async function getPosts() {
  return db.getAllAsync('SELECT * FROM Post');
}

// Add a new Questionaire
export async function addQuestionaire(
  tinitososid: number,
  date: string,
  q1: number,
  q2: number,
  q3: number,
  q4: number,
  q5: number,
  q6: number,
  q7: number
) {
  return db.runAsync(
    `INSERT INTO Questionaire (tinitososid, date, q1, q2, q3, q4, q5, q6, q7) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [tinitososid, date, q1, q2, q3, q4, q5, q6, q7]
  );
}

// Get all Questionaires
export async function getQuestionaires() {
  return db.getAllAsync('SELECT * FROM Questionaire');
}

// Add a new Doc
export async function addDoc(name: string, institution: string) {
  return db.runAsync(
    `INSERT INTO Doc (name, institution) VALUES (?, ?)`,
    [name, institution]
  );
}

// Get all Docs
export async function getDocs() {
  return db.getAllAsync('SELECT * FROM Doc');
}
