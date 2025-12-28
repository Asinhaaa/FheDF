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

interface PerformanceMetrics {
  encryptionTime: number;
  searchTime: number;
  totalTokens: number;
  batchCount: number;
  slotCount: number;
}

interface SearchResultWithContext {
  batchIndex: number;
  matchCount: number;
  positions: number[];
  context?: string[];
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

let performanceMetrics: PerformanceMetrics = {
  encryptionTime: 0,
  searchTime: 0,
  totalTokens: 0,
  batchCount: 0,
  slotCount: 0,
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

  performanceMetrics.slotCount = state.encoder.slotCount();

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
 * Enhanced hash function with better distribution
 */
function enhancedHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) + hash) + char; // hash * 33 + char
  }
  return Math.abs(hash) % 1000000;
}

/**
 * Tokenize text into words with position tracking
 */
function tokenizeWithPositions(text: string): { token: string; position: number }[] {
  const tokens: { token: string; position: number }[] = [];
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  
  let currentPos = 0;
  for (const word of words) {
    const pos = text.toLowerCase().indexOf(word, currentPos);
    tokens.push({ token: word, position: pos });
    currentPos = pos + word.length;
  }
  
  return tokens;
}

/**
 * Encrypt a document with enhanced metadata
 */
export async function encryptDocumentEnhanced(
  pages: string[],
  onProgress?: (progress: number) => void
): Promise<{ encryptedBatches: string[]; originalText: string; metrics: PerformanceMetrics }> {
  if (!state.seal || !state.encoder || !state.encryptor) {
    throw new Error('FHE not initialized');
  }

  const startTime = performance.now();

  // Combine all pages and tokenize
  const allText = pages.join(' ');
  const tokensWithPos = tokenizeWithPositions(allText);
  const tokenHashes = tokensWithPos.map(t => enhancedHash(t.token));

  console.log(`Encrypting ${tokensWithPos.length} tokens...`);

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

  const endTime = performance.now();
  
  performanceMetrics = {
    encryptionTime: endTime - startTime,
    searchTime: 0,
    totalTokens: tokensWithPos.length,
    batchCount: encryptedBatches.length,
    slotCount,
  };

  console.log(`Document encrypted into ${encryptedBatches.length} batches in ${performanceMetrics.encryptionTime.toFixed(2)}ms`);
  
  return {
    encryptedBatches,
    originalText: allText,
    metrics: performanceMetrics,
  };
}

/**
 * Perform encrypted search with multi-term support
 */
export async function searchEncryptedEnhanced(
  encryptedBatches: string[],
  originalText: string,
  query: string,
  onProgress?: (progress: number) => void
): Promise<{ results: SearchResultWithContext[]; metrics: PerformanceMetrics }> {
  if (!state.seal || !state.encoder || !state.encryptor || !state.decryptor || !state.evaluator) {
    throw new Error('FHE not initialized');
  }

  const startTime = performance.now();

  const queryTokens = query.toLowerCase().match(/\b\w+\b/g) || [];
  if (queryTokens.length === 0) {
    return { results: [], metrics: performanceMetrics };
  }

  console.log(`Searching for tokens: ${queryTokens.join(', ')}`);

  const slotCount = state.encoder.slotCount();
  const allResults: SearchResultWithContext[] = [];

  // Search for each query token
  for (let tokenIdx = 0; tokenIdx < queryTokens.length; tokenIdx++) {
    const queryHash = enhancedHash(queryTokens[tokenIdx]);
    console.log(`Searching for "${queryTokens[tokenIdx]}" (hash: ${queryHash})`);

    // Create encrypted query (broadcast to all slots)
    const queryArray = new Int32Array(slotCount).fill(queryHash);
    const queryPlain = state.encoder.encode(queryArray);
    const queryEncrypted = state.encryptor.encrypt(queryPlain);

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

      // Find match positions
      const positions: number[] = [];
      for (let j = 0; j < resultArray.length; j++) {
        if (resultArray[j] === 0) {
          const globalPosition = i * slotCount + j;
          positions.push(globalPosition);
        }
      }

      if (positions.length > 0) {
        // Extract context around matches
        const contexts: string[] = [];
        for (const pos of positions.slice(0, 5)) { // Limit to first 5 matches
          const contextStart = Math.max(0, pos * 5 - 50);
          const contextEnd = Math.min(originalText.length, pos * 5 + 50);
          const context = originalText.substring(contextStart, contextEnd);
          contexts.push('...' + context + '...');
        }

        allResults.push({
          batchIndex: i,
          matchCount: positions.length,
          positions,
          context: contexts,
        });
      }

      // Clean up
      batchCipher.delete();
      resultCipher.delete();
      resultPlain.delete();

      if (onProgress) {
        const totalProgress = ((tokenIdx * encryptedBatches.length + i + 1) / (queryTokens.length * encryptedBatches.length)) * 100;
        onProgress(Math.min(totalProgress, 100));
      }
    }

    // Clean up query objects
    queryPlain.delete();
    queryEncrypted.delete();
  }

  const endTime = performance.now();
  performanceMetrics.searchTime = endTime - startTime;

  console.log(`Search completed in ${performanceMetrics.searchTime.toFixed(2)}ms`);
  console.log(`Found ${allResults.length} batches with matches`);

  return {
    results: allResults,
    metrics: performanceMetrics,
  };
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  return { ...performanceMetrics };
}

/**
 * Clean up FHE resources
 */
export function cleanup(): void {
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
export function isFheInitialized(): boolean {
  return state.seal !== null && state.context !== null;
}

// Functions are already exported above, no need for additional exports
