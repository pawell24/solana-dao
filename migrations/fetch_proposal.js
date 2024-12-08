import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { CONFIG_PDA } from "./consts.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function fetchAllProposals(provider) {
  try {
    anchor.setProvider(provider);
    const program = anchor.workspace.Dao;
    const proposals = await program.account.proposal.all();

    proposals.forEach((proposal, index) => {
      const { publicKey, account } = proposal;
      console.log(`Proposal #${index + 1}`);
      console.log(`  Public Key: ${publicKey.toBase58()}`);
      console.log(`  Creator: ${account.creator.toBase58()}`);
      console.log(`  Title: ${account.title}`);
      console.log(`  Description: ${account.description}`);
      console.log(`  Options: ${account.options}`);
      console.log(
        `  Start Time: ${new Date(account.startTime.toNumber() * 1000)}`
      );
      console.log(`  End Time: ${new Date(account.endTime.toNumber() * 1000)}`);
      console.log(
        `  Votes: ${account.votes.map((vote) => vote.toNumber()).join(", ")}`
      );
      console.log("=".repeat(40));
    });

    return proposals;
  } catch (error) {
    console.error("Error fetching proposals:", error);
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
    const proposals = await fetchAllProposals(provider, configPda);
    console.log("Successfully fetched proposals:", proposals);
  } catch (error) {
    console.error("Failed to fetch proposals:", error);
  }
})();
