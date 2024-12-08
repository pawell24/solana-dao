import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, Keypair } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import "../css/CreateProposal.css";
import { program } from "../../anchor/setup";
import { DAO_TOKEN_MINT, PROGRAM_ID } from "../utils/consts";

type Props = {
  setTxSignature: (txSignature: string) => void;
};

const CreateProposal: React.FC<Props> = ({ setTxSignature }) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [options, setOptions] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCreateProposal = async () => {
    if (!publicKey) {
      alert("Wallet is not connected!");
      return;
    }

    try {
      setIsLoading(true);

      const optionsArray = options.split(",").map((opt) => opt.trim());
      if (!title || !description || optionsArray.length === 0) {
        alert("All fields must be filled in!");
        setIsLoading(false);
        return;
      }

      const startTimestamp = parseInt(startTime);
      const endTimestamp = parseInt(endTime);
      if (
        isNaN(startTimestamp) ||
        isNaN(endTimestamp) ||
        startTimestamp >= endTimestamp
      ) {
        alert("Invalid start or end time!");
        setIsLoading(false);
        return;
      }

      const proposalAccount = Keypair.generate();

      const [configPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("dao-config")],
        PROGRAM_ID
      );

      const userTokenAccount = await getAssociatedTokenAddress(
        DAO_TOKEN_MINT,
        publicKey
      );

      const configAccountInfo = await connection.getAccountInfo(configPDA);
      if (!configAccountInfo) {
        alert("Config account does not exist. Contact the administrator.");
        setIsLoading(false);
        return;
      }

      const transaction = new Transaction();

      const instruction = await program.methods
        .createProposal(
          title,
          description,
          optionsArray,
          new BN(startTimestamp),
          new BN(endTimestamp)
        )
        .accounts({
          proposal: proposalAccount.publicKey,
          user: publicKey,
          tokenAccount: userTokenAccount,
        })
        .signers([proposalAccount])
        .instruction();

      transaction.add(instruction);

      const accountInfo = await connection.getAccountInfo(userTokenAccount);
      if (!accountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            userTokenAccount,
            publicKey,
            DAO_TOKEN_MINT
          )
        );
      }

      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection, {
        signers: [proposalAccount],
      });

      setTxSignature(signature);

      alert("Proposal created successfully!");
    } catch (err) {
      alert("Failed to create proposal. Please try again. " + err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-proposal-form">
      <h2>Create Proposal</h2>
      <div>
        <label>Title:</label>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label>Options (comma-separated):</label>
        <input
          type="text"
          placeholder="Options (e.g., Yes, No, Abstain)"
          value={options}
          onChange={(e) => setOptions(e.target.value)}
        />
      </div>
      <div>
        <label>Start Time (Unix):</label>
        <input
          type="text"
          placeholder="Start Time (Unix)"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>
      <div>
        <label>End Time (Unix):</label>
        <input
          type="text"
          placeholder="End Time (Unix)"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
      <button onClick={handleCreateProposal} disabled={isLoading || !publicKey}>
        {isLoading ? "Creating..." : "Create Proposal"}
      </button>
    </div>
  );
};

export default CreateProposal;
