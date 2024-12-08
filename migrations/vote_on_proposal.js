import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { CONFIG_PDA, VOTER_TOKEN_ACCOUNT } from "./consts.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function voteOnProposal(
  provider,
  proposalPda,
  voterTokenAccount,
  optionIndex
) {
  try {
    const configPda = new PublicKey(CONFIG_PDA);

    anchor.setProvider(provider);

    const program = anchor.workspace.Dao;
    const wallet = provider.wallet;

    const tx = await program.methods
      .vote(optionIndex)
      .accounts({
        proposal: proposalPda,
        user: wallet.publicKey,
        tokenAccount: voterTokenAccount,
        config: configPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const proposalAccount = await program.account.proposal.fetch(proposalPda);

    console.log(
      "Votes:",
      proposalAccount.votes.map((vote) => vote.toNumber())
    );
    console.log(
      "Voters:",
      proposalAccount.voters.map((voter) => voter.toBase58())
    );

    return tx;
  } catch (error) {
    console.error("Error during voting:", error);
    throw error;
  }
}

(async () => {
  try {
    const projectPath = path.resolve(__dirname, "../");
    process.chdir(projectPath);

    console.log(`Current working directory set to: ${process.cwd()}`);

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.Dao;

    const proposals = await program.account.proposal.all();

    if (proposals.length === 0) {
      console.log("No proposals found.");
      return;
    }

    const firstProposal = proposals[0];
    const proposalPda = firstProposal.publicKey;

    const voterTokenAccount = new PublicKey(VOTER_TOKEN_ACCOUNT);
    const optionIndex = 0;

    const tx = await voteOnProposal(
      provider,
      proposalPda,
      voterTokenAccount,
      optionIndex
    );

    console.log(`Successfully voted on proposal! Transaction: ${tx}`);
  } catch (error) {
    console.error("Failed to vote on proposal:", error);
  }
})();
