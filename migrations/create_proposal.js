import {
  PublicKey,
  SystemProgram,
  Keypair,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import { BN } from "bn.js";
import { CONFIG_PDA, USER_TOKEN_ACCOUNT } from "./consts.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createProposal(
  provider,
  configPda,
  userTokenAccount,
  title,
  description,
  options,
  startTime,
  endTime
) {
  try {
    anchor.setProvider(provider);
    const wallet = provider.wallet;
    const program = anchor.workspace.Dao;
    const proposal = Keypair.generate();

    await program.methods
      .createProposal(
        title,
        description,
        options,
        new BN(startTime),
        new BN(endTime)
      )
      .accounts({
        proposal: proposal.publicKey,
        user: wallet.publicKey,
        config: configPda,
        tokenAccount: userTokenAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([proposal])
      .rpc();

    const proposalAccount = await program.account.proposal.fetch(
      proposal.publicKey
    );

    return proposalAccount;
  } catch (error) {
    console.error("Error during proposal creation:", error);
    throw error;
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
    anchor.setProvider(provider);

    const configPda = new PublicKey(CONFIG_PDA);
    const userTokenAccount = new PublicKey(USER_TOKEN_ACCOUNT);
    const title = "Upgrade DAO Treasury";
    const description =
      "Proposal to increase the DAO treasury allocation to 50%.";
    const options = ["Yes", "No"];
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + 7 * 24 * 60 * 60;

    const proposalAccount = await createProposal(
      provider,
      configPda,
      userTokenAccount,
      title,
      description,
      options,
      startTime,
      endTime
    );

    console.log("Proposal created successfully:", proposalAccount);
  } catch (error) {
    console.error("Failed to create proposal:", error);
  }
})();
