'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { parseEther } from 'viem';
import { base } from 'wagmi/chains';
import { Button } from '../Button';
import { PAYMENT_WALLET_ADDRESS, PAYMENT_CHAIN_ID } from '~/lib/constants';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: {
    id: string;
    name: string;
    priceETH: string; // e.g., "0.001"
    description?: string;
  };
}

/**
 * PaymentModal component for handling real payments in ETH on Base chain.
 * 
 * Features:
 * - Automatic chain switching to Base
 * - ETH payments to configured wallet
 * - Transaction status tracking
 * - Error handling
 * 
 * @example
 * ```tsx
 * <PaymentModal
 *   isOpen={true}
 *   onClose={() => {}}
 *   onSuccess={() => console.log('Payment successful!')}
 *   item={{
 *     id: 'premium-skin',
 *     name: 'Premium Skin',
 *     priceETH: '0.001',
 *     description: 'Unlock exclusive content'
 *   }}
 * />
 * ```
 */
export function PaymentModal({ isOpen, onClose, onSuccess, item }: PaymentModalProps) {
  const [purchaseState, setPurchaseState] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { address, chainId, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  
  const {
    sendTransaction,
    data: txHash,
    error: txError,
    isPending: isTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  if (!isOpen) return null;

  const handlePurchase = async () => {
    try {
      setPurchaseState('pending');
      setErrorMessage('');

      // 1. Check wallet connection
      if (!isConnected || !address) {
        throw new Error('Please connect your wallet first');
      }

      // 2. Check/Switch to Base chain
      if (chainId !== PAYMENT_CHAIN_ID) {
        console.log('🔄 Switching to Base chain...');
        await switchChain({ chainId: base.id });
        // Wait a bit for chain switch
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 3. Send payment
      console.log('💰 Sending payment:', {
        to: PAYMENT_WALLET_ADDRESS,
        value: parseEther(item.priceETH),
        item: item.name,
      });

      sendTransaction({
        to: PAYMENT_WALLET_ADDRESS,
        value: parseEther(item.priceETH),
        chainId: base.id,
      });

    } catch (error) {
      console.error('❌ Payment error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Payment failed';
      setErrorMessage(errorMsg);
      setPurchaseState('failed');
      
      setTimeout(() => {
        setPurchaseState('idle');
        setErrorMessage('');
      }, 3000);
    }
  };

  // Watch for transaction confirmation
  if (isConfirmed && purchaseState !== 'success') {
    setPurchaseState('success');
    console.log('✅ Payment confirmed!', txHash);
    
    // Call success callback
    onSuccess();
    
    // Auto-close modal after success
    setTimeout(() => {
      onClose();
      setPurchaseState('idle');
    }, 2000);
  }

  if (txError && purchaseState !== 'failed') {
    setPurchaseState('failed');
    setErrorMessage(txError.message);
    
    setTimeout(() => {
      setPurchaseState('idle');
      setErrorMessage('');
    }, 3000);
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-6 max-w-md w-full border-2 border-pink-500/50 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {purchaseState === 'success' ? '✅ Purchase Complete!' : 'Confirm Purchase'}
          </h2>
          {item.description && (
            <p className="text-sm text-white/70">{item.description}</p>
          )}
        </div>

        {/* Item Info */}
        <div className="bg-black/30 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80">Item:</span>
            <span className="text-white font-bold">{item.name}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/80">Price:</span>
            <span className="text-green-400 font-bold">{item.priceETH} ETH</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Network:</span>
            <span className="text-blue-400 font-bold">Base</span>
          </div>
        </div>

        {/* Status Messages */}
        {purchaseState === 'pending' && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4 text-center">
            <p className="text-yellow-200 text-sm font-semibold">
              {isConfirming ? '⏳ Confirming transaction...' : '⏳ Processing payment...'}
            </p>
          </div>
        )}

        {purchaseState === 'success' && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4 text-center">
            <p className="text-green-200 text-sm font-semibold">
              ✅ Payment successful! Unlocking {item.name}...
            </p>
          </div>
        )}

        {purchaseState === 'failed' && errorMessage && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 text-center">
            <p className="text-red-200 text-sm font-semibold">
              ❌ {errorMessage}
            </p>
          </div>
        )}

        {/* Transaction Hash */}
        {txHash && (
          <div className="bg-black/30 rounded-lg p-2 mb-4 text-center">
            <p className="text-xs text-white/60 mb-1">Transaction Hash:</p>
            <p className="text-xs text-blue-400 font-mono break-all">
              {txHash}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            disabled={purchaseState === 'pending'}
            className="flex-1 bg-gray-600 hover:bg-gray-700"
          >
            {purchaseState === 'success' ? 'Close' : 'Cancel'}
          </Button>
          
          {purchaseState !== 'success' && (
            <Button
              onClick={handlePurchase}
              disabled={purchaseState === 'pending' || !isConnected}
              isLoading={purchaseState === 'pending' || isConfirming || isTxPending}
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            >
              {purchaseState === 'pending' ? 'Processing...' : `Pay ${item.priceETH} ETH`}
            </Button>
          )}
        </div>

        {/* Warning */}
        {!isConnected && (
          <p className="text-xs text-red-400 text-center mt-4">
            ⚠️ Please connect your wallet first
          </p>
        )}
      </div>
    </div>
  );
}
