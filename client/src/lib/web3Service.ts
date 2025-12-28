import { writeContract, waitForTransactionReceipt } from 'wagmi/actions';
import { ENCRYPTED_CREDITS_CONTRACT_ADDRESS, ENCRYPTED_CREDITS_CONTRACT_ABI } from '../const';
import { toast } from 'sonner';
import { parseEther } from 'viem';

/**
 * Calls the smart contract to consume one credit for a service.
 * @returns {Promise<boolean>} True if the transaction is successful.
 */
export async function consumeCredit(): Promise<boolean> {
  try {
    toast.info("Preparing transaction to consume credit...");

    // 1. Send the transaction
    const hash = await writeContract({
      address: ENCRYPTED_CREDITS_CONTRACT_ADDRESS as `0x${string}`,
      abi: ENCRYPTED_CREDITS_CONTRACT_ABI,
      functionName: 'consumeCredit',
      // NOTE: If the contract requires a small fee, uncomment the line below
      // value: parseEther('0.0001'), 
    });

    toast.info(`Transaction sent: ${hash}. Waiting for confirmation...`);

    // 2. Wait for the transaction to be mined
    const receipt = await waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
      toast.success("Credit consumed successfully! Your file is ready.");
      return true;
    } else {
      toast.error("Transaction failed on chain. Credit not consumed.");
      return false;
    }

  } catch (error) {
    console.error("Credit consumption error:", error);
    toast.error(`Failed to consume credit: ${error.message}`);
    return false;
  }
}
