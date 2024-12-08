import React, { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { IDL, Dao } from "../../anchor/idl";
import "../css/ListProposals.css";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Proposal } from "../types";
import { DAO_TOKEN_MINT } from "../utils/consts";

type Props = {
  txSignature: string;
  setTxSignature: (txSignature: string) => void;
};

const ListProposals: React.FC<Props> = ({ txSignature, setTxSignature }) => {
  const { connection } = useConnection();
  const { wallet, publicKey, sendTransaction } = useWallet();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [isTallying, setIsTallying] = useState<boolean>(false);

  const fetchProposals = async () => {
    try {
      setIsLoading(true);

      const provider = new AnchorProvider(
        connection,
        null,
        AnchorProvider.defaultOptions()
      );

      const program = new Program<Dao>(IDL, provider);

      const accounts = await program.account.proposal.all();

      const proposalsData = accounts.map((account) => {
        console.log(account.account.winnerIndex);
        return {
          publicKey: account.publicKey.toBase58(),
          creator: account.account.creator.toBase58(),
          title: account.account.title,
          description: account.account.description,
          options: account.account.options,
          votes: account.account.votes.map((vote) => vote.toNumber()),
          startTime: account.account.startTime.toNumber(),
          endTime: account.account.endTime.toNumber(),
          winnerIndex: account.account.winnerIndex,
        };
      });

      setProposals(proposalsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching proposals:", err);
      setError("Failed to fetch proposals. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkTransactionStatus = async () => {
      if (!txSignature) return;

      try {
        console.log("Checking transaction status for:", txSignature);

        const confirmation = await connection.confirmTransaction(
          txSignature,
          "confirmed"
        );

        if (confirmation.value.err) {
          console.error("Transaction failed:", confirmation.value.err);
          return;
        }

        console.log("Transaction confirmed! Refreshing proposals...");
        fetchProposals();
      } catch (err) {
        console.error("Error checking transaction status:", err);
      }
    };

    checkTransactionStatus();
  }, [txSignature, connection]);

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleVote = async (proposalPublicKey: string, optionIndex: number) => {
    if (!publicKey) {
      alert("Please connect your wallet to vote!");
      return;
    }

    try {
      setIsVoting(true);

      const provider = new AnchorProvider(
        connection,
        wallet?.adapter,
        AnchorProvider.defaultOptions()
      );

      const program = new Program<Dao>(IDL, provider);

      const userTokenAccount = await getAssociatedTokenAddress(
        DAO_TOKEN_MINT,
        publicKey
      );

      const transaction = await program.methods
        .vote(optionIndex)
        .accounts({
          proposal: new PublicKey(proposalPublicKey),
          user: publicKey,
          tokenAccount: userTokenAccount,
        })
        .transaction();

      const txSignature = await sendTransaction(transaction, connection);

      setTxSignature(txSignature);

      console.log(`Voted successfully! Transaction Signature: ${txSignature}`);
      alert("Vote submitted successfully!");
    } catch (err) {
      console.error("Error during voting:", err);
      alert("Failed to submit vote. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  const handleTallyVotes = async (proposalPublicKey: string) => {
    if (!publicKey) {
      alert("Please connect your wallet to tally votes!");
      return;
    }

    try {
      setIsTallying(true);

      const provider = new AnchorProvider(
        connection,
        wallet?.adapter,
        AnchorProvider.defaultOptions()
      );

      const program = new Program<Dao>(IDL, provider);

      const transaction = await program.methods
        .tallyVotes()
        .accounts({
          proposal: new PublicKey(proposalPublicKey),
        })
        .transaction();

      const txSignature = await sendTransaction(transaction, connection);

      console.log(
        `Votes tallied successfully! Transaction Signature: ${txSignature}`
      );
      alert("Votes tallied successfully!");

      await fetchProposals();
    } catch (err) {
      console.error("Error during tallying votes:", err);
      alert("Failed to tally votes. Please try again.");
    } finally {
      setIsTallying(false);
    }
  };

  const isVotingEnded = (endTime: number) => {
    return Date.now() / 1000 > endTime;
  };

  if (isLoading) {
    return <div className="loading">Loading proposals...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="proposals-list">
      <h2>DAO Proposals</h2>
      {proposals.length === 0 ? (
        <p>No proposals found.</p>
      ) : (
        <ul>
          {proposals.map((proposal, index) => (
            <li key={proposal.publicKey} className="proposal-item">
              <h3>
                {index + 1}. {proposal.title}
              </h3>
              <p>
                <strong>Description:</strong> {proposal.description}
              </p>
              <p>
                <strong>Creator:</strong> {proposal.creator}
              </p>
              <p>
                <strong>Options:</strong>
              </p>
              <div className="vote-options">
                {proposal.options.map((option: string, optIndex: number) => (
                  <button
                    key={optIndex}
                    className="vote-button"
                    disabled={isVoting || isVotingEnded(proposal.endTime)}
                    onClick={() => handleVote(proposal.publicKey, optIndex)}
                  >
                    {option} ({proposal.votes[optIndex]} votes)
                  </button>
                ))}
              </div>
              <p>
                <strong>Start Time:</strong>{" "}
                {new Date(proposal.startTime * 1000).toLocaleString()}
              </p>
              <p>
                <strong>End Time:</strong>{" "}
                {new Date(proposal.endTime * 1000).toLocaleString()}
              </p>
              <p>
                <strong>Winner:</strong>{" "}
                {proposal.winnerIndex !== null
                  ? proposal.options[proposal.winnerIndex]
                  : isVotingEnded(proposal.endTime)
                  ? "Tally pending"
                  : "TBD"}
              </p>
              {isVotingEnded(proposal.endTime) &&
                proposal.winnerIndex === null && (
                  <button
                    className="tally-button"
                    disabled={isTallying}
                    onClick={() => handleTallyVotes(proposal.publicKey)}
                  >
                    {isTallying ? "Tallying..." : "Tally Votes"}
                  </button>
                )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListProposals;
