import SEAL from 'node-seal';
import { getKey, setKey } from './keyStorage';

// Type definitions
type SEALInstance = Awaited<ReturnType<typeof SEAL>>;
type Context = ReturnType<SEALInstance['Context']>;
type SecretKey = ReturnType<SEALInstance['SecretKey']>;
type PublicKey = ReturnType<SEALInstance['PublicKey']>;
type RelinKeys = ReturnType<SEALInstance['RelinKeys']>;
type GaloisKeys = ReturnType<SEALInstance['GaloisKeys']>;

interface FHEState {
  seal: SEALInstance | null;
  context: Context | null;
  secretKey: SecretKey | null;
  publicKey: PublicKey | null;
  relinKeys: RelinKeys | null;
  galoisKeys: GaloisKeys | null;
  encoder: any | null;
  encryptor: any | null;
  decryptor: any | null;
  evaluator: any | null;
}

const state: FHEState = {
  seal: null,
  context: null,
  secretKey: null,
  publicKey: null,
  relinKeys: null,
  galoisKeys: null,
  encoder: null,
  encryptor: null,
  decryptor: null,
  evaluator: null,
};

/**
 * Initialize the SEAL library and set up encryption parameters
 */
export async function initializeFHE(): Promise<void> {
  if (state.seal) {
    console.log('FHE already initialized');
    return;
  }

  console.log('Initializing SEAL...');
  state.seal = await SEAL();

  // BFV scheme for exact integer arithmetic
  const schemeType = state.seal.SchemeType.BFV;
  const securityLevel = state.seal.SecurityLevel.tc128;
  const polyModulusDegree = 4096; // Supports up to 4096 slots per ciphertext
  
  // Coefficient modulus bit sizes (affects noise budget)
  const bitSizes = [36, 36, 37];
  
  // Plain modulus bit size (affects the range of values we can encrypt)
  const plainModulusBitSize = 20;

  // Create encryption parameters
  const encParms = state.seal.EncryptionParameters(schemeType);
  encParms.setPolyModulusDegree(polyModulusDegree);
  encParms.setCoeffModulus(
    state.seal.CoeffModulus.Create(
      polyModulusDegree,
      Int32Array.from(bitSizes)
    )
  );
  encParms.setPlainModulus(
    state.seal.PlainModulus.Batching(polyModulusDegree, plainModulusBitSize)
  );

  // Create context
  state.context = state.seal.Context(encParms, true, securityLevel);

  if (!state.context.parametersSet()) {
    throw new Error('SEAL parameters are not valid');
  }

  console.log('SEAL context created successfully');

  // Try to load existing keys from IndexedDB
  await loadOrGenerateKeys();

  // Initialize encoder, encryptor, decryptor, and evaluator
  state.encoder = state.seal.BatchEncoder(state.context);
  state.encryptor = state.seal.Encryptor(state.context, state.publicKey);
  state.decryptor = state.seal.Decryptor(state.context, state.secretKey);
  state.evaluator = state.seal.Evaluator(state.context);

  console.log('FHE initialization complete');
}

/**
 * Load keys from IndexedDB or generate new ones
 */
async function loadOrGenerateKeys(): Promise<void> {
  const storedSecretKey = await getKey('secretKey');

  if (storedSecretKey) {
    console.log('Loading keys from IndexedDB...');
    
    // Load secret key
    state.secretKey = state.seal!.SecretKey();
    state.secretKey.load(state.context!, storedSecretKey);

    // Load public key
    const storedPublicKey = await getKey('publicKey');
    if (storedPublicKey) {
      state.publicKey = state.seal!.PublicKey();
      state.publicKey.load(state.context!, storedPublicKey);
    }

    // Load relinearization keys
    const storedRelinKeys = await getKey('relinKeys');
    if (storedRelinKeys) {
      state.relinKeys = state.seal!.RelinKeys();
      state.relinKeys.load(state.context!, storedRelinKeys);
    }

    // Load Galois keys
    const storedGaloisKeys = await getKey('galoisKeys');
    if (storedGaloisKeys) {
      state.galoisKeys = state.seal!.GaloisKeys();
      state.galoisKeys.load(state.context!, storedGaloisKeys);
    }

    console.log('Keys loaded successfully');
  } else {
    console.log('Generating new keys...');
    await generateAndStoreKeys();
  }
}

/**
 * Generate a new set of FHE keys and store them in IndexedDB
 */
async function generateAndStoreKeys(): Promise<void> {
  const keyGenerator = state.seal!.KeyGenerator(state.context!);

  // Generate secret key
  state.secretKey = keyGenerator.secretKey();
  await setKey('secretKey', state.secretKey.save());

  // Generate public key
  state.publicKey = keyGenerator.createPublicKey();
  await setKey('publicKey', state.publicKey.save());

  // Generate relinearization keys (used after multiplication)
  state.relinKeys = keyGenerator.createRelinKeys();
  await setKey('relinKeys', state.relinKeys.save());

  // Generate Galois keys (used for rotations)
  state.galoisKeys = keyGenerator.createGaloisKeys();
  await setKey('galoisKeys', state.galoisKeys.save());

  console.log('Keys generated and stored successfully');
}

/**
 * Simple hash function to convert strings to numbers
 * In production, consider using a more robust hash or vocabulary mapping
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 1000000; // Keep numbers manageable
}

/**
 * Tokenize text into words
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(token => token.length > 0);
}

/**
 * Encrypt a document (array of page texts)
 */
export async function encryptDocument(
  pages: string[],
  onProgress?: (progress: number) => void
): Promise<string[]> {
  if (!state.seal || !state.encoder || !state.encryptor) {
    throw new Error('FHE not initialized');
  }

  // Combine all pages and tokenize
  const allText = pages.join(' ');
  const tokens = tokenize(allText);
  const tokenHashes = tokens.map(token => simpleHash(token));

  console.log(`Encrypting ${tokens.length} tokens...`);

  const slotCount = state.encoder.slotCount();
  const encryptedBatches: string[] = [];

  // Process tokens in batches
  for (let i = 0; i < tokenHashes.length; i += slotCount) {
    const batch = tokenHashes.slice(i, i + slotCount);
    
    // Pad batch to slot count
    while (batch.length < slotCount) {
      batch.push(0);
    }

    // Encode and encrypt
    const plainText = state.encoder.encode(Int32Array.from(batch));
    const cipherText = state.encryptor.encrypt(plainText);
    encryptedBatches.push(cipherText.save());

    // Clean up
    plainText.delete();
    cipherText.delete();

    if (onProgress) {
      onProgress(Math.min(((i + slotCount) / tokenHashes.length) * 100, 100));
    }
  }

  console.log(`Document encrypted into ${encryptedBatches.length} batches`);
  return encryptedBatches;
}

/**
 * Perform encrypted search
 */
export async function searchEncrypted(
  encryptedBatches: string[],
  query: string,
  onProgress?: (progress: number) => void
): Promise<{ batchIndex: number; matchCount: number }[]> {
  if (!state.seal || !state.encoder || !state.encryptor || !state.decryptor || !state.evaluator) {
    throw new Error('FHE not initialized');
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return [];
  }

  // For simplicity, search for the first token
  const queryHash = simpleHash(queryTokens[0]);
  console.log(`Searching for query hash: ${queryHash}`);

  // Create encrypted query (broadcast to all slots)
  const slotCount = state.encoder.slotCount();
  const queryArray = new Int32Array(slotCount).fill(queryHash);
  const queryPlain = state.encoder.encode(queryArray);
  const queryEncrypted = state.encryptor.encrypt(queryPlain);

  const results: { batchIndex: number; matchCount: number }[] = [];

  // Search each batch
  for (let i = 0; i < encryptedBatches.length; i++) {
    // Load encrypted batch
    const batchCipher = state.seal!.Ciphertext();
    batchCipher.load(state.context!, encryptedBatches[i]);

    // Homomorphic subtraction: result = batch - query
    const resultCipher = state.evaluator!.sub(batchCipher, queryEncrypted);

    // Decrypt result
    const resultPlain = state.decryptor!.decrypt(resultCipher);
    const resultArray = state.encoder!.decode(resultPlain, true);

    // Count zeros (matches)
    let matchCount = 0;
    for (let j = 0; j < resultArray.length; j++) {
      if (resultArray[j] === 0) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      results.push({ batchIndex: i, matchCount });
    }

    // Clean up
    batchCipher.delete();
    resultCipher.delete();
    resultPlain.delete();

    if (onProgress) {
      onProgress(Math.min(((i + 1) / encryptedBatches.length) * 100, 100));
    }
  }

  // Clean up query objects
  queryPlain.delete();
  queryEncrypted.delete();

  console.log(`Found ${results.length} batches with matches`);
  return results;
}

/**
 * Clean up FHE resources
 */
export function cleanup(): void {
  // Note: In node-seal v7, manual cleanup is important to prevent memory leaks
  if (state.secretKey) state.secretKey.delete();
  if (state.publicKey) state.publicKey.delete();
  if (state.relinKeys) state.relinKeys.delete();
  if (state.galoisKeys) state.galoisKeys.delete();
  if (state.encoder) state.encoder.delete();
  if (state.encryptor) state.encryptor.delete();
  if (state.decryptor) state.decryptor.delete();
  if (state.evaluator) state.evaluator.delete();
  if (state.context) state.context.delete();

  // Reset state
  Object.keys(state).forEach(key => {
    state[key as keyof FHEState] = null;
  });

  console.log('FHE resources cleaned up');
}

/**
 * Check if FHE is initialized
 */
export function isInitialized(): boolean {
  return state.seal !== null && state.context !== null;
}
