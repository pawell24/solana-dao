import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { assert } from "chai";
import { Dao } from "../target/types/dao";

describe("dao", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Dao as Program<Dao>;

  let daoTokenMint: PublicKey;
  let userTokenAccount: PublicKey;
  let configPda: PublicKey;
  let wallet: anchor.Wallet;
  const provider = anchor.AnchorProvider.env();

  before(async () => {
    wallet = provider.wallet;

    daoTokenMint = await createMint(
      provider.connection,
      wallet.payer,
      wallet.publicKey,
      null,
      0
    );

    [configPda] = await PublicKey.findProgramAddressSync(
      [Buffer.from("dao-config")],
      program.programId
    );

    userTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      wallet.payer,
      daoTokenMint,
      wallet.publicKey
    );

    await mintTo(
      provider.connection,
      wallet.payer,
      daoTokenMint,
      userTokenAccount,
      wallet.publicKey,
      100
    );

    await program.methods
      .initialize(daoTokenMint)
      .accounts({
        authority: wallet.publicKey,
      })
      .rpc();

    const configAccount = await program.account.daoConfig.fetch(configPda);
    assert.equal(
      configAccount.daoTokenMint.toBase58(),
      daoTokenMint.toBase58()
    );
  });

  it("Should create a proposal", async () => {
    const proposal = Keypair.generate();
    const title = "Test Proposal";
    const description = "This is a test proposal for DAO voting.";
    const options = ["Yes", "No", "Abstain"];
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + 3600;

    await program.methods
      .createProposal(
        title,
        description,
        options,
        new anchor.BN(startTime),
        new anchor.BN(endTime)
      )
      .accounts({
        proposal: proposal.publicKey,
        user: wallet.publicKey,
        tokenAccount: userTokenAccount,
      })
      .signers([proposal])
      .rpc();

    const proposalAccount = await program.account.proposal.fetch(
      proposal.publicKey
    );

    assert.equal(
      proposalAccount.creator.toBase58(),
      wallet.publicKey.toBase58()
    );
    assert.equal(proposalAccount.title, title);
    assert.equal(proposalAccount.description, description);
    assert.deepEqual(proposalAccount.options, options);
    assert.equal(proposalAccount.startTime.toNumber(), startTime);
    assert.equal(proposalAccount.endTime.toNumber(), endTime);

    const votes = proposalAccount.votes.map((vote: anchor.BN) =>
      vote.toNumber()
    );
    assert.deepEqual(votes, new Array(options.length).fill(0));
  });

  it("Should prevent double-voting", async () => {
    const proposal = Keypair.generate();
    const title = "Double Voting Test";
    const description = "Testing double voting prevention.";
    const options = ["Yes", "No"];
    const startTime = Math.floor(Date.now() / 1000) + 3;
    const endTime = startTime + 3600;

    await program.methods
      .createProposal(
        title,
        description,
        options,
        new anchor.BN(startTime),
        new anchor.BN(endTime)
      )
      .accounts({
        proposal: proposal.publicKey,
        user: wallet.publicKey,
        tokenAccount: userTokenAccount,
      })
      .signers([proposal])
      .rpc();

    await new Promise((resolve) => setTimeout(resolve, 4000));

    await program.methods
      .vote(0)
      .accounts({
        proposal: proposal.publicKey,
        user: wallet.publicKey,
        tokenAccount: userTokenAccount,
      })
      .rpc();

    try {
      await program.methods
        .vote(1)
        .accounts({
          proposal: proposal.publicKey,
          user: wallet.publicKey,
          tokenAccount: userTokenAccount,
        })
        .rpc();
      assert.fail("Double-voting should not be allowed.");
    } catch (err) {
      assert.ok(err.message.includes("You have already voted."));
    }
  });

  it("Should calculate the winner", async () => {
    const proposal = Keypair.generate();
    const title = "Winner Calculation Test";
    const description = "Testing winner calculation functionality.";
    const options = ["Option A", "Option B", "Option C"];
    const startTime = Math.floor(Date.now() / 1000) + 3;
    const endTime = startTime + 5;

    await program.methods
      .createProposal(
        title,
        description,
        options,
        new anchor.BN(startTime),
        new anchor.BN(endTime)
      )
      .accounts({
        proposal: proposal.publicKey,
        user: wallet.publicKey,
        tokenAccount: userTokenAccount,
      })
      .signers([proposal])
      .rpc();

    await new Promise((resolve) => setTimeout(resolve, 4000));

    await program.methods
      .vote(1)
      .accounts({
        proposal: proposal.publicKey,
        user: wallet.publicKey,
        tokenAccount: userTokenAccount,
      })
      .rpc();

    await new Promise((resolve) => setTimeout(resolve, 8000));

    await program.methods
      .tallyVotes()
      .accounts({
        proposal: proposal.publicKey,
      })
      .rpc();

    const proposalAccount = await program.account.proposal.fetch(
      proposal.publicKey
    );

    assert.equal(proposalAccount.winnerIndex, 1);
  });

  it("Should fail to vote after end time", async () => {
    const proposal = Keypair.generate();
    const title = "Late Voting Test";
    const description = "Testing voting after the end time.";
    const options = ["Yes", "No"];
    const startTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + 1;

    await program.methods
      .createProposal(
        title,
        description,
        options,
        new anchor.BN(startTime),
        new anchor.BN(endTime)
      )
      .accounts({
        proposal: proposal.publicKey,
        user: wallet.publicKey,
        tokenAccount: userTokenAccount,
      })
      .signers([proposal])
      .rpc();

    await new Promise((resolve) => setTimeout(resolve, 4000));

    try {
      await program.methods
        .vote(0)
        .accounts({
          proposal: proposal.publicKey,
          user: wallet.publicKey,
          tokenAccount: userTokenAccount,
        })
        .rpc();
      assert.fail("Voting after end time should not be allowed.");
    } catch (err) {
      assert.ok(err.message.includes("Voting has already ended."));
    }
  });
});
