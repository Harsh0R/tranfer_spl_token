// src/tokenFunctions.js
import { PublicKey, Transaction, Keypair } from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
import idl from '../../tranfer_spl_token.json'; // Your IDL JSON file

const PROGRAM_ID = new PublicKey('564zkJpPojyCmxr5qiaK3LSe7XiXa77DvnaapW5n1qx4');
const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export const createTokenMint = async (provider, tokenName, tokenSymbol, tokenUri) => {
    const program = new anchor.Program(idl, PROGRAM_ID, provider);
    const mintKeypair = Keypair.generate();
    const metadataAccount = Keypair.generate();
    const dataAccount = Keypair.generate();
    const payer = provider.wallet.publicKey.toBuffer();
    console.log("payer ==" , payer);
    const tx = await program.methods.createTokenMint(
        payer.toString(),
        mintKeypair.publicKey,
        payer,
        payer,
        metadataAccount.publicKey,
        9,
        tokenName,
        tokenSymbol,
        tokenUri,
    ).accounts({ dataAccount: mintKeypair.publicKey }).signers([payer]);

    console.log("Tx ==> ", tx);
    return mintKeypair.publicKey.toString();
};


export const mintTo = async (provider, mint, recipient, amount) => {
    const program = new anchor.Program(idl, PROGRAM_ID, provider);
    await program.methods.mintTo(
        provider.wallet.publicKey,
        recipient,
        mint,
        new anchor.BN(amount),
        {
            accounts: {
                mint,
                tokenAccount: recipient,
                mintAuthority: provider.wallet.publicKey,
                tokenProgram: splToken.TOKEN_PROGRAM_ID,
            },
        }
    );
};

export const transferTokens = async (provider, from, to, amount) => {
    const program = new anchor.Program(idl, PROGRAM_ID, provider);
    await program.methods.transferTokens(
        from,
        to,
        new anchor.BN(amount),
        {
            accounts: {
                from,
                to,
                owner: provider.wallet.publicKey,
                tokenProgram: splToken.TOKEN_PROGRAM_ID,
            },
        }
    );
};
