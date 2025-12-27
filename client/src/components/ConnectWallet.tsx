import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown } from 'lucide-react';

interface ConnectWalletProps {
  className?: string;
  showBalance?: boolean;
}

export function ConnectWallet({ className, showBalance = true }: ConnectWalletProps) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
            className={className}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="gradient-primary border-0 hover-glow"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="destructive"
                  >
                    Wrong Network
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={openChainModal}
                    variant="outline"
                    size="sm"
                    className="bg-transparent hidden sm:flex"
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img
                        alt={chain.name ?? 'Chain icon'}
                        src={chain.iconUrl}
                        className="w-4 h-4 mr-2 rounded-full"
                      />
                    )}
                    {chain.name}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>

                  <Button
                    onClick={openAccountModal}
                    variant="outline"
                    className="bg-transparent"
                  >
                    {showBalance && account.displayBalance && (
                      <span className="mr-2 hidden sm:inline">
                        {account.displayBalance}
                      </span>
                    )}
                    <span className="font-mono">{account.displayName}</span>
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
