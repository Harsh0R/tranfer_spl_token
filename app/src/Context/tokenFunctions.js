// src/tokenFunctions.js
import { PublicKey, Transaction, Keypair } from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import * as anchor from '@project-serum/anchor';
import idl from '../../tranfer_spl_token.json'; // Your IDL JSON file

const PROGRAM_ID = new PublicKey('564zkJpPojyCmxr5qiaK3LSe7XiXa77DvnaapW5n1qx4');
const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");


export const initialized = async (provider) => {
  console.log("Init");

  const a = JSON.stringify(idl);
  const b = JSON.parse(a);
  const dataAccount = Keypair.generate();
  const payer = provider.wallet.publicKey; // Keep payer as PublicKey

  const program = new anchor.Program(b, idl.metadata.address, provider);

  const tx = await program.methods
    .new()
    .accounts({ dataAccount: dataAccount.publicKey })
    .signers([dataAccount])
    .rpc();
  console.log("Your transaction signature", tx);
}

// export const createTokenMint = async (provider, tokenName, tokenSymbol, tokenUri) => {

//     const a = JSON.stringify(idl);
//     const b = JSON.parse(a);

//     const program = new anchor.Program(b, idl.metadata.address, provider);
//     const mintKeypair = Keypair.generate();
//     const metadataAccount = Keypair.generate();
//     const dataAccount = Keypair.generate();
//     const payer = provider.wallet.publicKey; // Keep payer as PublicKey

//     console.log("program in con ==> ", program, "Payer => ", payer.toString(), "mintKeypair.publicKey => ", mintKeypair.publicKey.toString());

//     const payer1 = payer.toString();
//     const mintKey = mintKeypair.publicKey.toString();
//     const metadataAcc = metadataAccount.publicKey.toString();

//     const tx = await program.methods.createTokenMint(
//         payer1,
//         mintKey,
//         payer1,
//         payer1,
//         metadataAcc,
//         9,
//         tokenName,
//         tokenSymbol,
//         tokenUri,
//     ).accounts({ dataAccount: mintKeypair.publicKey }).signers([mintKeypair]).rpc()

//     console.log("Tx ==> ", tx);
//     return mintKeypair.publicKey.toString();
// };



export const createMintToken = async (event) => {
  event.preventDefault();

  setLoading(true);

  if (!publicKey) {
    notify({ type: "error", message: `Wallet not connected!` });
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

  // creating metadata address
  const metaplex = Metaplex.make(connection);
  const metadataAddress = await metaplex
    .nfts()
    .pdas()
    .metadata({ mint: mintKeypair.publicKey });

  // create mint transaction
  try {
    const createMintTransaction = await program.methods
      .createTokenMint(
        wallet.publicKey, // freeze authority
        9, // 0 decimals for NFT
        tokenTitle, // NFT name
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
      .rpc({ skipPreflight: true });
    console.log("Your transaction signature", createMintTransaction);

    let mintAccount = await getMint(connection, mintKeypair.publicKey);

    console.info("mintAccount", mintAccount.address.toString());

    setMint(mintAccount.address.toString());
    setTxSig(createMintTransaction);
  } catch (error) {
    notify({
      type: "error",
      message: `Transaction failed!`,
      description: error?.message,
    });
    console.log("error", `Transaction failed! ${error?.message}`);
    return;
  }

  setLoading(false);
};




export const mintTo = async (provider, mint, recipient, amount) => {
  console.log("Call mint");

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
