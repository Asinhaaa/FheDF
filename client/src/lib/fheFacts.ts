export interface FHEFact {
  title: string;
  description: string;
  icon: string;
  category: 'concept' | 'security' | 'application' | 'history';
  color: string;
}

export const fheFacts: FHEFact[] = [
  {
    title: 'Fully Homomorphic Encryption',
    description: 'FHE allows computation on encrypted data without decryption, enabling privacy-preserving cloud computing.',
    icon: '🔐',
    category: 'concept',
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Zero-Knowledge Proof',
    description: 'Prove you know something without revealing what it is. Perfect for privacy-first applications.',
    icon: '✓',
    category: 'security',
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'Microsoft SEAL',
    description: 'An open-source FHE library that powers secure computation. Used in production by major tech companies.',
    icon: '🛡️',
    category: 'application',
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Craig Gentry (2009)',
    description: 'First practical FHE scheme proposed. Revolutionized cryptography and privacy-preserving computation.',
    icon: '🏆',
    category: 'history',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    title: 'Searchable Encryption',
    description: 'Search encrypted data without decrypting it. Enable private document search and discovery.',
    icon: '🔍',
    category: 'application',
    color: 'from-red-500 to-red-600',
  },
  {
    title: 'BFV Scheme',
    description: 'Brakerski-Fan-Vercauteren scheme. Efficient FHE for integer arithmetic and comparisons.',
    icon: '⚙️',
    category: 'concept',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    title: 'Post-Quantum Cryptography',
    description: 'FHE is believed to be resistant to quantum computer attacks, making it future-proof.',
    icon: '🚀',
    category: 'security',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    title: 'Homomorphic Operations',
    description: 'Addition and multiplication on encrypted data. Enables arbitrary computation without decryption.',
    icon: '➕',
    category: 'concept',
    color: 'from-pink-500 to-pink-600',
  },
  {
    title: 'Privacy-Preserving ML',
    description: 'Train machine learning models on encrypted data. Protect user privacy while improving models.',
    icon: '🤖',
    category: 'application',
    color: 'from-orange-500 to-orange-600',
  },
  {
    title: 'Zama Concrete',
    description: 'Modern FHE framework making cryptography accessible. Enables practical privacy-first applications.',
    icon: '🔬',
    category: 'application',
    color: 'from-teal-500 to-teal-600',
  },
  {
    title: 'Ciphertext Batching',
    description: 'Process multiple encrypted values in parallel. Dramatically improves FHE performance.',
    icon: '📦',
    category: 'concept',
    color: 'from-lime-500 to-lime-600',
  },
  {
    title: 'GDPR Compliance',
    description: 'FHE enables compliance with data protection regulations by keeping data encrypted throughout processing.',
    icon: '⚖️',
    category: 'security',
    color: 'from-violet-500 to-violet-600',
  },
];

export const fheQuotes = [
  {
    text: 'The future of privacy is encryption that works on encrypted data.',
    author: 'Zama Team',
  },
  {
    text: 'Homomorphic encryption is the holy grail of cryptography.',
    author: 'Security Researcher',
  },
  {
    text: 'With FHE, your data can be private and useful at the same time.',
    author: 'Privacy Advocate',
  },
  {
    text: 'Computation without decryption is the ultimate privacy guarantee.',
    author: 'Cryptographer',
  },
];

export function getRandomFact(): FHEFact {
  return fheFacts[Math.floor(Math.random() * fheFacts.length)];
}

export function getRandomQuote() {
  return fheQuotes[Math.floor(Math.random() * fheQuotes.length)];
}

export function getFactsByCategory(category: FHEFact['category']): FHEFact[] {
  return fheFacts.filter(fact => fact.category === category);
}
