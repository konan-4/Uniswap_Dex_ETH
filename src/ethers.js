import {ethers, providers } from 'ethers'
import { useMemo } from 'react'
import { Account, Chain, Client, Transport } from 'viem'
import { Config, useConnectorClient } from 'wagmi'
import { useClient } from 'wagmi'
// Function to convert a Viem Client to an ethers.js Signer
export function clientToSigner(client) {
    const { account, chain, transport } = client;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts ? chain.contracts.ensRegistry.address : undefined,
    };
    const provider = new ethers.providers.Web3Provider(transport, network);
    const signer = provider.getSigner(account.address);
    return signer;
  }
  
  // Action to convert a Viem Client to an ethers.js Signer
export function useEthersSigner({ chainId } = {}) {
    const client = useConnectorClient({ chainId }).data;
    
    return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
  }
export  function clientToProvider(client) {
    const { chain, transport } = client;
    
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts ? chain.contracts.ensRegistry.address : undefined,
    };
  
    if (transport.type === 'fallback') {
      return new providers.FallbackProvider(
        transport.transports.map(({ value }) => new providers.JsonRpcProvider(value.url, network))
      );
    }
  
    return new providers.JsonRpcProvider(transport.url, network);
  }
  
  export function useEthersProvider({ chainId } = {}) {
    const client = useClient({ chainId });
    return useMemo(() => (client ? clientToProvider(client) : undefined), [client]);
  }
  