import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import {
  createAssociatedTokenAccount,
  mintTo,
  getAssociatedTokenAddress,
  transfer,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import { TOKEN_MINT_ADDRESS, RECIPIENT_ADDRESS } from "./consts.js";

async function mintAndTransferTokens() {
  try {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const wallet = anchor.Wallet.local();
    const mintAddress = new PublicKey(TOKEN_MINT_ADDRESS);
    const recipientAddress = new PublicKey(RECIPIENT_ADDRESS);
    const ownerTokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      wallet.publicKey
    );
    const ownerAccountInfo = await connection.getAccountInfo(ownerTokenAccount);
    if (!ownerAccountInfo) {
      await createAssociatedTokenAccount(
        connection,
        wallet.payer,
        mintAddress,
        wallet.publicKey
      );
    }
    const mintAmount = 1000;
    await mintTo(
      connection,
      wallet.payer,
      mintAddress,
      ownerTokenAccount,
      wallet.payer,
      mintAmount
    );
    const recipientTokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      recipientAddress
    );
    const recipientAccountInfo = await connection.getAccountInfo(
      recipientTokenAccount
    );
    if (!recipientAccountInfo) {
      await createAssociatedTokenAccount(
        connection,
        wallet.payer,
        mintAddress,
        recipientAddress
      );
    }
    const transferAmount = 1000;
    await transfer(
      connection,
      wallet.payer,
      ownerTokenAccount,
      recipientTokenAccount,
      wallet.publicKey,
      transferAmount
    );
  } catch (error) {
    console.error("Error during minting and transfer:", error);
  }
}

(async () => {
  await mintAndTransferTokens();
})();
