import React, { useEffect, useState } from 'react'
import * as anchor from '@project-serum/anchor';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createTokenMint, mintTo, transferTokens } from '../Context/tokenFunctions';




const MintToken = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const { publicKey } = useWallet();
    const [mint, setMint] = useState(null);
    const [tokenName, setTokenName] = useState('');
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [tokenUri, setTokenUri] = useState('');
    const [mintAuthority, setMintAuthority] = useState(null);
    const [freezeAuthority, setFreezeAuthority] = useState(null);
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState(0);
  
    useEffect(() => {
        if (publicKey) {
          console.log("Waalet ==> ", publicKey);
            setMintAuthority(publicKey);
            setFreezeAuthority(publicKey);
        }
    }, [publicKey]);
  
    const handleCreateToken = async (event) => {
        event.preventDefault();
        if (!publicKey || !connection) return;
        const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
        const mintPubkey = await createTokenMint(provider, mintAuthority, freezeAuthority, tokenName, tokenSymbol, tokenUri);
        setMint(mintPubkey);
        console.log('Token Minted:', mintPubkey);
    };
  
    const handleMintTo = async (event) => {
        event.preventDefault();
        if (!publicKey || !connection || !mint) return;
        const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
        await mintTo(provider, mint, recipient, mintAuthority, amount);
        console.log('Tokens Minted to:', recipient);
    };
  
    const handleTransferTokens = async (event) => {
        event.preventDefault();
        if (!publicKey || !connection || !mint) return;
        const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
        await transferTokens(provider, recipient, recipient, publicKey, amount);
        console.log('Tokens Transferred');
    };
  
    return (
        <div>
             {publicKey && (
                    <div>
                        <form onSubmit={handleCreateToken}>
                            <h2>Create Token</h2>
                            <input type="text" placeholder="Token Name" onChange={(e) => setTokenName(e.target.value)} />
                            <input type="text" placeholder="Token Symbol" onChange={(e) => setTokenSymbol(e.target.value)} />
                            <input type="text" placeholder="Token URI" onChange={(e) => setTokenUri(e.target.value)} />
                            <button type="submit">Create Token</button>
                        </form>
                        <form onSubmit={handleMintTo}>
                            <h2>Mint Tokens</h2>
                            <input type="text" placeholder="Recipient Address" onChange={(e) => setRecipient(e.target.value)} />
                            <input type="number" placeholder="Amount" onChange={(e) => setAmount(Number(e.target.value))} />
                            <button type="submit">Mint Tokens</button>
                        </form>
                        <form onSubmit={handleTransferTokens}>
                            <h2>Transfer Tokens</h2>
                            <input type="text" placeholder="Recipient Address" onChange={(e) => setRecipient(e.target.value)} />
                            <input type="number" placeholder="Amount" onChange={(e) => setAmount(Number(e.target.value))} />
                            <button type="submit">Transfer Tokens</button>
                        </form>
                    </div>
                )}
        </div>
    )
}

export default MintToken