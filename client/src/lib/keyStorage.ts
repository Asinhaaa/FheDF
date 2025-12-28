import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface FHEKeyDB extends DBSchema {
  keys: {
    key: string;
    value: string;
  };
  tokens: {
    key: string;
    value: {
      documentId: string;
      encryptedBatches: string[];
      timestamp: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<FHEKeyDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<FHEKeyDB>('fhe-store', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys');
        }
        if (!db.objectStoreNames.contains('tokens')) {
          db.createObjectStore('tokens');
        }
      },
    });
  }
  return dbPromise;
};

export async function getKey(keyName: string): Promise<string | undefined> {
  const db = await getDB();
  return db.get('keys', keyName);
}

export async function setKey(keyName: string, keyData: string): Promise<void> {
  const db = await getDB();
  await db.put('keys', keyData, keyName);
}

export async function getAllKeys(): Promise<string[]> {
  const db = await getDB();
  return db.getAllKeys('keys');
}

export async function clearKeys(): Promise<void> {
  const db = await getDB();
  await db.clear('keys');
}

export async function getEncryptedTokens(documentId: string) {
  const db = await getDB();
  return db.get('tokens', documentId);
}

export async function setEncryptedTokens(
  documentId: string,
  encryptedBatches: string[]
): Promise<void> {
  const db = await getDB();
  await db.put('tokens', {
    documentId,
    encryptedBatches,
    timestamp: Date.now(),
  }, documentId);
}

export async function clearTokens(): Promise<void> {
  const db = await getDB();
  await db.clear('tokens');
}
