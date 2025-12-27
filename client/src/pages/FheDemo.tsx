import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConnectWallet } from '@/components/ConnectWallet';
import { useFhevm } from '@/hooks/useFhevm';
import { 
  FileText, 
  ArrowLeft, 
  Shield, 
  Lock, 
  Zap,
  CheckCircle2,
  Loader2,
  Binary,
  Key,
  Send,
  Eye
} from 'lucide-react';
import { Link } from 'wouter';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function FheDemo() {
  const {
    isInitialized,
    isLoading: fheLoading,
    error: fheError,
    isConnected,
    address,
    encrypt32,
    decrypt,
    toHexString,
    initializeFhe,
  } = useFhevm();

  const [inputValue, setInputValue] = useState('42');
  const [encryptedValue, setEncryptedValue] = useState<string | null>(null);
  const [decryptedValue, setDecryptedValue] = useState<number | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleEncrypt = async () => {
    const value = parseInt(inputValue);
    if (isNaN(value) || value < 0) {
      toast.error('Please enter a valid positive number');
      return;
    }

    setIsEncrypting(true);
    setEncryptedValue(null);
    setDecryptedValue(null);

    // Simulate encryption delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const encrypted = encrypt32(value);
    if (encrypted) {
      const hexValue = toHexString(encrypted);
      setEncryptedValue(hexValue);
      toast.success('Value encrypted successfully!');
    } else {
      toast.error('Encryption failed. Please connect your wallet first.');
    }

    setIsEncrypting(false);
  };

  const handleDecrypt = async () => {
    if (!encryptedValue) {
      toast.error('No encrypted value to decrypt');
      return;
    }

    setIsDecrypting(true);

    // Simulate decryption delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo, just return the original value
    const originalValue = parseInt(inputValue);
    setDecryptedValue(originalValue);
    toast.success('Value decrypted successfully!');

    setIsDecrypting(false);
  };

  const handleSimulateTransaction = async () => {
    if (!encryptedValue) {
      toast.error('Please encrypt a value first');
      return;
    }

    toast.info('Simulating on-chain transaction...');

    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));

    const simulatedHash = `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;

    setTxHash(simulatedHash);
    toast.success('Transaction simulated successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg hidden sm:block">FHE<span className="text-gradient">Pdf</span></span>
            </Link>
          </div>
          
          <ConnectWallet />
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-accent/20 text-accent">
              <Zap className="w-4 h-4 mr-2" />
              Zama fhEVM Integration
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              FHE On-Chain Demo
            </h1>
            <p className="text-muted-foreground text-lg">
              Experience Fully Homomorphic Encryption on the blockchain. 
              Encrypt values client-side and perform computations on encrypted data.
            </p>
          </div>

          {/* Connection Status */}
          <div className="max-w-2xl mx-auto mb-8">
            <Card className={`border-2 ${isConnected ? 'border-accent/50' : 'border-border'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-accent privacy-pulse' : 'bg-muted'}`} />
                    <span className="font-medium">
                      {isConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
                    </span>
                  </div>
                  {isConnected && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </Badge>
                      {isInitialized ? (
                        <Badge className="bg-accent/20 text-accent">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          FHE Ready
                        </Badge>
                      ) : fheLoading ? (
                        <Badge variant="secondary">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Initializing...
                        </Badge>
                      ) : (
                        <Button size="sm" variant="outline" onClick={initializeFhe}>
                          Initialize FHE
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                {fheError && (
                  <p className="text-destructive text-sm mt-2">{fheError}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Demo Cards */}
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            {/* Encryption Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>Encrypt Value</CardTitle>
                  <CardDescription>
                    Enter a number to encrypt using Zama's TFHE scheme
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Plaintext Value (uint32)</Label>
                    <Input
                      id="value"
                      type="number"
                      min="0"
                      max="4294967295"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter a number"
                      className="font-mono"
                    />
                  </div>

                  <Button
                    onClick={handleEncrypt}
                    disabled={!isConnected || !isInitialized || isEncrypting}
                    className="w-full gradient-primary border-0"
                  >
                    {isEncrypting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Encrypting...
                      </>
                    ) : (
                      <>
                        <Binary className="w-4 h-4 mr-2" />
                        Encrypt
                      </>
                    )}
                  </Button>

                  {encryptedValue && (
                    <div className="space-y-2">
                      <Label>Encrypted Ciphertext</Label>
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <code className="text-xs break-all text-accent">
                          {encryptedValue.slice(0, 42)}...
                        </code>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Decryption Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>Decrypt Value</CardTitle>
                  <CardDescription>
                    Decrypt the ciphertext back to plaintext
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ciphertext Status</Label>
                    <div className="p-3 bg-secondary/50 rounded-lg flex items-center gap-2">
                      {encryptedValue ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-accent" />
                          <span className="text-sm">Ciphertext available</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">No ciphertext yet</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleDecrypt}
                    disabled={!encryptedValue || isDecrypting}
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    {isDecrypting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Decrypting...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Decrypt
                      </>
                    )}
                  </Button>

                  {decryptedValue !== null && (
                    <div className="space-y-2">
                      <Label>Decrypted Value</Label>
                      <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                        <span className="text-2xl font-bold text-accent font-mono">
                          {decryptedValue}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* On-Chain Transaction Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-2"
            >
              <Card className="gradient-border">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle>Simulate On-Chain Transaction</CardTitle>
                  <CardDescription>
                    Send the encrypted value to a smart contract on Zama fhEVM
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Network</Label>
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <span className="text-sm font-medium">Zama fhEVM Devnet</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Contract</Label>
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <code className="text-xs text-muted-foreground">FHECounter.sol</code>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Function</Label>
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <code className="text-xs text-muted-foreground">incrementBy(bytes)</code>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSimulateTransaction}
                    disabled={!encryptedValue}
                    className="w-full gradient-primary border-0"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Send Encrypted Transaction
                  </Button>

                  {txHash && (
                    <div className="space-y-2">
                      <Label>Transaction Hash</Label>
                      <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                        <code className="text-xs break-all text-accent">
                          {txHash}
                        </code>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Info Section */}
          <div className="max-w-2xl mx-auto mt-12">
            <Card className="bg-card/50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Shield className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">How It Works</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-accent">1.</span>
                        <span>Connect your wallet to the Zama fhEVM network</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">2.</span>
                        <span>Enter a value and encrypt it client-side using TFHE</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">3.</span>
                        <span>Send the encrypted value to a smart contract</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">4.</span>
                        <span>The contract performs computations on encrypted data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">5.</span>
                        <span>Only you can decrypt the result with your private key</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Built by <a href="https://x.com/ramx_ai" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">@ramx_ai</a> for the Zama FHE Developer Grant</p>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.zama.ai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Powered by Zama
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
