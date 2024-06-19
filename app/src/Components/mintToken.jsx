import React, { useEffect, useState } from 'react'
import * as anchor from '@project-serum/anchor';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createMintToken, initialized, mintTo, transferTokens } from '../Context/tokenFunctions';
import idl from '../../tranfer_spl_token.json'; // Your IDL JSON file
// import { AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey, Transaction, Keypair, SYSVAR_RENT_PUBKEY, SystemProgram } from '@solana/web3.js';
// import { Metaplex } from '@metaplex-foundation/js'
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getMint } from "@solana/spl-token";



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
    const PROGRAM_ID = new PublicKey('564zkJpPojyCmxr5qiaK3LSe7XiXa77DvnaapW5n1qx4');


    const [txSig, setTxSig] = useState("");
    const [loading, setLoading] = useState(false);
    const link = () => {
        return txSig ? `https://explorer.solana.com/tx/${txSig}?cluster=devnet` : "";
    };

    const getProgram = () => {
        const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
        anchor.setProvider(provider);
        const program = new anchor.Program(idl, idl.metadata.address);
        return program;
    };

    const program = getProgram();
    // console.log("Program ==>> " , program);
    const dataAccount = anchor.web3.Keypair.generate();
    const mintKeypair = anchor.web3.Keypair.generate();

    useEffect(() => {
        if (publicKey) {
            console.log("Waalet ==> ", publicKey);
            setMintAuthority(publicKey);
            setFreezeAuthority(publicKey);
        }
    }, [publicKey]);

    const handleCreateToken = async (event) => {
        // event.preventDefault();
        // if (!publicKey || !connection) return;
        // const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
        // const mintPubkey = await createTokenMint(provider, mintAuthority, freezeAuthority, tokenName, tokenSymbol, tokenUri);
        // setMint(mintPubkey);
        // console.log('Token Minted:', mintPubkey);

        console.log("a => ",typeof wallet.publicKey); // Should output "object"
        console.log("b => ",dataAccount.publicKey instanceof PublicKey); // Should output true



        event.preventDefault();

        setLoading(true);

        if (!publicKey) {
            // notify({ type: "error", message: `Wallet not connected!` });
            console.log("error", `Send Transaction: Wallet not connected!`);
            return;
        }

        const createDataAccountTransaction = await program.methods
            .new()
            .accounts({ dataAccount: dataAccount.publicKey })
            .signers([dataAccount])
            .rpc();
        console.log("Your transaction signature", createDataAccountTransaction);
        console.log("Your transaction dataAccount", dataAccount.publicKey.toBase58());
        // const metadataAddress = Keypair.generate();
        console.log("Sys ========> ", SystemProgram.programId);
        // creating metadata address    
        // const metaplex = Metaplex.make(connection);
        // const metadataAddress = await metaplex
        //     .nfts()
        //     .pdas()
        //     .metadata({ mint: mintKeypair.publicKey });
        const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());

        const metadataAddress = "H7Z1uWm8krLj4jg65A7nAEWeBzBDTop97wZFRAdLNQes";
        const payer = provider.wallet.publicKey; // Keep payer as PublicKey

        // create mint transaction

        const createMintTransaction = await program.methods
            .createTokenMint(
                wallet.publicKey, // freeze authority
                mintKeypair.publicKey,
                wallet.publicKey,
                wallet.publicKey,
                metadataAddress,
                9, // 0 decimals for NFT
                tokenName, // NFT name
                tokenSymbol, // NFT symbol
                tokenUri // NFT URI
            )
            .accounts({
                payer: wallet.publicKey,
                mint: mintKeypair.publicKey,
                metadata: metadataAddress,
                mintAuthority: wallet.publicKey,
                rentAddress: SYSVAR_RENT_PUBKEY,
                metadataProgramId: new PublicKey(
                    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
                ),
            })
            .signers([mintKeypair])
            .rpc();
        console.log("Your transaction signature", createMintTransaction);

        let mintAccount = await getMint(connection, mintKeypair.publicKey);

        console.info("mintAccount", mintAccount.address.toString());

        setMint(mintAccount.address.toString());
        setTxSig(createMintTransaction);


        setLoading(false);



    };

    const handleMintTo = async (event) => {
        console.log("Cll mint", mint);
        event.preventDefault();
        // if (!publicKey || !connection || !mint) return;
        // const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
        // await mintTo(provider, mint, recipient, mintAuthority, amount);
        // console.log('Tokens Minted to:', recipient);

        const associatedToken = await getAssociatedTokenAddress(
            mint,
            publicKey,
            false,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const createMint = await program.methods
            .mintTo(amount)
            .accounts({
                mint: mint,
                tokenAccount: associatedToken,
                mintAuthority: publicKey,
            })
            .rpc({ skipPreflight: true });

        console.log("Crette miny => ", createMint);

    };

    const handleTransferTokens = async (event) => {
        event.preventDefault();
        if (!publicKey || !connection || !mint) return;
        const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
        await transferTokens(provider, recipient, recipient, publicKey, amount);
        console.log('Tokens Transferred');
    };

    const handleClick = async () => {
        const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
        console.log("init");
        initialized(provider)
    }

    return (
        <div>
            {publicKey && (
                <div>
                    <button onClick={handleClick} >Init</button>
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