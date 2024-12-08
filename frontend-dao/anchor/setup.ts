import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { IDL, Dao } from "./idl";

const PROGRAM_ID = new PublicKey(
  "4bcdBwQkcDYPpa8hq3Xn4uv1BNLKJa6mwq3KwpKE5hvf"
);

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const program = new Program<Dao>(IDL, {
  connection,
});

export const [counterPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("counter")],
  PROGRAM_ID
);

export type DaoData = IdlAccounts<Dao>["dao"];
