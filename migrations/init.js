import * as anchor from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { Buffer } from "buffer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function deployInit(provider) {
  try {
    console.log("Starting DAO Initialization...");

    anchor.setProvider(provider);
    const wallet = provider.wallet;

    const program = anchor.workspace.Dao;
    console.log("DAO Program ID:", program.programId.toBase58());

    const daoTokenMint = await createMint(
      provider.connection,
      wallet.payer,
      wallet.publicKey,
      null,
      0
    );

    console.log("DAO Token Mint Address:", daoTokenMint.toBase58());

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("dao-config")],
      program.programId
    );

    console.log("Config PDA:", configPda.toBase58());

    const userTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      wallet.payer,
      daoTokenMint,
      wallet.publicKey
    );

    console.log("User Token Account:", userTokenAccount.toBase58());

    await mintTo(
      provider.connection,
      wallet.payer,
      daoTokenMint,
      userTokenAccount,
      wallet.publicKey,
      100
    );

    console.log(`Minted 100 DAO tokens to ${userTokenAccount.toBase58()}`);

    const tx = await program.methods
      .initialize(daoTokenMint)
      .accounts({
        config: configPda,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Initialize Transaction Signature:", tx);

    const configAccount = await program.account.daoConfig.fetch(configPda);

    console.log("Config Account Fetched:");
    console.log("DAO Token Mint:", configAccount.daoTokenMint.toBase58());

    if (configAccount.daoTokenMint.toBase58() === daoTokenMint.toBase58()) {
      console.log("DAO initialized successfully!");
    } else {
      console.error("DAO initialization failed.");
    }
  } catch (error) {
    console.error("Error during DAO initialization:", error);
  }
}

(async () => {
  try {
    const projectPath = path.resolve(__dirname, "../");
    process.chdir(projectPath);

    console.log(`Current working directory set to: ${process.cwd()}`);

    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const wallet = anchor.Wallet.local();

    const provider = new anchor.AnchorProvider(connection, wallet, {
      preflightCommitment: "confirmed",
    });

    console.log("Using provider with Devnet...");
    await deployInit(provider);
  } catch (error) {
    console.error("Failed to initialize DAO:", error);
  }
})();
